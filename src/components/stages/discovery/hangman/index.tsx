import {
  FC,
  useEffect,
  useRef
} from "react";
import styles from "./styles.module.css";
import { canvasCreator } from 'helpers/utils/hangman';

type TProps = {
  step: number
};

export const Hangman: FC<TProps> = ({ step }) => {
  
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const hangmanDrawingSteps = canvasCreator(canvasRef?.current)
    hangmanDrawingSteps?.[step]?.()
  }, [step])

  return (
    <div className={styles.hangman}>
      <canvas ref={canvasRef} />
    </div>
  );
};
