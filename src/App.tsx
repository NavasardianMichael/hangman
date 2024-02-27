import { Background } from 'components/background'
import { Stages } from 'components/stages/Stages'
import { FC } from 'react'
import './app.css'

export const App: FC = () => {
  return (
    <div className='app dark'>
      <Background />
      <Stages />
    </div>
  )
}

export default App
