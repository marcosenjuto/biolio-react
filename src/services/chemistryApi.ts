import axios from 'axios'
import type { Molecule } from '@/types/chemistry'

const PUBCHEM_API = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug'

/**
 * Search PubChem by compound name and get SMILES
 */
export async function searchPubChemByName(name: string): Promise<Molecule | null> {
  try {
    // Get CID by name
    const cidResponse = await axios.get(
      `${PUBCHEM_API}/compound/name/${encodeURIComponent(name)}/cids/JSON`
    )
    
    const cid = cidResponse.data.IdentifierList.CID[0]
    
    // Get compound properties including SMILES
    const propsResponse = await axios.get(
      `${PUBCHEM_API}/compound/cid/${cid}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,InChI,InChIKey/JSON`
    )
    
    const props = propsResponse.data.PropertyTable.Properties[0]
    
    return {
      id: `pubchem_${cid}`,
      cid: cid,
      type: 'small-molecule',
      names: {
        iupac: name,
        common: [name],
      },
      structure: {
        smiles: props.CanonicalSMILES,
        inchi: props.InChI,
        inchikey: props.InChIKey,
        molecularFormula: props.MolecularFormula,
      },
      molecular: {
        weight: props.MolecularWeight,
        exactMass: 0,
        monoisotopicMass: 0,
      },
      sources: ['pubchem'],
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    console.error(`Error fetching from PubChem for ${name}:`, error)
    return null
  }
}

/**
 * Get compound details from PubChem by CID
 */
export async function getPubChemByCID(cid: number): Promise<Molecule | null> {
  try {
    const response = await axios.get(
      `${PUBCHEM_API}/compound/cid/${cid}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,InChI,InChIKey/JSON`
    )
    
    const props = response.data.PropertyTable.Properties[0]
    
    return {
      id: `pubchem_${cid}`,
      cid: cid,
      type: 'small-molecule',
      names: {
        iupac: `CID ${cid}`,
        common: [`CID ${cid}`],
      },
      structure: {
        smiles: props.CanonicalSMILES,
        inchi: props.InChI,
        inchikey: props.InChIKey,
        molecularFormula: props.MolecularFormula,
      },
      molecular: {
        weight: props.MolecularWeight,
        exactMass: 0,
        monoisotopicMass: 0,
      },
      sources: ['pubchem'],
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    console.error(`Error fetching PubChem CID ${cid}:`, error)
    return null
  }
}

/**
 * Convert common chemical names to SMILES
 * This is a local cache for common reagents to avoid API calls
 */
export const commonCompounds: Record<string, string> = {
  // Alcohols
  'methanol': 'CO',
  'ethanol': 'CCO',
  'propanol': 'CCCO',
  'isopropanol': 'CC(C)O',
  'butanol': 'CCCCO',
  'tert-butanol': 'CC(C)(C)O',
  
  // Aldehydes
  'formaldehyde': 'C=O',
  'acetaldehyde': 'CC=O',
  'benzaldehyde': 'O=Cc1ccccc1',
  
  // Ketones
  'acetone': 'CC(=O)C',
  'butanone': 'CCC(=O)C',
  'cyclohexanone': 'O=C1CCCCC1',
  
  // Acids
  'formic acid': 'C(=O)O',
  'acetic acid': 'CC(=O)O',
  'benzoic acid': 'O=C(O)c1ccccc1',
  
  // Reagents
  'water': 'O',
  'ammonia': 'N',
  'hydrogen': '[H][H]',
  'oxygen': 'O=O',
  'ozone': '[O-][O+]=O',
  'carbon dioxide': 'O=C=O',
  
  // Common organic reagents
  'PCC': 'O=Cl(=O)c1ccccc1', // Simplified representation
  'LiAlH4': '[Li+].[AlH4-]',
  'NaBH4': '[Na+].[BH4-]',
  'H2NNH2': 'NN', // Hydrazine
}

/**
 * Get SMILES for a compound, checking local cache first
 */
export async function getSMILES(name: string): Promise<string | null> {
  // Check local cache first
  const normalized = name.toLowerCase().trim()
  if (commonCompounds[normalized]) {
    return commonCompounds[normalized]
  }
  
  // Try PubChem
  const compound = await searchPubChemByName(name)
  return compound?.structure?.smiles || null
}

/**
 * Batch fetch multiple compounds
 */
export async function batchGetSMILES(names: string[]): Promise<Record<string, string>> {
  const results: Record<string, string> = {}
  
  for (const name of names) {
    const smiles = await getSMILES(name)
    if (smiles) {
      results[name] = smiles
    }
  }
  
  return results
}
