import { useEffect, useRef, useState } from "react";
import { MessageArea } from "./ui/message";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function VideoChat({ localStream, websocket, name }: { localStream: MediaStream, websocket: WebSocket, name: string }) {
    const localUserVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteUserVideoRef = useRef<HTMLVideoElement | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [remoteUserVideoTrack, setRemoteUserVideoTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteUserAudioTrack, setRemoteUserAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [callingPeer, setCallingPeer] = useState<RTCPeerConnection | null>(null);
    const [receivingPeer, setReceivingPeer] = useState<RTCPeerConnection | null>(null);
    const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
    const [message, setMessage] = useState<string>("");
    const [sentMessages, setSentMessages] = useState<Array<string>>([]);
    const [receivedMessages, setReceivedMessages] = useState<Array<string>>([]);
    const [flag, setFlag] = useState<boolean>(false);
    const msgRef = useRef<HTMLInputElement | null>(null);

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
                setDataChannel(dataChannel);
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
                    await pc.setRemoteDescription(new RTCSessionDescription(messageobj.offer))
                    const answer = await pc.createAnswer()
                    await pc.setLocalDescription(answer)
                    websocket.send(JSON.stringify({ 'answer': answer }))
                    pc.addEventListener('datachannel', e => {
                        setDataChannel(e.channel);
                    })
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

    useEffect(() => {
        if (dataChannel === null) return;
        function printMessage(e: MessageEvent) {
            setReceivedMessages(previousMessages => [...previousMessages, e.data])
        }
        dataChannel.addEventListener('message', printMessage);
        return () => {
            dataChannel.removeEventListener('message', printMessage);
        }
    }, [dataChannel]);

    return (
        <div className="flex flex-col p-8 lg:flex-row lg:h-screen">
            <div className="w-80 mx-auto md:w-96 lg:w-140 lg:h-full lg:mx-0 flex-none flex flex-col lg:justify-between">
                <video autoPlay className="border-2 border-black bg-white aspect-[4/3] object-cover mb-2" id="localVideo" ref={localUserVideoRef} />
                <video autoPlay className="border-2 border-black bg-white aspect-[4/3] object-cover mt-2" id="remoteVideo" ref={remoteUserVideoRef} />
            </div>
            <div className="flex flex-col w-80 mx-auto border-2 border-black h-80 mt-2 md:w-96 lg:mx-0 lg:h-auto lg:mt-0 lg:ml-12 grow">
                <MessageArea sent={sentMessages} received={receivedMessages} firstMessage={flag} />
                <div className="flex p-2 py-4 mt-auto">
                    <Input className="mr-1 focus:outline-hidden focus:border-lightblue" placeholder="enter message" id="msg" ref={msgRef} onChange={(e) => {
                        setMessage(e.target.value);
                    }} />
                    <Button onClick={() => {
                        if (msgRef.current === null || dataChannel === null) return;
                        if (receivedMessages.length === 0) {
                            setFlag(true);
                        }
                        dataChannel.send(message);
                        setSentMessages([...sentMessages, message]);
                        setMessage("");
                        msgRef.current.value = "";
                    }}
                        className="ml-1 bg-darkorange"
                    >Send</Button>
                </div>
            </div>
        </div>
    )
}