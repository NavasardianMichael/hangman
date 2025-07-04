import { StageComponent } from 'helpers/types/stage'
import styles from './styles.module.css'
import { useAppSelector } from 'hooks/useAppSelector'
import { selectAppOptions, selectPoints } from 'store/app/selectors'
import { CustomButton } from 'components/shared/customButton'
import { useAppDispatch } from 'hooks/useAppDispatch'
import { setAppOptions } from 'store/app/slice'
import { PLAY_MODES, PLAYERS } from 'helpers/constants/app'
import { useOpponent } from 'hooks/useOpponent'
import { processLocaleIssues } from 'helpers/utils/app'

export const Summary: StageComponent = ({ toNextPage }) => {

  const dispatch = useAppDispatch()

  const { player1, player2 } = useAppSelector(selectPoints)
  const { currentPlayer, currentWord, mode } = useAppSelector(selectAppOptions)
  const opponent = useOpponent()
  const isSingleMode = mode === PLAY_MODES.single

  const handleNextPlayerComposes = () => {
    dispatch(setAppOptions({
      currentPlayer: opponent
    }))
    toNextPage()
  }

  return (
    <div className={styles.summary}>
      <div className={styles.hints}>
        <p className={styles.main}>Պահված բառն էր՝<br /><span className={styles.currentWord}>«{processLocaleIssues(currentWord)}»</span></p>
        <p className={styles.hint}>
          {
            isSingleMode ?
              `Դուք ունեք ${player1} միավոր` :
              `Խաղացող 1՝ ${player1} միավոր`
          }
        </p>
        {
          !isSingleMode &&
          <p className={styles.hint}>Խաղացող 2՝ {player2} միավոր</p>
        }
      </div>

      <CustomButton style={{ fontSize: '.9rem' }} onClick={handleNextPlayerComposes}>
        {
          isSingleMode ?
            'Շարունակել' :
            `Բառ գրելու հերթը ${currentPlayer === PLAYERS.player1 ? 'երկրորդ' : 'առաջին'} խաղացողինն է`
        }
      </CustomButton>
    </div>
  )
}