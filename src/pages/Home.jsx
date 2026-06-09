import Layout from '../components/layout/Layout'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function Home() {
  const { t } = useTranslation()

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center mt-20 gap-6">

        <Link
          to="/login"
          className="px-4 py-2 bg-green-600 rounded"
        >
          {t("auth.login")}
        </Link>

        <Link
          to="/register"
          className="px-4 py-2 bg-green-600 rounded"
        >
          {t('auth.register')}
        </Link>

      </div>
    </Layout>
  )
}