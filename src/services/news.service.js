import api from './api'

export const getNews = async () => {
  const response = await api.get('/news')
  return response.data
}