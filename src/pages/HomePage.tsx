import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

function HomePage() {

  return (
    <div className="home-page min-h-screen">
      {/* Hero Section */}
      <section className="hero-section bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="hero-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hero-content text-center">
            <h1 className="hero-title text-5xl md:text-6xl font-bold mb-6">
              Welcome to bioblio
            </h1>
            <p className="hero-subtitle text-xl md:text-2xl mb-8 text-primary-100">
              Explore organic chemistry reactions with molecular visualization
            </p>
            <div className="hero-actions flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/library" className="hero-library-link">
                <Button size="lg" variant="secondary" className="library-button">
                  Chemistry Library
                </Button>
              </Link>
              <Link to="/profile" className="hero-profile-link">
                <Button size="lg" variant="outline" className="profile-button bg-white text-primary-600 hover:bg-primary-50">
                  View Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Chemistry Library Section */}
      <section className="chemistry-section py-16 bg-white">
        <div className="chemistry-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="chemistry-header text-center mb-12">
            <h2 className="chemistry-title text-3xl font-bold mb-4">Library</h2>
            <p className="chemistry-subtitle text-xl text-gray-600">
              Explore comprehensive organic reactions with molecular visualization
            </p>
          </div>
          <div className="chemistry-stats grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <Card className="stat-card">
              <div className="stat-content text-center">
                <div className="stat-number text-4xl font-bold text-primary-600 mb-2">60+</div>
                <p className="stat-label text-gray-600">Organic Reactions</p>
              </div>
            </Card>
            <Card className="stat-card">
              <div className="stat-content text-center">
                <div className="stat-number text-4xl font-bold text-primary-600 mb-2">10</div>
                <p className="stat-label text-gray-600">Reaction Categories</p>
              </div>
            </Card>
            <Card className="stat-card">
              <div className="stat-content text-center">
                <div className="stat-number text-4xl font-bold text-primary-600 mb-2">100%</div>
                <p className="stat-label text-gray-600">SMILES Notation</p>
              </div>
            </Card>
          </div>
          <div className="chemistry-action text-center">
            <Link to="/library" className="explore-library-link">
              <Button size="lg" className="explore-button">Explore Chemistry Library</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section py-16 bg-gray-50">
        <div className="about-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="about-title text-3xl font-bold mb-4">About This Project</h2>
          <p className="about-text text-xl text-gray-600 mb-8">
            A comprehensive chemistry library with molecular visualization powered by RDKit and Kekule.js
          </p>
          <Link to="/profile" className="learn-more-link">
            <Button size="lg" className="learn-more-button">Learn More</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage
