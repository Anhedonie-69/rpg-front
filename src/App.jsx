import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setUser, logout, setLoading } from './features/auth/authSlice'
import { fetchMe } from './services/auth.service'
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

    // Token présent → on vérifie qu'il est encore valide
    fetchMe(token)
      .then(user => {
        dispatch(setUser({ token, user }))
        applyUserLanguage(user)
      })
      .catch(() => {
        // Token expiré ou invalide → on nettoie
        dispatch(logout())
      })
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