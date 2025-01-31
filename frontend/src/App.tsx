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
      <div className="bg-lightorange text-center h-screen w-screen flex justify-center">
        <div className="w-80 mx-auto md:w-96 lg:w-132">
          <div className="flex flex-col justify-center h-screen items-center mx-auto">
            <div className="font-bold text-3xl text-darkblue mb-8 py-1 border-transparent border-b-darkblue border-2 md:text-4xl lg:text-5xl">MAKE NEW FRIENDS</div>
            <video autoPlay className="w-full drop-shadow-md my-8 border-2 border-black bg-white" id="localVideo" ref={videoRef} />
            <div className='flex flex-col items-center lg:flex-row'>
              <Input type="text" placeholder="Name" className="rounded-md border-black w-80 h-10 md:w-96 lg:w-104 lg:mr-2" onChange={(e) => {
                setName(e.target.value);
              }} ref={nameRef} />
              <Button type="submit" onClick={(_e) => {
                if (nameRef.current === null || nameRef.current.value === "") return;
                let websocket = new WebSocket("ws://localhost:8080/ws")
                websocket.onopen = (_e) => {
                  console.log("connection opened!")
                }
                setWS(websocket);
                setWaiting(false);
              }} className="w-24 rounded-md text-white bg-darkorange text-xl h-10 shadow-lg mt-2 lg:mt-0 lg:ml-2">Join</Button>
            </div>
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
