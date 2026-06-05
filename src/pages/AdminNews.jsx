import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Layout from '../components/layout/Layout'
import { fetchNews, createNews, updateNews, deleteNews } from '../services/news.service'

const emptyForm = { title: '', content: '', author: '' }

export default function AdminNews() {
  const { t } = useTranslation()
  const [news, setNews] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const loadNews = () => {
    fetchNews().then(setNews)
  }

  useEffect(() => {
    loadNews()
  }, [])

  const handleSubmit = async () => {
    setMessage(null)
    setError(null)
    try {
      if (editingId) {
        await updateNews(editingId, form)
        setMessage('News modifiée avec succès !')
      } else {
        await createNews(form)
        setMessage('News créée avec succès !')
      }
      setForm(emptyForm)
      setEditingId(null)
      loadNews()
    } catch (err) {
      setError(err.error || 'Une erreur est survenue')
    }
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setForm({
      title: item.title,
      content: item.content,
      author: item.author ?? '',
    })
    setMessage(null)
    setError(null)
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette news ?')) return
    try {
      await deleteNews(id)
      setMessage('News supprimée.')
      loadNews()
    } catch (err) {
      setError(err.error || 'Erreur lors de la suppression')
    }
  }

  const handleCancel = () => {
    setForm(emptyForm)
    setEditingId(null)
    setMessage(null)
    setError(null)
  }

  return (
    <Layout>
      <div className="flex flex-col items-center mt-10 gap-8 px-4">
        <h1 className="text-3xl font-bold">{t('news.editNews')}</h1>

        {/* Formulaire */}
        <div className="bg-gray-800 rounded p-6 w-full max-w-2xl flex flex-col gap-4">
          <h2 className="text-xl font-semibold">
            {editingId ? t('news.editOneNew') : t('news.createNews')}
          </h2>

          {message && <p className="text-green-400 text-sm">{message}</p>}
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <input
            className="p-2 rounded text-black"
            placeholder={t('news.title')}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            className="p-2 rounded text-black h-32"
            placeholder={t('news.content')}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
          <input
            className="p-2 rounded text-black"
            placeholder={t('news.author')}
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
          />

          <div className="flex gap-2">
            <button
              className="bg-green-600 px-4 py-2 rounded flex-1"
              onClick={handleSubmit}
            >
              {editingId ? t('news.edit') : t('news.create')}
            </button>
            {editingId && (
              <button
                className="bg-gray-600 px-4 py-2 rounded"
                onClick={handleCancel}
              >
                {t('news.cancel')}
              </button>
            )}
          </div>
        </div>

        {/* Liste des news */}
        <div className="w-full max-w-2xl flex flex-col gap-4">
          <h2 className="text-xl font-semibold">{t('news.existingNews')}</h2>

          {news.length === 0 && (
            <p className="text-gray-400">{t('news.noNews')}</p>
          )}

          {news.map(item => (
            <div
              key={item.id}
              className="bg-gray-800 rounded p-4 flex flex-col gap-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-sm text-gray-300 mt-1">{item.content}</p>
                  <span className="text-xs text-gray-500">
                    {t('news.from')} {item.author} · {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    className="bg-blue-600 px-3 py-1 rounded text-sm"
                    onClick={() => handleEdit(item)}
                  >
                    {t('news.edit')}
                  </button>
                  <button
                    className="bg-red-600 px-3 py-1 rounded text-sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    {t('news.delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}