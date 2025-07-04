import { Background } from 'components/background'
import { Breadcrumb } from 'components/breadcrumb'
import { Stages } from 'components/stages/Stages'
import { useAppSelector } from 'hooks/useAppSelector'
import { FC } from 'react'
import { selectIsSingleMode } from 'store/app/selectors'
import './app.css'
import { IS_TOUCH_DEVICE } from 'helpers/constants/commons'

export const App: FC = () => {
  const isSingleMode = useAppSelector(selectIsSingleMode)

  // const dispatch = useAppDispatch()

  // useEffect(() => {
  //   getAppData()
  // }, [dispatch])

  return (
    <div className='app dark'>
      {
        IS_TOUCH_DEVICE ?
          <div>
            <Stages />
            {!isSingleMode && <Breadcrumb />}
            <Background />
          </div> :
          <div>
            <Background blurred />
            <h2 style={{ margin: 0, paddingTop: 40, textAlign: 'center' }}>The App is Designed<br /> only for Touch Devices</h2>
          </div>
      }
    </div>
  )
}

export default App
