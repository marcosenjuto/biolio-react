import RDKitMoleculeViewer from './RDKitMoleculeViewer'
import MoleculeViewer from './MoleculeViewer'
import SimpleMoleculeViewer from './SimpleMoleculeViewer'
import KetcherMoleculeViewer from './KetcherMoleculeViewer'
import Molecule3DViewer from './Molecule3DViewer'

interface UnifiedMoleculeViewerProps {
  smiles: string
  width?: number | string
  height?: number | string
  className?: string
  viewerType?: 'rdkit' | 'kekule' | 'simple' | 'ketcher' | '3dmol'
  bondLength?: number
  spin?: boolean
  molString?: string
  sdfData?: string
}

function UnifiedMoleculeViewer({
  smiles,
  width = '100%',
  height = 'auto',
  className = '',
  viewerType = 'rdkit',
  bondLength = 40,
  spin,
  molString,
  sdfData
}: UnifiedMoleculeViewerProps) {
  // Wrapper style to ensure consistent sizing
  const wrapperStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    margin: 'auto'
  }

  // RDKit viewer
  if (viewerType === 'rdkit') {
    return (
      <div style={wrapperStyle}>
        <RDKitMoleculeViewer
          smiles={smiles}
          width={width}
          height={height}
          className={className}
          bondLength={bondLength}
        />
      </div>
    )
  }

  // 3D viewer
  if (viewerType === '3dmol') {
    return (
      <div style={wrapperStyle}>
        <Molecule3DViewer
          smiles={smiles}
          width={width}
          height={height}
          className={className}
          spin={spin}
          molString={molString}
          sdfData={sdfData}
        />
      </div>
    )
  }

  // Kekule viewer
  if (viewerType === 'kekule') {
    return (
      <div style={wrapperStyle}>
        <MoleculeViewer
          smiles={smiles}
          width={typeof width === 'number' ? width : 300}
          height={typeof height === 'number' ? height : 200}
          className={className}
        />
      </div>
    )
  }

  // Ketcher viewer
  if (viewerType === 'ketcher') {
    return (
      <div style={wrapperStyle}>
        <KetcherMoleculeViewer
          smiles={smiles}
          width={typeof width === 'number' ? width : 300}
          height={typeof height === 'number' ? height : 200}
          className={className}
        />
      </div>
    )
  }

  // Simple viewer (fallback)
  return (
    <div style={wrapperStyle}>
      <SimpleMoleculeViewer
        smiles={smiles}
        width={typeof width === 'number' ? width : 300}
        height={typeof height === 'number' ? height : 200}
        className={className}
      />
    </div>
  )
}

export default UnifiedMoleculeViewer
