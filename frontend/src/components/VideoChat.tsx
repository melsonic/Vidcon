import { useEffect, useRef, useState } from "react";

export default function VideoChat({ localUserVideoTrack, localUserAudioTrack, websocket, name }: { localUserVideoTrack: MediaStreamTrack, localUserAudioTrack: MediaStreamTrack, websocket: WebSocket, name: string }) {
    const localUserVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteUserVideoRef = useRef<HTMLVideoElement | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream|null>(null);
    const [remoteUserVideoTrack, setRemoteUserVideoTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteUserAudioTrack, setRemoteUserAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [waiting, setWaiting] = useState(true);
    const [callingPeer, setCallingPeer] = useState<RTCPeerConnection | null>(null);
    const [receivingPeer, setReceivingPeer] = useState<RTCPeerConnection | null>(null);

    useEffect(() => {
        websocket.onmessage = async (e) => {
            let message = e.data
            if (message === "start") {
                const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }
                let pc = new RTCPeerConnection(configuration)
                const offer = await pc.createOffer()
                await pc.setLocalDescription(offer)
                pc.addTrack(localUserVideoTrack)
                pc.addTrack(localUserAudioTrack)
                websocket.send(JSON.stringify({ 'offer': offer }))
                pc.ontrack = (e) => {
                    const [remoteStream] = e.streams;
                    setRemoteStream(remoteStream)
                }
                pc.onicecandidate = (e) => {
                    if (e.candidate) {
                        websocket.send(JSON.stringify({ 'callerIceCandidate': e.candidate }))
                    }
                }
                pc.addEventListener('connectionstatechange', e => {
                    if (pc.connectionState === 'connected') {
                        console.log("Peers connected!!")
                    }
                });
                setCallingPeer(pc)
            } else {
                let messageobj: any
                try {
                    messageobj = JSON.parse(message)
                } catch (error) {
                    console.log("invalid message")
                    return
                }
                if (messageobj.offer) {
                    const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }
                    let pc = new RTCPeerConnection(configuration)
                    pc.setRemoteDescription(new RTCSessionDescription(messageobj.offer))
                    const answer = await pc.createAnswer()
                    await pc.setLocalDescription(answer)
                    websocket.send(JSON.stringify({ 'answer': answer }))
                    pc.onicecandidate = (e) => {
                        if (e.candidate) {
                            websocket.send(JSON.stringify({ 'receiverIceCandidate': e.candidate }))
                        }
                    }
                    pc.addEventListener('connectionstatechange', e => {
                        if (pc.connectionState === 'connected') {
                            console.log("Peers connected!!")
                        }
                    });
                    setReceivingPeer(pc)
                } else if (messageobj.answer) {
                    callingPeer?.setRemoteDescription(new RTCSessionDescription(messageobj.answer))
                } else if (messageobj.callerIceCandidate) {
                    try {
                        await callingPeer?.addIceCandidate(messageobj.callerIceCandidate)
                    } catch (e) {
                        console.log('Error adding received ice candidate', e)
                    }
                } else if (messageobj.receiverIceCandidate) {
                    try {
                        await receivingPeer?.addIceCandidate(messageobj.receiverIceCandidate)
                    } catch (e) {
                        console.log('Error adding received ice candidate', e)
                    }
                }
            }
        }
    }, [])

    useEffect(() => {
        if(localUserVideoRef.current === null) return;
        localUserVideoRef.current.srcObject = new MediaStream([localUserVideoTrack])
    }, [localUserVideoRef])

    useEffect(() => {
        if(remoteUserVideoRef.current === null || remoteStream === null) return;
        let videoTrack = remoteStream.getVideoTracks()[0];
        let audioTrack = remoteStream.getAudioTracks()[0];
        remoteUserVideoRef.current.srcObject = new MediaStream([videoTrack])
        setRemoteUserVideoTrack(videoTrack)
        setRemoteUserAudioTrack(audioTrack)
    }, [remoteStream, remoteUserVideoRef])

    return (
        <div className="flex flex-col mx-auto justify-center items-center">
            <p>Hi {name}</p>
            <video autoPlay width={500} height={500} className="drop-shadow-md my-8 border-2 border-black" id="localVideo" ref={localUserVideoRef} />
            <video autoPlay width={500} height={500} className="drop-shadow-md my-8 border-2 border-black" id="remoteVideo" ref={remoteUserVideoRef} />
        </div>
    )
}