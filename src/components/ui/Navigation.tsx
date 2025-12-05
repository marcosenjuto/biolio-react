import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguageStore } from '@/store/languageStore'

function Navigation() {
  const location = useLocation()
  const { t } = useLanguageStore()

  const indicatorTransition = { type: 'spring', stiffness: 420, damping: 32, mass: 0.8 }

  // {
  //   path: '/',
  //   label: 'Home',
  //   icon: (
  //     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  //     </svg>
  //   )
  // },
  const links = [
    {
      path: '/profile',
      label: t.navigation.profile,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      path: '/library',
      label: t.navigation.chemistry,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    },
    {
      path: '/ai-chat',
      label: t.navigation.biopilot,
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
      <nav className="app-sidebar navigation-desktop hidden md:flex fixed left-0 top-0 h-screen w-14 bg-white shadow-lg flex-col items-center py-8 z-50">
        {/* Logo */}
        <Link
          to="/"
          className="navigation-logo text-2xl font-bold text-primary-600 hover:text-primary-700 mb-16"
        >
          B
        </Link>

        {/* Navigation Links */}
        <div className="navigation-links flex flex-col gap-6 flex-1">
          {links.map((link) => {
            const active = isActive(link.path)

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`navigation-link relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-colors ${
                  active
                    ? 'text-primary-700'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
                title={link.label}
                aria-current={active ? 'page' : undefined}
              >
                <span className="navigation-link-shell relative flex flex-col items-center gap-1 w-full">
                  <AnimatePresence>
                    {active && (
                      <motion.span
                        layoutId="nav-active-desktop"
                        className="absolute inset-0 rounded-2xl bg-primary-50 shadow-[0_10px_30px_rgba(79,70,229,0.18)]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={indicatorTransition}
                      />
                    )}
                  </AnimatePresence>

                  <motion.span
                    className="navigation-link-content relative flex flex-col items-center gap-1"
                    animate={active ? { scale: 1, y: 0 } : { scale: 0.92, y: 2 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {link.icon}
                    <span className="text-xs font-medium">{link.label}</span>
                  </motion.span>
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="navigation-mobile md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
        <div className="navigation-mobile-list flex justify-around items-center h-12">
          {links.map((link) => {
            const active = isActive(link.path)

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`navigation-mobile-link relative flex flex-col items-center justify-center gap-0 px-4 py-2 flex-1 transition-colors ${
                  active ? 'text-primary-600' : 'text-gray-600'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <span className="navigation-mobile-shell relative flex flex-col items-center gap-0">
                  <AnimatePresence>
                    {active && (
                      <motion.span
                        layoutId="nav-active-mobile"
                        className="absolute inset-x-1 inset-y-0 rounded-2xl bg-primary-50"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={indicatorTransition}
                      />
                    )}
                  </AnimatePresence>

                  <motion.span
                    className="navigation-mobile-content relative flex flex-col items-center gap-0"
                    animate={active ? { scale: 1 } : { scale: 0.94 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {link.icon}
                    <span className="text-xs font-medium">{link.label}</span>
                  </motion.span>
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

export default Navigation
