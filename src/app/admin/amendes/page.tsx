'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus, Eye, Settings, Edit, Search,
  MapPin, Users, TrendingUp, TrendingDown, AlertTriangle, Phone, Mail,
  CheckCircle, Calendar, Clock, DollarSign, Printer, FileDown,
  Activity, Target, Shield, Award
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useRouter } from 'next/navigation'

type AmendeStatus = 'En attente' | 'Payé' | 'En retard'
type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'

type Amende = {
  id: string
  numero: string
  pv: string
  contrevenant: string
  telephone: string
  montant: number
  penalites?: number
  dateEmission: string
  dateLimite: string
  datePaiement?: string
  statut: AmendeStatus
  modePaiement?: string
  commissariat?: string
}

type Commissariat = {
  name: string
  amendes: number
  montantTotal: string
  collecte: string
  tauxCollecte: number
}

export default function AmendesAdminPage() {
  const router = useRouter()
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('mois')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Données selon la période sélectionnée
  const dataByPeriod = {
    jour: {
      activityData: [
        { period: '00h-04h', amendes: 12, collecte: 0.3, enAttente: 0.1 },
        { period: '04h-08h', amendes: 28, collecte: 0.6, enAttente: 0.2 },
        { period: '08h-12h', amendes: 156, collecte: 3.2, enAttente: 1.1 },
        { period: '12h-16h', amendes: 189, collecte: 3.7, enAttente: 1.3 },
        { period: '16h-20h', amendes: 142, collecte: 2.7, enAttente: 0.9 },
        { period: '20h-24h', amendes: 58, collecte: 1.1, enAttente: 0.4 }
      ],
      performanceData: [
        { commissariat: '3ème Arr.', tauxCollecte: 87.4, amendes: 234 },
        { commissariat: '5ème Arr.', tauxCollecte: 82.1, amendes: 198 },
        { commissariat: '10ème Arr.', tauxCollecte: 79.6, amendes: 167 },
        { commissariat: '7ème Arr.', tauxCollecte: 76.8, amendes: 156 }
      ],
      pieData: [
        { name: 'Payé', value: 68, color: '#10b981' },
        { name: 'En attente', value: 20, color: '#f59e0b' },
        { name: 'En retard', value: 12, color: '#ef4444' }
      ],
      amendes: [
        {
          id: '1',
          numero: '#AMN-2025-0892',
          pv: 'PV-2025-0892',
          contrevenant: 'TRAORE Moussa',
          telephone: '+225 0708765432',
          montant: 45000,
          dateEmission: '10/10/2025',
          dateLimite: '10/11/2025',
          statut: 'En attente' as AmendeStatus,
          commissariat: '3ème Arrondissement'
        },
        {
          id: '2',
          numero: '#AMN-2025-0891',
          pv: 'PV-2025-0891',
          contrevenant: 'BAMBA Issa',
          telephone: '+225 0701234567',
          montant: 5000,
          dateEmission: '10/10/2025',
          dateLimite: '10/11/2025',
          datePaiement: '10/10/2025',
          statut: 'Payé' as AmendeStatus,
          modePaiement: 'Mobile Money',
          commissariat: '5ème Arrondissement'
        },
        {
          id: '3',
          numero: '#AMN-2025-0890',
          pv: 'PV-2025-0890',
          contrevenant: 'DIABATE Aminata',
          telephone: '+225 0709876543',
          montant: 35000,
          dateEmission: '10/10/2025',
          dateLimite: '10/11/2025',
          statut: 'En attente' as AmendeStatus,
          commissariat: '10ème Arrondissement'
        }
      ],
      stats: {
        montantTotal: 2.5,
        collecte: 1.7,
        pourcentageCollecte: 68,
        enAttente: 0.5,
        pourcentageAttente: 20,
        enRetard: 0.3,
        pourcentageRetard: 12,
        evolutionTotal: '+12.5%',
        evolutionCollecte: '+8.3%',
        totalAmendes: 85,
        evolutionAmendes: 12.5,
        tauxPaiement: 68,
        penalitesTotales: 0.08
      },
      commissariats: [
        { name: "3ème Arrondissement", amendes: 24, montantTotal: "892K", collecte: "607K", tauxCollecte: 68 },
        { name: "5ème Arrondissement", amendes: 20, montantTotal: "745K", collecte: "504K", tauxCollecte: 68 },
        { name: "10ème Arrondissement", amendes: 18, montantTotal: "567K", collecte: "385K", tauxCollecte: 68 },
        { name: "7ème Arrondissement", amendes: 23, montantTotal: "803K", collecte: "546K", tauxCollecte: 68 }
      ]
    },
    semaine: {
      activityData: [
        { period: 'Lun', amendes: 567, collecte: 13.2, enAttente: 4.1 },
        { period: 'Mar', amendes: 612, collecte: 14.3, enAttente: 4.5 },
        { period: 'Mer', amendes: 589, collecte: 13.8, enAttente: 4.3 },
        { period: 'Jeu', amendes: 639, collecte: 14.9, enAttente: 4.7 },
        { period: 'Ven', amendes: 685, collecte: 16.0, enAttente: 5.0 },
        { period: 'Sam', amendes: 503, collecte: 11.7, enAttente: 3.7 },
        { period: 'Dim', amendes: 403, collecte: 9.4, enAttente: 2.9 }
      ],
      performanceData: [
        { commissariat: '3ème Arr.', tauxCollecte: 86.8, amendes: 1645 },
        { commissariat: '5ème Arr.', tauxCollecte: 81.4, amendes: 1389 },
        { commissariat: '10ème Arr.', tauxCollecte: 78.9, amendes: 1167 },
        { commissariat: '7ème Arr.', tauxCollecte: 75.2, amendes: 1098 }
      ],
      pieData: [
        { name: 'Payé', value: 67.7, color: '#10b981' },
        { name: 'En attente', value: 20.6, color: '#f59e0b' },
        { name: 'En retard', value: 11.7, color: '#ef4444' }
      ],
      amendes: [
        {
          id: '1',
          numero: '#AMN-2025-0765',
          pv: 'PV-2025-0765',
          contrevenant: 'BAMBA Sylvain',
          telephone: '+225 0702345678',
          montant: 40000,
          dateEmission: '24/09/2025',
          dateLimite: '24/10/2025',
          datePaiement: '26/09/2025',
          statut: 'Payé' as AmendeStatus,
          modePaiement: 'Carte Bancaire',
          commissariat: '3ème Arrondissement'
        },
        {
          id: '2',
          numero: '#AMN-2025-0766',
          pv: 'PV-2025-0766',
          contrevenant: 'TRAORE Fatou',
          telephone: '+225 0703456789',
          montant: 8000,
          dateEmission: '25/09/2025',
          dateLimite: '25/10/2025',
          statut: 'En attente' as AmendeStatus,
          commissariat: '5ème Arrondissement'
        },
        {
          id: '3',
          numero: '#AMN-2025-0767',
          pv: 'PV-2025-0767',
          contrevenant: 'KOFFI Marie',
          telephone: '+225 0704567890',
          montant: 55000,
          penalites: 5500,
          dateEmission: '22/09/2025',
          dateLimite: '22/09/2025',
          statut: 'En retard' as AmendeStatus,
          commissariat: '10ème Arrondissement'
        }
      ],
      stats: {
        montantTotal: 18.9,
        collecte: 12.8,
        pourcentageCollecte: 67.7,
        enAttente: 3.9,
        pourcentageAttente: 20.6,
        enRetard: 2.2,
        pourcentageRetard: 11.7,
        evolutionTotal: '+9.8%',
        evolutionCollecte: '+11.2%',
        totalAmendes: 587,
        evolutionAmendes: 9.8,
        tauxPaiement: 67.7,
        penalitesTotales: 0.56
      },
      commissariats: [
        { name: "3ème Arrondissement", amendes: 165, montantTotal: "6.2M", collecte: "4.2M", tauxCollecte: 68 },
        { name: "5ème Arrondissement", amendes: 142, montantTotal: "5.3M", collecte: "3.6M", tauxCollecte: 68 },
        { name: "10ème Arrondissement", amendes: 123, montantTotal: "4.1M", collecte: "2.8M", tauxCollecte: 68 },
        { name: "7ème Arrondissement", amendes: 157, montantTotal: "5.8M", collecte: "3.9M", tauxCollecte: 68 }
      ]
    },
    mois: {
      activityData: [
        { period: 'Sem 1', amendes: 1892, collecte: 55.2, enAttente: 17.3 },
        { period: 'Sem 2', amendes: 2045, collecte: 57.7, enAttente: 18.1 },
        { period: 'Sem 3', amendes: 1967, collecte: 55.5, enAttente: 17.4 },
        { period: 'Sem 4', amendes: 2134, collecte: 59.7, enAttente: 18.7 }
      ],
      performanceData: [
        { commissariat: '3ème Arr.', tauxCollecte: 85.9, amendes: 6874 },
        { commissariat: '5ème Arr.', tauxCollecte: 80.8, amendes: 5892 },
        { commissariat: '10ème Arr.', tauxCollecte: 78.1, amendes: 5234 },
        { commissariat: '7ème Arr.', tauxCollecte: 74.5, amendes: 4987 }
      ],
      pieData: [
        { name: 'Payé', value: 68, color: '#10b981' },
        { name: 'En attente', value: 20.5, color: '#f59e0b' },
        { name: 'En retard', value: 11.5, color: '#ef4444' }
      ],
      amendes: [
        {
          id: '1',
          numero: '#AMN-2025-0892',
          pv: 'PV-2025-0892',
          contrevenant: 'TRAORE Moussa',
          telephone: '+225 0708765432',
          montant: 45000,
          dateEmission: '25/09/2025',
          dateLimite: '25/10/2025',
          statut: 'En attente' as AmendeStatus,
          commissariat: '3ème Arrondissement'
        },
        {
          id: '2',
          numero: '#AMN-2025-0891',
          pv: 'PV-2025-0891',
          contrevenant: 'BAMBA Issa',
          telephone: '+225 0701234567',
          montant: 5000,
          dateEmission: '25/09/2025',
          dateLimite: '25/10/2025',
          datePaiement: '25/09/2025',
          statut: 'Payé' as AmendeStatus,
          modePaiement: 'Mobile Money',
          commissariat: '5ème Arrondissement'
        },
        {
          id: '3',
          numero: '#AMN-2025-0850',
          pv: 'PV-2025-0850',
          contrevenant: 'YAO Kouadio',
          telephone: '+225 0701234567',
          montant: 75000,
          penalites: 7500,
          dateEmission: '20/08/2025',
          dateLimite: '20/09/2025',
          statut: 'En retard' as AmendeStatus,
          commissariat: '10ème Arrondissement'
        }
      ],
      stats: {
        montantTotal: 67.3,
        collecte: 45.7,
        pourcentageCollecte: 68,
        enAttente: 13.8,
        pourcentageAttente: 20.5,
        enRetard: 7.8,
        pourcentageRetard: 11.5,
        evolutionTotal: '+7.2%',
        evolutionCollecte: '+9.8%',
        totalAmendes: 2456,
        evolutionAmendes: 7.2,
        tauxPaiement: 68,
        penalitesTotales: 2.1
      },
      commissariats: [
        { name: "3ème Arrondissement", amendes: 687, montantTotal: "23.4M", collecte: "15.9M", tauxCollecte: 68 },
        { name: "5ème Arrondissement", amendes: 592, montantTotal: "19.8M", collecte: "13.5M", tauxCollecte: 68 },
        { name: "10ème Arrondissement", amendes: 534, montantTotal: "16.7M", collecte: "11.4M", tauxCollecte: 68 },
        { name: "7ème Arrondissement", amendes: 643, montantTotal: "21.9M", collecte: "14.9M", tauxCollecte: 68 }
      ]
    },
    annee: {
      activityData: [
        { period: 'Jan', amendes: 1567, collecte: 164.9, enAttente: 51.7 },
        { period: 'Fév', amendes: 1345, collecte: 149.4, enAttente: 46.8 },
        { period: 'Mar', amendes: 1789, collecte: 180.5, enAttente: 56.6 },
        { period: 'Avr', amendes: 1678, collecte: 172.7, enAttente: 54.1 },
        { period: 'Mai', amendes: 1891, collecte: 188.2, enAttente: 59.0 },
        { period: 'Juin', amendes: 1845, collecte: 181.6, enAttente: 56.9 },
        { period: 'Juil', amendes: 1956, collecte: 195.0, enAttente: 61.1 },
        { period: 'Août', amendes: 1834, collecte: 187.1, enAttente: 58.6 },
        { period: 'Sep', amendes: 1689, collecte: 176.3, enAttente: 55.3 },
        { period: 'Oct', amendes: 2005, collecte: 198.8, enAttente: 62.3 }
      ],
      performanceData: [
        { commissariat: '3ème Arr.', tauxCollecte: 84.8, amendes: 82456 },
        { commissariat: '5ème Arr.', tauxCollecte: 79.5, amendes: 70892 },
        { commissariat: '10ème Arr.', tauxCollecte: 77.2, amendes: 62345 },
        { commissariat: '7ème Arr.', tauxCollecte: 73.8, amendes: 58234 }
      ],
      pieData: [
        { name: 'Payé', value: 68, color: '#10b981' },
        { name: 'En attente', value: 20.5, color: '#f59e0b' },
        { name: 'En retard', value: 11.5, color: '#ef4444' }
      ],
      amendes: [
        {
          id: '1',
          numero: '#AMN-2025-0123',
          pv: 'PV-2025-0123',
          contrevenant: 'KOFFI Armand',
          telephone: '+225 0705556789',
          montant: 60000,
          dateEmission: '12/02/2025',
          dateLimite: '12/03/2025',
          datePaiement: '15/02/2025',
          statut: 'Payé' as AmendeStatus,
          modePaiement: 'Virement Bancaire',
          commissariat: '3ème Arrondissement'
        },
        {
          id: '2',
          numero: '#AMN-2025-0124',
          pv: 'PV-2025-0124',
          contrevenant: 'TRAORE Salimata',
          telephone: '+225 0706667890',
          montant: 10000,
          dateEmission: '20/03/2025',
          dateLimite: '20/04/2025',
          statut: 'En attente' as AmendeStatus,
          commissariat: '5ème Arrondissement'
        },
        {
          id: '3',
          numero: '#AMN-2025-0125',
          pv: 'PV-2025-0125',
          contrevenant: 'COULIBALY Seydou',
          telephone: '+225 0707778901',
          montant: 45000,
          penalites: 13500,
          dateEmission: '15/01/2025',
          dateLimite: '15/02/2025',
          statut: 'En retard' as AmendeStatus,
          commissariat: '10ème Arrondissement'
        }
      ],
      stats: {
        montantTotal: 678.5,
        collecte: 461.4,
        pourcentageCollecte: 68,
        enAttente: 139.1,
        pourcentageAttente: 20.5,
        enRetard: 77.9,
        pourcentageRetard: 11.5,
        evolutionTotal: '+14.3%',
        evolutionCollecte: '+18.7%',
        totalAmendes: 28934,
        evolutionAmendes: 14.3,
        tauxPaiement: 68,
        penalitesTotales: 23.4
      },
      commissariats: [
        { name: "3ème Arrondissement", amendes: 8124, montantTotal: "236M", collecte: "161M", tauxCollecte: 68 },
        { name: "5ème Arrondissement", amendes: 7089, montantTotal: "198M", collecte: "135M", tauxCollecte: 68 },
        { name: "10ème Arrondissement", amendes: 6234, montantTotal: "167M", collecte: "114M", tauxCollecte: 68 },
        { name: "7ème Arrondissement", amendes: 7487, montantTotal: "219M", collecte: "149M", tauxCollecte: 68 }
      ]
    },
    tout: {
      activityData: [
        { period: '2020', amendes: 87654, collecte: 6135.8, enAttente: 1923.5 },
        { period: '2021', amendes: 96789, collecte: 6775.2, enAttente: 2125.0 },
        { period: '2022', amendes: 103456, collecte: 7242.0, enAttente: 2270.6 },
        { period: '2023', amendes: 107623, collecte: 7533.6, enAttente: 2362.5 },
        { period: '2024', amendes: 115849, collecte: 8109.5, enAttente: 2543.4 }
      ],
      performanceData: [
        { commissariat: '3ème Arr.', tauxCollecte: 83.5, amendes: 350678 },
        { commissariat: '5ème Arr.', tauxCollecte: 78.2, amendes: 304567 },
        { commissariat: '10ème Arr.', tauxCollecte: 76.1, amendes: 278923 },
        { commissariat: '7ème Arr.', tauxCollecte: 72.5, amendes: 256789 }
      ],
      pieData: [
        { name: 'Payé', value: 68, color: '#10b981' },
        { name: 'En attente', value: 20.5, color: '#f59e0b' },
        { name: 'En retard', value: 11.5, color: '#ef4444' }
      ],
      amendes: [
        {
          id: '1',
          numero: '#AMN-2021-0034',
          pv: 'PV-2021-0034',
          contrevenant: 'DIALLO Fatoumata',
          telephone: '+225 0708889012',
          montant: 35000,
          dateEmission: '18/03/2021',
          dateLimite: '18/04/2021',
          datePaiement: '20/03/2021',
          statut: 'Payé' as AmendeStatus,
          modePaiement: 'Mobile Money',
          commissariat: '3ème Arrondissement'
        },
        {
          id: '2',
          numero: '#AMN-2022-0089',
          pv: 'PV-2022-0089',
          contrevenant: 'BAMBA Ibrahim',
          telephone: '+225 0709990123',
          montant: 5000,
          dateEmission: '22/07/2022',
          dateLimite: '22/08/2022',
          statut: 'En attente' as AmendeStatus,
          commissariat: '5ème Arrondissement'
        },
        {
          id: '3',
          numero: '#AMN-2024-0234',
          pv: 'PV-2024-0234',
          contrevenant: 'KOFFI Laurent',
          telephone: '+225 0701112345',
          montant: 47000,
          penalites: 23500,
          dateEmission: '10/01/2024',
          dateLimite: '10/02/2024',
          statut: 'En retard' as AmendeStatus,
          commissariat: '10ème Arrondissement'
        }
      ],
      stats: {
        montantTotal: 3124.8,
        collecte: 2124.9,
        pourcentageCollecte: 68,
        enAttente: 640.6,
        pourcentageAttente: 20.5,
        enRetard: 359.4,
        pourcentageRetard: 11.5,
        evolutionTotal: '+28.5%',
        evolutionCollecte: '+34.2%',
        totalAmendes: 124587,
        evolutionAmendes: 28.5,
        tauxPaiement: 68,
        penalitesTotales: 98.7
      },
      commissariats: [
        { name: "3ème Arrondissement", amendes: 35067, montantTotal: "1.1Mrd", collecte: "748M", tauxCollecte: 68 },
        { name: "5ème Arrondissement", amendes: 30456, montantTotal: "892M", collecte: "607M", tauxCollecte: 68 },
        { name: "10ème Arrondissement", amendes: 27892, montantTotal: "745M", collecte: "507M", tauxCollecte: 68 },
        { name: "7ème Arrondissement", amendes: 31172, montantTotal: "978M", collecte: "665M", tauxCollecte: 68 }
      ]
    },
    personnalise: {
      activityData: [
        { period: '10/10', amendes: 567, collecte: 13.2, enAttente: 4.1 },
        { period: '11/10', amendes: 612, collecte: 14.3, enAttente: 4.5 },
        { period: '12/10', amendes: 589, collecte: 13.8, enAttente: 4.3 },
        { period: '13/10', amendes: 639, collecte: 14.9, enAttente: 4.7 },
        { period: '14/10', amendes: 628, collecte: 14.7, enAttente: 4.6 }
      ],
      performanceData: [
        { commissariat: '3ème Arr.', tauxCollecte: 86.2, amendes: 876 },
        { commissariat: '5ème Arr.', tauxCollecte: 81.1, amendes: 763 },
        { commissariat: '10ème Arr.', tauxCollecte: 78.5, amendes: 689 },
        { commissariat: '7ème Arr.', tauxCollecte: 75.4, amendes: 612 }
      ],
      pieData: [
        { name: 'Payé', value: 67.6, color: '#10b981' },
        { name: 'En attente', value: 20.6, color: '#f59e0b' },
        { name: 'En retard', value: 11.8, color: '#ef4444' }
      ],
      amendes: [
        {
          id: '1',
          numero: '#AMN-2025-0923',
          pv: 'PV-2025-0923',
          contrevenant: 'CAMARA Adama',
          telephone: '+225 0702223456',
          montant: 43000,
          dateEmission: '11/10/2025',
          dateLimite: '11/11/2025',
          datePaiement: '12/10/2025',
          statut: 'Payé' as AmendeStatus,
          modePaiement: 'Mobile Money',
          commissariat: '3ème Arrondissement'
        },
        {
          id: '2',
          numero: '#AMN-2025-0924',
          pv: 'PV-2025-0924',
          contrevenant: 'BEUGRE Paul',
          telephone: '+225 0703334567',
          montant: 9000,
          dateEmission: '12/10/2025',
          dateLimite: '12/11/2025',
          statut: 'En attente' as AmendeStatus,
          commissariat: '5ème Arrondissement'
        },
        {
          id: '3',
          numero: '#AMN-2025-0925',
          pv: 'PV-2025-0925',
          contrevenant: 'COULIBALY Issa',
          telephone: '+225 0704445678',
          montant: 51000,
          penalites: 5100,
          dateEmission: '10/10/2025',
          dateLimite: '10/10/2025',
          statut: 'En retard' as AmendeStatus,
          commissariat: '10ème Arrondissement'
        }
      ],
      stats: {
        montantTotal: 10.2,
        collecte: 6.9,
        pourcentageCollecte: 67.6,
        enAttente: 2.1,
        pourcentageAttente: 20.6,
        enRetard: 1.2,
        pourcentageRetard: 11.8,
        evolutionTotal: '+11.2%',
        evolutionCollecte: '+13.5%',
        totalAmendes: 312,
        evolutionAmendes: 11.2,
        tauxPaiement: 67.6,
        penalitesTotales: 0.34
      },
      commissariats: [
        { name: "3ème Arrondissement", amendes: 87, montantTotal: "3.5M", collecte: "2.4M", tauxCollecte: 68 },
        { name: "5ème Arrondissement", amendes: 76, montantTotal: "2.9M", collecte: "2.0M", tauxCollecte: 68 },
        { name: "10ème Arrondissement", amendes: 68, montantTotal: "2.4M", collecte: "1.6M", tauxCollecte: 68 },
        { name: "7ème Arrondissement", amendes: 81, montantTotal: "3.2M", collecte: "2.2M", tauxCollecte: 68 }
      ]
    }
  }

  const currentData = isCustomDateRange ? dataByPeriod.personnalise : dataByPeriod[globalFilter]

  // Obtenir le top 3 des commissariats basé sur le taux de collecte
  const top3Commissariats = [...currentData.commissariats]
    .sort((a, b) => b.tauxCollecte - a.tauxCollecte)
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

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  const getStatutColor = (statut: AmendeStatus) => {
    switch (statut) {
      case 'Payé':
        return 'bg-green-500 text-white'
      case 'En attente':
        return 'bg-yellow-500 text-white'
      case 'En retard':
        return 'bg-red-500 text-white'
    }
  }

  const AmendeCard = ({ amende, rank }: { amende: Amende; rank: number }) => (
    <Card className={`border-t-[3px] ${
      amende.statut === 'Payé' ? 'border-t-green-500' : 
      amende.statut === 'En attente' ? 'border-t-yellow-500' : 
      'border-t-red-500'
    }`}>
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
                }`}>#{rank}</span>
                <h3 className="font-bold text-xl text-slate-900">{amende.numero}</h3>
              </div>
              <a href="#" className="text-blue-600 hover:text-blue-800 underline text-sm mb-2 inline-block">
                {amende.pv}
              </a>
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                <Users className="w-4 h-4" />
                {amende.contrevenant}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                <Phone className="w-4 h-4" />
                {amende.telephone}
              </div>
              {amende.commissariat && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4" />
                  {amende.commissariat}
                </div>
              )}
            </div>
          </div>
          <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatutColor(amende.statut)}`}>
            {amende.statut}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {formatNumber(amende.montant)}
            </div>
            <div className="text-sm text-slate-500">Montant FCFA</div>
          </div>
          {amende.penalites ? (
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-1">+{formatNumber(amende.penalites)}</div>
              <div className="text-sm text-slate-500">Pénalités FCFA</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-400 mb-1">-</div>
              <div className="text-sm text-slate-500">Pénalités</div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 pt-6">
          <p className="text-sm font-medium text-slate-700 mb-4">Dates importantes</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="font-bold text-sm text-slate-900">{amende.dateEmission}</div>
              <div className="text-xs text-slate-500">Émission</div>
            </div>
            <div className="text-center">
              <div className={`font-bold text-sm ${amende.statut === 'En retard' ? 'text-red-600' : 'text-slate-900'}`}>
                {amende.dateLimite}
              </div>
              <div className="text-xs text-slate-500">Limite</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-sm text-slate-900">
                {amende.datePaiement || '-'}
              </div>
              <div className="text-xs text-slate-500">Paiement</div>
            </div>
          </div>
          {amende.modePaiement && (
            <div className="mt-4 text-center">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                <DollarSign className="w-3 h-3" />
                {amende.modePaiement}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-slate-100">
          <Button 
            onClick={() => router.push(`/admin/amendes/${amende.id}`)}
            variant="primary" size="sm" className="flex-1">
            <Eye className="w-4 h-4" />
            Voir
          </Button>
          <Button variant="outline" size="sm"><Settings className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm"><Edit className="w-4 h-4" /></Button>
        </div>

        {amende.statut === 'En retard' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Amende en retard - Action requise</span>
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
        <h1 className="text-3xl font-bold text-slate-900">Amendes - Tableau de Bord National</h1>
        <p className="text-slate-600 mt-2">Vue d'ensemble et gestion de toutes les amendes du territoire</p>
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
              <h3 className="text-gray-600 text-sm font-medium">AMENDES TOTALES</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{formatNumber(currentData.stats?.totalAmendes)}</div>
            <div className="text-gray-600 text-sm font-bold">Période sélectionnée</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-purple-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">MONTANT TOTAL</h3>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">
              {globalFilter === 'tout' || globalFilter === 'annee'
                ? `${(currentData.stats.montantTotal/1000).toFixed(1)}Mrd`
                : `${currentData.stats.montantTotal}M`}
            </div>
            <div className="text-purple-600 text-sm font-bold">FCFA total</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-green-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">MONTANT COLLECTÉ</h3>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">
              {globalFilter === 'tout' || globalFilter === 'annee'
                ? `${(currentData.stats.collecte/1000).toFixed(1)}Mrd`
                : `${currentData.stats.collecte}M`}
            </div>
            <div className="text-green-600 text-sm font-bold">{currentData.stats.pourcentageCollecte}% collecté</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-yellow-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">EN ATTENTE</h3>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">
              {globalFilter === 'tout' || globalFilter === 'annee'
                ? `${(currentData.stats.enAttente/1000).toFixed(1)}Mrd`
                : `${currentData.stats.enAttente}M`}
            </div>
            <div className="text-yellow-600 text-sm font-bold">{currentData.stats.pourcentageAttente}% en attente</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-red-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">EN RETARD</h3>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">
              {globalFilter === 'tout' || globalFilter === 'annee'
                ? `${(currentData.stats.enRetard/1000).toFixed(1)}Mrd`
                : `${currentData.stats.enRetard}M`}
            </div>
            <div className="text-red-600 text-sm font-bold">{currentData.stats.pourcentageRetard}% en retard</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-teal-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">TAUX DE PAIEMENT</h3>
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-teal-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats?.tauxPaiement}%</div>
            <div className="text-teal-600 text-sm font-bold">Amendes payées</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-orange-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">PÉNALITÉS</h3>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">
              {globalFilter === 'tout' || globalFilter === 'annee'
                ? `${(currentData.stats.penalitesTotales).toFixed(1)}M`
                : `${(currentData.stats.penalitesTotales * 1000).toFixed(0)}K`}
            </div>
            <div className="text-orange-600 text-sm font-bold">FCFA pénalités</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-indigo-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">ÉVOLUTION</h3>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats?.evolutionAmendes}%</div>
            <div className="text-indigo-600 text-sm font-bold">Par rapport période précédente</div>
          </CardBody>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardBody className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Évolution des amendes et collecte</h3>
            
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
                      dataKey="amendes" 
                      fill="#6B9FED" 
                      radius={[8, 8, 0, 0]}
                      maxBarSize={50}
                      name="Amendes émises"
                      isAnimationActive={false}
                    />
                    <Bar 
                      dataKey="collecte" 
                      fill="#10B981" 
                      radius={[8, 8, 0, 0]}
                      maxBarSize={50}
                      name="Collecte (M FCFA)"
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
              Répartition des Statuts
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

      {/* Performance par commissariat */}
      <Card>
        <CardBody className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Taux de collecte par commissariat</h3>
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
                        <span className="text-sm text-slate-500 ml-2">({item.amendes} amendes)</span>
                      </div>
                      <span className="font-bold text-slate-900">{item.tauxCollecte}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${item.tauxCollecte}%` }}
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

      {/* Commissariats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentData.commissariats.map((commissariat, index) => (
          <Card key={index}>
            <CardBody className="p-6">
              <div className="mb-4">
                <h3 className="font-medium text-slate-700 text-sm mb-2">{commissariat.name}</h3>
                <div className="flex items-baseline gap-4">
                  <span className="text-3xl font-bold text-slate-900">{commissariat.amendes}</span>
                  <span className="text-2xl font-bold text-blue-600">{commissariat.tauxCollecte}%</span>
                </div>
                <p className="text-sm text-slate-500 mt-1">Amendes émises</p>
                <p className="text-xs text-slate-400 mt-2">Taux de collecte</p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-600 mb-1">Montant Total</p>
                <p className="text-lg font-bold text-slate-900">{commissariat.montantTotal} FCFA</p>
                <p className="text-xs text-green-600 mt-1">Collecté: {commissariat.collecte} FCFA</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    
    </div>
  )
}