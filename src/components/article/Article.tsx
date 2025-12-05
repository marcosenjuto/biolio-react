import Card from '@/components/ui/Card'
import Content from '@/components/ui/Content'
import { ChatTimestamp } from '@/components/ui/ChatTimestamp'
import type { AssistantAction } from '@/types/chat'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'

export interface ArticleLink {
  type: '3d' | 'reaction'
  label: string
  data: string
}

interface ArticleProps {
  role?: 'user' | 'assistant' | 'static'
  content: string
  timestamp?: Date
  actions?: AssistantAction[]
  userFriendlyText?: string
  links?: ArticleLink[]
  onSelectLink?: (link: ArticleLink) => void
  onAction?: (actionType: string, data: any) => void
  className?: string
  title?: string
  badges?: string[]
}

function Article({
  role = 'assistant',
  content,
  timestamp,
  actions,
  userFriendlyText,
  links = [],
  onSelectLink,
  onAction,
  className = '',
  title,
  badges
}: ArticleProps) {
  const isUser = role === 'user'
  const cardTone =
    role === 'user'
      ? 'user-message bg-primary-100'
      : role === 'static'
        ? 'assistant-message'
        : 'assistant-message bg-none bg-transparent'

  const handleLinkClick = (link: ArticleLink) => {
    onSelectLink?.(link)
  }

  return (
    <Card className={`article-card max-w-[-webkit-fill-available] p-2 py-1 md:p-4 my-2 ${cardTone} ${className}`}>
      <div className="article-content space-y-3">
        {title && (
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        )}

        {badges && badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span key={badge} className="px-2 py-0.5 bg-gray-100 text-xs font-medium rounded-full text-gray-700">
                {badge}
              </span>
            ))}
          </div>
        )}

        <div className="article-body flex items-start gap-3">
          <div className="article-text flex-1 min-w-0">
            {role === 'assistant' && userFriendlyText && userFriendlyText !== content && (
              <p className="text-xs text-gray-500 italic mb-1">{userFriendlyText}</p>
            )}
            <div className="flex flex-row flex-wrap items-end justify-between gap-2">
              <div className={`break-words markdown-content max-w-full ${isUser ? 'text-primary-800' : 'text-gray-800'}`}>
                <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
                  {content}
                </ReactMarkdown>
              </div>
            </div>
            {actions && actions.length > 0 && <Content actions={actions} onAction={onAction} />}
            {timestamp && (
              <ChatTimestamp
                timestamp={timestamp}
                className={isUser ? 'text-primary-800' : 'text-gray-400'}
              />
            )}
          </div>
        </div>

        {links.length > 0 && (
          <div className="article-links flex flex-wrap gap-2 pt-2 border-t border-gray-200">
            {links.map((link, idx) => (
              <button
                key={`${link.label}-${idx}`}
                onClick={() => handleLinkClick(link)}
                className={`chemistry-link-button ${link.type === '3d' ? 'molecule-link' : 'reaction-link'} inline-flex items-center gap-1 px-3 py-1 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-medium rounded-full transition-colors`}
              >
                {link.type === '3d' ? (
                  <svg className="link-icon molecule-icon w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                ) : (
                  <svg className="link-icon reaction-icon w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
                <span className="link-label">{link.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

export default Article
