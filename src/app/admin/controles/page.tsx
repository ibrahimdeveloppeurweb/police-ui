'use client'

import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, Target, Shield, AlertTriangle, Activity, DollarSign, Car, MapPin,
  CheckCircle, Clock, Users, BarChart3, Eye, Download,
  Award, Bell, TrendingDown, AlertCircle, Star, Trophy,
  Calendar, Search, Printer, FileDown
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'

export default function ControlesDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('jour')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Données selon la période sélectionnée
  const dataByPeriod = {
    jour: {
      activityData: [
        { period: '00h-04h', controles: 12, conformes: 10, infractions: 2, avertissements: 0 },
        { period: '04h-08h', controles: 28, conformes: 22, infractions: 5, avertissements: 1 },
        { period: '08h-12h', controles: 124, conformes: 102, infractions: 18, avertissements: 4 },
        { period: '12h-16h', controles: 156, conformes: 128, infractions: 23, avertissements: 5 },
        { period: '16h-20h', controles: 89, conformes: 73, infractions: 13, avertissements: 3 },
        { period: '20h-24h', controles: 23, conformes: 19, infractions: 3, avertissements: 1 }
      ],
      pieData: [
        { name: 'Conformes', value: 1042, color: '#10b981' },
        { name: 'Infractions', value: 156, color: '#ef4444' },
        { name: 'Avertissements', value: 49, color: '#f59e0b' }
      ],
      stats: {
        totalControles: 1247,
        controlesEvolution: '+12.5%',
        controlesComparison: 'vs hier (1,108)',
        conformes: 1042,
        conformesEvolution: '+10.8%',
        conformesComparison: 'vs hier (940)',
        infractions: 156,
        infractionsEvolution: '+18.2%',
        infractionsComparison: 'vs hier (132)',
        avertissements: 49,
        avertissementsEvolution: '+22.5%',
        avertissementsComparison: 'vs hier (40)',
        revenus: '8.7M',
        revenusEvolution: '+8.2%',
        revenusComparison: 'vs hier (8.04M)',
        tauxConformite: '83.6%',
        tauxConformiteEvolution: '+2.3%',
        tauxConformiteComparison: 'vs hier (81.3%)',
        agentsActifs: '289/342',
        agentsEvolution: '84.5% opérationnel',
        moyenneParAgent: '4.3',
        moyenneEvolution: '+0.5 vs hier'
      },
      topAgents: [
        {
          nom: 'KOUAME Jean',
          matricule: 'AG-2023-045',
          commissariat: '3ème Arrondissement',
          controles: 47,
          conformes: 39,
          infractions: 6,
          avertissements: 2,
          performance: 97,
          revenus: 340000,
          revenusEvolution: '+15.2%',
          statut: 'excellent',
          topPerformer: true
        },
        {
          nom: 'DIALLO Mamadou',
          matricule: 'AG-2023-078',
          commissariat: '5ème Arrondissement',
          controles: 38,
          conformes: 31,
          infractions: 5,
          avertissements: 2,
          performance: 94,
          revenus: 285000,
          revenusEvolution: '+8.7%',
          statut: 'excellent',
          topPerformer: false
        },
        {
          nom: 'KONE Ibrahim',
          matricule: 'AG-2023-112',
          commissariat: '7ème Arrondissement',
          controles: 12,
          conformes: 8,
          infractions: 3,
          avertissements: 1,
          performance: 67,
          revenus: 95000,
          revenusEvolution: '-23.1%',
          statut: 'attention',
          topPerformer: false,
          probleme: 'Activité réduite'
        }
      ],
      topInfractions: [
        { type: 'Défaut d\'éclairage', nombre: 53, pourcentage: 34, evolution: '+12%' },
        { type: 'Défaut d\'assurance', nombre: 44, pourcentage: 28, evolution: '+8%' },
        { type: 'Excès de vitesse', nombre: 28, pourcentage: 18, evolution: '+15%' },
        { type: 'Téléphone au volant', nombre: 19, pourcentage: 12, evolution: '+5%' },
        { type: 'Ceinture de sécurité', nombre: 12, pourcentage: 8, evolution: '+3%' }
      ]
    },
    semaine: {
      activityData: [
        { period: 'Lun', controles: 42, conformes: 925, infractions: 15, avertissements: 16 },
        { period: 'Mar', controles: 38, conformes: 988, infractions: 12, avertissements: 20 },
        { period: 'Mer', controles: 51, conformes: 932, infractions: 18, avertissements: 21 },
        { period: 'Jeu', controles: 45, conformes: 1044, infractions: 16, avertissements: 22 },
        { period: 'Ven', controles: 47, conformes: 1088, infractions: 21, avertissements: 23 },
        { period: 'Sam', controles: 35, conformes: 962, infractions: 13, avertissements: 20 },
        { period: 'Dim', controles: 47, conformes: 1042, infractions: 19, avertissements: 16 }
      ],
      pieData: [
        { name: 'Conformes', value: 7012, color: '#10b981' },
        { name: 'Infractions', value: 1048, color: '#ef4444' },
        { name: 'Avertissements', value: 333, color: '#f59e0b' }
      ],
      stats: {
        totalControles: 8393,
        controlesEvolution: '+8.7%',
        controlesComparison: 'vs semaine dernière (7,721)',
        conformes: 7012,
        conformesEvolution: '+7.5%',
        conformesComparison: 'vs semaine dernière (6,523)',
        infractions: 1048,
        infractionsEvolution: '+14.3%',
        infractionsComparison: 'vs semaine dernière (917)',
        avertissements: 333,
        avertissementsEvolution: '+12.8%',
        avertissementsComparison: 'vs semaine dernière (295)',
        revenus: '60.1M',
        revenusEvolution: '+11.3%',
        revenusComparison: 'vs semaine dernière (54.0M)',
        tauxConformite: '83.5%',
        tauxConformiteEvolution: '+1.8%',
        tauxConformiteComparison: 'vs semaine dernière (81.7%)',
        agentsActifs: '289/342',
        agentsEvolution: '84.5% opérationnel',
        moyenneParAgent: '29.0',
        moyenneEvolution: '+2.1 vs semaine dernière'
      },
      topAgents: [
        {
          nom: 'KOUAME Jean',
          matricule: 'AG-2023-045',
          commissariat: '3ème Arrondissement',
          controles: 328,
          conformes: 273,
          infractions: 42,
          avertissements: 13,
          performance: 96,
          revenus: 2380000,
          revenusEvolution: '+18.5%',
          statut: 'excellent',
          topPerformer: true
        },
        {
          nom: 'DIALLO Mamadou',
          matricule: 'AG-2023-078',
          commissariat: '5ème Arrondissement',
          controles: 312,
          conformes: 258,
          infractions: 39,
          avertissements: 15,
          performance: 93,
          revenus: 2190000,
          revenusEvolution: '+12.3%',
          statut: 'excellent',
          topPerformer: false
        },
        {
          nom: 'KONE Ibrahim',
          matricule: 'AG-2023-112',
          commissariat: '7ème Arrondissement',
          controles: 84,
          conformes: 58,
          infractions: 19,
          avertissements: 7,
          performance: 69,
          revenus: 665000,
          revenusEvolution: '-19.8%',
          statut: 'attention',
          topPerformer: false,
          probleme: 'Performance en baisse'
        }
      ],
      topInfractions: [
        { type: 'Défaut d\'éclairage', nombre: 356, pourcentage: 34, evolution: '+10%' },
        { type: 'Défaut d\'assurance', nombre: 293, pourcentage: 28, evolution: '+12%' },
        { type: 'Excès de vitesse', nombre: 189, pourcentage: 18, evolution: '+18%' },
        { type: 'Téléphone au volant', nombre: 126, pourcentage: 12, evolution: '+8%' },
        { type: 'Ceinture de sécurité', nombre: 84, pourcentage: 8, evolution: '+5%' }
      ]
    },
    mois: {
      activityData: [
        { period: 'Sem 1', controles: 7234, conformes: 6043, infractions: 1089, avertissements: 102 },
        { period: 'Sem 2', controles: 7891, conformes: 6589, infractions: 1156, avertissements: 146 },
        { period: 'Sem 3', controles: 8156, conformes: 6806, infractions: 1234, avertissements: 116 },
        { period: 'Sem 4', controles: 8393, conformes: 7012, infractions: 1274, avertissements: 107 }
      ],
      pieData: [
        { name: 'Conformes', value: 26458, color: '#10b981' },
        { name: 'Infractions', value: 3956, color: '#ef4444' },
        { name: 'Avertissements', value: 1260, color: '#f59e0b' }
      ],
      stats: {
        totalControles: 31674,
        controlesEvolution: '+5.2%',
        controlesComparison: 'vs mois dernier (30,104)',
        conformes: 26458,
        conformesEvolution: '+4.8%',
        conformesComparison: 'vs mois dernier (25,245)',
        infractions: 3956,
        infractionsEvolution: '+8.9%',
        infractionsComparison: 'vs mois dernier (3,634)',
        avertissements: 1260,
        avertissementsEvolution: '+7.2%',
        avertissementsComparison: 'vs mois dernier (1,175)',
        revenus: '228.6M',
        revenusEvolution: '+7.8%',
        revenusComparison: 'vs mois dernier (212.1M)',
        tauxConformite: '83.5%',
        tauxConformiteEvolution: '+4.2%',
        tauxConformiteComparison: 'vs mois dernier (79.3%)',
        agentsActifs: '289/342',
        agentsEvolution: '84.5% opérationnel',
        moyenneParAgent: '109.6',
        moyenneEvolution: '+5.8 vs mois dernier'
      },
      topAgents: [
        {
          nom: 'KOUAME Jean',
          matricule: 'AG-2023-045',
          commissariat: '3ème Arrondissement',
          controles: 1410,
          conformes: 1175,
          infractions: 178,
          avertissements: 57,
          performance: 95,
          revenus: 10200000,
          revenusEvolution: '+16.7%',
          statut: 'excellent',
          topPerformer: true
        },
        {
          nom: 'DIALLO Mamadou',
          matricule: 'AG-2023-078',
          commissariat: '5ème Arrondissement',
          controles: 1298,
          conformes: 1082,
          infractions: 164,
          avertissements: 52,
          performance: 92,
          revenus: 9100000,
          revenusEvolution: '+13.2%',
          statut: 'excellent',
          topPerformer: false
        },
        {
          nom: 'ASSANE Fatou',
          matricule: 'AG-2023-089',
          commissariat: '15ème Arrondissement',
          controles: 445,
          conformes: 316,
          infractions: 97,
          avertissements: 32,
          performance: 71,
          revenus: 2800000,
          revenusEvolution: '-15.4%',
          statut: 'attention',
          topPerformer: false,
          probleme: 'Besoin de formation'
        }
      ],
      topInfractions: [
        { type: 'Défaut d\'éclairage', nombre: 1345, pourcentage: 34, evolution: '+9%' },
        { type: 'Défaut d\'assurance', nombre: 1108, pourcentage: 28, evolution: '+11%' },
        { type: 'Excès de vitesse', nombre: 712, pourcentage: 18, evolution: '+14%' },
        { type: 'Téléphone au volant', nombre: 475, pourcentage: 12, evolution: '+7%' },
        { type: 'Ceinture de sécurité', nombre: 316, pourcentage: 8, evolution: '+4%' }
      ]
    },
    annee: {
      activityData: [
        { period: 'Jan', controles: 28450, conformes: 23756, infractions: 4267, avertissements: 427 },
        { period: 'Fév', controles: 26890, conformes: 22445, infractions: 4012, avertissements: 433 },
        { period: 'Mar', controles: 30234, conformes: 25234, infractions: 4589, avertissements: 411 },
        { period: 'Avr', controles: 29567, conformes: 24678, infractions: 4421, avertissements: 468 },
        { period: 'Mai', controles: 31245, conformes: 26078, infractions: 4734, avertissements: 433 },
        { period: 'Juin', controles: 30891, conformes: 25789, infractions: 4678, avertissements: 424 },
        { period: 'Juil', controles: 32156, conformes: 26845, infractions: 4867, avertissements: 444 },
        { period: 'Août', controles: 31789, conformes: 26534, infractions: 4812, avertissements: 443 },
        { period: 'Sep', controles: 30456, conformes: 25423, infractions: 4601, avertissements: 432 },
        { period: 'Oct', controles: 31674, conformes: 26458, infractions: 4789, avertissements: 427 }
      ],
      pieData: [
        { name: 'Conformes', value: 253394, color: '#10b981' },
        { name: 'Infractions', value: 37900, color: '#ef4444' },
        { name: 'Avertissements', value: 12058, color: '#f59e0b' }
      ],
      stats: {
        totalControles: 303352,
        controlesEvolution: '+6.8%',
        controlesComparison: 'vs année dernière (284,031)',
        conformes: 253394,
        conformesEvolution: '+7.2%',
        conformesComparison: 'vs année dernière (236,345)',
        infractions: 37900,
        infractionsEvolution: '+5.8%',
        infractionsComparison: 'vs année dernière (35,823)',
        avertissements: 12058,
        avertissementsEvolution: '+4.5%',
        avertissementsComparison: 'vs année dernière (11,542)',
        revenus: '2.2Mrd',
        revenusEvolution: '+9.2%',
        revenusComparison: 'vs année dernière (2.0Mrd)',
        tauxConformite: '82.5%',
        tauxConformiteEvolution: '+8.3%',
        tauxConformiteComparison: 'vs année dernière (74.2%)',
        agentsActifs: '289/342',
        agentsEvolution: '84.5% opérationnel',
        moyenneParAgent: '1,049.8',
        moyenneEvolution: '+45 vs année dernière'
      },
      topAgents: [
        {
          nom: 'KOUAME Jean',
          matricule: 'AG-2023-045',
          commissariat: '3ème Arrondissement',
          controles: 14320,
          conformes: 11947,
          infractions: 1795,
          avertissements: 578,
          performance: 94,
          revenus: 122500000,
          revenusEvolution: '+19.8%',
          statut: 'excellent',
          topPerformer: true
        },
        {
          nom: 'DIALLO Mamadou',
          matricule: 'AG-2023-078',
          commissariat: '5ème Arrondissement',
          controles: 13890,
          conformes: 11584,
          infractions: 1734,
          avertissements: 572,
          performance: 91,
          revenus: 115700000,
          revenusEvolution: '+15.3%',
          statut: 'excellent',
          topPerformer: false
        },
        {
          nom: 'KOUASSI Jean',
          matricule: 'AG-2023-156',
          commissariat: '12ème Arrondissement',
          controles: 7234,
          conformes: 5281,
          infractions: 1445,
          avertissements: 508,
          performance: 73,
          revenus: 48900000,
          revenusEvolution: '-8.7%',
          statut: 'attention',
          topPerformer: false,
          probleme: 'Zone difficile'
        }
      ],
      topInfractions: [
        { type: 'Défaut d\'éclairage', nombre: 12886, pourcentage: 34, evolution: '+8%' },
        { type: 'Défaut d\'assurance', nombre: 10612, pourcentage: 28, evolution: '+10%' },
        { type: 'Excès de vitesse', nombre: 6822, pourcentage: 18, evolution: '+12%' },
        { type: 'Téléphone au volant', nombre: 4548, pourcentage: 12, evolution: '+6%' },
        { type: 'Ceinture de sécurité', nombre: 3032, pourcentage: 8, evolution: '+3%' }
      ]
    },
    tout: {
      activityData: [
        { period: '2020', controles: 245678, conformes: 196542, infractions: 36851, avertissements: 12285 },
        { period: '2021', controles: 268934, conformes: 215147, infractions: 40340, avertissements: 13447 },
        { period: '2022', controles: 284031, conformes: 227225, infractions: 42604, avertissements: 14202 },
        { period: '2023', controles: 296845, conformes: 237476, infractions: 44526, avertissements: 14843 },
        { period: '2024', controles: 303352, conformes: 253394, infractions: 45502, avertissements: 15456 }
      ],
      pieData: [
        { name: 'Conformes', value: 1168014, color: '#10b981' },
        { name: 'Infractions', value: 174699, color: '#ef4444' },
        { name: 'Avertissements', value: 56127, color: '#f59e0b' }
      ],
      stats: {
        totalControles: 1398840,
        controlesEvolution: '+23.5%',
        controlesComparison: 'depuis 2020',
        conformes: 1168014,
        conformesEvolution: '+28.9%',
        conformesComparison: 'depuis 2020',
        infractions: 174699,
        infractionsEvolution: '+23.5%',
        infractionsComparison: 'depuis 2020',
        avertissements: 56127,
        avertissementsEvolution: '+25.8%',
        avertissementsComparison: 'depuis 2020',
        revenus: '10.1Mrd',
        revenusEvolution: '+23.7%',
        revenusComparison: 'depuis 2020',
        tauxConformite: '83.5%',
        tauxConformiteEvolution: '+15.6%',
        tauxConformiteComparison: 'depuis 2020',
        agentsActifs: '289/342',
        agentsEvolution: '84.5% opérationnel',
        moyenneParAgent: '4,839.2',
        moyenneEvolution: '+97 depuis 2020'
      },
      topAgents: [
        {
          nom: 'KOUAME Jean',
          matricule: 'AG-2023-045',
          commissariat: '3ème Arrondissement',
          controles: 68945,
          conformes: 57469,
          infractions: 8683,
          avertissements: 2793,
          performance: 93,
          revenus: 567800000,
          revenusEvolution: '+28.4%',
          statut: 'excellent',
          topPerformer: true
        },
        {
          nom: 'DIALLO Mamadou',
          matricule: 'AG-2023-078',
          commissariat: '5ème Arrondissement',
          controles: 64128,
          conformes: 53467,
          infractions: 8058,
          avertissements: 2603,
          performance: 90,
          revenus: 523600000,
          revenusEvolution: '+24.9%',
          statut: 'excellent',
          topPerformer: false
        },
        {
          nom: 'KONE Ibrahim',
          matricule: 'AG-2023-112',
          commissariat: '18ème Arrondissement',
          controles: 42567,
          conformes: 32351,
          infractions: 7685,
          avertissements: 2531,
          performance: 76,
          revenus: 312400000,
          revenusEvolution: '+12.1%',
          statut: 'attention',
          topPerformer: false,
          probleme: 'Zone étendue'
        }
      ],
      topInfractions: [
        { type: 'Défaut d\'éclairage', nombre: 59398, pourcentage: 34, evolution: '+28%' },
        { type: 'Défaut d\'assurance', nombre: 48916, pourcentage: 28, evolution: '+25%' },
        { type: 'Excès de vitesse', nombre: 31446, pourcentage: 18, evolution: '+32%' },
        { type: 'Téléphone au volant', nombre: 20964, pourcentage: 12, evolution: '+15%' },
        { type: 'Ceinture de sécurité', nombre: 13976, pourcentage: 8, evolution: '+8%' }
      ]
    },
    personnalise: {
      activityData: [
        { period: '10/10', controles: 1123, conformes: 938, infractions: 169, avertissements: 16 },
        { period: '11/10', controles: 1201, conformes: 1003, infractions: 182, avertissements: 16 },
        { period: '12/10', controles: 1089, conformes: 928, infractions: 145, avertissements: 16 },
        { period: '13/10', controles: 1278, conformes: 1059, infractions: 203, avertissements: 16 },
        { period: '14/10', controles: 1345, conformes: 1101, infractions: 228, avertissements: 16 }
      ],
      pieData: [
        { name: 'Conformes', value: 5042, color: '#10b981' },
        { name: 'Infractions', value: 756, color: '#ef4444' },
        { name: 'Avertissements', value: 238, color: '#f59e0b' }
      ],
      stats: {
        totalControles: 6036,
        controlesEvolution: '+9.8%',
        controlesComparison: 'période personnalisée',
        conformes: 5042,
        conformesEvolution: '+9.2%',
        conformesComparison: 'période personnalisée',
        infractions: 756,
        infractionsEvolution: '+12.4%',
        infractionsComparison: 'période personnalisée',
        avertissements: 238,
        avertissementsEvolution: '+8.7%',
        avertissementsComparison: 'période personnalisée',
        revenus: '43.6M',
        revenusEvolution: '+10.2%',
        revenusComparison: 'période personnalisée',
        tauxConformite: '83.5%',
        tauxConformiteEvolution: '+5.1%',
        tauxConformiteComparison: 'période personnalisée',
        agentsActifs: '289/342',
        agentsEvolution: '84.5% opérationnel',
        moyenneParAgent: '20.9',
        moyenneEvolution: 'période personnalisée'
      },
      topAgents: [
        {
          nom: 'KOUAME Jean',
          matricule: 'AG-2023-045',
          commissariat: '3ème Arrondissement',
          controles: 226,
          conformes: 188,
          infractions: 29,
          avertissements: 9,
          performance: 96,
          revenus: 1640000,
          revenusEvolution: '+17.2%',
          statut: 'excellent',
          topPerformer: true
        },
        {
          nom: 'DIALLO Mamadou',
          matricule: 'AG-2023-078',
          commissariat: '5ème Arrondissement',
          controles: 198,
          conformes: 165,
          infractions: 25,
          avertissements: 8,
          performance: 93,
          revenus: 1420000,
          revenusEvolution: '+11.8%',
          statut: 'excellent',
          topPerformer: false
        },
        {
          nom: 'KONE Ibrahim',
          matricule: 'AG-2023-112',
          commissariat: '10ème Arrondissement',
          controles: 58,
          conformes: 39,
          infractions: 14,
          avertissements: 5,
          performance: 68,
          revenus: 475000,
          revenusEvolution: '-21.5%',
          statut: 'attention',
          topPerformer: false,
          probleme: 'Performance insuffisante'
        }
      ],
      topInfractions: [
        { type: 'Défaut d\'éclairage', nombre: 257, pourcentage: 34, evolution: '+11%' },
        { type: 'Défaut d\'assurance', nombre: 212, pourcentage: 28, evolution: '+9%' },
        { type: 'Excès de vitesse', nombre: 136, pourcentage: 18, evolution: '+13%' },
        { type: 'Téléphone au volant', nombre: 91, pourcentage: 12, evolution: '+7%' },
        { type: 'Ceinture de sécurité', nombre: 60, pourcentage: 8, evolution: '+5%' }
      ]
    }
  }

  const currentData = isCustomDateRange ? dataByPeriod.personnalise : dataByPeriod[globalFilter]
  
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

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const COLORS = ['#10b981', '#ef4444', '#f59e0b']

  useEffect(() => {
    setIsMounted(true)
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Filtre Global en haut */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
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
                  <p className="text-gray-600 text-xs md:text-sm hidden sm:block">Sélectionnez la période pour filtrer toutes les données du dashboard</p>
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
                  Tout
                </Button>
              </div>
            </div>

            {/* Sélection de dates personnalisées - responsive */}
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

              {/* Séparateur visuel */}
              <div className="hidden sm:block w-px h-8 bg-blue-300"></div>

              {/* Boutons Imprimer et Exporter */}
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
            
            {/* Badge de confirmation - responsive */}
            {isCustomDateRange && (
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg w-full sm:w-auto">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs md:text-sm font-medium">Période personnalisée active</span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Statistiques principales - 8 cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total contrôles */}
        <Card className="border-t-4 border-blue-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-600 text-sm font-medium">TOTAL CONTRÔLES</h3>
                <h4 className="text-gray-600 text-sm">
                  ({isCustomDateRange ? 'PERSONNALISÉ' : globalFilter === 'jour' ? '24H' : globalFilter.toUpperCase()})
                </h4>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{formatNumber(currentData.stats.totalControles)}</div>
            <div className="text-green-600 text-sm font-bold mb-4">{currentData.stats.controlesEvolution} {currentData.stats.controlesComparison}</div>
            
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-blue-600" />
                <span>Contrôles effectués sur la période</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Conformes */}
        <Card className="border-t-4 border-green-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-600 text-sm font-medium">CONFORMES</h3>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{formatNumber(currentData.stats.conformes)}</div>
            <div className="text-green-600 text-sm font-bold mb-4">{currentData.stats.conformesEvolution} {currentData.stats.conformesComparison}</div>
            
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{((currentData.stats.conformes/currentData.stats.totalControles)*100).toFixed(1)}% du total</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Infractions */}
        <Card className="border-t-4 border-red-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-600 text-sm font-medium">INFRACTIONS</h3>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{formatNumber(currentData.stats.infractions)}</div>
            <div className="text-red-600 text-sm font-bold mb-4">{currentData.stats.infractionsEvolution} {currentData.stats.infractionsComparison}</div>
            
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>{((currentData.stats.infractions/currentData.stats.totalControles)*100).toFixed(1)}% du total</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Avertissements */}
        <Card className="border-t-4 border-yellow-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-600 text-sm font-medium">AVERTISSEMENTS</h3>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{formatNumber(currentData.stats.avertissements)}</div>
            <div className="text-yellow-600 text-sm font-bold mb-4">{currentData.stats.avertissementsEvolution} {currentData.stats.avertissementsComparison}</div>
            
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>{((currentData.stats.avertissements/currentData.stats.totalControles)*100).toFixed(1)}% du total</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Revenus */}
        <Card className="border-t-4 border-purple-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-600 text-sm font-medium">REVENUS GÉNÉRÉS</h3>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats.revenus}</div>
            <div className="text-green-600 text-sm font-bold mb-4">{currentData.stats.revenusEvolution} {currentData.stats.revenusComparison}</div>
            
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <DollarSign className="w-3 h-3 text-purple-600" />
                <span>FCFA collectés en amendes</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Taux de conformité */}
        <Card className="border-t-4 border-indigo-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-600 text-sm font-medium">TAUX DE CONFORMITÉ</h3>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats.tauxConformite}</div>
            <div className="text-green-600 text-sm font-bold mb-4">{currentData.stats.tauxConformiteEvolution} {currentData.stats.tauxConformiteComparison}</div>
            
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-indigo-600" />
                <span>Véhicules conformes</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Agents actifs */}
        <Card className="border-t-4 border-orange-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-600 text-sm font-medium">AGENTS ACTIFS</h3>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats.agentsActifs}</div>
            <div className="text-green-600 text-sm font-bold mb-4">{currentData.stats.agentsEvolution}</div>
            
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-orange-600" />
                <span>Agents déployés sur le terrain</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Moyenne par agent */}
        <Card className="border-t-4 border-cyan-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-600 text-sm font-medium">MOYENNE PAR AGENT</h3>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                <Car className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats.moyenneParAgent}</div>
            <div className="text-green-600 text-sm font-bold mb-4">{currentData.stats.moyenneEvolution}</div>
            
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Target className="w-3 h-3 text-cyan-600" />
                <span>Contrôles effectués par agent</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Section principale avec graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique activité */}
        <Card className="lg:col-span-2">
          <CardBody className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Activité des 7 derniers jours
            </h3>
         
            
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
                      formatter={(value) => {
                        if (value === 'controles') return 'Contrôles effectués';
                        if (value === 'infractions') return 'Infractions détectées';
                        return value;
                      }}
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
                      fill="#F48686" 
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

        {/* Graphique camembert */}
        <Card>
          <CardBody className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Répartition des Statuts - {
                isCustomDateRange ? `${dateDebut} au ${dateFin}` :
                globalFilter === 'jour' ? 'Aujourd\'hui' : 
                globalFilter === 'semaine' ? 'Cette Semaine' : 
                globalFilter === 'mois' ? 'Ce Mois' : 
                globalFilter === 'annee' ? 'Cette Année' : 
                'Historique Complet'
              }
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
                      label={(entry: any) => `${(entry.percent * 100).toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
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

      {/* Top infractions */}
      <Card>
        <CardBody className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Top 5 Infractions Constatées</h3>

          <div className="space-y-4">
            {currentData.topInfractions.map((infraction, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="font-bold text-gray-700">{index + 1}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{infraction.type}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">{formatNumber(infraction.nombre)} cas</span>
                      <span className="text-sm font-medium text-green-600">{infraction.evolution}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${infraction.pourcentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Performance des agents - Top 3 */}
      <Card>
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Performance des Agents - Top 3</h3>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Voir tous les agents
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentData.topAgents.map((agent, index) => (
              <Card 
                key={agent.matricule}
                className={`border-2 ${
                  agent.statut === 'excellent' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
                } relative`}
              >
                <CardBody className="p-6">
                  {agent.topPerformer && (
                    <div className="absolute -top-3 left-6">
                      <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        TOP PERFORMER
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-4 mt-2">
                    <div>
                      <h4 className="font-bold text-lg flex items-center gap-2">
                        {agent.topPerformer ? (
                          <Trophy className="w-5 h-5 text-yellow-600" />
                        ) : agent.statut === 'excellent' ? (
                          <Star className="w-5 h-5 text-blue-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        )}
                        {agent.nom}
                      </h4>
                      <p className="text-sm text-gray-600">{agent.matricule}</p>
                      <p className="text-xs text-gray-500">{agent.commissariat}</p>
                    </div>
                    <span className={`${
                      agent.statut === 'excellent' ? 'bg-green-500' : 'bg-yellow-500'
                    } text-white px-3 py-1 rounded-full text-xs font-bold`}>
                      {agent.statut === 'excellent' ? 'EXCELLENT' : 'ATTENTION'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center mb-4">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">{agent.controles}</div>
                      <div className="text-xs text-gray-600">CONTRÔLES</div>
                    </div>
                    <div>
                      <div className={`text-3xl font-bold ${
                        agent.statut === 'excellent' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {agent.performance}%
                      </div>
                      <div className="text-xs text-gray-600">PERFORMANCE</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center mb-4 text-xs">
                    <div>
                      <div className="font-bold text-green-600">{agent.conformes}</div>
                      <div className="text-gray-600">Conformes</div>
                    </div>
                    <div>
                      <div className="font-bold text-red-600">{agent.infractions}</div>
                      <div className="text-gray-600">Infractions</div>
                    </div>
                    <div>
                      <div className="font-bold text-yellow-600">{agent.avertissements}</div>
                      <div className="text-gray-600">Avertissements</div>
                    </div>
                  </div>

                  <div className={`${
                    agent.statut === 'excellent' ? 'bg-green-100' : 'bg-yellow-100'
                  } rounded-lg p-3 mb-4`}>
                    <div className="text-sm">
                      <div className={`font-bold ${
                        agent.statut === 'excellent' ? 'text-green-800' : 'text-yellow-800'
                      }`}>
                        Revenus: {formatNumber(agent.revenus)} FCFA ({agent.revenusEvolution})
                      </div>
                      <div className={agent.statut === 'excellent' ? 'text-green-700' : 'text-yellow-700'}>
                        {agent.probleme ? agent.probleme : `Performance optimale`}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button className={`flex-1 ${
                      agent.statut === 'excellent' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-yellow-600 hover:bg-yellow-700'
                    } text-white`}>
                      {agent.statut === 'excellent' ? 'Détails' : 'Assister'}
                    </Button>
                    <Button className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-300">
                      Contacter
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}