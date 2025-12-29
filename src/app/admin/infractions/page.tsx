'use client'

import React, { useState, useEffect } from 'react'
import {
  FileText, Shield, Gauge, Wrench, Truck, Leaf, Plus, Calendar,
  CheckCircle, Search, Printer, FileDown, TrendingUp, TrendingDown,
  AlertTriangle, DollarSign, BarChart3, Activity
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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

export default function InfractionsAdminPage() {
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('jour')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Données par période
  const dataByPeriod = {
    jour: {
      activityData: [
        { period: '00h-04h', total: 8, documents: 3, securite: 2, comportement: 2, technique: 1 },
        { period: '04h-08h', total: 15, documents: 5, securite: 4, comportement: 4, technique: 2 },
        { period: '08h-12h', total: 42, documents: 15, securite: 12, comportement: 10, technique: 5 },
        { period: '12h-16h', total: 38, documents: 13, securite: 11, comportement: 9, technique: 5 },
        { period: '16h-20h', total: 35, documents: 12, securite: 10, comportement: 8, technique: 5 },
        { period: '20h-24h', total: 18, documents: 6, securite: 5, comportement: 5, technique: 2 }
      ],
      pieData: [
        { name: 'Documents', value: 42, color: '#3b82f6' },
        { name: 'Sécurité', value: 38, color: '#ef4444' },
        { name: 'Comportement', value: 35, color: '#eab308' },
        { name: 'État technique', value: 22, color: '#a855f7' },
        { name: 'Chargement', value: 12, color: '#f97316' },
        { name: 'Environnement', value: 7, color: '#22c55e' }
      ],
      evolutionData: [
        { category: 'Documents', evolution: 8.5 },
        { category: 'Sécurité', evolution: 12.3 },
        { category: 'Comportement', evolution: -5.2 },
        { category: 'État technique', evolution: 3.8 },
        { category: 'Chargement', evolution: -2.1 },
        { category: 'Environnement', evolution: 1.5 }
      ],
      categories: [
        {
          id: 'documents',
          title: 'Documents',
          count: 42,
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
          count: 38,
          icon: Shield,
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600',
          infractions: [
            'Non port de ceinture',
            'Défaut de casque',
            'Téléphone au volant'
          ],
          evolution: 12.3
        },
        {
          id: 'comportement',
          title: 'Comportement',
          count: 35,
          icon: Gauge,
          bgColor: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
          infractions: [
            'Excès de vitesse',
            'Conduite dangereuse',
            'Non-respect feu rouge'
          ],
          evolution: -5.2
        },
        {
          id: 'etat-technique',
          title: 'État technique',
          count: 22,
          icon: Wrench,
          bgColor: 'bg-purple-50',
          iconColor: 'text-purple-600',
          infractions: [
            'Défaut de visite technique',
            'Pneus usés',
            'Éclairage défectueux'
          ],
          evolution: 3.8
        },
        {
          id: 'chargement',
          title: 'Chargement',
          count: 12,
          icon: Truck,
          bgColor: 'bg-orange-50',
          iconColor: 'text-orange-600',
          infractions: [
            'Surcharge',
            'Chargement mal arrimé',
            'Dimensions excessives'
          ],
          evolution: -2.1
        },
        {
          id: 'environnement',
          title: 'Environnement',
          count: 7,
          icon: Leaf,
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600',
          infractions: [
            'Pollution excessive',
            'Bruit excessif',
            "Fuite d'huile"
          ],
          evolution: 1.5
        }
      ],
      stats: {
        totalTypes: 156,
        totalInfractions: 1247,
        revenus: '8.7M',
        evolution: 6.8,
        montantMoyen: '6,977',
        tauxContestation: '12.5%',
        tauxPaiement: '87.5%',
        infractions24h: 156
      },
      topInfractions: [
        { name: "Défaut d'assurance", count: 342, percentage: 27.4, category: 'Documents' },
        { name: 'Excès de vitesse', count: 289, percentage: 23.2, category: 'Comportement' },
        { name: 'Non port de ceinture', count: 198, percentage: 15.9, category: 'Sécurité' },
        { name: 'Défaut de permis', count: 156, percentage: 12.5, category: 'Documents' },
        { name: 'Téléphone au volant', count: 134, percentage: 10.7, category: 'Sécurité' }
      ]
    },
    semaine: {
      activityData: [
        { period: 'Lun', total: 287, documents: 82, securite: 65, comportement: 58, technique: 48 },
        { period: 'Mar', total: 312, documents: 89, securite: 71, comportement: 63, technique: 52 },
        { period: 'Mer', total: 298, documents: 85, securite: 68, comportement: 60, technique: 50 },
        { period: 'Jeu', total: 325, documents: 93, securite: 74, comportement: 66, technique: 55 },
        { period: 'Ven', total: 342, documents: 98, securite: 78, comportement: 69, technique: 58 },
        { period: 'Sam', total: 256, documents: 73, securite: 58, comportement: 51, technique: 43 },
        { period: 'Dim', total: 203, documents: 58, securite: 46, comportement: 41, technique: 34 }
      ],
      pieData: [
        { name: 'Documents', value: 287, color: '#3b82f6' },
        { name: 'Sécurité', value: 245, color: '#ef4444' },
        { name: 'Comportement', value: 198, color: '#eab308' },
        { name: 'État technique', value: 156, color: '#a855f7' },
        { name: 'Chargement', value: 89, color: '#f97316' },
        { name: 'Environnement', value: 48, color: '#22c55e' }
      ],
      evolutionData: [
        { category: 'Documents', evolution: 9.2 },
        { category: 'Sécurité', evolution: 11.5 },
        { category: 'Comportement', evolution: -3.8 },
        { category: 'État technique', evolution: 4.5 },
        { category: 'Chargement', evolution: -1.2 },
        { category: 'Environnement', evolution: 2.8 }
      ],
      categories: [
        {
          id: 'documents',
          title: 'Documents',
          count: 287,
          icon: FileText,
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
          infractions: [
            'Défaut de permis',
            "Défaut d'assurance",
            'Défaut de carte grise'
          ],
          evolution: 9.2
        },
        {
          id: 'securite',
          title: 'Sécurité',
          count: 245,
          icon: Shield,
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600',
          infractions: [
            'Non port de ceinture',
            'Défaut de casque',
            'Téléphone au volant'
          ],
          evolution: 11.5
        },
        {
          id: 'comportement',
          title: 'Comportement',
          count: 198,
          icon: Gauge,
          bgColor: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
          infractions: [
            'Excès de vitesse',
            'Conduite dangereuse',
            'Non-respect feu rouge'
          ],
          evolution: -3.8
        },
        {
          id: 'etat-technique',
          title: 'État technique',
          count: 156,
          icon: Wrench,
          bgColor: 'bg-purple-50',
          iconColor: 'text-purple-600',
          infractions: [
            'Défaut de visite technique',
            'Pneus usés',
            'Éclairage défectueux'
          ],
          evolution: 4.5
        },
        {
          id: 'chargement',
          title: 'Chargement',
          count: 89,
          icon: Truck,
          bgColor: 'bg-orange-50',
          iconColor: 'text-orange-600',
          infractions: [
            'Surcharge',
            'Chargement mal arrimé',
            'Dimensions excessives'
          ],
          evolution: -1.2
        },
        {
          id: 'environnement',
          title: 'Environnement',
          count: 48,
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
        totalTypes: 156,
        totalInfractions: 8393,
        revenus: '60.1M',
        evolution: 7.5,
        montantMoyen: '7,160',
        tauxContestation: '13.2%',
        tauxPaiement: '86.8%',
        infractions24h: 1023
      },
      topInfractions: [
        { name: "Défaut d'assurance", count: 2387, percentage: 28.4, category: 'Documents' },
        { name: 'Excès de vitesse', count: 1945, percentage: 23.2, category: 'Comportement' },
        { name: 'Non port de ceinture', count: 1342, percentage: 16.0, category: 'Sécurité' },
        { name: 'Défaut de permis', count: 1089, percentage: 13.0, category: 'Documents' },
        { name: 'Téléphone au volant', count: 892, percentage: 10.6, category: 'Sécurité' }
      ]
    },
    mois: {
      activityData: [
        { period: 'Sem 1', total: 1892, documents: 542, securite: 456, comportement: 398, technique: 312 },
        { period: 'Sem 2', total: 2045, documents: 586, securite: 493, comportement: 430, technique: 337 },
        { period: 'Sem 3', total: 1967, documents: 564, securite: 475, comportement: 414, technique: 325 },
        { period: 'Sem 4', total: 2134, documents: 612, securite: 515, comportement: 449, technique: 352 }
      ],
      pieData: [
        { name: 'Documents', value: 1234, color: '#3b82f6' },
        { name: 'Sécurité', value: 1087, color: '#ef4444' },
        { name: 'Comportement', value: 892, color: '#eab308' },
        { name: 'État technique', value: 678, color: '#a855f7' },
        { name: 'Chargement', value: 387, color: '#f97316' },
        { name: 'Environnement', value: 198, color: '#22c55e' }
      ],
      evolutionData: [
        { category: 'Documents', evolution: 10.8 },
        { category: 'Sécurité', evolution: 12.7 },
        { category: 'Comportement', evolution: -2.5 },
        { category: 'État technique', evolution: 5.3 },
        { category: 'Chargement', evolution: 0.8 },
        { category: 'Environnement', evolution: 3.2 }
      ],
      categories: [
        {
          id: 'documents',
          title: 'Documents',
          count: 1234,
          icon: FileText,
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
          infractions: [
            'Défaut de permis',
            "Défaut d'assurance",
            'Défaut de carte grise'
          ],
          evolution: 10.8
        },
        {
          id: 'securite',
          title: 'Sécurité',
          count: 1087,
          icon: Shield,
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600',
          infractions: [
            'Non port de ceinture',
            'Défaut de casque',
            'Téléphone au volant'
          ],
          evolution: 12.7
        },
        {
          id: 'comportement',
          title: 'Comportement',
          count: 892,
          icon: Gauge,
          bgColor: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
          infractions: [
            'Excès de vitesse',
            'Conduite dangereuse',
            'Non-respect feu rouge'
          ],
          evolution: -2.5
        },
        {
          id: 'etat-technique',
          title: 'État technique',
          count: 678,
          icon: Wrench,
          bgColor: 'bg-purple-50',
          iconColor: 'text-purple-600',
          infractions: [
            'Défaut de visite technique',
            'Pneus usés',
            'Éclairage défectueux'
          ],
          evolution: 5.3
        },
        {
          id: 'chargement',
          title: 'Chargement',
          count: 387,
          icon: Truck,
          bgColor: 'bg-orange-50',
          iconColor: 'text-orange-600',
          infractions: [
            'Surcharge',
            'Chargement mal arrimé',
            'Dimensions excessives'
          ],
          evolution: 0.8
        },
        {
          id: 'environnement',
          title: 'Environnement',
          count: 198,
          icon: Leaf,
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600',
          infractions: [
            'Pollution excessive',
            'Bruit excessif',
            "Fuite d'huile"
          ],
          evolution: 3.2
        }
      ],
      stats: {
        totalTypes: 156,
        totalInfractions: 31674,
        revenus: '228.6M',
        evolution: 8.2,
        montantMoyen: '7,218',
        tauxContestation: '14.1%',
        tauxPaiement: '85.9%',
        infractions24h: 4476
      },
      topInfractions: [
        { name: "Défaut d'assurance", count: 8945, percentage: 28.2, category: 'Documents' },
        { name: 'Excès de vitesse', count: 7356, percentage: 23.2, category: 'Comportement' },
        { name: 'Non port de ceinture', count: 5067, percentage: 16.0, category: 'Sécurité' },
        { name: 'Défaut de permis', count: 4117, percentage: 13.0, category: 'Documents' },
        { name: 'Téléphone au volant', count: 3378, percentage: 10.7, category: 'Sécurité' }
      ]
    },
    annee: {
      activityData: [
        { period: 'Jan', total: 23456, documents: 6723, securite: 5656, comportement: 4934, technique: 3867 },
        { period: 'Fév', total: 21234, documents: 6089, securite: 5123, comportement: 4469, technique: 3503 },
        { period: 'Mar', total: 26789, documents: 7678, securite: 6456, comportement: 5632, technique: 4412 },
        { period: 'Avr', total: 25467, documents: 7302, securite: 6145, comportement: 5361, technique: 4201 },
        { period: 'Mai', total: 28934, documents: 8293, securite: 6978, comportement: 6089, technique: 4769 },
        { period: 'Juin', total: 27845, documents: 7982, securite: 6712, comportement: 5856, technique: 4589 },
        { period: 'Juil', total: 29567, documents: 8476, securite: 7134, comportement: 6223, technique: 4876 },
        { period: 'Août', total: 28234, documents: 8093, securite: 6812, comportement: 5945, technique: 4657 },
        { period: 'Sep', total: 26123, documents: 7489, securite: 6301, comportement: 5498, technique: 4306 },
        { period: 'Oct', total: 31674, documents: 9078, securite: 7634, comportement: 6660, technique: 5219 }
      ],
      pieData: [
        { name: 'Documents', value: 14567, color: '#3b82f6' },
        { name: 'Sécurité', value: 12845, color: '#ef4444' },
        { name: 'Comportement', value: 10234, color: '#eab308' },
        { name: 'État technique', value: 7823, color: '#a855f7' },
        { name: 'Chargement', value: 4567, color: '#f97316' },
        { name: 'Environnement', value: 2316, color: '#22c55e' }
      ],
      evolutionData: [
        { category: 'Documents', evolution: 15.2 },
        { category: 'Sécurité', evolution: 18.5 },
        { category: 'Comportement', evolution: 8.7 },
        { category: 'État technique', evolution: 12.3 },
        { category: 'Chargement', evolution: 6.5 },
        { category: 'Environnement', evolution: 9.8 }
      ],
      categories: [
        {
          id: 'documents',
          title: 'Documents',
          count: 14567,
          icon: FileText,
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
          infractions: [
            'Défaut de permis',
            "Défaut d'assurance",
            'Défaut de carte grise'
          ],
          evolution: 15.2
        },
        {
          id: 'securite',
          title: 'Sécurité',
          count: 12845,
          icon: Shield,
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600',
          infractions: [
            'Non port de ceinture',
            'Défaut de casque',
            'Téléphone au volant'
          ],
          evolution: 18.5
        },
        {
          id: 'comportement',
          title: 'Comportement',
          count: 10234,
          icon: Gauge,
          bgColor: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
          infractions: [
            'Excès de vitesse',
            'Conduite dangereuse',
            'Non-respect feu rouge'
          ],
          evolution: 8.7
        },
        {
          id: 'etat-technique',
          title: 'État technique',
          count: 7823,
          icon: Wrench,
          bgColor: 'bg-purple-50',
          iconColor: 'text-purple-600',
          infractions: [
            'Défaut de visite technique',
            'Pneus usés',
            'Éclairage défectueux'
          ],
          evolution: 12.3
        },
        {
          id: 'chargement',
          title: 'Chargement',
          count: 4567,
          icon: Truck,
          bgColor: 'bg-orange-50',
          iconColor: 'text-orange-600',
          infractions: [
            'Surcharge',
            'Chargement mal arrimé',
            'Dimensions excessives'
          ],
          evolution: 6.5
        },
        {
          id: 'environnement',
          title: 'Environnement',
          count: 2316,
          icon: Leaf,
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600',
          infractions: [
            'Pollution excessive',
            'Bruit excessif',
            "Fuite d'huile"
          ],
          evolution: 9.8
        }
      ],
      stats: {
        totalTypes: 156,
        totalInfractions: 303352,
        revenus: '2.2Mrd',
        evolution: 12.5,
        montantMoyen: '7,251',
        tauxContestation: '15.8%',
        tauxPaiement: '84.2%',
        infractions24h: 52352
      },
      topInfractions: [
        { name: "Défaut d'assurance", count: 85546, percentage: 28.2, category: 'Documents' },
        { name: 'Excès de vitesse', count: 70378, percentage: 23.2, category: 'Comportement' },
        { name: 'Non port de ceinture', count: 48536, percentage: 16.0, category: 'Sécurité' },
        { name: 'Défaut de permis', count: 39436, percentage: 13.0, category: 'Documents' },
        { name: 'Téléphone au volant', count: 32459, percentage: 10.7, category: 'Sécurité' }
      ]
    },
    tout: {
      activityData: [
        { period: '2020', total: 245678, documents: 70423, securite: 59234, comportement: 51689, technique: 40478 },
        { period: '2021', total: 278934, documents: 79987, securite: 67289, comportement: 58712, technique: 45989 },
        { period: '2022', total: 289456, documents: 82998, securite: 69823, comportement: 60934, technique: 47723 },
        { period: '2023', total: 283912, documents: 81409, securite: 68467, comportement: 59756, technique: 46789 },
        { period: '2024', total: 303352, documents: 86960, securite: 73141, comportement: 63826, technique: 49985 }
      ],
      pieData: [
        { name: 'Documents', value: 72456, color: '#3b82f6' },
        { name: 'Sécurité', value: 64287, color: '#ef4444' },
        { name: 'Comportement', value: 51234, color: '#eab308' },
        { name: 'État technique', value: 38956, color: '#a855f7' },
        { name: 'Chargement', value: 22789, color: '#f97316' },
        { name: 'Environnement', value: 11567, color: '#22c55e' }
      ],
      evolutionData: [
        { category: 'Documents', evolution: 22.5 },
        { category: 'Sécurité', evolution: 28.3 },
        { category: 'Comportement', evolution: 18.7 },
        { category: 'État technique', evolution: 15.8 },
        { category: 'Chargement', evolution: 12.3 },
        { category: 'Environnement', evolution: 19.5 }
      ],
      categories: [
        {
          id: 'documents',
          title: 'Documents',
          count: 72456,
          icon: FileText,
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
          infractions: [
            'Défaut de permis',
            "Défaut d'assurance",
            'Défaut de carte grise'
          ],
          evolution: 22.5
        },
        {
          id: 'securite',
          title: 'Sécurité',
          count: 64287,
          icon: Shield,
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600',
          infractions: [
            'Non port de ceinture',
            'Défaut de casque',
            'Téléphone au volant'
          ],
          evolution: 28.3
        },
        {
          id: 'comportement',
          title: 'Comportement',
          count: 51234,
          icon: Gauge,
          bgColor: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
          infractions: [
            'Excès de vitesse',
            'Conduite dangereuse',
            'Non-respect feu rouge'
          ],
          evolution: 18.7
        },
        {
          id: 'etat-technique',
          title: 'État technique',
          count: 38956,
          icon: Wrench,
          bgColor: 'bg-purple-50',
          iconColor: 'text-purple-600',
          infractions: [
            'Défaut de visite technique',
            'Pneus usés',
            'Éclairage défectueux'
          ],
          evolution: 15.8
        },
        {
          id: 'chargement',
          title: 'Chargement',
          count: 22789,
          icon: Truck,
          bgColor: 'bg-orange-50',
          iconColor: 'text-orange-600',
          infractions: [
            'Surcharge',
            'Chargement mal arrimé',
            'Dimensions excessives'
          ],
          evolution: 12.3
        },
        {
          id: 'environnement',
          title: 'Environnement',
          count: 11567,
          icon: Leaf,
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600',
          infractions: [
            'Pollution excessive',
            'Bruit excessif',
            "Fuite d'huile"
          ],
          evolution: 19.5
        }
      ],
      stats: {
        totalTypes: 156,
        totalInfractions: 1398840,
        revenus: '10.1Mrd',
        evolution: 20.8,
        montantMoyen: '7,221',
        tauxContestation: '16.5%',
        tauxPaiement: '83.5%',
        infractions24h: 261289
      },
      topInfractions: [
        { name: "Défaut d'assurance", count: 394572, percentage: 28.2, category: 'Documents' },
        { name: 'Excès de vitesse', count: 324612, percentage: 23.2, category: 'Comportement' },
        { name: 'Non port de ceinture', count: 223814, percentage: 16.0, category: 'Sécurité' },
        { name: 'Défaut de permis', count: 181849, percentage: 13.0, category: 'Documents' },
        { name: 'Téléphone au volant', count: 149650, percentage: 10.7, category: 'Sécurité' }
      ]
    },
    personnalise: {
      activityData: [
        { period: '10/10', total: 198, documents: 57, securite: 48, comportement: 42, technique: 33 },
        { period: '11/10', total: 214, documents: 61, securite: 51, comportement: 45, technique: 35 },
        { period: '12/10', total: 187, documents: 54, securite: 45, comportement: 39, technique: 31 },
        { period: '13/10', total: 223, documents: 64, securite: 54, comportement: 47, technique: 37 },
        { period: '14/10', total: 205, documents: 59, securite: 49, comportement: 43, technique: 34 }
      ],
      pieData: [
        { name: 'Documents', value: 187, color: '#3b82f6' },
        { name: 'Sécurité', value: 156, color: '#ef4444' },
        { name: 'Comportement', value: 134, color: '#eab308' },
        { name: 'État technique', value: 98, color: '#a855f7' },
        { name: 'Chargement', value: 56, color: '#f97316' },
        { name: 'Environnement', value: 32, color: '#22c55e' }
      ],
      evolutionData: [
        { category: 'Documents', evolution: 9.5 },
        { category: 'Sécurité', evolution: 11.8 },
        { category: 'Comportement', evolution: -3.2 },
        { category: 'État technique', evolution: 4.7 },
        { category: 'Chargement', evolution: 1.2 },
        { category: 'Environnement', evolution: 2.8 }
      ],
      categories: [
        {
          id: 'documents',
          title: 'Documents',
          count: 187,
          icon: FileText,
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
          infractions: [
            'Défaut de permis',
            "Défaut d'assurance",
            'Défaut de carte grise'
          ],
          evolution: 9.5
        },
        {
          id: 'securite',
          title: 'Sécurité',
          count: 156,
          icon: Shield,
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600',
          infractions: [
            'Non port de ceinture',
            'Défaut de casque',
            'Téléphone au volant'
          ],
          evolution: 11.8
        },
        {
          id: 'comportement',
          title: 'Comportement',
          count: 134,
          icon: Gauge,
          bgColor: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
          infractions: [
            'Excès de vitesse',
            'Conduite dangereuse',
            'Non-respect feu rouge'
          ],
          evolution: -3.2
        },
        {
          id: 'etat-technique',
          title: 'État technique',
          count: 98,
          icon: Wrench,
          bgColor: 'bg-purple-50',
          iconColor: 'text-purple-600',
          infractions: [
            'Défaut de visite technique',
            'Pneus usés',
            'Éclairage défectueux'
          ],
          evolution: 4.7
        },
        {
          id: 'chargement',
          title: 'Chargement',
          count: 56,
          icon: Truck,
          bgColor: 'bg-orange-50',
          iconColor: 'text-orange-600',
          infractions: [
            'Surcharge',
            'Chargement mal arrimé',
            'Dimensions excessives'
          ],
          evolution: 1.2
        },
        {
          id: 'environnement',
          title: 'Environnement',
          count: 32,
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
        totalTypes: 156,
        totalInfractions: 6036,
        revenus: '43.6M',
        evolution: 7.8,
        montantMoyen: '7,225',
        tauxContestation: '13.9%',
        tauxPaiement: '86.1%',
        infractions24h: 1027
      },
      topInfractions: [
        { name: "Défaut d'assurance", count: 1702, percentage: 28.2, category: 'Documents' },
        { name: 'Excès de vitesse', count: 1400, percentage: 23.2, category: 'Comportement' },
        { name: 'Non port de ceinture', count: 966, percentage: 16.0, category: 'Sécurité' },
        { name: 'Défaut de permis', count: 785, percentage: 13.0, category: 'Documents' },
        { name: 'Téléphone au volant', count: 646, percentage: 10.7, category: 'Sécurité' }
      ]
    }
  }

  const currentData = isCustomDateRange ? dataByPeriod.personnalise : dataByPeriod[globalFilter]

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

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Infractions Routières - Tableau de Bord</h1>
        <p className="text-slate-600 mt-2">Classification et analyse des infractions routières</p>
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
              <h3 className="text-gray-600 text-sm font-medium">TOTAL INFRACTIONS</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{formatNumber(currentData.stats?.totalInfractions)}</div>
            <div className="text-green-600 text-sm font-bold">+{currentData.stats?.evolution || 'N/A'}% vs période précédente</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-green-500">
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

        <Card className="border-t-4 border-purple-500">
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

        <Card className="border-t-4 border-orange-500">
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

        <Card className="border-t-4 border-red-500">
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

        <Card className="border-t-4 border-teal-500">
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

        <Card className="border-t-4 border-indigo-500">
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

        <Card className="border-t-4 border-yellow-500">
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
              Répartition par Catégorie
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
                  <span className="font-bold text-gray-900">{formatNumber(item.value)}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

    

      {/* Top 5 infractions */}
      <Card className="mt-8">
        <CardBody className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Top 5 Infractions les Plus Fréquentes</h2>
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
        </CardBody>
      </Card>
    </div>
  )
}