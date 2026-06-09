import Header from './Header'
import Footer from './Footer'
import { useTranslation } from 'react-i18next'

export default function Layout({ children }) {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Header />

      <div
        className="min-h-screen text-white"
        style={{
          backgroundImage: "url('/img/Univers.jpg')",
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      >
        <div className="flex flex-col items-center mt-10 gap-6 px-4">
        <h1 className="text-4xl font-bold">
          {t('home.title')}
        </h1>
        </div>
        {children}
      </div>

      <Footer />
    </div>
  )
}