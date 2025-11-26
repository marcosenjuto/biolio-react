import { useState, useRef, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  molecules?: string[]
  reactions?: string[]
}

interface ChemistryLink {
  type: '3d' | 'reaction'
  label: string
  data: string
}

function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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
          timestamp: new Date(msg.timestamp)
        }))
        setMessages(messagesWithDates)
      } catch (error) {
        console.error('Error loading chat history:', error)
      }
    }
  }, [])

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('biolio-chat-history', JSON.stringify(messages))
    }
  }, [messages])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Call local AI model API
      const response = await fetch('http://localhost:8001/query', {
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
      const aiResponse = data.response || data.answer || data.result || 'No response received'

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error calling AI model:', error)
      
      // Fallback mock response
      const mockResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I received your question: "${input}"\n\nTo use this feature, make sure you have Ollama running locally with a model installed.\n\nFor chemistry queries, I can help you explore molecules and reactions. For example:\n- "Show me the structure of aspirin (CC(=O)Oc1ccccc1C(=O)O)"\n- "Explain reaction 5 from the library"\n- "What is the Diels-Alder reaction?"`,
        timestamp: new Date()
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

  const handleViewMolecule = (smiles: string) => {
    // Navigate to molecule viewer with the SMILES
    navigate(`/molecule-viewer?smiles=${encodeURIComponent(smiles)}`)
  }

  const handleViewReaction = (reactionId: string) => {
    // Navigate to library filtered by reaction
    navigate(`/library?reaction=${reactionId}`)
  }

  return (
    <div className="biopilot-chat-container flex flex-col h-[calc(100vh-3rem)] md:h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Messages Container */}
      <div className="biopilot-messages-scroll flex-1 overflow-y-auto px-3 py-6 ">
        {messages.length === 0 ? (
          <>
            {/* Header - Only show when no messages */}
            <div className="biopilot-header bg-white shadow-sm border-b border-gray-200 px-6 py-4 rounded-lg">
              <h1 className="biopilot-title text-2xl font-bold text-gray-800 flex items-center gap-3">
                <svg className="biopilot-icon w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                Biopilot
              </h1>
              <p className="biopilot-subtitle text-sm text-gray-600 mt-1">
                Ask questions about chemistry, molecules, and reactions
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
                Start a conversation
              </h2>
              <p className="welcome-description text-gray-500 max-w-md">
                Ask me anything about chemistry, molecular structures, organic reactions, or request visualizations.
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
                Biopilot
              </h1>
              <p className="biopilot-subtitle text-sm text-gray-600 mt-1">
                Ask questions about chemistry, molecules, and reactions
              </p>
            </div>

            {messages.map((message) => {
              const links = message.role === 'assistant' ? parseChemistryLinks(message.content) : []
              
              return (
                <div
                  key={message.id}
                  className={`message-wrapper flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <Card
                    className={`message-card md:max-w-[70%] p-2 my-2 ${
                      message.role === 'user'
                        ? 'user-message bg-primary-100'
                        : 'assistant-message bg-none bg-transparent'
                    }`}
                  >
                    <div className="message-content space-y-3">
                        <div className={`message-avatar w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === 'user' ? 'user-avatar bg-primary-700' : 'assistant-avatar bg-gray-100'
                        }`}>
                          {message.role === 'user' ? (
                            <svg className="avatar-icon w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="avatar-icon w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                            </svg>
                          )}
                        </div>
                      <div className="message-body flex items-start gap-3">
                        <div className="message-text-wrapper flex-1 min-w-0">
                          {/* <div className={`message-text text-m  break-words markdown-content ${ */}
                          <div className={` break-words markdown-content ${
                            message.role === 'user' ? 'text-primary-800' : 'text-gray-800'
                          }`}>
                            <ReactMarkdown
                              remarkPlugins={[remarkMath, remarkGfm]}
                              rehypePlugins={[rehypeKatex]}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                          <p className={`message-timestamp text-xs mt-2 ${
                            message.role === 'user' ? 'text-primary-800' : 'text-gray-400'
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
                          </p>
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

            {isLoading && (
              <div className="loading-message-wrapper flex justify-start">
                <Card className="loading-card bg-white border border-gray-200">
                  <div className="loading-content flex items-center gap-3">
                    <div className="loading-spinner w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg className="spinner-icon w-5 h-5 text-primary-600 animate-spin" fill="none" viewBox="0 0 24 24">
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
              placeholder="How can i help?"
              className="chat-input flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="send-button px-6 py-3"
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
