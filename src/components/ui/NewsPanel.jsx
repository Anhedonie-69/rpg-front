import { useEffect, useState } from 'react'
import { getNews } from '../../services/news.service'

export default function NewsPanel() {
  const [news, setNews] = useState([])

  useEffect(() => {
    getNews().then(setNews)
  }, [])

  return (
    <div className="bg-black/60 p-4 rounded w-96">
      <h2 className="text-lg mb-2">Actualités</h2>

      {news.map((n, i) => (
        <div key={i} className="mb-2">
          <div className="font-bold">{n.title}</div>
          <div className="text-sm text-gray-300">{n.content}</div>
        </div>
      ))}
    </div>
  )
}