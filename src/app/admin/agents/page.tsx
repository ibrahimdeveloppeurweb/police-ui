'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Users, MapPin, Phone, Clock, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Radio, Navigation, Target, Award, Shield, Eye, MessageSquare, Plus,
  Download, Filter, Search, Calendar, Printer, FileDown, Activity, Zap, Wrench
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useRouter } from 'next/navigation'
import { adminService, type AgentDashboardResponse, type AgentDetailedResponse, type AgentDashboardStats, type ActivityDataEntry, type PerformanceDataEntry, type PieDataEntry, type CommissariatStatsEntry } from '@/lib/api/services'

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
  inspections: number
  infractions: number
  revenus: number
  tauxInfractions: number
  tempsService: string
  gps: number
  derniereActivite: string
  performance: Performance
}

type Commissariat = {
  name: string
  agents: number
  enService: number
  controles: number
  tauxActivite: number
}

export default function AgentsManagementPage() {
  const router = useRouter()
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('jour')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // API data state
  const [dashboardData, setDashboardData] = useState<AgentDashboardResponse | null>(null)

  // Données par période
  const dataByPeriod = {
    jour: {
      activityData: [
        { period: '00h-04h', controles: 45, agents: 12, infractions: 15 },
        { period: '04h-08h', controles: 89, agents: 18, infractions: 28 },
        { period: '08h-12h', controles: 456, agents: 42, infractions: 145 },
        { period: '12h-16h', controles: 523, agents: 45, infractions: 167 },
        { period: '16h-20h', controles: 387, agents: 38, infractions: 123 },
        { period: '20h-24h', controles: 156, agents: 25, infractions: 48 }
      ],
      performanceData: [
        { commissariat: '3ème Arr.', tauxActivite: 87.4, agents: 12 },
        { commissariat: '5ème Arr.', tauxActivite: 82.1, agents: 10 },
        { commissariat: '10ème Arr.', tauxActivite: 79.6, agents: 8 },
        { commissariat: '7ème Arr.', tauxActivite: 76.8, agents: 7 }
      ],
      pieData: [
        { name: 'En service', value: 83, color: '#10b981' },
        { name: 'En pause', value: 17, color: '#f59e0b' },
        { name: 'Hors service', value: 0, color: '#ef4444' }
      ],
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
          inspections: 2,
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
          inspections: 3,
          infractions: 2,
          revenus: 70000,
          tauxInfractions: 16.7,
          tempsService: '3h45',
          gps: 100,
          derniereActivite: 'Infraction EF-789-GH (il y a 5min)',
          performance: 'Excellente' as Performance
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
          inspections: 1,
          infractions: 4,
          revenus: 120000,
          tauxInfractions: 80,
          tempsService: '1h30',
          gps: 100,
          derniereActivite: 'Véhicule suspect MN-456-PQ (il y a 8min)',
          performance: 'Excellente' as Performance
        }
      ],
      stats: {
        totalAgents: 6,
        enService: 5,
        enPause: 1,
        horsService: 0,
        controlesTotal: 1656,
        infractionsTotales: 526,
        revenusTotal: 3.2,
        performanceMoyenne: 6.7,
        tempsServiceMoyen: '2h45',
        tauxReussite: 31.8
      },
      commissariats: [
        { name: "3ème Arrondissement", agents: 2, enService: 2, controles: 534, tauxActivite: 100 },
        { name: "5ème Arrondissement", agents: 1, enService: 1, controles: 456, tauxActivite: 100 },
        { name: "7ème Arrondissement", agents: 1, enService: 0, controles: 234, tauxActivite: 0 },
        { name: "10ème Arrondissement", agents: 1, enService: 1, controles: 289, tauxActivite: 100 },
        { name: "15ème Arrondissement", agents: 1, enService: 1, controles: 143, tauxActivite: 100 }
      ]
    },
    semaine: {
      activityData: [
        { period: 'Lun', controles: 1892, agents: 42, infractions: 567 },
        { period: 'Mar', controles: 2045, agents: 44, infractions: 612 },
        { period: 'Mer', controles: 1967, agents: 43, infractions: 589 },
        { period: 'Jeu', controles: 2134, agents: 45, infractions: 639 },
        { period: 'Ven', controles: 2287, agents: 45, infractions: 685 },
        { period: 'Sam', controles: 1678, agents: 38, infractions: 503 },
        { period: 'Dim', controles: 1345, agents: 32, infractions: 403 }
      ],
      performanceData: [
        { commissariat: '3ème Arr.', tauxActivite: 86.8, agents: 42 },
        { commissariat: '5ème Arr.', tauxActivite: 81.4, agents: 38 },
        { commissariat: '10ème Arr.', tauxActivite: 78.9, agents: 32 },
        { commissariat: '7ème Arr.', tauxActivite: 75.2, agents: 28 }
      ],
      pieData: [
        { name: 'En service', value: 83, color: '#10b981' },
        { name: 'En pause', value: 17, color: '#f59e0b' },
        { name: 'Hors service', value: 0, color: '#ef4444' }
      ],
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
          inspections: 0,
          infractions: 18,
          revenus: 485000,
          tauxInfractions: 34.6,
          tempsService: '38h45',
          gps: 98,
          derniereActivite: 'Contrôle en cours',
          performance: 'Excellente' as Performance
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
          inspections: 0,
          infractions: 24,
          revenus: 680000,
          tauxInfractions: 53.3,
          tempsService: '40h30',
          gps: 100,
          derniereActivite: 'Mission spéciale en cours',
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
          inspections: 0,
          infractions: 15,
          revenus: 425000,
          tauxInfractions: 22.4,
          tempsService: '42h00',
          gps: 100,
          derniereActivite: 'Rapport hebdomadaire complété',
          performance: 'Excellente' as Performance
        }
      ],
      stats: {
        totalAgents: 6,
        enService: 5,
        enPause: 1,
        horsService: 0,
        controlesTotal: 13348,
        infractionsTotales: 3998,
        revenusTotal: 23.5,
        performanceMoyenne: 47.7,
        tempsServiceMoyen: '38h15',
        tauxReussite: 29.9
      },
      commissariats: [
        { name: "3ème Arrondissement", agents: 12, enService: 10, controles: 3456, tauxActivite: 83 },
        { name: "5ème Arrondissement", agents: 10, enService: 9, controles: 2987, tauxActivite: 90 },
        { name: "7ème Arrondissement", agents: 8, enService: 6, controles: 2234, tauxActivite: 75 },
        { name: "10ème Arrondissement", agents: 7, enService: 6, controles: 1987, tauxActivite: 86 },
        { name: "15ème Arrondissement", agents: 6, enService: 5, controles: 2684, tauxActivite: 83 }
      ]
    },
    mois: {
      activityData: [
        { period: 'Sem 1', controles: 7892, agents: 42, infractions: 2367 },
        { period: 'Sem 2', controles: 8245, agents: 44, infractions: 2472 },
        { period: 'Sem 3', controles: 7934, agents: 43, infractions: 2378 },
        { period: 'Sem 4', controles: 8534, agents: 45, infractions: 2560 }
      ],
      performanceData: [
        { commissariat: '3ème Arr.', tauxActivite: 85.9, agents: 168 },
        { commissariat: '5ème Arr.', tauxActivite: 80.8, agents: 152 },
        { commissariat: '10ème Arr.', tauxActivite: 78.1, agents: 128 },
        { commissariat: '7ème Arr.', tauxActivite: 74.5, agents: 112 }
      ],
      pieData: [
        { name: 'En service', value: 85, color: '#10b981' },
        { name: 'En pause', value: 12, color: '#f59e0b' },
        { name: 'Hors service', value: 3, color: '#ef4444' }
      ],
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
          inspections: 0,
          infractions: 76,
          revenus: 2150000,
          tauxInfractions: 34.9,
          tempsService: '168h',
          gps: 98,
          derniereActivite: 'Performance mensuelle excellente',
          performance: 'Excellente' as Performance
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
          inspections: 0,
          infractions: 98,
          revenus: 2850000,
          tauxInfractions: 50.3,
          tempsService: '170h',
          gps: 100,
          derniereActivite: 'Spécialiste infractions majeures',
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
          inspections: 0,
          infractions: 62,
          revenus: 1875000,
          tauxInfractions: 21.8,
          tempsService: '172h',
          gps: 100,
          derniereActivite: 'Agent du mois - Septembre',
          performance: 'Excellente' as Performance
        }
      ],
      stats: {
        totalAgents: 6,
        enService: 6,
        enPause: 0,
        horsService: 0,
        controlesTotal: 32605,
        infractionsTotales: 9777,
        revenusTotal: 95.4,
        performanceMoyenne: 206.8,
        tempsServiceMoyen: '167h',
        tauxReussite: 30.0
      },
      commissariats: [
        { name: "3ème Arrondissement", agents: 45, enService: 39, controles: 13456, tauxActivite: 87 },
        { name: "5ème Arrondissement", agents: 38, enService: 33, controles: 11234, tauxActivite: 87 },
        { name: "7ème Arrondissement", agents: 32, enService: 26, controles: 8976, tauxActivite: 81 },
        { name: "10ème Arrondissement", agents: 28, enService: 24, controles: 7845, tauxActivite: 86 },
        { name: "15ème Arrondissement", agents: 25, enService: 21, controles: 9123, tauxActivite: 84 }
      ]
    },
    annee: {
      activityData: [
        { period: 'Jan', controles: 23567, agents: 42, infractions: 7070 },
        { period: 'Fév', controles: 21345, agents: 41, infractions: 6404 },
        { period: 'Mar', controles: 25789, agents: 44, infractions: 7737 },
        { period: 'Avr', controles: 24678, agents: 43, infractions: 7403 },
        { period: 'Mai', controles: 26891, agents: 45, infractions: 8067 },
        { period: 'Juin', controles: 25945, agents: 44, infractions: 7784 },
        { period: 'Juil', controles: 27856, agents: 45, infractions: 8357 },
        { period: 'Août', controles: 26734, agents: 44, infractions: 8020 },
        { period: 'Sep', controles: 25189, agents: 43, infractions: 7557 },
        { period: 'Oct', controles: 28405, agents: 45, infractions: 8522 }
      ],
      performanceData: [
        { commissariat: '3ème Arr.', tauxActivite: 84.8, agents: 1950 },
        { commissariat: '5ème Arr.', tauxActivite: 79.5, agents: 1680 },
        { commissariat: '10ème Arr.', tauxActivite: 77.2, agents: 1440 },
        { commissariat: '7ème Arr.', tauxActivite: 73.8, agents: 1260 }
      ],
      pieData: [
        { name: 'En service', value: 82, color: '#10b981' },
        { name: 'En pause', value: 14, color: '#f59e0b' },
        { name: 'Hors service', value: 4, color: '#ef4444' }
      ],
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
          inspections: 0,
          infractions: 852,
          revenus: 24500000,
          tauxInfractions: 34.7,
          tempsService: '1950h',
          gps: 98,
          derniereActivite: 'Agent étoile 2025',
          performance: 'Excellente' as Performance
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
          inspections: 0,
          infractions: 1123,
          revenus: 32400000,
          tauxInfractions: 50.3,
          tempsService: '2010h',
          gps: 100,
          derniereActivite: 'Médaille du mérite 2025',
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
          inspections: 0,
          infractions: 678,
          revenus: 21200000,
          tauxInfractions: 21.7,
          tempsService: '2040h',
          gps: 100,
          derniereActivite: 'Promotion Commissaire en cours',
          performance: 'Excellente' as Performance
        }
      ],
      stats: {
        totalAgents: 6,
        enService: 6,
        enPause: 0,
        horsService: 0,
        controlesTotal: 256399,
        infractionsTotales: 76920,
        revenusTotal: 1145.6,
        performanceMoyenne: 2335.5,
        tempsServiceMoyen: '1950h',
        tauxReussite: 30.0
      },
      commissariats: [
        { name: "3ème Arrondissement", agents: 540, enService: 468, controles: 161234, tauxActivite: 87 },
        { name: "5ème Arrondissement", agents: 456, enService: 396, controles: 134567, tauxActivite: 87 },
        { name: "7ème Arrondissement", agents: 384, enService: 312, controles: 107712, tauxActivite: 81 },
        { name: "10ème Arrondissement", agents: 336, enService: 289, controles: 94140, tauxActivite: 86 },
        { name: "15ème Arrondissement", agents: 300, enService: 252, controles: 109476, tauxActivite: 84 }
      ]
    },
    tout: {
      activityData: [
        { period: '2020', controles: 876543, agents: 38, infractions: 262963 },
        { period: '2021', controles: 967892, agents: 40, infractions: 290368 },
        { period: '2022', controles: 1034567, agents: 41, infractions: 310370 },
        { period: '2023', controles: 1076234, agents: 42, infractions: 322870 },
        { period: '2024', controles: 1158499, agents: 45, infractions: 347550 }
      ],
      performanceData: [
        { commissariat: '3ème Arr.', tauxActivite: 83.5, agents: 9850 },
        { commissariat: '5ème Arr.', tauxActivite: 78.2, agents: 8520 },
        { commissariat: '10ème Arr.', tauxActivite: 76.1, agents: 7200 },
        { commissariat: '7ème Arr.', tauxActivite: 72.5, agents: 6300 }
      ],
      pieData: [
        { name: 'En service', value: 80, color: '#10b981' },
        { name: 'En pause', value: 15, color: '#f59e0b' },
        { name: 'Hors service', value: 5, color: '#ef4444' }
      ],
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
          inspections: 0,
          infractions: 4287,
          revenus: 125000000,
          tauxInfractions: 34.4,
          tempsService: '9850h',
          gps: 98,
          derniereActivite: 'Carrière exemplaire - 5 ans de service',
          performance: 'Excellente' as Performance
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
          inspections: 0,
          infractions: 5634,
          revenus: 165000000,
          tauxInfractions: 51.3,
          tempsService: '10050h',
          gps: 100,
          derniereActivite: 'Meilleur agent toutes catégories',
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
          inspections: 0,
          infractions: 3456,
          revenus: 108000000,
          tauxInfractions: 22.0,
          tempsService: '10200h',
          gps: 100,
          derniereActivite: 'Légende vivante du corps',
          performance: 'Excellente' as Performance
        }
      ],
      stats: {
        totalAgents: 6,
        enService: 6,
        enPause: 0,
        horsService: 0,
        controlesTotal: 5113735,
        infractionsTotales: 1534121,
        revenusTotal: 5742.8,
        performanceMoyenne: 11570.5,
        tempsServiceMoyen: '9850h',
        tauxReussite: 30.0
      },
      commissariats: [
        { name: "3ème Arrondissement", agents: 2700, enService: 2340, controles: 806187, tauxActivite: 87 },
        { name: "5ème Arrondissement", agents: 2280, enService: 1983, controles: 672835, tauxActivite: 87 },
        { name: "7ème Arrondissement", agents: 1920, enService: 1560, controles: 538560, tauxActivite: 81 },
        { name: "10ème Arrondissement", agents: 1680, enService: 1445, controles: 470700, tauxActivite: 86 },
        { name: "15ème Arrondissement", agents: 1500, enService: 1260, controles: 547380, tauxActivite: 84 }
      ]
    },
    personnalise: {
      activityData: [
        { period: '10/10', controles: 1892, agents: 42, infractions: 567 },
        { period: '11/10', controles: 2045, agents: 44, infractions: 612 },
        { period: '12/10', controles: 1967, agents: 43, infractions: 589 },
        { period: '13/10', controles: 2134, agents: 45, infractions: 639 },
        { period: '14/10', controles: 2098, agents: 44, infractions: 629 }
      ],
      performanceData: [
        { commissariat: '3ème Arr.', tauxActivite: 86.2, agents: 87 },
        { commissariat: '5ème Arr.', tauxActivite: 81.1, agents: 76 },
        { commissariat: '10ème Arr.', tauxActivite: 78.5, agents: 68 },
        { commissariat: '7ème Arr.', tauxActivite: 75.4, agents: 61 }
      ],
      pieData: [
        { name: 'En service', value: 83, color: '#10b981' },
        { name: 'En pause', value: 17, color: '#f59e0b' },
        { name: 'Hors service', value: 0, color: '#ef4444' }
      ],
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
          inspections: 0,
          infractions: 12,
          revenus: 325000,
          tauxInfractions: 35.3,
          tempsService: '18h45',
          gps: 98,
          derniereActivite: 'Période analysée',
          performance: 'Excellente' as Performance
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
          inspections: 0,
          infractions: 16,
          revenus: 465000,
          tauxInfractions: 51.6,
          tempsService: '19h15',
          gps: 100,
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
          inspections: 0,
          infractions: 10,
          revenus: 285000,
          tauxInfractions: 22.2,
          tempsService: '20h00',
          gps: 100,
          derniereActivite: 'Période analysée',
          performance: 'Excellente' as Performance
        }
      ],
      stats: {
        totalAgents: 6,
        enService: 5,
        enPause: 1,
        horsService: 0,
        controlesTotal: 10136,
        infractionsTotales: 3036,
        revenusTotal: 19.8,
        performanceMoyenne: 32.0,
        tempsServiceMoyen: '18h30',
        tauxReussite: 29.9
      },
      commissariats: [
        { name: "3ème Arrondissement", agents: 2, enService: 2, controles: 4234, tauxActivite: 100 },
        { name: "5ème Arrondissement", agents: 1, enService: 1, controles: 3456, tauxActivite: 100 },
        { name: "7ème Arrondissement", agents: 1, enService: 0, controles: 1876, tauxActivite: 0 },
        { name: "10ème Arrondissement", agents: 1, enService: 1, controles: 2234, tauxActivite: 100 },
        { name: "15ème Arrondissement", agents: 1, enService: 1, controles: 2336, tauxActivite: 100 }
      ]
    }
  }

  // Use API data if available, fallback to mock data
  const mockData = isCustomDateRange ? dataByPeriod.personnalise : dataByPeriod[globalFilter]

  // Transform API data to match existing format
  const currentData = dashboardData ? {
    activityData: dashboardData.activityData.map(a => ({
      period: a.period,
      controles: a.controles,
      agents: a.agents,
      infractions: a.infractions
    })),
    performanceData: dashboardData.performanceData.map(p => ({
      commissariat: p.commissariat,
      tauxActivite: p.tauxActivite,
      agents: p.agents
    })),
    pieData: dashboardData.pieData.map(p => ({
      name: p.name,
      value: p.value,
      color: p.color
    })),
    agents: dashboardData.agents.map(a => ({
      id: a.id,
      nom: a.nom,
      grade: a.grade as AgentGrade || 'Gardien',
      commissariat: a.commissariat,
      status: a.status as AgentStatus,
      localisation: a.localisation || 'Non définie',
      activite: a.activite || 'Aucune',
      controles: a.controles,
      inspections: (a as unknown as { inspections?: number }).inspections || 0,
      infractions: a.infractions,
      revenus: a.revenus,
      tauxInfractions: a.tauxInfractions,
      tempsService: a.tempsService,
      gps: a.gps,
      derniereActivite: a.derniereActivite,
      performance: a.performance as Performance
    })),
    stats: {
      totalAgents: dashboardData.stats.totalAgents,
      enService: dashboardData.stats.enService,
      enPause: dashboardData.stats.enPause,
      horsService: dashboardData.stats.horsService,
      controlesTotal: dashboardData.stats.controlesTotal,
      infractionsTotales: dashboardData.stats.infractionsTotales,
      revenusTotal: dashboardData.stats.revenusTotal,
      performanceMoyenne: dashboardData.stats.performanceMoyenne,
      tempsServiceMoyen: dashboardData.stats.tempsServiceMoyen,
      tauxReussite: dashboardData.stats.tauxReussite
    },
    commissariats: dashboardData.commissariats.map(c => ({
      name: c.name,
      agents: c.agents,
      enService: c.enService,
      controles: c.controles,
      tauxActivite: c.tauxActivite
    }))
  } : mockData

  // Top 3 agents basé sur le nombre d'infractions détectées
  const top3Agents = [...currentData.agents]
    .sort((a, b) => b.infractions - a.infractions)
    .slice(0, 3)

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null || isNaN(num)) {
      return '0'
    }
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

  // Fetch dashboard data from API
  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const periode = isCustomDateRange ? 'personnalise' : globalFilter
      const response = await adminService.getAgentsDashboard(
        periode,
        isCustomDateRange ? dateDebut : undefined,
        isCustomDateRange ? dateFin : undefined
      )
      if (response.success && response.data) {
        setDashboardData(response.data)
      } else {
        setError(response.message || 'Erreur lors du chargement des données')
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err)
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }, [globalFilter, isCustomDateRange, dateDebut, dateFin])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted) {
      fetchDashboardData()
    }
  }, [isMounted, fetchDashboardData])

  if (!isMounted) {
    return null
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

  const AgentCard = ({ agent, rank }: { agent: Agent; rank: number }) => (
    <Card className={`border-t-[3px] ${getCardBorderColor(agent.status)}`}>
      <CardBody>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
              rank === 1 ? 'bg-yellow-100' : rank === 2 ? 'bg-gray-100' : 'bg-orange-100'
            }`}>
              <Award className={`w-6 h-6 ${
                rank === 1 ? 'text-yellow-600' : rank === 2 ? 'text-gray-600' : 'text-orange-600'
              }`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-2xl font-bold ${
                  rank === 1 ? 'text-yellow-600' : rank === 2 ? 'text-gray-600' : 'text-orange-600'
                }`}></span>
                <h3 className="font-bold text-xl text-slate-900">{agent.nom}</h3>
              </div>
              <p className="text-sm text-slate-500 mb-2">{agent.id} • {agent.grade}</p>
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                <Users className="w-4 h-4" />
                {agent.commissariat}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                <MapPin className="w-4 h-4" />
                {agent.localisation}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Activity className="w-4 h-4" />
                {agent.activite}
              </div>
            </div>
          </div>
          <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(agent.status)}`}>
            {agent.status}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {formatNumber(agent.controles)}
            </div>
            <div className="text-sm text-slate-500">Contrôles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">{formatNumber(agent.inspections || 0)}</div>
            <div className="text-sm text-slate-500">Inspections</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{formatNumber(agent.infractions)}</div>
            <div className="text-sm text-slate-500">Infractions</div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <p className="text-sm font-medium text-slate-700 mb-4">Statistiques de performance</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="font-bold text-lg text-slate-900">{agent.tauxInfractions.toFixed(1)}%</div>
              <div className="text-xs text-slate-500">Taux</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-slate-900">{agent.tempsService}</div>
              <div className="text-xs text-slate-500">Service</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-green-600">{agent.gps}%</div>
              <div className="text-xs text-slate-500">GPS</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-sm text-slate-600 mb-1">Revenus générés</div>
            <div className="text-lg font-bold text-green-600">{formatNumber(agent.revenus)} FCFA</div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-slate-100">
          <Button 
            onClick={() => router.push(`/admin/agents/${agent.id}`)}
            variant="primary" size="sm" className="flex-1">
            <Eye className="w-4 h-4" />
            Voir
          </Button>
          <Button variant="outline" size="sm">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Navigation className="w-4 h-4" />
          </Button>
        </div>

        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-500 mb-1">Dernière activité</p>
          <p className="text-sm font-medium text-slate-900">{agent.derniereActivite}</p>
        </div>

        {agent.status === 'HORS SERVICE' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Agent non joignable</span>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Agents - Tableau de Bord National</h1>
        <p className="text-slate-600 mt-2">Vue d'ensemble et gestion de tous les agents du territoire</p>
        {dashboardData && (
          <p className="text-green-600 text-sm mt-1">Données en temps réel depuis l'API</p>
        )}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          Chargement...
        </div>
      )}

      {/* Error indicator */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded-lg text-red-800">
          <strong>Erreur:</strong> {error}
          <Button
            onClick={fetchDashboardData}
            className="ml-4 bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1"
          >
            Réessayer
          </Button>
        </div>
      )}

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
                  <p className="text-gray-600 text-xs md:text-sm hidden sm:block">Sélectionnez la période pour filtrer toutes les données</p>
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
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2"
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
                <span className="text-xs md:text-sm font-medium">Période personnalisée active</span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Statistiques - 8 cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-t-4 border-blue-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">AGENTS TOTAUX</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats?.totalAgents}</div>
            <div className="text-gray-600 text-sm font-bold">Effectif national</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-green-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">EN SERVICE</h3>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats.enService}</div>
            <div className="text-green-600 text-sm font-bold">
              {Math.round((currentData.stats.enService / currentData.stats.totalAgents) * 100)}% de l'effectif
            </div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-yellow-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">EN PAUSE</h3>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats.enPause}</div>
            <div className="text-yellow-600 text-sm font-bold">
              {Math.round((currentData.stats.enPause / currentData.stats.totalAgents) * 100)}% en repos
            </div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-red-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">HORS SERVICE</h3>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats.horsService}</div>
            <div className="text-red-600 text-sm font-bold">
              {currentData.stats.horsService > 0 ? 'Intervention requise' : 'Aucun problème'}
            </div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-purple-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">CONTRÔLES TOTAUX</h3>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{formatNumber(currentData.stats.controlesTotal)}</div>
            <div className="text-purple-600 text-sm font-bold">Période sélectionnée</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-orange-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">INFRACTIONS</h3>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{formatNumber(currentData.stats.infractionsTotales)}</div>
            <div className="text-orange-600 text-sm font-bold">{currentData.stats.tauxReussite.toFixed(1)}% détectées</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-teal-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">REVENUS GÉNÉRÉS</h3>
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-teal-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">
              {globalFilter === 'tout' || globalFilter === 'annee'
                ? `${(currentData.stats.revenusTotal/1000).toFixed(1)}Mrd`
                : `${currentData.stats.revenusTotal}M`}
            </div>
            <div className="text-teal-600 text-sm font-bold">FCFA collectés</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-indigo-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">PERFORMANCE MOYENNE</h3>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats.performanceMoyenne.toFixed(1)}</div>
            <div className="text-indigo-600 text-sm font-bold">Contrôles/agent</div>
          </CardBody>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardBody className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Évolution des contrôles et infractions</h3>
            
            <div className="h-80 w-full">
              {currentData.activityData && currentData.activityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={currentData.activityData} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    barGap={8}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis 
                      dataKey="period" 
                      stroke="#6b7280" 
                      fontSize={12}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#6b7280" 
                      fontSize={12}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      align="center"
                      height={50}
                      iconType="circle"
                      wrapperStyle={{ paddingBottom: '20px' }}
                    />
                    <Bar 
                      dataKey="controles" 
                      fill="#6B9FED" 
                      radius={[8, 8, 0, 0]}
                      maxBarSize={50}
                      name="Contrôles effectués"
                      isAnimationActive={false}
                    />
                    <Bar 
                      dataKey="infractions" 
                      fill="#10B981" 
                      radius={[8, 8, 0, 0]}
                      maxBarSize={50}
                      name="Infractions détectées"
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Chargement des données...</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Statuts des Agents
            </h3>
            
            <div className="h-64 w-full">
              {currentData.pieData && currentData.pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentData.pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.value}%`}
                      outerRadius={80}
                      dataKey="value"
                      isAnimationActive={false}
                    >
                      {currentData.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Chargement des données...</p>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              {currentData.pieData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Taux d'activité par commissariat */}
      <Card>
        <CardBody className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Taux d'activité par commissariat</h3>
          <div className="space-y-4">
            {currentData.performanceData && currentData.performanceData.length > 0 ? (
              currentData.performanceData.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-semibold text-slate-900">{item.commissariat}</span>
                        <span className="text-sm text-slate-500 ml-2">({item.agents} agents)</span>
                      </div>
                      <span className="font-bold text-slate-900">{item.tauxActivite}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${item.tauxActivite}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">Aucune donnée disponible</div>
            )}
          </div>
        </CardBody>
      </Card>

    

      {/* Top 3 des Meilleurs Agents */}
      <Card className="mb-8">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Top 3 des Meilleurs Agents</h2>
              <p className="text-slate-600 mt-1">Classement basé sur le nombre d'infractions détectées</p>
            </div>
            <Button variant="warning" size="md">
              <Plus className="w-5 h-5" />
              Voir Tous les Agents
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {top3Agents.map((agent, index) => (
          <AgentCard key={agent.id} agent={agent} rank={index + 1} />
        ))}
      </div>
    </div>
  )
}