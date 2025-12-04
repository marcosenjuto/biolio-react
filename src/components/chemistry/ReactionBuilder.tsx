import ReactionViewer from './ReactionViewer'
import { Reaction } from '@/types/chemistry'
import { Molecule } from '@/types/molecule-model'

interface ReactionBuilderProps {
  reaction: Reaction
  availableMolecules: Molecule[]
  onReactionChange: (reaction: Reaction) => void
  viewerType?: 'rdkit' | 'kekule' | 'simple' | 'ketcher' | '3dmol'
}

export default function ReactionBuilder(props: ReactionBuilderProps) {
  return <ReactionViewer {...props} isBuilderMode={true} />
}
