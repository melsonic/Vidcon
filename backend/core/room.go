package core

var ROOM_ID int = 0

type Room struct {
	roomId int
	user1  *User
	user2  *User
	us *UserStore
	status int8 // if 0->both users connected, 1-> 1 user connected, 2->no user connected
	channel chan int8
}

func (r *Room) StartExchange() {
	r.user1.connSend <- []byte("start")
}

func (r *Room) ReadUser1() {
	for {
		msg := <-r.user1.connReceive
		if string(msg) == "close" {
			r.status += 1
			r.us.AddUser(r.user1)
			r.channel <- r.status
			return
		}
		r.user2.connSend <- msg
	}
}

func (r *Room) ReadUser2() {
	for {
		msg := <-r.user2.connReceive
		if string(msg) == "close" {
			r.status += 1
			r.us.AddUser(r.user2)
			r.channel <- r.status
			return
		}
		r.user1.connSend <- msg
	}
}

func (r *Room) CheckRoomValidity() {
	for {
		status := <-r.channel
		if status == 2 {
			r.us.MatchUsers()
			r = nil
			return
		}
	}
}

func NewRoom(user1 *User, user2 *User, us *UserStore) *Room {
	ROOM_ID++
	return &Room{
		roomId: ROOM_ID,
		user1:  user1,
		user2:  user2,
		us: us,
		status:  0,
		channel:  make(chan int8),
	}
}
