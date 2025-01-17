import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export default function Home() {
    return (
        <Button onClick={() => {
          let ws = new WebSocket("ws://localhost:8080/ws")
          ws.onopen = (_e) => {
            console.log("connection opened!")
          }
        }}>
          <Link to="/lobby">Explore</Link>
        </Button>
    )
}