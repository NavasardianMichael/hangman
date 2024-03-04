import { Background } from 'components/background'
import { Stages } from 'components/stages/Stages'
import { FC } from 'react'
import './app.css'
import { Breadcrumb } from 'components/breadcrumb'

export const App: FC = () => {
  return (
    <div className='app dark'>
      <Background />
      <Breadcrumb />
      <Stages />
    </div>
  )
}

export default App
