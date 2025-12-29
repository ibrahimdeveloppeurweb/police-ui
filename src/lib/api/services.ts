import { apiClient, type ApiResponse } from './client';

// ==================== ENUMS ====================
export enum UserRole {
  ADMIN = 'ADMIN',
  COMMISSAIRE = 'COMMISSAIRE',
  AGENT = 'AGENT',
}
export enum StatutControle {
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
  CONFORME = 'CONFORME',
  NON_CONFORME = 'NON_CONFORME',
}
export enum TypeControle {
  DOCUMENT = 'DOCUMENT',
  SECURITE = 'SECURITE',
  GENERAL = 'GENERAL',
  MIXTE = 'MIXTE',
}
export enum StatutPV {
  EN_ATTENTE = 'EN_ATTENTE',
  PAYE = 'PAYE',
  IMPAYE = 'IMPAYE',
  ANNULE = 'ANNULE',
}
export enum NiveauAlerte {
  FAIBLE = 'FAIBLE',
  MOYEN = 'MOYEN',
  ELEVE = 'ELEVE',
  CRITIQUE = 'CRITIQUE',
}
export enum StatutAlerte {
  ACTIVE = 'ACTIVE',
  RESOLUE = 'RESOLUE',
  ARCHIVEE = 'ARCHIVEE',
}
export enum TypeAlerte {
  VEHICULE_VOLE = 'VEHICULE_VOLE',
  SUSPECT_RECHERCHE = 'SUSPECT_RECHERCHE',
  URGENCE_SECURITE = 'URGENCE_SECURITE',
  ALERTE_GENERALE = 'ALERTE_GENERALE',
  MAINTENANCE_SYSTEME = 'MAINTENANCE_SYSTEME',
  ACCIDENT = 'ACCIDENT',
  INCENDIE = 'INCENDIE',
  AGGRESSION = 'AGGRESSION',
  AMBER = 'AMBER',
  AUTRE = 'AUTRE',
}

// ==================== MODELS ====================
export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  matricule: string;
  role: string;
  grade?: string;
  commissariatId?: string;
  commissariat?: Commissariat;
  telephone?: string;
  statutService?: string;
  localisation?: string;
  activite?: string;
  derniereActivite?: string;
  actif: boolean;
  equipe?: Equipe;
  superieur?: UserSummary;
  missions?: Mission[];
  objectifs?: Objectif[];
  observations?: Observation[];
  competences?: Competence[];
  createdAt: string;
  updatedAt: string;
}

export interface UserSummary {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  grade?: string;
  role?: string;
}

