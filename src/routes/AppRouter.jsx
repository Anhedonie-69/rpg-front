import { Routes, Route } from 'react-router-dom'
import AdminNews from '../pages/AdminNews'
import Dashboard from '../pages/Dashboard'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Profile from '../pages/Profile'
import Register from '../pages/Register'
import AdminRoute from './AdminRoute'

import ProtectedRoute from './ProtectedRoute'
import GuestRoute from './GuestRoute'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={
          <GuestRoute>
            <Home />
          </GuestRoute>
        }
      />
      <Route path="/login" element={
        <GuestRoute>
          <Login />
        </GuestRoute>
        }
      />
      <Route path="/register" element={
        <GuestRoute>
          <Register />
        </GuestRoute>
        }
      />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
        }
      />
      <Route path="/admin/news" element={
        <AdminRoute>
          <AdminNews />
        </AdminRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
    </Routes>
  )
}