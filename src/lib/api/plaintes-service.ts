import { apiClient, type ApiResponse } from './client';

// ==================== PLAINTES TYPES ====================

export interface Plainte {
  id: string;
  numero: string;
  type_plainte: string;
  description?: string;
  plaignant_nom: string;
  plaignant_prenom: string;
  plaignant_telephone?: string;
  plaignant_adresse?: string;
  plaignant_email?: string;
  date_depot: string;
  date_resolution?: string;
  etape_actuelle: 'DEPOT' | 'ENQUETE' | 'CONVOCATIONS' | 'RESOLUTION' | 'CLOTURE';
  priorite: 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
  statut: 'EN_COURS' | 'RESOLU' | 'CLASSE' | 'TRANSFERE';
  delai_sla?: string;
  sla_depasse: boolean;
  lieu_faits?: string;
  date_faits?: string;
  observations?: string;
  decision_finale?: string;
  commissariat?: {
    id: string;
    nom: string;
    code: string;
  };
  agent_assigne?: {
    id: string;
    matricule: string;
    nom: string;
    prenom: string;
  };
  nombre_convocations: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePlainteDTO {
  type_plainte: string;
  description?: string;
  plaignant_nom: string;
  plaignant_prenom: string;
  plaignant_telephone?: string;
  plaignant_adresse?: string;
  plaignant_email?: string;
  lieu_faits?: string;
  date_faits?: string;
  priorite?: 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
  observations?: string;
  commissariat_id?: string;
  agent_assigne_id?: string;
}

export interface UpdatePlainteDTO {
  type_plainte?: string;
  description?: string;
  plaignant_nom?: string;
  plaignant_prenom?: string;
  plaignant_telephone?: string;
  plaignant_adresse?: string;
  plaignant_email?: string;
  lieu_faits?: string;
  date_faits?: string;
  priorite?: 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
  statut?: 'EN_COURS' | 'RESOLU' | 'CLASSE' | 'TRANSFERE';
  etape_actuelle?: 'DEPOT' | 'ENQUETE' | 'CONVOCATIONS' | 'RESOLUTION' | 'CLOTURE';
  observations?: string;
  decision_finale?: string;
  commissariat_id?: string;
  agent_assigne_id?: string;
}

export interface PlaintesFilters {
  type_plainte?: string;
  statut?: string;
  priorite?: string;
  etape_actuelle?: string;
  commissariat_id?: string;
  agent_assigne_id?: string;
  date_debut?: string;
  date_fin?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PlainteStatistics {
  total: number;
  en_cours: number;
  resolues: number;
  classees: number;
  transferees: number;
  par_type: Record<string, number>;
  par_priorite: Record<string, number>;
  par_etape: Record<string, number>;
  sla_depasse: number;
  delai_moyen_jours: number;
}

// ==================== PLAINTES SERVICE ====================

export const plaintesService = {
  // Créer une plainte
  create: (data: CreatePlainteDTO): Promise<ApiResponse<Plainte>> =>
    apiClient.post<Plainte>('/plaintes', data),

  // Récupérer une plainte par ID
  getById: (id: string): Promise<ApiResponse<Plainte>> =>
    apiClient.get<Plainte>(`/plaintes/${id}`),

  // Récupérer une plainte par numéro
  getByNumero: (numero: string): Promise<ApiResponse<Plainte>> =>
    apiClient.get<Plainte>(`/plaintes/numero/${numero}`),

  // Liste des plaintes avec filtres
  list: (filters?: PlaintesFilters): Promise<ApiResponse<{
    plaintes: Plainte[];
    total: number;
  }>> =>
    apiClient.get<{ plaintes: Plainte[]; total: number }>('/plaintes', filters),

  // Mettre à jour une plainte
  update: (id: string, data: UpdatePlainteDTO): Promise<ApiResponse<Plainte>> =>
    apiClient.put<Plainte>(`/plaintes/${id}`, data),

  // Supprimer une plainte
  delete: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete<void>(`/plaintes/${id}`),

  // Changer l'étape du workflow
  changerEtape: (
    id: string,
    etape: 'DEPOT' | 'ENQUETE' | 'CONVOCATIONS' | 'RESOLUTION' | 'CLOTURE',
    observations?: string
  ): Promise<ApiResponse<Plainte>> =>
    apiClient.patch<Plainte>(`/plaintes/${id}/etape`, { etape, observations }),

  // Changer le statut
  changerStatut: (
    id: string,
    statut: 'EN_COURS' | 'RESOLU' | 'CLASSE' | 'TRANSFERE',
    decisionFinale?: string
  ): Promise<ApiResponse<Plainte>> =>
    apiClient.patch<Plainte>(`/plaintes/${id}/statut`, {
      statut,
      decision_finale: decisionFinale,
    }),

  // Assigner un agent
  assignerAgent: (id: string, agentId: string): Promise<ApiResponse<Plainte>> =>
    apiClient.patch<Plainte>(`/plaintes/${id}/assigner`, { agent_id: agentId }),

  // Statistiques
  getStatistics: (filters?: {
    commissariat_id?: string;
    date_debut?: string;
    date_fin?: string;
  }): Promise<ApiResponse<PlainteStatistics>> =>
    apiClient.get<PlainteStatistics>('/plaintes/statistics', filters),
};
