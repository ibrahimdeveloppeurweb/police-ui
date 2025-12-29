'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import {
  ArrowLeft, Printer, Download, Edit, Calendar, MapPin, User as UserIcon, Users,
  Phone, Mail, AlertCircle, TrendingUp, TrendingDown, CheckCircle,
  Clock, DollarSign, Shield, Eye, BarChart3, Activity, Award,
  AlertTriangle, FileText, Target, Radio, Navigation, MessageSquare,
  Bell, Zap, Car, Search, FileDown, RefreshCw, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import {
  adminService,
  controlesService,
  inspectionsService,
  type AgentStatistiques,
  type User,
  type Mission as APIMission,
  type Objectif as APIObjectif,
  type Observation as APIObservation,
  type Competence as APICompetence,
  type Equipe as APIEquipe,
  type Controle as APIControle,
  type Inspection as APIInspection
} from '@/lib/api/services'
import { Wrench } from 'lucide-react'
import { ObjectifForm, ObservationForm } from '@/components/forms'
import Link from 'next/link'

type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'

// Type pour l'agent depuis l'API - utilise User avec les nouvelles relations
type AgentFromAPI = User

type ControleHistorique = {
  id: string
  date: string
  heure: string
  lieu: string
  vehicule: string
  resultat: 'Conforme' | 'Infraction' | 'Avertissement'
  montant?: number
}

// Local type for mock data (kept for backward compatibility with dataByPeriod)
type MockMission = {
  id: string
  type: string
  date: string
  duree: string
  zone: string
  statut: 'Terminée' | 'En cours' | 'Planifiée'
}

const agentBaseInfo = {
  id: '1',
  nom: 'KOUASSI',
  prenom: 'Jean',

  informations: {
    matricule: 'CI-PN-001245',
    grade: 'Sergent',
    dateNaissance: '15/03/1988',
    cni: 'CI1234567890',
    telephone: '+225 07 12 34 56 78',
    email: 'jean.kouassi@police.ci',
    adresse: 'Cocody Riviera 2, Abidjan',
    dateEntree: '10/01/2015',
    anciennete: '9 ans 9 mois'
  },

  affectation: {
    commissariat: '3ème Arrondissement - Adjamé',
    commissariatId: 'COM-ABJ-003',
    superieur: 'Commissaire Principal Moussa DIABATE',
    equipe: 'Équipe Alpha',
    zone: 'Zone Centre - Adjamé'
  },

  statut: {
    status: 'EN SERVICE' as const,
    localisation: 'Boulevard Principal, Adjamé',
    activite: 'Patrouille mobile',
    gps: 98,
    derniereActivite: 'Contrôle AB-123-CD (il y a 2min)',
    tempsService: '2h15'
  },

  // Empty arrays for mock data fallback
  missions: [] as APIMission[],
  objectifs: [] as APIObjectif[],
  observations: [] as APIObservation[],
  competences: [] as APICompetence[],
  equipe: undefined as APIEquipe | undefined
}

// Helper functions
function calculateAnciennete(createdAt: string): string {
  const start = new Date(createdAt)
  const now = new Date()
  const diff = now.getTime() - start.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const years = Math.floor(days / 365)
  const months = Math.floor((days % 365) / 30)

  if (years > 0) {
    return `${years} an${years > 1 ? 's' : ''} ${months} mois`
  }
  return `${months} mois`
}

function mapStatus(status?: string): 'EN SERVICE' | 'EN PAUSE' | 'HORS SERVICE' {
  switch (status?.toUpperCase()) {
    case 'EN_SERVICE':
      return 'EN SERVICE'
    case 'EN_PAUSE':
      return 'EN PAUSE'
    default:
      return 'HORS SERVICE'
  }
}

