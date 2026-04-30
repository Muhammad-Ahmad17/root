import { FiEdit2, FiTrash2, FiMail, FiCalendar } from 'react-icons/fi'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getInitials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function UserCard({ user, onEdit, onDelete }) {
  return (
    <div className="user-card">
      <div className="user-card-header">
        <div className="avatar">{getInitials(user.name)}</div>
        <div className="user-info">
          <h3 className="user-name">{user.name}</h3>
          <span className="user-id">ID #{user.id}</span>
        </div>
      </div>

      <div className="user-card-body">
        <div className="user-detail">
          <FiMail size={14} />
          <span>{user.email}</span>
        </div>
        <div className="user-detail">
          <FiCalendar size={14} />
          <span>Joined {formatDate(user.created_at)}</span>
        </div>
      </div>

      <div className="user-card-footer">
        <button className="btn btn-sm btn-outline" onClick={() => onEdit(user)}>
          <FiEdit2 size={14} />
          Edit
        </button>
        <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(user)}>
          <FiTrash2 size={14} />
          Delete
        </button>
      </div>
    </div>
  )
}
