import { Outlet, useLocation } from 'react-router-dom'
import Navigation from '@/components/ui/Navigation'
import Footer from '@/components/ui/Footer'
import { ReactNode } from 'react'

interface LayoutProps {
  children?: ReactNode
}

function Layout({ children }: LayoutProps) {
  const location = useLocation()
  
  // Show footer only on home and profile pages
  const showFooter = location.pathname === '/' || location.pathname === '/profile'

  return (
    <div className="app-layout min-h-screen flex flex-col">
      <Navigation />
      {/* Main content with padding for navigation */}
      <div className="app-content flex-1 flex flex-col md:ml-14 mb-12 md:mb-0">
        <main className="app-main flex-1">
          {children || <Outlet />}
        </main>
        {showFooter && (
          <div className="app-footer-container">
            <Footer />
          </div>
        )}
      </div>
    </div>
  )
}

export default Layout
