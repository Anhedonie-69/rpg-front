import api from './api'

export const getGameTitle = async () => {
  const response = await api.get('/game/title')
  return response.data
}