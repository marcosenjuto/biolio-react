import type { Reaction, Molecule, Reagent } from '@/types/chemistry'

// Helper function to create a simple compound
function createCompound(name: string, smiles: string): Molecule {
  return {
    id: name.toLowerCase().replace(/\s+/g, '_'),
    type: 'small-molecule',
    names: {
      iupac: name,
      common: [name],
    },
    structure: {
      smiles,
      inchi: '',
      inchikey: '',
      molecularFormula: '',
    },
    molecular: {
      weight: 0,
      exactMass: 0,
      monoisotopicMass: 0,
    },
    sources: ['biolio-internal'],
    lastUpdated: new Date().toISOString(),
  }
}

// Helper to create a reagent
function createReagent(name: string, smiles: string, conditions?: string): Reagent {
  return {
    compound: createCompound(name, smiles),
    conditions,
  }
}

interface SimpleReaction {
  id: string
  name: string
  description: string
  category: string
  reactants: Reagent[]
  products: Reagent[]
  conditions?: string[]
  smarts?: string
  temperature?: string
  solvent?: string
  yield?: number
  references?: string[]
  tags?: string[]
}

/**
 * Organic Reactions Database
 * Based on the organic chemistry reactions reference
 */
const rawReactions: SimpleReaction[] = [
  // ========== ALCOHOL OXIDATIONS ==========
  {
    id: 'alcohol_pcc_aldehyde',
    name: 'Primary Alcohol to Aldehyde (PCC)',
    description: 'Oxidation of primary alcohol to aldehyde using PCC',
    category: 'Oxidation',
    reactants: [
      createReagent('Primary Alcohol', 'CCCO'),
      createReagent('PCC', '[Cl-].[O-][Cr](=O)(=O)O[C@H]1[CH]=[CH][CH]=[CH][N+]1=C'),
    ],
    products: [
      createReagent('Aldehyde', 'CCC=O'),
    ],
    conditions: ['PCC', 'CH2Cl2'],
    tags: ['oxidation', 'alcohol', 'aldehyde', 'PCC'],
  },
  {
    id: 'alcohol_dichromate_acid',
    name: 'Primary Alcohol to Carboxylic Acid',
    description: 'Oxidation of primary alcohol to carboxylic acid using dichromate',
    category: 'Oxidation',
    reactants: [
      createReagent('Primary Alcohol', 'CCCO'),
      createReagent('Dichromate', '[O-][Cr](=O)(=O)[O-].[O-][Cr](=O)(=O)[O-]'),
    ],
    products: [
      createReagent('Carboxylic Acid', 'CCC(=O)O'),
    ],
    conditions: ['Cr2O7²⁻', 'H⁺', 'heat'],
    tags: ['oxidation', 'alcohol', 'acid', 'dichromate'],
  },
  {
    id: 'secondary_alcohol_ketone',
    name: 'Secondary Alcohol to Ketone',
    description: 'Oxidation of secondary alcohol to ketone',
    category: 'Oxidation',
    reactants: [
      createReagent('Secondary Alcohol', 'CC(O)C'),
      createReagent('Dichromate', '[O-][Cr](=O)(=O)[O-].[O-][Cr](=O)(=O)[O-]'),
    ],
    products: [
      createReagent('Ketone', 'CC(=O)C'),
    ],
    conditions: ['Cr2O7²⁻', 'H⁺'],
    tags: ['oxidation', 'alcohol', 'ketone', 'dichromate'],
  },

  // ========== OZONOLYSIS ==========
  {
    id: 'alkene_ozonolysis_aldehyde',
    name: 'Alkene Ozonolysis to Aldehydes/Ketones',
    description: 'Ozonolysis of alkenes with reductive workup',
    category: 'Oxidation',
    reactants: [
      createReagent('Alkene', 'C=C'),
      createReagent('Ozone', '[O-][O+]=O'),
    ],
    products: [
      createReagent('Aldehyde/Ketone', 'C=O'),
    ],
    conditions: ['O₃', 'DCM', 'reductive workup'],
    tags: ['ozonolysis', 'alkene', 'aldehyde', 'ketone'],
  },
  {
    id: 'alkene_ozonolysis_acid',
    name: 'Alkene Ozonolysis to Acids/Ketones',
    description: 'Ozonolysis of alkenes with oxidative workup',
    category: 'Oxidation',
    reactants: [
      createReagent('Alkene', 'C=C'),
      createReagent('Ozone', '[O-][O+]=O'),
    ],
    products: [
      createReagent('Acid/Ketone', 'C(=O)O'),
    ],
    conditions: ['O₃', 'H₂O₂', 'oxidative workup'],
    tags: ['ozonolysis', 'alkene', 'acid', 'ketone'],
  },

  // ========== ACETAL FORMATION ==========
  {
    id: 'aldehyde_hemiacetal',
    name: 'Aldehyde to Hemiacetal',
    description: 'Reaction of aldehyde with one equivalent of alcohol',
    category: 'Addition',
    reactants: [
      createReagent('Aldehyde', 'CC=O'),
      createReagent('Alcohol', 'CO', '1 equiv'),
    ],
    products: [
      createReagent('Hemiacetal', 'CC(O)OC'),
    ],
    conditions: ['acid catalyst'],
    tags: ['addition', 'aldehyde', 'alcohol', 'hemiacetal'],
  },
  {
    id: 'aldehyde_acetal',
    name: 'Aldehyde to Acetal',
    description: 'Reaction of aldehyde with excess alcohol',
    category: 'Addition',
    reactants: [
      createReagent('Aldehyde', 'CC=O'),
      createReagent('Alcohol', 'CO', 'xs'),
    ],
    products: [
      createReagent('Acetal', 'CC(OC)OC'),
    ],
    conditions: ['acid catalyst', 'excess alcohol'],
    tags: ['addition', 'aldehyde', 'alcohol', 'acetal'],
  },

  // ========== REDUCTIONS ==========
  {
    id: 'aldehyde_lialh4_alcohol',
    name: 'Aldehyde to Primary Alcohol (LiAlH₄)',
    description: 'Reduction of aldehyde to primary alcohol',
    category: 'Reduction',
    reactants: [
      createReagent('Aldehyde', 'CC=O'),
      createReagent('LiAlH₄', '[Li+].[AlH4-]'),
    ],
    products: [
      createReagent('Primary Alcohol', 'CCO'),
    ],
    conditions: ['LiAlH₄', 'ether', 'then H₂O'],
    tags: ['reduction', 'aldehyde', 'alcohol', 'LiAlH4'],
  },
  {
    id: 'aldehyde_nabh4_alcohol',
    name: 'Aldehyde to Primary Alcohol (NaBH₄)',
    description: 'Reduction of aldehyde to primary alcohol with sodium borohydride',
    category: 'Reduction',
    reactants: [
      createReagent('Aldehyde', 'CC=O'),
      createReagent('NaBH₄', '[Na+].[BH4-]'),
    ],
    products: [
      createReagent('Primary Alcohol', 'CCO'),
    ],
    conditions: ['NaBH₄', 'MeOH'],
    tags: ['reduction', 'aldehyde', 'alcohol', 'NaBH4'],
  },
  {
    id: 'ketone_lialh4_alcohol',
    name: 'Ketone to Secondary Alcohol (LiAlH₄)',
    description: 'Reduction of ketone to secondary alcohol',
    category: 'Reduction',
    reactants: [
      createReagent('Ketone', 'CC(=O)C'),
      createReagent('LiAlH₄', '[Li+].[AlH4-]'),
    ],
    products: [
      createReagent('Secondary Alcohol', 'CC(O)C'),
    ],
    conditions: ['LiAlH₄', 'ether'],
    tags: ['reduction', 'ketone', 'alcohol', 'LiAlH4'],
  },
  {
    id: 'ketone_nabh4_alcohol',
    name: 'Ketone to Secondary Alcohol (NaBH₄)',
    description: 'Reduction of ketone to secondary alcohol',
    category: 'Reduction',
    reactants: [
      createReagent('Ketone', 'CC(=O)C'),
      createReagent('NaBH₄', '[Na+].[BH4-]'),
    ],
    products: [
      createReagent('Secondary Alcohol', 'CC(O)C'),
    ],
    conditions: ['NaBH₄', 'MeOH or EtOH'],
    tags: ['reduction', 'ketone', 'alcohol', 'NaBH4'],
  },

  // ========== GRIGNARD REACTIONS ==========
  {
    id: 'aldehyde_grignard_secondary_alcohol',
    name: 'Aldehyde + Grignard → Secondary Alcohol',
    description: 'Reaction of aldehyde with Grignard reagent',
    category: 'Grignard',
    reactants: [
      createReagent('Aldehyde', 'CC=O'),
      createReagent('Grignard', 'C[Mg+]Br', 'xs'),
    ],
    products: [
      createReagent('Secondary Alcohol', 'CC(O)C'),
    ],
    conditions: ['RMgX', 'ether', 'then H₃O⁺'],
    tags: ['grignard', 'aldehyde', 'alcohol'],
  },
  {
    id: 'ketone_grignard_tertiary_alcohol',
    name: 'Ketone + Grignard → Tertiary Alcohol',
    description: 'Reaction of ketone with Grignard reagent',
    category: 'Grignard',
    reactants: [
      createReagent('Ketone', 'CC(=O)C'),
      createReagent('Grignard', 'C[Mg+]Br', 'xs'),
    ],
    products: [
      createReagent('Tertiary Alcohol', 'CC(O)(C)C'),
    ],
    conditions: ['RMgX', 'ether', 'then H₃O⁺'],
    tags: ['grignard', 'ketone', 'alcohol'],
  },
  {
    id: 'grignard_co2_acid',
    name: 'Grignard + CO₂ → Carboxylic Acid',
    description: 'Carboxylation of Grignard reagent',
    category: 'Grignard',
    reactants: [
      createReagent('Grignard', 'C[Mg+]Br'),
      createReagent('Carbon Dioxide', 'O=C=O'),
    ],
    products: [
      createReagent('Carboxylic Acid', 'CC(=O)O'),
    ],
    conditions: ['CO₂', 'then H₃O⁺'],
    tags: ['grignard', 'carboxylation', 'acid'],
  },

  // ========== ALDOL REACTIONS ==========
  {
    id: 'aldol_condensation',
    name: 'Aldol Condensation',
    description: 'Aldol reaction between ketone with alpha hydrogen and aldehyde/ketone',
    category: 'Condensation',
    reactants: [
      createReagent('Ketone (with α-H)', 'CC(=O)C'),
      createReagent('Aldehyde/Ketone', 'CC=O'),
    ],
    products: [
      createReagent('β-Hydroxy Carbonyl', 'CC(O)CC(=O)C'),
    ],
    conditions: ['base (NaOH, KOH)'],
    tags: ['aldol', 'condensation', 'ketone', 'aldehyde'],
  },
  {
    id: 'aldol_condensation_dehydration',
    name: 'Aldol Condensation with Dehydration',
    description: 'Aldol reaction followed by dehydration to form α,β-unsaturated carbonyl',
    category: 'Condensation',
    reactants: [
      createReagent('Ketone (with α-H)', 'CC(=O)C'),
      createReagent('Aldehyde/Ketone', 'CC=O'),
    ],
    products: [
      createReagent('α,β-Unsaturated Carbonyl', 'CC=CC(=O)C'),
    ],
    conditions: ['base', 'heat (Δ)'],
    tags: ['aldol', 'condensation', 'dehydration', 'unsaturated'],
  },

  // ========== IMINE FORMATION ==========
  {
    id: 'carbonyl_hydrazine_hydrazone',
    name: 'Carbonyl + Hydrazine → Hydrazone',
    description: 'Formation of hydrazone from carbonyl and hydrazine',
    category: 'Condensation',
    reactants: [
      createReagent('Carbonyl', 'CC=O'),
      createReagent('Hydrazine', 'NN'),
    ],
    products: [
      createReagent('Hydrazone', 'CC=NN'),
    ],
    conditions: ['acid catalyst'],
    tags: ['imine', 'hydrazone', 'carbonyl'],
  },

  // ========== CARBOXYLIC ACID REDUCTIONS ==========
  {
    id: 'acid_lialh4_alcohol',
    name: 'Carboxylic Acid to Primary Alcohol',
    description: 'Reduction of carboxylic acid to primary alcohol with LiAlH₄',
    category: 'Reduction',
    reactants: [
      createReagent('Carboxylic Acid', 'CC(=O)O'),
      createReagent('LiAlH₄', '[Li+].[AlH4-]'),
    ],
    products: [
      createReagent('Primary Alcohol', 'CCO'),
    ],
    conditions: ['LiAlH₄', 'ether'],
    tags: ['reduction', 'acid', 'alcohol', 'LiAlH4'],
  },
  {
    id: 'acid_dibah_aldehyde',
    name: 'Carboxylic Acid to Aldehyde (DIBAH)',
    description: 'Partial reduction of carboxylic acid to aldehyde',
    category: 'Reduction',
    reactants: [
      createReagent('Carboxylic Acid', 'CC(=O)O'),
      createReagent('DIBAH', '[AlH2-]'),
    ],
    products: [
      createReagent('Aldehyde', 'CC=O'),
    ],
    conditions: ['DIBAH', '-78°C'],
    tags: ['reduction', 'acid', 'aldehyde', 'DIBAH'],
  },

  // ========== ACID CHLORIDE FORMATION ==========
  {
    id: 'acid_socl2_chloride',
    name: 'Carboxylic Acid to Acid Chloride (SOCl₂)',
    description: 'Formation of acid chloride using thionyl chloride',
    category: 'Substitution',
    reactants: [
      createReagent('Carboxylic Acid', 'CC(=O)O'),
      createReagent('SOCl₂', 'S(=O)(Cl)Cl'),
    ],
    products: [
      createReagent('Acid Chloride', 'CC(=O)Cl'),
    ],
    conditions: ['SOCl₂', 'pyridine'],
    tags: ['substitution', 'acid', 'acid chloride'],
  },
  {
    id: 'acid_oxalyl_chloride',
    name: 'Carboxylic Acid to Acid Chloride (Oxalyl Chloride)',
    description: 'Formation of acid chloride using oxalyl chloride',
    category: 'Substitution',
    reactants: [
      createReagent('Carboxylic Acid', 'CC(=O)O'),
      createReagent('(COCl)₂', 'ClC(=O)C(=O)Cl'),
    ],
    products: [
      createReagent('Acid Chloride', 'CC(=O)Cl'),
    ],
    conditions: ['(COCl)₂', 'cat. DMF'],
    tags: ['substitution', 'acid', 'acid chloride', 'oxalyl'],
  },

  // ========== ESTERIFICATION ==========
  {
    id: 'acid_alcohol_ester',
    name: 'Fischer Esterification',
    description: 'Formation of ester from carboxylic acid and alcohol',
    category: 'Condensation',
    reactants: [
      createReagent('Carboxylic Acid', 'CC(=O)O'),
      createReagent('Alcohol', 'CO'),
    ],
    products: [
      createReagent('Ester', 'CC(=O)OC'),
    ],
    conditions: ['H₂SO₄', 'heat'],
    tags: ['esterification', 'acid', 'alcohol', 'ester', 'Fischer'],
  },

  // ========== ACID CHLORIDE REACTIONS ==========
  {
    id: 'acid_chloride_alcohol_ester',
    name: 'Acid Chloride + Alcohol → Ester',
    description: 'Formation of ester from acid chloride and alcohol',
    category: 'Substitution',
    reactants: [
      createReagent('Acid Chloride', 'CC(=O)Cl'),
      createReagent('Alcohol', 'CO'),
    ],
    products: [
      createReagent('Ester', 'CC(=O)OC'),
    ],
    conditions: ['pyridine or Et₃N'],
    tags: ['substitution', 'acid chloride', 'ester'],
  },
  {
    id: 'acid_chloride_amine_amide',
    name: 'Acid Chloride + Amine → Amide',
    description: 'Formation of amide from acid chloride and amine',
    category: 'Substitution',
    reactants: [
      createReagent('Acid Chloride', 'CC(=O)Cl'),
      createReagent('Amine', 'CN'),
    ],
    products: [
      createReagent('Amide', 'CC(=O)NC'),
    ],
    conditions: ['base (Et₃N)'],
    tags: ['substitution', 'acid chloride', 'amide'],
  },
  {
    id: 'acid_chloride_lialh4_alcohol',
    name: 'Acid Chloride to Primary Alcohol',
    description: 'Reduction of acid chloride to primary alcohol',
    category: 'Reduction',
    reactants: [
      createReagent('Acid Chloride', 'CC(=O)Cl'),
      createReagent('LiAlH₄', '[Li+].[AlH4-]'),
    ],
    products: [
      createReagent('Primary Alcohol', 'CCO'),
    ],
    conditions: ['LiAlH₄', 'ether'],
    tags: ['reduction', 'acid chloride', 'alcohol'],
  },

  // ========== ESTER REACTIONS ==========
  {
    id: 'ester_grignard_tertiary_alcohol',
    name: 'Ester + Grignard → Tertiary Alcohol',
    description: 'Reaction of ester with excess Grignard reagent',
    category: 'Grignard',
    reactants: [
      createReagent('Ester', 'CC(=O)OC'),
      createReagent('Grignard', 'C[Mg+]Br', 'xs'),
    ],
    products: [
      createReagent('Tertiary Alcohol', 'CC(O)(C)C'),
    ],
    conditions: ['RMgX (xs)', 'then H₃O⁺'],
    tags: ['grignard', 'ester', 'alcohol'],
  },
  {
    id: 'ester_lialh4_alcohol',
    name: 'Ester to Primary Alcohol',
    description: 'Reduction of ester to primary alcohol',
    category: 'Reduction',
    reactants: [
      createReagent('Ester', 'CC(=O)OC'),
      createReagent('LiAlH₄', '[Li+].[AlH4-]'),
    ],
    products: [
      createReagent('Primary Alcohol', 'CCO'),
    ],
    conditions: ['LiAlH₄', 'ether'],
    tags: ['reduction', 'ester', 'alcohol'],
  },
  {
    id: 'ester_saponification',
    name: 'Saponification',
    description: 'Basic hydrolysis of ester to carboxylate salt',
    category: 'Hydrolysis',
    reactants: [
      createReagent('Ester', 'CC(=O)OC'),
      createReagent('NaOH', '[Na+].[OH-]'),
    ],
    products: [
      createReagent('Carboxylate', 'CC(=O)[O-]'),
      createReagent('Alcohol', 'CO'),
    ],
    conditions: ['NaOH', 'H₂O', 'heat'],
    tags: ['hydrolysis', 'ester', 'saponification'],
  },

  // ========== AMIDE REACTIONS ==========
  {
    id: 'amide_lialh4_amine',
    name: 'Amide to Amine',
    description: 'Reduction of amide to amine',
    category: 'Reduction',
    reactants: [
      createReagent('Amide', 'CC(=O)N'),
      createReagent('LiAlH₄', '[Li+].[AlH4-]'),
    ],
    products: [
      createReagent('Amine', 'CCN'),
    ],
    conditions: ['LiAlH₄', 'ether'],
    tags: ['reduction', 'amide', 'amine'],
  },
  {
    id: 'amide_dehydration_nitrile',
    name: 'Amide Dehydration to Nitrile',
    description: 'Dehydration of amide to nitrile',
    category: 'Dehydration',
    reactants: [
      createReagent('Amide', 'CC(=O)N'),
      createReagent('SOCl₂', 'S(=O)(Cl)Cl'),
    ],
    products: [
      createReagent('Nitrile', 'CC#N'),
    ],
    conditions: ['SOCl₂ or P₂O₅'],
    tags: ['dehydration', 'amide', 'nitrile'],
  },

  // ========== NITRILE REACTIONS ==========
  {
    id: 'nitrile_grignard_ketone',
    name: 'Nitrile + Grignard → Ketone',
    description: 'Reaction of nitrile with Grignard reagent to form ketone',
    category: 'Grignard',
    reactants: [
      createReagent('Nitrile', 'CC#N'),
      createReagent('Grignard', 'C[Mg+]Br'),
    ],
    products: [
      createReagent('Ketone', 'CC(=O)C'),
    ],
    conditions: ['RMgX', 'then H₃O⁺'],
    tags: ['grignard', 'nitrile', 'ketone'],
  },
  {
    id: 'nitrile_lialh4_amine',
    name: 'Nitrile to Primary Amine',
    description: 'Reduction of nitrile to primary amine',
    category: 'Reduction',
    reactants: [
      createReagent('Nitrile', 'CC#N'),
      createReagent('LiAlH₄', '[Li+].[AlH4-]'),
    ],
    products: [
      createReagent('Primary Amine', 'CCN'),
    ],
    conditions: ['LiAlH₄', 'ether'],
    tags: ['reduction', 'nitrile', 'amine'],
  },
  {
    id: 'nitrile_hydrolysis_acid',
    name: 'Nitrile Hydrolysis to Acid',
    description: 'Hydrolysis of nitrile to carboxylic acid',
    category: 'Hydrolysis',
    reactants: [
      createReagent('Nitrile', 'CC#N'),
      createReagent('Water', 'O'),
    ],
    products: [
      createReagent('Carboxylic Acid', 'CC(=O)O'),
    ],
    conditions: ['H₃O⁺ or OH⁻', 'heat'],
    tags: ['hydrolysis', 'nitrile', 'acid'],
  },

  // ========== SPECIAL REACTIONS ==========
  {
    id: 'wittig_reaction',
    name: 'Wittig Reaction',
    description: 'Formation of alkene from carbonyl and phosphorus ylide',
    category: 'Olefination',
    reactants: [
      createReagent('Carbonyl', 'CC=O'),
      createReagent('Phosphorus Ylide', '[CH2-][P+](C)(C)C'),
    ],
    products: [
      createReagent('Alkene', 'CC=C'),
    ],
    conditions: ['Ph₃P=CHR'],
    tags: ['wittig', 'carbonyl', 'alkene', 'ylide'],
  },
  {
    id: 'clemmensen_reduction',
    name: 'Clemmensen Reduction',
    description: 'Reduction of carbonyl to alkane',
    category: 'Reduction',
    reactants: [
      createReagent('Carbonyl', 'CC(=O)C'),
    ],
    products: [
      createReagent('Alkane', 'CCC'),
    ],
    conditions: ['Zn(Hg)', 'HCl', 'heat'],
    tags: ['clemmensen', 'reduction', 'carbonyl', 'alkane'],
  },
  {
    id: 'wolff_kishner_reduction',
    name: 'Wolff-Kishner Reduction',
    description: 'Reduction of carbonyl to alkane via hydrazone',
    category: 'Reduction',
    reactants: [
      createReagent('Carbonyl', 'CC(=O)C'),
      createReagent('Hydrazine', 'NN'),
    ],
    products: [
      createReagent('Alkane', 'CCC'),
    ],
    conditions: ['H₂NNH₂', 'KOH', 'heat'],
    tags: ['wolff-kishner', 'reduction', 'carbonyl', 'alkane'],
  },
  {
    id: 'baeyer_villiger_oxidation',
    name: 'Baeyer-Villiger Oxidation',
    description: 'Oxidation of ketone to ester',
    category: 'Oxidation',
    reactants: [
      createReagent('Ketone', 'CC(=O)C'),
      createReagent('Peroxyacid', 'CC(=O)OO'),
    ],
    products: [
      createReagent('Ester', 'CC(=O)OC'),
    ],
    conditions: ['mCPBA or other peroxyacid'],
    tags: ['baeyer-villiger', 'oxidation', 'ketone', 'ester'],
  },
  {
    id: 'haloform_reaction',
    name: 'Haloform Reaction',
    description: 'Oxidative cleavage of methyl ketone',
    category: 'Oxidation',
    reactants: [
      createReagent('Methyl Ketone', 'CC(=O)C'),
      createReagent('Br₂/OH⁻', 'BrBr'),
    ],
    products: [
      createReagent('Carboxylic Acid', 'CC(=O)O'),
      createReagent('Haloform', 'BrC(Br)Br'),
    ],
    conditions: ['Br₂', 'NaOH'],
    tags: ['haloform', 'oxidation', 'ketone', 'acid'],
  },
]

