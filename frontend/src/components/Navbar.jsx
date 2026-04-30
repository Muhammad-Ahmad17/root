import { FiUsers } from 'react-icons/fi'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <FiUsers size={22} />
        <span>UserBoard</span>
      </div>
      <p className="navbar-subtitle">Manage your users with ease</p>
    </nav>
  )
}
