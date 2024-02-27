import { FC } from "react";
import BgPaperImage from "assets/images/gallow_scribble_by_infidel_absence_d4gvvvg-fullview1.jpg";
import styles from "./styles.module.css";
import { useMemoizedCombinedClassNames } from "hooks/useMemoizedCombinedClassNames";
import { useAppSelector } from "hooks/useAppSelector";
import { selectAppOptions } from "store/app/selectors";
import { GAME_STAGES } from "helpers/constants/app";

type TProps = {};

export const Background: FC<TProps> = ({}) => {
  const { currentStage } = useAppSelector(selectAppOptions);
  const wrapperClassName = useMemoizedCombinedClassNames(
    [
      styles.background,
      currentStage !== GAME_STAGES.start ? styles.light : undefined,
    ],
    [currentStage]
  )

  return (
    <div className={wrapperClassName}>
      <img src={BgPaperImage} />
    </div>
  );
};
