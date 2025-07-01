import { StageComponent } from 'helpers/types/stage'
import styles from './styles.module.css'
import { CustomButton } from 'components/shared/customButton'
import { Button, ConfigProvider } from 'antd'
import { DownloadAppBtn } from 'components/downloadAppBtn'

export const Start: StageComponent = ({ toNextPage }) => {

  const handleClick = () => {
    toNextPage()
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          // Seed Token
          colorPrimary: '#575757',
          borderRadius: 0,

          // Alias Token
          colorBgContainer: '#d3d3d32e',
        },
      }}
    >
      <div className={styles.start}>
        <DownloadAppBtn />
        <CustomButton onClick={handleClick}>
          սկսել
        </CustomButton>
      </div>
    </ConfigProvider>
  )
}