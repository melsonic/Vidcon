import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Room from '@/components/Room.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
  <Routes>
    <Route path="/" element={<App />} />
    {/* <Route path="lobby" element={<Lobby />} /> */}
    <Route path="room" element={<Room /> } />
  </Routes>
</BrowserRouter>
)
