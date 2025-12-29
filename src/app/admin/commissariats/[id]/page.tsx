'use client'

import React, { useState } from 'react'
import {
  ArrowLeft, Printer, Download, Edit, Calendar, MapPin, User, Users,
  Phone, Mail, AlertCircle, TrendingUp, TrendingDown, CheckCircle,
  XCircle, Clock, DollarSign, Shield, Eye, BarChart3, Activity,
  AlertTriangle, Award, FileText, Building, Bell, Radio, Siren,
  Search, FileDown
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'

type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'

type Agent = {
  id: string
  nom: string
  matricule: string
  grade: string
  statut: 'Actif' | 'Repos' | 'Mission'
  telephone: string
  email: string
  dateEntree: string
  specialites: string[]
  controles: number
  performance: number
}

type AlerteSecuritaire = {
  id: string
  type: 'Véhicule volé' | 'Avis de recherche' | 'Suspect dangereux' | 'Alerte Amber' | 'Autre urgence'
  titre: string
  description: string
  localisation: string
  dateHeure: string
  statut: 'En cours' | 'Résolu' | 'En attente'
  priorite: 'Basse' | 'Moyenne' | 'Haute' | 'Critique'
  agentResponsable?: string
  tempsReponse?: string
}

type Statistique = {
  mois: string
  controlesEffectues: number
  infractions: number
  amendes: number
  revenus: number
  tauxConformite: number
}

const commissariatBaseInfo = {
  id: 'COM-ABJ-003',
  nom: '3ème Arrondissement',
  localisation: 'Adjamé, Abidjan',
  adresse: 'Boulevard Nangui Abrogoua, Face Mairie Adjamé',
  telephone: '+225 21 37 45 67',
  email: 'com.adjame@police.ci',
  statut: 'ACTIF' as const,
  niveau: 'VERT' as const,
  
  responsable: {
    nom: 'Moussa DIABATE',
    titre: 'Commissaire Principal',
    matricule: 'CP-2018-0145',
    telephone: '+225 07 08 09 10 11',
    email: 'moussa.diabate@police.ci',
    dateNomination: '15/03/2020'
  },
  
  equipements: {
    vehicules: 8,
    etatVehicules: { bon: 5, moyen: 2, mauvais: 1 },
    radars: 4,
    alcootests: 12,
    tablettes: 45
  },
  
  agents: [
    {
      id: '1',
      nom: 'Aminata KONE',
      matricule: 'AGT-2019-0234',
      grade: 'Brigadier-Chef',
      statut: 'Actif' as const,
      telephone: '+225 07 12 34 56 78',
      email: 'aminata.kone@police.ci',
      dateEntree: '10/06/2019',
      specialites: ['Contrôle routier', 'Alcoolémie'],
      controles: 156,
      performance: 92.5
    },
    {
      id: '2',
      nom: 'Seydou TRAORE',
      matricule: 'AGT-2020-0467',
      grade: 'Brigadier',
      statut: 'Actif' as const,
      telephone: '+225 07 23 45 67 89',
      email: 'seydou.traore@police.ci',
      dateEntree: '15/09/2020',
      specialites: ['Contrôle technique', 'Documents'],
      controles: 142,
      performance: 88.3
    },
    {
      id: '3',
      nom: 'Fatou DIALLO',
      matricule: 'AGT-2018-0123',
      grade: 'Brigadier-Chef',
      statut: 'Mission' as const,
      telephone: '+225 07 34 56 78 90',
      email: 'fatou.diallo@police.ci',
      dateEntree: '05/03/2018',
      specialites: ['Formation', 'Supervision'],
      controles: 98,
      performance: 95.1
    }
  ]
}

const dataByPeriod = {
  jour: {
    effectifs: {
      agentsActifs: 38,
      agentsTotal: 45,
      agentsRepos: 5,
      agentsMission: 2,
      tauxActivite: 84
    },
    performance: {
      score: 94.2,
      controles: 47,
      evolutionControles: 12.5,
      revenus: '285K',
      evolutionRevenus: 15.3,
      conformite: 76.8,
      evolutionConformite: 3.5
    },
    statistiques: [
      { mois: "Aujourd'hui", controlesEffectues: 47, infractions: 11, amendes: 11, revenus: 285000, tauxConformite: 76.6 }
    ],
    alertes: [
      {
        id: 'ALT-001',
        type: 'Véhicule volé' as const,
        titre: 'Toyota Corolla blanche volée',
        description: 'Véhicule signalé volé ce matin dans le parking du centre commercial. Immatriculation EF-789-GH',
        localisation: 'Parking Adjamé Centre',
        dateHeure: '10/10/2025 08:15',
        statut: 'En cours' as const,
        priorite: 'Haute' as const,
        agentResponsable: 'Aminata KONE',
        tempsReponse: '5 min'
      },
      {
        id: 'ALT-002',
        type: 'Suspect dangereux' as const,
        titre: 'Individu armé signalé',
        description: 'Individu potentiellement armé aperçu près du marché. Approche avec prudence',
        localisation: 'Marché Adjamé',
        dateHeure: '10/10/2025 14:45',
        statut: 'En cours' as const,
        priorite: 'Critique' as const,
        agentResponsable: 'Fatou DIALLO',
        tempsReponse: '4 min'
      }
    ],
    observations: "Journée active avec bon taux de contrôles. Deux alertes en cours nécessitant une attention particulière.",
    objectifs: ['Atteindre 50 contrôles', 'Résoudre les alertes en cours', 'Maintenir taux conformité >75%'],
    defis: ['Gestion simultanée des alertes', 'Couverture zones sensibles']
  },
  semaine: {
    effectifs: {
      agentsActifs: 38,
      agentsTotal: 45,
      agentsRepos: 5,
      agentsMission: 2,
      tauxActivite: 84
    },
    performance: {
      score: 93.8,
      controles: 287,
      evolutionControles: 10.2,
      revenus: '1.8M',
      evolutionRevenus: 13.5,
      conformite: 76.5,
      evolutionConformite: 2.8
    },
    statistiques: [
      { mois: 'Lundi 07/10', controlesEffectues: 52, infractions: 12, amendes: 12, revenus: 360000, tauxConformite: 76.9 },
      { mois: 'Mardi 08/10', controlesEffectues: 48, infractions: 11, amendes: 11, revenus: 330000, tauxConformite: 77.1 },
      { mois: 'Mercredi 09/10', controlesEffectues: 56, infractions: 13, amendes: 13, revenus: 390000, tauxConformite: 76.8 },
      { mois: 'Jeudi 10/10', controlesEffectues: 47, infractions: 11, amendes: 11, revenus: 285000, tauxConformite: 76.6 }
    ],
    alertes: [
      {
        id: 'ALT-W01',
        type: 'Véhicule volé' as const,
        titre: 'Toyota Corolla blanche',
        description: 'Véhicule EF-789-GH signalé volé',
        localisation: 'Adjamé Centre',
        dateHeure: '10/10/2025 08:15',
        statut: 'En cours' as const,
        priorite: 'Haute' as const,
        agentResponsable: 'Aminata KONE',
        tempsReponse: '5 min'
      },
      {
        id: 'ALT-W02',
        type: 'Avis de recherche' as const,
        titre: 'Personne disparue - Mineur',
        description: 'Enfant de 12 ans disparu',
        localisation: 'Quartier Liberté',
        dateHeure: '09/10/2025 20:30',
        statut: 'En cours' as const,
        priorite: 'Critique' as const,
        agentResponsable: 'Seydou TRAORE',
        tempsReponse: '3 min'
      },
      {
        id: 'ALT-W03',
        type: 'Autre urgence' as const,
        titre: 'Accident grave',
        description: 'Accident avec blessés',
        localisation: 'Carrefour Liberté',
        dateHeure: '07/10/2025 11:30',
        statut: 'Résolu' as const,
        priorite: 'Haute' as const,
        agentResponsable: 'Seydou TRAORE',
        tempsReponse: '6 min'
      }
    ],
    observations: 'Semaine productive avec bonne progression. Alertes gérées efficacement.',
    objectifs: ['300 contrôles hebdomadaires', 'Temps réponse <10min', 'Formation continue agents'],
    defis: ['Maintien performance sur durée', 'Coordination inter-équipes']
  },
  mois: {
    effectifs: {
      agentsActifs: 38,
      agentsTotal: 45,
      agentsRepos: 5,
      agentsMission: 2,
      tauxActivite: 84
    },
    performance: {
      score: 94.2,
      controles: 1247,
      evolutionControles: 8.6,
      revenus: '8.7M',
      evolutionRevenus: 11.5,
      conformite: 76.8,
      evolutionConformite: 3.5
    },
    statistiques: [
      { mois: 'Semaine 1', controlesEffectues: 298, infractions: 69, amendes: 69, revenus: 2070000, tauxConformite: 76.8 },
      { mois: 'Semaine 2', controlesEffectues: 312, infractions: 72, amendes: 72, revenus: 2160000, tauxConformite: 76.9 },
      { mois: 'Semaine 3', controlesEffectues: 324, infractions: 75, amendes: 75, revenus: 2250000, tauxConformite: 76.9 },
      { mois: 'Semaine 4', controlesEffectues: 313, infractions: 73, amendes: 73, revenus: 2220000, tauxConformite: 76.7 }
    ],
    alertes: [
      {
        id: 'ALT-M01',
        type: 'Véhicule volé' as const,
        titre: 'Toyota Corolla blanche',
        description: 'EF-789-GH volé',
        localisation: 'Adjamé',
        dateHeure: '10/10/2025 08:15',
        statut: 'En cours' as const,
        priorite: 'Haute' as const,
        agentResponsable: 'Aminata KONE',
        tempsReponse: '5 min'
      },
      {
        id: 'ALT-M02',
        type: 'Avis de recherche' as const,
        titre: 'Personne disparue',
        description: 'Mineur 12 ans',
        localisation: 'Liberté',
        dateHeure: '09/10/2025 20:30',
        statut: 'En cours' as const,
        priorite: 'Critique' as const,
        agentResponsable: 'Seydou TRAORE',
        tempsReponse: '3 min'
      },
      {
        id: 'ALT-M03',
        type: 'Suspect dangereux' as const,
        titre: 'Individu armé',
        description: 'Approche prudente',
        localisation: 'Marché',
        dateHeure: '10/10/2025 14:45',
        statut: 'En cours' as const,
        priorite: 'Critique' as const,
        agentResponsable: 'Fatou DIALLO',
        tempsReponse: '4 min'
      },
      {
        id: 'ALT-M04',
        type: 'Alerte Amber' as const,
        titre: 'Enlèvement enfant',
        description: 'Véhicule identifié',
        localisation: 'Boulevard Nangui',
        dateHeure: '05/10/2025 16:20',
        statut: 'Résolu' as const,
        priorite: 'Critique' as const,
        agentResponsable: 'Aminata KONE',
        tempsReponse: '2 min'
      }
    ],
    observations: 'Commissariat performant avec équipe dynamique. Bon taux de conformité et progression constante.',
    objectifs: ['Maintenir conformité >75%', 'Augmenter contrôles 10%', 'Former 5 nouveaux agents', 'Améliorer temps réponse 15%'],
    defis: ['Vieillissement véhicules', 'Besoin 3 agents supplémentaires', 'Modernisation informatique']
  },
  annee: {
    effectifs: {
      agentsActifs: 38,
      agentsTotal: 45,
      agentsRepos: 5,
      agentsMission: 2,
      tauxActivite: 84
    },
    performance: {
      score: 93.7,
      controles: 14567,
      evolutionControles: 15.8,
      revenus: '102.5M',
      evolutionRevenus: 18.2,
      conformite: 76.3,
      evolutionConformite: 4.2
    },
    statistiques: [
      { mois: 'Septembre', controlesEffectues: 1247, infractions: 289, amendes: 289, revenus: 8700000, tauxConformite: 76.8 },
      { mois: 'Août', controlesEffectues: 1148, infractions: 267, amendes: 267, revenus: 7800000, tauxConformite: 76.7 },
      { mois: 'Juillet', controlesEffectues: 1089, infractions: 245, amendes: 245, revenus: 7200000, tauxConformite: 77.5 },
      { mois: 'Juin', controlesEffectues: 1156, infractions: 278, amendes: 278, revenus: 8100000, tauxConformite: 76.0 },
      { mois: 'Mai', controlesEffectues: 1234, infractions: 287, amendes: 287, revenus: 8610000, tauxConformite: 76.8 },
      { mois: 'Avril', controlesEffectues: 1198, infractions: 279, amendes: 279, revenus: 8370000, tauxConformite: 76.7 }
    ],
    alertes: [
      {
        id: 'ALT-Y01',
        type: 'Véhicule volé' as const,
        titre: '23 véhicules volés cette année',
        description: 'Statistiques annuelles',
        localisation: 'Zone Adjamé',
        dateHeure: '2025',
        statut: 'En cours' as const,
        priorite: 'Haute' as const,
        agentResponsable: 'Équipe surveillance',
        tempsReponse: 'Variable'
      },
      {
        id: 'ALT-Y02',
        type: 'Avis de recherche' as const,
        titre: '45 personnes recherchées',
        description: 'Base annuelle',
        localisation: 'Secteur',
        dateHeure: '2025',
        statut: 'En cours' as const,
        priorite: 'Moyenne' as const,
        agentResponsable: 'Multiple agents',
        tempsReponse: 'Variable'
      }
    ],
    observations: 'Année exceptionnelle avec forte croissance des indicateurs. Performance nationale reconnue.',
    objectifs: ['Excellence opérationnelle continue', 'Leadership régional', 'Innovation procédures', 'Extension capacités'],
    defis: ['Expansion équipe', 'Renouvellement flotte véhicules', 'Infrastructure moderne']
  },
  tout: {
    effectifs: {
      agentsActifs: 38,
      agentsTotal: 45,
      agentsRepos: 5,
      agentsMission: 2,
      tauxActivite: 84
    },
    performance: {
      score: 94.5,
      controles: 72456,
      evolutionControles: 22.5,
      revenus: '523.8M',
      evolutionRevenus: 25.8,
      conformite: 76.5,
      evolutionConformite: 5.8
    },
    statistiques: [
      { mois: '2025', controlesEffectues: 14567, infractions: 3389, amendes: 3389, revenus: 102500000, tauxConformite: 76.7 },
      { mois: '2024', controlesEffectues: 13845, infractions: 3221, amendes: 3221, revenus: 96630000, tauxConformite: 76.7 },
      { mois: '2023', controlesEffectues: 12934, infractions: 3012, amendes: 3012, revenus: 90360000, tauxConformite: 76.7 },
      { mois: '2022', controlesEffectues: 11678, infractions: 2718, amendes: 2718, revenus: 81540000, tauxConformite: 76.7 },
      { mois: '2021', controlesEffectues: 10234, infractions: 2382, amendes: 2382, revenus: 71460000, tauxConformite: 76.7 },
      { mois: '2020', controlesEffectues: 9198, infractions: 2141, amendes: 2141, revenus: 64230000, tauxConformite: 76.7 }
    ],
    alertes: [
      {
        id: 'ALT-ALL01',
        type: 'Véhicule volé' as const,
        titre: 'Base historique complète',
        description: 'Archives nationales',
        localisation: 'Adjamé',
        dateHeure: 'Historique',
        statut: 'En cours' as const,
        priorite: 'Moyenne' as const,
        agentResponsable: 'Système central',
        tempsReponse: 'N/A'
      }
    ],
    observations: 'Commissariat d\'excellence avec historique exceptionnel. Référence nationale pour performance et innovation.',
    objectifs: ['Maintien excellence', 'Centre formation régional', 'Innovation technologies', 'Expansion nationale'],
    defis: ['Infrastructure 21ème siècle', 'Capacité doublée', 'Leadership continental']
  },
  personnalise: {
    effectifs: {
      agentsActifs: 38,
      agentsTotal: 45,
      agentsRepos: 5,
      agentsMission: 2,
      tauxActivite: 84
    },
    performance: {
      score: 92.5,
      controles: 658,
      evolutionControles: 7.5,
      revenus: '4.6M',
      evolutionRevenus: 9.2,
      conformite: 76.2,
      evolutionConformite: 2.1
    },
    statistiques: [
      { mois: 'Période filtrée', controlesEffectues: 658, infractions: 153, amendes: 153, revenus: 4600000, tauxConformite: 76.7 }
    ],
    alertes: [
      {
        id: 'ALT-C01',
        type: 'Autre urgence' as const,
        titre: 'Données période personnalisée',
        description: 'Filtrage actif',
        localisation: 'Voir filtres',
        dateHeure: 'Dates sélectionnées',
        statut: 'En cours' as const,
        priorite: 'Moyenne' as const,
        agentResponsable: 'Analyse en cours',
        tempsReponse: 'Variable'
      }
    ],
    observations: 'Données pour la période sélectionnée. Analyse personnalisée en cours.',
    objectifs: ['Analyse période ciblée', 'Évaluation spécifique', 'Rapport personnalisé'],
    defis: ['Affiner critères recherche', 'Optimiser analyses']
  }
}

export default function CommissariatDetailPage() {
  const [activeTab, setActiveTab] = useState('apercu')
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('tout')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)

  const currentData = isCustomDateRange ? dataByPeriod.personnalise : dataByPeriod[globalFilter]

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

  const getNiveauColor = (niveau: string) => {
    switch (niveau) {
      case 'VERT': return 'bg-green-500 text-white'
      case 'ORANGE': return 'bg-orange-500 text-white'
      case 'ROUGE': return 'bg-red-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatutColor = (statut: string) => {
    return statut === 'ACTIF' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getAgentStatutColor = (statut: string) => {
    switch (statut) {
      case 'Actif': return 'bg-green-100 text-green-800'
      case 'Repos': return 'bg-blue-100 text-blue-800'
      case 'Mission': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAlertePrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'Critique': return 'bg-red-500 text-white'
      case 'Haute': return 'bg-orange-500 text-white'
      case 'Moyenne': return 'bg-yellow-500 text-white'
      case 'Basse': return 'bg-blue-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getAlerteStatutColor = (statut: string) => {
    switch (statut) {
      case 'En cours': return 'bg-red-100 text-red-800 border-red-200'
      case 'Résolu': return 'bg-green-100 text-green-800 border-green-200'
      case 'En attente': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getAlerteTypeIcon = (type: string) => {
    switch (type) {
      case 'Véhicule volé': return <Shield className="w-5 h-5" />
      case 'Avis de recherche': return <Users className="w-5 h-5" />
      case 'Suspect dangereux': return <AlertTriangle className="w-5 h-5" />
      case 'Alerte Amber': return <Bell className="w-5 h-5" />
      case 'Autre urgence': return <Siren className="w-5 h-5" />
      default: return <AlertCircle className="w-5 h-5" />
    }
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
              Commissariat {commissariatBaseInfo.nom}
            </h1>
            <p className="text-slate-600 mt-1">
              {commissariatBaseInfo.id} • {commissariatBaseInfo.localisation}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
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
                  <p className="text-gray-600 text-xs md:text-sm hidden sm:block">Filtrer les statistiques et les alertes</p>
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
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Informations Générales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Adresse</label>
                    <div className="text-slate-900 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                      <span>{commissariatBaseInfo.adresse}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Contact</label>
                    <div className="space-y-1">
                      <div className="text-slate-900 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        {commissariatBaseInfo.telephone}
                      </div>
                      <div className="text-slate-900 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {commissariatBaseInfo.email}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Responsable</label>
                    <div className="text-slate-900 font-medium">
                      {commissariatBaseInfo.responsable.titre}
                    </div>
                    <div className="text-slate-900">{commissariatBaseInfo.responsable.nom}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Date de nomination</label>
                    <div className="text-slate-900 flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {commissariatBaseInfo.responsable.dateNomination}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatutColor(commissariatBaseInfo.statut)}`}>
                  {commissariatBaseInfo.statut}
                </span>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${getNiveauColor(commissariatBaseInfo.niveau)}`}>
                  NIVEAU {commissariatBaseInfo.niveau}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Performance Globale</h3>
            <div className="text-center mb-4">
              <div className="text-5xl font-bold text-green-600 mb-2">
                {currentData.performance.score}%
              </div>
              <div className="text-sm text-slate-500">Score de performance</div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Taux d'activité</span>
                <span className="font-bold text-slate-900">{currentData.effectifs.tauxActivite}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Agents actifs</span>
                <span className="font-bold text-slate-900">
                  {currentData.effectifs.agentsActifs}/{currentData.effectifs.agentsTotal}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Contrôles période</span>
                <span className="font-bold text-slate-900">{formatNumber(currentData.performance.controles)}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Contrôles</p>
                <p className="text-3xl font-bold text-slate-900">
                  {formatNumber(currentData.performance.controles)}
                </p>
              </div>
              <div className="text-right">
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  currentData.performance.evolutionControles > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {currentData.performance.evolutionControles > 0 ? 
                    <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
                  }
                  {Math.abs(currentData.performance.evolutionControles)}%
                </div>
                <p className="text-xs text-slate-500">vs précédent</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Revenus</p>
                <p className="text-3xl font-bold text-green-600">
                  {currentData.performance.revenus}
                </p>
                <p className="text-xs text-slate-500">FCFA</p>
              </div>
              <div className="text-right">
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  currentData.performance.evolutionRevenus > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {currentData.performance.evolutionRevenus > 0 ? 
                    <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
                  }
                  {Math.abs(currentData.performance.evolutionRevenus)}%
                </div>
                <p className="text-xs text-slate-500">vs précédent</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Conformité</p>
                <p className="text-3xl font-bold text-blue-600">
                  {currentData.performance.conformite}%
                </p>
              </div>
              <div className="text-right">
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  currentData.performance.evolutionConformite > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {currentData.performance.evolutionConformite > 0 ? 
                    <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
                  }
                  {Math.abs(currentData.performance.evolutionConformite)}%
                </div>
                <p className="text-xs text-slate-500">vs précédent</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Onglets */}
      <div className="mb-6">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'apercu', label: 'Aperçu', icon: BarChart3 },
              { id: 'alertes', label: 'Alertes', icon: Bell },
              { id: 'agents', label: 'Agents', icon: Users },
              { id: 'equipements', label: 'Équipements', icon: Building },
              { id: 'statistiques', label: 'Statistiques', icon: Activity }
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
                {tab.id === 'alertes' && currentData.alertes.filter(a => a.statut === 'En cours').length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {currentData.alertes.filter(a => a.statut === 'En cours').length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'apercu' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardBody className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Observations</h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-700">{currentData.observations}</p>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Répartition des effectifs</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-green-900">Agents actifs</span>
                    <span className="text-2xl font-bold text-green-600">{currentData.effectifs.agentsActifs}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-900">En repos</span>
                    <span className="text-2xl font-bold text-blue-600">{currentData.effectifs.agentsRepos}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-purple-900">En mission</span>
                    <span className="text-2xl font-bold text-purple-600">{currentData.effectifs.agentsMission}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Objectifs</h3>
              <ul className="space-y-3">
                {currentData.objectifs.map((objectif, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{objectif}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Défis à relever</h3>
              <ul className="space-y-3">
                {currentData.defis.map((defi, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{defi}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      )}

      {activeTab === 'alertes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Alertes Sécuritaires - Période: {globalFilter}</h3>
              <p className="text-sm text-slate-600">
                {currentData.alertes.filter(a => a.statut === 'En cours').length} alerte(s) en cours
              </p>
            </div>
            <Button variant="danger" size="md">
              <Bell className="w-5 h-5" />
              Nouvelle Alerte
            </Button>
          </div>

          {currentData.alertes.map((alerte) => (
            <Card key={alerte.id} className={alerte.statut === 'En cours' ? 'border-l-4 border-l-red-500' : ''}>
              <CardBody className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${
                      alerte.priorite === 'Critique' ? 'bg-red-100' :
                      alerte.priorite === 'Haute' ? 'bg-orange-100' :
                      alerte.priorite === 'Moyenne' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}>
                      {getAlerteTypeIcon(alerte.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-lg text-slate-900">{alerte.titre}</h4>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${getAlertePrioriteColor(alerte.priorite)}`}>
                          {alerte.priorite}
                        </span>
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-3">{alerte.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <label className="text-xs font-medium text-slate-500">Type d'alerte</label>
                          <div className="text-sm font-medium text-slate-900">{alerte.type}</div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500">Localisation</label>
                          <div className="text-sm font-medium text-slate-900 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {alerte.localisation}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500">Date & Heure</label>
                          <div className="text-sm font-medium text-slate-900 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {alerte.dateHeure}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        {alerte.agentResponsable && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">Agent: </span>
                            <span className="font-medium text-slate-900">{alerte.agentResponsable}</span>
                          </div>
                        )}
                        {alerte.tempsReponse && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">Temps: </span>
                            <span className="font-medium text-green-600">{alerte.tempsReponse}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getAlerteStatutColor(alerte.statut)}`}>
                      {alerte.statut}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'agents' && (
        <div className="space-y-4">
          {commissariatBaseInfo.agents.map((agent) => (
            <Card key={agent.id}>
              <CardBody className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-bold text-lg text-slate-900 mb-1">{agent.nom}</h4>
                      <p className="text-sm text-slate-600 mb-2">{agent.grade}</p>
                      <p className="text-xs text-slate-500 font-mono">{agent.matricule}</p>
                      <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full mt-2 ${getAgentStatutColor(agent.statut)}`}>
                        {agent.statut}
                      </span>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-600">Contact</label>
                      <div className="space-y-1 mt-1">
                        <div className="flex items-center gap-2 text-sm text-slate-900">
                          <Phone className="w-4 h-4 text-slate-400" />
                          {agent.telephone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-900">
                          <Mail className="w-4 h-4 text-slate-400" />
                          {agent.email}
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-slate-500">Entrée: {agent.dateEntree}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-600 mb-2 block">Spécialités</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {agent.specialites.map((spec, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {spec}
                          </span>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div>
                          <p className="text-xs text-slate-500">Contrôles</p>
                          <p className="text-xl font-bold text-slate-900">{agent.controles}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Performance</p>
                          <p className="text-xl font-bold text-green-600">{agent.performance}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'equipements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Véhicules</h3>
                  <p className="text-2xl font-bold text-blue-600">{commissariatBaseInfo.equipements.vehicules}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Bon état</span>
                  <span className="font-medium text-green-600">{commissariatBaseInfo.equipements.etatVehicules.bon}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">État moyen</span>
                  <span className="font-medium text-orange-600">{commissariatBaseInfo.equipements.etatVehicules.moyen}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Mauvais état</span>
                  <span className="font-medium text-red-600">{commissariatBaseInfo.equipements.etatVehicules.mauvais}</span>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Radio className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Radars</h3>
                  <p className="text-2xl font-bold text-purple-600">{commissariatBaseInfo.equipements.radars}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600">Radars mobiles opérationnels</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Alcootests</h3>
                  <p className="text-2xl font-bold text-red-600">{commissariatBaseInfo.equipements.alcootests}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600">Éthylotests disponibles</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Tablettes</h3>
                  <p className="text-2xl font-bold text-green-600">{commissariatBaseInfo.equipements.tablettes}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600">Tablettes numériques pour PV</p>
            </CardBody>
          </Card>
        </div>
      )}

      {activeTab === 'statistiques' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Statistiques - Période: {globalFilter}</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Période</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Contrôles</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Infractions</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Amendes</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Revenus</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Conformité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentData.statistiques.map((stat, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{stat.mois}</td>
                      <td className="px-6 py-4 text-slate-900">{formatNumber(stat.controlesEffectues)}</td>
                      <td className="px-6 py-4 text-slate-900">{formatNumber(stat.infractions)}</td>
                      <td className="px-6 py-4 text-slate-900">{formatNumber(stat.amendes)}</td>
                      <td className="px-6 py-4 font-bold text-green-600">{formatNumber(stat.revenus)} FCFA</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-blue-600">{stat.tauxConformite}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}