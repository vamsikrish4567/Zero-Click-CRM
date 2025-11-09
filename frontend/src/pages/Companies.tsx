import { useQuery } from '@tanstack/react-query'
import { companiesApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Building2, Globe, Users as UsersIcon } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function Companies() {
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await companiesApi.list()
      return response.data
    },
  })

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
          <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-500 mt-1">
            {companies.length} companies auto-populated from your communications
          </p>
        </div>
      </div>

      {companies.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No companies yet</h3>
              <p className="text-gray-500 mb-6">
                Companies will be automatically extracted from your communications
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card key={company.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{company.name}</CardTitle>
                    {company.industry && (
                      <p className="text-sm text-gray-500 mt-1">{company.industry}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {company.website && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Globe className="w-4 h-4 mr-2" />
                    <a
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
                {company.size && (
                  <div className="flex items-center text-sm text-gray-600">
                    <UsersIcon className="w-4 h-4 mr-2" />
                    <span>{company.size} employees</span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    Added {formatDate(company.created_at)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}




