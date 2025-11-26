import { Link, useLocation } from 'react-router-dom'

function Navigation() {
  const location = useLocation()

  const links = [
    {
      path: '/',
      label: 'Home',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      path: '/library',
      label: 'Chemistry',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    },
    {
      path: '/ai-chat',
      label: 'Biopilot',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      )
    }
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* Desktop Sidebar - Left */}
      <nav className="hidden md:flex fixed left-0 top-0 h-screen w-14 bg-white shadow-lg flex-col items-center py-8 z-50">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-primary-600 hover:text-primary-700 mb-16"
        >
          B
        </Link>

        {/* Navigation Links */}
        <div className="flex flex-col gap-6 flex-1">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                isActive(link.path)
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
              }`}
              title={link.label}
            >
              {link.icon}
              <span className="text-xs font-medium">{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
        <div className="flex justify-around items-center h-12">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center justify-center gap-0 px-4 py-2 flex-1 transition-colors ${
                isActive(link.path)
                  ? 'text-primary-600'
                  : 'text-gray-600'
              }`}
            >
              {link.icon}
              <span className="text-xs font-medium">{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}

export default Navigation
