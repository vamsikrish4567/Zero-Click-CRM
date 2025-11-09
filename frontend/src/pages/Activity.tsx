import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { connectorsApi, agentApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Activity, FileText, X, Zap, Clock, Sparkles } from 'lucide-react'
import { AgentAnalysisDisplay } from '@/components/AgentAnalysisDisplay'

export default function ActivityPage() {
  const [selectedActivity, setSelectedActivity] = useState<any>(null)
  const [agentAnalysis, setAgentAnalysis] = useState<Record<string, unknown> | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Fetch connector summary for recent activities
  const { data: connectorSummary } = useQuery({
    queryKey: ['connector-summary'],
    queryFn: async () => {
      const response = await connectorsApi.getSummary()
      return response.data
    },
  })

  const recentActivities = connectorSummary?.recentActivities || []
  const connectedCount = connectorSummary?.connectedCount || 0

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
      case 'sales_call':
      case 'support_call':
        return '📞'
      case 'email':
      case 'contract_renewal':
      case 'technical_inquiry':
        return '📧'
      case 'meeting':
      case 'product_meeting':
      case 'executive_review':
        return '📹'
      case 'message':
      case 'chat':
        return '💬'
      default:
        return '📄'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'call':
      case 'sales_call':
        return 'border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20'
      case 'support_call':
        return 'border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20'
      case 'meeting':
      case 'product_meeting':
        return 'border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20'
      case 'email':
      case 'contract_renewal':
        return 'border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20'
      case 'technical_inquiry':
        return 'border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20'
      case 'executive_review':
        return 'border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20'
      case 'message':
      case 'chat':
        return 'border-pink-200 dark:border-pink-800 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20'
      default:
        return 'border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700'
    }
  }

  const handleAnalyzeTranscript = async (activity: any) => {
    if (!activity.transcriptId) return
    
    setSelectedActivity(activity)
    setIsAnalyzing(true)
    setAgentAnalysis(null)

    try {
      // Fetch the full transcript using connectorId from activity
      console.log('Fetching transcript:', activity.connectorId, activity.transcriptId)
      const transcriptResponse = await connectorsApi.getTranscript(activity.connectorId, activity.transcriptId)
      const transcript = transcriptResponse.data
      console.log('Transcript fetched:', transcript)

      if (!transcript.content) {
        throw new Error('Transcript content is empty')
      }

      // Analyze with AI agent (using the correct API method)
      console.log('Analyzing transcript with AI agent...')
      const analysisResponse = await agentApi.analyze(transcript.content, activity.type || 'customer_service')
      console.log('Analysis completed:', analysisResponse.data)
      setAgentAnalysis(analysisResponse.data)
    } catch (error: any) {
      console.error('Error analyzing transcript:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to analyze transcript. Please try again.'
      setAgentAnalysis({
        error: errorMessage,
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
          <Activity className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
          Activity Timeline
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Complete timeline of all activities from connected CRM connectors and data sources
        </p>
      </div>

      {/* Statistics Banner */}
      {connectedCount > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Activities</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                    {recentActivities.length}
                  </p>
                </div>
                <Activity className="w-10 h-10 text-blue-600 dark:text-blue-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Connected CRMs</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">
                    {connectedCount}
                  </p>
                </div>
                <Zap className="w-10 h-10 text-green-600 dark:text-green-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">With Transcripts</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                    {recentActivities.filter((a: any) => a.transcriptId).length}
                  </p>
                </div>
                <FileText className="w-10 h-10 text-purple-600 dark:text-purple-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Activities Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-primary dark:text-blue-400" />
            Complete Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connectedCount === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Connected CRMs
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Connect CRMs to see activity timeline
              </p>
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No activities yet. Connect data sources to start seeing activities.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity: any, idx: number) => {
                const formatDate = (dateStr: string) => {
                  const date = new Date(dateStr)
                  const now = new Date()
                  const diffMs = now.getTime() - date.getTime()
                  const diffMins = Math.floor(diffMs / 60000)
                  const diffHours = Math.floor(diffMs / 3600000)
                  const diffDays = Math.floor(diffMs / 86400000)

                  if (diffMins < 60) return `${diffMins} minutes ago`
                  if (diffHours < 24) return `${diffHours} hours ago`
                  if (diffDays < 7) return `${diffDays} days ago`
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                }

                const getInitials = (name: string) => {
                  return name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                }

                return (
                  <div 
                    key={idx}
                    className={`relative p-5 rounded-xl border-2 transition-all hover:shadow-lg cursor-pointer group ${getActivityColor(activity.type)}`}
                    onClick={() => activity.transcriptId && handleAnalyzeTranscript(activity)}
                  >
                    {/* Activity Card Content */}
                    <div className="flex items-start gap-4">
                      {/* User Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                          {getInitials(activity.user)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {activity.title || 'Untitled Activity'}
                        </h3>
                        
                        {/* Description */}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {activity.description || 'No description available'}
                        </p>
                        
                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-800 rounded-full">
                            <Zap className="w-3 h-3" />
                            {activity.connector}
                          </span>
                          <span className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-800 rounded-full">
                            <Clock className="w-3 h-3" />
                            {formatDate(activity.timestamp)}
                          </span>
                          {activity.dataSourceName && (
                            <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-400 rounded-full font-medium">
                              📊 {activity.dataSourceName}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Activity Icon */}
                      <div className="flex-shrink-0">
                        <div className="text-5xl opacity-80 group-hover:scale-110 transition-transform">
                          {getActivityIcon(activity.type)}
                        </div>
                      </div>
                    </div>

                    {/* Analyze Button Overlay */}
                    {activity.transcriptId && (
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-medium rounded-full shadow-lg flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Click to Analyze
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Analysis Modal/Overlay */}
      {(isAnalyzing || agentAnalysis) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center overflow-y-auto p-4" style={{ marginTop: '0px' }}>
          <div className="relative w-full max-w-6xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl max-h-[95vh] overflow-y-auto custom-scrollbar">
            {/* Close Button */}
            <button
              onClick={() => {
                setAgentAnalysis(null)
                setSelectedActivity(null)
                setIsAnalyzing(false)
              }}
              className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-lg"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Content */}
            <div className="p-6">
              {isAnalyzing ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Analyzing Transcript with AI Agent...
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Extracting attendees, decisions, action items, sentiment, and risks...
                  </p>
                </div>
              ) : agentAnalysis && (
                <>
                  {/* Activity Header */}
                  {selectedActivity && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg border border-blue-200 dark:border-blue-800 backdrop-blur-sm">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{getActivityIcon(selectedActivity.type)}</span>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {selectedActivity.action}
                          </h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedActivity.connector} • {new Date(selectedActivity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Analysis Display */}
                  {agentAnalysis && 'error' in agentAnalysis ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="w-10 h-10 text-red-600 dark:text-red-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Analysis Failed
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {agentAnalysis.error as string}
                      </p>
                    </div>
                  ) : (
                    <AgentAnalysisDisplay analysis={agentAnalysis as unknown as Parameters<typeof AgentAnalysisDisplay>[0]['analysis']} />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

