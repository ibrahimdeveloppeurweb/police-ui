import { ConvocationFormData } from '@/types/convocation'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

export interface CreateConvocationPayload {
  // Informations personne convoquée
  civilite: string
  nom: string
  prenoms: string
  date_naissance?: string
  lieu_naissance?: string
  profession?: string
  adresse: string
  telephone: string
  email?: string
  
  // Type et objet
  type_convocation: string
  affaire_liee?: string
  objet: string
  description?: string
  
  // Date et lieu
  date_convocation: string
  heure_convocation: string
  duree_estimee: number
  lieu_convocation: string
  salle?: string
  
  // Notifications
  canal_notification: string[]
  documents_a_fournir?: string[]
  envoyer_immediatement: boolean
  
  // Relations
  plainte_id?: string
  agent_id?: string
  commissariat_id?: string
}

export interface ConvocationResponse {
  id: string
  numero: string
  type_convocation: string
  convoque_nom: string
  convoque_prenom: string
  convoque_telephone: string
  convoque_adresse: string
  convoque_email?: string
  qualite_convoque: string
  date_creation: string
  date_rdv: string
  heure_rdv: string
  date_envoi?: string
  statut: string
  lieu_rdv: string
  motif: string
  observations?: string
  mode_envoi: string
  created_at: string
  updated_at: string
}

class ConvocationService {
  private getAuthToken(): string | null {
    // TODO: Implement proper auth token retrieval
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken()
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'An error occurred' }))
      throw new Error(error.error || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async createConvocation(formData: ConvocationFormData): Promise<ConvocationResponse> {
    // Transform form data to API payload
    const payload: CreateConvocationPayload = {
      civilite: formData.civilite,
      nom: formData.nom,
      prenoms: formData.prenoms,
      date_naissance: formData.dateNaissance || undefined,
      lieu_naissance: formData.lieuNaissance || undefined,
      profession: formData.profession || undefined,
      adresse: formData.adresse,
      telephone: formData.telephone,
      email: formData.email || undefined,
      
      type_convocation: formData.typeConvocation,
      affaire_liee: formData.affaireLiee || undefined,
      objet: formData.objet,
      description: formData.description || undefined,
      
      date_convocation: formData.dateConvocation,
      heure_convocation: formData.heureConvocation,
      duree_estimee: formData.dureeEstimee,
      lieu_convocation: formData.lieuConvocation,
      salle: formData.salle || undefined,
      
      canal_notification: formData.canalNotification,
      documents_a_fournir: formData.documentsAFournir?.length ? formData.documentsAFournir : undefined,
      envoyer_immediatement: formData.envoyerImmediatement,
    }

    console.log('Creating convocation with payload:', payload)

    return this.request<ConvocationResponse>('/convocations', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async getConvocation(id: string): Promise<ConvocationResponse> {
    return this.request<ConvocationResponse>(`/convocations/${id}`)
  }

  async listConvocations(params?: {
    type_convocation?: string
    statut?: string
    search?: string
    limit?: number
    offset?: number
  }): Promise<{ convocations: ConvocationResponse[]; total: number }> {
    const queryParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })
    }

    const query = queryParams.toString()
    const endpoint = query ? `/convocations?${query}` : '/convocations'

    return this.request<{ convocations: ConvocationResponse[]; total: number }>(endpoint)
  }

  async updateConvocation(
    id: string,
    updates: Partial<CreateConvocationPayload>
  ): Promise<ConvocationResponse> {
    return this.request<ConvocationResponse>(`/convocations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteConvocation(id: string): Promise<void> {
    await this.request<void>(`/convocations/${id}`, {
      method: 'DELETE',
    })
  }

  async changerStatut(
    id: string,
    statut: string,
    observations?: string
  ): Promise<ConvocationResponse> {
    return this.request<ConvocationResponse>(`/convocations/${id}/statut`, {
      method: 'PATCH',
      body: JSON.stringify({ statut, observations }),
    })
  }

  async envoyerConvocation(
    id: string,
    modeEnvoi: string,
    referenceEnvoi?: string
  ): Promise<ConvocationResponse> {
    return this.request<ConvocationResponse>(`/convocations/${id}/envoyer`, {
      method: 'POST',
      body: JSON.stringify({ mode_envoi: modeEnvoi, reference_envoi: referenceEnvoi }),
    })
  }

  async honorerConvocation(
    id: string,
    resultatAudition: string,
    observations?: string
  ): Promise<ConvocationResponse> {
    return this.request<ConvocationResponse>(`/convocations/${id}/honorer`, {
      method: 'POST',
      body: JSON.stringify({ resultat_audition: resultatAudition, observations }),
    })
  }

  async getStatistics(): Promise<{
    total: number
    brouillons: number
    envoyees: number
    recues: number
    honorees: number
    non_honorees: number
    reportees: number
    annulees: number
    par_type: Record<string, number>
    par_qualite: Record<string, number>
    par_mode_envoi: Record<string, number>
    taux_honoration: number
  }> {
    return this.request('/convocations/statistics')
  }
}

export const convocationService = new ConvocationService()
