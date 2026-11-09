// API service — all requests go to /api (relative URL)
// This works correctly in both Vite dev (proxy) and Nginx production.
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// --- Vehicles ---
export const getVehicles = (params = {}) => api.get('/vehicles', { params }).then(r => r.data)
export const getVehicle = (id) => api.get(`/vehicles/${id}`).then(r => r.data)
export const createVehicle = (data) => api.post('/vehicles', data).then(r => r.data)
export const updateVehicle = (id, data) => api.put(`/vehicles/${id}`, data).then(r => r.data)
export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`).then(r => r.data)
export const getVehicleQrCode = (id) => api.get(`/vehicles/${id}/qrcode`).then(r => r.data)
export const getVehicleReportUrl = (id) => `/api/vehicles/${id}/report`

// --- Documents ---
export const getDocuments = (vehicleId) => {
  const params = vehicleId ? { vehicleId } : {}
  return api.get('/documents', { params }).then(r => r.data)
}
export const getDocument = (id) => api.get(`/documents/${id}`).then(r => r.data)
export const uploadDocument = (formData) =>
  api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  }).then(r => r.data)
export const deleteDocument = (id) => api.delete(`/documents/${id}`).then(r => r.data)
export const getDownloadUrl = (id) => `/api/documents/${id}/download`

// OCR & Duplicate Validation
export const scanDocumentOcr = (formData) =>
  api.post('/documents/scan-ocr', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  }).then(r => r.data)

export const validateDocument = (payload) =>
  api.post('/documents/validate', payload).then(r => r.data)

// --- Smart Expiry Calendar ---
export const getCalendarEvents = (params = {}) =>
  api.get('/calendar/events', { params }).then(r => r.data)

// --- Notifications System ---
export const getNotifications = (params = {}) =>
  api.get('/notifications', { params }).then(r => r.data)
export const markNotificationRead = (id) =>
  api.patch(`/notifications/${id}/read`).then(r => r.data)
export const markAllNotificationsRead = () =>
  api.post('/notifications/read-all').then(r => r.data)

// --- Maintenance Tracker ---
export const getMaintenanceRecords = (params = {}) =>
  api.get('/maintenance', { params }).then(r => r.data)
export const getMaintenanceRecord = (id) =>
  api.get(`/maintenance/${id}`).then(r => r.data)
export const createMaintenanceRecord = (data) =>
  api.post('/maintenance', data).then(r => r.data)
export const updateMaintenanceRecord = (id, data) =>
  api.put(`/maintenance/${id}`, data).then(r => r.data)
export const deleteMaintenanceRecord = (id) =>
  api.delete(`/maintenance/${id}`).then(r => r.data)

// --- Expenses & Analytics ---
export const getExpenses = (params = {}) =>
  api.get('/expenses', { params }).then(r => r.data)
export const getExpenseAnalytics = () =>
  api.get('/expenses/analytics').then(r => r.data)
export const createExpense = (data) =>
  api.post('/expenses', data).then(r => r.data)
export const deleteExpense = (id) =>
  api.delete(`/expenses/${id}`).then(r => r.data)

// --- Activity Logs ---
export const getActivityLogs = (params = {}) =>
  api.get('/activity', { params }).then(r => r.data)

// --- Dashboard & Health ---
export const getDashboardStats = () => api.get('/dashboard/stats').then(r => r.data)
export const getHealth = () => api.get('/health').then(r => r.data)

// Intercept to format errors consistently
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'Unknown error'
    const error = new Error(message)
    error.status = err.response?.status
    return Promise.reject(error)
  }
)
