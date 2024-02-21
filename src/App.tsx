import { Background } from 'components/background'
import { Stages } from 'components/stages/Stages'
import { FC } from 'react'
import './app.css'

export const App: FC = () => {
  return (
    <>
      <Background />
      <Stages />
    </>
  )
}

export default App
