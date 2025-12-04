import { Routes, Route, useLocation } from 'react-router-dom'
import { ReactNode, useEffect, useRef, useState, useLayoutEffect } from 'react'
import Layout from '@/components/ui/Layout'
import HomePage from '@/pages/HomePage'
import ProfilePage from '@/pages/ProfilePage'
import LibraryPage from '@/pages/LibraryPage'
import ContactPage from '@/pages/ContactPage'
import AIChatPage from '@/pages/AIChatPage'
import ReactionPage from '@/pages/ReactionPage'
import Protein3DViewerPage from '@/pages/Protein3DViewerPage'
import NotFoundPage from '@/pages/NotFoundPage'

interface KeepAlivePageProps {
  activePath: string
  path: string
  component: ReactNode
}

function KeepAlivePage({ activePath, path, component }: KeepAlivePageProps) {
  const isActive = activePath === path
  const [hasBeenVisited, setHasBeenVisited] = useState(isActive)
  const scrollPos = useRef(0)
  const isActiveRef = useRef(isActive)

  // Update ref immediately on render
  isActiveRef.current = isActive

  if (isActive && !hasBeenVisited) {
    setHasBeenVisited(true)
  }

  useEffect(() => {
    const handleScroll = () => {
      // Only save scroll position if the page is currently active
      // This prevents saving '0' when the page is hidden and scroll resets
      if (isActiveRef.current) {
        scrollPos.current = window.scrollY
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Restore scroll position when becoming active
  useLayoutEffect(() => {
    if (isActive && hasBeenVisited) {
      window.scrollTo(0, scrollPos.current)
    }
  }, [isActive, hasBeenVisited])

  if (!hasBeenVisited) return null

  return (
    <div style={{ display: isActive ? 'block' : 'none' }}>
      {component}
    </div>
  )
}

function PageManager() {
  const location = useLocation()
  const validPaths = ['/', '/profile', '/library', '/ai-chat', '/protein-viewer', '/contact']
  const isReactionPath = location.pathname.startsWith('/reaction/')
  const isKnownPath = validPaths.includes(location.pathname)

  return (
    <>
      <KeepAlivePage activePath={location.pathname} path="/" component={<HomePage />} />
      <KeepAlivePage activePath={location.pathname} path="/profile" component={<ProfilePage />} />
      <KeepAlivePage activePath={location.pathname} path="/library" component={<LibraryPage />} />
      <KeepAlivePage activePath={location.pathname} path="/ai-chat" component={<AIChatPage />} />
      <KeepAlivePage activePath={location.pathname} path="/protein-viewer" component={<Protein3DViewerPage />} />
      <KeepAlivePage activePath={location.pathname} path="/contact" component={<ContactPage />} />

      {!isKnownPath && !isReactionPath && <NotFoundPage />}
    </>
  )
}

function AppRouter() {
  return (
    <Layout>
      <PageManager />
      <Routes>
        <Route path="/reaction/:id" element={<ReactionPage />} />
        <Route path="*" element={<></>} />
      </Routes>
    </Layout>
  )
}

export default AppRouter
