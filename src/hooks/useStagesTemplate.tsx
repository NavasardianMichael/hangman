import { Composition } from "components/stages/composition"
import { Discovery } from "components/stages/discovery"
import { End } from "components/stages/end"
import { Start } from "components/stages/start"
import { Summary } from "components/stages/summary"
import { GAME_STAGES } from "helpers/constants/app"
import { useAppSelector } from "./useAppSelector"
import { selectAppOptions } from "store/app/selectors"
import { useAppDispatch } from "./useAppDispatch"
import { setAppOptions } from "store/app/slice"

export const useStagesTemplate = () => {
    const { currentStage } = useAppSelector(selectAppOptions)
    const dispatch = useAppDispatch()

    const STAGES_TEMPLATE = {
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

    const { Component, nextStage } = STAGES_TEMPLATE[currentStage]

    const toNextPage = () => {
        const hasGameEnd = false
        if(hasGameEnd) 
        return () => dispatch(setAppOptions({currentStage: nextStage}))
    }

    return <Component toNextPage={toNextPage} />
}