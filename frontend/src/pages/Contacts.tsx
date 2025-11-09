import { useQuery } from '@tanstack/react-query'
import { contactsApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Users, Mail, Phone, Briefcase } from 'lucide-react'
import { getInitials, formatDate } from '@/lib/utils'

export default function Contacts() {
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const response = await contactsApi.list()
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
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-500 mt-1">
            {contacts.length} contacts auto-populated from your communications
          </p>
        </div>
      </div>

      {contacts.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts yet</h3>
              <p className="text-gray-500 mb-6">
                Upload an email, voice note, or transcript to automatically create contacts
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
          {contacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                    {getInitials(contact.name)}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{contact.name}</CardTitle>
                    {contact.title && (
                      <p className="text-sm text-gray-500 mt-1">{contact.title}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {contact.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{contact.phone}</span>
                  </div>
                )}
                {contact.company_id && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Briefcase className="w-4 h-4 mr-2" />
                    <span>Company linked</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {contact.source}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(contact.created_at)}
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




