import { Button, ConfigProvider, ThemeConfig } from 'antd'
import { DownloadAppBtn } from 'components/downloadAppBtn'
import { PLAY_MODES } from 'helpers/constants/app'
import { StageComponent } from 'helpers/types/stage'
import { useAppDispatch } from 'hooks/useAppDispatch'
import { MouseEventHandler, useMemo } from 'react'
import { setAppOptions } from 'store/app/slice'
import { TAppSlice } from 'store/app/types'
import styles from './styles.module.css'

export const Start: StageComponent = ({ toNextPage }) => {
  const dispatch = useAppDispatch()

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    const mode = event.currentTarget.name as TAppSlice['mode']
    dispatch(setAppOptions({ mode }))
    if (mode === PLAY_MODES.single) dispatch(setAppOptions({ currentWord: 'Բալալայկա' }))
    toNextPage(mode)
  }

  const config: ThemeConfig = useMemo(() => {
    return {
      token: {
        colorPrimary: '#575757',
        borderRadius: 0,
        colorBgContainer: '#d3d3d32e',
        colorPrimaryBg: '#575757',
      },
      components: {
        Checkbox: {
          colorBgContainer: '#d3d3d32e',
          colorPrimary: 'red',
          colorPrimaryBg: 'red',
        }
      }

    }
  }, [])

  return (
    <ConfigProvider theme={config}>
      <div className={styles.start}>
        <DownloadAppBtn />
        <Button type='primary' onClick={handleClick} name={PLAY_MODES.single} className={styles.startBtn}>
          Մեկ հոգով
        </Button>
        <Button type='primary' onClick={handleClick} name={PLAY_MODES.multiplayer} className={styles.startBtn}>
          Երկու հոգով
        </Button>
      </div>
    </ConfigProvider>
  )
}