import { Background } from 'components/background'
import { Breadcrumb } from 'components/breadcrumb'
import { Stages } from 'components/stages/Stages'
import { useAppSelector } from 'hooks/useAppSelector'
import { FC } from 'react'
import { selectIsSingleMode } from 'store/app/selectors'
import './app.css'

export const App: FC = () => {
  const isSingleMode = useAppSelector(selectIsSingleMode)

  // const dispatch = useAppDispatch()

  // useEffect(() => {
  //   getAppData()
  // }, [dispatch])

  return (
    <div className='app dark'>
      <Background />
      <Stages />
      {!isSingleMode && <Breadcrumb />}
    </div>
  )
}

export default App
