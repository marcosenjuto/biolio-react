import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import type { AssistantAction } from '@/types/chat'
import Molecule3DViewer from '@/components/chemistry/Molecule3DViewer'
import ReactionViewer from '@/components/chemistry/ReactionViewer'
import Protein3DViewer from '@/components/chemistry/Protein3DViewer'

interface ContentProps {
  actions?: AssistantAction[]
}

interface AlphaFoldIframeProps {
  uniprotId?: string
  url?: string
  height?: number | string
  title?: string
}

const parseDimension = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
      return parsed
    }
  }

  return undefined
}

const withNumericDimensions = (props?: Record<string, unknown>) => {
  if (!props) {
    return {}
  }

  const clone: Record<string, unknown> = { ...props }

  if (clone.width !== undefined) {
    const dimension = parseDimension(clone.width)
    if (dimension !== undefined) {
      clone.width = dimension
    } else {
      delete clone.width
    }
  }

  if (clone.height !== undefined) {
    const dimension = parseDimension(clone.height)
    if (dimension !== undefined) {
      clone.height = dimension
    } else {
      delete clone.height
    }
  }

  return clone
}

const sanitizeProps = (props?: Record<string, unknown>) => {
  if (!props) {
    return undefined
  }

  const clone: Record<string, unknown> = { ...props }
  if ('target' in clone) {
    delete clone.target
  }

  return clone
}

const AlphaFoldIframe: React.FC<AlphaFoldIframeProps> = ({ uniprotId, url, height = 480, title }) => {
  const src = url || (uniprotId ? `https://alphafold.ebi.ac.uk/entry/${uniprotId}` : undefined)
  const resolvedHeight = parseDimension(height) ?? 480

  if (!src) {
    return null
  }

  const iframeTitle = title || (uniprotId ? `AlphaFold prediction for ${uniprotId}` : 'AlphaFold prediction')

  return (
    <div className="alphafold-iframe border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <iframe
        src={src}
        title={iframeTitle}
        className="w-full"
        style={{ height: resolvedHeight }}
        allowFullScreen
      />
    </div>
  )
}

const Content: React.FC<ContentProps> = ({ actions }) => {
  if (!actions || actions.length === 0) {
    return null
  }

  const actionById = new Map<string, AssistantAction>()
  const renderQueue: AssistantAction[] = []

  actions.forEach((rawAction) => {
    const baseProps = sanitizeProps(rawAction.props)
    const component = rawAction.component
    const actionId = rawAction.id

    if (component && actionId) {
      const normalizedAction: AssistantAction = {
        ...rawAction,
        component,
        props: baseProps
      }

      actionById.set(actionId, normalizedAction)

      if (rawAction.type !== 'ui.stream_text') {
        const existingIndex = renderQueue.findIndex(item => item.id === actionId)
        if (existingIndex !== -1) {
          renderQueue[existingIndex] = normalizedAction
        } else {
          renderQueue.push(normalizedAction)
        }
      }

      return
    }

    // Handle update actions that target an existing component
    if (rawAction.type === 'ui.update') {
      const propsRecord = (rawAction.props ?? {}) as Record<string, unknown>
      const targetId = typeof propsRecord.target === 'string' ? propsRecord.target : actionId

      if (!targetId) {
        return
      }

      const existing = actionById.get(targetId)
      if (!existing) {
        return
      }

      const sanitizedUpdate = sanitizeProps(propsRecord)
      const updatedProps: Record<string, unknown> = {
        ...(existing.props ?? {}),
        ...(sanitizedUpdate ?? {})
      }

      const updatedAction: AssistantAction = {
        ...existing,
        props: updatedProps
      }

      actionById.set(targetId, updatedAction)

      const queueIndex = renderQueue.findIndex(item => item.id === targetId)
      if (queueIndex !== -1) {
        renderQueue[queueIndex] = updatedAction
      }

      return
    }

    if (actionId && actionById.has(actionId)) {
      // Non-update action without component info but already known — refresh stored entry
      const existing = actionById.get(actionId)
      if (!existing) {
        return
      }

      const refreshedAction: AssistantAction = {
        ...existing,
        ...rawAction,
        component: existing.component,
        props: baseProps ?? existing.props
      }

      actionById.set(actionId, refreshedAction)

      const queueIndex = renderQueue.findIndex(item => item.id === actionId)
      if (queueIndex !== -1) {
        renderQueue[queueIndex] = refreshedAction
      }
    }
  })

  const visualActions = renderQueue.filter(action => action.type !== 'ui.stream_text')

  if (visualActions.length === 0) {
    return null
  }

  const renderAction = (action: AssistantAction) => {
    const component = action.component

    switch (component) {
      case 'MarkdownText': {
        const props = (action.props ?? {}) as { text?: string }
        const text = props.text ?? ''
        if (!text) {
          return null
        }
        return (
          <div className="markdown-content">
            <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
              {text}
            </ReactMarkdown>
          </div>
        )
      }
      case 'Molecule3DViewer': {
        const viewerProps = withNumericDimensions(action.props) as Record<string, unknown>
        const existingClass = typeof viewerProps.className === 'string' ? viewerProps.className : ''
        viewerProps.className = ['w-full max-w-full', existingClass].filter(Boolean).join(' ')
        return <Molecule3DViewer {...(viewerProps as any)} width="100%" height="260px" zoom={2.4} />
      }
      case 'ReactionViewer': {
        const props = (action.props ?? {}) as Record<string, unknown>
        return <ReactionViewer {...(props as any)} />
      }
      case 'Protein3DViewer': {
        const viewerProps = withNumericDimensions(action.props) as Record<string, unknown>
        const existingClass = typeof viewerProps.className === 'string' ? viewerProps.className : ''
        viewerProps.className = ['w-full max-w-full', existingClass].filter(Boolean).join(' ')
        return <Protein3DViewer {...(viewerProps as any)} />
      }
      case 'AlphaFoldIframe':
      case 'AlphaFoldViewer':
      case 'AlphaFoldEmbed': {
        return <AlphaFoldIframe {...(action.props as AlphaFoldIframeProps)} />
      }
      default:
        return (
          <div className="unsupported-component border border-dashed max-w-[100vw] border-gray-200 bg-gray-50 text-xs text-gray-600 rounded-lg p-4">
            <p className="font-semibold text-gray-700">Unsupported action</p>
            <p className="mt-1 text-[11px] text-gray-500">
              id: {action.id ?? 'unknown'} · type: {action.type ?? 'unknown'} · component: {component ?? 'none'}
            </p>
            {action.props ? (
              <pre className="mt-2 whitespace-pre-wrap break-all text-[11px]">
{JSON.stringify(action.props, null, 2)}
              </pre>
            ) : null}
          </div>
        )
    }
  }

  return (
    <div className="assistant-rich-content mt-3 space-y-4">
      {visualActions.map((action, index) => (
        <div key={`${action.id}-${index}`} className="assistant-rich-content-item">
          {renderAction(action)}
        </div>
      ))}
    </div>
  )
}

export default Content
