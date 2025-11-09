export interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  company_id?: string
  title?: string
  source: 'email' | 'voice' | 'manual' | 'call'
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  website?: string
  industry?: string
  size?: string
  created_at: string
  updated_at: string
}

export interface Interaction {
  id: string
  contact_id: string
  type: 'email' | 'call' | 'voice_note' | 'meeting'
  date: string
  summary: string
  raw_content?: string
  sentiment?: 'positive' | 'neutral' | 'negative'
  extracted_entities: string[]
  created_at: string
}

export interface Deal {
  id: string
  contact_id: string
  company_id?: string
  title: string
  value?: number
  stage: 'discovery' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  next_step?: string
  next_step_date?: string
  last_interaction?: string
  created_at: string
  updated_at: string
}

export interface ExtractedData {
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  contact_title?: string
  company_name?: string
  company_website?: string
  deal_title?: string
  deal_value?: number
  next_step?: string
  next_step_date?: string
  summary?: string
  sentiment?: string
  entities: string[]
}

export interface UploadResponse {
  success: boolean
  message: string
  extracted_data?: ExtractedData
  contact_id?: string
  company_id?: string
  interaction_id?: string
  deal_id?: string
}




