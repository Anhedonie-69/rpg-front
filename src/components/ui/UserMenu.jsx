import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { logout as logoutAction } from "../../features/auth/authSlice"
import { logout as logoutApi } from '../../services/auth.service'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

export default function UserMenu({ user }) {
  const [open, setOpen] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleLogout = () => {
    localStorage.removeItem('token')
    dispatch(logoutAction())
    navigate('/')
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}>
        {user.pseudo}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 bg-gray-800 p-2 rounded flex flex-col gap-2">
          <button onClick={() => navigate('/profile')}>
            {t('navigation.profil')}
          </button>

          <button onClick={handleLogout}>
            {t('navigation.logout')}
          </button>
        </div>
      )}
    </div>
  )
}