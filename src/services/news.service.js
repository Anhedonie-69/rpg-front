import { authFetch } from './auth.service'

const API_URL = 'https://localhost:8000'

// GET toutes les news (public)
export const fetchNews = async () => {
  const res = await fetch(`${API_URL}/api/news`)
  if (!res.ok) throw await res.json()
  return res.json()
}

// GET une news (public)
export const fetchNewsById = async (id) => {
  const res = await fetch(`${API_URL}/api/news/${id}`)
  if (!res.ok) throw await res.json()
  return res.json()
}

// POST créer une news (admin)
export const createNews = async (data) => {
  const res = await authFetch('/api/admin/news', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

// PUT modifier une news (admin)
export const updateNews = async (id, data) => {
  const res = await authFetch(`/api/admin/news/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

// DELETE supprimer une news (admin)
export const deleteNews = async (id) => {
  const res = await authFetch(`/api/admin/news/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw await res.json()
  return res.json()
}