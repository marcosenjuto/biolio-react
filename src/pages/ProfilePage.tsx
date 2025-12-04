import { useProfileStore } from '@/store/profileStore'
import { useLanguageStore } from '@/store/languageStore'
import Card from '@/components/ui/Card'
import { Language } from '@/types/language'

function ProfilePage() {
  const profile = useProfileStore((state) => state.profile)
  const { t, language, setLanguage } = useLanguageStore()

  const languages: { value: Language; label: string }[] = [
    { value: 'en', label: '🇬🇧 English' },
    { value: 'es', label: '🇪🇸 Español' },
    { value: 'it', label: '🇮🇹 Italiano' },
    { value: 'de', label: '🇩🇪 Deutsch' },
    { value: 'pt', label: '🇵🇹 Português' },
    { value: 'fr', label: '🇫🇷 Français' },
    { value: 'zh', label: '🇨🇳 中文' },
    { value: 'ar', label: '🇸🇦 العربية' },
  ]

  if (!profile) {
    return (
      <div className="profile-page-empty max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="empty-message text-center text-gray-600">{t.profile.emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="profile-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="profile-container max-w-3xl mx-auto">
        <Card className="profile-card">
          <div className="profile-header text-center mb-8">
            {profile.avatar && (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="profile-avatar w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
            )}
            <h1 className="profile-name text-4xl font-bold mb-2">{profile.name}</h1>
            <p className="profile-title text-xl text-primary-600 mb-4">{profile.title}</p>
          </div>

          <div className="profile-bio-section mb-8">
            <h2 className="bio-heading text-2xl font-semibold mb-4">{t.profile.aboutMe}</h2>
            <p className="bio-text text-gray-700 leading-relaxed">{profile.bio}</p>
          </div>

          <div className="profile-contact-section mb-8">
            <h2 className="contact-heading text-2xl font-semibold mb-4">{t.profile.contact}</h2>
            <p className="contact-email text-gray-700">
              <span className="email-label font-medium">{t.profile.email}</span>{' '}
              <a
                href={`mailto:${profile.email}`}
                className="email-link text-primary-600 hover:text-primary-700"
              >
                {profile.email}
              </a>
            </p>
          </div>

          <div className="profile-social-section mb-8">
            <h2 className="social-heading text-2xl font-semibold mb-4">{t.profile.socialLinks}</h2>
            <div className="social-links flex flex-wrap gap-4">
              {profile.social.github && (
                <a
                  href={profile.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link-github inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                >
                  GitHub
                </a>
              )}
              {profile.social.linkedin && (
                <a
                  href={profile.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link-linkedin inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  LinkedIn
                </a>
              )}
              {profile.social.twitter && (
                <a
                  href={profile.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link-twitter inline-flex items-center px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                >
                  Twitter
                </a>
              )}
              {profile.social.website && (
                <a
                  href={profile.social.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link-website inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Website
                </a>
              )}
            </div>
          </div>

          <div className="profile-language-section border-t pt-8 mt-8">
            <h2 className="language-heading text-2xl font-semibold mb-4">{t.profile.language}</h2>
            <div className="flex items-center gap-4">
              <label htmlFor="language-select" className="text-gray-700 font-medium">
                {t.profile.selectLanguage}:
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ProfilePage
