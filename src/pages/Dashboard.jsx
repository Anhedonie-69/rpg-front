import Layout from '../components/layout/Layout'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import NewsPanel from '../components/ui/NewsPanel'

export default function Dashboard() {

    const { t } = useTranslation()

    return (
      <Layout>
        <div className="flex items-start justify-center mt-20 gap-10 px-6">
          
          {/* Gauche - actions */}
          <div className="flex flex-col gap-4">
            <Link to="/new-game" className="px-4 py-2 bg-green-600 rounded text-center">
              {t('dashboard.newGame')}
            </Link>
            <Link to="/continue-game" className="px-4 py-2 bg-green-600 rounded text-center">
              {t('dashboard.continue')}
            </Link>
            <Link to="/options" className="px-4 py-2 bg-green-600 rounded text-center">
              {t('dashboard.options')}
            </Link>
          </div>
    
          {/* Droite - news */}
          <NewsPanel />
    
        </div>
      </Layout>
    )  
}