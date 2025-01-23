import { useEffect, useRef, useState } from "react";

export default function VideoChat({ localStream, websocket, name }: { localStream: MediaStream, websocket: WebSocket, name: string }) {
    const localUserVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteUserVideoRef = useRef<HTMLVideoElement | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [remoteUserVideoTrack, setRemoteUserVideoTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteUserAudioTrack, setRemoteUserAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [waiting, setWaiting] = useState(true);
    const [callingPeer, setCallingPeer] = useState<RTCPeerConnection | null>(null);
    const [receivingPeer, setReceivingPeer] = useState<RTCPeerConnection | null>(null);

    useEffect(() => {
        websocket.onmessage = async (e) => {
            let message = e.data
            if (message === "start") {
                const conf = {
                    iceServers: [{ 'urls': 'stun:stun.l.google.com:19302' }],
                }
                let pc = new RTCPeerConnection(conf)
                localStream.getTracks().forEach(track => {
                    pc.addTrack(track, localStream)
                })
                const dataChannel = pc.createDataChannel("dc");
                const offer = await pc.createOffer()
                await pc.setLocalDescription(offer)
                websocket.send(JSON.stringify({ 'offer': offer }))
                pc.ontrack = async (e) => {
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
                    const conf = {
                        iceServers: [{ 'urls': 'stun:stun.l.google.com:19302' }]
                    }
                    let pc = new RTCPeerConnection(conf)
                    localStream.getTracks().forEach(track => {
                        pc.addTrack(track, localStream)
                    })
                    pc.ontrack = async (e) => {
                        const [remoteStream] = e.streams
                        setRemoteStream(remoteStream)
                    }
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
                        if (pc?.connectionState === 'connected') {
                            console.log("Peers connected!!")
                        }
                    });
                    setReceivingPeer(pc)
                } else if (messageobj.answer) {
                    setCallingPeer(pc => {
                        pc?.setRemoteDescription(new RTCSessionDescription(messageobj.answer))
                        return pc
                    })
                    // pc.setRemoteDescription(new RTCSessionDescription(messageobj.answer))
                } else if (messageobj.callerIceCandidate) {
                    try {
                        setReceivingPeer(pc => {
                            pc?.addIceCandidate(messageobj.callerIceCandidate)
                            return pc
                        })
                    } catch (e) {
                        console.log('Error adding received ice candidate', e)
                    }
                } else if (messageobj.receiverIceCandidate) {
                    try {
                        setCallingPeer(pc => {
                            pc?.addIceCandidate(messageobj.receiverIceCandidate)
                            return pc
                        })
                    } catch (e) {
                        console.log('Error adding received ice candidate', e)
                    }
                }
            }
        }
    }, [])

    useEffect(() => {
        if (localUserVideoRef.current === null || localStream === null || localStream === undefined) return;
        let videoTrack = localStream.getVideoTracks()[0];
        localUserVideoRef.current.srcObject = new MediaStream([videoTrack])
    }, [localStream, localUserVideoRef.current])

    useEffect(() => {
        if (remoteUserVideoRef.current === null || remoteStream === null || remoteStream === undefined) return;
        let videoTrack = remoteStream.getVideoTracks()[0];
        let audioTrack = remoteStream.getAudioTracks()[0];
        remoteUserVideoRef.current.srcObject = new MediaStream([videoTrack])
        setRemoteUserVideoTrack(videoTrack)
        setRemoteUserAudioTrack(audioTrack)
    }, [remoteStream, remoteUserVideoRef.current])

    return (
        <div className="flex flex-col mx-auto justify-center items-center">
            <p>Hi {name}</p>
            <video autoPlay width={500} height={500} className="drop-shadow-md my-8 border-2 border-black" id="localVideo" ref={localUserVideoRef} />
            <video autoPlay width={500} height={500} className="drop-shadow-md my-8 border-2 border-black" id="remoteVideo" ref={remoteUserVideoRef} />
        </div>
    )
}