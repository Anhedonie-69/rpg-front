import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
//import userReducer from '../features/user/userSlice'
//import gameReducer from '../features/game/gameSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    //user: userReducer,
    //game: gameReducer,
  },
})