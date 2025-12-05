import { useState } from 'react'
import Protein3DViewer from '@/components/chemistry/Protein3DViewer'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

function Protein3DViewerPage() {
  const [pdbId, setPdbId] = useState('1UBQ')
  const [inputValue, setInputValue] = useState('1UBQ')
  const [uploadedPDB, setUploadedPDB] = useState<string | null>(null)

  const popularProteins = [
    { id: '1UBQ', name: 'Ubiquitin', description: 'Small regulatory protein' },
    { id: '1CRN', name: 'Crambin', description: 'Plant seed protein' },
    { id: '1MBN', name: 'Myoglobin', description: 'Oxygen-binding protein' },
    { id: '2HHB', name: 'Hemoglobin', description: 'Oxygen transport protein' },
    { id: '1LYZ', name: 'Lysozyme', description: 'Antibacterial enzyme' },
    { id: '3BEC', name: 'Insulin', description: 'Metabolic hormone' },
  ]

  const handleLoadPDB = () => {
    if (inputValue.trim()) {
      setPdbId(inputValue.trim())
      setUploadedPDB(null)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setUploadedPDB(content)
        setPdbId('')
      }
      reader.readAsText(file)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLoadPDB()
    }
  }

  return (
    <div className="protein-viewer-page container mx-auto px-4 py-8">
      <div className="protein-viewer-container max-w-7xl mx-auto">
        {/* Header */}
        <div className="protein-viewer-header mb-8">
          <h1 className="protein-viewer-title text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Protein 3D Viewer
          </h1>
          <p className="protein-viewer-subtitle text-gray-600">
            Visualize protein structures from PDB database or upload your own PDB files
          </p>
        </div>

        <div className="protein-viewer-grid grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="protein-viewer-controls lg:col-span-1 space-y-6">
            {/* PDB ID Input */}
            <Card className="protein-load-card">
              <h2 className="protein-card-title text-lg font-semibold text-gray-800 mb-4">Load by PDB ID</h2>
              <div className="protein-load-body space-y-3">
                <div className="protein-load-row flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Enter PDB ID (e.g., 1UBQ)"
                    className="flex-1 uppercase"
                  />
                  <Button onClick={handleLoadPDB} className="protein-load-button px-4">
                    Load
                  </Button>
                </div>
                <p className="protein-load-helper text-xs text-gray-500">
                  Enter a 4-character PDB identifier from{' '}
                  <a
                    href="https://www.rcsb.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    RCSB PDB
                  </a>
                </p>
              </div>
            </Card>

            {/* File Upload */}
            <Card className="protein-upload-card">
              <h2 className="protein-card-title text-lg font-semibold text-gray-800 mb-4">Upload PDB File</h2>
              <div className="protein-upload-body">
                <input
                  type="file"
                  accept=".pdb"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                <p className="protein-upload-helper text-xs text-gray-500 mt-2">
                  Upload your own PDB file for visualization
                </p>
              </div>
            </Card>

            {/* Popular Proteins */}
            <Card className="protein-popular-card">
              <h2 className="protein-card-title text-lg font-semibold text-gray-800 mb-4">Popular Proteins</h2>
              <div className="protein-popular-list space-y-2">
                {popularProteins.map((protein) => (
                  <button
                    key={protein.id}
                    onClick={() => {
                      setInputValue(protein.id)
                      setPdbId(protein.id)
                      setUploadedPDB(null)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      pdbId === protein.id && !uploadedPDB
                        ? 'bg-primary-100 text-primary-800'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="font-medium text-sm">{protein.name}</div>
                    <div className="text-xs text-gray-500">
                      {protein.id} - {protein.description}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Viewer Panel */}
          <div className="protein-viewer-panel lg:col-span-2">
            <Card className="protein-viewer-card p-6">
              <Protein3DViewer
                pdbId={uploadedPDB ? undefined : pdbId}
                pdbData={uploadedPDB || undefined}
                width={700}
                height={600}
                style="cartoon"
                colorScheme="spectrum"
                spin={false}
                spinSpeed={0.5}
                showSurface={false}
                backgroundColor="0xffffff"
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Protein3DViewerPage
