import { createAsyncThunk } from '@reduxjs/toolkit'
import { TAppDispatch, TRootState } from 'store'

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: TRootState
  dispatch: TAppDispatch
  rejectValue: Error
  extra: any
}>()
