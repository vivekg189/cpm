import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import TopNavbar from './TopNavbar'

export default function MainLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('vv_sidebar_collapsed') === 'true'
  })
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('vv_sidebar_collapsed', isCollapsed)
  }, [isCollapsed])

  return (
    <div className={`app-layout-wrapper ${isCollapsed ? 'sidebar-is-collapsed' : ''}`}>
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <div className="app-main-content-area">
        <TopNavbar onOpenMobileMenu={() => setIsMobileOpen(true)} />
        <main className="app-page-container">
          {children}
        </main>
      </div>
    </div>
  )
}

