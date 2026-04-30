import UserCard from './UserCard'
import { FiUsers } from 'react-icons/fi'

export default function UserList({ users, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="state-container">
        <div className="spinner" />
        <p>Loading users…</p>
      </div>
    )
  }

  if (!users.length) {
    return (
      <div className="state-container empty-state">
        <FiUsers size={48} className="empty-icon" />
        <h3>No users yet</h3>
        <p>Click "Add User" to get started.</p>
      </div>
    )
  }

  return (
    <div className="user-grid">
      {users.map((user) => (
        <UserCard key={user.id} user={user} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}
