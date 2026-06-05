import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { fetchNews } from '../../services/news.service'

export default function NewsPanel() {
  const { t } = useTranslation()
  const [news, setNews] = useState([])
  const user = useSelector(state => state.auth.user)
  const isAdmin = user?.roles?.includes('ROLE_ADMIN')

  useEffect(() => {
    fetchNews().then(setNews)
  }, [])

  return (
    <div className="bg-black/60 p-4 rounded w-96">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg">{t('news.bigTitle')}</h2>
        {isAdmin && (
          <Link
            to="/admin/news"
            className="text-xs bg-yellow-600 px-2 py-1 rounded"
          >
            {t('news.editNews')}
          </Link>
        )}
      </div>

      {news.length === 0 && (
        <p className="text-gray-400 text-sm">{t('news.noNews')}</p>
      )}

      {news.map((n, i) => (
        <div key={i} className="mb-3 border-b border-gray-700 pb-2">
          <div className="font-bold">{n.title}</div>
          <div className="text-sm text-gray-300">{n.content}</div>
          <div className="text-xs text-gray-500 mt-1">
            {n.author && `Par ${n.author} · `}
            {new Date(n.createdAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  )
}