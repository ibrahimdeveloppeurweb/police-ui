import api from '@/lib/axios'

export interface ConvocationDetail {
  id: string
  numero: string
  typeConvocation: string
  convoqueNom: string
  convoquePrenom: string
  convoqueTelephone: string
  convoqueAdresse: string
  convoqueEmail?: string
  qualiteConvoque: string
  dateCreation: string
  dateRdv: string
  heureRdv: string
  statut: string
  lieuRdv: string
  motif: string
  observations: string
  modeEnvoi: string
  agent: {
    id: string
    nom: string
    prenom: string
    matricule: string
  }
  commissariat: {
    id: string
    nom: string
    code: string
  }
  historique: Array<{
    date: string
    dateISO: string
    action: string
    agent: string
    details: string
  }>
  createdAt: string
  updatedAt: string
}

export interface UpdateStatutPayload {
  statut: string
  motif?: string
  commentaire?: string
}

export interface ReporterRdvPayload {
  nouvelleDate: string
  nouvelleHeure: string
  motif: string
}

export interface NotifierPayload {
  moyens: string[]
  message?: string
}

export interface AjouterNotePayload {
  note: string
}

const convocationsService = {
  // Récupérer une convocation par ID
  getById: async (id: string): Promise<ConvocationDetail> => {
    const response = await api.get(`/convocations/${id}`)
    return response.data.data // Extraire data.data
  },

  // Confirmer la présence
  confirmerPresence: async (id: string): Promise<ConvocationDetail> => {
    const response = await api.patch(`/convocations/${id}/statut`, {
      statut: 'CONFIRMÉ',
    })
    return response.data.data
  },

  // Marquer comme honoré
  marquerHonore: async (id: string, commentaire?: string): Promise<ConvocationDetail> => {
    const response = await api.patch(`/convocations/${id}/statut`, {
      statut: 'HONORÉ',
      ...(commentaire && { commentaire }),
    })
    return response.data.data
  },

  // Marquer comme non honoré
  marquerNonHonore: async (id: string, payload: UpdateStatutPayload): Promise<ConvocationDetail> => {
    const response = await api.patch(`/convocations/${id}/statut`, {
      statut: 'NON HONORÉ',
      motif: payload.motif,
      commentaire: payload.commentaire,
    })
    return response.data.data
  },

  // Annuler une convocation
  annuler: async (id: string, motif: string): Promise<ConvocationDetail> => {
    const response = await api.patch(`/convocations/${id}/statut`, {
      statut: 'ANNULÉ',
      motif,
    })
    return response.data.data
  },

  // Reporter un rendez-vous
  reporter: async (id: string, payload: ReporterRdvPayload): Promise<ConvocationDetail> => {
    const response = await api.patch(`/convocations/${id}/reporter`, payload)
    return response.data.data
  },

  // Envoyer une notification
  notifier: async (id: string, payload: NotifierPayload): Promise<ConvocationDetail> => {
    const response = await api.post(`/convocations/${id}/notifier`, payload)
    return response.data.data
  },

  // Ajouter une note
  ajouterNote: async (id: string, payload: AjouterNotePayload): Promise<ConvocationDetail> => {
    const response = await api.post(`/convocations/${id}/notes`, payload)
    return response.data.data
  },

  // Télécharger le PDF
  downloadPDF: async (id: string): Promise<Blob> => {
    const response = await api.get(`/convocations/${id}/pdf`, {
      responseType: 'blob',
    })
    return response.data
  },

  // Imprimer
  print: async (id: string): Promise<void> => {
    const pdf = await convocationsService.downloadPDF(id)
    const url = window.URL.createObjectURL(pdf)
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = url
    document.body.appendChild(iframe)
    iframe.contentWindow?.print()
  },
}

export default convocationsService
