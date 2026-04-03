import { api } from './api'

export type ContactRequest = {
  firstName: string
  lastName: string
  email: string
  subject: string
  category: 'support' | 'bug-report' | 'business' | 'other'
  message: string
  acceptedPolicy: boolean
}

export type ContactResponse = {
  id: string
  status: 'received'
  createdAt: string
}

export const contactService = {
  submit: async (payload: ContactRequest): Promise<ContactResponse> => {
    const response = await api.post<ContactResponse>('/contact', payload)
    return response.data
  }
}
