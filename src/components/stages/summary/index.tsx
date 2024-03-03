import { StageComponent } from 'helpers/types/stage'
import styles from './styles.module.css'
import { useAppSelector } from 'hooks/useAppSelector'
import { selectAppOptions, selectPoints } from 'store/app/selectors'
import { CustomButton } from 'components/shared/customButton'
import { useAppDispatch } from 'hooks/useAppDispatch'
import { setAppOptions } from 'store/app/slice'
import { PLAYERS } from 'helpers/constants/app'

export const Summary: StageComponent = ({ toNextPage }) => {

  const dispatch = useAppDispatch()

  const { player1, player2 } = useAppSelector(selectPoints)
  const { currentPlayer } = useAppSelector(selectAppOptions)

  const handleNextPlayerComposes = () => {
    dispatch(setAppOptions({
      currentPlayer: currentPlayer === PLAYERS.player1 ? PLAYERS.player2 : PLAYERS.player1
    }))
    toNextPage()
  }

  return (
    <div className={styles.summary}>
      <div className={styles.hints}>
        <p className={styles.hint}>Խաղացող 1՝ {player1} միավոր</p>
        <p className={styles.hint}>Խաղացող 2՝ {player2} միավոր</p>
      </div>

      <CustomButton onClick={handleNextPlayerComposes}>
        Հերթը {currentPlayer === PLAYERS.player1 ? 'երկրորդ' : 'առաջին'} խաղացողինն է
      </CustomButton>
    </div>
  )
}