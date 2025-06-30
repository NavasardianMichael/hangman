import { StageComponent } from 'helpers/types/stage'
import styles from './styles.module.css'
import { CustomButton } from 'components/shared/customButton'
import { Button } from 'antd'
import { DownloadAppBtn } from 'components/downloadAppBtn'

export const Start: StageComponent = ({ toNextPage }) => {

  const handleClick = () => {
    toNextPage()
  }

  return (
    <div className={styles.start}>
      <DownloadAppBtn />
      <CustomButton onClick={handleClick}>
        սկսել
      </CustomButton>
    </div>
  )
}