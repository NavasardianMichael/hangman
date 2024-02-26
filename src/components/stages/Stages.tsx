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



export const Stages: FC<Props> = ({  }) => {

    const appOptions = useAppSelector(selectAppOptions)
    console.log({STAGES_TEMPLATE, appOptions: appOptions?.currentStage});
    
    const { Component } = STAGES_TEMPLATE[appOptions?.currentStage]

  return (
    <div>
        <Component />
    </div>
  )
}