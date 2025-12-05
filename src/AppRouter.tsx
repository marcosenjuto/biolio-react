import { Routes, Route, useLocation } from 'react-router-dom'
import { ReactNode, useEffect, useRef, useState, useLayoutEffect } from 'react'
import { motion } from 'framer-motion'
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

const pageMotionVariants = {
  hidden: { opacity: 0, filter: 'blur(8px)' },
  visible: { opacity: 1, filter: 'blur(0px)' },
}

const pageMotionTransition = { duration: 0.5, ease: [0.4, 0, 0.2, 1] }

function KeepAlivePage({ activePath, path, component }: KeepAlivePageProps) {
  const isActive = activePath === path
  const [hasBeenVisited, setHasBeenVisited] = useState(isActive)
  const scrollPos = useRef(0)
  const isActiveRef = useRef(isActive)
  const prevActiveRef = useRef(isActive)
  const hasRestoredRef = useRef(false)

  // Update ref immediately on render
  isActiveRef.current = isActive

  if (isActive && !hasBeenVisited) {
    setHasBeenVisited(true)
  }

  // Save scroll position when becoming inactive
  useEffect(() => {
    if (prevActiveRef.current && !isActive) {
      // Page is becoming inactive, save current scroll position
      scrollPos.current = window.scrollY
      hasRestoredRef.current = false
    }
    prevActiveRef.current = isActive
  }, [isActive])

  useEffect(() => {
    const handleScroll = () => {
      // Only save scroll position if the page is currently active
      if (isActiveRef.current) {
        scrollPos.current = window.scrollY
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Restore scroll position when becoming active (only once per activation)
  useLayoutEffect(() => {
    if (isActive && hasBeenVisited && !hasRestoredRef.current) {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPos.current)
        hasRestoredRef.current = true
      })
    }
  }, [isActive, hasBeenVisited])

  if (!hasBeenVisited) return null

  return (
    <motion.div
      layout
      initial={false}
      variants={pageMotionVariants}
      animate={isActive ? 'visible' : 'hidden'}
      transition={pageMotionTransition}
      className="page-transition-layer"
      style={{
        width: '100%',
        position: isActive ? 'relative' : 'absolute',
        inset: isActive ? undefined : 0,
        height: isActive ? 'auto' : '0',
        overflow: isActive ? 'visible' : 'hidden',
        pointerEvents: isActive ? 'auto' : 'none',
        zIndex: isActive ? 1 : 0,
        visibility: isActive ? 'visible' : 'hidden',
      }}
      aria-hidden={!isActive}
    >
      {component}
    </motion.div>
  )
}

function PageManager() {
  const location = useLocation()
  const validPaths = ['/', '/profile', '/library', '/ai-chat', '/protein-viewer', '/contact']
  const isReactionPath = location.pathname.startsWith('/reaction/')
  const isKnownPath = validPaths.includes(location.pathname)
  const prevLocationRef = useRef(location.pathname)
  const savedScrollRef = useRef<number>(0)

  // Save scroll position before hiding PageManager
  useEffect(() => {
    const wasVisible = !prevLocationRef.current.startsWith('/reaction/')
    const willBeHidden = isReactionPath

    if (wasVisible && willBeHidden) {
      // About to hide PageManager, save current scroll
      savedScrollRef.current = window.scrollY
    } else if (!wasVisible && !willBeHidden) {
      // PageManager becoming visible again, restore scroll
      requestAnimationFrame(() => {
        window.scrollTo(0, savedScrollRef.current)
      })
    }

    prevLocationRef.current = location.pathname
  }, [isReactionPath, location.pathname])

  return (
    <div 
      className="page-transition-stack"
      style={{
        display: isReactionPath ? 'none' : 'block'
      }}
    >
      <KeepAlivePage activePath={location.pathname} path="/" component={<HomePage />} />
      <KeepAlivePage activePath={location.pathname} path="/profile" component={<ProfilePage />} />
      <KeepAlivePage activePath={location.pathname} path="/library" component={<LibraryPage />} />
      <KeepAlivePage activePath={location.pathname} path="/ai-chat" component={<AIChatPage />} />
      <KeepAlivePage activePath={location.pathname} path="/protein-viewer" component={<Protein3DViewerPage />} />
      <KeepAlivePage activePath={location.pathname} path="/contact" component={<ContactPage />} />

      {!isKnownPath && !isReactionPath && (
        <motion.div
          layout
          variants={pageMotionVariants}
          initial="hidden"
          animate="visible"
          transition={pageMotionTransition}
          className="page-transition-layer"
        >
          <NotFoundPage />
        </motion.div>
      )}
    </div>
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
