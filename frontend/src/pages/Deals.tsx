import { useQuery } from '@tanstack/react-query'
import { dealsApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/Card'
import { DollarSign, Calendar, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const stageColors = {
  discovery: 'bg-blue-100 text-blue-700 border-blue-200',
  proposal: 'bg-purple-100 text-purple-700 border-purple-200',
  negotiation: 'bg-orange-100 text-orange-700 border-orange-200',
  closed_won: 'bg-green-100 text-green-700 border-green-200',
  closed_lost: 'bg-gray-100 text-gray-700 border-gray-200',
}

export default function Deals() {
  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const response = await dealsApi.list()
      return response.data
    },
  })

  const activeDeals = deals.filter(
    deal => deal.stage !== 'closed_won' && deal.stage !== 'closed_lost'
  )
  const totalValue = activeDeals.reduce((sum, deal) => sum + (deal.value || 0), 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-500 mt-1">
            {activeDeals.length} active deals • {formatCurrency(totalValue)} in pipeline
          </p>
        </div>
      </div>

      {deals.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No deals yet</h3>
              <p className="text-gray-500 mb-6">
                Deals will be automatically created when AI detects opportunities in your communications
              </p>
              <a
                href="/upload"
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Upload Content
              </a>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Pipeline Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['discovery', 'proposal', 'negotiation', 'closed_won'].map((stage) => {
              const stageDeals = deals.filter(d => d.stage === stage)
              const stageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0)
              return (
                <Card key={stage}>
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium text-gray-600 capitalize mb-2">
                      {stage.replace('_', ' ')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stageValue)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {stageDeals.length} {stageDeals.length === 1 ? 'deal' : 'deals'}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Deals List */}
          <div className="space-y-4">
            {deals.map((deal) => (
              <Card key={deal.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{deal.title}</CardTitle>
                      {deal.next_step && (
                        <CardDescription className="mt-2">
                          Next: {deal.next_step}
                        </CardDescription>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(deal.value)}
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium border mt-2 ${
                          stageColors[deal.stage as keyof typeof stageColors]
                        }`}
                      >
                        {deal.stage.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    {deal.next_step_date && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Due: {formatDate(deal.next_step_date)}</span>
                      </div>
                    )}
                    {deal.last_interaction && (
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        <span>Last contact: {formatDate(deal.last_interaction)}</span>
                      </div>
                    )}
                    <div className="flex items-center ml-auto">
                      <span className="text-xs text-gray-500">
                        Created {formatDate(deal.created_at)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}




