import { Routes, Route } from 'react-router-dom'

import AdminNews from '../pages/AdminNews'
import Dashboard from '../pages/Dashboard'
import Game from '../pages/Game'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Profile from '../pages/Profile'
import Register from '../pages/Register'

import AdminRoute from './AdminRoute'
import GuestRoute from './GuestRoute'
import ProtectedRoute from './ProtectedRoute'

export default function AppRouter() {
  return (
    <Routes>

      {/*Guest routes*/}

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

      {/*Admin routes*/}

      <Route path="/admin/news" element={
        <AdminRoute>
          <AdminNews />
        </AdminRoute>
      } />

      {/*Protected routes*/}

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
        }
      />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/new-game" element={
        <ProtectedRoute>
          <Game />
        </ProtectedRoute>
      } />
    </Routes>
  )
}