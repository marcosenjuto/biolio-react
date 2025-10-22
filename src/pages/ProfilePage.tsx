import { useProfileStore } from '@/store/profileStore'
import Card from '@/components/ui/Card'

function ProfilePage() {
  const profile = useProfileStore((state) => state.profile)

  if (!profile) {
    return (
      <div className="profile-page-empty max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="empty-message text-center text-gray-600">No profile information available.</p>
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
            <h2 className="bio-heading text-2xl font-semibold mb-4">About Me</h2>
            <p className="bio-text text-gray-700 leading-relaxed">{profile.bio}</p>
          </div>

          <div className="profile-contact-section mb-8">
            <h2 className="contact-heading text-2xl font-semibold mb-4">Contact</h2>
            <p className="contact-email text-gray-700">
              <span className="email-label font-medium">Email:</span>{' '}
              <a
                href={`mailto:${profile.email}`}
                className="email-link text-primary-600 hover:text-primary-700"
              >
                {profile.email}
              </a>
            </p>
          </div>

          <div className="profile-social-section">
            <h2 className="social-heading text-2xl font-semibold mb-4">Social Links</h2>
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
        </Card>
      </div>
    </div>
  )
}

export default ProfilePage
