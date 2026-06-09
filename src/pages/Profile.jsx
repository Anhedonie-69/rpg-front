import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import Layout from '../components/layout/Layout'
import { authFetch } from '../services/auth.service'

const API_URL = 'https://localhost:8000'

export default function Profile() {
  const { t } = useTranslation()
  const user = useSelector(state => state.auth.user)
  const [form, setForm] = useState({
    pseudo: '',
    language: '',
    avatar: '',
    bio: '',
    birthDate: '',
    country: '',
  })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  // Charge le profil au montage
  useEffect(() => {
    authFetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        setForm({
          pseudo:    data.pseudo    ?? '',
          language:  data.language  ?? '',
          avatar:    data.avatar    ?? '',
          bio:       data.bio       ?? '',
          birthDate: data.birthDate ?? '',
          country:   data.country   ?? '',
        })
        setLoading(false)
      })
      .catch(() => {
        setError('Impossible de charger le profil')
        setLoading(false)
      })
  }, [])

  const handleSubmit = async () => {
    setMessage(null)
    setError(null)
    try {
      const res = await authFetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(form),
      })
      if (!res.ok) throw await res.json()
      setMessage('Profil mis à jour avec succès !')
    } catch (err) {
      setError(err.error || 'Une erreur est survenue')
    }
  }

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center mt-20">
        <p className="text-gray-400">{t('navigation.loading')}...</p>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="flex flex-col items-center mt-10 gap-6 px-4">
        <h1 className="text-3xl font-bold">{t('profile.title')}</h1>

        <div className="bg-gray-800 rounded p-6 w-full max-w-lg flex flex-col gap-4">

          {message && <p className="text-green-400 text-sm">{message}</p>}
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">{t('profile.pseudo')}</label>
            <input
              className="p-2 rounded text-black"
              value={form.pseudo}
              onChange={(e) => setForm({ ...form, pseudo: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">{t('profile.language')}</label>
            <select
              className="p-2 rounded text-black"
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
            >
              <option value="">--</option>
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">{t('profile.bio')}</label>
            <textarea
              className="p-2 rounded text-black h-24"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">{t('profile.birthDate')}</label>
            <input
              type="date"
              className="p-2 rounded text-black"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">{t('profile.country')}</label>
            <input
              className="p-2 rounded text-black"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">{t('profile.avatar')}</label>
            <input
              className="p-2 rounded text-black"
              placeholder="https://..."
              value={form.avatar}
              onChange={(e) => setForm({ ...form, avatar: e.target.value })}
            />
            {form.avatar && (
              <img
                src={form.avatar}
                alt="avatar"
                className="w-16 h-16 rounded-full mt-2 object-cover"
              />
            )}
          </div>

          <button
            className="bg-blue-600 p-2 rounded mt-2"
            onClick={handleSubmit}
          >
            {t('profile.save')}
          </button>
        </div>

        {/* Infos en lecture seule */}
        <div className="bg-gray-800 rounded p-4 w-full max-w-lg text-sm text-gray-400">
          <p>Email : <span className="text-white">{user?.email}</span></p>
          <p>{t('profile.memberSince')} : <span className="text-white">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span></p>
        </div>

      </div>
    </Layout>
  )
}