// Types pour l'application Police Nationale CI

export interface Commissariat {
  id: string;
  nom: string;
  code: string;
  localisation: string;
  coordonnees: {
    latitude: number;
    longitude: number;
  };
  responsable: {
    nom: string;
    grade: string;
    telephone: string;
  };
  agents: {
    total: number;
    presents: number;
    enMission: number;
  };
  statistiques: {
    controlesJour: number;
    controlesSemaine: number;
    controlesMois: number;
    revenus: number;
    tauxConformite: number;
  };
  status: 'actif' | 'maintenance' | 'urgence';
}

export interface Agent {
  id: string;
  matricule: string;
  nom: string;
  prenoms: string;
  grade: GradeAgent;
  commissariat: string;
  telephone: string;
  email: string;
  status: StatusAgent;
  specialites: string[];
  dateRecrutement: string;
  derniereActivite: string;
}

export type GradeAgent = 
  | 'Gardien de la Paix'
  | 'Brigadier'
  | 'Brigadier-Chef'
  | 'Sous-Lieutenant'
  | 'Lieutenant'
  | 'Capitaine'
  | 'Commandant'
  | 'Lieutenant-Colonel'
  | 'Colonel'
  | 'Général';

export type StatusAgent = 'actif' | 'repos' | 'mission' | 'formation' | 'conge';

export interface TypeInfraction {
  id: string;
  code: string;
  libelle: string;
  categorie: CategorieInfraction;
  gravite: 1 | 2 | 3 | 4 | 5;
  amende: {
    min: number;
    max: number;
    devise: 'FCFA';
  };
  points: number; // Points retirés du permis
  description: string;
  sanctions: string[];
  recidive: {
    multiplicateur: number;
    sanctionSupplementaire?: string;
  };
}

export type CategorieInfraction = 
  | 'Documents'
  | 'Vitesse'
  | 'Securite'
  | 'Stationnement'
  | 'Comportement'
  | 'Vehicule';

export interface Controle {
  id: string;
  numero: string;
  date: string;
  heure: string;
  lieu: string;
  agent: {
    id: string;
    nom: string;
    matricule: string;
  };
  commissariat: string;
  vehicule: {
    immatriculation: string;
    marque: string;
    modele: string;
    couleur: string;
    type: 'Voiture' | 'Moto' | 'Camion' | 'Autobus';
  };
  conducteur: {
    nom: string;
    prenoms: string;
    permis?: {
      numero: string;
      dateExpiration: string;
      pointsRestants: number;
    };
    cni: {
      numero: string;
      dateExpiration: string;
    };
    telephone?: string;
  };
  infractions: InfractionConstatee[];
  montantTotal: number;
  status: StatusControle;
  observations?: string;
  photos?: string[];
  pv?: {
    numero: string;
    genere: boolean;
    dateGeneration?: string;
  };
}

export interface InfractionConstatee {
  id: string;
  typeInfraction: string; // ID du type d'infraction
  constatee: boolean;
  montant: number;
  commentaire?: string;
}

export type StatusControle = 'en_cours' | 'termine' | 'avec_infractions' | 'conforme';

export interface ProcesVerbal {
  id: string;
  numero: string;
  controleId: string;
  dateGeneration: string;
  statut: StatusPV;
  infractions: InfractionPV[];
  montantTotal: number;
  modePaiement?: ModePaiement;
  datePaiement?: string;
  referenceTransaction?: string;
  delaiPaiement: string;
}

export interface InfractionPV {
  type: string;
  libelle: string;
  montant: number;
  points: number;
}

export type StatusPV = 'genere' | 'notifie' | 'paye' | 'impaye' | 'contentieux' | 'annule';
export type ModePaiement = 'especes' | 'mobile_money' | 'virement' | 'cheque';

export interface Alerte {
  id: string;
  type: TypeAlerte;
  titre: string;
  message: string;
  urgence: NiveauUrgence;
  date: string;
  commissariat?: string;
  vehicule?: {
    immatriculation: string;
    marque: string;
    modele: string;
  };
  suspect?: {
    nom: string;
    description: string;
  };
  status: 'active' | 'resolue' | 'archivee';
  actions?: string[];
}

export type TypeAlerte = 
  | 'vehicule_vole'
  | 'suspect_recherche'
  | 'urgence_securite'
  | 'alerte_generale'
  | 'maintenance_systeme';

export type NiveauUrgence = 'faible' | 'moyen' | 'eleve' | 'critique';

export interface StatistiquesNationales {
  controlesJour: number;
  controlesSemaine: number;
  controlesMois: number;
  revenus: {
    jour: number;
    semaine: number;
    mois: number;
  };
  agents: {
    total: number;
    actifs: number;
    enMission: number;
  };
  commissariats: {
    total: number;
    actifs: number;
  };
  infractions: {
    total: number;
    parCategorie: Record<CategorieInfraction, number>;
  };
  tauxConformite: number;
  tendances: {
    controles: number; // % d'évolution
    revenus: number;
    infractions: number;
  };
}

export interface Notification {
  id: string;
  titre: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  date: string;
  lue: boolean;
  url?: string;
}

// ==================== TYPES PLAINTES ====================

