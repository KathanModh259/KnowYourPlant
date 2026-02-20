import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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

export const register = (data) => api.post('/auth/signup', { name: data.username, email: data.email, password: data.password })

export const login = (email, password) => {
  // Backend expects JSON schema: UserLogin containing email and password
  return api.post('/auth/login', { email, password })
}

export const loginWithGoogle = (token) => api.post('/auth/google', { token })

export const getMe = () => api.get('/auth/me')

// ─── Plant Scan ───────────────────────────────────────────────────────────────

export const scanPlant = (imageFile) => {
  const formData = new FormData()
  formData.append('file', imageFile)
  return api.post('/predict-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// ─── History ──────────────────────────────────────────────────────────────────

export const getHistory = () => api.get('/history')

export default api
