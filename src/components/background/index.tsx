import { FC } from "react";
import BgPaperImage from "assets/images/gallows-narrow.jpg";
import styles from "./styles.module.css";
import { useMemoizedCombinedClassNames } from "hooks/useMemoizedCombinedClassNames";
import { useAppSelector } from "hooks/useAppSelector";
import { selectAppOptions } from "store/app/selectors";
import { STAGES_WITH_CLEAR_BACKGROUND } from "helpers/constants/app";

type TProps = {
  blurred?: boolean;
};

export const Background: FC<TProps> = ({ blurred = false }) => {
  const { currentStage } = useAppSelector(selectAppOptions);
  const wrapperClassName = useMemoizedCombinedClassNames(
    [
      styles.background,
      (!STAGES_WITH_CLEAR_BACKGROUND.includes(currentStage) || blurred) ? styles.light : undefined,
    ],
    [currentStage]
  )

  return (
    <div className={wrapperClassName}>
      <img src={BgPaperImage} />
    </div>
  );
};
