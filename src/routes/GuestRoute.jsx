import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

export default function GuestRoute({ children }) {
  const user = useSelector(state => state.auth.user)

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}