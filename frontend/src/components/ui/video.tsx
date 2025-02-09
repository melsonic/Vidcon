import { VideoCameraIcon, VideoCameraSlashIcon, SpeakerWaveIcon, SpeakerXMarkIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { useEffect, useState } from "react";

export default function Video({ videoRef, localStream, name, reset }: { videoRef: React.MutableRefObject<HTMLVideoElement | null>, localStream: MediaStream | null, name: string | null, reset: Function | null }) {
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
            localStream?.getAudioTracks().forEach(audioTrack => audioTrack.enabled = true)
        }
    }, [audio])

    return (
        <div className="relative">
            <>
                {name && <div className="flex absolute z-10 w-full top-6 justify-center py-2 bg-black bg-opacity-30 text-white">
                    {name}
                </div>}
            </>
            <video autoPlay className="w-full border-2 border-black bg-black aspect-[4/3] object-cover mb-2 lg:mb-0 rounded-sm" id="localVideo" ref={videoRef} />
            <>
                {
                    localStream === null && reset !== null &&
                    <div className="flex absolute z-10 w-full bottom-6 justify-center">
                        <XMarkIcon className="h-8 w-8 lg:h-10 lg:w-10 mx-2 bg-red-500 bg-opacity-70 rounded-full p-1 lg:p-2 text-gray-200 hover:text-white hover:scale-105" onClick={() => reset()} />
                    </div>
                }
            </>
            <>
                {
                    localStream !== null &&
                    <div className="flex absolute z-10 w-full bottom-6 justify-center">
                        {!camera ?
                            <VideoCameraIcon className="h-8 w-8 lg:h-12 lg:w-12 mx-2 bg-green-500 rounded-full p-1 lg:p-2 text-gray-200 hover:text-white bg-opacity-70 hover:scale-105" onClick={() => setCamera(!camera)} />
                            :
                            <VideoCameraSlashIcon className="h-8 w-8 lg:h-12 lg:w-12 mx-2 bg-red-500 rounded-full p-1 lg:p-2 text-gray-200 hover:text-white bg-opacity-70 hover:scale-105" onClick={() => setCamera(!camera)} />
                        }
                        {!audio ?
                            <SpeakerWaveIcon className="h-8 w-8 lg:h-12 lg:w-12 mx-2 bg-green-500 rounded-full p-1 lg:p-2 text-gray-200 hover:text-white bg-opacity-70 hover:scale-105" onClick={() => setAudio(!audio)} />
                            :
                            <SpeakerXMarkIcon className="h-8 w-8 lg:h-12 lg:w-12 mx-2 bg-red-500 rounded-full p-1 lg:p-2 text-gray-200 hover:text-white bg-opacity-70 hover:scale-105" onClick={() => setAudio(!audio)} />
                        }
                    </div>
                }
            </>
        </div>
    )
}