import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import VideoChat from '@/components/VideoChat';

function App() {
  const [ws, setWS] = useState<WebSocket|null>(null);
  const [join, setJoin] = useState(false);
  const [name, setName] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    async function playVideoFromCamera() {
      try {
        if (videoRef.current === null) return;
        const constraints = { 'video': true, 'audio': true };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];
        videoRef.current.srcObject = new MediaStream([videoTrack, audioTrack])
        setLocalStream(stream);
      } catch (error) {
        console.error('Error opening video camera.', error);
      }
    }
    playVideoFromCamera();
  }, [videoRef])

  if (!join || !localStream || !ws) {
    return (
      <div className="bg-lightorange text-center h-screen w-screen flex justify-center">
        <div className="w-80 mx-auto md:w-96 lg:w-132">
          <div className="flex flex-col justify-center h-screen items-center mx-auto">
            <div className="font-bold text-3xl text-darkblue mb-8 py-1 border-transparent border-b-darkblue border-2 md:text-4xl lg:text-5xl">MAKE NEW FRIENDS</div>
            <video autoPlay className="w-full drop-shadow-md my-8 border-2 border-black bg-white aspect-[4/3] object-cover" id="localVideo" ref={videoRef} />
            <div className='flex flex-col items-center lg:flex-row'>
              <Input type="text" placeholder="Name" className="rounded-md border-black w-80 h-10 md:w-96 lg:w-104 lg:mr-2" onChange={(e) => {
                setName(e.target.value);
              }} ref={nameRef} />
              <Button type="submit" onClick={() => {
                // if (nameRef.current === null || nameRef.current.value === "") return;
                const websocket = new WebSocket("ws://localhost:8080/ws")
                websocket.onopen = () => {
                  console.log("connection opened!")
                }
                setWS(websocket);
                setJoin(true);
              }} className="w-24 rounded-md text-white bg-darkorange text-xl h-10 shadow-xl mt-2 lg:mt-0 lg:ml-2 hover:bg-darkorange++">Join</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <VideoChat websocket={ws} localStream={localStream} name={name} />
  )
}

export default App
