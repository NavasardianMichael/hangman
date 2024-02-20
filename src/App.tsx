import { FC } from 'react'
import { Header } from 'components/header'
import './app.css'
import { Background } from 'components/background'

export const App: FC = () => {
  return (
    <>
      <Background />
      <Header />
    </>
  )
}

export default App
