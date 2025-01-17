import { Link } from 'react-router-dom';
import './App.css'
import { Button } from './components/ui/button';
import { useState } from 'react';
import Lobby from './components/Lobby';

function App() {
  const [waiting, setWaiting] = useState(false);
  const [ws, setWS] = useState<WebSocket|null>(null);
  return (
    <>
      {waiting && ws ? <Lobby websocket={ws} /> : <div className='h-screen flex flex-col justify-center items-center'>
        <Button onClick={() => {
          let websocket = new WebSocket("ws://localhost:8080/ws")
          websocket.onopen = (_e) => {
            console.log("connection opened!")
          }
          setWS(websocket);
          setWaiting(true);
        }}>
          <Link to="/lobby">Explore</Link>
        </Button>
      </div>}
    </>
  )
}

export default App
