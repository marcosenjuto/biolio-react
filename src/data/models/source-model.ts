import { Names } from './names-model';

// --- Source Type Enum ---
export type SourceType = 
  | 'database'        // Public databases (PubChem, ChEMBL, ORD, etc.)
  | 'university'      // Academic institution
  | 'laboratory'      // Research lab
  | 'private'         // Individual researcher
  | 'company'         // Commercial entity
  | 'publication'     // Journal article, book
  | 'patent'          // Patent document
  | 'repository'      // Code/data repository (GitHub, Zenodo)
  | 'other';

// --- Source Interface ---
export interface Source {
  // Identification
  id: string;
  name: string;
  names?: Names;
  type: SourceType;
  
  // Classification & Organization
  institution?: string;      // Parent organization (e.g., "MIT", "Pfizer")
  department?: string;        // Specific department or division
  country?: string;
  city?: string;
  
  // Contact & Access
  url?: string;               // Primary website/landing page
  links?: {
    homepage?: string;
    api?: string;
    documentation?: string;
    repository?: string;
    publication?: string;
  };
  
  // Documentation
  description?: string;
  version?: string;           // Database/dataset version
  license?: string;           // Data license (CC-BY, MIT, proprietary, etc.)
  
  // Temporal Information
  date?: {
    created?: string;         // ISO 8601 date
    accessed?: string;        // When data was retrieved
    published?: string;       // Publication date
    lastModified?: string;    // Last update
  };
  
  // Attribution
  authors?: {
    name: string;
    email?: string;
    orcid?: string;
    affiliation?: string;
  }[];
  
  // Citations & References
  doi?: string;
  citation?: string;          // Formatted citation string
  references?: string[];      // Related DOIs, URLs
  
  // Quality & Reliability Metrics
  reliability?: 'verified' | 'peer-reviewed' | 'unverified' | 'computational';
  curationLevel?: 'manual' | 'automated' | 'mixed';
  
  // Additional Metadata
  tags?: string[];
  notes?: string;
}

// --- Source Reference (for embedding in other models) ---
export interface SourceReference {
  sourceId: string;           // Reference to Source.id
  recordId?: string;          // ID within the source (e.g., PubChem CID)
  dateAccessed?: string;      // When this specific record was accessed
  confidence?: number;        // 0-1 confidence score for this data
  notes?: string;             // Record-specific notes
}
