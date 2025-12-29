'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  FileText, Shield, Gauge, Wrench, Truck, Leaf, Plus, Calendar,
  CheckCircle, Search, Printer, FileDown, TrendingUp, TrendingDown,
  AlertTriangle, DollarSign, BarChart3, Activity, MapPin, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { infractionsService, InfractionDashboardResponse } from '@/lib/api/services'

type InfractionCategory = {
  id: string
  title: string
  count: number
  icon: React.ElementType
  bgColor: string
  iconColor: string
  infractions: string[]
  evolution: number
}

type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'

export default function InfractionsCommissariatPage() {
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('mois')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiData, setApiData] = useState<InfractionDashboardResponse | null>(null)

  const commissariatName = "Gestion des Infractions"
  const commissariatZone = "Tableau de bord national"

  // Fetch dashboard data from API
  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const filters: { periode?: string; date_debut?: string; date_fin?: string } = {}

      if (isCustomDateRange && dateDebut && dateFin) {
        filters.date_debut = dateDebut
        filters.date_fin = dateFin
      } else {
        filters.periode = globalFilter === 'personnalise' ? 'mois' : globalFilter
      }

      const response = await infractionsService.getDashboard(filters)
      if (response.success && response.data) {
        setApiData(response.data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error)
    } finally {
      setLoading(false)
    }
  }, [globalFilter, isCustomDateRange, dateDebut, dateFin])

  // Données par période pour UN SEUL COMMISSARIAT
  const dataByPeriod = {
    jour: {
      activityData: [
        { period: '00h-04h', total: 3, documents: 1, securite: 1, comportement: 1, technique: 0 },
        { period: '04h-08h', total: 6, documents: 2, securite: 2, comportement: 1, technique: 1 },
        { period: '08h-12h', total: 18, documents: 6, securite: 5, comportement: 4, technique: 3 },
        { period: '12h-16h', total: 16, documents: 5, securite: 4, comportement: 4, technique: 3 },
        { period: '16h-20h', total: 14, documents: 4, securite: 4, comportement: 3, technique: 3 },
        { period: '20h-24h', total: 7, documents: 2, securite: 2, comportement: 2, technique: 1 }
      ],
      pieData: [
        { name: 'Documents', value: 18, color: '#3b82f6' },
        { name: 'Sécurité', value: 16, color: '#ef4444' },
        { name: 'Comportement', value: 14, color: '#eab308' },
        { name: 'État technique', value: 9, color: '#a855f7' },
        { name: 'Chargement', value: 5, color: '#f97316' },
        { name: 'Environnement', value: 3, color: '#22c55e' }
      ],
      evolutionData: [
        { category: 'Documents', evolution: 5.2 },
        { category: 'Sécurité', evolution: 8.1 },
        { category: 'Comportement', evolution: -3.5 },
        { category: 'État technique', evolution: 2.4 },
        { category: 'Chargement', evolution: -1.8 },
        { category: 'Environnement', evolution: 0.9 }
      ],
      categories: [
        {
          id: 'documents',
          title: 'Documents',
          count: 18,
          icon: FileText,
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
          infractions: [
            'Défaut de permis',
            "Défaut d'assurance",
            'Défaut de carte grise'
          ],
          evolution: 5.2
        },
        {
          id: 'securite',
          title: 'Sécurité',
          count: 16,
          icon: Shield,
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600',
          infractions: [
            'Non port de ceinture',
            'Défaut de casque',
            'Téléphone au volant'
          ],
          evolution: 8.1
        },
        {
          id: 'comportement',
          title: 'Comportement',
          count: 14,
          icon: Gauge,
          bgColor: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
          infractions: [
            'Excès de vitesse',
            'Conduite dangereuse',
            'Non-respect feu rouge'
          ],
          evolution: -3.5
        },
        {
          id: 'etat-technique',
          title: 'État technique',
          count: 9,
          icon: Wrench,
          bgColor: 'bg-purple-50',
          iconColor: 'text-purple-600',
          infractions: [
            'Défaut de visite technique',
            'Pneus usés',
            'Éclairage défectueux'
          ],
          evolution: 2.4
        },
        {
          id: 'chargement',
          title: 'Chargement',
          count: 5,
          icon: Truck,
          bgColor: 'bg-orange-50',
          iconColor: 'text-orange-600',
          infractions: [
            'Surcharge',
            'Chargement mal arrimé',
            'Dimensions excessives'
          ],
          evolution: -1.8
        },
        {
          id: 'environnement',
          title: 'Environnement',
          count: 3,
          icon: Leaf,
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600',
          infractions: [
            'Pollution excessive',
            'Bruit excessif',
            "Fuite d'huile"
          ],
          evolution: 0.9
        }
      ],
      stats: {
        totalTypes: 45,
        totalInfractions: 65,
        revenus: '450K',
        evolution: 4.2,
        montantMoyen: '6,923',
        tauxContestation: '8.5%',
        tauxPaiement: '91.5%',
        infractions24h: 65
      },
      topInfractions: [
        { name: "Défaut d'assurance", count: 18, percentage: 27.7, category: 'Documents' },
        { name: 'Excès de vitesse', count: 15, percentage: 23.1, category: 'Comportement' },
        { name: 'Non port de ceinture', count: 10, percentage: 15.4, category: 'Sécurité' },
        { name: 'Défaut de permis', count: 8, percentage: 12.3, category: 'Documents' },
        { name: 'Téléphone au volant', count: 7, percentage: 10.8, category: 'Sécurité' }
      ]
    },
    semaine: {
      activityData: [
        { period: 'Lun', total: 42, documents: 12, securite: 11, comportement: 10, technique: 9 },
        { period: 'Mar', total: 48, documents: 14, securite: 12, comportement: 11, technique: 11 },
        { period: 'Mer', total: 45, documents: 13, securite: 11, comportement: 10, technique: 11 },
        { period: 'Jeu', total: 52, documents: 15, securite: 13, comportement: 12, technique: 12 },
        { period: 'Ven', total: 58, documents: 17, securite: 14, comportement: 13, technique: 14 },
        { period: 'Sam', total: 38, documents: 11, securite: 10, comportement: 9, technique: 8 },
        { period: 'Dim', total: 32, documents: 9, securite: 8, comportement: 8, technique: 7 }
      ],
      pieData: [
        { name: 'Documents', value: 91, color: '#3b82f6' },
        { name: 'Sécurité', value: 79, color: '#ef4444' },
        { name: 'Comportement', value: 73, color: '#eab308' },
        { name: 'État technique', value: 72, color: '#a855f7' },
        { name: 'Chargement', value: 35, color: '#f97316' },
        { name: 'Environnement', value: 18, color: '#22c55e' }
      ],
      evolutionData: [
        { category: 'Documents', evolution: 6.8 },
        { category: 'Sécurité', evolution: 9.2 },
        { category: 'Comportement', evolution: -2.1 },
        { category: 'État technique', evolution: 3.5 },
        { category: 'Chargement', evolution: -0.8 },
        { category: 'Environnement', evolution: 2.1 }
      ],
      categories: [
        {
          id: 'documents',
          title: 'Documents',
          count: 91,
          icon: FileText,
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
          infractions: [
            'Défaut de permis',
            "Défaut d'assurance",
            'Défaut de carte grise'
          ],
          evolution: 6.8
        },
        {
          id: 'securite',
          title: 'Sécurité',
          count: 79,
          icon: Shield,
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600',
          infractions: [
            'Non port de ceinture',
            'Défaut de casque',
            'Téléphone au volant'
          ],
          evolution: 9.2
        },
        {
          id: 'comportement',
          title: 'Comportement',
          count: 73,
          icon: Gauge,
          bgColor: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
          infractions: [
            'Excès de vitesse',
            'Conduite dangereuse',
            'Non-respect feu rouge'
          ],
          evolution: -2.1
        },
        {
          id: 'etat-technique',
          title: 'État technique',
          count: 72,
          icon: Wrench,
          bgColor: 'bg-purple-50',
          iconColor: 'text-purple-600',
          infractions: [
            'Défaut de visite technique',
            'Pneus usés',
            'Éclairage défectueux'
          ],
          evolution: 3.5
        },
        {
          id: 'chargement',
          title: 'Chargement',
          count: 35,
          icon: Truck,
          bgColor: 'bg-orange-50',
          iconColor: 'text-orange-600',
          infractions: [
            'Surcharge',
            'Chargement mal arrimé',
            'Dimensions excessives'
          ],
          evolution: -0.8
        },
        {
          id: 'environnement',
          title: 'Environnement',
          count: 18,
          icon: Leaf,
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600',
          infractions: [
            'Pollution excessive',
            'Bruit excessif',
            "Fuite d'huile"
          ],
          evolution: 2.1
        }
      ],
      stats: {
        totalTypes: 45,
        totalInfractions: 368,
        revenus: '2.6M',
        evolution: 5.8,
        montantMoyen: '7,065',
        tauxContestation: '9.2%',
        tauxPaiement: '90.8%',
        infractions24h: 52
      },
      topInfractions: [
        { name: "Défaut d'assurance", count: 102, percentage: 27.7, category: 'Documents' },
        { name: 'Excès de vitesse', count: 85, percentage: 23.1, category: 'Comportement' },
        { name: 'Non port de ceinture', count: 59, percentage: 16.0, category: 'Sécurité' },
        { name: 'Défaut de permis', count: 48, percentage: 13.0, category: 'Documents' },
        { name: 'Téléphone au volant', count: 39, percentage: 10.6, category: 'Sécurité' }
      ]
    },
    mois: {
      activityData: [
        { period: 'Sem 1', total: 142, documents: 41, securite: 35, comportement: 32, technique: 24 },
        { period: 'Sem 2', total: 158, documents: 45, securite: 38, comportement: 35, technique: 27 },
        { period: 'Sem 3', total: 148, documents: 42, securite: 36, comportement: 33, technique: 25 },
        { period: 'Sem 4', total: 165, documents: 47, securite: 40, comportement: 37, technique: 28 }
      ],
      pieData: [
        { name: 'Documents', value: 175, color: '#3b82f6' },
        { name: 'Sécurité', value: 149, color: '#ef4444' },
        { name: 'Comportement', value: 137, color: '#eab308' },
        { name: 'État technique', value: 104, color: '#a855f7' },
        { name: 'Chargement', value: 59, color: '#f97316' },
        { name: 'Environnement', value: 30, color: '#22c55e' }
      ],
      evolutionData: [
        { category: 'Documents', evolution: 8.5 },
        { category: 'Sécurité', evolution: 10.3 },
        { category: 'Comportement', evolution: -1.2 },
        { category: 'État technique', evolution: 4.2 },
        { category: 'Chargement', evolution: 1.5 },
        { category: 'Environnement', evolution: 2.8 }
      ],
      categories: [
        {
          id: 'documents',
          title: 'Documents',
          count: 175,
          icon: FileText,
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
          infractions: [
            'Défaut de permis',
            "Défaut d'assurance",
            'Défaut de carte grise'
          ],
          evolution: 8.5
        },
        {
          id: 'securite',
          title: 'Sécurité',
          count: 149,
          icon: Shield,
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600',
          infractions: [
            'Non port de ceinture',
            'Défaut de casque',
            'Téléphone au volant'
          ],
          evolution: 10.3
        },
        {
          id: 'comportement',
          title: 'Comportement',
          count: 137,
          icon: Gauge,
          bgColor: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
          infractions: [
            'Excès de vitesse',
            'Conduite dangereuse',
            'Non-respect feu rouge'
          ],
          evolution: -1.2
        },
        {
          id: 'etat-technique',
          title: 'État technique',
          count: 104,
          icon: Wrench,
          bgColor: 'bg-purple-50',
          iconColor: 'text-purple-600',
          infractions: [
            'Défaut de visite technique',
            'Pneus usés',
            'Éclairage défectueux'
          ],
          evolution: 4.2
        },
        {
          id: 'chargement',
          title: 'Chargement',
          count: 59,
          icon: Truck,
          bgColor: 'bg-orange-50',
          iconColor: 'text-orange-600',
          infractions: [
            'Surcharge',
            'Chargement mal arrimé',
            'Dimensions excessives'
          ],
          evolution: 1.5
        },
        {
          id: 'environnement',
          title: 'Environnement',
          count: 30,
          icon: Leaf,
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600',
          infractions: [
            'Pollution excessive',
            'Bruit excessif',
            "Fuite d'huile"
          ],
          evolution: 2.8
        }
      ],
      stats: {
        totalTypes: 45,
        totalInfractions: 654,
        revenus: '4.7M',
        evolution: 7.2,
        montantMoyen: '7,186',
        tauxContestation: '10.5%',
        tauxPaiement: '89.5%',
        infractions24h: 22
      },
      topInfractions: [
        { name: "Défaut d'assurance", count: 181, percentage: 27.7, category: 'Documents' },
        { name: 'Excès de vitesse', count: 151, percentage: 23.1, category: 'Comportement' },
        { name: 'Non port de ceinture', count: 105, percentage: 16.0, category: 'Sécurité' },
        { name: 'Défaut de permis', count: 85, percentage: 13.0, category: 'Documents' },
        { name: 'Téléphone au volant', count: 70, percentage: 10.7, category: 'Sécurité' }
      ]
    },
    annee: {
      activityData: [
        { period: 'Jan', total: 678, documents: 194, securite: 163, comportement: 142, technique: 112 },
        { period: 'Fév', total: 612, documents: 175, securite: 147, comportement: 128, technique: 101 },
        { period: 'Mar', total: 745, documents: 213, securite: 179, comportement: 156, technique: 123 },
        { period: 'Avr', total: 698, documents: 200, securite: 168, comportement: 147, technique: 116 },
        { period: 'Mai', total: 812, documents: 233, securite: 196, comportement: 171, technique: 135 },
        { period: 'Juin', total: 765, documents: 219, securite: 184, comportement: 161, technique: 127 },
        { period: 'Juil', total: 834, documents: 239, securite: 201, comportement: 175, technique: 138 },
        { period: 'Août', total: 789, documents: 226, securite: 190, comportement: 166, technique: 131 },
        { period: 'Sep', total: 712, documents: 204, securite: 172, comportement: 150, technique: 118 },
        { period: 'Oct', total: 854, documents: 245, securite: 206, comportement: 180, technique: 142 }
      ],
      pieData: [
        { name: 'Documents', value: 2148, color: '#3b82f6' },
        { name: 'Sécurité', value: 1806, color: '#ef4444' },
        { name: 'Comportement', value: 1585, color: '#eab308' },
        { name: 'État technique', value: 1243, color: '#a855f7' },
        { name: 'Chargement', value: 708, color: '#f97316' },
        { name: 'Environnement', value: 359, color: '#22c55e' }
      ],
      evolutionData: [
        { category: 'Documents', evolution: 12.5 },
        { category: 'Sécurité', evolution: 15.8 },
        { category: 'Comportement', evolution: 6.2 },
        { category: 'État technique', evolution: 9.7 },
        { category: 'Chargement', evolution: 4.3 },
        { category: 'Environnement', evolution: 7.5 }
      ],
      categories: [
        {
          id: 'documents',
          title: 'Documents',
          count: 2148,
          icon: FileText,
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
          infractions: [
            'Défaut de permis',
            "Défaut d'assurance",
            'Défaut de carte grise'
          ],
          evolution: 12.5
        },
        {
          id: 'securite',
          title: 'Sécurité',
          count: 1806,
          icon: Shield,
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600',
          infractions: [
            'Non port de ceinture',
            'Défaut de casque',
            'Téléphone au volant'
          ],
          evolution: 15.8
        },
        {
          id: 'comportement',
          title: 'Comportement',
          count: 1585,
          icon: Gauge,
          bgColor: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
          infractions: [
            'Excès de vitesse',
            'Conduite dangereuse',
            'Non-respect feu rouge'
          ],
          evolution: 6.2
        },
        {
          id: 'etat-technique',
          title: 'État technique',
          count: 1243,
          icon: Wrench,
          bgColor: 'bg-purple-50',
          iconColor: 'text-purple-600',
          infractions: [
            'Défaut de visite technique',
            'Pneus usés',
            'Éclairage défectueux'
          ],
          evolution: 9.7
        },
        {
          id: 'chargement',
          title: 'Chargement',
          count: 708,
          icon: Truck,
          bgColor: 'bg-orange-50',
          iconColor: 'text-orange-600',
          infractions: [
            'Surcharge',
            'Chargement mal arrimé',
            'Dimensions excessives'
          ],
          evolution: 4.3
        },
        {
          id: 'environnement',
          title: 'Environnement',
          count: 359,
          icon: Leaf,
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600',
          infractions: [
            'Pollution excessive',
            'Bruit excessif',
            "Fuite d'huile"
          ],
          evolution: 7.5
        }
      ],
      stats: {
        totalTypes: 45,
        totalInfractions: 7849,
        revenus: '56.8M',
        evolution: 10.8,
        montantMoyen: '7,237',
        tauxContestation: '12.3%',
        tauxPaiement: '87.7%',
        infractions24h: 21
      },
      topInfractions: [
        { name: "Défaut d'assurance", count: 2174, percentage: 27.7, category: 'Documents' },
        { name: 'Excès de vitesse', count: 1813, percentage: 23.1, category: 'Comportement' },
        { name: 'Non port de ceinture', count: 1256, percentage: 16.0, category: 'Sécurité' },
        { name: 'Défaut de permis', count: 1020, percentage: 13.0, category: 'Documents' },
        { name: 'Téléphone au volant', count: 840, percentage: 10.7, category: 'Sécurité' }
      ]
    },
    tout: {
      activityData: [
        { period: '2020', total: 6542, documents: 1874, securite: 1576, comportement: 1375, technique: 1083 },
        { period: '2021', total: 7123, documents: 2041, securite: 1717, comportement: 1498, technique: 1180 },
        { period: '2022', total: 7896, documents: 2263, securite: 1904, comportement: 1661, technique: 1308 },
        { period: '2023', total: 8456, documents: 2423, securite: 2038, comportement: 1778, technique: 1401 },
        { period: '2024', total: 9234, documents: 2646, securite: 2226, comportement: 1942, technique: 1530 }
      ],
      pieData: [
        { name: 'Documents', value: 11247, color: '#3b82f6' },
        { name: 'Sécurité', value: 9461, color: '#ef4444' },
        { name: 'Comportement', value: 8254, color: '#eab308' },
        { name: 'État technique', value: 6502, color: '#a855f7' },
        { name: 'Chargement', value: 3708, color: '#f97316' },
        { name: 'Environnement', value: 1882, color: '#22c55e' }
      ],
      evolutionData: [
        { category: 'Documents', evolution: 18.7 },
        { category: 'Sécurité', evolution: 22.4 },
        { category: 'Comportement', evolution: 15.3 },
        { category: 'État technique', evolution: 13.8 },
        { category: 'Chargement', evolution: 9.5 },
        { category: 'Environnement', evolution: 16.2 }
      ],
      categories: [
        {
          id: 'documents',
          title: 'Documents',
          count: 11247,
          icon: FileText,
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
          infractions: [
            'Défaut de permis',
            "Défaut d'assurance",
            'Défaut de carte grise'
          ],
          evolution: 18.7
        },
        {
          id: 'securite',
          title: 'Sécurité',
          count: 9461,
          icon: Shield,
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600',
          infractions: [
            'Non port de ceinture',
            'Défaut de casque',
            'Téléphone au volant'
          ],
          evolution: 22.4
        },
        {
          id: 'comportement',
          title: 'Comportement',
          count: 8254,
          icon: Gauge,
          bgColor: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
          infractions: [
            'Excès de vitesse',
            'Conduite dangereuse',
            'Non-respect feu rouge'
          ],
          evolution: 15.3
        },
        {
          id: 'etat-technique',
          title: 'État technique',
          count: 6502,
          icon: Wrench,
          bgColor: 'bg-purple-50',
          iconColor: 'text-purple-600',
          infractions: [
            'Défaut de visite technique',
            'Pneus usés',
            'Éclairage défectueux'
          ],
          evolution: 13.8
        },
        {
          id: 'chargement',
          title: 'Chargement',
          count: 3708,
          icon: Truck,
          bgColor: 'bg-orange-50',
          iconColor: 'text-orange-600',
          infractions: [
            'Surcharge',
            'Chargement mal arrimé',
            'Dimensions excessives'
          ],
          evolution: 9.5
        },
        {
          id: 'environnement',
          title: 'Environnement',
          count: 1882,
          icon: Leaf,
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600',
          infractions: [
            'Pollution excessive',
            'Bruit excessif',
            "Fuite d'huile"
          ],
          evolution: 16.2
        }
      ],
      stats: {
        totalTypes: 45,
        totalInfractions: 41054,
        revenus: '297.3M',
        evolution: 17.5,
        montantMoyen: '7,240',
        tauxContestation: '13.8%',
        tauxPaiement: '86.2%',
        infractions24h: 11
      },
      topInfractions: [
        { name: "Défaut d'assurance", count: 11367, percentage: 27.7, category: 'Documents' },
        { name: 'Excès de vitesse', count: 9485, percentage: 23.1, category: 'Comportement' },
        { name: 'Non port de ceinture', count: 6570, percentage: 16.0, category: 'Sécurité' },
        { name: 'Défaut de permis', count: 5337, percentage: 13.0, category: 'Documents' },
        { name: 'Téléphone au volant', count: 4395, percentage: 10.7, category: 'Sécurité' }
      ]
    },
    personnalise: {
      activityData: [
        { period: '10/10', total: 22, documents: 6, securite: 5, comportement: 5, technique: 4 },
        { period: '11/10', total: 25, documents: 7, securite: 6, comportement: 6, technique: 4 },
        { period: '12/10', total: 20, documents: 6, securite: 5, comportement: 4, technique: 3 },
        { period: '13/10', total: 28, documents: 8, securite: 7, comportement: 6, technique: 5 },
        { period: '14/10', total: 24, documents: 7, securite: 6, comportement: 5, technique: 4 }
      ],
      pieData: [
        { name: 'Documents', value: 34, color: '#3b82f6' },
        { name: 'Sécurité', value: 29, color: '#ef4444' },
        { name: 'Comportement', value: 26, color: '#eab308' },
        { name: 'État technique', value: 20, color: '#a855f7' },
        { name: 'Chargement', value: 11, color: '#f97316' },
        { name: 'Environnement', value: 6, color: '#22c55e' }
      ],
      evolutionData: [
        { category: 'Documents', evolution: 7.2 },
        { category: 'Sécurité', evolution: 9.8 },
        { category: 'Comportement', evolution: -2.4 },
        { category: 'État technique', evolution: 3.9 },
        { category: 'Chargement', evolution: 0.7 },
        { category: 'Environnement', evolution: 2.3 }
      ],
      categories: [
        {
          id: 'documents',
          title: 'Documents',
          count: 34,
          icon: FileText,
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
          infractions: [
            'Défaut de permis',
            "Défaut d'assurance",
            'Défaut de carte grise'
          ],
          evolution: 7.2
        },
        {
          id: 'securite',
          title: 'Sécurité',
          count: 29,
          icon: Shield,
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600',
          infractions: [
            'Non port de ceinture',
            'Défaut de casque',
            'Téléphone au volant'
          ],
          evolution: 9.8
        },
        {
          id: 'comportement',
          title: 'Comportement',
          count: 26,
          icon: Gauge,
          bgColor: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
          infractions: [
            'Excès de vitesse',
            'Conduite dangereuse',
            'Non-respect feu rouge'
          ],
          evolution: -2.4
        },
        {
          id: 'etat-technique',
          title: 'État technique',
          count: 20,
          icon: Wrench,
          bgColor: 'bg-purple-50',
          iconColor: 'text-purple-600',
          infractions: [
            'Défaut de visite technique',
            'Pneus usés',
            'Éclairage défectueux'
          ],
          evolution: 3.9
        },
        {
          id: 'chargement',
          title: 'Chargement',
          count: 11,
          icon: Truck,
          bgColor: 'bg-orange-50',
          iconColor: 'text-orange-600',
          infractions: [
            'Surcharge',
            'Chargement mal arrimé',
            'Dimensions excessives'
          ],
          evolution: 0.7
        },
        {
          id: 'environnement',
          title: 'Environnement',
          count: 6,
          icon: Leaf,
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600',
          infractions: [
            'Pollution excessive',
            'Bruit excessif',
            "Fuite d'huile"
          ],
          evolution: 2.3
        }
      ],
      stats: {
        totalTypes: 45,
        totalInfractions: 119,
        revenus: '860K',
        evolution: 6.5,
        montantMoyen: '7,227',
        tauxContestation: '9.8%',
        tauxPaiement: '90.2%',
        infractions24h: 24
      },
      topInfractions: [
        { name: "Défaut d'assurance", count: 33, percentage: 27.7, category: 'Documents' },
        { name: 'Excès de vitesse', count: 28, percentage: 23.5, category: 'Comportement' },
        { name: 'Non port de ceinture', count: 19, percentage: 16.0, category: 'Sécurité' },
        { name: 'Défaut de permis', count: 15, percentage: 12.6, category: 'Documents' },
        { name: 'Téléphone au volant', count: 13, percentage: 10.9, category: 'Sécurité' }
      ]
    }
  }

  // Fusionner les données API avec les données statiques de fallback
  const staticData = isCustomDateRange ? dataByPeriod.personnalise : dataByPeriod[globalFilter]

  // Construire currentData à partir des données API si disponibles
  // Note: Quand l'API retourne des données (même vides), on les utilise pour refléter la réalité
  // On n'utilise les données statiques que si l'API n'a pas encore répondu (apiData === null)
  const currentData = apiData ? {
    // Pour les graphiques : utiliser les données API (même si vides) pour refléter la réalité
    activityData: apiData.activityData || [],
    pieData: apiData.pieData || [],
    evolutionData: apiData.evolutionData || [],
    categories: apiData.categories && apiData.categories.length > 0 ? apiData.categories.map(cat => ({
      ...cat,
      icon: cat.title === 'Documents' ? FileText :
            cat.title === 'Sécurité' ? Shield :
            cat.title === 'Comportement' ? Gauge :
            cat.title === 'État technique' ? Wrench :
            cat.title === 'Chargement' ? Truck :
            cat.title === 'Environnement' ? Leaf : FileText
    })) : [],
    stats: {
      totalTypes: apiData.stats.totalTypes !== undefined ? apiData.stats.totalTypes : 0,
      totalInfractions: apiData.stats.totalInfractions !== undefined ? apiData.stats.totalInfractions : 0,
      revenus: apiData.stats.revenus || '0',
      evolution: apiData.stats.evolution !== undefined ? apiData.stats.evolution : 0,
      montantMoyen: apiData.stats.montantMoyen || '0',
      tauxContestation: apiData.stats.tauxContestation || '0%',
      tauxPaiement: apiData.stats.tauxPaiement || '0%',
      infractions24h: apiData.stats.infractions24h !== undefined ? apiData.stats.infractions24h : 0
    },
    topInfractions: apiData.topInfractions || []
  } : staticData

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

  // Charger les données au montage
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Charger les données quand le filtre change
  useEffect(() => {
    if (isMounted) {
      fetchDashboardData()
    }
  }, [isMounted, globalFilter, isCustomDateRange, fetchDashboardData])

  if (!isMounted) {
    return null
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header avec informations du commissariat */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <MapPin className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{commissariatName}</h1>
            <p className="text-slate-600">{commissariatZone}</p>
          </div>
        </div>
        <p className="text-slate-600">Tableau de bord des infractions routières</p>
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
                  <p className="text-gray-600 text-xs md:text-sm hidden sm:block">Sélectionnez la période pour filtrer les données du commissariat</p>
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
                  Historique
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

      {/* Statistiques - 8 cartes avec la nouvelle classe */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border border-gray-200 border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">TOTAL INFRACTIONS</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{formatNumber(currentData.stats?.totalInfractions)}</div>
            <div className="text-green-600 text-sm font-bold">+{currentData.stats?.evolution || 'N/A'}% vs période précédente</div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">REVENUS COLLECTÉS</h3>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats?.revenus || 'N/A'}</div>
            <div className="text-green-600 text-sm font-bold">FCFA perçus</div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-purple-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">TYPES D'INFRACTIONS</h3>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats?.totalTypes || 'N/A'}</div>
            <div className="text-gray-600 text-sm font-bold">Catégories répertoriées</div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-orange-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">MONTANT MOYEN</h3>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats?.montantMoyen || 'N/A'}</div>
            <div className="text-gray-600 text-sm font-bold">FCFA par infraction</div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-red-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">TAUX CONTESTATION</h3>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats?.tauxContestation || 'N/A'}</div>
            <div className="text-red-600 text-sm font-bold">Infractions contestées</div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-teal-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">TAUX DE PAIEMENT</h3>
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-teal-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats?.tauxPaiement || 'N/A'}</div>
            <div className="text-teal-600 text-sm font-bold">Infractions réglées</div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-indigo-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">INFRACTIONS 24H</h3>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{formatNumber(currentData.stats?.infractions24h)}</div>
            <div className="text-indigo-600 text-sm font-bold">Dernières 24 heures</div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-yellow-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">CATÉGORIE LEADER</h3>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-3">Documents</div>
            <div className="text-yellow-600 text-sm font-bold">{formatNumber(currentData.categories[0]?.count)} infractions</div>
          </CardBody>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardBody className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Évolution des infractions par période</h3>
            
            <div className="h-80 w-full">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                  <p className="text-gray-500">Chargement des données...</p>
                </div>
              ) : currentData.activityData && currentData.activityData.length > 0 ? (
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
                      dataKey="total"
                      fill="#6B9FED"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={50}
                      name="Total infractions"
                      isAnimationActive={false}
                    />
                    <Bar
                      dataKey="documents"
                      fill="#3B82F6"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={50}
                      name="Documents"
                      isAnimationActive={false}
                    />
                    <Bar
                      dataKey="securite"
                      fill="#EF4444"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={50}
                      name="Sécurité"
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <BarChart3 className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium">Aucune donnée pour cette période</p>
                  <p className="text-sm">Sélectionnez une autre période ou ajoutez des infractions</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Répartition par Catégorie
            </h3>
            
            <div className="h-64 w-full">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                  <p className="text-gray-500">Chargement...</p>
                </div>
              ) : currentData.pieData && currentData.pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentData.pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
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
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <AlertTriangle className="w-12 h-12 mb-2" />
                  <p className="text-sm">Aucune donnée</p>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              {currentData.pieData && currentData.pieData.length > 0 ? (
                currentData.pieData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </div>
                    <span className="font-bold text-gray-900">{formatNumber(item.value)}</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 text-sm">Aucune catégorie à afficher</p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Top 5 infractions */}
      <Card className="mt-8">
        <CardBody className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Top 5 Infractions les Plus Fréquentes</h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
              <p className="text-gray-500">Chargement...</p>
            </div>
          ) : currentData.topInfractions && currentData.topInfractions.length > 0 ? (
            <div className="space-y-4">
              {currentData.topInfractions.map((infraction, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-slate-600">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-semibold text-slate-900">{infraction.name}</span>
                        <span className="text-sm text-slate-500 ml-2">({infraction.category})</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900">{formatNumber(infraction.count)}</span>
                        <span className="text-sm text-slate-500 ml-2">{infraction.percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(infraction.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <AlertTriangle className="w-12 h-12 mb-2" />
              <p className="text-lg font-medium">Aucune infraction pour cette période</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}