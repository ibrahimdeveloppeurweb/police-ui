// Types pour le module Procès-Verbal (PV)

export enum StatutPV {
  BROUILLON = 'BROUILLON',
  EN_RELECTURE = 'EN_RELECTURE',
  VALIDE = 'VALIDE',
  CLOTURE = 'CLOTURE',
  ARCHIVE = 'ARCHIVE'
}

export enum QualiteAuditionne {
  SUSPECT = 'SUSPECT',
  TEMOIN = 'TÉMOIN',
  VICTIME = 'VICTIME',
  PLAIGNANT = 'PLAIGNANT',
  AUTRE = 'AUTRE'
}

export enum TypeDocumentPV {
  PIECE_IDENTITE = 'PIÈCE_IDENTITÉ',
  JUSTIFICATIF_DOMICILE = 'JUSTIFICATIF_DOMICILE',
  ATTESTATION = 'ATTESTATION',
  CONTRAT = 'CONTRAT',
  FACTURE = 'FACTURE',
  PHOTO = 'PHOTO',
  VIDEO = 'VIDÉO',
  MESSAGE = 'MESSAGE',
  AUTRE = 'AUTRE'
}

export enum RoleAgent {
  CHEF_ENQUETE = 'CHEF_ENQUÊTE',
  REDACTEUR = 'RÉDACTEUR',
  OPJ = 'OPJ',
  APJ = 'APJ',
  OFFICIER = 'OFFICIER',
  AUTRE = 'AUTRE'
}

// Agent présent lors de l'audition
export interface AgentPresent {
  id?: string
  nom: string
  prenom: string
  matricule: string
  role: RoleAgent
  fonction?: string
}

// Avocat
export interface AvocatInfo {
  present: boolean
  nom?: string
  prenom?: string
  barreau?: string
}

// Interprète
export interface InterpreteInfo {
  present: boolean
  nom?: string
  prenom?: string
  langue?: string
}

// Témoin présent
export interface TemoinPresent {
  nom: string
  prenom: string
  qualite: string
}

// Question/Réponse
export interface QuestionReponse {
  id?: string
  heure: string // Format HH:mm
  question: string
  reponse: string
  agentInterrogateur: string
}

// Document présenté
export interface DocumentPresente {
  id?: string
  type: TypeDocumentPV
  description: string
  reference?: string
}

// Pièce à conviction
export interface PieceConviction {
  id?: string
  type: string
  description: string
  numeroScelle?: string
}

// Droits notifiés
export interface DroitsNotifies {
  droitSilence: boolean
  droitAvocat: boolean
  droitInterprete: boolean
  droitsLusEtCompris: boolean
}

// Signatures
export interface Signatures {
  auditionneAccepteLecture: boolean
  auditionneASigne: boolean
  dateSignatureAuditionne?: Date
  agentsOntSigne: boolean
  dateSignatureAgents?: Date
}

// Transmission
export interface Transmission {
  transmisParquet: boolean
  dateTransmissionParquet?: Date
  transmiseProcureur: boolean
  dateTransmissionProcureur?: Date
}

// PV complet
export interface ProcessVerbal {
  // Identifiants
  id: string
  numero: string
  convocationId: string
  
  // Informations audition
  dateAudition: Date
  heureDebut: string
  heureFin: string
  dureeMinutes?: number
  lieuAudition: string
  
  // Personne auditionnée
  auditionnenom: string
  auditionnePrenom: string
  auditionneQualite: QualiteAuditionne
  pieceIdentiteType?: string
  pieceIdentiteNumero?: string
  
  // Agents
  agentsPresents: AgentPresent[]
  chefEnqueteId?: string
  redacteurId?: string
  
  // Tiers
  avocat: AvocatInfo
  interprete: InterpreteInfo
  temoinPresent: boolean
  temoins?: TemoinPresent[]
  
  // Contenu
  objet: string
  contexte?: string
  deroulement: string
  questionsReponses: QuestionReponse[]
  declarations?: string
  
  // Éléments recueillis
  documentsPr esentes: DocumentPresente[]
  piecesConviction: PieceConviction[]
  photosVideos: boolean
  enregistrementAudio: boolean
  
  // Conclusions
  synthese?: string
  observations?: string
  suitesADonner?: string
  
  // Droits et signatures
  droitsNotifies: DroitsNotifies
  signatures: Signatures
  
  // Statut
  statut: StatutPV
  
  // Transmission
  transmission: Transmission
  
  // Relations
  commissariatId?: string
  
  // Métadonnées
  createdBy?: string
  updatedBy?: string
  createdAt: Date
  updatedAt: Date
}

// Formulaire de création PV
export interface CreatePVRequest {
  convocationId: string
  dateAudition: string
  heureDebut: string
  heureFin: string
  lieuAudition: string
  
  auditionneNom: string
  auditionnePrenom: string
  auditionneQualite: QualiteAuditionne
  pieceIdentiteType?: string
  pieceIdentiteNumero?: string
  
  agentsPresents: Omit<AgentPresent, 'id'>[]
  chefEnqueteId?: string
  redacteurId?: string
  
  avocat: AvocatInfo
  interprete: InterpreteInfo
  temoinPresent: boolean
  temoins?: Omit<TemoinPresent, 'id'>[]
  
  droitsNotifies: DroitsNotifies
  
  objet: string
  contexte?: string
  deroulement: string
  questionsReponses: Omit<QuestionReponse, 'id'>[]
  declarations?: string
  
  documentsPr esentes: Omit<DocumentPresente, 'id'>[]
  piecesConviction: Omit<PieceConviction, 'id'>[]
  photosVideos: boolean
  enregistrementAudio: boolean
  
  synthese?: string
  observations?: string
  suitesADonner?: string
}

// Réponse liste PV
export interface ListPVResponse {
  pv: ProcessVerbal[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Filtres pour liste PV
export interface FilterPVRequest {
  statut?: StatutPV
  dateDebut?: Date
  dateFin?: Date
  commissariatId?: string
  redacteurId?: string
  search?: string
  page?: number
  limit?: number
}

// Statistiques PV
export interface StatistiquesPV {
  totalPV: number
  pvEnCours: number
  pvValides: number
  pvTransmis: number
  delaiMoyenValidation: number
  topRedacteurs: Array<{
    agent: string
    count: number
  }>
}

// Actions sur PV
export interface ChangerStatutPVRequest {
  statut: StatutPV
  commentaire?: string
}

export interface TransmettrePVRequest {
  destinataire: 'PARQUET' | 'PROCUREUR'
  commentaire?: string
}