export const reactionsDatabase: Reaction[] = rawReactions.map(r => ({
  ...r,
  reactions: []
}))

// ========== REACTION CATEGORIES ==========
export const reactionCategories = [
  { id: 'all', name: 'All Reactions', description: 'View all reactions', reactionCount: reactionsDatabase.length },
  { id: 'oxidation', name: 'Oxidation', description: 'Oxidation reactions', reactionCount: reactionsDatabase.filter(r => r.category === 'Oxidation').length },
  { id: 'reduction', name: 'Reduction', description: 'Reduction reactions', reactionCount: reactionsDatabase.filter(r => r.category === 'Reduction').length },
  { id: 'addition', name: 'Addition', description: 'Addition reactions', reactionCount: reactionsDatabase.filter(r => r.category === 'Addition').length },
  { id: 'substitution', name: 'Substitution', description: 'Substitution reactions', reactionCount: reactionsDatabase.filter(r => r.category === 'Substitution').length },
  { id: 'condensation', name: 'Condensation', description: 'Condensation reactions', reactionCount: reactionsDatabase.filter(r => r.category === 'Condensation').length },
  { id: 'grignard', name: 'Grignard', description: 'Grignard reactions', reactionCount: reactionsDatabase.filter(r => r.category === 'Grignard').length },
  { id: 'hydrolysis', name: 'Hydrolysis', description: 'Hydrolysis reactions', reactionCount: reactionsDatabase.filter(r => r.category === 'Hydrolysis').length },
  { id: 'dehydration', name: 'Dehydration', description: 'Dehydration reactions', reactionCount: reactionsDatabase.filter(r => r.category === 'Dehydration').length },
  { id: 'olefination', name: 'Olefination', description: 'Alkene formation', reactionCount: reactionsDatabase.filter(r => r.category === 'Olefination').length },
]
