'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Users, MapPin, Phone, Clock, TrendingUp, AlertTriangle, CheckCircle,
  Radio, Navigation, Target, Award, Shield, Eye, MessageSquare, Plus,
  RefreshCw, Download, Filter, Search, Zap, UserPlus, Bell, Calendar,
  Printer, FileDown
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'
import { adminService, type AgentDashboardResponse, type AgentDetailedResponse } from '@/lib/api/services'
import { AgentForm } from '@/components/forms'

type AgentStatus = 'EN SERVICE' | 'EN PAUSE' | 'HORS SERVICE'
type AgentGrade = 'Sergent' | 'Adjudant' | 'Brigadier' | 'Gardien' | string
type Performance = 'Excellente' | 'Correcte' | 'Critique'
type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'

type Agent = {
  id: string
  nom: string
  grade: AgentGrade
  commissariat: string
  status: AgentStatus
  localisation: string
  activite: string
  controles: number
  infractions: number
  revenus: number
  tauxInfractions: number
  tempsService: string
  gps: number
  derniereActivite: string
  performance: Performance
}

export default function AgentsManagementPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tous')
  const [commissariatFilter, setCommissariatFilter] = useState('Tous')
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('jour')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<AgentDashboardResponse | null>(null)
  const [commissariatsFromApi, setCommissariatsFromApi] = useState<string[]>([])
  const [showAgentForm, setShowAgentForm] = useState(false)

  // Fetch dashboard data from API
  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await adminService.getAgentsDashboard(
        globalFilter,
        isCustomDateRange ? dateDebut : undefined,
        isCustomDateRange ? dateFin : undefined
      )
      if (response.success && response.data) {
        setDashboardData(response.data)
        // Extract unique commissariats from agents
        const uniqueCommissariats = [...new Set(response.data.agents.map(a => a.commissariat).filter(Boolean))]
        setCommissariatsFromApi(uniqueCommissariats)
      } else {
        setError('Erreur lors du chargement des données')
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err)
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }, [globalFilter, isCustomDateRange, dateDebut, dateFin])

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Données par période
  const dataByPeriod = {
    jour: {
      agents: [
        {
          id: 'CI-PN-001245',
          nom: 'KOUASSI Jean',
          grade: 'Sergent' as AgentGrade,
          commissariat: '3ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Boulevard Principal',
          activite: 'Patrouille mobile',
          controles: 8,
          infractions: 3,
          revenus: 85000,
          tauxInfractions: 37.5,
          tempsService: '2h15',
          gps: 98,
          derniereActivite: 'Contrôle AB-123-CD (il y a 2min)',
          performance: 'Excellente' as Performance
        },
        {
          id: 'CI-PN-001298',
          nom: 'KONE Aya',
          grade: 'Adjudant' as AgentGrade,
          commissariat: '5ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Avenue Centrale',
          activite: 'Contrôle fixe',
          controles: 12,
          infractions: 2,
          revenus: 70000,
          tauxInfractions: 16.7,
          tempsService: '3h45',
          gps: 100,
          derniereActivite: 'Infraction EF-789-GH (il y a 5min)',
          performance: 'Excellente' as Performance
        },
        {
          id: 'CI-PN-001156',
          nom: 'YAO Kofi',
          grade: 'Brigadier' as AgentGrade,
          commissariat: '7ème Arrondissement',
          status: 'EN PAUSE' as AgentStatus,
          localisation: 'Zone Industrielle',
          activite: 'Pause déjeuner',
          controles: 6,
          infractions: 1,
          revenus: 25000,
          tauxInfractions: 16.7,
          tempsService: '2h30',
          gps: 95,
          derniereActivite: 'Débutée à 13h15 • Fin prévue: 14h00 (dans 45min)',
          performance: 'Correcte' as Performance
        },
        {
          id: 'CI-PN-001087',
          nom: 'TRAORE Sekou',
          grade: 'Gardien' as AgentGrade,
          commissariat: '10ème Arrondissement',
          status: 'HORS SERVICE' as AgentStatus,
          localisation: 'Position inconnue',
          activite: 'Non joignable',
          controles: 0,
          infractions: 0,
          revenus: 0,
          tauxInfractions: 0,
          tempsService: '45min',
          gps: 0,
          derniereActivite: 'Plus de contact depuis 45min • Dernière position: Boulevard Lagunaire',
          performance: 'Critique' as Performance
        },
        {
          id: 'CI-PN-001423',
          nom: 'DIABATE Moussa',
          grade: 'Sergent' as AgentGrade,
          commissariat: '3ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Adjamé Marché',
          activite: 'Investigation',
          controles: 5,
          infractions: 4,
          revenus: 120000,
          tauxInfractions: 80,
          tempsService: '1h30',
          gps: 100,
          derniereActivite: 'Véhicule suspect MN-456-PQ (il y a 8min)',
          performance: 'Excellente' as Performance
        },
        {
          id: 'CI-PN-001567',
          nom: 'ASSANE Fatou',
          grade: 'Adjudant' as AgentGrade,
          commissariat: '15ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Yopougon Zone 4',
          activite: 'Patrouille mobile',
          controles: 9,
          infractions: 2,
          revenus: 55000,
          tauxInfractions: 22.2,
          tempsService: '4h00',
          gps: 99,
          derniereActivite: 'Rapport envoyé (il y a 12min)',
          performance: 'Excellente' as Performance
        }
      ],
      stats: {
        enService: 5,
        effectifTotal: 6,
        enPause: 1,
        horsService: 1,
        performanceMoyenne: 6.7,
        topPerformers: 4
      }
    },
    semaine: {
      agents: [
        {
          id: 'CI-PN-001245',
          nom: 'KOUASSI Jean',
          grade: 'Sergent' as AgentGrade,
          commissariat: '3ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Boulevard Principal',
          activite: 'Patrouille mobile',
          controles: 52,
          infractions: 18,
          revenus: 485000,
          tauxInfractions: 34.6,
          tempsService: '38h45',
          gps: 98,
          derniereActivite: 'Contrôle en cours',
          performance: 'Excellente' as Performance
        },
        {
          id: 'CI-PN-001298',
          nom: 'KONE Aya',
          grade: 'Adjudant' as AgentGrade,
          commissariat: '5ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Avenue Centrale',
          activite: 'Contrôle fixe',
          controles: 67,
          infractions: 15,
          revenus: 425000,
          tauxInfractions: 22.4,
          tempsService: '42h00',
          gps: 100,
          derniereActivite: 'Rapport hebdomadaire complété',
          performance: 'Excellente' as Performance
        },
        {
          id: 'CI-PN-001156',
          nom: 'YAO Kofi',
          grade: 'Brigadier' as AgentGrade,
          commissariat: '7ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Zone Industrielle',
          activite: 'Patrouille',
          controles: 38,
          infractions: 8,
          revenus: 195000,
          tauxInfractions: 21.1,
          tempsService: '35h15',
          gps: 95,
          derniereActivite: 'Service normal',
          performance: 'Correcte' as Performance
        },
        {
          id: 'CI-PN-001087',
          nom: 'TRAORE Sekou',
          grade: 'Gardien' as AgentGrade,
          commissariat: '10ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Boulevard Lagunaire',
          activite: 'Contrôle fixe',
          controles: 28,
          infractions: 5,
          revenus: 125000,
          tauxInfractions: 17.9,
          tempsService: '32h00',
          gps: 92,
          derniereActivite: 'En poste',
          performance: 'Correcte' as Performance
        },
        {
          id: 'CI-PN-001423',
          nom: 'DIABATE Moussa',
          grade: 'Sergent' as AgentGrade,
          commissariat: '3ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Adjamé Marché',
          activite: 'Investigation',
          controles: 45,
          infractions: 24,
          revenus: 680000,
          tauxInfractions: 53.3,
          tempsService: '40h30',
          gps: 100,
          derniereActivite: 'Mission spéciale en cours',
          performance: 'Excellente' as Performance
        },
        {
          id: 'CI-PN-001567',
          nom: 'ASSANE Fatou',
          grade: 'Adjudant' as AgentGrade,
          commissariat: '15ème Arrondissement',
          status: 'EN PAUSE' as AgentStatus,
          localisation: 'Yopougon Zone 4',
          activite: 'Repos hebdomadaire',
          controles: 56,
          infractions: 12,
          revenus: 345000,
          tauxInfractions: 21.4,
          tempsService: '39h20',
          gps: 99,
          derniereActivite: 'Pause planifiée',
          performance: 'Excellente' as Performance
        }
      ],
      stats: {
        enService: 5,
        effectifTotal: 6,
        enPause: 1,
        horsService: 0,
        performanceMoyenne: 47.7,
        topPerformers: 4
      }
    },
    mois: {
      agents: [
        {
          id: 'CI-PN-001245',
          nom: 'KOUASSI Jean',
          grade: 'Sergent' as AgentGrade,
          commissariat: '3ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Boulevard Principal',
          activite: 'Patrouille mobile',
          controles: 218,
          infractions: 76,
          revenus: 2150000,
          tauxInfractions: 34.9,
          tempsService: '168h',
          gps: 98,
          derniereActivite: 'Performance mensuelle excellente',
          performance: 'Excellente' as Performance
        },
        {
          id: 'CI-PN-001298',
          nom: 'KONE Aya',
          grade: 'Adjudant' as AgentGrade,
          commissariat: '5ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Avenue Centrale',
          activite: 'Contrôle fixe',
          controles: 285,
          infractions: 62,
          revenus: 1875000,
          tauxInfractions: 21.8,
          tempsService: '172h',
          gps: 100,
          derniereActivite: 'Agent du mois - Septembre',
          performance: 'Excellente' as Performance
        },
        {
          id: 'CI-PN-001156',
          nom: 'YAO Kofi',
          grade: 'Brigadier' as AgentGrade,
          commissariat: '7ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Zone Industrielle',
          activite: 'Patrouille',
          controles: 167,
          infractions: 34,
          revenus: 845000,
          tauxInfractions: 20.4,
          tempsService: '165h',
          gps: 95,
          derniereActivite: 'Performance stable',
          performance: 'Correcte' as Performance
        },
        {
          id: 'CI-PN-001087',
          nom: 'TRAORE Sekou',
          grade: 'Gardien' as AgentGrade,
          commissariat: '10ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Boulevard Lagunaire',
          activite: 'Contrôle fixe',
          controles: 142,
          infractions: 28,
          revenus: 695000,
          tauxInfractions: 19.7,
          tempsService: '160h',
          gps: 92,
          derniereActivite: 'Besoin de formation continue',
          performance: 'Correcte' as Performance
        },
        {
          id: 'CI-PN-001423',
          nom: 'DIABATE Moussa',
          grade: 'Sergent' as AgentGrade,
          commissariat: '3ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Adjamé Marché',
          activite: 'Investigation',
          controles: 195,
          infractions: 98,
          revenus: 2850000,
          tauxInfractions: 50.3,
          tempsService: '170h',
          gps: 100,
          derniereActivite: 'Spécialiste infractions majeures',
          performance: 'Excellente' as Performance
        },
        {
          id: 'CI-PN-001567',
          nom: 'ASSANE Fatou',
          grade: 'Adjudant' as AgentGrade,
          commissariat: '15ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Yopougon Zone 4',
          activite: 'Patrouille mobile',
          controles: 234,
          infractions: 52,
          revenus: 1520000,
          tauxInfractions: 22.2,
          tempsService: '168h',
          gps: 99,
          derniereActivite: 'Promotion en cours d\'évaluation',
          performance: 'Excellente' as Performance
        }
      ],
      stats: {
        enService: 6,
        effectifTotal: 6,
        enPause: 0,
        horsService: 0,
        performanceMoyenne: 206.8,
        topPerformers: 4
      }
    },
    annee: {
      agents: [
        {
          id: 'CI-PN-001245',
          nom: 'KOUASSI Jean',
          grade: 'Sergent' as AgentGrade,
          commissariat: '3ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Boulevard Principal',
          activite: 'Patrouille mobile',
          controles: 2456,
          infractions: 852,
          revenus: 24500000,
          tauxInfractions: 34.7,
          tempsService: '1950h',
          gps: 98,
          derniereActivite: 'Agent étoile 2025',
          performance: 'Excellente' as Performance
        },
        {
          id: 'CI-PN-001298',
          nom: 'KONE Aya',
          grade: 'Adjudant' as AgentGrade,
          commissariat: '5ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Avenue Centrale',
          activite: 'Contrôle fixe',
          controles: 3124,
          infractions: 678,
          revenus: 21200000,
          tauxInfractions: 21.7,
          tempsService: '2040h',
          gps: 100,
          derniereActivite: 'Promotion Commissaire en cours',
          performance: 'Excellente' as Performance
        },
        {
          id: 'CI-PN-001156',
          nom: 'YAO Kofi',
          grade: 'Brigadier' as AgentGrade,
          commissariat: '7ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Zone Industrielle',
          activite: 'Patrouille',
          controles: 1876,
          infractions: 387,
          revenus: 9850000,
          tauxInfractions: 20.6,
          tempsService: '1920h',
          gps: 95,
          derniereActivite: 'Performance constante',
          performance: 'Correcte' as Performance
        },
        {
          id: 'CI-PN-001087',
          nom: 'TRAORE Sekou',
          grade: 'Gardien' as AgentGrade,
          commissariat: '10ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Boulevard Lagunaire',
          activite: 'Contrôle fixe',
          controles: 1645,
          infractions: 312,
          revenus: 7890000,
          tauxInfractions: 19.0,
          tempsService: '1880h',
          gps: 92,
          derniereActivite: 'Formation continue complétée',
          performance: 'Correcte' as Performance
        },
        {
          id: 'CI-PN-001423',
          nom: 'DIABATE Moussa',
          grade: 'Sergent' as AgentGrade,
          commissariat: '3ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Adjamé Marché',
          activite: 'Investigation',
          controles: 2234,
          infractions: 1123,
          revenus: 32400000,
          tauxInfractions: 50.3,
          tempsService: '2010h',
          gps: 100,
          derniereActivite: 'Médaille du mérite 2025',
          performance: 'Excellente' as Performance
        },
        {
          id: 'CI-PN-001567',
          nom: 'ASSANE Fatou',
          grade: 'Adjudant' as AgentGrade,
          commissariat: '15ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Yopougon Zone 4',
          activite: 'Patrouille mobile',
          controles: 2678,
          infractions: 589,
          revenus: 17600000,
          tauxInfractions: 22.0,
          tempsService: '1980h',
          gps: 99,
          derniereActivite: 'Excellence opérationnelle',
          performance: 'Excellente' as Performance
        }
      ],
      stats: {
        enService: 6,
        effectifTotal: 6,
        enPause: 0,
        horsService: 0,
        performanceMoyenne: 2335.5,
        topPerformers: 4
      }
    },
    tout: {
      agents: [
        {
          id: 'CI-PN-001245',
          nom: 'KOUASSI Jean',
          grade: 'Sergent' as AgentGrade,
          commissariat: '3ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Boulevard Principal',
          activite: 'Patrouille mobile',
          controles: 12456,
          infractions: 4287,
          revenus: 125000000,
          tauxInfractions: 34.4,
          tempsService: '9850h',
          gps: 98,
          derniereActivite: 'Carrière exemplaire - 5 ans de service',
          performance: 'Excellente' as Performance
        },
        {
          id: 'CI-PN-001298',
          nom: 'KONE Aya',
          grade: 'Adjudant' as AgentGrade,
          commissariat: '5ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Avenue Centrale',
          activite: 'Contrôle fixe',
          controles: 15678,
          infractions: 3456,
          revenus: 108000000,
          tauxInfractions: 22.0,
          tempsService: '10200h',
          gps: 100,
          derniereActivite: 'Légende vivante du corps',
          performance: 'Excellente' as Performance
        },
        {
          id: 'CI-PN-001156',
          nom: 'YAO Kofi',
          grade: 'Brigadier' as AgentGrade,
          commissariat: '7ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Zone Industrielle',
          activite: 'Patrouille',
          controles: 9234,
          infractions: 1876,
          revenus: 48500000,
          tauxInfractions: 20.3,
          tempsService: '9600h',
          gps: 95,
          derniereActivite: 'Pilier du commissariat',
          performance: 'Correcte' as Performance
        },
        {
          id: 'CI-PN-001087',
          nom: 'TRAORE Sekou',
          grade: 'Gardien' as AgentGrade,
          commissariat: '10ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Boulevard Lagunaire',
          activite: 'Contrôle fixe',
          controles: 7823,
          infractions: 1456,
          revenus: 38900000,
          tauxInfractions: 18.6,
          tempsService: '9400h',
          gps: 92,
          derniereActivite: 'Service loyal et dévoué',
          performance: 'Correcte' as Performance
        },
        {
          id: 'CI-PN-001423',
          nom: 'DIABATE Moussa',
          grade: 'Sergent' as AgentGrade,
          commissariat: '3ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Adjamé Marché',
          activite: 'Investigation',
          controles: 10987,
          infractions: 5634,
          revenus: 165000000,
          tauxInfractions: 51.3,
          tempsSupervision: '10050h',
          gps: 100,
          derniereActivite: 'Meilleur agent toutes catégories',
          performance: 'Excellente' as Performance
        },
        {
          id: 'CI-PN-001567',
          nom: 'ASSANE Fatou',
          grade: 'Adjudant' as AgentGrade,
          commissariat: '15ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Yopougon Zone 4',
          activite: 'Patrouille mobile',
          controles: 13245,
          infractions: 2876,
          revenus: 89000000,
          tauxInfractions: 21.7,
          tempsService: '9900h',
          gps: 99,
          derniereActivite: 'Modèle pour la nouvelle génération',
          performance: 'Excellente' as Performance
        }
      ],
      stats: {
        enService: 6,
        effectifTotal: 6,
        enPause: 0,
        horsService: 0,
        performanceMoyenne: 11570.5,
        topPerformers: 4
      }
    },
    personnalise: {
      agents: [
        {
          id: 'CI-PN-001245',
          nom: 'KOUASSI Jean',
          grade: 'Sergent' as AgentGrade,
          commissariat: '3ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Boulevard Principal',
          activite: 'Patrouille mobile',
          controles: 34,
          infractions: 12,
          revenus: 325000,
          tauxInfractions: 35.3,
          tempsService: '18h45',
          gps: 98,
          derniereActivite: 'Période analysée',
          performance: 'Excellente' as Performance
        },
        {
          id: 'CI-PN-001298',
          nom: 'KONE Aya',
          grade: 'Adjudant' as AgentGrade,
          commissariat: '5ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Avenue Centrale',
          activite: 'Contrôle fixe',
          controles: 45,
          infractions: 10,
          revenus: 285000,
          tauxInfractions: 22.2,
          tempsService: '20h00',
          gps: 100,
          derniereActivite: 'Période analysée',
          performance: 'Excellente' as Performance
        },
        {
          id: 'CI-PN-001156',
          nom: 'YAO Kofi',
          grade: 'Brigadier' as AgentGrade,
          commissariat: '7ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Zone Industrielle',
          activite: 'Patrouille',
          controles: 26,
          infractions: 5,
          revenus: 135000,
          tauxInfractions: 19.2,
          tempsService: '17h30',
          gps: 95,
          derniereActivite: 'Période analysée',
          performance: 'Correcte' as Performance
        },
        {
          id: 'CI-PN-001087',
          nom: 'TRAORE Sekou',
          grade: 'Gardien' as AgentGrade,
          commissariat: '10ème Arrondissement',
          status: 'EN PAUSE' as AgentStatus,
          localisation: 'Boulevard Lagunaire',
          activite: 'Repos',
          controles: 18,
          infractions: 3,
          revenus: 85000,
          tauxInfractions: 16.7,
          tempsService: '16h00',
          gps: 92,
          derniereActivite: 'Période analysée',
          performance: 'Correcte' as Performance
        },
        {
          id: 'CI-PN-001423',
          nom: 'DIABATE Moussa',
          grade: 'Sergent' as AgentGrade,
          commissariat: '3ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Adjamé Marché',
          activite: 'Investigation',
          controles: 31,
          infractions: 16,
          revenus: 465000,
          tauxInfractions: 51.6,
          tempsService: '19h15',
          gps: 100,
          derniereActivite: 'Période analysée',
          performance: 'Excellente' as Performance
        },
        {
          id: 'CI-PN-001567',
          nom: 'ASSANE Fatou',
          grade: 'Adjudant' as AgentGrade,
          commissariat: '15ème Arrondissement',
          status: 'EN SERVICE' as AgentStatus,
          localisation: 'Yopougon Zone 4',
          activite: 'Patrouille mobile',
          controles: 38,
          infractions: 8,
          revenus: 235000,
          tauxInfractions: 21.1,
          tempsService: '18h30',
          gps: 99,
          derniereActivite: 'Période analysée',
          performance: 'Excellente' as Performance
        }
      ],
      stats: {
        enService: 5,
        effectifTotal: 6,
        enPause: 1,
        horsService: 0,
        performanceMoyenne: 32.0,
        topPerformers: 4
      }
    }
  }

  // Transform API data to match local format with fallback to mock data
  const transformApiDataToLocal = (apiData: AgentDashboardResponse): typeof dataByPeriod.jour => {
    const agents: Agent[] = apiData.agents.map((agent: AgentDetailedResponse) => ({
      id: agent.id,
      nom: agent.nom,
      grade: agent.grade || 'Agent' as AgentGrade,
      commissariat: agent.commissariat || 'Non assigné',
      status: (agent.status?.toUpperCase() === 'EN SERVICE' ? 'EN SERVICE' :
               agent.status?.toUpperCase() === 'EN PAUSE' ? 'EN PAUSE' : 'HORS SERVICE') as AgentStatus,
      localisation: agent.localisation || 'Position inconnue',
      activite: agent.activite || 'Non spécifiée',
      controles: agent.controles || 0,
      infractions: agent.infractions || 0,
      revenus: agent.revenus || 0,
      tauxInfractions: agent.tauxInfractions || 0,
      tempsService: agent.tempsService || '0h',
      gps: agent.gps || 0,
      derniereActivite: agent.derniereActivite || 'Aucune activité récente',
      performance: (agent.performance === 'Excellente' ? 'Excellente' :
                    agent.performance === 'Correcte' ? 'Correcte' : 'Critique') as Performance
    }))

    return {
      agents,
      stats: {
        enService: apiData.stats.enService || 0,
        effectifTotal: apiData.stats.totalAgents || agents.length,
        enPause: apiData.stats.enPause || 0,
        horsService: apiData.stats.horsService || 0,
        performanceMoyenne: apiData.stats.performanceMoyenne || 0,
        topPerformers: agents.filter(a => a.performance === 'Excellente').length
      }
    }
  }

  // Get current data - prefer API data, fallback to mock
  const getMockData = () => isCustomDateRange ? dataByPeriod.personnalise : dataByPeriod[globalFilter]
  const currentData = dashboardData ? transformApiDataToLocal(dashboardData) : getMockData()

  // Apply search and filters to agents
  const filteredAgents = currentData.agents.filter(agent => {
    const matchesSearch = searchTerm === '' ||
      agent.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'Tous' || statusFilter === 'Tous les statuts' ||
      (statusFilter === 'En service' && agent.status === 'EN SERVICE') ||
      (statusFilter === 'En pause' && agent.status === 'EN PAUSE') ||
      (statusFilter === 'Hors service' && agent.status === 'HORS SERVICE')

    const matchesCommissariat = commissariatFilter === 'Tous' || commissariatFilter === 'Tous les commissariats' ||
      agent.commissariat === commissariatFilter

    return matchesSearch && matchesStatus && matchesCommissariat
  })

  // Get commissariats for filter dropdown (prefer API data)
  const commissariatOptions = commissariatsFromApi.length > 0
    ? commissariatsFromApi
    : ['3ème Arrondissement', '5ème Arrondissement', '7ème Arrondissement', '10ème Arrondissement', '15ème Arrondissement']

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

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case 'EN SERVICE':
        return 'bg-green-500 text-white'
      case 'EN PAUSE':
        return 'bg-yellow-500 text-white'
      case 'HORS SERVICE':
        return 'bg-red-500 text-white'
    }
  }

  const getPerformanceColor = (performance: Performance) => {
    switch (performance) {
      case 'Excellente':
        return 'bg-green-100 text-green-800'
      case 'Correcte':
        return 'bg-blue-100 text-blue-800'
      case 'Critique':
        return 'bg-red-100 text-red-800'
    }
  }

  const getCardBorderColor = (status: AgentStatus) => {
    switch (status) {
      case 'EN SERVICE':
        return 'border-green-500'
      case 'EN PAUSE':
        return 'border-yellow-500'
      case 'HORS SERVICE':
        return 'border-red-500'
    }
  }

  const getCardBgColor = (status: AgentStatus) => {
    switch (status) {
      case 'EN SERVICE':
        return 'bg-green-50'
      case 'EN PAUSE':
        return 'bg-yellow-50'
      case 'HORS SERVICE':
        return 'bg-red-50'
    }
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestion des Agents</h1>
            <p className="text-slate-600 mt-2">Suivi et coordination des agents sur le terrain</p>
          </div>
          <div className="flex items-center gap-3">
            {loading && (
              <div className="flex items-center gap-2 text-blue-600">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="text-sm">Chargement...</span>
              </div>
            )}
            <Button onClick={() => setShowAgentForm(true)} variant="primary" size="sm">
              <UserPlus className="w-4 h-4" />
              Nouvel agent
            </Button>
            <Button onClick={fetchDashboardData} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">{error}</span>
            <span className="text-sm text-red-600">(Utilisation des données de démonstration)</span>
          </div>
        </div>
      )}

      {/* Filtre Global de Période */}
       <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 mb-8">
              <CardBody className="p-4 md:p-6">
              <div className="space-y-4">
                  {/* Header et boutons de période */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                      </div>
                      <div>
                      <h2 className="text-lg md:text-xl font-bold text-gray-900">Période d'analyse</h2>
                      <p className="text-gray-600 text-xs md:text-sm hidden sm:block">
                          Sélectionnez la période pour filtrer toutes les données
                      </p>
                      </div>
                  </div>
                  
                  {/* Boutons de période - responsive */}
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
                      Historique
                      </Button>
                  </div>
                  </div>
          
                  {/* NOUVEAUX CHAMPS : Input de recherche + 2 Selects */}
                  <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-4 border-t border-blue-200">
                  {/* Champ Input de recherche */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-[200px]">
                      <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                      Rechercher:
                      </label>
                      <input 
                          type="text"
                          placeholder="Rechercher un agent..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                      />
                  </div>
          
               <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                <option>Tous les statuts</option>
                <option>En service</option>
                <option>En pause</option>
                <option>Hors service</option>
              </select>
              <select
                value={commissariatFilter}
                onChange={(e) => setCommissariatFilter(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                <option>Tous les commissariats</option>
                {commissariatOptions.map((comm) => (
                  <option key={comm} value={comm}>{comm}</option>
                ))}
              </select>
                      
                  </div>
          
                  {/* Sélection de dates personnalisées - responsive */}
                  <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-4 border-t border-blue-200">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                      Date début:
                      </label>
                      <input 
                      type="date" 
                      value={dateDebut}
                      onChange={(e) => setDateDebut(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                      />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                      Date fin:
                      </label>
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
          
                  {/* Séparateur visuel */}
                  <div className="hidden sm:block w-px h-8 bg-blue-300"></div>
          
                  {/* Boutons Imprimer et Exporter */}
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
                  
                  {/* Badge de confirmation - responsive */}
                  {isCustomDateRange && (
                  <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg w-full sm:w-auto">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs md:text-sm font-medium">
                      Période personnalisée active: {dateDebut} au {dateFin}
                      </span>
                  </div>
                  )}
              </div>
              </CardBody>
        </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="border-t-[3px] border-green-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Agents en Service</h3>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{currentData.stats.enService}</div>
            <div className="text-green-600 text-sm font-medium mb-3">
              {Math.round((currentData.stats.enService / currentData.stats.effectifTotal) * 100)}% de l'effectif
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Patrouille: {Math.round(currentData.stats.enService * 0.6)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Contrôle fixe: {Math.round(currentData.stats.enService * 0.25)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Investigation: {Math.round(currentData.stats.enService * 0.15)}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-t-[3px] border-red-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Hors Service</h3>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{currentData.stats.horsService}</div>
            <div className="text-red-600 text-sm font-medium mb-3">
              {currentData.stats.horsService > 0 ? 'Intervention requise' : 'Aucun problème'}
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-red-600" />
                <span>Non joignable: {currentData.stats.horsService}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-red-600" />
                <span>En pause: {currentData.stats.enPause}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-t-[3px] border-blue-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Performance Moyenne</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{currentData.stats.performanceMoyenne.toFixed(1)}</div>
            <div className="text-green-600 text-sm font-medium mb-3">
              Contrôles/agent/{globalFilter === 'jour' ? 'jour' : globalFilter}
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-2">
                <Award className="w-3 h-3 text-yellow-600" />
                <span>Top performer: {currentData.stats.topPerformers}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-3 h-3 text-blue-600" />
                <span>Objectif: {(currentData.stats.performanceMoyenne * 0.9).toFixed(1)}/{globalFilter === 'jour' ? 'jour' : globalFilter}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>


      {/* Liste des agents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {filteredAgents.map((agent) => (
          <Card key={agent.id} className={`border-t-[3px] ${getCardBorderColor(agent.status)} ${getCardBgColor(agent.status)}`}>
            <CardBody className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    agent.status === 'EN SERVICE' ? 'bg-green-600' :
                    agent.status === 'EN PAUSE' ? 'bg-yellow-600' : 'bg-red-600'
                  }`}>
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{agent.nom}</h3>
                    <p className="text-sm text-slate-600">{agent.id} • Grade: {agent.grade}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {agent.localisation} • {agent.activite}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(agent.status)}`}>
                  {agent.status}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-slate-900">{formatNumber(agent.controles)}</div>
                  <div className="text-xs text-slate-600">Contrôles</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{formatNumber(agent.infractions)}</div>
                  <div className="text-xs text-slate-600">Infractions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{agent.tempsService}</div>
                  <div className="text-xs text-slate-600">En service</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{agent.gps}%</div>
                  <div className="text-xs text-slate-600">GPS</div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 mb-4">
                <p className="text-xs text-slate-500 mb-1">Commissariat</p>
                <p className="font-bold text-slate-900">{agent.commissariat}</p>
              </div>

              <div className="flex gap-3 mb-4">
                {agent.status === 'EN SERVICE' ? (
                  <Button variant="success" size="sm" className="flex-1">
                    <Phone className="w-4 h-4" />
                    Contacter
                  </Button>
                ) : agent.status === 'EN PAUSE' ? (
                  <Button variant="warning" size="sm" className="flex-1">
                    <Phone className="w-4 h-4" />
                    Rappeler
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="flex-1 bg-red-600 text-white hover:bg-red-700 border-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    Urgence
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Navigation className="w-4 h-4" />
                  Localiser
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4" />
                  Mission
                </Button>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <p className="text-xs text-slate-500 mb-2">Dernière activité:</p>
                <p className="text-sm font-medium text-slate-900">{agent.derniereActivite}</p>
                <p className="text-xs text-slate-600 mt-2">
                  Revenus: {formatNumber(agent.revenus)} FCFA
                </p>
              </div>

              {agent.status === 'HORS SERVICE' && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">⚠️ ALERTE: Plus de contact depuis 45min</span>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Tableau de performance */}
      <Card>
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Tableau de Performance des Agents</h2>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
              Exporter
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Agent</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Contrôles</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Infractions</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Revenus</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Performance</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-slate-400" />
                        <div>
                          <div className="font-bold text-slate-900">{agent.nom}</div>
                          <div className="text-sm text-slate-500">{agent.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(agent.status)}`}>
                        {agent.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{formatNumber(agent.controles)}</div>
                      <div className="text-sm text-slate-500">{agent.tempsService} service</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{formatNumber(agent.infractions)}</div>
                      <div className="text-sm text-slate-500">Taux: {agent.tauxInfractions}%</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-green-600">{formatNumber(agent.revenus)}</div>
                      <div className="text-sm text-slate-500">FCFA</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getPerformanceColor(agent.performance)}`}>
                        ⭐ {agent.performance}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button variant="primary" size="sm">
                          Contact
                        </Button>
                        <Button onClick={() => router.push(`/admin/agents/${agent.id}`)} variant="outline" size="sm">
                          Voir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Actions rapides et notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Actions Rapides</h3>
            <div className="space-y-3">
              <Button variant="success" size="md" className="w-full justify-start">
                <MessageSquare className="w-5 h-5" />
                Message Général
              </Button>
              <Button variant="primary" size="md" className="w-full justify-start">
                <MapPin className="w-5 h-5" />
                Redistribuer Zones
              </Button>
              <Button variant="warning" size="md" className="w-full justify-start">
                <Clock className="w-5 h-5" />
                Programmer Pauses
              </Button>
              <Button variant="outline" size="md" className="w-full justify-start">
                <Download className="w-5 h-5" />
                Rapport Journalier
              </Button>
              <Button variant="outline" size="md" className="w-full justify-start bg-red-600 text-white hover:bg-red-700 border-red-600">
                <Bell className="w-5 h-5" />
                Rappel d'Urgence
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Notifications Agents</h3>
            <div className="space-y-3">
              {currentData.stats.horsService > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 mt-1" />
                    <div>
                      <p className="font-bold text-red-800">TRAORE Sekou</p>
                      <p className="text-sm text-red-700">Non joignable depuis 45min</p>
                    </div>
                  </div>
                </div>
              )}
        
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                  <div>
                    <p className="font-bold text-green-800">Performance excellente</p>
                    <p className="text-sm text-green-700">{currentData.stats.topPerformers} agents au-dessus des objectifs</p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Agent Form Modal */}
      <AgentForm
        isOpen={showAgentForm}
        onClose={() => setShowAgentForm(false)}
        onSuccess={() => {
          setShowAgentForm(false)
          fetchDashboardData()
        }}
      />
    </div>
  )
}