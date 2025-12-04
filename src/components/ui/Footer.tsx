import { Link } from 'react-router-dom'
import { useLanguageStore } from '@/store/languageStore'

function Footer() {
  const currentYear = new Date().getFullYear()
  const { t } = useLanguageStore()

  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">
              © {currentYear} bioblio. {t.footer.rights}
            </p>
          </div>
          <div className="flex space-x-6">
            <Link
              to="/contact"
              className="hover:text-primary-400 transition-colors"
            >
              {t.footer.contact}
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-400 transition-colors"
            >
              {t.footer.github}
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-400 transition-colors"
            >
              {t.footer.linkedin}
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-400 transition-colors"
            >
              {t.footer.twitter}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
