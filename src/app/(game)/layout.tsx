import { ReactNode } from 'react'
import { Background } from 'components/background'
import App from '../App'

// All game screens share this layout, so the game stays mounted while the URL changes between them.
// The title is shown on the start screen only; with ads on it always shows, as the band the AdSense top anchor covers.
export default function GameLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <h1 className="fixed top-0 left-0 z-1 m-0 w-full text-center text-[2rem] font-normal text-white shadow-[rgba(0,0,0,0.2)_0px_60px_40px_-7px] [text-shadow:5px_5px_0px_rgba(0,0,0,0.2)] after:absolute after:top-0 after:left-0 after:-z-1 after:h-[3.8rem] after:w-full after:bg-[#575757b1] after:content-[''] [.ads-enabled_&]:block! [[data-challenge-opening]_&]:invisible [body:not(:has([data-start-screen]))_&]:hidden">
        Կախաղան
      </h1>
      <Background />
      <App />
      {children}
    </>
  )
}
