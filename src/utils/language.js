import i18n from '../i18n'
export const applyUserLanguage = (user) => {
  if (user?.language) {
    i18n.changeLanguage(user.language)
    localStorage.setItem('lang', user.language)
  }
}