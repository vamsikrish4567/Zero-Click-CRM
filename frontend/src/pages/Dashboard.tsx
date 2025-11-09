import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { contactsApi, companiesApi, connectorsApi, agentApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Users, Building2, Plug, Activity, Zap, FileText, Clock, Sparkles, X } from 'lucide-react'
import { formatDate, getInitials } from '@/lib/utils'
import { Button } from '@/components/Button'
import { AgentAnalysisDisplay } from '@/components/AgentAnalysisDisplay'
import { Link } from 'react-router-dom'

interface ActivityData {
  id: string
  type: string
  title: string
  timestamp: string
  user: string
  description: string
  connector: string
  connectorId: string
  transcriptId?: string
  dataSource?: string
  dataSourceName?: string
  dataSourceConnected?: boolean
}

export default function Dashboard() {
  const [selectedActivity, setSelectedActivity] = useState<ActivityData | null>(null)
  const [agentAnalysis, setAgentAnalysis] = useState<Record<string, unknown> | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const response = await contactsApi.list()
      return response.data
    },
  })

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await companiesApi.list()
      return response.data
    },
  })

  // Fetch connector summary from API
  const { data: connectorSummary } = useQuery({
    queryKey: ['connector-summary'],
    queryFn: async () => {
      const response = await connectorsApi.getSummary()
      return response.data
    },
  })

  const recentContacts = contacts.slice(0, 5)
  const connectedCount = connectorSummary?.connectedCount || 0
  const totalConnectors = connectorSummary?.totalConnectors || 6
  const totalContacts = connectorSummary?.totalContacts || contacts.length
  const activeConnectors = connectorSummary?.activeConnectors || []
  const recentActivities = connectorSummary?.recentActivities || []

  // Handle transcript analysis
  const handleAnalyzeTranscript = async (activity: any) => {
    if (!activity.transcriptId) return
    
    setSelectedActivity(activity)
    setIsAnalyzing(true)
    setAgentAnalysis(null)

    try {
      // Fetch the full transcript
      const connectorId = activity.connector.toLowerCase().replace(' ', '')
      const transcriptResponse = await connectorsApi.getTranscript(connectorId, activity.transcriptId)
      const transcript = transcriptResponse.data
      
      // Analyze with AI Agent
      const analysisResponse = await agentApi.analyze(transcript.content, activity.type)
      setAgentAnalysis(analysisResponse.data)
    } catch (error) {
      console.error('Error analyzing transcript:', error)
      alert('Failed to analyze transcript. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'sales_call': return '📞'
      case 'support_call': return '🚨'
      case 'product_meeting': return '💡'
      case 'marketing_review': return '📊'
      case 'training_session': return '🎓'
      case 'project_kickoff': return '🚀'
      case 'contract_negotiation': return '📝'
      case 'business_review': return '💼'
      case 'partnership_meeting': return '🤝'
      case 'crisis_call': return '⚠️'
      default: return '📋'
    }
  }

  const getActivityColor = (type: string) => {
    switch(type) {
      case 'sales_call': return 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
      case 'support_call': return 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800'
      case 'product_meeting': return 'bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800'
      case 'marketing_review': return 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800'
      case 'training_session': return 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800'
      case 'project_kickoff': return 'bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800'
      case 'contract_negotiation': return 'bg-teal-100 dark:bg-teal-900/30 border-teal-200 dark:border-teal-800'
      case 'business_review': return 'bg-cyan-100 dark:bg-cyan-900/30 border-cyan-200 dark:border-cyan-800'
      case 'partnership_meeting': return 'bg-pink-100 dark:bg-pink-900/30 border-pink-200 dark:border-pink-800'
      case 'crisis_call': return 'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800'
      default: return 'bg-gray-100 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          AI-Powered CRM Integration Hub
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Contacts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {totalContacts.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {connectedCount} CRMs synced
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Companies</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {companies.length}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">+8% this month</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Building2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Connectors</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {connectedCount} / {totalConnectors}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {connectedCount === 0 ? 'Connect a CRM' : `${connectedCount} syncing`}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Plug className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Data Synced</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {totalContacts.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">All connectors</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Connectors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-primary dark:text-blue-400" />
              Active Connectors
            </CardTitle>
          </CardHeader>
          <CardContent>
            {connectedCount === 0 ? (
              <div className="text-center py-12">
                <Plug className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No connectors active</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Connect to CRMs to start syncing data
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeConnectors.map((connector: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-xl shadow-sm">
                        {connector.id === 'salesforce' ? '⚡' : connector.id === 'hubspot' ? '🧡' : '🟢'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{connector.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {connector.contacts.toLocaleString()} contacts
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      {connector.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary dark:text-blue-400" />
              Recent Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentContacts.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No contacts yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Connect a CRM or upload data to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 px-2 rounded transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center text-primary dark:text-blue-400 font-semibold mr-3">
                        {getInitials(contact.name)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{contact.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {contact.email || contact.phone || 'No contact info'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                        {contact.source}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(contact.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline with Transcript Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary dark:text-blue-400" />
              Recent Activity Timeline
            </CardTitle>
            {connectedCount > 0 && (
              <span className="text-xs px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">
                {recentActivities.length} Activities
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {connectedCount === 0 ? (
            <div className="text-center py-12">
              <Plug className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No CRMs connected</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Connect a CRM to see activity timeline with AI-powered transcript analysis
              </p>
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Activity will appear here when CRMs sync
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.slice(0, 5).map((activity: any, idx: number) => (
                <div 
                  key={idx}
                  className={`relative p-4 rounded-lg border-2 transition-all hover:shadow-lg ${getActivityColor(activity.type)}`}
                >
                  {/* Activity Card Content */}
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className="w-12 h-12 flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center text-2xl shadow-sm">
                      {getActivityIcon(activity.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                            {activity.title || 'Untitled Activity'}
                          </h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                            {activity.description || 'No description available'}
                          </p>
                        </div>
                        
                        {/* Connector Badge */}
                        <span className="ml-3 inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-700">
                          {activity.connector}
                        </span>
                      </div>

                      {/* Metadata Pills */}
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="flex items-center text-gray-600 dark:text-gray-400">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(activity.timestamp)}
                        </span>
                        {activity.dataSourceName && (
                          <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-400 rounded-full font-medium">
                            📊 {activity.dataSourceName}
                          </span>
                        )}
                      </div>

                      {/* AI Analysis Button */}
                      {activity.transcriptId && (
                        <Button
                          onClick={() => handleAnalyzeTranscript(activity)}
                          className="mt-3 flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md"
                          size="sm"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Analyze with AI Agent</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* View All Activities Link */}
          {connectedCount > 0 && recentActivities.length > 5 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
              <Link 
                to="/activity" 
                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                <Activity className="w-4 h-4 mr-2" />
                View All {recentActivities.length} Activities
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Analysis Modal/Overlay */}
      {(isAnalyzing || agentAnalysis) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center overflow-y-auto p-4" style={{ marginTop: '0px' }}>
          <div className="relative w-full max-w-6xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl max-h-[95vh] overflow-y-auto custom-scrollbar">
            {/* Close Button - Fixed position */}
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
                  <AgentAnalysisDisplay analysis={agentAnalysis as unknown as Parameters<typeof AgentAnalysisDisplay>[0]['analysis']} />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
