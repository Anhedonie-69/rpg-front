import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { login, fetchMe } from '../services/auth.service'
import { setUser } from '../features/auth/authSlice'
import Layout from '../components/layout/Layout'

export default function Login() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async () => {
    setError(null)
    try {
      const data = await login(form.email, form.password)
      const user = await fetchMe(data.token)

      dispatch(setUser({ token: data.token, user }))
      navigate('/')
    } catch (err) {
      console.log('ERREUR COMPLETE:', err)
      setError(err.error || 'Email ou mot de passe incorrect')
    }
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center mt-20 gap-6">
        <div className="flex flex-col gap-4 w-80">
          <h1 className="text-2xl">{t('auth.login')}</h1>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <input
            className="p-2 text-black"
            placeholder={t('auth.email')}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="p-2 text-black"
            type="password"
            placeholder={t('auth.password')}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button
            className="bg-blue-600 p-2 rounded"
            onClick={handleSubmit}
          >
            {t('auth.login')}
          </button>

          <Link className="text-sm text-gray-300">
            {t('auth.forgottenPass')}
          </Link>
          <Link to="/register" className="text-sm text-gray-300">
            {t('auth.register')}
          </Link>
        </div>
      </div>
    </Layout>
  )
}