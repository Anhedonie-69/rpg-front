import Layout from '../components/layout/Layout'
import NewsPanel from '../components/ui/NewsPanel'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function Dashboard() {

    const { t } = useTranslation()

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center mt-20 gap-6">
        <Link
            to="/new-game"
            className="px-4 py-2 bg-green-600 rounded"
        >
            {t('dashboard.newGame')}
        </Link>
        <Link
            to="/continue-game"
            className="px-4 py-2 bg-green-600 rounded"
        >
            {t('dashboard.continue')}
        </Link>
        <Link
            to="/options"
            className="px-4 py-2 bg-green-600 rounded"
        >
            {t('dashboard.options')}
        </Link>

        <div>
            <NewsPanel />
        </div>
        
      </div>
    </Layout>
  )   
}