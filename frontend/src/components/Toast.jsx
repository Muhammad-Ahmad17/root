import { useEffect } from 'react'
import { FiCheckCircle, FiXCircle, FiX } from 'react-icons/fi'

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">
        {type === 'success' ? <FiCheckCircle size={18} /> : <FiXCircle size={18} />}
      </span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>
        <FiX size={16} />
      </button>
    </div>
  )
}
