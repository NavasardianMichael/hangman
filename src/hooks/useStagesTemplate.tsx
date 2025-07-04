import { Composition } from "components/stages/composition"
import { Discovery } from "components/stages/discovery"
import { End } from "components/stages/end"
import { Start } from "components/stages/start"
import { Summary } from "components/stages/summary"
import { GAME_STAGES, PLAY_MODES } from "helpers/constants/app"
import { selectAppOptions } from "store/app/selectors"
import { setAppOptions } from "store/app/slice"
import { useAppDispatch } from "./useAppDispatch"
import { useAppSelector } from "./useAppSelector"
import { TAppSlice } from 'store/app/types'
import { Settings } from 'components/stages/settings'

export const useStagesTemplate = (): JSX.Element => {
    const { currentStage, mode } = useAppSelector(selectAppOptions)
    const dispatch = useAppDispatch()

    const STAGES_TEMPLATE = {
        [PLAY_MODES.single]: {
            [GAME_STAGES.start]: {
                Component: Start,
                nextStage: GAME_STAGES.settings
            },
            [GAME_STAGES.settings]: {
                Component: Settings,
                nextStage: GAME_STAGES.discovery
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
                nextStage: GAME_STAGES.end
            },
        },
        [PLAY_MODES.multiplayer]: {
            [GAME_STAGES.start]: {
                Component: Start,
                nextStage: GAME_STAGES.settings
            },
            [GAME_STAGES.settings]: {
                Component: Settings,
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
                nextStage: GAME_STAGES.start
            },
        },
    }
    console.log({ mode });

    const { Component } = mode ? STAGES_TEMPLATE[mode][currentStage] : STAGES_TEMPLATE[PLAY_MODES.single][currentStage]

    const toNextPage: (currentMode?: TAppSlice['mode']) => void = (currentMode) => {
        const actualMode = (currentMode ?? mode)
        const { nextStage } = actualMode ? STAGES_TEMPLATE[actualMode][currentStage] : STAGES_TEMPLATE[PLAY_MODES.single][currentStage]
        console.log({ mode, nextStage });

        const hasGameEnd = true
        if (!hasGameEnd) {
            dispatch(setAppOptions({ currentStage: nextStage }))
            return
        }

        const newStage = currentStage === GAME_STAGES.summary ? GAME_STAGES.composition : nextStage
        dispatch(setAppOptions({ currentStage: newStage }))
    }

    return <Component toNextPage={toNextPage} />
}