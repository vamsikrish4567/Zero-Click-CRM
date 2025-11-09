import axios from 'axios'
import type { Contact, Company, Interaction, Deal, UploadResponse } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // Enable sending cookies
})

// Google Drive
export const gdriveApi = {
  auth: () => api.get('/gdrive/auth'),
  status: () => api.get('/gdrive/status'),
  listFiles: (folderId?: string, fileTypes?: string) => 
    api.get('/gdrive/files', { params: { folder_id: folderId, file_types: fileTypes } }),
  importFile: (fileId: string) => api.post(`/gdrive/import/${fileId}`),
  disconnect: () => api.post('/gdrive/disconnect'),
}

// Connectors
export const connectorsApi = {
  list: () => api.get('/connectors'),
  get: (id: string) => api.get(`/connectors/${id}`),
  connect: (id: string) => api.post(`/connectors/${id}/connect`),
  disconnect: (id: string) => api.post(`/connectors/${id}/disconnect`),
  getContacts: (id: string) => api.get(`/connectors/${id}/contacts`),
  getDeals: (id: string) => api.get(`/connectors/${id}/deals`),
  getSummary: () => api.get('/connectors/stats/summary'),
  getTranscripts: (id: string) => api.get(`/connectors/${id}/transcripts`),
  getTranscript: (id: string, transcriptId: string) => api.get(`/connectors/${id}/transcripts/${transcriptId}`),
  // Data Source Management
  connectDataSource: (connectorId: string, dataSourceId: string) =>
    api.post(`/connectors/${connectorId}/datasources/${dataSourceId}/connect`),
  disconnectDataSource: (connectorId: string, dataSourceId: string) =>
    api.post(`/connectors/${connectorId}/datasources/${dataSourceId}/disconnect`),
}

// Contacts
export const contactsApi = {
  list: () => api.get<Contact[]>('/contacts'),
  get: (id: string) => api.get<Contact>(`/contacts/${id}`),
  create: (data: Partial<Contact>) => api.post<Contact>('/contacts', data),
  update: (id: string, data: Partial<Contact>) => api.patch<Contact>(`/contacts/${id}`, data),
  delete: (id: string) => api.delete(`/contacts/${id}`),
}

// Companies
export const companiesApi = {
  list: () => api.get<Company[]>('/companies'),
  get: (id: string) => api.get<Company>(`/companies/${id}`),
  create: (data: Partial<Company>) => api.post<Company>('/companies', data),
  update: (id: string, data: Partial<Company>) => api.patch<Company>(`/companies/${id}`, data),
  delete: (id: string) => api.delete(`/companies/${id}`),
}

// Interactions
export const interactionsApi = {
  list: (contactId?: string) => 
    api.get<Interaction[]>('/interactions', { params: { contact_id: contactId } }),
  get: (id: string) => api.get<Interaction>(`/interactions/${id}`),
  create: (data: Partial<Interaction>) => api.post<Interaction>('/interactions', data),
}

// Deals
export const dealsApi = {
  list: (stage?: string) => api.get<Deal[]>('/deals', { params: { stage } }),
  get: (id: string) => api.get<Deal>(`/deals/${id}`),
  create: (data: Partial<Deal>) => api.post<Deal>('/deals', data),
  update: (id: string, data: Partial<Deal>) => api.patch<Deal>(`/deals/${id}`, data),
  delete: (id: string) => api.delete(`/deals/${id}`),
  getAtRisk: (days: number = 14) => api.get<Deal[]>(`/deals/at-risk`, { params: { days } }),
}

// Upload
export const uploadApi = {
  email: (content: string) => {
    const formData = new FormData()
    formData.append('content', content)
    return api.post<UploadResponse>('/upload/email', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  voice: (file: File, audioFormat: string = 'mp3') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('audio_format', audioFormat)
    return api.post<UploadResponse>('/upload/voice', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  transcript: (content: string) => {
    const formData = new FormData()
    formData.append('content', content)
    return api.post<UploadResponse>('/upload/transcript', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// AI Agent
export const agentApi = {
  analyze: (transcript: string, context: string = 'customer_service') =>
    api.post('/agent/analyze', { transcript, context }),
  quickSummary: (transcript: string, context: string = 'customer_service') =>
    api.post('/agent/quick-summary', { transcript, context }),
  chat: (query: string, context: any = {}) =>
    api.post('/agent/chat', { query, context }),
}

export default api



