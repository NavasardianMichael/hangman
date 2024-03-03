import { FC } from "react";
import BgPaperImage from "assets/images/gallow_scribble_by_infidel_absence_d4gvvvg-fullview1.jpg";
import styles from "./styles.module.css";
import { useMemoizedCombinedClassNames } from "hooks/useMemoizedCombinedClassNames";
import { useAppSelector } from "hooks/useAppSelector";
import { selectAppOptions } from "store/app/selectors";
import { STAGES_WITH_CLEAR_BACKGROUND } from "helpers/constants/app";

type TProps = {};

export const Background: FC<TProps> = ({}) => {
  const { currentStage, currentPlayer } = useAppSelector(selectAppOptions);
  const wrapperClassName = useMemoizedCombinedClassNames(
    [
      styles.background,
      !STAGES_WITH_CLEAR_BACKGROUND.includes(currentStage) ? styles.light : undefined,
    ],
    [currentStage]
  )

  return (
    <div className={wrapperClassName}>
      {/* <p className={styles.breadcrumb}>currentPlayer</p> */}
      <img src={BgPaperImage} />
    </div>
  );
};
