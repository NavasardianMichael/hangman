import { Background } from 'components/background'
import { Stages } from 'components/stages/Stages'
import { FC, useEffect } from 'react'
import { Breadcrumb } from 'components/breadcrumb'
import './app.css'
import { useAppDispatch } from 'hooks/useAppDispatch'
// import { getAppData } from 'api'

export const App: FC = () => {

  // const dispatch = useAppDispatch()

  // useEffect(() => {
  //   getAppData()
  // }, [dispatch])

  return (
    <div className='app dark'>
      <Background />
      <Breadcrumb />
      <Stages />
    </div>
  )
}

export default App
