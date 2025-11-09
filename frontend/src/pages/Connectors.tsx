import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { connectorsApi } from '@/services/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { CheckCircle, XCircle, Plug, Users, TrendingUp, Calendar, Phone, Mail, Video, MessageSquare, Mic, FileText } from 'lucide-react'

// CRM Connector definitions
const connectorMeta = [
  { id: 'salesforce', name: 'Salesforce', description: 'World\'s #1 CRM platform', logo: '⚡', color: 'bg-blue-500' },
  { id: 'hubspot', name: 'HubSpot', description: 'Inbound marketing & sales', logo: '🧡', color: 'bg-orange-500' },
  { id: 'pipedrive', name: 'Pipedrive', description: 'Sales-focused CRM', logo: '🟢', color: 'bg-green-500' },
  { id: 'zoho', name: 'Zoho CRM', description: 'Complete business suite', logo: '🔷', color: 'bg-red-500' },
  { id: 'monday', name: 'Monday.com', description: 'Work OS for teams', logo: '🔴', color: 'bg-pink-500' },
  { id: 'zendesk', name: 'Zendesk Sell', description: 'Customer service CRM', logo: '🌱', color: 'bg-teal-500' },
]

export default function Connectors() {
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Fetch all connectors
  const { data: connectorsData, isLoading } = useQuery({
    queryKey: ['connectors'],
    queryFn: async () => {
      const response = await connectorsApi.list()
      return response.data
    },
  })

  // Fetch selected connector details
  const { data: selectedData } = useQuery({
    queryKey: ['connector', selectedConnector],
    queryFn: async () => {
      if (!selectedConnector) return null
      const response = await connectorsApi.get(selectedConnector)
      return response.data
    },
    enabled: !!selectedConnector,
  })

  // Connect mutation
  const connectMutation = useMutation({
    mutationFn: (id: string) => connectorsApi.connect(id),
    onSuccess: () => {
      // Invalidate all related queries to refresh ChatWidget and Dashboard
      queryClient.invalidateQueries({ queryKey: ['connectors'] })
      queryClient.invalidateQueries({ queryKey: ['connector-summary'] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: (id: string) => connectorsApi.disconnect(id),
    onSuccess: () => {
      // Invalidate all related queries to refresh ChatWidget and Dashboard
      queryClient.invalidateQueries({ queryKey: ['connectors'] })
      queryClient.invalidateQueries({ queryKey: ['connector-summary'] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })

  // Connect data source mutation
  const connectDataSourceMutation = useMutation({
    mutationFn: ({ connectorId, dataSourceId }: { connectorId: string; dataSourceId: string }) =>
      connectorsApi.connectDataSource(connectorId, dataSourceId),
    onSuccess: () => {
      // Invalidate all related queries - this notifies ChatWidget automatically
      queryClient.invalidateQueries({ queryKey: ['connectors'] })
      queryClient.invalidateQueries({ queryKey: ['connector', selectedConnector] })
      queryClient.invalidateQueries({ queryKey: ['connector-summary'] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })

  // Disconnect data source mutation
  const disconnectDataSourceMutation = useMutation({
    mutationFn: ({ connectorId, dataSourceId }: { connectorId: string; dataSourceId: string }) =>
      connectorsApi.disconnectDataSource(connectorId, dataSourceId),
    onSuccess: () => {
      // Invalidate all related queries - this notifies ChatWidget automatically
      queryClient.invalidateQueries({ queryKey: ['connectors'] })
      queryClient.invalidateQueries({ queryKey: ['connector', selectedConnector] })
      queryClient.invalidateQueries({ queryKey: ['connector-summary'] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })

  const connectors = connectorsData?.connectors || []
  const connectedCount = connectors.filter((c: any) => c.connected).length
  const totalContacts = connectors.reduce((sum: number, c: any) => sum + c.stats.contacts, 0)
  const totalDeals = connectors.reduce((sum: number, c: any) => sum + c.stats.deals, 0)

  const handleConnect = (id: string, connected: boolean) => {
    if (connected) {
      disconnectMutation.mutate(id)
    } else {
      connectMutation.mutate(id)
    }
  }

  const handleDataSourceToggle = (connectorId: string, dataSourceId: string, isConnected: boolean) => {
    if (isConnected) {
      disconnectDataSourceMutation.mutate({ connectorId, dataSourceId })
    } else {
      connectDataSourceMutation.mutate({ connectorId, dataSourceId })
    }
  }

  const getDataSourceIcon = (iconName: string) => {
    switch (iconName) {
      case 'phone': return Phone
      case 'mail': return Mail
      case 'video': return Video
      case 'message': return MessageSquare
      case 'mic': return Mic
      case 'file': return FileText
      default: return FileText
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">CRM Connectors</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Connect to your existing CRM systems and consolidate all your data in one place
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Connected CRMs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {connectedCount} / {connectors.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Plug className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Contacts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalContacts.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-3 text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-4">Loading connectors...</p>
          </div>
        ) : (
          connectorMeta.map((meta) => {
            const connector = connectors.find((c: any) => c.id === meta.id)
            const isConnected = connector?.connected || false
            const stats = connector?.stats || { contacts: 0, deals: 0, companies: 0, lastSync: null }

            return (
              <Card key={meta.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${meta.color} rounded-lg flex items-center justify-center text-2xl shadow-md`}>
                        {meta.logo}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{meta.name}</CardTitle>
                        <CardDescription>{meta.description}</CardDescription>
                      </div>
                    </div>
                    {isConnected ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isConnected ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Contacts</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.contacts.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Deals</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.deals}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Last Sync</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {stats.lastSync ? new Date(stats.lastSync).toLocaleString() : 'Never'}
                        </span>
                      </div>
                      <Button
                        onClick={() => setSelectedConnector(meta.id)}
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                      >
                        Manage Data Sources
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Connect to start syncing data from {meta.name}
                      </p>
                      <Button
                        onClick={() => setSelectedConnector(meta.id)}
                        className="w-full"
                        size="sm"
                      >
                        <Plug className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Detail Modal - with Data Sources and Connector Management */}
      {selectedData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setSelectedConnector(null)}>
          <Card className="w-full max-w-4xl max-h-[85vh] overflow-y-auto custom-scrollbar" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${connectorMeta.find(m => m.id === selectedData.id)?.color} rounded-lg flex items-center justify-center text-2xl shadow-md`}>
                    {connectorMeta.find(m => m.id === selectedData.id)?.logo}
                  </div>
                  <div>
                    <CardTitle>{selectedData.name}</CardTitle>
                    <CardDescription>Manage connector and data sources</CardDescription>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedConnector(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* CRM Connection Section */}
              <div className="p-4 rounded-lg border-2 transition-all bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${selectedData.connected ? 'bg-green-100 dark:bg-green-900/40' : 'bg-gray-200 dark:bg-gray-700'}`}>
                      <Plug className={`w-6 h-6 ${selectedData.connected ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                        {selectedData.connected ? '✅ Connected' : '⚠️ Not Connected'}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedData.connected 
                          ? `Last synced: ${selectedData.stats.lastSync ? new Date(selectedData.stats.lastSync).toLocaleString() : 'Never'}` 
                          : 'Connect to enable data sources'}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleConnect(selectedData.id, selectedData.connected)}
                    size="lg"
                    className={selectedData.connected ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                    disabled={connectMutation.isPending || disconnectMutation.isPending}
                  >
                    {selectedData.connected ? (
                      <>
                        <XCircle className="w-5 h-5 mr-2" />
                        Disconnect CRM
                      </>
                    ) : (
                      <>
                        <Plug className="w-5 h-5 mr-2" />
                        Connect CRM
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Data Sources Section - Only show if connected */}
              {selectedData.connected && selectedData.dataSources && selectedData.dataSources.length > 0 && (
                <div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <Plug className="w-5 h-5 mr-2" />
                    Data Sources
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedData.dataSources.map((ds: any) => {
                      const IconComponent = getDataSourceIcon(ds.icon)
                      return (
                        <div
                          key={ds.id}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            ds.connected
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${
                                ds.connected
                                  ? 'bg-green-100 dark:bg-green-900/40'
                                  : 'bg-gray-200 dark:bg-gray-700'
                              }`}>
                                <IconComponent className={`w-5 h-5 ${
                                  ds.connected
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-gray-500 dark:text-gray-400'
                                }`} />
                              </div>
                              <div>
                                <h5 className="font-semibold text-gray-900 dark:text-gray-100">{ds.name}</h5>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{ds.type}</p>
                              </div>
                            </div>
                            {ds.connected && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                          
                          <Button
                            onClick={() => handleDataSourceToggle(selectedData.id, ds.id, ds.connected)}
                            size="sm"
                            className={`w-full ${
                              ds.connected
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
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
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      💡 <strong>Tip:</strong> Connect data sources to see their activities in the Dashboard timeline. Each data source (calls, emails, meetings) can be independently managed.
                    </p>
                  </div>
                </div>
              )}

              {/* Not Connected Message */}
              {!selectedData.connected && (
                <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plug className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Connect {selectedData.name} First
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You need to connect the CRM before you can manage its data sources.
                  </p>
                  <Button
                    onClick={() => handleConnect(selectedData.id, false)}
                    size="lg"
                    className="bg-green-500 hover:bg-green-600"
                    disabled={connectMutation.isPending}
                  >
                    <Plug className="w-5 h-5 mr-2" />
                    Connect {selectedData.name}
                  </Button>
                </div>
              )}

              {/* Stats Grid - Only show if connected */}
              {selectedData.connected && (
                <div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4">Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-700 dark:text-blue-300">Contacts</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                        {selectedData.stats.contacts.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-sm text-purple-700 dark:text-purple-300">Deals</p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                        {selectedData.stats.deals}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-700 dark:text-green-300">Companies</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                        {selectedData.stats.companies || 0}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <p className="text-sm text-orange-700 dark:text-orange-300">Transcripts</p>
                      <p className="text-2xl font-bold text-orange-900 dark:text-orange-100 mt-1">
                        {selectedData.stats.transcripts || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Contacts - Only show if connected */}
              {selectedData.connected && selectedData.contacts && selectedData.contacts.length > 0 && (
                <div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4">Recent Contacts</h4>
                  <div className="space-y-2">
                    {selectedData.contacts.slice(0, 5).map((contact: any) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                            {contact.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{contact.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{contact.email}</p>
                          </div>
                        </div>
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full font-medium">
                          {contact.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
