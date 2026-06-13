import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { Molecule } from '@/types/molecule-model'
import moleculesData from '@/data/molecules.json'
import UnifiedMoleculeViewer from '@/components/chemistry/UnifiedMoleculeViewer'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/ui/PageHeader'
import { useLanguageStore } from '@/store/languageStore'

function MoleculePage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { t } = useLanguageStore()
    const [molecule, setMolecule] = useState<Molecule | null>(null)
    const [viewerMode, setViewerMode] = useState<'2d' | '3d'>('2d')

    useEffect(() => {
        if (id) {
            const found = (moleculesData as Molecule[]).find((m) => m.id === id)
            if (found) {
                setMolecule(found)
            }
        }
    }, [id])

    if (!molecule) {
        return (
            <div className="molecule-page min-h-screen bg-gray-50 p-4">
                <div className="max-w-4xl mx-auto">
                    <Card className="p-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t.molecule.notFound}</h2>
                        <Button onClick={() => navigate('/library')}>{t.common.backToLibrary}</Button>
                    </Card>
                </div>
            </div>
        )
    }

    // Get primary name
    const getPrimaryName = () => {
        const iupacName = molecule.names?.find(n => n.type === 'iupac')
        const commonName = molecule.names?.find(n => n.type === 'common')
        return iupacName?.value || commonName?.value || molecule.id
    }

    // Get alternative names
    const getAlternativeNames = () => {
        return molecule.names?.filter((_n, idx) => idx > 0).map(n => n.value) || []
    }

    return (
        <div className="molecule-page min-h-screen bg-gray-50 pb-16">
            <PageHeader
                title={getPrimaryName()}
                onBack={() => navigate('/library')}
                backButtonVariant="secondary"
                backButtonClassName="text-gray-700 hover:text-primary-700"
                titleClassName="text-2xl font-bold text-gray-900"
            />
            <div className="max-w-6xl mx-auto px-4">
                {getAlternativeNames().length > 0 && (
                    <p className="text-center text-lg text-gray-600 mb-6">
                        {t.molecule.alsoKnownAs}: {getAlternativeNames().slice(0, 3).join(', ')}
                        {getAlternativeNames().length > 3 && '...'}
                    </p>
                )}

                {/* Viewer Section */}
                <Card className="mb-6">
                    <div className="  ">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800">{t.molecule.structure}</h2>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => setViewerMode('2d')}
                                    className={`text-sm ${viewerMode === '2d' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                >
                                    {t.molecule.view2D}
                                </Button>
                                <Button
                                    onClick={() => setViewerMode('3d')}
                                    className={`text-sm ${viewerMode === '3d' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                >
                                    {t.molecule.view3D}
                                </Button>
                            </div>
                        </div>

                        <div className="viewer-container rounded-lg border border-gray-200">
                            {viewerMode === '2d' ? (
                                <div className="flex justify-center">
                                    <UnifiedMoleculeViewer
                                        smiles={molecule.structure?.smiles || ''}
                                        width="100%"
                                        height="auto"
                                        viewerType="rdkit"
                                        bondLength={40}
                                    />
                                </div>
                            ) : (
                                <div className="flex justify-center">
                                    <UnifiedMoleculeViewer
                                        smiles={molecule.structure?.smiles || ''}
                                        sdfData={molecule.structure?.structure3D?.data}
                                        width="100%"
                                        height="auto"
                                        viewerType="3dmol"
                                        spin={true}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Identifiers */}
                    <Card>
                        <div className="">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">{t.molecule.identifiers}</h3>
                            <div className="space-y-3">
                                {molecule.cid && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">{t.molecule.pubchemCid}:</span>
                                        <p className="text-gray-900 font-mono">{molecule.cid}</p>
                                    </div>
                                )}
                                {molecule.structure?.smiles && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">{t.molecule.smiles}:</span>
                                        <p className="text-gray-900 font-mono text-sm break-all">{molecule.structure.smiles}</p>
                                    </div>
                                )}
                                {molecule.structure?.inchi && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">{t.molecule.inchi}:</span>
                                        <p className="text-gray-900 font-mono text-xs break-all">{molecule.structure.inchi}</p>
                                    </div>
                                )}
                                {molecule.structure?.inchikey && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">{t.molecule.inchiKey}:</span>
                                        <p className="text-gray-900 font-mono text-sm">{molecule.structure.inchikey}</p>
                                    </div>
                                )}
                                {molecule.structure?.molecularFormula && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">{t.molecule.molecularFormula}:</span>
                                        <p className="text-gray-900 font-mono">{molecule.structure.molecularFormula}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Physical Properties */}
                    <Card>
                        <div className="">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">{t.molecule.physicalProperties}</h3>
                            <div className="space-y-3">
                                {molecule.molecular?.weight && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">{t.molecule.molecularWeight}:</span>
                                        <p className="text-gray-900">{molecule.molecular.weight.toFixed(3)} g/mol</p>
                                    </div>
                                )}
                                {molecule.molecular?.exactMass && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">{t.molecule.exactMass}:</span>
                                        <p className="text-gray-900">{molecule.molecular.exactMass.toFixed(3)} g/mol</p>
                                    </div>
                                )}
                                {molecule.molecular?.monoisotopicMass && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">{t.molecule.monoisotopicMass}:</span>
                                        <p className="text-gray-900">{molecule.molecular.monoisotopicMass.toFixed(3)} g/mol</p>
                                    </div>
                                )}
                                {molecule.type && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">{t.molecule.type}:</span>
                                        <p className="text-gray-900 capitalize">{molecule.type.replace('-', ' ')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Names */}
                    {molecule.names && molecule.names.length > 0 && (
                        <Card className="md:col-span-2">
                            <div className="">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">{t.molecule.allNames}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {molecule.names.map((name, idx) => (
                                        <div key={idx} className="bg-gray-50 rounded">
                                            <span className="text-xs font-medium text-gray-500 uppercase">{name.type}</span>
                                            <p className="text-sm text-gray-900 mt-1">{name.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Functional Groups */}
                    {molecule.functionalGroups && molecule.functionalGroups.length > 0 && (
                        <Card className="md:col-span-2">
                            <div className="">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">{t.molecule.functionalGroups}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {molecule.functionalGroups.map((fg, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                                        >
                                            {typeof fg === 'string' ? fg : fg.name || fg.id}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Additional Info */}
                    {molecule.lastUpdated && (
                        <Card className="md:col-span-2">
                            <div className="">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">{t.molecule.additionalInfo}</h3>
                                <div>
                                    <span className="text-sm font-medium text-gray-600">{t.molecule.lastUpdated}:</span>
                                    <p className="text-gray-900">{new Date(molecule.lastUpdated).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* External Links */}
                {molecule.cid && (
                    <Card className="mt-6">
                        <div className="">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">{t.molecule.externalResources}</h3>
                            <div className="flex flex-wrap gap-3">
                                <a
                                    href={`https://pubchem.ncbi.nlm.nih.gov/compound/${molecule.cid}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                    {t.molecule.viewOnPubChem}
                                </a>
                                <a
                                    href={`https://www.chemspider.com/Search.aspx?q=${encodeURIComponent(molecule.structure?.inchikey || '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                >
                                    {t.molecule.searchOnChemSpider}
                                </a>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    )
}

export default MoleculePage
