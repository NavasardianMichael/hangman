import { FC } from 'react';
import { TAppSlice } from 'store/app/types';

export type StageComponent = FC<{
    toNextPage: (mode?: TAppSlice['mode']) => void
}>