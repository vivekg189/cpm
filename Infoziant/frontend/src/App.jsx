import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Dashboard from './pages/Dashboard'
import Vehicles from './pages/Vehicles'
import Documents from './pages/Documents'
import CalendarPage from './pages/Calendar'
import Maintenance from './pages/Maintenance'
import Expenses from './pages/Expenses'
import ActivityLog from './pages/ActivityLog'
import SystemStatus from './pages/SystemStatus'
import { ToastProvider } from './context/ToastContext'

export default function App() {
  return (
    <ToastProvider>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/activity" element={<ActivityLog />} />
          <Route path="/status" element={<SystemStatus />} />
        </Routes>
      </MainLayout>
    </ToastProvider>
  )
}
