export interface Name {
  languageCode: string;
  type: 'iupac' | 'common' | 'trivial' | 'other';
  value: string;
}

export type Names = Name[];