function formatDerniereActivite(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))

  if (minutes < 60) {
    return `il y a ${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `il y a ${hours}h`
  }
  return date.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function getPerformanceLevel(tauxInfraction: number): 'Excellente' | 'Correcte' | 'Critique' {
  if (tauxInfraction >= 40) return 'Excellente'
  if (tauxInfraction >= 20) return 'Correcte'
  return 'Critique'
}

const dataByPeriod = {
  jour: {
    performance: {
      score: 94.5,
      niveau: 'Excellente' as const,
      controles: 8,
      infractions: 3,
      revenus: 85000,
      tauxInfractions: 37.5,
      moyenneControles: 8
    },
    historique: [
      { id: 'CTR-001', date: '10/10/2025', heure: '14:35', lieu: 'Boulevard Principal', vehicule: 'AB-123-CD', resultat: 'Infraction' as const, montant: 25000 },
      { id: 'CTR-002', date: '10/10/2025', heure: '13:20', lieu: 'Avenue Centrale', vehicule: 'EF-456-GH', resultat: 'Conforme' as const },
      { id: 'CTR-003', date: '10/10/2025', heure: '12:45', lieu: 'Rue du Commerce', vehicule: 'IJ-789-KL', resultat: 'Infraction' as const, montant: 35000 },
      { id: 'CTR-004', date: '10/10/2025', heure: '11:30', lieu: 'Boulevard Principal', vehicule: 'MN-012-OP', resultat: 'Avertissement' as const },
      { id: 'CTR-005', date: '10/10/2025', heure: '10:15', lieu: 'Place République', vehicule: 'QR-345-ST', resultat: 'Conforme' as const }
    ],
    missions: [
      { id: 'MISS-001', type: 'Patrouille mobile', date: '10/10/2025', duree: '2h15', zone: 'Zone Centre', statut: 'En cours' as const }
    ],
    observations: 'Journée en cours - Performance excellente maintenue',
    objectifs: ['Compléter 10 contrôles', 'Maintenir le taux de performance', 'Patrouille zone sensible']
  },
  semaine: {
    performance: {
      score: 92.8,
      niveau: 'Excellente' as const,
      controles: 47,
      infractions: 18,
      revenus: 545000,
      tauxInfractions: 38.3,
      moyenneControles: 7.8
    },
    historique: [
      { id: 'CTR-W45', date: '09/10/2025', heure: '16:20', lieu: 'Avenue Centrale', vehicule: 'UV-789-WX', resultat: 'Infraction' as const, montant: 30000 },
      { id: 'CTR-W44', date: '09/10/2025', heure: '14:15', lieu: 'Boulevard Ouest', vehicule: 'YZ-234-AB', resultat: 'Conforme' as const },
      { id: 'CTR-W43', date: '08/10/2025', heure: '11:30', lieu: 'Rue Commerce', vehicule: 'CD-567-EF', resultat: 'Infraction' as const, montant: 45000 },
      { id: 'CTR-W42', date: '08/10/2025', heure: '09:45', lieu: 'Place République', vehicule: 'GH-890-IJ', resultat: 'Avertissement' as const },
      { id: 'CTR-W41', date: '07/10/2025', heure: '15:20', lieu: 'Boulevard Principal', vehicule: 'KL-123-MN', resultat: 'Infraction' as const, montant: 25000 }
    ],
    missions: [
      { id: 'MISS-W01', type: 'Patrouille mobile', date: '10/10/2025', duree: '2h15', zone: 'Zone Centre', statut: 'En cours' as const },
      { id: 'MISS-W02', type: 'Contrôle fixe', date: '09/10/2025', duree: '4h00', zone: 'Boulevard Principal', statut: 'Terminée' as const },
      { id: 'MISS-W03', type: 'Patrouille zone', date: '07/10/2025', duree: '3h30', zone: 'Zone Nord', statut: 'Terminée' as const }
    ],
    observations: 'Excellente semaine avec une forte activité. Bon taux de détection.',
    objectifs: ['50 contrôles hebdomadaires', 'Formation nouvel agent', 'Couverture zones prioritaires']
  },
  mois: {
    performance: {
      score: 93.2,
      niveau: 'Excellente' as const,
      controles: 156,
      infractions: 58,
      revenus: 1750000,
      tauxInfractions: 37.2,
      moyenneControles: 7.8
    },
    historique: [
      { id: 'CTR-M234', date: '05/10/2025', heure: '14:30', lieu: 'Avenue République', vehicule: 'OP-456-QR', resultat: 'Infraction' as const, montant: 40000 },
      { id: 'CTR-M233', date: '04/10/2025', heure: '10:15', lieu: 'Boulevard Ouest', vehicule: 'ST-789-UV', resultat: 'Conforme' as const },
      { id: 'CTR-M232', date: '03/10/2025', heure: '16:45', lieu: 'Rue Centrale', vehicule: 'WX-012-YZ', resultat: 'Infraction' as const, montant: 35000 },
      { id: 'CTR-M231', date: '02/10/2025', heure: '11:20', lieu: 'Place Commerce', vehicule: 'AB-345-CD', resultat: 'Avertissement' as const },
      { id: 'CTR-M230', date: '01/10/2025', heure: '09:30', lieu: 'Boulevard Principal', vehicule: 'EF-678-GH', resultat: 'Infraction' as const, montant: 25000 }
    ],
    missions: [
      { id: 'MISS-M01', type: 'Patrouille mobile', date: '10/10/2025', duree: '2h15', zone: 'Zone Centre', statut: 'En cours' as const },
      { id: 'MISS-M02', type: 'Contrôle fixe', date: '09/10/2025', duree: '4h00', zone: 'Boulevard Principal', statut: 'Terminée' as const },
      { id: 'MISS-M03', type: 'Surveillance événement', date: '05/10/2025', duree: '6h00', zone: 'Stade Municipal', statut: 'Terminée' as const },
      { id: 'MISS-M04', type: 'Opération spéciale', date: '01/10/2025', duree: '8h00', zone: 'Multiple zones', statut: 'Terminée' as const }
    ],
    observations: 'Agent exemplaire avec un excellent taux de détection d\'infractions. Très apprécié par ses collègues et sa hiérarchie.',
    objectifs: ['Maintenir 90%+ performance', 'Former 3 nouveaux agents', 'Atteindre 200 contrôles', 'Programme mentorat']
  },
  annee: {
    performance: {
      score: 94.1,
      niveau: 'Excellente' as const,
      controles: 1847,
      infractions: 687,
      revenus: 20850000,
      tauxInfractions: 37.2,
      moyenneControles: 7.7
    },
    historique: [
      { id: 'CTR-Y956', date: 'Sept 2025', heure: '--', lieu: 'Statistiques mensuelles', vehicule: '198 contrôles', resultat: 'Conforme' as const },
      { id: 'CTR-Y955', date: 'Août 2025', heure: '--', lieu: 'Statistiques mensuelles', vehicule: '187 contrôles', resultat: 'Conforme' as const },
      { id: 'CTR-Y954', date: 'Juil 2025', heure: '--', lieu: 'Statistiques mensuelles', vehicule: '176 contrôles', resultat: 'Conforme' as const },
      { id: 'CTR-Y953', date: 'Juin 2025', heure: '--', lieu: 'Statistiques mensuelles', vehicule: '165 contrôles', resultat: 'Conforme' as const },
      { id: 'CTR-Y952', date: 'Mai 2025', heure: '--', lieu: 'Statistiques mensuelles', vehicule: '154 contrôles', resultat: 'Conforme' as const }
    ],
    missions: [
      { id: 'MISS-Y01', type: 'Missions régulières', date: '2025', duree: 'Année complète', zone: 'Toutes zones', statut: 'En cours' as const },
      { id: 'MISS-Y02', type: 'Opérations spéciales', date: '2025', duree: '45 jours', zone: 'Multiple', statut: 'Terminée' as const },
      { id: 'MISS-Y03', type: 'Formation continue', date: '2025', duree: '30 jours', zone: 'Centre formation', statut: 'Terminée' as const }
    ],
    observations: 'Performance exceptionnelle sur l\'année. Agent modèle reconnu au niveau national.',
    objectifs: ['Excellence opérationnelle', 'Leadership équipe', 'Innovation procédures', 'Mentorat continu']
  },
  tout: {
    performance: {
      score: 95.3,
      niveau: 'Excellente' as const,
      controles: 18470,
      infractions: 6874,
      revenus: 208500000,
      tauxInfractions: 37.2,
      moyenneControles: 7.8
    },
    historique: [
      { id: 'CTR-ALL01', date: '2024', heure: '--', lieu: 'Bilan annuel', vehicule: '2,245 contrôles', resultat: 'Conforme' as const },
      { id: 'CTR-ALL02', date: '2023', heure: '--', lieu: 'Bilan annuel', vehicule: '2,187 contrôles', resultat: 'Conforme' as const },
      { id: 'CTR-ALL03', date: '2022', heure: '--', lieu: 'Bilan annuel', vehicule: '2,034 contrôles', resultat: 'Conforme' as const },
      { id: 'CTR-ALL04', date: '2021', heure: '--', lieu: 'Bilan annuel', vehicule: '1,876 contrôles', resultat: 'Conforme' as const },
      { id: 'CTR-ALL05', date: '2020', heure: '--', lieu: 'Bilan annuel', vehicule: '1,723 contrôles', resultat: 'Conforme' as const }
    ],
    missions: [
      { id: 'MISS-ALL01', type: 'Carrière complète', date: 'Depuis 2015', duree: '9 ans 9 mois', zone: 'Toutes zones', statut: 'En cours' as const },
      { id: 'MISS-ALL02', type: 'Opérations majeures', date: 'Multiples', duree: 'Cumul 450j', zone: 'National', statut: 'Terminée' as const }
    ],
    observations: 'Carrière exemplaire. Agent d\'élite reconnu pour son excellence et son dévouement constant.',
    objectifs: ['Excellence continue', 'Promotion grade supérieur', 'Académie formation', 'Reconnaissance nationale']
  },
  personnalise: {
    performance: {
      score: 91.5,
      niveau: 'Excellente' as const,
      controles: 89,
      infractions: 34,
      revenus: 1020000,
      tauxInfractions: 38.2,
      moyenneControles: 7.4
    },
    historique: [
      { id: 'CTR-C12', date: 'Période', heure: '--', lieu: 'Données personnalisées', vehicule: 'Filtrage actif', resultat: 'Conforme' as const },
      { id: 'CTR-C11', date: 'Période', heure: '--', lieu: 'Analyse en cours', vehicule: 'Voir filtres', resultat: 'Conforme' as const }
    ],
    missions: [
      { id: 'MISS-C01', type: 'Missions période', date: 'Dates filtrées', duree: 'Variable', zone: 'Selon filtres', statut: 'En cours' as const }
    ],
    observations: 'Données pour la période sélectionnée. Analyse personnalisée en cours.',
    objectifs: ['Analyse période ciblée', 'Évaluation spécifique', 'Rapport personnalisé']
  }
}

export default function AgentDetailPage() {
  const params = useParams()
  const agentId = params.id as string

  const [activeTab, setActiveTab] = useState('apercu')
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('tout')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)

  // States for API data
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [agentData, setAgentData] = useState<AgentFromAPI | null>(null)
  const [agentStats, setAgentStats] = useState<AgentStatistiques | null>(null)
  const [agentControles, setAgentControles] = useState<APIControle[]>([])
  const [loadingControles, setLoadingControles] = useState(false)
  const [agentInspections, setAgentInspections] = useState<APIInspection[]>([])
  const [loadingInspections, setLoadingInspections] = useState(false)

  // States for modals
  const [showObjectifForm, setShowObjectifForm] = useState(false)
  const [showObservationForm, setShowObservationForm] = useState(false)
  const [editingObjectif, setEditingObjectif] = useState<APIObjectif | undefined>(undefined)
  const [editingObservation, setEditingObservation] = useState<APIObservation | undefined>(undefined)

  // Fetch agent data from API
  const fetchAgentData = useCallback(async () => {
    if (!agentId) return

    setLoading(true)
    setError(null)

    try {
      console.log('Fetching agent data for:', agentId)
      const [agentResponse, statsResponse] = await Promise.all([
        adminService.getAgent(agentId),
        adminService.getAgentStatistiques(agentId)
      ])

      console.log('Agent response:', agentResponse)
      console.log('Stats response:', statsResponse)

      if (agentResponse.success && agentResponse.data) {
        console.log('Setting agent data:', agentResponse.data)
        setAgentData(agentResponse.data as AgentFromAPI)
      } else {
        console.log('Agent response failed:', agentResponse)
        setError('Erreur lors du chargement de l\'agent')
      }

      if (statsResponse.success && statsResponse.data) {
        setAgentStats(statsResponse.data)
      }
    } catch (err) {
      console.error('Error fetching agent:', err)
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }, [agentId])

  // Fetch agent controles from API
  const fetchAgentControles = useCallback(async () => {
    if (!agentId) return

    setLoadingControles(true)
    try {
      const response = await controlesService.getByAgent(agentId)
      if (response.success && response.data) {
        // L'API retourne {controles: [...], total: N}
        setAgentControles(response.data.controles || [])
      }
    } catch (err) {
      console.error('Error fetching controles:', err)
    } finally {
      setLoadingControles(false)
    }
  }, [agentId])

  // Fetch agent inspections from API
  const fetchAgentInspections = useCallback(async () => {
    if (!agentId) return

    setLoadingInspections(true)
    try {
      const response = await inspectionsService.getByAgent(agentId)
      if (response.success && response.data) {
        setAgentInspections(response.data.inspections || [])
      }
    } catch (err) {
      console.error('Error fetching inspections:', err)
    } finally {
      setLoadingInspections(false)
    }
  }, [agentId])

  useEffect(() => {
    fetchAgentData()
  }, [fetchAgentData])

  useEffect(() => {
    if (agentId) {
      fetchAgentControles()
      fetchAgentInspections()
    }
  }, [agentId, fetchAgentControles, fetchAgentInspections])

  // Transform API data to local format
  const transformedAgent = agentData ? {
    id: agentData.id,
    nom: agentData.nom.toUpperCase(),
    prenom: agentData.prenom,

    informations: {
      matricule: agentData.matricule,
      grade: agentData.grade || 'Non défini',
      dateNaissance: '---', // Not available from API
      cni: '---', // Not available from API
      telephone: agentData.telephone || 'Non renseigné',
      email: agentData.email,
      adresse: '---', // Not available from API
      dateEntree: new Date(agentData.createdAt).toLocaleDateString('fr-FR'),
      anciennete: calculateAnciennete(agentData.createdAt)
    },

    affectation: {
      commissariat: agentData.commissariat?.nom || 'Non assigné',
      commissariatId: agentData.commissariat?.code || 'N/A',
      superieur: agentData.superieur
        ? `${agentData.superieur.grade || ''} ${agentData.superieur.prenom} ${agentData.superieur.nom}`.trim()
        : 'Non défini',
      equipe: agentData.equipe?.nom || 'Non assigné',
      zone: agentData.commissariat ? `${agentData.commissariat.ville} - ${agentData.commissariat.region}` : 'Non défini'
    },

    statut: {
      status: mapStatus(agentData.statutService),
      localisation: agentData.localisation || 'Position inconnue',
      activite: agentData.activite || 'Non spécifiée',
      gps: 100, // Default
      derniereActivite: agentData.derniereActivite
        ? formatDerniereActivite(agentData.derniereActivite)
        : 'Aucune activité récente',
      tempsService: '8h00' // Default
    },

    // Raw data from API for new sections
    missions: agentData.missions || [],
    objectifs: agentData.objectifs || [],
    observations: agentData.observations || [],
    competences: agentData.competences || [],
    equipe: agentData.equipe
  } : agentBaseInfo

  // Transform statistics
  const transformedStats = agentStats ? {
    performance: {
      score: Math.min(100, Math.max(0, 100 - (agentStats.tauxInfraction > 100 ? 0 : 100 - agentStats.tauxInfraction))),
      niveau: getPerformanceLevel(agentStats.tauxInfraction),
      controles: agentStats.totalControles,
      infractions: agentStats.totalInfractions,
      revenus: agentStats.montantTotalPV,
      tauxInfractions: agentStats.tauxInfraction,
      moyenneControles: agentStats.controlesParJour
    }
  } : null

  const currentData = isCustomDateRange ? dataByPeriod.personnalise : dataByPeriod[globalFilter]
  const displayStats = transformedStats?.performance || currentData.performance

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const handleFilterChange = (filter: PeriodKey) => {
    setGlobalFilter(filter)
    setIsCustomDateRange(false)
    setDateDebut('')
    setDateFin('')
  }

  const handleCustomDateSearch = () => {
    if (dateDebut && dateFin) {
      setIsCustomDateRange(true)
      setGlobalFilter('personnalise')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    alert('Export des données en cours...\nFormat: CSV/Excel/PDF')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EN SERVICE': return 'bg-green-500 text-white'
      case 'EN PAUSE': return 'bg-yellow-500 text-white'
      case 'HORS SERVICE': return 'bg-red-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getPerformanceColor = (niveau: string) => {
    switch (niveau) {
      case 'Excellente': return 'bg-green-100 text-green-800'
      case 'Correcte': return 'bg-blue-100 text-blue-800'
      case 'Critique': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getResultatColor = (resultat: string) => {
    switch (resultat) {
      case 'Conforme': return 'bg-green-100 text-green-800'
      case 'Infraction': return 'bg-red-100 text-red-800'
      case 'Avertissement': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMissionStatutColor = (statut: string) => {
    switch (statut) {
      case 'En cours': return 'bg-blue-100 text-blue-800'
      case 'Terminée': return 'bg-green-100 text-green-800'
      case 'Planifiée': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-slate-600">Chargement des données de l'agent...</p>
        </div>
      </div>
    )
  }

  // Error state with fallback to mock data
  if (error && !agentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center p-6">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-slate-900 font-medium">{error}</p>
          <p className="text-slate-600 text-sm">Impossible de charger les données de l'agent.</p>
          <div className="flex gap-3">
            <Button variant="primary" onClick={fetchAgentData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
            <Button variant="secondary" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="md"
            className="!p-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
              {transformedAgent.prenom} {transformedAgent.nom}
            </h1>
            <p className="text-slate-600 mt-1">
              {transformedAgent.informations.matricule} • {transformedAgent.informations.grade}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="success" size="md">
            <Phone className="w-5 h-5" />
            <span className="hidden sm:inline">Contacter</span>
          </Button>
          <Button variant="secondary" size="md">
            <MessageSquare className="w-5 h-5" />
            <span className="hidden sm:inline">Message</span>
          </Button>
          <Button variant="secondary" size="md">
            <Edit className="w-5 h-5" />
            <span className="hidden sm:inline">Modifier</span>
          </Button>
        </div>
      </div>

      {/* Filtre Global de Période */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardBody className="p-4 md:p-6">
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Période d'analyse</h2>
                  <p className="text-gray-600 text-xs md:text-sm hidden sm:block">Filtrer les statistiques et l'historique</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  onClick={() => handleFilterChange('jour')}
                  className={`${globalFilter === 'jour' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Aujourd'hui
                </Button>
                <Button 
                  onClick={() => handleFilterChange('semaine')}
                  className={`${globalFilter === 'semaine' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Semaine
                </Button>
                <Button 
                  onClick={() => handleFilterChange('mois')}
                  className={`${globalFilter === 'mois' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Mois
                </Button>
                <Button 
                  onClick={() => handleFilterChange('annee')}
                  className={`${globalFilter === 'annee' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Année
                </Button>
                <Button 
                  onClick={() => handleFilterChange('tout')}
                  className={`${globalFilter === 'tout' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Tout
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-4 border-t border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">Date début:</label>
                <input 
                  type="date" 
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">Date fin:</label>
                <input 
                  type="date" 
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                />
              </div>
              
              <Button 
                onClick={handleCustomDateSearch}
                disabled={!dateDebut || !dateFin}
                className={`${!dateDebut || !dateFin ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'} flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2 w-full sm:w-auto`}
              >
                <Search className="w-4 h-4" />
                Rechercher
              </Button>

              <div className="hidden sm:block w-px h-8 bg-blue-300"></div>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  onClick={handlePrint}
                  className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2"
                >
                  <Printer className="w-4 h-4" />
                  Imprimer
                </Button>
                
                <Button 
                  onClick={handleExport}
                  className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2"
                >
                  <FileDown className="w-4 h-4" />
                  Exporter
                </Button>
              </div>
            </div>
            
            {isCustomDateRange && (
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg w-full sm:w-auto">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs md:text-sm font-medium">Période personnalisée: {dateDebut} au {dateFin}</span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Carte de statut principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardBody className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex gap-6 flex-1">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                  transformedAgent.statut.status === 'EN SERVICE' ? 'bg-green-600' :
                  transformedAgent.statut.status === 'EN PAUSE' ? 'bg-yellow-600' : 'bg-red-600'
                }`}>
                  <Users className="w-12 h-12 text-white" />
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Informations Personnelles</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Date de naissance</label>
                      <div className="text-slate-900">{transformedAgent.informations.dateNaissance}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">CNI</label>
                      <div className="text-slate-900 font-mono text-sm">{transformedAgent.informations.cni}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Téléphone</label>
                      <div className="text-slate-900 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        {transformedAgent.informations.telephone}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Email</label>
                      <div className="text-slate-900 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {transformedAgent.informations.email}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Date d'entrée</label>
                      <div className="text-slate-900 flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {transformedAgent.informations.dateEntree}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Ancienneté</label>
                      <div className="text-slate-900 font-medium">{transformedAgent.informations.anciennete}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(transformedAgent.statut.status)}`}>
                  {transformedAgent.statut.status}
                </span>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${getPerformanceColor(displayStats.niveau)}`}>
                  {displayStats.niveau}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-lg font-bold text-slate-900 mb-3">Affectation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Commissariat</label>
                  <div className="text-slate-900 font-medium">{transformedAgent.affectation.commissariat}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Supérieur hiérarchique</label>
                  <div className="text-slate-900">{transformedAgent.affectation.superieur}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Équipe</label>
                  <div className="text-slate-900">{transformedAgent.affectation.equipe}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Zone d'intervention</label>
                  <div className="text-slate-900 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {transformedAgent.affectation.zone}
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Statut Actuel</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Localisation</label>
                <div className="text-slate-900 flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <span className="font-medium">{transformedAgent.statut.localisation}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Radio className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-slate-600">GPS: {transformedAgent.statut.gps}%</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <label className="text-sm font-medium text-slate-600">Activité en cours</label>
                <div className="text-slate-900 font-medium mt-1">{transformedAgent.statut.activite}</div>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <label className="text-sm font-medium text-slate-600">Temps de service</label>
                <div className="text-2xl font-bold text-blue-600 mt-1 flex items-center gap-2">
                  <Clock className="w-6 h-6" />
                  {transformedAgent.statut.tempsService}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <label className="text-sm font-medium text-slate-600 mb-2 block">Dernière activité</label>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-sm text-slate-900">{transformedAgent.statut.derniereActivite}</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Performance</p>
              <Award className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-green-600 mb-1">
              {displayStats.score.toFixed(1)}%
            </p>
            <p className="text-xs text-slate-500">Score global</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Contrôles</p>
              <CheckCircle className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {formatNumber(displayStats.controles)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {transformedStats ? 'Total carrière' : 'Période sélectionnée'}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Inspections</p>
              <Wrench className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {formatNumber(agentInspections.length)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Total inspections
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Infractions</p>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {formatNumber(displayStats.infractions)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Taux: {displayStats.tauxInfractions.toFixed(1)}%
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Revenus</p>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatNumber(displayStats.revenus)}
            </p>
            <p className="text-xs text-slate-500 mt-1">FCFA {transformedStats ? 'total' : 'période'}</p>
          </CardBody>
        </Card>
      </div>

      {/* Quick Links to Dedicated Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/missions">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Gestion des Missions</h3>
                    <p className="text-sm text-slate-600">Planifier, demarrer, terminer les missions</p>
                  </div>
                </div>
                <ArrowLeft className="w-5 h-5 text-slate-400 rotate-180" />
              </div>
            </CardBody>
          </Card>
        </Link>

        <Link href="/admin/competences">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-green-500">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Referentiel Competences</h3>
                    <p className="text-sm text-slate-600">Gerer et assigner les competences</p>
                  </div>
                </div>
                <ArrowLeft className="w-5 h-5 text-slate-400 rotate-180" />
              </div>
            </CardBody>
          </Card>
        </Link>
      </div>

      {/* Onglets */}
      <div className="mb-6">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'apercu', label: 'Apercu', icon: BarChart3 },
              { id: 'historique', label: 'Historique Controles', icon: FileText },
              { id: 'inspections', label: 'Historique Inspections', icon: Wrench }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'apercu' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Observations */}
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Observations</h3>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEditingObservation(undefined)
                      setShowObservationForm(true)
                    }}
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
                {transformedAgent.observations && transformedAgent.observations.length > 0 ? (
                  <div className="space-y-3">
                    {transformedAgent.observations.slice(0, 3).map((obs) => (
                      <div key={obs.id} className={`p-3 rounded-lg ${
                        obs.type === 'positif' ? 'bg-green-50 border-l-4 border-green-500' :
                        obs.type === 'negatif' ? 'bg-red-50 border-l-4 border-red-500' :
                        'bg-slate-50 border-l-4 border-blue-500'
                      }`}>
                        <p className="text-slate-700 text-sm">{obs.contenu}</p>
                        <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                          <span>{obs.categorie || obs.type}</span>
                          <span>{new Date(obs.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                        {obs.auteur && (
                          <p className="text-xs text-slate-400 mt-1">
                            Par: {obs.auteur.prenom} {obs.auteur.nom}
                          </p>
                        )}
                      </div>
                    ))}
                    {transformedAgent.observations.length > 3 && (
                      <p className="text-sm text-blue-600 text-center">
                        +{transformedAgent.observations.length - 3} autres observations
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-lg p-4 text-center">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">Aucune observation</p>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Statistiques */}
            <Card>
              <CardBody className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Statistiques {transformedStats ? 'Agent' : 'Période'}</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-900">Contrôles effectués</span>
                    <span className="text-2xl font-bold text-blue-600">{formatNumber(displayStats.controles)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium text-red-900">Infractions détectées</span>
                    <span className="text-2xl font-bold text-red-600">{formatNumber(displayStats.infractions)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-green-900">Revenus générés</span>
                    <span className="text-xl font-bold text-green-600">{formatNumber(displayStats.revenus)} FCFA</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Objectifs */}
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Objectifs</h3>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setEditingObjectif(undefined)
                    setShowObjectifForm(true)
                  }}
                >
                  <Target className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              {transformedAgent.objectifs && transformedAgent.objectifs.length > 0 ? (
                <div className="space-y-3">
                  {transformedAgent.objectifs.map((objectif) => (
                    <div key={objectif.id} className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-3">
                          <Target className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                            objectif.statut === 'atteint' ? 'text-green-600' :
                            objectif.statut === 'en_cours' ? 'text-blue-600' :
                            'text-slate-400'
                          }`} />
                          <div>
                            <h4 className="font-medium text-slate-900">{objectif.titre}</h4>
                            {objectif.description && (
                              <p className="text-sm text-slate-600 mt-1">{objectif.description}</p>
                            )}
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                          objectif.statut === 'atteint' ? 'bg-green-100 text-green-800' :
                          objectif.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                          objectif.statut === 'non_atteint' ? 'bg-red-100 text-red-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {objectif.statut?.replace('_', ' ')}
                        </span>
                      </div>
                      {/* Barre de progression */}
                      {objectif.valeurCible && objectif.valeurCible > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                            <span>Progression: {objectif.valeurActuelle}/{objectif.valeurCible}</span>
                            <span>{Math.round(objectif.progression)}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                objectif.progression >= 100 ? 'bg-green-500' :
                                objectif.progression >= 50 ? 'bg-blue-500' :
                                'bg-yellow-500'
                              }`}
                              style={{ width: `${Math.min(100, objectif.progression)}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>Période: {objectif.periode}</span>
                        <span>Fin: {new Date(objectif.dateFin).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Aucun objectif défini</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {activeTab === 'historique' && (
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Historique des Contrôles</h3>
              <Button variant="secondary" size="sm" onClick={fetchAgentControles} disabled={loadingControles}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loadingControles ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>
            {loadingControles ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : agentControles.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">N° Contrôle</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Date & Heure</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Type</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Lieu</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Véhicule</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Statut</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Montant PV</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {agentControles.map((controle) => {
                      const date = new Date(controle.date_controle)
                      const hasInfraction = controle.infractions && controle.infractions.length > 0
                      const montantTotal = controle.infractions?.reduce((sum, inf) => sum + (inf.montant_amende || 0), 0) || 0
                      return (
                        <tr key={controle.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-mono text-sm text-slate-900">{controle.reference}</td>
                          <td className="px-6 py-4 text-slate-900">
                            <div>{date.toLocaleDateString('fr-FR')}</div>
                            <div className="text-sm text-slate-500">{date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                              {controle.type_controle}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-900">{controle.lieu_controle}</td>
                          <td className="px-6 py-4 font-mono text-slate-900">
                            {controle.vehicule_immatriculation || '-'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              controle.statut === 'TERMINE'
                                ? hasInfraction ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                : controle.statut === 'EN_COURS'
                                ? 'bg-blue-100 text-blue-800'
                                : controle.statut === 'CONFORME'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {hasInfraction ? 'Infraction' : controle.statut === 'TERMINE' || controle.statut === 'CONFORME' ? 'Conforme' : controle.statut}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {montantTotal > 0 ? (
                              <span className="font-bold text-green-600">{formatNumber(montantTotal)} FCFA</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Button variant="primary" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Aucun contrôle enregistré pour cet agent</p>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {activeTab === 'inspections' && (
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Historique des Inspections</h3>
              <Button variant="secondary" size="sm" onClick={fetchAgentInspections} disabled={loadingInspections}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loadingInspections ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>
            {loadingInspections ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : agentInspections.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">N° Inspection</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Type</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Véhicule</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Propriétaire</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Statut</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Résultat</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {agentInspections.map((inspection) => {
                      const date = new Date(inspection.date_inspection)
                      // Determine result based on statut (CONFORME/NON_CONFORME are result states)
                      const resultat = inspection.statut === 'CONFORME' ? 'CONFORME' :
                                       inspection.statut === 'NON_CONFORME' ? 'NON_CONFORME' :
                                       inspection.statut === 'TERMINE' ? 'TERMINE' : null
                      return (
                        <tr key={inspection.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-mono text-sm text-slate-900">{inspection.numero}</td>
                          <td className="px-6 py-4 text-slate-900">
                            <div>{date.toLocaleDateString('fr-FR')}</div>
                            <div className="text-sm text-slate-500">{date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800">
                              {inspection.vehicule_type || 'TECHNIQUE'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-mono text-slate-900">{inspection.vehicule_immatriculation || '-'}</div>
                            {inspection.vehicule_marque && (
                              <div className="text-sm text-slate-500">{inspection.vehicule_marque} {inspection.vehicule_modele}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-900">
                            {inspection.conducteur_nom ? `${inspection.conducteur_prenom} ${inspection.conducteur_nom}` : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              inspection.statut === 'TERMINE' || inspection.statut === 'CONFORME' || inspection.statut === 'NON_CONFORME' ? 'bg-green-100 text-green-800' :
                              inspection.statut === 'EN_COURS' ? 'bg-blue-100 text-blue-800' :
                              inspection.statut === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {inspection.statut?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              resultat === 'CONFORME' ? 'bg-green-100 text-green-800' :
                              resultat === 'NON_CONFORME' ? 'bg-red-100 text-red-800' :
                              resultat === 'TERMINE' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {resultat?.replace('_', ' ') || 'En attente'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Link href={`/gestion/inspections/${inspection.id}`}>
                              <Button variant="primary" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Aucune inspection enregistrée pour cet agent</p>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Modals */}
      <ObjectifForm
        isOpen={showObjectifForm}
        onClose={() => {
          setShowObjectifForm(false)
          setEditingObjectif(undefined)
        }}
        onSuccess={fetchAgentData}
        agentId={agentId}
        objectif={editingObjectif}
      />

      <ObservationForm
        isOpen={showObservationForm}
        onClose={() => {
          setShowObservationForm(false)
          setEditingObservation(undefined)
        }}
        onSuccess={fetchAgentData}
        agentId={agentId}
        observation={editingObservation}
      />

    </div>
  )
}