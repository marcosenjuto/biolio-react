import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'

function NotFoundPage() {
  return (
    <div className="not-found-page min-h-screen flex items-center justify-center bg-gray-50">
      <div className="not-found-content text-center">
        <h1 className="not-found-code text-9xl font-bold text-primary-600 mb-4">404</h1>
        <h2 className="not-found-title text-3xl font-semibold text-gray-800 mb-4">
          Page Not Found
        </h2>
        <p className="not-found-message text-xl text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="go-home-link">
          <Button size="lg" className="go-home-button">Go Home</Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
