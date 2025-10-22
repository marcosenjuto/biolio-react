import type { Reaction } from '@/types/chemistry'
import Card from '@/components/ui/Card'

interface ReactionCardProps {
  reaction: Reaction
  onClick: () => void
}

function ReactionCard({ reaction, onClick }: ReactionCardProps) {
  return (
    <Card hover className="reaction-card cursor-pointer" onClick={onClick}>
      <div className="reaction-card-header flex items-start justify-between mb-2">
        <h3 className="reaction-card-title text-lg font-semibold text-gray-900 leading-tight">
          {reaction.name}
        </h3>
        <span className="reaction-card-category inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary-100 text-primary-800 whitespace-nowrap ml-2">
          {reaction.category}
        </span>
      </div>

      <p className="reaction-card-description text-sm text-gray-600 mb-2 line-clamp-2">
        {reaction.description}
      </p>

      {/* Reaction Summary */}
      <div className="reaction-card-summary flex items-center gap-2 text-sm text-gray-700 mb-2">
        <div className="summary-reactants">
          <span className="reactants-count font-medium">{reaction.reactants.length}</span>
          <span className="reactants-label text-gray-500 ml-1">reactant{reaction.reactants.length !== 1 ? 's' : ''}</span>
        </div>
        <svg className="summary-arrow w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <div className="summary-products text-right">
          <span className="products-count font-medium">{reaction.products.length}</span>
          <span className="products-label text-gray-500 ml-1">product{reaction.products.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Tags */}
      {reaction.tags && reaction.tags.length > 0 && (
        <div className="reaction-card-tags flex flex-wrap gap-1">
          {reaction.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="reaction-tag inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
            >
              {tag}
            </span>
          ))}
          {reaction.tags.length > 4 && (
            <span className="reaction-tag-more inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-gray-500">
              +{reaction.tags.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Conditions */}
      {reaction.conditions && reaction.conditions.length > 0 && (
        <div className="reaction-card-conditions mt-3 pt-3 border-t border-gray-200">
          <p className="conditions-text text-xs text-gray-500">
            <span className="conditions-label font-medium">Conditions:</span> {reaction.conditions.slice(0, 2).join(', ')}
            {reaction.conditions.length > 2 && '...'}
          </p>
        </div>
      )}
    </Card>
  )
}

export default ReactionCard
