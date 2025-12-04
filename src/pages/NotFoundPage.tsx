import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { useLanguageStore } from '@/store/languageStore'

function NotFoundPage() {
  const { t } = useLanguageStore()

  return (
    <div className="not-found-page min-h-screen flex items-center justify-center bg-gray-50">
      <div className="not-found-content text-center">
        <h1 className="not-found-code text-9xl font-bold text-primary-600 mb-4">404</h1>
        <h2 className="not-found-title text-3xl font-semibold text-gray-800 mb-4">
          {t.notFound.title}
        </h2>
        <p className="not-found-message text-xl text-gray-600 mb-8">
          {t.notFound.message}
        </p>
        <Link to="/" className="go-home-link">
          <Button size="lg" className="go-home-button">{t.notFound.goHome}</Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
