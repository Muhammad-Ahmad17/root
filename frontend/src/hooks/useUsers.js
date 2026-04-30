import { useState, useEffect, useCallback } from 'react'
import * as api from '../api/users'

export function useUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.getAllUsers()
      setUsers(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const addUser = async (data) => {
    const res = await api.createUser(data)
    setUsers((prev) => [res.data, ...prev])
    return res
  }

  const editUser = async (id, data) => {
    const res = await api.updateUser(id, data)
    setUsers((prev) => prev.map((u) => (u.id === id ? res.data : u)))
    return res
  }

  const removeUser = async (id) => {
    await api.deleteUser(id)
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  return { users, loading, error, fetchUsers, addUser, editUser, removeUser }
}
