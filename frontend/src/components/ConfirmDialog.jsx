import { FiAlertTriangle } from 'react-icons/fi'

export default function ConfirmDialog({ message, onConfirm, onCancel, loading }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box confirm-box" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon">
          <FiAlertTriangle size={32} />
        </div>
        <h3 className="confirm-title">Are you sure?</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
