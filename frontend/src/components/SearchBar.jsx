import { FiSearch } from 'react-icons/fi'

export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar">
      <FiSearch size={16} className="search-icon" />
      <input
        type="text"
        placeholder="Search by name or email…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
