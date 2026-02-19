import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/',
})

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const register = (data) => api.post('/auth/register', data)

export const login = (email, password) => {
  const form = new URLSearchParams()
  form.append('username', email)
  form.append('password', password)
  return api.post('/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

export const getMe = () => api.get('/auth/me')

// ─── Plant Scan ───────────────────────────────────────────────────────────────

export const scanPlant = (imageFile) => {
  const formData = new FormData()
  formData.append('file', imageFile)
  return api.post('/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// ─── History ──────────────────────────────────────────────────────────────────

export const getHistory = () => api.get('/history')

export default api
