import { FC, PropsWithChildren } from 'react'
import { combineReducers, configureStore, createAsyncThunk } from '@reduxjs/toolkit'
import { usersSlice } from './users/slice'
import { Provider } from 'react-redux'

export const store = configureStore({
  reducer: combineReducers({
    users: usersSlice.reducer
  }),
})

export type TRootState = ReturnType<typeof store.getState>
export type TAppDispatch = typeof store.dispatch

export const StoreProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  )
}