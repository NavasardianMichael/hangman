import { StageComponent } from 'helpers/types/stage'
import styles from './styles.module.css'
import { FC, useEffect, useRef } from 'react'
import ScribbleAudio from 'assets/audio/scribble.mp3'

type TProps = {
  step: number
};

export const Audio: FC<TProps> = ({ step }) => {

    const audioRef = useRef<HTMLAudioElement>(null)

    useEffect(() => {
        audioRef?.current?.play()
    }, [step])

  return (
    <div className={styles.discovery}>
        <audio ref={audioRef} src={ScribbleAudio} />
    </div>
  )
}