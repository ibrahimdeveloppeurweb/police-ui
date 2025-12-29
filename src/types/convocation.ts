// Types pour le module Convocations

export type StatutConvocation = 'BROUILLON' | 'ENVOYEE' | 'HONOREE' | 'NON_HONOREE' | 'REPORTEE' | 'ANNULEE'

export type TypeConvocation = 
  | 'AUDITION_TEMOIN'
  | 'AUDITION_SUSPECT'
  | 'AUDITION_VICTIME'
  | 'CONFRONTATION'
  | 'EXPERTISE'
  | 'RECONSTITUTION'
  | 'VISITE_DOMICILIAIRE'
  | 'AUTRE'

export type CanalNotification = 'SMS' | 'EMAIL' | 'COURRIER' | 'TELEPHONIQUE' | 'MAIN_PROPRE'

export interface Convocation {
  id: string
  reference: string
  
  // Personne convoquée
  civilite: 'M' | 'Mme' | 'Mlle'
  nom: string
  prenoms: string
  dateNaissance?: string
  lieuNaissance?: string
  profession?: string
  adresse: string
  telephone: string
  email?: string
  
  // Détails de la convocation
  typeConvocation: TypeConvocation
  objet: string
  description?: string
  
  // Date et heure
  dateConvocation: string
  heureConvocation: string
  dureeEstimee?: number // en minutes
  
  // Lieu
  lieuConvocation: string
  salle?: string
  
  // Affaire liée
  affaireLiee?: string // ID de la plainte
  referenceAffaire?: string // Référence de la plainte (PL-2024-XXX)
  
  // Agent responsable
  agentResponsableId: string
  agentResponsableNom: string
  agentResponsableMatricule: string
  
  // Commissariat
  commissariatId: string
  commissariatNom: string
  
  // Notifications
  canalNotification: CanalNotification[]
  dateEnvoi?: string
  notificationEnvoyee: boolean
  
  // Suivi
  statut: StatutConvocation
  motifReport?: string
  dateReport?: string
  heureReport?: string
  motifAnnulation?: string
  
  // Présence
  datePresence?: string
  heureArrivee?: string
  heureDepart?: string
  observation?: string
  
  // Documents
  documentsAFournir?: string[]
  pieceJustificative?: string[]
  
  // Métadonnées
  creePar: string
  creeLe: string
  modifiePar?: string
  modifieLe?: string
  
  // Historique
  historique?: HistoriqueConvocation[]
}

export interface HistoriqueConvocation {
  id: string
  convocationId: string
  action: string
  description: string
  ancienStatut?: StatutConvocation
  nouveauStatut?: StatutConvocation
  effectuePar: string
  effectueParNom: string
  effectueLe: string
}

export interface ConvocationFormData {
  // Étape 1 : Personne convoquée
  civilite: 'M' | 'Mme' | 'Mlle'
  nom: string
  prenoms: string
  dateNaissance?: string
  lieuNaissance?: string
  profession?: string
  adresse: string
  telephone: string
  email?: string
  
  // Étape 2 : Type et objet
  typeConvocation: TypeConvocation
  objet: string
  description?: string
  affaireLiee?: string
  
  // Étape 3 : Date, heure et lieu
  dateConvocation: string
  heureConvocation: string
  dureeEstimee?: number
  lieuConvocation: string
  salle?: string
  
  // Étape 4 : Notifications
  canalNotification: CanalNotification[]
  documentsAFournir?: string[]
  
  // Étape 5 : Validation
  envoyerImmediatement: boolean
}

export interface ConvocationFilters {
  statut?: StatutConvocation[]
  typeConvocation?: TypeConvocation[]
  dateDebut?: string
  dateFin?: string
  commissariatId?: string
  agentId?: string
  affaireLiee?: string
  recherche?: string
  page?: number
  limit?: number
  sortBy?: 'dateConvocation' | 'creeLe' | 'nom'
  sortOrder?: 'asc' | 'desc'
}

export interface ConvocationStats {
  total: number
  brouillon: number
  envoyees: number
  honorees: number
  nonHonorees: number
  reportees: number
  annulees: number
  tauxPresence: number
  delaiMoyen: number
  parType: {
    type: TypeConvocation
    count: number
  }[]
  parCommissariat: {
    commissariat: string
    count: number
  }[]
}
