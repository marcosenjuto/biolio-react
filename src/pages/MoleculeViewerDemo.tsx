import { useState } from 'react'
import KetcherMoleculeViewer from '@/components/chemistry/KetcherMoleculeViewer'
import Molecule3DViewer from '@/components/chemistry/Molecule3DViewer'
import Card from '@/components/ui/Card'
import { useLanguageStore } from '@/store/languageStore'

function MoleculeViewerDemo() {
  const { t } = useLanguageStore()
  const [selectedSMILES, setSelectedSMILES] = useState('C')
  
  const exampleMolecules = [
    { name: 'Methane', smiles: 'C' },
    { name: 'Ethanol', smiles: 'CCO' },
    { name: 'Benzene', smiles: 'c1ccccc1' },
    { name: 'Aspirin', smiles: 'CC(=O)Oc1ccccc1C(=O)O' },
    { name: 'Caffeine', smiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C' },
  ]

  return (
    <div className="molecule-viewer-demo bg-gray-50 p-6">
      <div className="molecule-demo-container max-w-7xl mx-auto">
        <h1 className="molecule-demo-title text-3xl font-bold text-gray-900 mb-6">
          {t.moleculeDemo.title}
        </h1>

        {/* Molecule Selector */}
        <Card className="molecule-selector-card mb-6">
          <h2 className="molecule-selector-title text-xl font-semibold mb-4">{t.moleculeDemo.selectMolecule}</h2>
          <div className="molecule-selector-buttons flex flex-wrap gap-2">
            {exampleMolecules.map((mol) => (
              <button
                key={mol.smiles}
                onClick={() => setSelectedSMILES(mol.smiles)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedSMILES === mol.smiles
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary-500'
                }`}
              >
                {mol.name}
              </button>
            ))}
          </div>
          <div className="molecule-selector-input mt-4">
            <label className="molecule-selector-label block text-sm font-medium text-gray-700 mb-2">
              {t.moleculeDemo.customSmiles}
            </label>
            <input
              type="text"
              value={selectedSMILES}
              onChange={(e) => setSelectedSMILES(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t.moleculeDemo.enterSmiles}
            />
          </div>
        </Card>

        {/* Viewers Grid */}
        <div className="molecule-viewer-grid grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ketcher 2D Viewer */}
          <Card className="molecule-viewer-card">
            <h2 className="molecule-viewer-title text-xl font-semibold mb-4">
              {t.moleculeDemo.ketcher2DTitle}
            </h2>
            <p className="molecule-viewer-description text-sm text-gray-600 mb-4">
              {t.moleculeDemo.ketcher2DDesc}
            </p>
            <KetcherMoleculeViewer
              smiles={selectedSMILES}
              width={500}
              height={400}
            />
          </Card>

          {/* 3DMol.js 3D Viewer */}
          <Card className="molecule-viewer-card">
            <h2 className="molecule-viewer-title text-xl font-semibold mb-4">
              {t.moleculeDemo.threeDmolTitle}
            </h2>
            <p className="molecule-viewer-description text-sm text-gray-600 mb-4">
              {t.moleculeDemo.threeDmolDesc}
            </p>
            <Molecule3DViewer
              smiles={selectedSMILES}
              width={500}
              height={400}
              spin={true}
              spinSpeed={0.5}
            />
          </Card>
        </div>

        {/* Information */}
        <Card className="molecule-info-card mt-6">
          <h2 className="molecule-info-title text-xl font-semibold mb-4">{t.moleculeDemo.aboutViewers}</h2>
          <div className="molecule-info-content space-y-4 text-sm text-gray-700">
            <div className="molecule-info-block">
              <h3 className="molecule-info-heading font-semibold text-gray-900 mb-2">{t.moleculeDemo.ketcherViewer}</h3>
              <ul className="molecule-info-list list-disc list-inside space-y-1 ml-2">
                {t.moleculeDemo.ketcherFeatures.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </div>
            <div className="molecule-info-block">
              <h3 className="molecule-info-heading font-semibold text-gray-900 mb-2">{t.moleculeDemo.threeDmolViewer}</h3>
              <ul className="molecule-info-list list-disc list-inside space-y-1 ml-2">
                {t.moleculeDemo.threeDmolFeatures.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default MoleculeViewerDemo
