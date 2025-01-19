import { useEffect, useRef, useState } from "react";

export default function VideoChat({ localUserVideoTrack, localUserAudioTrack, websocket, name }: { localUserVideoTrack: MediaStreamTrack | null, localUserAudioTrack: MediaStreamTrack | null, websocket: WebSocket, name: string }) {
    const userVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteUserVideoRef = useRef<HTMLVideoElement | null>(null);
    const [remoteUserVideoTrack, setRemoteUserVideoTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteUserAudioTrack, setRemoteUserAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [waiting, setWaiting] = useState(true);
    const [localPeerConnection, setLocalPeerConnection] = useState<RTCPeerConnection|null>(null);
    const [remotePeerConnection, setRemotePeerConnection] = useState<RTCPeerConnection|null>(null);

    useEffect(() => {
        websocket.onmessage = async (e) => {
            let message = e.data
            if(message === "start") {
                const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
                let pc = new RTCPeerConnection(configuration)
                const offer = await pc.createOffer()
                await pc.setLocalDescription(offer)
                websocket.send(JSON.stringify({'offer': offer}))
                setLocalPeerConnection(pc)
            } 
            let messageobj = JSON.parse(message)
            if(message.offer) {
                const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
                let pc = new RTCPeerConnection(configuration)
                pc.setRemoteDescription(new RTCSessionDescription(message.offer))
                const answer = await pc.createAnswer()
                await pc.setLocalDescription(answer)
                websocket.send(JSON.stringify({'answer': answer}))
                setRemotePeerConnection(pc)
            }
        }
    }, [])
    

    return (
        <div className="flex flex-col">
            <p>Hi {name}</p>
            <video autoPlay width={500} height={500} className="drop-shadow-md my-8" id="localVideo" ref={userVideoRef} />
            <video autoPlay width={500} height={500} className="drop-shadow-md my-8" id="remoteVideo" ref={remoteUserVideoRef} />
        </div>
    )
}