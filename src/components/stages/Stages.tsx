'use client'

import { FC } from 'react'
import { useStagesTemplate } from 'hooks/useStagesTemplate'

export const Stages: FC = () => {
  const Stage = useStagesTemplate()

  return <div className='relative overflow-hidden'>{Stage}</div>
}
