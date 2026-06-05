import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'

import ProtectedRoute from './ProtectedRoute'
import GuestRoute from './GuestRoute'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={
          //<GuestRoute>
            <Home />
          //</GuestRoute>
        }
      />
      <Route path="/login" element={
        //<GuestRoute>
          <Login />
        //</GuestRoute>
        }
      />
      <Route path="/register" element={
        //<GuestRoute>
          <Register />
        //</GuestRoute>
        }
      />
      <Route path="/dashboard" element={
        //<ProtectedRoute>
          <Dashboard />
        //</ProtectedRoute>
        }
      />
    </Routes>
  )
}