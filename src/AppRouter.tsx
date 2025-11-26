import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/ui/Layout'
import HomePage from '@/pages/HomePage'
import ProfilePage from '@/pages/ProfilePage'
import LibraryPage from '@/pages/LibraryPage'
import ContactPage from '@/pages/ContactPage'
import AIChatPage from '@/pages/AIChatPage'
import Protein3DViewerPage from '@/pages/Protein3DViewerPage'
import NotFoundPage from '@/pages/NotFoundPage'

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="ai-chat" element={<AIChatPage />} />
        <Route path="protein-viewer" element={<Protein3DViewerPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default AppRouter
