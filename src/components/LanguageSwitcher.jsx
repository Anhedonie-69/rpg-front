import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { authFetch } from '../services/auth.service'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)

  const changeLanguage = async (lang) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('lang', lang)

    // Si connecté → sauvegarde en BDD
    if (isAuthenticated) {
      await authFetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ language: lang }),
      })
    }
  }

  return (
    <>
      <button onClick={() => changeLanguage('fr')}>FR</button>
      <button onClick={() => changeLanguage('en')}>EN</button>
    </>
  )
}