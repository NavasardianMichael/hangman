import { ConfigProvider } from 'antd'
import { DownloadAppBtn } from 'components/downloadAppBtn'
import { CustomButton } from 'components/shared/customButton'
import { StageComponent } from 'helpers/types/stage'
import styles from './styles.module.css'

export const Start: StageComponent = ({ toNextPage }) => {

  const handleClick = () => {
    toNextPage()
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#575757',
          borderRadius: 0,
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