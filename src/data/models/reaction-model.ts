import { Molecule } from './molecule-model';
import { Names } from './names-model';
import { FunctionalGroup } from './functional-group-model';
import { SourceReference } from './source-model';

// --- Generic Reactant Interface ---
export interface GenericReactant {
  id: string;               // Unique identifier e.g., "generic-a1b2c3d4"
  type: 'generic';
  name: string;             // e.g., "Primary Alcohol", "Grignard Reagent"
  smarts?: string;          // Structural definition e.g., "[#6][OH]"
  smiles?: string;          // Representative example e.g., "CCO" for visualization
  functionalGroup?: FunctionalGroup; // Link to existing FG model
  functionalGroupId?: string; // ID reference to functional group
  rGroups?: string[];       // Labels for variable groups, e.g., ["R1", "R2"]
  description?: string;
}

// Union type for reaction participants
export type ReactionParticipant = Molecule | GenericReactant;

// --- Reagent Interface ---
// Extends ORDCompound to reuse reaction_role and amount (stoichiometry) logic
export interface Reagent extends ORDCompound {
  compound?: ReactionParticipant; // Optional: reference to molecule/generic reactant
  // stoichiometry?: number | string; // Kept for backward compatibility alongside amount
  conditions?: string;
  // reaction_role is inherited from ORDCompound (replaces the old 'role' field)
  displayLabel?: string; // Optional override for UI, e.g., "Nucleophile"
  alternatives?: ReactionParticipant[]; // For "A or B" scenarios (e.g., "Ketone or Aldehyde")
}

// --- Mechanism Interfaces ---
export interface MechanismStep {
  stepNumber: number;
  description: string;
  reactants: Reagent[]; // The species involved in this specific step
  products: Reagent[];
  electronFlow?: string; // Description or code for arrow pushing visualization
  image?: string;        // Path to a static image of the step
}

export interface ReactionMechanism {
  type: string;          // e.g., "SN2", "Nucleophilic Acyl Substitution"
  description: string;   // General description of the mechanism
  steps: MechanismStep[];
  energyProfile?: string; // Path to energy diagram
}

// --- Open Reaction Database (ORD) Schema Interfaces ---

export interface ORDIdentifier {
  type: string; // e.g., "REACTION_TYPE", "REACTION_CXSMILES", "SMILES", "NAME"
  value: string;
  details?: string;
}

export interface ORDCompound {
  identifiers: ORDIdentifier[];
  amount?: {
    mass?: { value: number; units: string };
    moles?: { value: number; units: string };
    volume?: { value: number; units: string };
  };
  reaction_role: 'REACTANT' | 'REAGENT' | 'SOLVENT' | 'CATALYST' | 'WORKUP' | 'INTERNAL_STANDARD' | 'PRODUCT';
  is_limiting?: boolean;
  preparations?: string[];
}

export interface ORDReactionInput {
  components: ORDCompound[];
  crude_components?: any[];
}

export interface ORDConditions {
  temperature?: {
    value: number;
    precision?: number;
    units: 'CELSIUS' | 'KELVIN';
  };
  pressure?: {
    value: number;
    precision?: number;
    units: 'PASCAL' | 'BAR' | 'ATMOSPHERE';
  };
  stirring?: {
    type?: string;
    rate?: { value: number; units: string };
  };
  illumination?: {
    type?: string;
    details?: string;
  };
  electrochemistry?: any;
  flow?: any;
  reflux?: boolean;
  ph?: number;
  conditions_are_dynamic?: boolean;
}

export interface ORDProductMeasurement {
  type: 'YIELD' | 'SELECTIVITY' | 'PURITY' | 'IDENTITY';
  details?: string;
  percentage?: { value: number; precision?: number };
  string_value?: string;
}

export interface ORDProductCompound extends ORDCompound {
  is_desired_product?: boolean;
  measurements?: ORDProductMeasurement[];
  isolated_color?: string;
  texture?: string;
}

export interface ORDReactionOutcome {
  reaction_time?: { value: number; units: string };
  conversion?: { value: number; precision?: number };
  products: ORDProductCompound[];
  analyses?: Record<string, any>;
}

export interface ORDProvenance {
  experimenter?: string;
  city?: string;
  experiment_start?: string;
  doi?: string;
  patent?: string;
  publication_url?: string;
  record_created?: {
    time: { value: string };
    person: { name: string; email: string };
  };
  record_modified?: any[];
}

export interface ORDTime {
  value: number;
  precision?: number;
  units: 'HOUR' | 'MINUTE' | 'SECOND';
}

export interface ORDData {
  value?: string;
  format?: string;
  bytes_value?: any; // Uint8Array or similar in JS
  description?: string;
}

export interface ORDVessel {
  type?: string;
  details?: string;
  material?: string;
  volume?: { value: number; units: string };
}

export interface ORDReactionSetup {
  vessel?: ORDVessel;
  is_automated?: boolean;
  automation_platform?: string;
  automation_code?: Record<string, ORDData>;
  environment?: {
    type?: string;
    details?: string;
  };
}

export interface ORDReactionObservation {
  time?: ORDTime;
  comment?: string;
  image?: ORDData;
}

export interface ORDReactionWorkup {
  type?: string; // e.g. "ADDITION", "TEMPERATURE", "WASH", "DRY", "FILTER", etc.
  details?: string;
  duration?: ORDTime;
  input?: ORDReactionInput;
  amount?: {
    mass?: { value: number; units: string };
    moles?: { value: number; units: string };
    volume?: { value: number; units: string };
  };
  temperature?: {
    value: number;
    units: 'CELSIUS' | 'KELVIN';
  };
  keep_phase?: string;
  stirring?: {
    type?: string;
    rate?: { value: number; units: string };
  };
  target_ph?: number;
  is_automated?: boolean;
}

export interface ORDReaction {
  reaction_id: string;
  identifiers?: ORDIdentifier[];
  inputs: Record<string, ORDReactionInput>; // e.g., "reactants": { ... }
  setup?: ORDReactionSetup;
  conditions?: ORDConditions;
  notes?: string;
  observations?: ORDReactionObservation[];
  workups?: ORDReactionWorkup[];
  outcomes?: ORDReactionOutcome[];
  provenance?: ORDProvenance;
}

// --- Bioblio Custom Extensions ---

export interface BioblioReaction {
  // Universal Identifiers
  id: string;
  name: string;
  names: Names;
  description: string; 
  category: string[];
  smarts?: string;
  
  // Visualization & Mechanism
  mechanism?: ReactionMechanism;
  trajectory?: string;       // "sn2Trajectory"
  reaction_arrows?: string;  // "sn2Arrows"
  
  // Helper fields for UI
  tags?: string[];
  label?: string;            // "R-OH+PCC->R-CHO"
  conditions?: string[];
  
  // Integration with internal models (Universal reactants/products)
  reactants: Reagent[];
  products: Reagent[];
  solvents?: Reagent[];

  // Extended Thermodynamics/Kinetics (Theoretical/Universal/ selected one)
  deltaG?: string;
  deltaH?: string;
  k?: string;
  temperature?: string;
  yield?: number;
  
  // External Resources
  links_ref?: string[];
  video_experiment?: string;
  
  // Data Provenance
  sources?: SourceReference[];

  // Experimental Samples (ORD Data)
  experimentalReactions: ORDReaction[];
}

