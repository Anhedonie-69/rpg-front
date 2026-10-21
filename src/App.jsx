import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setUser, logout, setLoading } from './features/auth/authSlice'
import { setHasSave } from './features/game/gameSlice'
import { setOptions } from './features/user/userSlice'
import { fetchMe, authFetch } from './services/auth.service'
import AppRouter from './routes/AppRouter'
import { applyUserLanguage } from './utils/language'

export default function App() {
  const dispatch = useDispatch()
  const loading = useSelector(state => state.auth.loading)

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      dispatch(setLoading(false))
      return
    }

    fetchMe(token)
      .then(async (user) => {
        dispatch(setUser({ token, user }))
        applyUserLanguage(user)

        // Vérifie s'il existe des saves en BDD
        try {
            const savesRes = await authFetch('/api/saves')
            const saves    = await savesRes.json()
            const hasSave  = saves.some(s => !s.empty)

            if (hasSave) {
                dispatch(setHasSave(true))
            }
        } catch (err) {
            console.error('Erreur chargement saves:', err)
        }
      })
      .catch(() => dispatch(logout()))
  }, [dispatch])

  // Bloque le rendu le temps de vérifier le token
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-white">Chargement...</p>
      </div>
    )
  }

  return <AppRouter />
}