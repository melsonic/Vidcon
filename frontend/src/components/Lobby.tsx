// import { Button } from "@/components/ui/button"
import Spinner from "@/components/ui/spinner"

export default function Lobby({websocket}: {websocket: WebSocket}) {
  return (
    <div className="h-screen flex flex-col justify-center items-center">
      {/** on clicking it will push the current user into the users queue, from which the server selects two random users to connect with each other */}
      <div className="flex flex-col items-center">
        <Spinner />
        <p className="mt-4">Waiting for people to join!</p>
      </div>

    </div>
  )
}