export interface Commissariat {
  id: string;
  nom: string;
  code: string;
  adresse: string;
  ville: string;
  region: string;
  telephone: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Equipe {
  id: string;
  nom: string;
  code: string;
  zone?: string;
  description?: string;
  active: boolean;
  commissariat?: CommissariatSummary;
  chefEquipe?: UserSummary;
  membres?: UserSummary[];
  missions?: MissionSummary[];
  nombreMembres: number;
  missionsActives: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommissariatSummary {
  id: string;
  nom: string;
  code: string;
}

export interface MissionSummary {
  id: string;
  type: string;
  titre?: string;
  dateDebut: string;
  statut: string;
}

export interface Mission {
  id: string;
  type: string;
  titre?: string;
  dateDebut: string;
  dateFin?: string;
  duree?: string;
  zone?: string;
  statut: string;
  rapport?: string;
  agents?: UserSummary[];
  equipe?: EquipeSummary;
  commissariat?: CommissariatSummary;
  createdAt: string;
  updatedAt: string;
}

export enum StatutMission {
  PLANIFIEE = 'PLANIFIEE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  ANNULEE = 'ANNULEE',
}

export enum TypeMission {
  PATROUILLE = 'PATROUILLE',
  CONTROLE_ROUTIER = 'CONTROLE_ROUTIER',
  SURVEILLANCE = 'SURVEILLANCE',
  INTERVENTION = 'INTERVENTION',
  ESCORTE = 'ESCORTE',
  ENQUETE = 'ENQUETE',
}

export interface EquipeSummary {
  id: string;
  nom: string;
  code: string;
}

export interface Objectif {
  id: string;
  titre: string;
  description?: string;
  periode: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  valeurCible?: number;
  valeurActuelle: number;
  progression: number;
  agent?: UserSummary;
  createdAt: string;
  updatedAt: string;
}

export interface Observation {
  id: string;
  contenu: string;
  type: string;
  categorie?: string;
  visibleAgent: boolean;
  agent?: UserSummary;
  auteur?: UserSummary;
  createdAt: string;
  updatedAt: string;
}

export interface Competence {
  id: string;
  nom: string;
  type: string;
  description?: string;
  organisme?: string;
  dateObtention?: string;
  dateExpiration?: string;
  active: boolean;
  agents?: UserSummary[];
  nombreAgents: number;
  joursRestants?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgentStatistiques {
  agentId: string;
  totalControles: number;
  totalInfractions: number;
  totalPV: number;
  montantTotalPV: number;
  tauxInfraction: number;
  controlesParJour: number;
  controlesParMois: Record<string, number>;
}

export interface AgentDashboardStats {
  totalAgents: number;
  enService: number;
  enPause: number;
  horsService: number;
  controlesTotal: number;
  infractionsTotales: number;
  revenusTotal: number;
  performanceMoyenne: number;
  tempsServiceMoyen: string;
  tauxReussite: number;
}

export interface ActivityDataEntry {
  period: string;
  controles: number;
  agents: number;
  infractions: number;
}

export interface PerformanceDataEntry {
  commissariat: string;
  tauxActivite: number;
  agents: number;
}

export interface PieDataEntry {
  name: string;
  value: number;
  color: string;
}

export interface AgentDetailedResponse {
  id: string;
  nom: string;
  grade: string;
  commissariat: string;
  status: string;
  localisation: string;
  activite: string;
  controles: number;
  infractions: number;
  revenus: number;
  tauxInfractions: number;
  tempsService: string;
  gps: number;
  derniereActivite: string;
  performance: string;
}

export interface CommissariatStatsEntry {
  name: string;
  agents: number;
  enService: number;
  controles: number;
  tauxActivite: number;
}

export interface AgentDashboardResponse {
  stats: AgentDashboardStats;
  activityData: ActivityDataEntry[];
  performanceData: PerformanceDataEntry[];
  pieData: PieDataEntry[];
  agents: AgentDetailedResponse[];
  commissariats: CommissariatStatsEntry[];
}

export interface Controle {
  id: string;
  reference: string;
  date_controle: string;
  lieu_controle: string;
  type_controle: string;
  statut: string;
  observations?: string;
  total_verifications: number;
  verifications_ok: number;
  verifications_echec: number;
  montant_total_amendes: number;
  vehicule_immatriculation: string;
  vehicule_marque: string;
  vehicule_modele: string;
  vehicule_type: string;
  conducteur_numero_permis: string;
  conducteur_nom: string;
  conducteur_prenom: string;
  agent?: {
    id: string;
    matricule: string;
    nom: string;
    prenom: string;
    role: string;
    grade?: string;
    telephone?: string;
    email?: string;
  };
  commissariat?: {
    id: string;
    nom: string;
    code: string;
  };
  infractions?: {
    id: string;
    numero_pv: string;
    date_infraction: string;
    type_infraction: string;
    montant_amende: number;
    points_retires: number;
    statut: string;
  }[];
  nombre_infractions: number;
  documents_verifies?: {
    type: string;
    statut: string;
    details: string;
  }[];
  elements_controles?: {
    type: string;
    statut: string;
    details: string;
  }[];
  recommandations?: string[];
  duree?: string;
  is_archived: boolean;
  archived_at?: string;
  created_at: string;
  updated_at: string;
  personneControllee?: {
    nom: string;
    prenom: string;
    dateNaissance?: string;
    numeroIdentite?: string;
    adresse?: string;
    telephone?: string;
  };
  vehicule?: {
    immatriculation: string;
    marque?: string;
    modele?: string;
    couleur?: string;
  };
  infractionsConstatees?: string[];
  pvGenere?: boolean;
  pvId?: string;
  pv?: ProcesVerbal;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProcesVerbal {
  id: string;
  numero: string;
  controleId: string;
  controle?: Controle;
  dateEmission: string;
  infractions: {
    code: string;
    libelle: string;
    montant: number;
  }[];
  montantTotal: number;
  statutPaiement: StatutPV;
  datePaiement?: string;
  modePaiement?: string;
  observations?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlerteSecuritaire {
  id: string;
  numero?: string;
  titre: string;
  description: string;
  contexte?: string;
  niveau: NiveauAlerte;
  statut: StatutAlerte;
  type: string;
  lieu?: string;
  localisation?: string;
  latitude?: number;
  longitude?: number;
  precisionLocalisation?: string;
  commissariatId: string;
  commissariat?: Commissariat;
  agentRecepteurId?: string;
  agentId: string;
  agent?: User;
  dateAlerte: string;
  dateResolution?: string;
  dateCloture?: string;
  diffusee: boolean;
  dateDiffusion?: string;
  observations?: string;
  risques?: string[];
  personneConcernee?: {
    nom: string;
    telephone?: string;
    relation?: string;
    description?: string;
  };
  vehicule?: {
    immatriculation: string;
    marque?: string;
    modele?: string;
    couleur?: string;
    annee?: string;
  };
  suspect?: {
    nom: string;
    description: string;
    age?: string;
    adresse?: string;
    motif?: string;
    dateMandat?: string;
    juridiction?: string;
    contacts?: string;
    signalement?: string;
  };
  intervention?: {
    statut: string;
    equipe: Array<{ id: string; nom: string; matricule: string; role?: string }>;
    heureDepart?: string;
    heureArrivee?: string;
    heureFin?: string;
    moyens: string[];
    tempsReponse?: string;
  };
  evaluation?: {
    situationReelle: string;
    victimes?: number;
    degats?: string;
    mesuresPrises: string[];
    renforts: boolean;
    renfortsDetails?: string;
  };
  actions?: {
    immediate: string[];
    preventive: string[];
    suivi: string[];
  };
  rapport?: {
    resume: string;
    conclusions: string[];
    recommandations: string[];
    suiteADonner?: string;
  };
  temoins?: Array<{
    nom?: string;
    telephone?: string;
    declaration: string;
    anonyme?: boolean;
  }>;
  documents?: Array<{
    type: string;
    numero?: string;
    date?: string;
    description: string;
    url?: string;
  }>;
  photos?: string[];
  suivis?: Array<{
    date: string;
    heure: string;
    agent: string;
    agentId?: string;
    action: string;
    statut: string;
  }>;
  diffusionDestinataires?: {
    diffusionGenerale?: boolean;
    commissariatsIds?: string[];
    agentsIds?: string[];
  };
  assignationDestinataires?: {
    [commissariatId: string]: {
      assigneeGenerale?: boolean;
      agentsIds?: string[];
      dateAssignation?: string;
      agentAssignateurId?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface StatistiquesNationales {
  controlesTotal: number;
  pvTotal: number;
  montantPVTotal: number;
  alertesActives: number;
  commissariatsActifs: number;
  agentsActifs: number;
  tauxPaiementPV: number;
  evolutionControles: Array<{ date: string; count: number }>;
  topInfractions: Array<{ code: string; libelle: string; count: number }>;
  statistiquesParRegion: Array<{ region: string; controles: number; pv: number; alertes: number }>;
}

export interface FilterControles {
  type?: TypeControle;
  statut?: StatutControle;
  date_debut?: string;
  date_fin?: string;
  agent_id?: string;
  commissariat_id?: string;
  ville?: string;
  search?: string;
  is_archived?: boolean;
}

export interface ControleStatistics {
  total: number;
  en_cours: number;
  termine: number;
  conforme: number;
  non_conforme: number;
  par_type: Record<string, number>;
  par_jour: Record<string, number>;
  infractions_avec: number;
  infractions_sans: number;
  montant_total_amendes: number;
}

export interface FilterPV {
  statutPaiement?: StatutPV;
  dateDebut?: string;
  dateFin?: string;
  montantMin?: number;
  montantMax?: number;
  commissariatId?: string;
  search?: string;
}

export interface FilterAlertes {
  niveau?: NiveauAlerte;
  statut?: StatutAlerte;
  type?: string;
  dateDebut?: string;
  dateFin?: string;
  commissariatId?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ControlesListResponse {
  controles: Controle[];
  total: number;
}

export interface LoginCredentials {
  matricule: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface CreateControleDTO {
  type: TypeControle;
  dateControle: string;
  lieuControle: string;
  latitude?: number;
  longitude?: number;
  personneControllee: {
    nom: string;
    prenom: string;
    dateNaissance?: string;
    numeroIdentite?: string;
    adresse?: string;
    telephone?: string;
  };
  vehicule?: {
    immatriculation: string;
    marque?: string;
    modele?: string;
    couleur?: string;
  };
  observations?: string;
}

export interface CreatePVDTO {
  controleId: string;
  infractions: {
    code: string;
    libelle: string;
    montant: number;
  }[];
  observations?: string;
}

export interface UpdatePaiementDTO {
  statutPaiement: StatutPV;
  datePaiement?: string;
  modePaiement?: string;
}

export interface CreateAlerteDTO {
  titre: string;
  description: string;
  niveau: NiveauAlerte;
  type: string;
  localisation?: string;
  latitude?: number;
  longitude?: number;
}

// ==================== CONVOCATIONS TYPES ====================
export interface Convocation {
  id: string;
  numero: string;
  typeConvocation: string;
  convoqueNom: string;
  convoquePrenom: string;
  convoqueTelephone?: string;
  convoqueAdresse?: string;
  convoqueEmail?: string;
  qualiteConvoque: string;
  dateCreation: string;
  dateRdv?: string;
  heureRdv?: string;
  dateEnvoi?: string;
  dateHonoration?: string;
  statut: 'ENVOYÉ' | 'HONORÉ' | 'EN ATTENTE';
  lieuRdv?: string;
  motif?: string;
  observations?: string;
  resultatAudition?: string;
  modeEnvoi: string;
  affaireLiee?: string;
  agent?: {
    id: string;
    nom: string;
    prenom: string;
    matricule: string;
  };
  commissariat?: {
    id: string;
    nom: string;
  };
  historique?: Array<{
    date: string;
    action: string;
    agent: string;
    details?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateConvocationDTO {
  // SECTION 1: INFORMATIONS GÉNÉRALES
  reference: string;
  typeConvocation: string;
  sousType?: string;
  urgence: 'NORMALE' | 'URGENT' | 'TRES_URGENT';
  priorite: 'BASSE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE';
  confidentialite: 'STANDARD' | 'CONFIDENTIEL' | 'TRES_CONFIDENTIEL' | 'SECRET_DEFENSE';

  // SECTION 2: AFFAIRE LIÉE
  affaireId?: string;
  affaireType?: string;
  affaireNumero?: string;
  affaireTitre?: string;
  sectionJudiciaire?: string;
  infraction?: string;
  qualificationLegale?: string;

  // SECTION 3: PERSONNE CONVOQUÉE
  statutPersonne: string; // ex: 'TEMOIN', 'SUSPECT'
  nom: string;
  prenom: string;
  dateNaissance?: string; // format YYYY-MM-DD
  lieuNaissance?: string;
  nationalite?: string;
  profession?: string;
  situationFamiliale?: string;
  nombreEnfants?: string;

  // Documents d'identité
  typePiece: string; // ex: 'CNI', 'PASSEPORT'
  numeroPiece: string;
  dateDelivrancePiece?: string;
  lieuDelivrancePiece?: string;
  dateExpirationPiece?: string;

  // Contact
  telephone1: string;
  telephone2?: string;
  email?: string;
  adresseResidence?: string;
  adresseProfessionnelle?: string;
  dernierLieuConnu?: string;

  // Caractéristiques physiques
  sexe?: string;
  taille?: string;
  poids?: string;
  signesParticuliers?: string;
  photoIdentite: boolean;
  empreintes: boolean;

  // SECTION 4: RENDEZ-VOUS
  dateCreation: string; // format YYYY-MM-DD
  heureConvocation?: string; // format HH:mm
  dateRdv?: string; // format YYYY-MM-DD
  heureRdv?: string; // format HH:mm
  dureeEstimee?: number; // en minutes
  typeAudience: string; // ex: 'STANDARD', 'URGENTE'

  // Lieu
  lieuRdv: string;
  bureau?: string;
  salleAudience?: string;
  pointRencontre?: string;
  accesSpecifique?: string;

  // SECTION 5: PERSONNES PRÉSENTES
  convocateurNom: string;
  convocateurPrenom: string;
  convocateurMatricule?: string;
  convocateurFonction?: string;

  // Autres agents présents
  agentsPresents?: string;
  representantParquet: boolean;
  nomParquetier?: string;
  expertPresent: boolean;
  typeExpert?: string;
  interpreteNecessaire: boolean;
  langueInterpretation?: string;
  avocatPresent: boolean;
  nomAvocat?: string;
  barreauAvocat?: string;

  // SECTION 6: MOTIF ET OBJET
  motif: string;
  objetPrecis?: string;
  questionsPreparatoires?: string;
  piecesAApporter?: string;
  documentsDemandes?: string;

  // SECTION 9: OBSERVATIONS
  observations?: string;

  // SECTION 10: ÉTAT ET TRAÇABILITÉ
  statut: 'ENVOYÉ' | 'HONORÉ' | 'EN ATTENTE' | 'NON HONORÉ';
  modeEnvoi: string; // ex: 'MANUEL', 'EMAIL', 'SMS'

  // Contexte agent et commissariat
  agentId?: string;
  commissariatId?: string;
  createdBy?: string;
  updatedBy?: string;
}

// ==================== AUTH SERVICE ====================
export const authService = {
  login: (credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> =>
    apiClient.post<LoginResponse>('/auth/login', credentials),
  logout: (): Promise<ApiResponse<void>> =>
    apiClient.post('/auth/logout'),
  me: (): Promise<ApiResponse<User>> =>
    apiClient.get<User>('/auth/me'),
  refreshToken: (): Promise<ApiResponse<{ token: string }>> =>
    apiClient.post<{ token: string }>('/auth/refresh'),
};

// ==================== CONTROLES SERVICE ====================
export const controlesService = {
  getAll: (filters?: FilterControles, page = 1, limit = 20): Promise<ApiResponse<ControlesListResponse>> =>
    apiClient.get<ControlesListResponse>('/controles', { ...filters, page, limit }),
  getById: (id: string): Promise<ApiResponse<Controle>> =>
    apiClient.get<Controle>(`/controles/${id}`),
  getByAgent: (agentId: string, page = 1, limit = 50): Promise<ApiResponse<ControlesListResponse>> =>
    apiClient.get<ControlesListResponse>('/controles', { agent_id: agentId, page, limit }),
  create: (data: Partial<Controle>): Promise<ApiResponse<Controle>> =>
    apiClient.post<Controle>('/controles', data),
  update: (id: string, data: Partial<Controle>): Promise<ApiResponse<Controle>> =>
    apiClient.put<Controle>(`/controles/${id}`, data),
  delete: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/controles/${id}`),
  generatePV: (controleId: string, infractions: string[]): Promise<ApiResponse<ProcesVerbal>> =>
    apiClient.post<ProcesVerbal>(`/controles/${controleId}/pv`, { infractions }),
  archive: (id: string): Promise<ApiResponse<Controle>> =>
    apiClient.post<Controle>(`/controles/${id}/archive`),
  unarchive: (id: string): Promise<ApiResponse<Controle>> =>
    apiClient.post<Controle>(`/controles/${id}/unarchive`),
  getStatistics: (filters?: { agentId?: string; dateDebut?: string; dateFin?: string }): Promise<ApiResponse<ControleStatistics>> => {
    const params: Record<string, string> = {};
    if (filters?.agentId) params.agent_id = filters.agentId;
    if (filters?.dateDebut) params.date_debut = filters.dateDebut;
    if (filters?.dateFin) params.date_fin = filters.dateFin;
    return apiClient.get<ControleStatistics>('/controles/statistics', Object.keys(params).length > 0 ? params : undefined);
  },
};

// ==================== PV SERVICE ====================
export const pvService = {
  getAll: (filters?: FilterPV, page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<ProcesVerbal>>> =>
    apiClient.get<PaginatedResponse<ProcesVerbal>>('/pv', { ...filters, page, limit }),
  getById: (id: string): Promise<ApiResponse<ProcesVerbal>> =>
    apiClient.get<ProcesVerbal>(`/pv/${id}`),
  updatePaiement: (id: string, data: { statutPaiement: string; datePaiement?: string; modePaiement?: string }): Promise<ApiResponse<ProcesVerbal>> =>
    apiClient.patch<ProcesVerbal>(`/pv/${id}/paiement`, data),
  exportPDF: (id: string): Promise<ApiResponse<Blob>> =>
    apiClient.get<Blob>(`/pv/${id}/export/pdf`),
  sendReminder: (id: string): Promise<ApiResponse<void>> =>
    apiClient.post(`/pv/${id}/reminder`),
};

// ==================== ADMIN SERVICE ====================
export interface CreateAgentRequest {
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: string;
  grade?: string;
  telephone?: string;
  commissariatId?: string;
}

export const adminService = {
  getStatistiquesNationales: (): Promise<ApiResponse<StatistiquesNationales>> =>
    apiClient.get<StatistiquesNationales>('/admin/statistiques'),
  getCommissariats: (): Promise<ApiResponse<Commissariat[]>> =>
    apiClient.get<Commissariat[]>('/admin/commissariats'),
  getCommissariat: (id: string): Promise<ApiResponse<Commissariat>> =>
    apiClient.get<Commissariat>(`/admin/commissariats/${id}`),
  createCommissariat: (data: Partial<Commissariat>): Promise<ApiResponse<Commissariat>> =>
    apiClient.post<Commissariat>('/admin/commissariats', data),
  updateCommissariat: (id: string, data: Partial<Commissariat>): Promise<ApiResponse<Commissariat>> =>
    apiClient.put<Commissariat>(`/admin/commissariats/${id}`, data),
  deleteCommissariat: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/admin/commissariats/${id}`),
  getAgents: (commissariatId?: string): Promise<ApiResponse<User[]>> =>
    apiClient.get<User[]>('/admin/agents', commissariatId ? { commissariatId } : undefined),
  getAgent: (id: string): Promise<ApiResponse<User>> =>
    apiClient.get<User>(`/admin/agents/${id}`),
  createAgent: (data: CreateAgentRequest): Promise<ApiResponse<User>> =>
    apiClient.post<User>('/admin/agents', data),
  updateAgent: (id: string, data: Partial<User>): Promise<ApiResponse<User>> =>
    apiClient.put<User>(`/admin/agents/${id}`, data),
  deleteAgent: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/admin/agents/${id}`),
  getAgentStatistiques: (id: string): Promise<ApiResponse<AgentStatistiques>> =>
    apiClient.get<AgentStatistiques>(`/admin/agents/${id}/statistiques`),
  getAgentsDashboard: (periode?: string, dateDebut?: string, dateFin?: string): Promise<ApiResponse<AgentDashboardResponse>> => {
    const params: Record<string, string> = {};
    if (periode) params.periode = periode;
    if (dateDebut) params.dateDebut = dateDebut;
    if (dateFin) params.dateFin = dateFin;
    return apiClient.get<AgentDashboardResponse>('/admin/agents/dashboard', Object.keys(params).length > 0 ? params : undefined);
  },
};

// ==================== ALERTES SERVICE ====================
export const alertesService = {
  getAll: (filters?: FilterAlertes, page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<AlerteSecuritaire>>> =>
    apiClient.get<PaginatedResponse<AlerteSecuritaire>>('/alertes', { ...filters, page, limit }),
  getById: (id: string): Promise<ApiResponse<AlerteSecuritaire>> =>
    apiClient.get<AlerteSecuritaire>(`/alertes/${id}`),
  getStatistiques: (filters?: { commissariatId?: string; dateDebut?: string; dateFin?: string; periode?: string }): Promise<ApiResponse<{
    total: number;
    actives: number;
    resolues: number;
    archivees: number;
    parType: Record<string, number>;
    parNiveau: Record<string, number>;
    tempsMoyenResolution?: number;
    evolutionAlertes?: string;
    evolutionResolution?: string;
  }>> =>
    apiClient.get('/alertes/statistiques', filters),
  getDashboard: (filters?: { commissariatId?: string; dateDebut?: string; dateFin?: string; periode?: string }): Promise<ApiResponse<{
    stats: {
      totalAlertes: { total: number; evolution: string };
      resolues: { total: number; evolution: string };
      enCours: { total: number; evolution: string };
      tempsReponse: { moyen: string; evolution: string };
    };
    statsTable: Array<{
      type: string;
      nombre: number;
      resolues: number;
      taux: number;
    }>;
    activityData: Array<{
      period: string;
      alertes: number;
      enCours: number;
      resolues: number;
    }>;
    alerts: Array<{
      id: string;
      code: string;
      typeAlerte: string;
      libelle: string;
      typeDiffusion: string;
      dateDiffusion: string;
      status: string;
      villeDiffusion: string;
      priorite: string;
    }>;
  }>> =>
    apiClient.get('/alertes/dashboard', filters),
  create: (data: Partial<AlerteSecuritaire>): Promise<ApiResponse<AlerteSecuritaire>> =>
    apiClient.post<AlerteSecuritaire>('/alertes', data),
  update: (id: string, data: Partial<AlerteSecuritaire>): Promise<ApiResponse<AlerteSecuritaire>> =>
    apiClient.put<AlerteSecuritaire>(`/alertes/${id}`, data),
  resolve: (id: string): Promise<ApiResponse<AlerteSecuritaire>> =>
    apiClient.patch<AlerteSecuritaire>(`/alertes/${id}/resolve`),
  archiver: (id: string): Promise<ApiResponse<AlerteSecuritaire>> =>
    apiClient.post<AlerteSecuritaire>(`/alertes/${id}/archiver`),
  broadcast: (id: string, data?: { diffusionGenerale?: boolean; commissariatsIds?: string[]; agentsIds?: string[] }): Promise<ApiResponse<AlerteSecuritaire>> =>
    apiClient.post<AlerteSecuritaire>(`/alertes/${id}/broadcast`, data || {}),
  diffusionInterne: (id: string, data: { assigneeGenerale?: boolean; agentsIds?: string[] }): Promise<ApiResponse<AlerteSecuritaire>> =>
    apiClient.post<AlerteSecuritaire>(`/alertes/${id}/diffusion-interne`, data),
  assign: (id: string, data: { assigneeGenerale?: boolean; agentsIds?: string[] }): Promise<ApiResponse<AlerteSecuritaire>> =>
    apiClient.post<AlerteSecuritaire>(`/alertes/${id}/assign`, data),
  archive: (id: string): Promise<ApiResponse<AlerteSecuritaire>> =>
    apiClient.post<AlerteSecuritaire>(`/alertes/${id}/archiver`),
  deployIntervention: (id: string, data: {
    statut: string;
    equipe: Array<{ id: string; nom: string; matricule: string; role?: string }>;
    moyens: string[];
    heureDepart?: string;
  }): Promise<ApiResponse<AlerteSecuritaire>> =>
    apiClient.post<AlerteSecuritaire>(`/alertes/${id}/intervention/deploy`, data),
  updateIntervention: (id: string, data: {
    statut?: string;
    equipe?: Array<{ id: string; nom: string; matricule: string; role?: string }>;
    moyens?: string[];
    heureArrivee?: string;
    heureFin?: string;
    tempsReponse?: string;
  }): Promise<ApiResponse<AlerteSecuritaire>> =>
    apiClient.patch<AlerteSecuritaire>(`/alertes/${id}/intervention`, data),
  addEvaluation: (id: string, data: {
    situationReelle: string;
    victimes?: number;
    degats?: string;
    mesuresPrises: string[];
    renforts: boolean;
    renfortsDetails?: string;
  }): Promise<ApiResponse<AlerteSecuritaire>> =>
    apiClient.post<AlerteSecuritaire>(`/alertes/${id}/evaluation`, data),
  addRapport: (id: string, data: {
    resume: string;
    conclusions: string[];
    recommandations?: string[];
    suiteADonner?: string;
  }): Promise<ApiResponse<AlerteSecuritaire>> =>
    apiClient.post<AlerteSecuritaire>(`/alertes/${id}/rapport`, data),
  addTemoin: (id: string, data: {
    nom?: string;
    telephone?: string;
    declaration: string;
    anonyme?: boolean;
  }): Promise<ApiResponse<AlerteSecuritaire>> =>
    apiClient.post<AlerteSecuritaire>(`/alertes/${id}/temoin`, data),
  addDocument: (id: string, data: {
    type: string;
    numero?: string;
    date?: string;
    description: string;
    url?: string;
  }): Promise<ApiResponse<AlerteSecuritaire>> =>
    apiClient.post<AlerteSecuritaire>(`/alertes/${id}/document`, data),
  updateActions: (id: string, data: {
    actions: {
      immediate?: string[];
      preventive?: string[];
      suivi?: string[];
    };
  }): Promise<ApiResponse<AlerteSecuritaire>> =>
    apiClient.patch<AlerteSecuritaire>(`/alertes/${id}/actions`, data),
  addPhotos: (id: string, photos: string[]): Promise<ApiResponse<AlerteSecuritaire>> =>
    apiClient.post<AlerteSecuritaire>(`/alertes/${id}/photos`, { photos }),
  addSuivi: (id: string, data: {
    date: string;
    heure: string;
    action: string;
    statut: string;
    agentId?: string;
  }): Promise<ApiResponse<AlerteSecuritaire>> =>
    apiClient.post<AlerteSecuritaire>(`/alertes/${id}/suivi`, data),
  cloturer: (id: string): Promise<ApiResponse<AlerteSecuritaire>> =>
    apiClient.post<AlerteSecuritaire>(`/alertes/${id}/cloturer`),
};

// ==================== COMMISSARIAT SERVICE ====================
interface CommissariatDashboard {
  statistiques: {
    controlesTotal: number;
    pvTotal: number;
    agentsActifs: number;
    alertesEnCours: number;
  };
  controleRecents: Controle[];
  alertesRecentes: AlerteSecuritaire[];
}

interface CommissariatStatistiques {
  controles: {
    total: number;
    parType: Record<string, number>;
    evolution: Array<{ date: string; count: number }>;
  };
  pv: {
    total: number;
    montantTotal: number;
    tauxPaiement: number;
  };
  infractions: {
    total: number;
    parType: Record<string, number>;
  };
}

export const commissariatService = {
  getDashboard: (commissariatId: string): Promise<ApiResponse<CommissariatDashboard>> =>
    apiClient.get<CommissariatDashboard>(`/commissariat/${commissariatId}/dashboard`),
  getAgents: (commissariatId: string): Promise<ApiResponse<User[]>> =>
    apiClient.get<User[]>(`/commissariat/${commissariatId}/agents`),
  getControles: (commissariatId: string, filters?: FilterControles): Promise<ApiResponse<PaginatedResponse<Controle>>> =>
    apiClient.get<PaginatedResponse<Controle>>(`/commissariat/${commissariatId}/controles`, filters),
  getStatistiques: (commissariatId: string, dateDebut?: string, dateFin?: string): Promise<ApiResponse<CommissariatStatistiques>> =>
    apiClient.get<CommissariatStatistiques>(`/commissariat/${commissariatId}/statistiques`, { dateDebut, dateFin }),
};

// ==================== EQUIPE SERVICE ====================
export interface CreateEquipeRequest {
  nom: string;
  code: string;
  zone?: string;
  description?: string;
  commissariatId?: string;
}

export interface UpdateEquipeRequest {
  nom?: string;
  zone?: string;
  description?: string;
  active?: boolean;
}

export interface FilterEquipes {
  commissariatId?: string;
  active?: string;
  search?: string;
}

export const equipeService = {
  getAll: (filters?: FilterEquipes): Promise<ApiResponse<Equipe[]>> =>
    apiClient.get<Equipe[]>('/equipes', filters),
  getById: (id: string): Promise<ApiResponse<Equipe>> =>
    apiClient.get<Equipe>(`/equipes/${id}`),
  create: (data: CreateEquipeRequest): Promise<ApiResponse<Equipe>> =>
    apiClient.post<Equipe>('/equipes', data),
  update: (id: string, data: UpdateEquipeRequest): Promise<ApiResponse<Equipe>> =>
    apiClient.put<Equipe>(`/equipes/${id}`, data),
  delete: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/equipes/${id}`),
  addMembre: (equipeId: string, userId: string): Promise<ApiResponse<void>> =>
    apiClient.post(`/equipes/${equipeId}/membres`, { userId }),
  removeMembre: (equipeId: string, userId: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/equipes/${equipeId}/membres/${userId}`),
  setChef: (equipeId: string, userId: string): Promise<ApiResponse<void>> =>
    apiClient.put(`/equipes/${equipeId}/chef`, { userId }),
};

// ==================== MISSION SERVICE ====================
export interface CreateMissionRequest {
  type: string;
  titre?: string;
  dateDebut: string;
  dateFin?: string;
  duree?: string;
  zone?: string;
  agentIds?: string[];
  equipeId?: string;
  commissariatId?: string;
}

export interface CancelMissionRequest {
  raison?: string;
}

export interface AddAgentsRequest {
  agentIds: string[];
}

export interface UpdateMissionRequest {
  titre?: string;
  zone?: string;
  duree?: string;
  statut?: string;
  rapport?: string;
  dateFin?: string;
}

export interface EndMissionRequest {
  rapport: string;
}

export interface FilterMissions {
  agentId?: string;
  equipeId?: string;
  commissariatId?: string;
  statut?: string;
  type?: string;
  dateDebut?: string;
  dateFin?: string;
}

export const missionService = {
  getAll: (filters?: FilterMissions): Promise<ApiResponse<Mission[]>> =>
    apiClient.get<Mission[]>('/missions', filters),
  getById: (id: string): Promise<ApiResponse<Mission>> =>
    apiClient.get<Mission>(`/missions/${id}`),
  getByAgent: (agentId: string): Promise<ApiResponse<Mission[]>> =>
    apiClient.get<Mission[]>(`/agents/${agentId}/missions`),
  getByEquipe: (equipeId: string): Promise<ApiResponse<Mission[]>> =>
    apiClient.get<Mission[]>(`/equipes/${equipeId}/missions`),
  create: (data: CreateMissionRequest): Promise<ApiResponse<Mission>> =>
    apiClient.post<Mission>('/missions', data),
  update: (id: string, data: UpdateMissionRequest): Promise<ApiResponse<Mission>> =>
    apiClient.put<Mission>(`/missions/${id}`, data),
  delete: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/missions/${id}`),
  start: (id: string): Promise<ApiResponse<Mission>> =>
    apiClient.post<Mission>(`/missions/${id}/start`),
  end: (id: string, rapport: string): Promise<ApiResponse<Mission>> =>
    apiClient.post<Mission>(`/missions/${id}/end`, { rapport }),
  cancel: (id: string, raison?: string): Promise<ApiResponse<Mission>> =>
    apiClient.post<Mission>(`/missions/${id}/cancel`, { raison }),
  addAgents: (missionId: string, agentIds: string[]): Promise<ApiResponse<Mission>> =>
    apiClient.post<Mission>(`/missions/${missionId}/agents`, { agentIds }),
  removeAgent: (missionId: string, agentId: string): Promise<ApiResponse<Mission>> =>
    apiClient.delete(`/missions/${missionId}/agents/${agentId}`),
};

// ==================== OBJECTIF SERVICE ====================
export interface CreateObjectifRequest {
  titre: string;
  description?: string;
  periode: string;
  dateDebut: string;
  dateFin: string;
  valeurCible?: number;
  agentId?: string;
}

export interface UpdateObjectifRequest {
  titre?: string;
  description?: string;
  statut?: string;
  valeurCible?: number;
  valeurActuelle?: number;
  dateFin?: string;
}

export interface UpdateProgressionRequest {
  valeurActuelle: number;
}

export interface FilterObjectifs {
  agentId?: string;
  periode?: string;
  statut?: string;
  dateDebut?: string;
  dateFin?: string;
}

export const objectifService = {
  getAll: (filters?: FilterObjectifs): Promise<ApiResponse<Objectif[]>> =>
    apiClient.get<Objectif[]>('/objectifs', filters),
  getById: (id: string): Promise<ApiResponse<Objectif>> =>
    apiClient.get<Objectif>(`/objectifs/${id}`),
  getByAgent: (agentId: string): Promise<ApiResponse<Objectif[]>> =>
    apiClient.get<Objectif[]>(`/agents/${agentId}/objectifs`),
  create: (data: CreateObjectifRequest): Promise<ApiResponse<Objectif>> =>
    apiClient.post<Objectif>('/objectifs', data),
  update: (id: string, data: UpdateObjectifRequest): Promise<ApiResponse<Objectif>> =>
    apiClient.put<Objectif>(`/objectifs/${id}`, data),
  delete: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/objectifs/${id}`),
  updateProgression: (id: string, valeurActuelle: number): Promise<ApiResponse<Objectif>> =>
    apiClient.patch<Objectif>(`/objectifs/${id}/progression`, { valeurActuelle }),
};

// ==================== OBSERVATION SERVICE ====================
export interface CreateObservationRequest {
  contenu: string;
  type: string;
  categorie?: string;
  visibleAgent: boolean;
  agentId: string;
  auteurId?: string;
}

export interface UpdateObservationRequest {
  contenu?: string;
  type?: string;
  categorie?: string;
  visibleAgent?: boolean;
}

export interface FilterObservations {
  agentId?: string;
  auteurId?: string;
  type?: string;
  categorie?: string;
  visibleAgent?: string;
}

export const observationService = {
  getAll: (filters?: FilterObservations): Promise<ApiResponse<Observation[]>> =>
    apiClient.get<Observation[]>('/observations', filters),
  getById: (id: string): Promise<ApiResponse<Observation>> =>
    apiClient.get<Observation>(`/observations/${id}`),
  getByAgent: (agentId: string, visibleOnly?: boolean): Promise<ApiResponse<Observation[]>> =>
    apiClient.get<Observation[]>(`/agents/${agentId}/observations`, visibleOnly !== undefined ? { visibleAgent: String(visibleOnly) } : undefined),
  create: (data: CreateObservationRequest): Promise<ApiResponse<Observation>> =>
    apiClient.post<Observation>('/observations', data),
  update: (id: string, data: UpdateObservationRequest): Promise<ApiResponse<Observation>> =>
    apiClient.put<Observation>(`/observations/${id}`, data),
  delete: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/observations/${id}`),
};

// ==================== COMPETENCE SERVICE ====================
export interface CreateCompetenceRequest {
  nom: string;
  type: string;
  description?: string;
  organisme?: string;
  dateObtention?: string;
  dateExpiration?: string;
}

export interface UpdateCompetenceRequest {
  nom?: string;
  description?: string;
  organisme?: string;
  dateExpiration?: string;
  active?: boolean;
}

export interface AssignCompetenceRequest {
  agentId: string;
}

export interface FilterCompetences {
  type?: string;
  active?: string;
  search?: string;
  organisme?: string;
}

export const competenceService = {
  getAll: (filters?: FilterCompetences): Promise<ApiResponse<Competence[]>> =>
    apiClient.get<Competence[]>('/competences', filters),
  getById: (id: string): Promise<ApiResponse<Competence>> =>
    apiClient.get<Competence>(`/competences/${id}`),
  getByAgent: (agentId: string): Promise<ApiResponse<Competence[]>> =>
    apiClient.get<Competence[]>(`/agents/${agentId}/competences`),
  getExpiring: (daysAhead?: number): Promise<ApiResponse<Competence[]>> =>
    apiClient.get<Competence[]>('/competences/expiring', daysAhead ? { days: String(daysAhead) } : undefined),
  create: (data: CreateCompetenceRequest): Promise<ApiResponse<Competence>> =>
    apiClient.post<Competence>('/competences', data),
  update: (id: string, data: UpdateCompetenceRequest): Promise<ApiResponse<Competence>> =>
    apiClient.put<Competence>(`/competences/${id}`, data),
  delete: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/competences/${id}`),
  assignToAgent: (competenceId: string, agentId: string): Promise<ApiResponse<void>> =>
    apiClient.post(`/competences/${competenceId}/agents`, { agentId }),
  removeFromAgent: (competenceId: string, agentId: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/competences/${competenceId}/agents/${agentId}`),
};

// ==================== INSPECTIONS SERVICE ====================
export interface Inspection {
  id: string;
  numero: string;
  date_inspection: string;
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE' | 'CONFORME' | 'NON_CONFORME';
  observations?: string;
  total_verifications: number;
  verifications_ok: number;
  verifications_attention: number;
  verifications_echec: number;
  montant_total_amendes: number;
  vehicule_immatriculation: string;
  vehicule_marque: string;
  vehicule_modele: string;
  vehicule_annee?: number;
  vehicule_couleur?: string;
  vehicule_numero_chassis?: string;
  vehicule_type: string;
  conducteur_numero_permis: string;
  conducteur_prenom: string;
  conducteur_nom: string;
  conducteur_telephone?: string;
  conducteur_adresse?: string;
  conducteur_type_piece?: string;
  conducteur_numero_piece?: string;
  assurance_compagnie?: string;
  assurance_numero_police?: string;
  assurance_date_expiration?: string;
  assurance_statut: string;
  lieu_inspection?: string;
  latitude?: number;
  longitude?: number;
  inspecteur?: {
    id: string;
    matricule: string;
    nom: string;
    prenom: string;
  };
  commissariat?: {
    id: string;
    nom: string;
    code: string;
  };
  proces_verbal?: {
    id: string;
    numero_pv: string;
    date_emission: string;
    montant_total: number;
    statut: string;
  };
  created_at: string;
  updated_at: string;
}

export interface InspectionStatistics {
  total: number;
  en_attente: number;
  en_cours: number;
  termine: number;
  conforme: number;
  non_conforme: number;
  assurance_invalide: number;
  par_statut: Record<string, number>;
  taux_conformite: number;
  montant_total_amendes: number;
}

export interface FilterInspections {
  vehiculeId?: string;
  inspecteurId?: string;
  commissariatId?: string;
  statut?: string;
  assuranceStatut?: string;
  vehiculeImmatriculation?: string;
  dateDebut?: string;
  dateFin?: string;
  search?: string;
}

export const inspectionsService = {
  getAll: (filters?: FilterInspections, page = 1, limit = 20): Promise<ApiResponse<{ inspections: Inspection[]; total: number }>> =>
    apiClient.get<{ inspections: Inspection[]; total: number }>('/inspections', {
      ...filters,
      limit,
      offset: (page - 1) * limit
    }),
  getById: (id: string): Promise<ApiResponse<Inspection>> =>
    apiClient.get<Inspection>(`/inspections/${id}`),
  getByNumero: (numero: string): Promise<ApiResponse<Inspection>> =>
    apiClient.get<Inspection>(`/inspections/numero/${numero}`),
  getByVehicule: (vehiculeId: string): Promise<ApiResponse<Inspection[]>> =>
    apiClient.get<Inspection[]>(`/inspections/vehicule/${vehiculeId}`),
  getByAgent: (agentId: string, page = 1, limit = 50): Promise<ApiResponse<{ inspections: Inspection[]; total: number }>> =>
    apiClient.get<{ inspections: Inspection[]; total: number }>('/inspections', {
      inspecteur_id: agentId,
      limit,
      offset: (page - 1) * limit
    }),
  create: (data: Partial<Inspection>): Promise<ApiResponse<Inspection>> =>
    apiClient.post<Inspection>('/inspections', data),
  update: (id: string, data: Partial<Inspection>): Promise<ApiResponse<Inspection>> =>
    apiClient.put<Inspection>(`/inspections/${id}`, data),
  delete: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/inspections/${id}`),
  changerStatut: (id: string, statut: string, observations?: string): Promise<ApiResponse<Inspection>> =>
    apiClient.patch<Inspection>(`/inspections/${id}/statut`, { statut, observations }),
  getStatistics: (filters?: { dateDebut?: string; dateFin?: string; commissariatId?: string }): Promise<ApiResponse<InspectionStatistics>> => {
    const params: Record<string, string> = {};
    if (filters?.dateDebut) params.dateDebut = filters.dateDebut;
    if (filters?.dateFin) params.dateFin = filters.dateFin;
    if (filters?.commissariatId) params.commissariat_id = filters.commissariatId;
    return apiClient.get<InspectionStatistics>('/inspections/statistics', Object.keys(params).length > 0 ? params : undefined);
  },
  getVerifications: (id: string): Promise<ApiResponse<unknown>> =>
    apiClient.get(`/inspections/${id}/verifications`),
  saveVerifications: (id: string, verifications: unknown): Promise<ApiResponse<unknown>> =>
    apiClient.post(`/inspections/${id}/verifications`, verifications),
};

// ==================== INFRACTIONS SERVICE ====================
export interface APIInfraction {
  id: string;
  numero_pv: string;
  date_infraction: string;
  lieu_infraction: string;
  circonstances?: string;
  montant_amende: number;
  points_retires: number;
  statut: 'CONSTATEE' | 'VALIDEE' | 'PAYEE' | 'ANNULEE' | 'CONTESTEE' | 'ARCHIVEE';
  flagrant_delit: boolean;
  accident: boolean;
  controle?: {
    id: string;
    date_controle: string;
    lieu_controle: string;
    type_controle: string;
    agent_nom: string;
  };
  type_infraction?: {
    id: string;
    code: string;
    libelle: string;
    description: string;
    amende: number;
    points: number;
    categorie: string;
  };
  vehicule?: {
    id: string;
    immatriculation: string;
    marque: string;
    modele: string;
    type_vehicule: string;
  };
  conducteur?: {
    id: string;
    nom: string;
    prenom: string;
    numero_permis: string;
    points_permis: number;
  };
  created_at: string;
  updated_at: string;
}

export interface FilterInfractions {
  statut?: string;
  type_infraction_id?: string;
  date_debut?: string;
  date_fin?: string;
  vehicule_id?: string;
  conducteur_id?: string;
  controle_id?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface InfractionDashboardStats {
  totalInfractions: number;
  revenus: string;
  totalTypes: number;
  montantMoyen: string;
  tauxContestation: string;
  tauxPaiement: string;
  infractions24h: number;
  evolution: number;
}

export interface InfractionActivityDataEntry {
  period: string;
  total: number;
  documents: number;
  securite: number;
  comportement: number;
  technique: number;
}

export interface InfractionPieDataEntry {
  name: string;
  value: number;
  color: string;
}

export interface InfractionEvolutionDataEntry {
  category: string;
  evolution: number;
}

export interface InfractionCategoryDataEntry {
  id: string;
  title: string;
  count: number;
  bgColor: string;
  iconColor: string;
  infractions: string[];
  evolution: number;
}

export interface InfractionTopEntry {
  name: string;
  count: number;
  percentage: number;
  category: string;
}

export interface InfractionDashboardResponse {
  stats: InfractionDashboardStats;
  activityData: InfractionActivityDataEntry[];
  pieData: InfractionPieDataEntry[];
  evolutionData: InfractionEvolutionDataEntry[];
  categories: InfractionCategoryDataEntry[];
  topInfractions: InfractionTopEntry[];
}

export interface InfractionStatisticsResponse {
  total: number;
  par_statut: Record<string, number>;
  par_type: Record<string, number>;
  par_mois: Record<string, number>;
  montant_total: number;
  points_total: number;
  flagrant_delit_total: number;
  accident_total: number;
  top_infractions: {
    type_code: string;
    type_libelle: string;
    count: number;
    montant_total: number;
  }[];
  periode_debut?: string;
  periode_fin?: string;
}

export const infractionsService = {
  getAll: (filters?: FilterInfractions, page = 1, limit = 20): Promise<ApiResponse<{ infractions: APIInfraction[]; total: number }>> =>
    apiClient.get<{ infractions: APIInfraction[]; total: number }>('/infractions', {
      ...filters,
      limit,
      offset: (page - 1) * limit
    }),
  getById: (id: string): Promise<ApiResponse<APIInfraction>> =>
    apiClient.get<APIInfraction>(`/infractions/${id}`),
  getByControle: (controleId: string): Promise<ApiResponse<{ infractions: APIInfraction[]; total: number }>> =>
    apiClient.get<{ infractions: APIInfraction[]; total: number }>('/infractions', { controle_id: controleId }),
  getByVehicule: (vehiculeId: string): Promise<ApiResponse<{ infractions: APIInfraction[]; total: number }>> =>
    apiClient.get<{ infractions: APIInfraction[]; total: number }>('/infractions', { vehicule_id: vehiculeId }),
  archive: (id: string): Promise<ApiResponse<{
    infraction_id: string;
    statut_precedent: string;
    nouveau_statut: string;
    date_archivage: string;
    success: boolean;
    message: string;
  }>> => apiClient.post(`/infractions/${id}/archive`),
  unarchive: (id: string): Promise<ApiResponse<{
    infraction_id: string;
    statut_precedent: string;
    nouveau_statut: string;
    date_archivage: string;
    success: boolean;
    message: string;
  }>> => apiClient.post(`/infractions/${id}/unarchive`),
  getArchived: (filters?: FilterInfractions, page = 1, limit = 100): Promise<ApiResponse<{ infractions: APIInfraction[]; total: number }>> =>
    apiClient.get<{ infractions: APIInfraction[]; total: number }>('/infractions', {
      ...filters,
      statut: 'ARCHIVEE',
      limit,
      offset: (page - 1) * limit
    }),
  recordPayment: (id: string, data: {
    mode_paiement: string;
    montant: number;
    reference?: string;
    notes?: string;
  }): Promise<ApiResponse<{
    infraction_id: string;
    numero_pv: string;
    montant_paye: number;
    mode_paiement: string;
    reference?: string;
    statut_precedent: string;
    nouveau_statut: string;
    date_paiement: string;
    success: boolean;
    message: string;
  }>> => apiClient.post(`/infractions/${id}/payment`, data),
  getDashboard: (filters?: { periode?: string; date_debut?: string; date_fin?: string }): Promise<ApiResponse<InfractionDashboardResponse>> =>
    apiClient.get<InfractionDashboardResponse>('/infractions/dashboard', filters),
  getStatistics: (filters?: { date_debut?: string; date_fin?: string }): Promise<ApiResponse<InfractionStatisticsResponse>> =>
    apiClient.get<InfractionStatisticsResponse>('/infractions/stats', filters),
};

// ==================== OBJETS PERDUS SERVICE ====================
export interface CreateObjetPerduDTO {
  typeObjet: string;
  description: string;
  valeurEstimee?: string;
  couleur?: string;
  detailsSpecifiques?: Record<string, any>;
  declarant: {
    nom: string;
    prenom: string;
    telephone: string;
    email?: string;
    adresse?: string;
    cni?: string;
  };
  lieuPerte: string;
  adresseLieu?: string;
  datePerte: string;
  heurePerte?: string;
  observations?: string;
}

export interface ObjetPerdu {
  id: string;
  numero: string;
  typeObjet: string;
  description: string;
  valeurEstimee?: string;
  couleur?: string;
  detailsSpecifiques?: Record<string, any>;
  declarant: {
    nom: string;
    prenom: string;
    telephone: string;
    email?: string;
    adresse?: string;
    cni?: string;
  };
  lieuPerte: string;
  adresseLieu?: string;
  datePerte: string | Date;
  heurePerte?: string;
  statut: string;
  dateDeclaration: string | Date;
  observations?: string;
  agent?: {
    id: string;
    nom: string;
    prenom: string;
    matricule: string;
  };
  commissariat?: {
    id: string;
    nom: string;
  };
  historique?: Array<{
    date: string;
    action: string;
    agent: string;
    details?: string;
  }>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export const objetsPerdusService = {
  create: (data: CreateObjetPerduDTO): Promise<ApiResponse<ObjetPerdu>> =>
    apiClient.post<ObjetPerdu>('/objets-perdus', data),
  getById: (id: string): Promise<ApiResponse<ObjetPerdu>> =>
    apiClient.get<ObjetPerdu>(`/objets-perdus/${id}`),
  list: (filters?: {
    page?: number;
    limit?: number;
    statut?: string;
    typeObjet?: string;
    dateDebut?: string;
    dateFin?: string;
    search?: string;
    commissariatId?: string;
  }): Promise<ApiResponse<{
    objets: ObjetPerdu[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters || {}).filter(([_, v]) => v != null && v !== '')
    );
    return apiClient.get('/objets-perdus', cleanFilters);
  },
  updateStatut: (id: string, statut: string, data?: any): Promise<ApiResponse<ObjetPerdu>> =>
    apiClient.patch<ObjetPerdu>(`/objets-perdus/${id}/statut`, { statut, ...data }),
  getStatistiques: (filters?: {
    commissariatId?: string;
    dateDebut?: string;
    dateFin?: string;
    periode?: string;
  }): Promise<ApiResponse<{
    total: number;
    enRecherche: number;
    retrouves: number;
    clotures: number;
    tauxRetrouve: number;
    evolutionTotal?: string;
    evolutionEnRecherche?: string;
    evolutionRetrouves?: string;
    evolutionClotures?: string;
    evolutionTauxRetrouve?: string;
  }>> => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters || {}).filter(([_, v]) => v != null && v !== '')
    );
    return apiClient.get('/objets-perdus/statistiques', cleanFilters);
  },
  checkMatches: (data: {
    typeObjet: string;
    identifiers: Record<string, any>;
  }): Promise<ApiResponse<{
    matches: Array<{
      id: string;
      numero: string;
      typeObjet: string;
      description: string;
      valeurEstimee?: string;
      couleur?: string;
      detailsSpecifiques?: Record<string, any>;
      isContainer: boolean;
      containerDetails?: Record<string, any>;
      lieuTrouvaille: string;
      dateTrouvaille: string;
      dateTrouvailleFormatee: string;
      statut: string;
      deposant: Record<string, any>;
      commissariat?: {
        id: string;
        nom: string;
        code: string;
        ville: string;
      };
      matchScore: number;
      matchedField: string;
      matchedIn: 'direct' | 'inventory';
      inventoryItem?: Record<string, any>;
    }>;
    count: number;
  }>> =>
    apiClient.post('/objets-perdus/check-matches', data),
};

// ==================== OBJETS RETROUVÉS SERVICE ====================
export interface CreateObjetRetrouveDTO {
  typeObjet: string;
  description: string;
  valeurEstimee?: string;
  couleur?: string;
  detailsSpecifiques?: Record<string, any>;
  deposant: {
    nom: string;
    prenom: string;
    telephone: string;
    email?: string;
    adresse?: string;
    cni?: string;
  };
  lieuTrouvaille: string;
  adresseLieu?: string;
  dateTrouvaille: string;
  heureTrouvaille?: string;
  observations?: string;
}

export interface ObjetRetrouve {
  id: string;
  numero: string;
  typeObjet: string;
  description: string;
  valeurEstimee?: string;
  couleur?: string;
  detailsSpecifiques?: Record<string, any>;
  deposant: {
    nom: string;
    prenom: string;
    telephone: string;
    email?: string;
    adresse?: string;
    cni?: string;
  };
  lieuTrouvaille: string;
  adresseLieu?: string;
  dateTrouvaille: string | Date;
  heureTrouvaille?: string;
  statut: string;
  dateDepot: string | Date;
  dateRestitution?: string | Date;
  proprietaire?: {
    nom: string;
    prenom: string;
    telephone: string;
    email?: string;
    adresse?: string;
    cni?: string;
  };
  observations?: string;
  agent?: {
    id: string;
    nom: string;
    prenom: string;
    matricule: string;
  };
  commissariat?: {
    id: string;
    nom: string;
  };
  historique?: Array<{
    date: string;
    action: string;
    agent: string;
    details?: string;
  }>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export const objetsRetrouvesService = {
  create: (data: CreateObjetRetrouveDTO): Promise<ApiResponse<ObjetRetrouve>> =>
    apiClient.post<ObjetRetrouve>('/objets-retrouves', data),
  getById: (id: string): Promise<ApiResponse<ObjetRetrouve>> =>
    apiClient.get<ObjetRetrouve>(`/objets-retrouves/${id}`),
  list: (filters?: {
    page?: number;
    limit?: number;
    statut?: string;
    typeObjet?: string;
    dateDebut?: string;
    dateFin?: string;
    search?: string;
    commissariatId?: string;
  }): Promise<ApiResponse<{
    objets: ObjetRetrouve[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters || {}).filter(([_, v]) => v != null && v !== '')
    );
    return apiClient.get('/objets-retrouves', cleanFilters);
  },
  updateStatut: (id: string, statut: string, data?: any): Promise<ApiResponse<ObjetRetrouve>> =>
    apiClient.patch<ObjetRetrouve>(`/objets-retrouves/${id}/statut`, { statut, ...data }),
  getStatistiques: (filters?: {
    commissariatId?: string;
    dateDebut?: string;
    dateFin?: string;
    periode?: string;
  }): Promise<ApiResponse<{
    total: number;
    disponibles: number;
    restitues: number;
    nonReclames: number;
    tauxRestitution: number;
    evolutionTotal?: string;
    evolutionDisponibles?: string;
    evolutionRestitues?: string;
    evolutionNonReclames?: string;
    evolutionTauxRestitution?: string;
  }>> => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters || {}).filter(([_, v]) => v != null && v !== '')
    );
    return apiClient.get('/objets-retrouves/statistiques', cleanFilters);
  },
};

// ==================== CONVOCATIONS SERVICE ====================
export const convocationsService = {
  create: (data: CreateConvocationDTO): Promise<ApiResponse<Convocation>> =>
    apiClient.post<Convocation>('/convocations', data),

  getById: (id: string): Promise<ApiResponse<Convocation>> =>
    apiClient.get<Convocation>(`/convocations/${id}`),

  list: (filters?: {
    page?: number;
    limit?: number;
    statut?: string;
    typeConvocation?: string;
    qualiteConvoque?: string;
    dateDebut?: string;
    dateFin?: string;
    search?: string;
    commissariatId?: string;
  }): Promise<ApiResponse<{
    convocations: Convocation[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters || {}).filter(([_, v]) => v != null && v !== '')
    );
    return apiClient.get('/convocations', cleanFilters);
  },

  updateStatut: (id: string, statut: string, data?: any): Promise<ApiResponse<Convocation>> =>
    apiClient.patch<Convocation>(`/convocations/${id}/statut`, { statut, ...data }),

  getStatistiques: (filters?: {
    commissariatId?: string;
    dateDebut?: string;
    dateFin?: string;
    periode?: 'jour' | 'semaine' | 'mois' | 'annee';
  }): Promise<ApiResponse<{
    totalConvocations: number;
    convocationsJour: number;
    envoyes: number;
    honores: number;
    enAttente: number;
    pourcentageHonores: number;
    evolutionConvocations: string;
    evolutionEnvoyes: string;
    evolutionHonores: string;
    delaiMoyen?: string;
    agentsActifs?: number;
    nouvelles?: number;
  }>> => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters || {}).filter(([_, v]) => v != null && v !== '')
    );
    return apiClient.get('/convocations/statistiques', cleanFilters);
  },

  getDashboard: (filters?: {
    commissariatId?: string;
    dateDebut?: string;
    dateFin?: string;
    periode?: 'jour' | 'semaine' | 'mois' | 'annee';
  }): Promise<ApiResponse<{
    stats: {
      totalConvocations: number;
      envoyees: number;
      honorees: number;
      enAttente: number;
      delaiMoyenJours: number;
      tauxHonore: number;
      agentsActifsCount: number;
      totalAgents: number;
      nouvelles: number;
      evolutionConvocations: string;
      evolutionEnvoyees: string;
      evolutionHonorees: string;
      evolutionEnAttente: string;
      evolutionDelai: string;
      evolutionTauxHonore: string;
      evolutionNouvelles: string;
    };
    activityData: Array<{
      period: string;
      convocations: number;
      envoyees: number;
      honorees: number;
    }>;
    pieData: Array<{
      name: string;
      value: number;
      color: string;
    }>;
    topTypes: Array<{
      type: string;
      count: number;
    }>;
  }>> => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters || {}).filter(([_, v]) => v != null && v !== '')
    );
    return apiClient.get('/convocations/dashboard', cleanFilters);
  },
};



