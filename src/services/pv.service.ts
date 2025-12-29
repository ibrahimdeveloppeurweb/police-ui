import api from '@/lib/axios'
import {
  ProcessVerbal,
  CreatePVRequest,
  ListPVResponse,
  FilterPVRequest,
  StatistiquesPV,
  ChangerStatutPVRequest,
  TransmettrePVRequest
} from '@/types/pv'

const pvService = {
  // Créer un nouveau PV
  create: async (data: CreatePVRequest): Promise<ProcessVerbal> => {
    const response = await api.post('/pv', data)
    return response.data.data
  },

  // Récupérer un PV par ID
  getById: async (id: string): Promise<ProcessVerbal> => {
    const response = await api.get(`/pv/${id}`)
    return response.data.data
  },

  // Liste des PV avec filtres
  list: async (filters: FilterPVRequest): Promise<ListPVResponse> => {
    const response = await api.get('/pv', { params: filters })
    return response.data
  },

  // Mettre à jour un PV (brouillon)
  update: async (id: string, data: Partial<CreatePVRequest>): Promise<ProcessVerbal> => {
    const response = await api.put(`/pv/${id}`, data)
    return response.data.data
  },

  // Changer le statut d'un PV
  changerStatut: async (id: string, data: ChangerStatutPVRequest): Promise<ProcessVerbal> => {
    const response = await api.patch(`/pv/${id}/statut`, data)
    return response.data.data
  },

  // Valider un PV (chef d'enquête)
  valider: async (id: string, commentaire?: string): Promise<ProcessVerbal> => {
    const response = await api.post(`/pv/${id}/valider`, { commentaire })
    return response.data.data
  },

  // Clôturer un PV (signatures complètes)
  cloturer: async (id: string): Promise<ProcessVerbal> => {
    const response = await api.post(`/pv/${id}/cloturer`)
    return response.data.data
  },

  // Transmettre au parquet/procureur
  transmettre: async (id: string, data: TransmettrePVRequest): Promise<ProcessVerbal> => {
    const response = await api.post(`/pv/${id}/transmettre`, data)
    return response.data.data
  },

  // Archiver un PV
  archiver: async (id: string): Promise<ProcessVerbal> => {
    const response = await api.post(`/pv/${id}/archiver`)
    return response.data.data
  },

  // Générer le PDF
  downloadPDF: async (id: string): Promise<Blob> => {
    const response = await api.get(`/pv/${id}/pdf`, {
      responseType: 'blob'
    })
    return response.data
  },

  // Imprimer le PV
  print: async (id: string): Promise<void> => {
    const pdf = await pvService.downloadPDF(id)
    const url = window.URL.createObjectURL(pdf)
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = url
    document.body.appendChild(iframe)
    iframe.contentWindow?.print()
  },

  // Statistiques PV
  getStatistiques: async (filters?: FilterPVRequest): Promise<StatistiquesPV> => {
    const response = await api.get('/pv/statistiques', { params: filters })
    return response.data.data
  },

  // Récupérer le PV lié à une convocation
  getByConvocation: async (convocationId: string): Promise<ProcessVerbal | null> => {
    try {
      const response = await api.get(`/convocations/${convocationId}/pv`)
      return response.data.data
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null
      }
      throw error
    }
  }
}

export default pvService
