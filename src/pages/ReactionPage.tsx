import { useParams, useNavigate } from 'react-router-dom'
import { reactionsDatabase } from '@/data/reactionsDatabase'
import ReactionViewer from '@/components/chemistry/ReactionViewer'
import Article from '@/components/article/Article'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/ui/PageHeader'
import type { Reaction } from '@/types/chemistry'

const listNames = (items: Reaction['reactants']) =>
  items
    .map((reagent) => reagent.compound.names.common[0] || reagent.compound.names.iupac)
    .filter(Boolean)
    .join(', ')

const buildReactionMarkdown = (reaction: Reaction) => {
  const sections: string[] = []

  if (reaction.description) {
    sections.push(reaction.description)
  }

  if (reaction.reactants.length) {
    sections.push(`**Reactants:** ${listNames(reaction.reactants)}`)
  }

  if (reaction.products.length) {
    sections.push(`**Products:** ${listNames(reaction.products)}`)
  }

  if (reaction.conditions?.length) {
    sections.push(`**Conditions:** ${reaction.conditions.join(', ')}`)
  }

  if (reaction.temperature) {
    sections.push(`**Temperature:** ${reaction.temperature}`)
  }

  if (reaction.solvent) {
    sections.push(`**Solvent:** ${reaction.solvent}`)
  }

  if (typeof reaction.yield === 'number') {
    sections.push(`**Yield:** ${reaction.yield}%`)
  }

  if (reaction.smarts) {
    sections.push(`**SMARTS:** 
${reaction.smarts}`)
  }

  if (reaction.links_ref?.length || reaction.video_experiment) {
    const refLines = reaction.links_ref?.map((link, index) => `- [Reference ${index + 1}](${link})`) || []
    if (reaction.video_experiment) {
      refLines.push(`- [Video Experiment](${reaction.video_experiment})`)
    }
    sections.push(`**References:**
${refLines.join('\n')}`)
  }

  if (reaction.label) {
    sections.push(`_Mechanistic label: ${reaction.label}_`)
  }

  return sections.join('\n\n')
}

function ReactionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const reaction = reactionsDatabase.find(r => r.id === id)

  if (!reaction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Reaction not found</h1>
        <Button onClick={() => navigate('/library')}>Back to Library</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 ">
        <PageHeader
          title={reaction.name}
          onBack={() => navigate('/library')}
          backButtonVariant="secondary"
          backButtonClassName="text-gray-700 hover:text-primary-700"
        />
      <div className="mx-auto flex w-full max-w-4xl flex-col">

        {/* Reaction Viewer Section */}
        <div className="rounded-2xl border pt-4">
          <div className="flex flex-col gap-6 p-2 md:p-6">
            <div className="w-full overflow-hidden">
              <ReactionViewer reaction={reaction} viewerType="rdkit" />
            </div>
            <div>
              {/* <h2 className="text-xl font-bold text-gray-900 mb-2">{reaction.name}</h2> */}
              <p className="text-gray-600">{reaction.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                  {reaction.category}
                </span>
                {reaction.tags?.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Article / Chat Section */}
        <div className="p-2 md:p-4">
          <Article
            role="static"
            // title={`About ${reaction.name}`}
            content={buildReactionMarkdown(reaction)}
            // badges={[reaction.category, ...(reaction.tags || [])]}
          />
        </div>
      </div>
    </div>
  )
}

export default ReactionPage