export type StatutPlainte = 'EN_COURS' | 'RESOLU' | 'CLASSE' | 'TRANSFERE'
export type PrioritePlainte = 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE'
export type EtapePlainte = 'DEPOT' | 'ENQUETE' | 'CONVOCATIONS' | 'RESOLUTION' | 'CLOTURE'
export type TypePlainte = 'Vol avec violence' | 'Vol simple' | 'Cambriolage' | 'Agression' | 'Escroquerie' | 'Harcèlement' | 'Menace' | 'Fraude' | 'Autre'

export interface Plainte {
  id: string
  numero: string
  type_plainte: TypePlainte
  description: string
  statut: StatutPlainte
  priorite: PrioritePlainte
  etape_actuelle: EtapePlainte
  
  // Plaignant
  plaignant_nom: string
  plaignant_prenom: string
  plaignant_telephone?: string
  plaignant_email?: string
  plaignant_adresse?: string
  
  // Dates
  date_depot: string
  date_faits?: string
  date_resolution?: string
  date_cloture?: string
  
  // Lieu
  lieu_faits?: string
  coordonnees_gps?: {
    latitude: number
    longitude: number
  }
  
  // Gestion
  agent_assigne?: {
    id: string
    nom: string
    prenom: string
    matricule: string
  }
  commissariat?: {
    id: string
    nom: string
    code: string
  }
  
  // Métriques
  delai_sla?: string
  sla_depasse: boolean
  nombre_convocations: number
  nombre_suspects?: number
  nombre_temoins?: number
  nombre_preuves?: number
  
  // Relations
  suspects?: Suspect[]
  temoins?: Temoin[]
  preuves?: Preuve[]
  actes_enquete?: ActeEnquete[]
  
  // Informations complémentaires
  observations?: string
  decision_finale?: string
  montant_prejudice?: number
  
  // Audit
  created_at: string
  updated_at: string
}

export interface Suspect {
  id: string
  nom: string
  prenom: string
  alias?: string
  description?: string
  adresse?: string
  telephone?: string
  photo_url?: string
  antecedents?: string
  date_naissance?: string
  nationalite?: string
  profession?: string
  signes_distinctifs?: string
  vehicule?: {
    marque: string
    modele: string
    immatriculation: string
    couleur: string
  }
  arme_utilisee?: string
  mobile_presume?: string
  lien_victime?: string
  niveau_dangeurosite?: 'FAIBLE' | 'MOYEN' | 'ELEVE' | 'CRITIQUE'
  statut_recherche?: 'RECHERCHE' | 'IDENTIFIE' | 'ARRETE' | 'EN_FUITE'
}

export interface Temoin {
  id: string
  nom: string
  prenom: string
  telephone?: string
  email?: string
  adresse?: string
  profession?: string
  date_audition?: string
  declaration?: string
  fiabilite?: 'FAIBLE' | 'MOYENNE' | 'BONNE' | 'EXCELLENTE'
  position_lors_faits?: string
  protection_demandee: boolean
  disponibilite?: string
}

export interface Preuve {
  id: string
  numero_piece: string
  type: 'MATERIELLE' | 'NUMERIQUE' | 'TESTIMONIALE' | 'DOCUMENTAIRE'
  description: string
  lieu_conservation?: string
  date_collecte: string
  collecte_par?: string
  photos?: string[]
  hash_verification?: string
  expertise_demandee: boolean
  expertise_type?: string
  expertise_resultat?: string
  statut: 'COLLECTEE' | 'EN_ANALYSE' | 'ANALYSEE' | 'RETOURNEE'
}

export interface ActeEnquete {
  id: string
  type: 'AUDITION' | 'PERQUISITION' | 'EXPERTISE' | 'GARDE_A_VUE' | 'CONFRONTATION' | 'RECONSTITUTION'
  date: string
  heure?: string
  duree?: string
  lieu?: string
  officier_charge: string
  description: string
  pv_numero?: string
  mandat_numero?: string
  personnes_presentes?: string[]
  objets_saisis?: string[]
  conclusions?: string
  documents_joints?: string[]
}

export interface PlaintesStats {
  total: number
  enCours: number
  resolues: number
  classees: number
  transferees: number
  urgentes: number
  slaDepasse: number
  delaiMoyenJours: number
  tauxResolution: number
  
  // Évolutions
  evolutionTotal: string
  evolutionEnCours: string
  evolutionResolues: string
  evolutionClassees: string
  evolutionTransferees: string
  evolutionDelai: string
}

export interface TopTypePlainte {
  type: string
  count: number
  pourcentage: number
}

export interface ActivityData {
  period: string
  plaintes: number
  urgentes: number
  resolues: number
  date?: string
}

export interface AlertePlainte {
  id: string
  plainte_numero: string
  plainte_id: string
  type_alerte: 'SLA_DEPASSE' | 'SANS_ACTION' | 'EXPERTISE_REQUISE' | 'CONVOCATION_REQUISE'
  message: string
  niveau: 'INFO' | 'WARNING' | 'CRITICAL'
  date_alerte: string
}

export interface TopAgent {
  id: string
  nom: string
  prenom: string
  matricule: string
  plaintes_traitees: number
  plaintes_resolues: number
  score: number
  delai_moyen: number
}