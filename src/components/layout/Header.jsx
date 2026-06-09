import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import UserMenu from '../ui/UserMenu'

import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../LanguageSwitcher'

export default function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const user = useSelector(state => state.auth.user)

  return (
    <header className="flex justify-between items-center p-4 bg-gray-800">

      {/* Left - titre */}
      <Link
        to="/"
        className="font-bold text-xl">
        {t('navigation.home')}
      </Link>

      {/* Center - navigation (optionnel plus tard) */}
      <nav className="flex items-center gap-4">
        {/* liens futurs */}
      </nav>

      {/* Right - actions */}
      <div className="flex items-center gap-4">

        <LanguageSwitcher />

        {user ? (
          <UserMenu user={user} />
        ) : (
          <span>{t('navigation.guest')}</span>
        )}
        
      </div>
    </header>
  )
}