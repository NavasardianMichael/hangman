import { FC, PropsWithChildren } from 'react'
import { Provider } from 'react-redux'
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { usersSlice } from './users/slice'

export const store = configureStore({
  reducer: combineReducers({
    users: usersSlice.reducer,
  }),
})

export type TRootState = ReturnType<typeof store.getState>
export type TAppDispatch = typeof store.dispatch

export const StoreProvider: FC<PropsWithChildren> = ({ children }) => {
  return <Provider store={store}>{children}</Provider>
}
