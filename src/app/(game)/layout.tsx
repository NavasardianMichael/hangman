import { ReactNode } from 'react'
import App from '../App'

// All game screens share this layout, so the game stays mounted while the URL changes between them
export default function GameLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <h1 className='app-title'>Կախաղան</h1>
      <App />
      {children}
    </>
  )
}
