import { useState, useMemo } from 'react'
import { FiPlus, FiRefreshCw } from 'react-icons/fi'
import { useUsers } from '../hooks/useUsers'
import UserList from '../components/UserList'
import UserForm from '../components/UserForm'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import SearchBar from '../components/SearchBar'

export default function UsersPage() {
  const { users, loading, error, fetchUsers, addUser, editUser, removeUser } = useUsers()

  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    )
  }, [users, search])

  function notify(message, type = 'success') {
    setToast({ message, type })
  }

  function openAdd() {
    setEditTarget(null)
    setShowForm(true)
  }

  function openEdit(user) {
    setEditTarget(user)
    setShowForm(true)
  }

  async function handleFormSubmit(data) {
    try {
      if (editTarget) {
        await editUser(editTarget.id, data)
        notify('User updated successfully')
      } else {
        await addUser(data)
        notify('User created successfully')
      }
      setShowForm(false)
    } catch (err) {
      notify(err.message, 'error')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await removeUser(deleteTarget.id)
      notify('User deleted')
    } catch (err) {
      notify(err.message, 'error')
    } finally {
      setDeleteLoading(false)
      setDeleteTarget(null)
    }
  }

  return (
    <main className="page">
      {/* Stats bar */}
      <div className="stats-bar">
        <div className="stat-card">
          <span className="stat-value">{users.length}</span>
          <span className="stat-label">Total Users</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{filtered.length}</span>
          <span className="stat-label">Showing</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} />
        <div className="toolbar-actions">
          <button className="btn btn-ghost icon-label" onClick={fetchUsers} title="Refresh">
            <FiRefreshCw size={15} />
            Refresh
          </button>
          <button className="btn btn-primary icon-label" onClick={openAdd}>
            <FiPlus size={18} />
            Add User
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="error-banner">
          {error} —{' '}
          <button className="link-btn" onClick={fetchUsers}>
            retry
          </button>
        </div>
      )}

      {/* User grid */}
      <UserList users={filtered} loading={loading} onEdit={openEdit} onDelete={setDeleteTarget} />

      {/* Modals */}
      {showForm && (
        <UserForm
          user={editTarget}
          onSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete "${deleteTarget.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </main>
  )
}
