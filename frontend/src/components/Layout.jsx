import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User, CheckSquare, Home } from 'lucide-react'

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth()
  const location = useLocation()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo">
              <CheckSquare size={24} />
              TodoApp
            </Link>
            
            {isAuthenticated && (
              <nav className="nav-menu">
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                >
                  <Home size={16} />
                  Dashboard
                </Link>
                <Link 
                  to="/profile" 
                  className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
                >
                  <User size={16} />
                  Profile
                </Link>
                
                <div className="user-menu">
                  <div className="user-info">
                    <div className="avatar">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span>{user?.name || 'User'}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="btn btn-outline"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </nav>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {children}
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>&copy; 2024 TodoApp. Built with React & Microservices.</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
