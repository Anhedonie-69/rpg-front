import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { setOptions } from '../features/user/userSlice'
import Layout from '../components/layout/Layout'
import { authFetch } from '../services/auth.service'

export default function Options() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [form, setForm] = useState({
    volumeMaster: 80,
    volumeMusic: 70,
    volumeSfx: 100,
    fullscreen: false,
    showFps: false,
    textSpeed: 'normal',
    keyboardLayout: 'azerty',
  })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    authFetch('/api/options')
      .then(res => res.json())
      .then(data => {
        setForm(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Impossible de charger les options')
        setLoading(false)
      })
  }, [])

  const handleSubmit = async () => {
    setMessage(null)
    setError(null)
    try {
      const res = await authFetch('/api/options', {
        method: 'PUT',
        body: JSON.stringify(form),
      })
      if (!res.ok) throw await res.json()
      dispatch(setOptions(form))
      setMessage('Options sauvegardées !')
    } catch (err) {
      setError(err.error || 'Une erreur est survenue')
    }
  }

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center mt-20">
        <p className="text-gray-400">Chargement...</p>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="flex flex-col items-center mt-10 gap-6 px-4">
        <h1 className="text-3xl font-bold">{t('options.title')}</h1>

        <div className="bg-gray-800 rounded p-6 w-full max-w-lg flex flex-col gap-6">

          {message && <p className="text-green-400 text-sm">{message}</p>}
          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Audio */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold border-b border-gray-600 pb-1">
              {t('options.audio')}
            </h2>

            {[
              { key: 'volumeMaster', label: t('options.volumeMaster') },
              { key: 'volumeMusic',  label: t('options.volumeMusic') },
              { key: 'volumeSfx',    label: t('options.volumeSfx') },
            ].map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">
                  {label} : {form[key]}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: parseInt(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>
            ))}
          </div>

          {/* Affichage */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold border-b border-gray-600 pb-1">
              {t('options.display')}
            </h2>

            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-400">{t('options.fullscreen')}</label>
              <input
                type="checkbox"
                checked={form.fullscreen}
                onChange={(e) => setForm({ ...form, fullscreen: e.target.checked })}
                className="w-4 h-4"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-400">{t('options.showFps')}</label>
              <input
                type="checkbox"
                checked={form.showFps}
                onChange={(e) => setForm({ ...form, showFps: e.target.checked })}
                className="w-4 h-4"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">{t('options.textSpeed')}</label>
              <select
                className="p-2 rounded text-black"
                value={form.textSpeed}
                onChange={(e) => setForm({ ...form, textSpeed: e.target.value })}
              >
                <option value="slow">{t('options.slow')}</option>
                <option value="normal">{t('options.normal')}</option>
                <option value="fast">{t('options.fast')}</option>
              </select>
            </div>
          </div>

          {/* Clavier */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold border-b border-gray-600 pb-1">
              {t('options.keyboard')}
            </h2>

            <div className="flex gap-4">
              {['azerty', 'qwerty'].map(layout => (
                <button
                  key={layout}
                  onClick={() => setForm({ ...form, keyboardLayout: layout })}
                  className={`flex-1 p-2 rounded font-bold uppercase ${
                    form.keyboardLayout === layout
                      ? 'bg-blue-600'
                      : 'bg-gray-600'
                  }`}
                >
                  {layout}
                </button>
              ))}
            </div>

            {/* Affichage des touches selon le layout */}
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 bg-gray-900 p-3 rounded">
              <span>↑ {t('options.keyUp')}</span>
              <span className="text-white font-bold">
                {form.keyboardLayout === 'azerty' ? 'Z' : 'W'}
              </span>
              <span>↓ {t('options.keyDown')}</span>
              <span className="text-white font-bold">S</span>
              <span>← {t('options.keyLeft')}</span>
              <span className="text-white font-bold">
                {form.keyboardLayout === 'azerty' ? 'Q' : 'A'}
              </span>
              <span>→ {t('options.keyRight')}</span>
              <span className="text-white font-bold">D</span>
              <span>{t('options.keyInteract')}</span>
              <span className="text-white font-bold">E</span>
              <span>{t('options.keyInventory')}</span>
              <span className="text-white font-bold">I</span>
              <span>{t('options.keyMap')}</span>
              <span className="text-white font-bold">M</span>
              <span>{t('options.keyCancel')}</span>
              <span className="text-white font-bold">Échap</span>
            </div>
          </div>

          <button
            className="bg-blue-600 p-2 rounded mt-2"
            onClick={handleSubmit}
          >
            {t('options.save')}
          </button>
        </div>
      </div>
    </Layout>
  )
}