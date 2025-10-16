import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTodo } from '../contexts/TodoContext'
import { User, Mail, Calendar, CheckSquare, Edit3 } from 'lucide-react'
import axios from 'axios'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const { stats } = useTodo()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || ''
      })
    }
  }, [user])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await axios.put(`/api/users/${user._id}`, formData)
      updateUser(response.data)
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div>
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="profile-info">
          <h1>{user?.name || 'User'}</h1>
          <p>{user?.email}</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="btn btn-outline"
        >
          <Edit3 size={16} />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* Profile Stats */}
      <div className="profile-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Todos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
          </div>
          <div className="stat-label">Completion Rate</div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="card">
        <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={20} />
          Profile Information
        </h2>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                name="bio"
                className="form-input"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                placeholder="Tell us about yourself..."
              />
            </div>

            {error && (
              <div className="error-message">{error}</div>
            )}

            {success && (
              <div className="success-message">{success}</div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <div className="spinner" style={{ width: '1rem', height: '1rem' }}></div>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Name:</strong> {user?.name || 'Not provided'}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Email:</strong> {user?.email}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Bio:</strong> {user?.bio || 'No bio provided'}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Member since:</strong> {formatDate(user?.createdAt)}
            </div>
            <div>
              <strong>Last login:</strong> {formatDate(user?.lastLogin)}
            </div>
          </div>
        )}
      </div>

      {/* Account Information */}
      <div className="card">
        <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Mail size={20} />
          Account Information
        </h2>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <strong>Email:</strong> {user?.email}
          </div>
          <div>
            <strong>Account Status:</strong> 
            <span style={{ 
              color: user?.isActive ? '#10b981' : '#ef4444',
              marginLeft: '0.5rem'
            }}>
              {user?.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div>
            <strong>Last Login:</strong> {formatDate(user?.lastLogin)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
