package core

var ROOM_ID int = 0

type Room struct {
	roomId int
	user1  *User
	user2  *User
}

func (r *Room) StartExchange() {
	r.user1.connSend <- []byte("start")
}

func (r *Room) ReadUser1() {
	for {
		msg := <-r.user1.connReceive
		r.user2.connSend <- msg
	}
}

func (r *Room) ReadUser2() {
	for {
		msg := <-r.user2.connReceive
		r.user1.connSend <- msg
	}
}

func NewRoom(user1 *User, user2 *User) *Room {
	ROOM_ID++
	return &Room{
		roomId: ROOM_ID,
		user1:  user1,
		user2:  user2,
	}
}
