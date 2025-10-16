import React, { useState, useEffect } from 'react'
import { useTodo } from '../contexts/TodoContext'
import { useAuth } from '../contexts/AuthContext'
import { Plus, CheckSquare, Clock, AlertCircle } from 'lucide-react'

const Dashboard = () => {
  const { todos, loading, error, stats, fetchTodos, createTodo, toggleTodo, deleteTodo } = useTodo()
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium'
  })

  useEffect(() => {
    fetchTodos()
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await createTodo(formData)
    if (result.success) {
      setFormData({ title: '', description: '', priority: 'medium' })
      setShowForm(false)
    }
  }

  const handleToggle = async (id) => {
    await toggleTodo(id)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      await deleteTodo(id)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high'
      case 'medium': return 'priority-medium'
      case 'low': return 'priority-low'
      default: return 'priority-medium'
    }
  }

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Welcome back, {user?.name}!</h1>
          <p>Manage your tasks and stay organized</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          <Plus size={16} />
          Add Todo
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
      </div>

      {/* Add Todo Form */}
      {showForm && (
        <div className="todo-form">
          <div className="todo-form-header">
            <h2 className="todo-form-title">Add New Todo</h2>
            <button 
              onClick={() => setShowForm(false)}
              className="btn btn-outline"
            >
              Cancel
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                name="title"
                className="form-input"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter todo title"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-input"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Enter todo description"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                name="priority"
                className="form-input"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">
                <Plus size={16} />
                Add Todo
              </button>
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Todo List */}
      <div className="todo-list">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
            <AlertCircle size={24} />
            <p>{error}</p>
          </div>
        ) : todos.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
            <CheckSquare size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>No todos yet. Create your first todo!</p>
          </div>
        ) : (
          todos.map(todo => (
            <div key={todo._id} className={`todo-item ${todo.completed ? 'todo-completed' : ''}`}>
              <input
                type="checkbox"
                className="todo-checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(todo._id)}
              />
              
              <div className="todo-content">
                <div className="todo-title">{todo.title}</div>
                {todo.description && (
                  <div className="todo-description">{todo.description}</div>
                )}
              </div>
              
              <div className="todo-actions">
                <span className={`todo-priority ${getPriorityColor(todo.priority)}`}>
                  {todo.priority}
                </span>
                <button 
                  onClick={() => handleDelete(todo._id)}
                  className="btn btn-danger"
                  style={{ padding: '0.25rem 0.5rem' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Dashboard
