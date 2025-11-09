import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { uploadApi, gdriveApi, agentApi, connectorsApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/Card'
import { Button } from '@/components/Button'
import { VoiceRecorder } from '@/components/VoiceRecorder'
import { AgentAnalysisDisplay } from '@/components/AgentAnalysisDisplay'
import { 
  FileText, Upload as UploadIcon, 
  CheckCircle, XCircle,
  Zap, Sparkles, Users, Building2, DollarSign,
  FolderOpen, Download, Cloud, Plug
} from 'lucide-react'

// CRM Connector metadata for UI display
const dataConnectors = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    emoji: '⚡',
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    emoji: '🧡',
    color: 'bg-gradient-to-br from-orange-500 to-orange-600',
    borderColor: 'border-orange-200 dark:border-orange-800',
  },
  {
    id: 'pipedrive',
    name: 'Pipedrive',
    emoji: '🟢',
    color: 'bg-gradient-to-br from-green-500 to-green-600',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  {
    id: 'zoho',
    name: 'Zoho CRM',
    emoji: '🔷',
    color: 'bg-gradient-to-br from-red-500 to-red-600',
    borderColor: 'border-red-200 dark:border-red-800',
  },
  {
    id: 'monday',
    name: 'Monday.com',
    emoji: '🔴',
    color: 'bg-gradient-to-br from-pink-500 to-pink-600',
    borderColor: 'border-pink-200 dark:border-pink-800',
  },
  {
    id: 'zendesk',
    name: 'Zendesk Sell',
    emoji: '🌱',
    color: 'bg-gradient-to-br from-teal-500 to-teal-600',
    borderColor: 'border-teal-200 dark:border-teal-800',
  },
]

type SelectedSource = 'gdrive' | 'gmail' | 'voice' | 'transcript' | null

interface UploadResult {
  success: boolean
  message: string
  extracted_data?: {
    contact_name?: string
    contact_email?: string
    contact_phone?: string
    company_name?: string
    deal_title?: string
    deal_value?: number
    next_step?: string
    summary?: string
    sentiment?: string
  }
}

