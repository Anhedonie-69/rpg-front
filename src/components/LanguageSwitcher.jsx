import { useTranslation } from 'react-i18next'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('lang', lang)
  }

  return (
    <>
      <button onClick={() => changeLanguage('fr')}>
        FR
      </button>

      <button onClick={() => changeLanguage('en')}>
        EN
      </button>
    </>
  )
}