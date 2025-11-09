import { useState, useRef, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { VoiceInput } from '@/components/VoiceRecorder'
import { X, Send, Mic, User, Bot, Sparkles, MessageSquare, Users as UsersIcon, Activity as ActivityIcon, Maximize2, Minimize2 } from 'lucide-react'
import { connectorsApi, contactsApi, agentApi } from '@/services/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  data?: any
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 Hi! I\'m your CRM AI Assistant powered by advanced analytics.\n\nI can help you with:\n• 📊 CRM statistics and insights\n• 👥 Contact information\n• 📈 Activity analysis\n• 🎯 Deal opportunities\n• 📝 Transcript summaries\n\nAsk me anything!',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [showVoiceInput, setShowVoiceInput] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch CRM data for context - REFETCH when widget opens to get latest data
  const { data: connectorSummary, refetch: refetchSummary } = useQuery({
    queryKey: ['connector-summary'],
    queryFn: async () => {
      const response = await connectorsApi.getSummary()
      return response.data
    },
    enabled: isOpen, // Only fetch when chat is open
    refetchOnMount: true, // Refetch on mount
    refetchOnWindowFocus: true, // Refetch when window gains focus
  })

  const { data: contacts = [], refetch: refetchContacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const response = await contactsApi.list()
      return response.data
    },
    enabled: isOpen, // Only fetch when chat is open
    refetchOnMount: true,
  })

  // Refetch data when chat widget is opened to get latest connection status
  useEffect(() => {
    if (isOpen) {
      refetchSummary()
      refetchContacts()
      
      // Notify user about fresh data
      const welcomeMessage = messages.find(m => m.id === '1')
      if (welcomeMessage && connectorSummary) {
        // Update welcome message with fresh stats
        const timestamp = new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
        console.log(`🔄 ChatWidget refreshed at ${timestamp} - Connected CRMs: ${connectorSummary.connectedCount || 0}`)
      }
    }
  }, [isOpen, refetchSummary, refetchContacts])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      // Build context from CRM data
      const context = {
        connectedCRMs: connectorSummary?.connectedCount || 0,
        totalContacts: connectorSummary?.totalContacts || 0,
        totalActivities: connectorSummary?.recentActivities?.length || 0,
        recentContacts: contacts.slice(0, 5).map((c: any) => ({
          name: c.name,
          company: c.company,
          source: c.source
        })),
        recentActivities: connectorSummary?.recentActivities?.slice(0, 5).map((a: any) => ({
          title: a.title,
          type: a.type,
          connector: a.connector
        })) || [],
        // NEW: Add active connectors info for connection-aware responses
        activeConnectors: connectorSummary?.activeConnectors || []
      }

      // Call AI Agent chat API with Gemini LLM
      const response = await agentApi.chat(message, context)
      return response.data.response
    },
    onSuccess: (response) => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        },
      ])
    },
    onError: (error: any) => {
      // Fallback to error message
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: '❌ Sorry, I encountered an error processing your request. Please try again.',
          timestamp: new Date(),
        },
      ])
      console.error('Chat error:', error)
    },
  })

  const handleSendMessage = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    sendMessageMutation.mutate(input)
    setInput('')
  }

  const handleVoiceTranscript = (transcript: string) => {
    setInput(transcript)
    setShowVoiceInput(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary dark:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center z-50"
          aria-label="Open chat"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></span>
        </button>
      )}

      {/* Chat Drawer */}
      {isOpen && (
        <div 
          className={`fixed bg-white dark:bg-gray-800 shadow-2xl border-l border-t border-gray-200 dark:border-gray-700 flex flex-col z-50 transition-all duration-300 ${
            isExpanded 
              ? 'inset-4 rounded-2xl' 
              : 'bottom-0 right-0 w-96 h-[600px] rounded-tl-2xl'
          }`}
        >
          {/* Header */}
          <div className="bg-primary dark:bg-blue-600 text-white px-6 py-4 rounded-tl-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">CRM Assistant</h3>
                <p className="text-xs text-white/80">
                  {isExpanded ? 'Expanded View' : 'Online'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Expand/Collapse Button */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hover:bg-white/20 rounded-full p-2 transition-colors"
                title={isExpanded ? 'Minimize' : 'Expand'}
              >
                {isExpanded ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>
              {/* Close Button */}
              <button
                onClick={() => {
                  setIsOpen(false)
                  setIsExpanded(false)
                }}
                className="hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-2 ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-purple-100 text-purple-600'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Message */}
                <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div
                    className={`inline-block px-3 py-2 rounded-lg max-w-[85%] ${
                      message.role === 'user'
                        ? 'bg-primary dark:bg-blue-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm rounded-bl-none'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="text-sm prose prose-sm dark:prose-invert max-w-none
                        prose-headings:text-gray-900 dark:prose-headings:text-gray-100
                        prose-p:text-gray-900 dark:prose-p:text-gray-100
                        prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                        prose-ul:text-gray-900 dark:prose-ul:text-gray-100
                        prose-ol:text-gray-900 dark:prose-ol:text-gray-100
                        prose-li:text-gray-900 dark:prose-li:text-gray-100
                        prose-code:text-gray-900 dark:prose-code:text-gray-100
                        prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800
                        prose-hr:border-gray-300 dark:prose-hr:border-gray-600
                      ">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 px-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {sendMessageMutation.isPending && (
              <div className="flex items-start space-x-2">
                <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm px-3 py-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-br-2xl">
            {showVoiceInput ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-600">
                    <Mic className="w-3 h-3 inline mr-1" />
                    Record voice
                  </p>
                  <button
                    onClick={() => setShowVoiceInput(false)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
                <VoiceInput onTranscriptReady={handleVoiceTranscript} />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-end space-x-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    rows={2}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                  <button
                    onClick={() => setShowVoiceInput(true)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Use voice"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || sendMessageMutation.isPending}
                    className="p-2 bg-primary dark:bg-blue-600 text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Send"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setInput('Show me CRM stats')}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    Stats
                  </button>
                  <button
                    onClick={() => setInput('Show recent contacts')}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <UsersIcon className="w-3 h-3 inline mr-1" />
                    Contacts
                  </button>
                  <button
                    onClick={() => setInput('Recent activities')}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <ActivityIcon className="w-3 h-3 inline mr-1" />
                    Activities
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

