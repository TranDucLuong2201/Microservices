import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User, CheckSquare, Home, Menu, X } from 'lucide-react'

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="app">
      {/* Sidebar */}
      {isAuthenticated && (
        <>
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div 
              className="sidebar-overlay" 
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          {/* Sidebar */}
          <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <div className="sidebar-header">
              <Link to="/" className="sidebar-logo" onClick={() => setSidebarOpen(false)}>
                <CheckSquare size={24} />
                <span>TodoApp</span>
              </Link>
              <button 
                className="sidebar-close"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <nav className="sidebar-nav">
              <Link 
                to="/dashboard" 
                className={`sidebar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Home size={20} />
                <span>Dashboard</span>
              </Link>
              <Link 
                to="/profile" 
                className={`sidebar-link ${location.pathname === '/profile' ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <User size={20} />
                <span>Profile</span>
              </Link>
            </nav>

            <div className="sidebar-footer">
              <div className="sidebar-user">
                <div className="sidebar-avatar">
                  {user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="sidebar-user-info">
                  <div className="sidebar-user-name">{user?.email || 'User'}</div>
                  <div className="sidebar-user-role">User</div>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="sidebar-logout"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="main-content">
        {/* Top bar */}
        {isAuthenticated && (
          <header className="top-bar">
            <div className="top-bar-content">
              <button 
                className="sidebar-toggle"
                onClick={toggleSidebar}
              >
                <Menu size={20} />
              </button>
              <div className="top-bar-title">
                {location.pathname === '/dashboard' && 'Dashboard'}
                {location.pathname === '/profile' && 'Profile'}
              </div>
            </div>
          </header>
        )}

        {/* Page content */}
        <main className="page-content">
          <div className="container">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <div className="container">
            <p>&copy; 2024 TodoApp. Built with React & Microservices.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Layout
