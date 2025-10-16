import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const TodoContext = createContext()

export const useTodo = () => {
  const context = useContext(TodoContext)
  if (!context) {
    throw new Error('useTodo must be used within a TodoProvider')
  }
  return context
}

export const TodoProvider = ({ children }) => {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0
  })

  const fetchTodos = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get('/api/todos')
      setTodos(response.data)
      
      // Calculate stats
      const total = response.data.length
      const completed = response.data.filter(todo => todo.completed).length
      const pending = total - completed
      
      setStats({ total, completed, pending })
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch todos'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const createTodo = async (todoData) => {
    try {
      setError(null)
      const response = await axios.post('/api/todos', todoData)
      setTodos(prev => [response.data, ...prev])
      
      // Update stats
      setStats(prev => ({
        total: prev.total + 1,
        completed: prev.completed,
        pending: prev.pending + 1
      }))
      
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create todo'
      setError(message)
      return { success: false, error: message }
    }
  }

  const updateTodo = async (id, updates) => {
    try {
      setError(null)
      const response = await axios.put(`/api/todos/${id}`, updates)
      setTodos(prev => prev.map(todo => 
        todo._id === id ? response.data : todo
      ))
      
      // Update stats if completion status changed
      if (updates.hasOwnProperty('completed')) {
        const todo = todos.find(t => t._id === id)
        if (todo && todo.completed !== updates.completed) {
          setStats(prev => ({
            total: prev.total,
            completed: prev.completed + (updates.completed ? 1 : -1),
            pending: prev.pending + (updates.completed ? -1 : 1)
          }))
        }
      }
      
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update todo'
      setError(message)
      return { success: false, error: message }
    }
  }

  const deleteTodo = async (id) => {
    try {
      setError(null)
      await axios.delete(`/api/todos/${id}`)
      
      const todo = todos.find(t => t._id === id)
      setTodos(prev => prev.filter(todo => todo._id !== id))
      
      // Update stats
      setStats(prev => ({
        total: prev.total - 1,
        completed: prev.completed - (todo?.completed ? 1 : 0),
        pending: prev.pending - (todo?.completed ? 0 : 1)
      }))
      
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete todo'
      setError(message)
      return { success: false, error: message }
    }
  }

  const toggleTodo = async (id) => {
    const todo = todos.find(t => t._id === id)
    if (todo) {
      return await updateTodo(id, { completed: !todo.completed })
    }
    return { success: false, error: 'Todo not found' }
  }

  const value = {
    todos,
    loading,
    error,
    stats,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo
  }

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  )
}
