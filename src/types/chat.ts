export type ChatRole = 'user' | 'assistant'

export interface AssistantAction {
  id: string
  type: string
  component?: string
  props?: Record<string, unknown>
  depends_on?: string[]
}

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  timestamp: Date
  molecules?: string[]
  reactions?: string[]
  actions?: AssistantAction[]
  userFriendlyText?: string
  answer?: string
  hasVisualizations?: boolean
  toolResults?: unknown
  iterations?: number
  components?: unknown
}
