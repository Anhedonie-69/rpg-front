import { createSlice } from '@reduxjs/toolkit'

const gameSlice = createSlice({
  name: 'game',
  initialState: {
    // Sauvegarde active
    activeSlot: null,      // 1, 2 ou 3
    mapId: null,           // 'village_depart'
    posX: 0,
    posY: 0,
    playTime: 0,
    gold: 0,
    chapter: 1,
    flags: {},             // { boss1_killed: true, npc3_talked: true }
    partyIds: [],          // ids des personnages actifs

    // État du jeu
    isPlaying: false,      // partie en cours ?
    isPaused: false,
    loading: false,
  },
  reducers: {
    loadSave: (state, action) => {
      const save = action.payload
      state.activeSlot = save.slot
      state.mapId      = save.mapId
      state.posX       = save.posX
      state.posY       = save.posY
      state.playTime   = save.playTime
      state.gold       = save.gold
      state.chapter    = save.chapter
      state.flags      = save.flags
      state.partyIds   = save.partyIds
      state.isPlaying  = true
    },
    updatePosition: (state, action) => {
      state.posX = action.payload.x
      state.posY = action.payload.y
    },
    updatePlayTime: (state, action) => {
      state.playTime = action.payload
    },
    addGold: (state, action) => {
      state.gold += action.payload
    },
    removeGold: (state, action) => {
      state.gold = Math.max(0, state.gold - action.payload)
    },
    setFlag: (state, action) => {
      state.flags[action.payload.key] = action.payload.value
    },
    setParty: (state, action) => {
      state.partyIds = action.payload
    },
    setPaused: (state, action) => {
      state.isPaused = action.payload
    },
    resetGame: (state) => {
      state.activeSlot = null
      state.mapId      = null
      state.posX       = 0
      state.posY       = 0
      state.playTime   = 0
      state.gold       = 0
      state.chapter    = 1
      state.flags      = {}
      state.partyIds   = []
      state.isPlaying  = false
      state.isPaused   = false
    }
  },
})

export const {
  loadSave,
  updatePosition,
  updatePlayTime,
  addGold,
  removeGold,
  setFlag,
  setParty,
  setPaused,
  resetGame
} = gameSlice.actions

export default gameSlice.reducer