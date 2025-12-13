import { Molecule } from './molecule-model';
import { Names } from './names-model';

export interface FunctionalGroup {
  id: string;           // e.g., "aldehyde"
  name: string;         // e.g., "Aldehyde"
  names: Names;
  
  // Representations
  formula: string;      // e.g., "R-CHO"
  smiles: string;       // e.g., "C=O"

  // Descriptions
  description?: string;
  
  // Examples of molecules containing this group
  samples?: Molecule[];
}