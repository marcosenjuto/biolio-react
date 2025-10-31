# RDKit Real 3D Structure Generation

This document explains how to use the RDKit-based real 3D structure generation feature in the `Molecule3DViewer` component.

## Overview

The viewer now supports two methods for generating 3D molecular structures:

1. **PubChem API** (default): Fetches pre-computed 3D structures from PubChem
2. **RDKit Real 3D Generation** (new): Computes real 3D coordinates locally using RDKit with MMFF94/UFF force field optimization

## RDKit 3D Generation Method

The RDKit method follows these steps:

1. **Parse SMILES**: Create molecule object from SMILES string
2. **Add Hydrogens**: Add explicit hydrogen atoms for accurate geometry
3. **Embed 3D Coordinates**: Generate initial 3D conformation using random coordinates
4. **Force Field Optimization**: Optimize geometry using MMFF94 force field (fallback to UFF)
   - 500 optimization steps for accurate molecular geometry
   - Real bond lengths, angles, and torsions
5. **Export SDF**: Generate SDF format with optimized 3D coordinates

## Usage

### Basic Usage

```tsx
import Molecule3DViewer from './components/chemistry/Molecule3DViewer'

// Default: Use PubChem API
<Molecule3DViewer 
  smiles="CCO" 
  width={400} 
  height={400} 
/>

// Use RDKit real 3D generation
<Molecule3DViewer 
  smiles="CCO" 
  width={400} 
  height={400} 
  use3DGeneration={true}
/>
```

### With Compound Name

```tsx
// Fetch from PubChem by name
<Molecule3DViewer 
  compoundName="aspirin" 
  width={400} 
  height={400} 
/>

// Generate from SMILES with RDKit
<Molecule3DViewer 
  smiles="CC(=O)Oc1ccccc1C(=O)O" 
  compoundName="aspirin"
  use3DGeneration={true}
  onSdfDataFetched={(sdfData) => {
    console.log('Generated SDF:', sdfData)
  }}
/>
```

### With Caching

The component automatically caches generated SDF data in localStorage:

```tsx
<Molecule3DViewer 
  smiles="c1ccccc1" 
  compoundName="benzene"
  use3DGeneration={true}
  onSdfDataFetched={(sdfData) => {
    // Save to your database or state
    updateCompound({ sdfData })
  }}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `smiles` | `string?` | - | SMILES string of the molecule |
| `molString` | `string?` | - | Pre-existing SDF/MOL string (highest priority) |
| `compoundName` | `string?` | - | Compound name for fetching from PubChem or caching |
| `use3DGeneration` | `boolean` | `false` | Use RDKit real 3D generation instead of PubChem |
| `onSdfDataFetched` | `(sdf: string) => void` | - | Callback when SDF data is fetched/generated |
| `width` | `number` | `400` | Viewer width in pixels |
| `height` | `number` | `400` | Viewer height in pixels |
| `spin` | `boolean` | `false` | Enable continuous rotation |
| `spinSpeed` | `number` | `0.1` | Rotation speed |

## Priority Order

The component uses the following priority for molecule data:

1. **molString** - If provided, use directly
2. **compoundName** - Fetch from PubChem by name
3. **smiles** - Either:
   - Generate with RDKit (`use3DGeneration=true`)
   - Convert via PubChem API (default)

## When to Use RDKit 3D Generation

### Use RDKit When:
- You need accurate force field-optimized geometries
- Working with custom or novel molecules not in PubChem
- You want local computation without API dependency
- You need consistent, reproducible conformers

### Use PubChem When:
- Working with known compounds
- Need pre-validated structures
- Want faster loading (cached by PubChem)
- Prefer experimental or consensus structures

## Performance Considerations

- **RDKit Generation**: ~1-3 seconds for small molecules, longer for complex structures
- **PubChem API**: ~0.5-2 seconds depending on network
- **Caching**: Both methods cache results in localStorage (key: `sdf_${compoundName}`)

## Example: Complete Integration

```tsx
import { useState } from 'react'
import Molecule3DViewer from './components/chemistry/Molecule3DViewer'

function MoleculeDemo() {
  const [useRDKit, setUseRDKit] = useState(false)
  
  return (
    <div>
      <label>
        <input 
          type="checkbox" 
          checked={useRDKit}
          onChange={(e) => setUseRDKit(e.target.checked)}
        />
        Use RDKit Real 3D Generation
      </label>
      
      <Molecule3DViewer 
        smiles="CC(C)Cc1ccc(cc1)C(C)C(=O)O"
        compoundName="ibuprofen"
        use3DGeneration={useRDKit}
        width={500}
        height={500}
        spin={true}
        onSdfDataFetched={(sdf) => {
          console.log('SDF Data:', sdf)
        }}
      />
    </div>
  )
}
```

## Technical Details

### RDKit Configuration

- **Random Seed**: 42 (for reproducible conformers)
- **Optimization Method**: MMFF94 (with UFF fallback)
- **Optimization Steps**: 500
- **Hydrogens**: Explicit (for accurate geometry)

### Force Field

- **MMFF94**: Merck Molecular Force Field - high quality for organic molecules
- **UFF**: Universal Force Field - fallback for molecules MMFF94 cannot handle

### Error Handling

The component handles various error scenarios:
- Invalid SMILES strings
- RDKit loading failures
- Optimization failures
- Network errors (PubChem)

Errors are displayed in the viewer with helpful messages.
