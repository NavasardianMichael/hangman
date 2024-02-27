import { FC } from 'react';

export type StageComponent = FC<{
    toNextPage: () => void
}>