import { StageComponent } from 'helpers/types/stage'
import styles from './styles.module.css'
import { CustomButton } from 'components/shared/customButton'

export const Start: StageComponent = ({ toNextPage }) => {

  const handleClick = () => {
    toNextPage()
  }

  return (
    <div className={styles.start}>
      <CustomButton onClick={handleClick}>
        սկսել խաղը
      </CustomButton>
    </div>
  )
}