import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DoodleSync from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DoodleSync />
  </StrictMode>,
)
