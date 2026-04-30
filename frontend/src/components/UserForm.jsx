import { useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'

const empty = { name: '', email: '', password: '' }

export default function UserForm({ user, onSubmit, onClose }) {
  const isEdit = Boolean(user)
  const [form, setForm] = useState(isEdit ? { name: user.name, email: user.email, password: '' } : empty)
  const [submitting, setSubmitting] = useState(false)
  const [fieldError, setFieldError] = useState({})

  useEffect(() => {
    setForm(isEdit ? { name: user.name, email: user.email, password: '' } : empty)
    setFieldError({})
  }, [user, isEdit])

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address'
    if (!isEdit && !form.password.trim()) errs.password = 'Password is required'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setFieldError(errs)
    setSubmitting(true)
    try {
      const payload = isEdit
        ? { name: form.name, email: form.email }
        : form
      await onSubmit(payload)
    } finally {
      setSubmitting(false)
    }
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldError((prev) => ({ ...prev, [name]: '' }))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit User' : 'Add New User'}</h2>
          <button className="icon-btn" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Jane Doe"
              value={form.name}
              onChange={handleChange}
              className={fieldError.name ? 'input-error' : ''}
            />
            {fieldError.name && <span className="error-text">{fieldError.name}</span>}
          </div>

          <div className="field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="jane@example.com"
              value={form.email}
              onChange={handleChange}
              className={fieldError.email ? 'input-error' : ''}
            />
            {fieldError.email && <span className="error-text">{fieldError.email}</span>}
          </div>

          {!isEdit && (
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className={fieldError.password ? 'input-error' : ''}
              />
              {fieldError.password && <span className="error-text">{fieldError.password}</span>}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
