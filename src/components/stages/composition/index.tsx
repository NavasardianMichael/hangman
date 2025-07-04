import { StageComponent } from "helpers/types/stage";
import styles from "./styles.module.css";
import { LETTERS } from "helpers/constants/app";
import { MouseEventHandler, useState } from "react";
import { CustomButton } from "components/shared/customButton";
import { combineClassNames } from "helpers/utils/styles";
import { useAppDispatch } from "hooks/useAppDispatch";
import { setAppOptions } from "store/app/slice";
import { processLocaleIssues } from 'helpers/utils/app';
import { Audio } from 'components/shared/audio';
import WritingAudio from "assets/audio/writing.mp3";
import { useAppSelector } from 'hooks/useAppSelector';
import { selectGameSettings } from 'store/app/selectors';

export const Composition: StageComponent = ({ toNextPage }) => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectGameSettings);

  const [word, setWord] = useState("");

  const handleAlphabetLetterClick: MouseEventHandler<HTMLButtonElement> = (
    e
  ) => {
    setWord(word + e.currentTarget.name);
  };

  const handleRemoveCharClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    setWord((prev) => prev.substring(0, prev.length - 1));
  };

  const handleStartDiscovery: MouseEventHandler<HTMLButtonElement> = (e) => {
    dispatch(
      setAppOptions({
        currentWord: word,
      })
    );
    toNextPage();
  };

  return (
    <div className={styles.composition}>
      <div className={styles.word}>
        {Array.from(word).map((letter, i) => {
          return (
            <span key={i} className={styles.letter}>
              {processLocaleIssues(letter)}
            </span>
          );
        })}
      </div>
      <div className={styles.alphabet}>
        {LETTERS.map((letter) => {
          return (
            <button
              className={styles.letter}
              key={letter}
              name={letter}
              onClick={handleAlphabetLetterClick}
            >
              {processLocaleIssues(letter)}
            </button>
          );
        })}
        <button
          disabled={!word.length}
          className={combineClassNames(styles.letter, styles.remove)}
          key='✕'
          name='✕'
          onClick={handleRemoveCharClick}
        >
          ✕
        </button>
      </div>
      <CustomButton disabled={word.length < settings.minLettersCount} onClick={handleStartDiscovery}>
        Անցնել գուշակելուն
      </CustomButton>
      <Audio deps={[word]} src={WritingAudio} />
    </div>
  );
};
