import { StageComponent } from "helpers/types/stage";
import { GAME_STAGES, LETTERS, PLAY_MODES } from "helpers/constants/app";
import { MouseEventHandler, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "hooks/useAppSelector";
import { selectAppOptions } from "store/app/selectors";
import { combineClassNames } from "helpers/utils/styles";
import { useAppDispatch } from "hooks/useAppDispatch";
import { incrementCurrentPlayerPoint } from "store/app/slice";
import { CustomButton } from "components/shared/customButton";
import { Hangman } from "./hangman";
import { Audio } from "components/shared/audio";
import CorrectWordAudio from "assets/audio/correct.mp3";
import ScribbleAudio from "assets/audio/scribble.mp3";
import WinAudio from "assets/audio/win.mp3";
import LossAudio from "assets/audio/loss.mp3";
import styles from "./styles.module.css";
import { processLocaleIssues } from "helpers/utils/app";
import { Statistic } from 'antd';

export const Discovery: StageComponent = ({ toNextPage }) => {
  const dispatch = useAppDispatch();
  const { currentWord, mode, settings } = useAppSelector(selectAppOptions);
  const currentWordLettersArr = useMemo(() => {
    return Array.from(currentWord.toUpperCase()) as (typeof LETTERS)[number][];
  }, [currentWord]);

  const [guessedLetters, setGuessedLetters] = useState<{
    [key in (typeof LETTERS)[number]]?: boolean;
  }>({});
  const [wastedLetters, setWastedLetters] = useState<{
    [key in (typeof LETTERS)[number]]?: boolean;
  }>({});

  const wastedLettersCount = useMemo(() => {
    return Object.keys(wastedLetters).length;
  }, [wastedLetters]);

  const handleAlphabetLetterClick: MouseEventHandler<HTMLButtonElement> = (
    e
  ) => {
    const letter = e.currentTarget.name.toUpperCase();

    console.log({ letter });

    if (!currentWord.toUpperCase().includes(letter)) {
      setWastedLetters((prev) => ({ ...prev, [letter]: true }));
      // if(Object.keys(wastedLetters).length + 1 >= 7) {
      //   toNextPage()
      // }
      return;
    }

    setGuessedLetters((prev) => ({ ...prev, [letter]: true }));
  };

  const handleShowSummary = () => {
    toNextPage();
  };

  const isWordGuessed = useMemo(() => {
    return currentWordLettersArr.every((letter) => guessedLetters[letter]);
  }, [currentWordLettersArr, guessedLetters]);

  useEffect(() => {
    if (isWordGuessed) dispatch(incrementCurrentPlayerPoint());
  }, [currentWordLettersArr, guessedLetters]);

  useEffect(() => {
    console.log({ currentWordLettersArr });

  }, [currentWordLettersArr])

  return (
    <div className={styles.discovery}>
      <Statistic.Timer type="countdown" value={1000 * settings.timeLimit} />
      <div
        className={combineClassNames(
          styles.word,
          isWordGuessed ? styles.success : undefined,
          !isWordGuessed && wastedLettersCount > 6 ? styles.fail : undefined
        )}
      >
        {currentWordLettersArr.map((letter, i) => {
          return (
            <span
              key={i}
              className={combineClassNames(
                styles.cell,
                isWordGuessed ||
                  (!isWordGuessed &&
                    (guessedLetters[letter] || wastedLettersCount > 6))
                  ? styles.guessed
                  : undefined
              )}
            >
              <span>{processLocaleIssues(letter)}</span>
            </span>
          );
        })}
      </div>
      <Audio deps={[wastedLettersCount, currentWordLettersArr]} src={ScribbleAudio} />
      <Audio deps={[isWordGuessed]} src={WinAudio} />
      <Audio
        deps={[!isWordGuessed && wastedLettersCount > 6]}
        src={LossAudio}
      />
      <Audio
        deps={[Object.values(guessedLetters).length]}
        src={CorrectWordAudio}
      />
      <Hangman step={wastedLettersCount} />
      <div
        className={combineClassNames(
          styles.alphabet,
          isWordGuessed || wastedLettersCount > 6 ? styles.disabled : undefined
        )}
      >
        {LETTERS.map((letter) => {
          return (
            <button
              key={letter}
              name={letter}
              disabled={guessedLetters[letter] || wastedLetters[letter]}
              className={combineClassNames(
                styles.letter,
                guessedLetters[letter] ? styles.guessed : undefined,
                wastedLetters[letter] ? styles.wasted : undefined
              )}
              onClick={handleAlphabetLetterClick}
            >
              {processLocaleIssues(letter)}
            </button>
          );
        })}
      </div>
      {(isWordGuessed || wastedLettersCount > 6) && (
        <CustomButton onClick={handleShowSummary}>
          {
            mode === PLAY_MODES.single ?
              `Շարունակել` :
              `Անցնել հաջորդ խաղացողին`
          }
        </CustomButton>
      )}
    </div>
  );
};
