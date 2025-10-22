# Chemistry Library - Biolio

## Overview

The Chemistry Library is a comprehensive organic chemistry reaction database integrated into the Biolio application. It features molecular visualization using Kekule.js and provides an intuitive interface to explore and search through organic reactions.

## Features

### 🧪 **60+ Organic Reactions**
- Oxidation reactions
- Reduction reactions
- Grignard reactions
- Aldol condensations
- Esterifications
- And many more!

### 🔬 **Molecular Visualization**
- Real-time rendering of chemical structures using **Kekule.js**
- SMILES notation for all compounds
- Interactive molecule viewers
- Reaction scheme visualization

### 🔍 **Advanced Search & Filtering**
- Search by reaction name, description, or tags
- Filter by reaction category (Oxidation, Reduction, Addition, etc.)
- Quick category pills for fast navigation
- Real-time results

### 📊 **Reaction Categories**
1. **Oxidation** - Alcohol oxidations, ozonolysis, etc.
2. **Reduction** - LiAlH₄, NaBH₄, DIBAH reductions
3. **Addition** - Acetal formations, hydration reactions
4. **Substitution** - Acid chloride formations, esterifications
5. **Condensation** - Aldol, Fischer esterification
6. **Grignard** - Organometallic reactions
7. **Hydrolysis** - Ester, amide, nitrile hydrolysis
8. **Dehydration** - Amide to nitrile
9. **Olefination** - Wittig reaction
10. **Special Reactions** - Clemmensen, Wolff-Kishner, Baeyer-Villiger

## Data Sources

### **SMILES Notation**
The application uses SMILES (Simplified Molecular Input Line Entry System) notation for representing chemical structures:
- **Built-in library** of common organic compounds
- **PubChem API** integration for fetching compound data
- **Manual curation** of reaction-specific compounds

### **External APIs**
- **PubChem** (https://pubchem.ncbi.nlm.nih.gov) - Primary source for compound data
- **ChEBI** (optional) - European Bioinformatics Institute chemical database
- **ORD** (optional) - Open Reaction Database

## Technology Stack

### **Frontend**
- React 18 + TypeScript
- TailwindCSS for styling
- Zustand for state management
- React Router for navigation

### **Chemical Visualization**
- **Kekule.js** - JavaScript library for chemical informatics
  - Molecule rendering
  - SMILES parsing
  - 2D structure display
  - Chemical reaction visualization

### **Data Management**
- Local reactions database (60+ reactions)
- Axios for API calls
- TypeScript interfaces for type safety

## File Structure

```
src/
├── components/
│   └── chemistry/
│       ├── MoleculeViewer.tsx      # Kekule.js wrapper for molecule rendering
│       ├── ReactionViewer.tsx      # Full reaction display with conditions
│       └── ReactionCard.tsx        # Compact reaction card
├── data/
│   └── reactionsDatabase.ts        # Complete reactions database
├── pages/
│   └── LibraryPage.tsx            # Main library page
├── services/
│   └── chemistryApi.ts            # PubChem/ChEBI API integration
├── store/
│   └── chemistryStore.ts          # Zustand store for reactions
└── types/
    └── chemistry.ts                # TypeScript interfaces
```

## Usage

### **Viewing Reactions**
1. Navigate to "Chemistry Library" in the menu
2. Browse all reactions or filter by category
3. Click on any reaction card to see details
4. View molecular structures rendered in real-time

### **Searching**
- Use the search bar to find specific reactions
- Search works on:
  - Reaction names
  - Descriptions
  - Tags
  - Reactant/product names

### **Filtering**
- Select a category from the dropdown
- Use category pills for quick filtering
- Combine search and filters for precise results

## Reaction Data Format

Each reaction includes:
- **Name** - Descriptive reaction name
- **Description** - Detailed explanation
- **Category** - Reaction type classification
- **Reactants** - Input compounds with SMILES
- **Products** - Output compounds with SMILES
- **Conditions** - Reaction conditions (temperature, solvent, etc.)
- **Tags** - Searchable keywords
- **SMARTS** (optional) - Reaction pattern

## Example Reaction

```typescript
{
  id: 'aldehyde_lialh4_alcohol',
  name: 'Aldehyde to Primary Alcohol (LiAlH₄)',
  description: 'Reduction of aldehyde to primary alcohol',
  category: 'Reduction',
  reactants: [
    {
      compound: {
        name: 'Aldehyde',
        smiles: 'CC=O'
      }
    },
    {
      compound: {
        name: 'LiAlH₄',
        smiles: '[Li+].[AlH4-]'
      }
    }
  ],
  products: [
    {
      compound: {
        name: 'Primary Alcohol',
        smiles: 'CCO'
      }
    }
  ],
  conditions: ['LiAlH₄', 'ether', 'then H₂O'],
  tags: ['reduction', 'aldehyde', 'alcohol', 'LiAlH4']
}
```

## Adding New Reactions

To add a new reaction to the database:

1. Open `src/data/reactionsDatabase.ts`
2. Add a new reaction object to the `reactionsDatabase` array:

```typescript
{
  id: 'unique_reaction_id',
  name: 'Reaction Name',
  description: 'Detailed description',
  category: 'Category',
  reactants: [
    createReagent('Compound Name', 'SMILES'),
  ],
  products: [
    createReagent('Product Name', 'SMILES'),
  ],
  conditions: ['condition1', 'condition2'],
  tags: ['tag1', 'tag2'],
}
```

3. The reaction will automatically appear in the library

## SMILES Resources

- [SMILES Tutorial](https://www.daylight.com/dayhtml/doc/theory/theory.smiles.html)
- [PubChem SMILES](https://pubchem.ncbi.nlm.nih.gov/)
- [SMILES Generator](https://www.cheminfo.org/flavor/malaria/Utilities/SMILES_generator___checker/index.html)

## Future Enhancements

- [ ] Add SMARTS patterns for all reactions
- [ ] Implement reaction mechanism animations
- [ ] Add 3D molecular visualization
- [ ] Export reactions as PDF or images
- [ ] User-submitted reactions
- [ ] Reaction yield predictions
- [ ] Literature references for each reaction
- [ ] Integration with more chemical databases (ChEMBL, ZINC)

## Performance

- **Fast rendering**: Kekule.js provides efficient 2D rendering
- **Optimized search**: Real-time filtering with Zustand
- **Lazy loading**: Molecule viewers load on demand
- **Caching**: PubChem results cached locally

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Edge
- Safari

## Credits

- **Kekule.js** - Chemical informatics library
- **PubChem** - Compound database
- **Organic Chemistry Reference** - Alexis Capo's reaction notes

## License

MIT License - See main project LICENSE file
