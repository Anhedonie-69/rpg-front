import Layout from '../components/layout/Layout'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { register } from '../services/auth.service'

export default function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    email: '',
    pseudo: '',
    password: ''
  })

  const handleSubmit = async () => {
    setError(null)
    try {
      await register(form.email, form.pseudo, form.password)
      // Après inscription → on redirige vers login
      navigate('/login')
    } catch (err) {
      setError(err.error || 'Une erreur est survenue')
    }
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center mt-20 gap-6">
        <div className="flex flex-col gap-4 w-80">
          <h1 className="text-2xl">{t('auth.register')}</h1>

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
            placeholder={t('auth.pseudo')}
            onChange={(e) => setForm({ ...form, pseudo: e.target.value })}
          />
          <input
            className="p-2 text-black"
            type="password"
            placeholder={t('auth.password')}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button
            className="bg-green-600 p-2 rounded"
            onClick={handleSubmit}
          >
            {t('auth.register')}
          </button>
        </div>
      </div>
    </Layout>
  )
}