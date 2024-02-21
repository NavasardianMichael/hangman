import { FC } from 'react'
import styles from './styles.module.css'
import { useAppSelector } from 'hooks/useAppSelector'
import { selectAppOptions } from 'store/app/selectors'
import { TAppSlice } from 'store/app/types'
import { GAME_STAGES } from 'helpers/constants/app'
import { Start } from './start'
import { Composition } from './composition'
import { Discovery } from './discovery'
import { Summary } from './summary'
import { End } from './end'

type Props = {

}

const STAGES_TEMPLATE: Record<TAppSlice['currentStage'], FC<any>> = {
    [GAME_STAGES.start]: {
        Component: Start,
        nextStage: GAME_STAGES.composition
    },
    [GAME_STAGES.composition]: {
        Component: Composition,
        nextStage: GAME_STAGES.discovery
    },
    [GAME_STAGES.discovery]: {
        Component: Discovery,
        nextStage: GAME_STAGES.summary
    },
    [GAME_STAGES.summary]: {
        Component: Summary,
        nextStage: GAME_STAGES.end
    },
    [GAME_STAGES.end]: {
        Component: End,
        nextStage: GAME_STAGES.composition
    },
}

export const Stages: FC<Props> = ({  }) => {

    const appOptions = useAppSelector(selectAppOptions)
    console.log({STAGE_COMPONENTS, appOptions: appOptions?.currentStage});
    
    const CurrentStage = STAGE_COMPONENTS[appOptions?.currentStage]

  return (
    <div>
        <CurrentStage />
    </div>
  )
}