import { FC, useMemo } from "react";
import { GAME_STAGES, PLAYERS, STAGES_HIDE_BREADCRUMB } from "helpers/constants/app";
import { useAppSelector } from "hooks/useAppSelector";
import { selectAppOptions } from "store/app/selectors";
import styles from "./styles.module.css";

type TProps = {};

export const Breadcrumb: FC<TProps> = ({}) => {
  const { currentStage, currentPlayer } = useAppSelector(selectAppOptions);

  const text = useMemo(() => {
    const parts = [
      'Բառը',
      currentStage === GAME_STAGES.composition ? 'գրում է' : 'գուշակում է',
      (
        currentStage === GAME_STAGES.composition ?
        currentPlayer === PLAYERS.player1 ? 'առաջին' : 'երկրորդ' :
        currentPlayer === PLAYERS.player1 ? 'երկրորդ' : 'առաջին'
      )
      ,
      'խաղացողը',
    ]

    return parts.join(' ')
  }, [currentStage, currentPlayer])

  if(STAGES_HIDE_BREADCRUMB.includes(currentStage)) return
  
  return (
    <div className={styles.container}>
      <p className={styles.breadcrumb}>
        {text}
      </p>
    </div>
  );
};