export default function Upload() {
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null)
  const [selectedSource, setSelectedSource] = useState<SelectedSource>(null)
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null)
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [showGDriveModal, setShowGDriveModal] = useState(false)
  const [agentAnalysis, setAgentAnalysis] = useState<Record<string, unknown> | null>(null)
  const [showAgentAnalysis, setShowAgentAnalysis] = useState(false)
  const queryClient = useQueryClient()

  // Fetch all connectors (CRMs)
  const { data: connectorsData } = useQuery({
    queryKey: ['connectors'],
    queryFn: async () => {
      const response = await connectorsApi.list()
      return response.data
    },
  })

  // Fetch selected connector details (with data sources)
  const { data: selectedConnectorData } = useQuery({
    queryKey: ['connector', selectedConnector],
    queryFn: async () => {
      if (!selectedConnector) return null
      const response = await connectorsApi.get(selectedConnector)
      return response.data
    },
    enabled: !!selectedConnector,
  })

  // Connect data source mutation
  const connectDataSourceMutation = useMutation({
    mutationFn: ({ connectorId, dataSourceId }: { connectorId: string; dataSourceId: string }) =>
      connectorsApi.connectDataSource(connectorId, dataSourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectors'] })
      queryClient.invalidateQueries({ queryKey: ['connector', selectedConnector] })
      queryClient.invalidateQueries({ queryKey: ['connector-summary'] })
    },
  })

  // Disconnect data source mutation
  const disconnectDataSourceMutation = useMutation({
    mutationFn: ({ connectorId, dataSourceId }: { connectorId: string; dataSourceId: string }) =>
      connectorsApi.disconnectDataSource(connectorId, dataSourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectors'] })
      queryClient.invalidateQueries({ queryKey: ['connector', selectedConnector] })
      queryClient.invalidateQueries({ queryKey: ['connector-summary'] })
    },
  })

  // Get CRM connectors only
  const crmConnectors = connectorsData?.connectors?.filter((c: { type: string }) => c.type === 'crm') || []
  
  // Handle data source connect/disconnect toggle
  const handleToggleDataSource = (dataSourceId: string, isConnected: boolean) => {
    if (!selectedConnector) return
    if (isConnected) {
      disconnectDataSourceMutation.mutate({ connectorId: selectedConnector, dataSourceId })
    } else {
      connectDataSourceMutation.mutate({ connectorId: selectedConnector, dataSourceId })
    }
  }

  const getDataSourceIcon = (iconName: string) => {
    switch (iconName) {
      case 'phone': return '📞'
      case 'mail': return '📧'
      case 'video': return '📹'
      case 'message': return '💬'
      case 'mic': return '🎤'
      case 'file': return '📝'
      default: return '📄'
    }
  }

  // Fetch Google Drive files
  const { data: gdriveFiles = [], isLoading: gdriveLoading, refetch: refetchGDriveFiles } = useQuery({
    queryKey: ['gdrive-files'],
    queryFn: async () => {
      const response = await gdriveApi.listFiles()
      return response.data
    },
    enabled: showGDriveModal || selectedSource === 'gdrive',
  })

  // Fetch Google Drive status
  const { data: gdriveStatus, refetch: refetchGDriveStatus } = useQuery({
    queryKey: ['gdrive-status'],
    queryFn: async () => {
      const response = await gdriveApi.status()
      return response.data
    },
    enabled: showGDriveModal || selectedSource === 'gdrive',
  })

  // Check for OAuth callback
  useState(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('connected') === 'true') {
      setShowGDriveModal(true)
      setSelectedSource('gdrive')
      refetchGDriveStatus()
      refetchGDriveFiles()
      // Clear URL params
      window.history.replaceState({}, '', '/upload')
    } else if (params.get('error')) {
      setResult({
        success: false,
        message: `Google Drive connection failed: ${params.get('error')}`
      })
      window.history.replaceState({}, '', '/upload')
    }
  })

  // Import from Google Drive mutation
  const gdriveImportMutation = useMutation({
    mutationFn: async (fileId: string) => {
      return await gdriveApi.importFile(fileId)
    },
    onSuccess: (response) => {
      setResult(response.data)
      setShowGDriveModal(false)
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['connector-summary'] })
    },
    onError: (error: Error) => {
      const errorMessage = (error as Error & { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Import failed'
      setResult({ success: false, message: errorMessage })
    },
  })

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (selectedSource === 'voice') {
        if (recordedAudio) {
          const audioFile = new File([recordedAudio], 'recording.webm', { type: 'audio/webm' })
          return await uploadApi.voice(audioFile, 'webm')
        } else if (file) {
          return await uploadApi.voice(file)
        }
        throw new Error('No audio file selected or recorded')
      } else if (selectedSource === 'gmail') {
        return await uploadApi.email(content)
      } else {
        return await uploadApi.transcript(content)
      }
    },
    onSuccess: async (response) => {
      setResult(response.data)
      
      setContent('')
      setFile(null)
      setRecordedAudio(null)
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['interactions'] })
      queryClient.invalidateQueries({ queryKey: ['connector-summary'] })
      
      // Trigger AI Agent analysis for transcripts automatically
      if (selectedSource === 'transcript' && content.length > 100) {
        try {
          const agentResponse = await agentApi.analyze(content, 'customer_service')
          setAgentAnalysis(agentResponse.data as Record<string, unknown>)
          setShowAgentAnalysis(true)
        } catch (error) {
          console.error('Agent analysis failed:', error)
        }
      }
    },
    onError: (error: Error) => {
      const errorMessage = (error as Error & { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Upload failed'
      setResult({ success: false, message: errorMessage })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setResult(null)
    uploadMutation.mutate()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setRecordedAudio(null)
    }
  }

  const handleTranscriptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setTranscriptFile(selectedFile)
      
      // Read file content automatically
      try {
        const text = await selectedFile.text()
        
        // Try to parse as JSON first
        try {
          const json = JSON.parse(text)
          
          // Handle different JSON formats
          let processedText = text
          
          // If it has call_transcript array (like your format)
          if (json.call_transcript && Array.isArray(json.call_transcript)) {
            processedText = json.call_transcript.join('\n')
          }
          // If it has transcript field
          else if (json.transcript) {
            processedText = typeof json.transcript === 'string' 
              ? json.transcript 
              : JSON.stringify(json.transcript)
          }
          // If it has messages array
          else if (json.messages && Array.isArray(json.messages)) {
            processedText = json.messages.map((m: { content?: string, text?: string }) => 
              m.content || m.text || ''
            ).join('\n')
          }
          
          setContent(processedText)
        } catch {
          // Not JSON or JSON parsing failed, use raw text
          setContent(text)
        }
      } catch (error) {
        console.error('Error reading file:', error)
        setResult({
          success: false,
          message: 'Failed to read file. Please make sure it\'s a text file.'
        })
      }
    }
  }

  const handleRecordingComplete = (audioBlob: Blob) => {
    setRecordedAudio(audioBlob)
    setFile(null)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Enhanced Header with AI Badge */}
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Data Import Center</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Connect your data sources and let AI automatically populate your CRM
            </p>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3">
              <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">3</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Sources</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">98%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy Rate</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">Auto</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Smart Extraction</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CRM Connectors Grid - Choose which CRM's data sources to manage */}
      {!selectedConnector && !selectedSource && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Select a CRM Connector</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Choose which CRM's data sources you want to connect or manage
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crmConnectors.map((connector: { id: string; name: string; connected: boolean; stats: { contacts: number } }) => {
              const meta = dataConnectors.find(dc => dc.id === connector.id)
              if (!meta) return null
              
              return (
                <div
                  key={connector.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedConnector(connector.id)}
                >
                  <Card
                    className={`relative overflow-hidden transition-all duration-300 border-2 ${meta.borderColor} hover:scale-105 hover:shadow-2xl`}
                  >
                    {connector.connected && (
                      <div className="absolute top-3 right-3 z-10">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                    )}

                    <CardContent className="p-6">
                      <div className={`w-20 h-20 ${meta.color} rounded-2xl flex items-center justify-center shadow-xl mb-4`}>
                        <span className="text-4xl">{meta.emoji}</span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {connector.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {connector.connected ? `${connector.stats.contacts} contacts synced` : 'Not connected'}
                      </p>

                      <Button className="w-full" size="sm">
                        View Data Sources
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Data Sources for Selected CRM */}
      {selectedConnector && !selectedSource && selectedConnectorData && (
        <div>
          <Button variant="outline" onClick={() => setSelectedConnector(null)} className="mb-6">
            ← Back to CRM Connectors
          </Button>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {selectedConnectorData.name} - Data Sources
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Connect or disconnect data sources for {selectedConnectorData.name}
            </p>
          </div>

          {selectedConnectorData.dataSources && selectedConnectorData.dataSources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedConnectorData.dataSources.map((ds: { id: string; name: string; connected: boolean; count: number; icon: string; type: string }) => (
                <Card
                  key={ds.id}
                  className={`relative overflow-hidden transition-all duration-300 border-2 ${
                    ds.connected
                      ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:shadow-lg'
                  }`}
                >
                  {ds.connected && (
                    <div className="absolute top-3 right-3 z-10">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  )}

                  <CardContent className="p-6">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl mb-4 ${
                      ds.connected
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                        : 'bg-gradient-to-br from-gray-400 to-gray-500'
                    }`}>
                      <span className="text-4xl">{getDataSourceIcon(ds.icon)}</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {ds.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {ds.count} items available • {ds.type}
                    </p>

                    <Button
                      className={`w-full ${
                        ds.connected
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                      size="sm"
                      onClick={() => handleToggleDataSource(ds.id, ds.connected)}
                      disabled={connectDataSourceMutation.isPending || disconnectDataSourceMutation.isPending}
                    >
                      {ds.connected ? (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Disconnect
                        </>
                      ) : (
                        <>
                          <Plug className="w-4 h-4 mr-2" />
                          Connect
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No data sources available for this connector yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Upload Form */}
      {selectedSource && (
        <div className="space-y-6">
          {/* Back Button */}
          <Button variant="outline" onClick={() => setSelectedSource(null)}>
            ← Back to Connectors
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>
                {selectedSource === 'gmail'
                  ? 'Import Gmail'
                  : selectedSource === 'voice'
                  ? 'Upload Voice Recording'
                  : 'Upload Meeting Transcript'}
              </CardTitle>
              <CardDescription>
                Our AI will automatically extract contacts, companies, deals, and action items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {selectedSource === 'voice' ? (
                  <div className="space-y-4">
                    {/* Record Audio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Record Audio (Browser)
                      </label>
                      <VoiceRecorder
                        onRecordingComplete={handleRecordingComplete}
                        onError={(error) => setResult({ success: false, message: error })}
                      />
                      {recordedAudio && (
                        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                          <p className="text-sm text-green-700 dark:text-green-400">
                            ✓ Recording ready ({(recordedAudio.size / 1024).toFixed(1)} KB)
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">or</span>
                      </div>
                    </div>

                    {/* Upload File */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Upload Audio File
                      </label>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 dark:text-gray-400
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary dark:file:bg-blue-600 file:text-white
                          hover:file:bg-primary/90 dark:hover:file:bg-blue-500"
                      />
                      {file && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  </div>
                ) : selectedSource === 'gdrive' ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400">
                      Please use the Google Drive file browser to select and import files.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Text Area */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {selectedSource === 'gmail' ? 'Email Content' : 'Transcript Content'}
                      </label>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={12}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-500"
                        placeholder={
                          selectedSource === 'gmail'
                            ? 'Paste the full email content here...'
                            : 'Paste the transcript content here or upload a file below...'
                        }
                      />
                      {content && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {content.length} characters
                        </p>
                      )}
                    </div>

                    {/* File Upload for Transcript */}
                    {selectedSource === 'transcript' && (
                      <>
                        {/* Divider */}
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">or</span>
                          </div>
                        </div>

                        {/* Upload File */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Upload Transcript File
                          </label>
                          <input
                            type="file"
                            accept=".txt,.json,.md,.doc,.docx,text/*"
                            onChange={handleTranscriptFileChange}
                            className="block w-full text-sm text-gray-500 dark:text-gray-400
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-md file:border-0
                              file:text-sm file:font-semibold
                              file:bg-blue-500 file:text-white
                              hover:file:bg-blue-600 transition-colors"
                          />
                          {transcriptFile && (
                            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                              <p className="text-sm text-blue-700 dark:text-blue-400 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Loaded: {transcriptFile.name} ({(transcriptFile.size / 1024).toFixed(1)} KB)
                              </p>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Supports .txt, .json, .md, and other text formats
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={uploadMutation.isPending || (selectedSource === 'voice' ? (!file && !recordedAudio) : !content)}
                  className="w-full"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing with AI...
                    </>
                  ) : (
                    <>
                      <UploadIcon className="w-5 h-5 mr-2" />
                      Upload & Extract Data
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Result */}
      {result && (
        <Card className={result.success ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'}>
          <CardHeader>
            <div className="flex items-center space-x-2">
              {result.success ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <CardTitle className="text-green-900 dark:text-green-100">Success!</CardTitle>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  <CardTitle className="text-red-900 dark:text-red-100">Error</CardTitle>
                </>
              )}
            </div>
            <CardDescription className={result.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
              {result.message}
            </CardDescription>
          </CardHeader>
          {result.success && result.extracted_data && (
            <CardContent>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI Extracted Information</h4>
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </div>

                {/* Contact Info */}
                {(result.extracted_data.contact_name || result.extracted_data.contact_email) && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center mb-2">
                      <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                      <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">Contact</span>
                    </div>
                    {result.extracted_data.contact_name && (
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        <strong>Name:</strong> {result.extracted_data.contact_name}
                      </p>
                    )}
                    {result.extracted_data.contact_email && (
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        <strong>Email:</strong> {result.extracted_data.contact_email}
                      </p>
                    )}
                  </div>
                )}

                {/* Company Info */}
                {result.extracted_data.company_name && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center mb-2">
                      <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2" />
                      <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">Company</span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{result.extracted_data.company_name}</p>
                  </div>
                )}

                {/* Deal Info */}
                {(result.extracted_data.deal_title || result.extracted_data.deal_value) && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center mb-2">
                      <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                      <span className="text-sm font-semibold text-green-900 dark:text-green-100">Deal</span>
                    </div>
                    {result.extracted_data.deal_title && (
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        <strong>Title:</strong> {result.extracted_data.deal_title}
                      </p>
                    )}
                    {result.extracted_data.deal_value && (
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        <strong>Value:</strong> ${result.extracted_data.deal_value.toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Items */}
                {result.extracted_data.next_step && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mr-2" />
                      <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">Action Items</span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{result.extracted_data.next_step}</p>
                  </div>
                )}

                {/* Meeting Summary */}
                {result.extracted_data.summary && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center mb-2">
                      <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-2" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Summary</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{result.extracted_data.summary}</p>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* AI Agent Analysis - The Star of the Show! */}
      {showAgentAnalysis && agentAnalysis && (
        <div className="mt-8">
          <AgentAnalysisDisplay analysis={agentAnalysis as unknown as Parameters<typeof AgentAnalysisDisplay>[0]['analysis']} />
        </div>
      )}

      {/* Google Drive File Browser Modal */}
      {showGDriveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700">
              <div>
                <CardTitle className="flex items-center">
                  <Cloud className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
                  Google Drive Files
                  {gdriveStatus?.connected && (
                    <span className="ml-3 text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full">
                      Connected
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  {gdriveStatus?.connected 
                    ? "Browse and import your files with AI extraction" 
                    : "Connect your Google account to access your Drive files"}
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setShowGDriveModal(false)
                  setSelectedSource(null)
                }}
              >
                <XCircle className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6">
              {/* Connection Status Banner */}
              {!gdriveStatus?.connected && (
                <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Cloud className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Connect Your Google Drive
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Sign in with your Google account to access your meeting transcripts, documents, and notes. 
                        We'll only read files you explicitly select.
                      </p>
                      <Button
                        onClick={async () => {
                          try {
                            const response = await gdriveApi.auth()
                            console.log('Auth response:', response.data)
                            // Open OAuth URL in current window
                            window.location.href = response.data.authorization_url
                          } catch (error) {
                            console.error('Auth error:', error)
                            const errorMessage = error instanceof Error 
                              ? error.message 
                              : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Unknown error'
                            setResult({
                              success: false,
                              message: `Failed to connect: ${errorMessage}`
                            })
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Cloud className="w-4 h-4 mr-2" />
                        Sign in with Google
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Connected - Show Files */}
              {gdriveStatus?.connected && (
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 inline mr-1 text-green-600 dark:text-green-400" />
                    Connected to your Google Drive
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        await gdriveApi.disconnect()
                        refetchGDriveStatus()
                        refetchGDriveFiles()
                      } catch (error) {
                        console.error('Failed to disconnect:', error)
                      }
                    }}
                  >
                    Disconnect
                  </Button>
                </div>
              )}

              {/* File List */}
              {gdriveLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="ml-3 text-gray-600 dark:text-gray-400">Loading your files...</p>
                </div>
              ) : gdriveFiles.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {gdriveStatus?.connected ? 'No files found in your Google Drive' : 'Connect to see your files'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {gdriveFiles.map((file: { id: string, name: string, mimeType: string, size?: string, modifiedTime: string, isDemo?: boolean }) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          {file.mimeType.includes('folder') ? (
                            <FolderOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {file.size ? `${(parseInt(file.size) / 1024).toFixed(1)} KB` : 'Folder'} • 
                            Modified {new Date(file.modifiedTime).toLocaleDateString()}
                            {file.isDemo && <span className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 px-2 py-0.5 rounded">Demo</span>}
                          </p>
                        </div>
                      </div>
                      {!file.mimeType.includes('folder') && (
                        <Button
                          size="sm"
                          onClick={() => gdriveImportMutation.mutate(file.id)}
                          disabled={gdriveImportMutation.isPending}
                        >
                          {gdriveImportMutation.isPending ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Importing...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Import & Analyze
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
