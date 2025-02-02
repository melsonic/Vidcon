import { VideoCameraIcon, VideoCameraSlashIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/outline"
import { useEffect, useState } from "react";

export default function Video({ videoRef, localStream }: { videoRef: React.MutableRefObject<HTMLVideoElement | null>, localStream: MediaStream | null }) {
    const [camera, setCamera] = useState<boolean>(true);
    const [audio, setAudio] = useState<boolean>(true);

    useEffect(() => {
        if (!camera) {
            localStream?.getVideoTracks().forEach(videoTrack => videoTrack.enabled = false)
        } else {
            localStream?.getVideoTracks().forEach(videoTrack => videoTrack.enabled = true)
        }
    }, [camera])

    useEffect(() => {
        if (!audio) {
            localStream?.getAudioTracks().forEach(audioTrack => audioTrack.enabled = false)
        } else {
            localStream?.getAudioTracks().forEach(audioTrack => audioTrack.enabled = false)
        }
    }, [audio])

    return (
        <div className="relative">
            <video autoPlay className="w-full border-2 border-black bg-white aspect-[4/3] object-cover mb-2 rounded-sm" id="localVideo" ref={videoRef} />
            {
                localStream !== null &&
                <div className="flex absolute z-10 w-full bottom-6 justify-center">
                    {!camera ?
                        <VideoCameraIcon className="h-8 w-8 lg:h-12 lg:w-12 mx-2 bg-darkblue rounded-full p-1 lg:p-2 text-gray-400 hover:text-white" onClick={() => setCamera(!camera)} />
                        :
                        <VideoCameraSlashIcon className="h-8 w-8 lg:h-12 lg:w-12 mx-2 bg-darkblue rounded-full p-1 lg:p-2 text-gray-400 hover:text-white" onClick={() => setCamera(!camera)} />
                    }
                    {!audio ?
                        <SpeakerWaveIcon className="h-8 w-8 lg:h-12 lg:w-12 mx-2 bg-darkblue rounded-full p-1 lg:p-2 text-gray-400 hover:text-white" onClick={() => setAudio(!audio)} />
                        :
                        <SpeakerXMarkIcon className="h-8 w-8 lg:h-12 lg:w-12 mx-2 bg-darkblue rounded-full p-1 lg:p-2 text-gray-400 hover:text-white" onClick={() => setAudio(!audio)} />
                    }
                </div>
            }
        </div>
    )
}