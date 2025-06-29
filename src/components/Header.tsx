import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Camera, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function Header() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin'
      case 'staff':
        return 'Staff'
      case 'customer':
        return 'Customer'
      default:
        return role
    }
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Camera className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">
              LensPro Rentals
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Equipment
            </Link>
            <Link
              to="/suggestions"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Suggest Equipment
            </Link>
            {user && (
              <>
                <Link
                  to="/orders"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  {user.role === 'customer' ? 'My Orders' : 'Orders'}
                </Link>
                {(user.role === 'admin' || user.role === 'staff') && (
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  {user.name} ({getRoleDisplayName(user.role)})
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-primary-600 p-1"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <button className="btn btn-outline">Sign In</button>
                </Link>
                <Link to="/register">
                  <button className="btn btn-primary">Sign Up</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}