import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

export default function AdminRoute({ children }) {
  const { user, loading } = useSelector(state => state.auth)
  
  if (loading) return null
  
  if (!user?.roles?.includes('ROLE_ADMIN')) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}