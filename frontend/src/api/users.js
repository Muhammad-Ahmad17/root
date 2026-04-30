const BASE = '/api/users'

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Request failed')
  return json
}

export const getAllUsers = () => request(BASE)

export const getUserById = (id) => request(`${BASE}/${id}`)

export const createUser = (data) =>
  request(BASE, { method: 'POST', body: JSON.stringify(data) })

export const updateUser = (id, data) =>
  request(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteUser = (id) =>
  request(`${BASE}/${id}`, { method: 'DELETE' })
