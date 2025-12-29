// Constantes de l'application Police Nationale CI

export const APP_CONFIG = {
  name: "Système Police Nationale CI",
  version: "1.0.0",
  description: "Système de gestion intégré de la Police Nationale de Côte d'Ivoire"
} as const;

export const GRADES_AGENT = [
  'Gardien de la Paix',
  'Brigadier',
  'Brigadier-Chef',
  'Sous-Lieutenant',
  'Lieutenant',
  'Capitaine',
  'Commandant',
  'Lieutenant-Colonel',
  'Colonel',
  'Général'
] as const;

export const CATEGORIES_INFRACTIONS = {
  Documents: {
    color: 'blue',
    icon: 'FileText',
    description: 'Infractions liées aux documents'
  },
  Vitesse: {
    color: 'red',
    icon: 'Zap',
    description: 'Excès de vitesse et limitations'
  },
  Securite: {
    color: 'yellow',
    icon: 'Shield',
    description: 'Infractions à la sécurité routière'
  },
  Stationnement: {
    color: 'purple',
    icon: 'Car',
    description: 'Infractions de stationnement'
  },
  Comportement: {
    color: 'orange',
    icon: 'AlertTriangle',
    description: 'Comportements dangereux'
  },
  Vehicule: {
    color: 'green',
    icon: 'Settings',
    description: 'État et équipement du véhicule'
  }
} as const;

export const MONTANTS_AMENDES = {
  MINIMUM: 5000,
  MAXIMUM: 500000,
  DEVISE: 'FCFA'
} as const;

export const POINTS_PERMIS = {
  TOTAL_INITIAL: 12,
  MINIMUM_AVANT_RETRAIT: 0,
  RECUPERATION_ANNUELLE: 2
} as const;

export const DELAI_PAIEMENT_JOURS = 30;

export const STATUS_COLORS = {
  // Statuts Contrôles
  'en_cours': 'bg-blue-100 text-blue-800',
  'termine': 'bg-green-100 text-green-800',
  'avec_infractions': 'bg-red-100 text-red-800',
  'conforme': 'bg-green-100 text-green-800',
  
  // Statuts PV
  'genere': 'bg-blue-100 text-blue-800',
  'notifie': 'bg-yellow-100 text-yellow-800',
  'paye': 'bg-green-100 text-green-800',
  'impaye': 'bg-red-100 text-red-800',
  'contentieux': 'bg-purple-100 text-purple-800',
  'annule': 'bg-gray-100 text-gray-800',
  
  // Statuts Agents
  'actif': 'bg-green-100 text-green-800',
  'repos': 'bg-gray-100 text-gray-800',
  'mission': 'bg-blue-100 text-blue-800',
  'formation': 'bg-purple-100 text-purple-800',
  'conge': 'bg-yellow-100 text-yellow-800',
  
  // Statuts Commissariats
  'maintenance': 'bg-yellow-100 text-yellow-800',
  'urgence': 'bg-red-100 text-red-800'
} as const;

export const URGENCE_COLORS = {
  'faible': 'bg-green-100 text-green-800',
  'moyen': 'bg-yellow-100 text-yellow-800',
  'eleve': 'bg-orange-100 text-orange-800',
  'critique': 'bg-red-100 text-red-800'
} as const;

export const NAVIGATION_ADMIN = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: "LayoutDashboard"
  },
  {
    title: "Commissariats",
    href: "/admin/commissariats",
    icon: "Building"
  },
  {
    title: "Agents",
    href: "/admin/agents",
    icon: "Users"
  },
  {
    title: "Centre de Sécurité",
    href: "/admin/securite",
    icon: "Shield"
  },
  {
    title: "Monitoring",
    href: "/admin/monitoring",
    icon: "Activity"
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: "BarChart3"
  },
  {
    title: "Rapports",
    href: "/admin/rapports",
    icon: "FileText"
  }
] as const;

export const NAVIGATION_GESTION = [
  {
    title: "Dashboard",
    href: "/gestion",
    icon: "LayoutDashboard"
  },
  {
    title: "Contrôles",
    href: "/gestion/controles",
    icon: "Search"
  },
  {
    title: "Verbalisations",
    href: "/gestion/verbalisations",
    icon: "FileCheck"
  },
  {
    title: "Amendes",
    href: "/gestion/amendes",
    icon: "DollarSign"
  },
  {
    title: "Infractions",
    href: "/gestion/infractions",
    icon: "AlertCircle"
  },
  {
    title: "Alertes",
    href: "/gestion/alertes",
    icon: "Bell"
  }
] as const;

// Messages par défaut
export const MESSAGES = {
  LOADING: "Chargement en cours...",
  ERROR_GENERIC: "Une erreur s'est produite",
  SUCCESS_SAVE: "Enregistré avec succès",
  CONFIRM_DELETE: "Êtes-vous sûr de vouloir supprimer cet élément ?",
  NO_DATA: "Aucune donnée disponible",
  UNAUTHORIZED: "Accès non autorisé",
  CONNECTION_ERROR: "Erreur de connexion"
} as const;