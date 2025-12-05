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
      <div className="reaction-page-missing flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h1 className="reaction-missing-title text-2xl font-bold text-gray-800 mb-4">Reaction not found</h1>
        <Button onClick={() => navigate('/library')} className="reaction-missing-button">Back to Library</Button>
      </div>
    )
  }

  return (
    <div className="reaction-page min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100">
      <PageHeader
        title={reaction.name}
        onBack={() => navigate('/library')}
        backButtonVariant="secondary"
        backButtonClassName="text-gray-700 hover:text-primary-700"
      />
      <div className="reaction-page-body mx-auto flex w-full max-w-4xl flex-col">

        {/* Reaction Viewer Section */}
        <div className="reaction-viewer-card rounded-2xl border pt-4">
          <div className="reaction-viewer-content flex flex-col gap-6 p-2 md:p-6">
            <div className="reaction-viewer-canvas w-full overflow-hidden">
              <ReactionViewer reaction={reaction} viewerType="rdkit" />
            </div>
            <div className="reaction-details">
              <p className="reaction-description text-gray-600">{reaction.description}</p>
              <div className="reaction-tags flex flex-wrap gap-2 mt-4">
                <span className="reaction-category-chip px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                  {reaction.category}
                </span>
                {reaction.tags?.map(tag => (
                  <span key={tag} className="reaction-tag-chip px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Article / Chat Section */}
        <div className="reaction-article-panel p-2 md:p-4">
          <Article
            role="static"
            content={buildReactionMarkdown(reaction)}
          />
        </div>
      </div>
    </div>
  )
}

export default ReactionPage
