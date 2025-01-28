import './App.css'
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import VideoChat from '@/components/VideoChat';

function App() {
  const [waiting, setWaiting] = useState(true);
  const [ws, setWS] = useState<WebSocket | null>(null);
  const [name, setName] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [localUserVideoTrack, setLocalUserVideoTrack] = useState<MediaStreamTrack | null>(null);
  const [localUserAudioTrack, setLocalUserAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    async function playVideoFromCamera() {
      try {
        if (videoRef.current === null) return;
        const constraints = { 'video': true, 'audio': true };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        let videoTrack = stream.getVideoTracks()[0];
        let audioTrack = stream.getAudioTracks()[0];
        // setLocalUserVideoTrack(videoTrack);
        // setLocalUserAudioTrack(audioTrack);
        videoRef.current.srcObject = new MediaStream([videoTrack])
        setLocalStream(stream);
      } catch (error) {
        console.error('Error opening video camera.', error);
      }
    }
    playVideoFromCamera();
  }, [videoRef])

  if (waiting || !ws || !localStream) {
    return (
      <div className="bg-lightorange text-center">
        <div className="font-bold text-6xl text-darkblue absolute w-screen mx-auto mt-16">MAKE NEW FRIENDS</div>
        <div className="flex flex-col justify-center h-screen items-center space-x-2 mx-auto">
          <video autoPlay width={500} height={450} className="drop-shadow-md my-8 border-2 border-black" id="localVideo" ref={videoRef} />
          <div className='flex items-center'>
            <Input type="text" placeholder="Name" className="rounded-md border-black w-96 h-10" onChange={(e) => {
              setName(e.target.value);
            }} ref={nameRef} />
            <Button type="submit" onClick={(_e) => {
              if(nameRef.current === null || nameRef.current.value === "") return;
              let websocket = new WebSocket("ws://localhost:8080/ws")
              websocket.onopen = (_e) => {
                console.log("connection opened!")
              }
              setWS(websocket);
              setWaiting(false);
            }} className="w-24 rounded-md text-white bg-darkorange ml-4 text-xl h-10 shadow-lg">Join</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <VideoChat localStream={localStream} websocket={ws} name={name} />
  )
}

export default App
