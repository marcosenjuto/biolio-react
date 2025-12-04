import { useState, useRef, useEffect, useMemo } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import Content from '@/components/ui/Content'
import { ChatTimestamp } from '@/components/ui/ChatTimestamp'
import type { ChatMessage, AssistantAction } from '@/types/chat'

import { useLanguageStore } from '@/store/languageStore'

interface ChemistryLink {
  type: '3d' | 'reaction'
  label: string
  data: string
}

const MESSAGE_PAGE_SIZE = 10
const MAX_VISIBLE_MESSAGES = 50
const SCROLL_BOTTOM_THRESHOLD = 4

function AIChatPage() {
  const { t } = useLanguageStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [visibleCount, setVisibleCount] = useState(MESSAGE_PAGE_SIZE)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const loadMoreScrollMetaRef = useRef<{ height: number; top: number } | null>(null)
  const loadingMoreRef = useRef(false)
  const stickToBottomRef = useRef(true)
  const programmaticScrollRef = useRef(false)
  const programmaticScrollRafRef = useRef<number | null>(null)
  const navigate = useNavigate()

  const cancelProgrammaticScrollCheck = () => {
    if (programmaticScrollRafRef.current !== null) {
      cancelAnimationFrame(programmaticScrollRafRef.current)
      programmaticScrollRafRef.current = null
    }
  }

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const container = messagesContainerRef.current
    if (!container) {
      messagesEndRef.current?.scrollIntoView({ behavior })
      return
    }

    cancelProgrammaticScrollCheck()
    programmaticScrollRef.current = true
    container.scrollTo({ top: container.scrollHeight, behavior })

    if (behavior === 'smooth') {
      let lastScrollTop = -1
      let samePositionCount = 0

      const monitor = () => {
        if (!programmaticScrollRef.current) {
          cancelProgrammaticScrollCheck()
          return
        }

        const currentScrollTop = container.scrollTop
        const distanceFromBottom = container.scrollHeight - currentScrollTop - container.clientHeight

        if (distanceFromBottom <= SCROLL_BOTTOM_THRESHOLD) {
          programmaticScrollRef.current = false
          stickToBottomRef.current = true
          cancelProgrammaticScrollCheck()
          return
        }

        // Check if scroll has stopped (interrupted or finished but not quite at bottom)
        if (Math.abs(currentScrollTop - lastScrollTop) < 1) {
          samePositionCount++
          if (samePositionCount > 5) { // ~80ms of no movement
            programmaticScrollRef.current = false
            // If we stopped and are not at bottom, user probably interrupted.
            // Don't stick to bottom.
            stickToBottomRef.current = false
            cancelProgrammaticScrollCheck()
            return
          }
        } else {
          samePositionCount = 0
          lastScrollTop = currentScrollTop
        }

        programmaticScrollRafRef.current = requestAnimationFrame(monitor)
      }

      programmaticScrollRafRef.current = requestAnimationFrame(monitor)
    } else {
      programmaticScrollRef.current = false
      stickToBottomRef.current = true
    }
  }

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('biolio-chat-history')
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages)
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
          actions: Array.isArray(msg.actions) ? msg.actions : []
        }))
        setMessages(messagesWithDates)
      } catch (error) {
        console.error('Error loading chat history:', error)
      }
    }
  }, [])

  useEffect(() => {
    if (messages.length === 0) {
      setVisibleCount(MESSAGE_PAGE_SIZE)
      return
    }

    setVisibleCount(prev => {
      const limit = Math.min(messages.length, MAX_VISIBLE_MESSAGES)
      const baseline = Math.max(prev, MESSAGE_PAGE_SIZE)
      const next = Math.min(limit, baseline)
      return next === prev ? prev : next
    })
  }, [messages.length])

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('biolio-chat-history', JSON.stringify(messages))
    }
  }, [messages])

  const visibleMessages = useMemo(() => {
    const limit = Math.min(messages.length, visibleCount, MAX_VISIBLE_MESSAGES)
    if (messages.length <= limit) {
      return messages
    }
    return messages.slice(-limit)
  }, [messages, visibleCount])

  useEffect(() => {
    return () => {
      cancelProgrammaticScrollCheck()
    }
  }, [])

  useEffect(() => {
    if (loadingMoreRef.current) {
      const container = messagesContainerRef.current
      const meta = loadMoreScrollMetaRef.current
      if (container && meta) {
        const diff = container.scrollHeight - meta.height
        container.scrollTop = meta.top + diff
      }
      loadingMoreRef.current = false
      loadMoreScrollMetaRef.current = null
      setIsLoadingMore(false)
      return
    }

    if (stickToBottomRef.current) {
      scrollToBottom(messages.length > 0 ? 'smooth' : 'auto')
    }
  }, [visibleMessages, messages.length])

  // Parse chemistry entities from AI response
  const parseChemistryLinks = (content: string): ChemistryLink[] => {
    const links: ChemistryLink[] = []
    
    // Look for SMILES patterns (simple detection)
    const smilesPattern = /\b([A-Z][a-z]?(\([A-Z][a-z]?\))?[\d\+\-\[\]\(\)=#@\/\\]*)+\b/g
    const smilesMatches = content.match(smilesPattern)
    
    if (smilesMatches) {
      smilesMatches.slice(0, 3).forEach((smiles, idx) => {
        links.push({
          type: '3d',
          label: `Molecule ${idx + 1}`,
          data: smiles
        })
      })
    }

    // Look for reaction references
    const reactionPattern = /reaction\s+(\d+)|R(\d+)/gi
    const reactionMatches = content.match(reactionPattern)
    
    if (reactionMatches) {
      reactionMatches.slice(0, 2).forEach((match) => {
        const id = match.match(/\d+/)?.[0]
        if (id) {
          links.push({
            type: 'reaction',
            label: `Reaction ${id}`,
            data: id
          })
        }
      })
    }

    return links
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      actions: []
    }

    stickToBottomRef.current = true
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Call local AI model API using the actions endpoint
      const response = await fetch('http://localhost:8001/query/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response from AI model')
      }

      const data = await response.json()
      const actions = Array.isArray(data.actions) ? (data.actions as AssistantAction[]) : undefined
      const streamedText = actions
        ?.filter((action: AssistantAction) => action.type === 'ui.stream_text' && action.component === 'MarkdownText')
        .map((action: AssistantAction) => {
          const props = action.props as { text?: string }
          return props?.text ?? ''
        })
        .filter(Boolean)
        .join('\n\n')

      const aiResponse =
        data.answer ||
        streamedText ||
        data.response ||
        data.result ||
        'No response received'

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        actions,
        userFriendlyText: data.user_friendly_text,
        answer: data.answer,
        hasVisualizations: data.has_visualizations,
        toolResults: data.tool_results,
        iterations: data.iterations,
        components: data.components
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error calling AI model:', error)
      
      // Fallback mock response
      const mockResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I received your question: "${input}"\n\nTo use this feature, make sure you have Ollama running locally with a model installed.\n\nFor chemistry queries, I can help you explore molecules and reactions. For example:\n- "Show me the structure of aspirin (CC(=O)Oc1ccccc1C(=O)O)"\n- "Explain reaction 5 from the library"\n- "What is the Diels-Alder reaction?"`,
        timestamp: new Date(),
        actions: []
      }
      
      setMessages(prev => [...prev, mockResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  const hasMoreMessages = visibleCount < Math.min(messages.length, MAX_VISIBLE_MESSAGES)

  const loadMoreMessages = () => {
    if (!hasMoreMessages || loadingMoreRef.current) {
      return
    }

    const container = messagesContainerRef.current
    if (!container) {
      return
    }

    loadMoreScrollMetaRef.current = {
      height: container.scrollHeight,
      top: container.scrollTop
    }

    loadingMoreRef.current = true
    stickToBottomRef.current = false
    setIsLoadingMore(true)
    setVisibleCount(prev => {
      const limit = Math.min(messages.length, MAX_VISIBLE_MESSAGES)
      return Math.min(limit, prev + MESSAGE_PAGE_SIZE)
    })
  }

  const handleScroll = () => {
    const container = messagesContainerRef.current
    if (!container) {
      return
    }

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    const isNearBottom = distanceFromBottom < 80

    if (programmaticScrollRef.current) {
      if (isNearBottom) {
        programmaticScrollRef.current = false
        stickToBottomRef.current = true
        cancelProgrammaticScrollCheck()
      }
      return
    }

    if (container.scrollTop <= 80 && hasMoreMessages && !loadingMoreRef.current) {
      loadMoreMessages()
    }

    if (isNearBottom) {
      stickToBottomRef.current = true
    } else if (!loadingMoreRef.current) {
      stickToBottomRef.current = false
    }
  }

  const handleViewMolecule = (smiles: string) => {
    // Navigate to molecule viewer with the SMILES
    navigate(`/molecule-viewer?smiles=${encodeURIComponent(smiles)}`)
  }

  const handleViewReaction = (reactionId: string) => {
    // Navigate to library filtered by reaction
    navigate(`/library?reaction=${reactionId}`)
  }

  return (
    <div className="biopilot-chat-container flex flex-col max-w-[100vw] h-[calc(100vh-3rem)] md:h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="biopilot-messages-scroll flex-1 max-w-[100vw] overflow-y-auto px-3 py-6"
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <>
            {/* Header - Only show when no messages */}
            <div className="biopilot-header bg-white shadow-sm border-b border-gray-200 px-6 py-4 rounded-lg">
              <h1 className="biopilot-title text-2xl font-bold text-gray-800 flex items-center gap-3">
                <svg className="biopilot-icon w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                {t.navigation.biopilot}
              </h1>
              <p className="biopilot-subtitle text-sm text-gray-600 mt-1">
                {t.chat.placeholder}
              </p>
            </div>

            {/* Start conversation message */}
            <div className="biopilot-welcome flex flex-col items-center my-16 justify-center flex-1 text-center">
              <div className="welcome-icon-wrapper w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <svg className="welcome-icon w-10 h-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="welcome-title text-xl font-semibold text-gray-700 mb-2">
                {t.chat.placeholder}
              </h2>
              <p className="welcome-description text-gray-500 max-w-md">
                {t.chat.mockResponse.replace('{input}', '')}
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Header - Scrollable with messages */}
            <div className="biopilot-header bg-white shadow-sm border-b border-gray-200 px-6 py-4 rounded-lg">
              <h1 className="biopilot-title text-2xl font-bold text-gray-800 flex items-center gap-3">
                <svg className="biopilot-icon w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                {t.navigation.biopilot}
              </h1>
              <p className="biopilot-subtitle text-sm text-gray-600 mt-1">
                {t.chat.placeholder}
              </p>
            </div>

            {hasMoreMessages && (
              <div className="flex justify-center py-2">
                <button
                  type="button"
                  onClick={loadMoreMessages}
                  disabled={isLoadingMore}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  {isLoadingMore ? 'Loading earlier messages…' : 'Load earlier messages'}
                </button>
              </div>
            )}

            {(() => {
              const groups: ChatMessage[][] = []
              let currentGroup: ChatMessage[] = []
              
              visibleMessages.forEach((msg) => {
                if (msg.role === 'user') {
                  if (currentGroup.length > 0) {
                    groups.push(currentGroup)
                  }
                  currentGroup = [msg]
                } else {
                  currentGroup.push(msg)
                }
              })
              if (currentGroup.length > 0) groups.push(currentGroup)
              
              return groups.map((group, groupIdx) => (
                <div key={`group-${groupIdx}`} className="conversation-group relative">
                  {group.map((message) => {
                    const links = message.role === 'assistant' ? parseChemistryLinks(message.content) : []
                    
                    return (
                      <div
                        key={message.id}
                        className={`message-wrapper max-w-max-w-[-webkit-fill-available] flex ${message.role === 'user' ? 'justify-end sticky top-[-24px] z-10 cursor-pointer' : 'justify-start'}`}
                        onClick={(e) => {
                          if (message.role === 'user') {
                            e.currentTarget.parentElement?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }
                        }}
                      >
                        <Card
                          className={`message-card max-w-[-webkit-fill-available] p-2 py-1 md:p-2 my-2 ${
                            message.role === 'user'
                              ? 'user-message bg-primary-100'
                              : 'assistant-message bg-none bg-transparent'
                          }`}
                        >
                          <div className="message-content space-y-3">
                            <div className="message-body flex items-start gap-3">
                              <div className="message-text-wrapper flex-1  min-w-0">
                                {message.role === 'assistant' && message.userFriendlyText && message.userFriendlyText !== message.content && (
                                  <p className="text-xs text-gray-500 italic mb-1">
                                    {message.userFriendlyText}
                                  </p>
                                )}
                                <div className="flex flex-row flex-wrap items-end justify-between gap-2">
                                  <div className={`break-words markdown-content max-w-full ${
                                    message.role === 'user' ? 'text-primary-800' : 'text-gray-800'
                                  }`}>
                                    <ReactMarkdown
                                      remarkPlugins={[remarkMath, remarkGfm]}
                                      rehypePlugins={[rehypeKatex]}
                                    >
                                      {message.content}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                                {message.role === 'assistant' && message.actions && message.actions.length > 0 && (
                                  <Content actions={message.actions} />
                                )}
                                  <ChatTimestamp 
                                    timestamp={message.timestamp}
                                    className={message.role === 'user' ? 'text-primary-800' : 'text-gray-400'}
                                  />
                              </div>
                            </div>

                            {/* Chemistry Links */}
                            {links.length > 0 && (
                              <div className="chemistry-links flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                                {links.map((link, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => 
                                      link.type === '3d' 
                                        ? handleViewMolecule(link.data)
                                        : handleViewReaction(link.data)
                                    }
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
                      </div>
                    )
                  })}
                </div>
              ))
            })()}

            {isLoading && (
              <div className="loading-message-wrapper flex justify-start">
                <Card className="loading-card bg-white border border-gray-200">
                  <div className="loading-content flex items-center gap-3">
                    <div className="loading-spinner w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg className="spinner-icon w-5 h-5 text-primary-600 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <span className="loading-text text-m text-gray-600">Thinking...</span>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}

        <div ref={messagesEndRef} className="messages-end-anchor" />
      </div>

      {/* Input Area */}
      <div className="biopilot-input-area bg-white border-t border-gray-200 px-3 py-3 md:px-6">
        <div className="input-container max-w-4xl mx-auto">
          <div className="input-controls flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={t.chat.placeholder}
              className="chat-input flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="send-button px-4 py-2"
            >
              <svg className="send-icon w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Button>
          </div>
{/*           <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line. Connects to local AI at localhost:8001
          </p> */}
        </div>
      </div>
    </div>
  )
}

export default AIChatPage
