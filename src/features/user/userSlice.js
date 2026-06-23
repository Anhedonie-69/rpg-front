import { createSlice } from '@reduxjs/toolkit'

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,    // avatar, bio, birthDate, country
    options: null,    // volume, clavier, affichage
    loading: false,
  },
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload
    },
    setOptions: (state, action) => {
      state.options = action.payload
    },
    clearUser: (state) => {
      state.profile = null
      state.options = null
      state.loading = false
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    }
  },
})

export const { setProfile, setOptions, clearUser, setLoading } = userSlice.actions
export default userSlice.reducer