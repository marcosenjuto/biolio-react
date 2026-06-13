import { useParams, useNavigate } from 'react-router-dom'
import { reactionsDatabase } from '@/data/reactionsDatabase'
import ReactionViewer from '@/components/chemistry/ReactionViewer'
import Article from '@/components/article/Article'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/ui/PageHeader'
import { useLanguageStore } from '@/store/languageStore'
import type { Reaction } from '@/types/chemistry'
import type { Translations } from '@/types/language'

const listNames = (items: Reaction['reactants']) =>
  items
    .map((reagent) => {
      if (!reagent.compound) return null
      const compound = reagent.compound
      
      // Handle BioblioReaction format (Names is array)
      if ('names' in compound && Array.isArray(compound.names)) {
        const commonName = compound.names.find((n: any) => n.type === 'common')
        const iupacName = compound.names.find((n: any) => n.type === 'iupac')
        return commonName?.value || iupacName?.value || null
      }
      
      if ('names' in compound && typeof compound.names === 'object' && !Array.isArray(compound.names)) {
        // Old format (shouldn't happen with BioblioReaction)
        const names = compound.names as any
        return names.common?.[0] || names.iupac || ''
      }
      
      // Handle simple name property
      if ('name' in compound && typeof compound.name === 'string') {
        return compound.name
      }
      
      return null
    })
    .filter(Boolean)
    .join(', ')

const buildReactionMarkdown = (reaction: Reaction, t: Translations) => {
  // Helper to extract name from compound
  const getName = (compound: any): string => {
    if (!compound) return ''
    if (compound.name) return compound.name
    if ('names' in compound && Array.isArray(compound.names)) {
      const commonName = compound.names.find((n: any) => n.type === 'common')
      const iupacName = compound.names.find((n: any) => n.type === 'iupac')
      return commonName?.value || iupacName?.value || ''
    }
    if ('names' in compound && typeof compound.names === 'object' && !Array.isArray(compound.names)) {
      return compound.names.common?.[0] || compound.names.iupac || ''
    }
    return ''
  }

  const sections: string[] = []

  if (reaction.description) {
    sections.push(reaction.description)
  }

  if (reaction.reactants.length) {
    sections.push(`**${t.reaction.reactants}** ${listNames(reaction.reactants)}`)
  }

  if (reaction.products.length) {
    sections.push(`**${t.reaction.products}** ${listNames(reaction.products)}`)
  }

  if (reaction.conditions?.length) {
    sections.push(`**${t.reaction.conditions}** ${reaction.conditions.join(', ')}`)
  }

  if (reaction.temperature) {
    sections.push(`**${t.reaction.temperature}** ${reaction.temperature}`)
  }

  if (reaction.solvents && reaction.solvents.length > 0) {
    const solventNames = reaction.solvents
      .map(s => getName(s.compound))
      .filter(Boolean)
      .join(', ')
    if (solventNames) {
      sections.push(`**${t.reaction.solvent}** ${solventNames}`)
    }
  }

  if (typeof reaction.yield === 'number') {
    sections.push(`**${t.reaction.yield}** ${reaction.yield}%`)
  }

  if (reaction.smarts) {
    sections.push(`**${t.reaction.smarts}** 
${reaction.smarts}`)
  }

  if (reaction.links_ref?.length || reaction.video_experiment) {
    const refLines = reaction.links_ref?.map((link, index) => `- [${t.reaction.reference} ${index + 1}](${link})`) || []
    if (reaction.video_experiment) {
      refLines.push(`- [${t.reaction.videoExperiment}](${reaction.video_experiment})`)
    }
    sections.push(`**${t.reaction.references}**
${refLines.join('\n')}`)
  }

  if (reaction.label) {
    sections.push(`_${t.reaction.mechanisticLabel} ${reaction.label}_`)
  }

  return sections.join('\n\n')
}

function ReactionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useLanguageStore()
  
  const reaction = reactionsDatabase.find(r => r.id === id)

  if (!reaction) {
    return (
      <div className="reaction-page-missing flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h1 className="reaction-missing-title text-2xl font-bold text-gray-800 mb-4">{t.reaction.notFound}</h1>
        <Button onClick={() => navigate('/library')} className="reaction-missing-button">{t.common.backToLibrary}</Button>
      </div>
    )
  }

  return (
    <div className="reaction-page bg-gradient-to-b from-gray-50 via-white to-gray-100">
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
                {/* Handle category as array or string */}
                {Array.isArray(reaction.category) ? (
                  reaction.category.map(cat => (
                    <span key={cat} className="reaction-category-chip px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                      {cat}
                    </span>
                  ))
                ) : (
                  <span className="reaction-category-chip px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                    {reaction.category}
                  </span>
                )}
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
            content={buildReactionMarkdown(reaction, t)}
          />
        </div>
      </div>
    </div>
  )
}

export default ReactionPage
