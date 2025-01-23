package core

import (
	"bytes"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 512
)

var (
	newline            = []byte{'\n'}
	space              = []byte{' '}
	us      *UserStore = &UserStore{users: make([]*User, 0)}
)

func WSHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal("upgrade :", err)
		return
	}
	user := &User{
		conn:        conn,
		connSend:    make(chan []byte),
		connReceive: make(chan []byte),
	}
	us.AddUser(user)
	go user.ReadConn()
	go user.WriteConn()
	us.MatchUsers()
}

type User struct {
	conn        *websocket.Conn
	connSend    chan []byte
	connReceive chan []byte
}

func (u *User) ReadConn() {
	defer u.conn.Close()
	for {
		_, msg, err := u.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
		msg = bytes.TrimSpace(bytes.Replace(msg, newline, space, -1))
		u.connReceive <- msg
	}
}

func (u *User) WriteConn() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		u.conn.Close()
	}()
	for {
		select {
		case message, ok := <-u.connSend:
			u.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				u.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := u.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued chat messages to the current websocket message.
			n := len(u.connSend)
			for i := 0; i < n; i++ {
				w.Write(newline)
				w.Write(<-u.connSend)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			u.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := u.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

type UserStore struct {
	users []*User
}

func (us *UserStore) AddUser(user *User) {
	us.users = append(us.users, user)
}

func (us *UserStore) MatchUsers() {
	if len(us.users) < 2 {
		return
	}
	user1 := us.users[0]
	user2 := us.users[len(us.users)-1]
	// create room
	room := NewRoom(user1, user2)
	room.StartExchange()
	go room.ReadUser1()
	go room.ReadUser2()
	us.users = us.users[1 : len(us.users)-1]
	us.MatchUsers()
}
