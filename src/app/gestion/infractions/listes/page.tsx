'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Search, Calendar, Download, CheckCircle, Phone, Mail, AlertTriangle,
  TrendingUp, Clock, DollarSign, Filter, Eye, ChevronLeft, ChevronRight,
  Printer, FileDown, MapPin, FileText, Shield, Gauge, Wrench, Truck, Leaf,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'
import { infractionsService, APIInfraction, InfractionStatisticsResponse } from '@/lib/api/services'

type InfractionStatus = 'En attente' | 'Résolue' | 'En retard' | 'Contestée'
type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'

type Infraction = {
  id: string
  numero: string
  pv: string
  contrevenant: string
  telephone: string
  immatriculation: string
  montant: number
  penalites?: number
  dateEmission: string
  dateLimite: string
  dateResolution?: string
  statut: InfractionStatus
  agent: string
  lieu: string
  type: string
  categorie: string
}

interface Stats {
  totalInfractions: number
  resolues: number
  pourcentageResolues: number
  enAttente: number
  pourcentageAttente: number
  enRetard: number
  pourcentageRetard: number
  evolutionTotal: string
  evolutionResolues: string
  montantTotal: number
}

export default function InfractionsCommissariatPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tous les statuts')
  const [categorieFilter, setCategorieFilter] = useState('Toutes les catégories')
  const [dateFilter, setDateFilter] = useState('')
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('mois')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)

  // API data states
  const [loading, setLoading] = useState(true)
  const [apiInfractions, setApiInfractions] = useState<APIInfraction[]>([])
  const [apiStats, setApiStats] = useState<InfractionStatisticsResponse | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  const commissariatName = "Commissariat 3ème Arrondissement"
  const commissariatZone = "Cocody - 2 Plateaux"

  // Convert API status to display status
  const mapApiStatusToDisplay = (status: string): InfractionStatus => {
    switch (status) {
      case 'PAYEE':
      case 'ARCHIVEE':
        return 'Résolue'
      case 'CONSTATEE':
      case 'VALIDEE':
        return 'En attente'
      case 'CONTESTEE':
        return 'Contestée'
      case 'ANNULEE':
        return 'En retard'
      default:
        return 'En attente'
    }
  }

  // Convert API infraction to display format
  const mapApiToDisplay = (apiInf: APIInfraction): Infraction => {
    const displayStatus = mapApiStatusToDisplay(apiInf.statut)
    const dateInfraction = new Date(apiInf.date_infraction)
    const dateLimite = new Date(dateInfraction)
    dateLimite.setMonth(dateLimite.getMonth() + 1)

    return {
      id: apiInf.id,
      numero: `#INF-${apiInf.numero_pv?.replace('PV-', '') || apiInf.id}`,
      pv: apiInf.numero_pv || '',
      contrevenant: apiInf.conducteur ? `${apiInf.conducteur.nom} ${apiInf.conducteur.prenom}` : 'Inconnu',
      telephone: '+225 07XXXXXXXX',
      immatriculation: apiInf.vehicule?.immatriculation || '',
      montant: apiInf.montant_amende,
      dateEmission: dateInfraction.toLocaleDateString('fr-FR'),
      dateLimite: dateLimite.toLocaleDateString('fr-FR'),
      dateResolution: displayStatus === 'Résolue' ? new Date(apiInf.updated_at).toLocaleDateString('fr-FR') : undefined,
      statut: displayStatus,
      agent: apiInf.controle?.agent_nom || 'Agent',
      lieu: apiInf.lieu_infraction,
      type: apiInf.type_infraction?.libelle || 'Type inconnu',
      categorie: mapCategoryToDisplay(apiInf.type_infraction?.categorie || '')
    }
  }

  // Map API category to display category
  const mapCategoryToDisplay = (category: string): string => {
    const categoryMap: Record<string, string> = {
      'Documents': 'Documents',
      'DOCUMENTS': 'Documents',
      'Sécurité': 'Sécurité',
      'SECURITE': 'Sécurité',
      'Vitesse': 'Comportement',
      'VITESSE': 'Comportement',
      'Comportement': 'Comportement',
      'COMPORTEMENT': 'Comportement',
      'Technique': 'État technique',
      'TECHNIQUE': 'État technique',
      'Chargement': 'Chargement',
      'CHARGEMENT': 'Chargement',
      'Environnement': 'Environnement',
      'ENVIRONNEMENT': 'Environnement',
      'Stationnement': 'Comportement',
      'STATIONNEMENT': 'Comportement',
    }
    return categoryMap[category] || 'Documents'
  }

  // Calculate date range based on period
  const getDateRange = useCallback((period: PeriodKey): { dateDebut: string; dateFin: string } => {
    const now = new Date()
    const dateFin = now.toISOString().split('T')[0]
    let dateDebut: string

    switch (period) {
      case 'jour':
        dateDebut = dateFin
        break
      case 'semaine':
        const weekAgo = new Date(now)
        weekAgo.setDate(weekAgo.getDate() - 7)
        dateDebut = weekAgo.toISOString().split('T')[0]
        break
      case 'mois':
        const monthAgo = new Date(now)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        dateDebut = monthAgo.toISOString().split('T')[0]
        break
      case 'annee':
        const yearAgo = new Date(now)
        yearAgo.setFullYear(yearAgo.getFullYear() - 1)
        dateDebut = yearAgo.toISOString().split('T')[0]
        break
      case 'tout':
        dateDebut = '2020-01-01'
        break
      default:
        dateDebut = dateFin
    }

    return { dateDebut, dateFin }
  }, [])

  // Fetch data from API
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const range = isCustomDateRange
        ? { dateDebut, dateFin }
        : getDateRange(globalFilter)

      // Fetch both infractions and stats in parallel
      const [infractionsRes, statsRes] = await Promise.all([
        infractionsService.getAll(
          { date_debut: range.dateDebut, date_fin: range.dateFin },
          currentPage,
          pageSize
        ),
        infractionsService.getStatistics({ date_debut: range.dateDebut, date_fin: range.dateFin })
      ])

      if (infractionsRes.data?.infractions) {
        setApiInfractions(infractionsRes.data.infractions)
        setTotalCount(infractionsRes.data.total)
      }

      if (statsRes.data) {
        setApiStats(statsRes.data)
      }
    } catch (error) {
      console.error('Error fetching infractions:', error)
    } finally {
      setLoading(false)
    }
  }, [globalFilter, isCustomDateRange, dateDebut, dateFin, currentPage, getDateRange])

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Données selon la période sélectionnée - POUR UN COMMISSARIAT
  const dataByPeriod: Record<PeriodKey, {
    infractions: Infraction[];
    stats: Stats;
  }> = {
    jour: {
      infractions: [
        {
          id: '1',
          numero: '#INF-2025-COC-0892',
          pv: 'PV-2025-COC-0892',
          contrevenant: 'TRAORE Moussa',
          telephone: '+225 0708765432',
          immatriculation: 'AB-123-CD',
          montant: 45000,
          dateEmission: '10/10/2025',
          dateLimite: '10/11/2025',
          statut: 'En attente' as InfractionStatus,
          agent: 'DIALLO Mamadou',
          lieu: 'Boulevard Latrille',
          type: 'Excès de vitesse',
          categorie: 'Comportement'
        },
        {
          id: '2',
          numero: '#INF-2025-COC-0891',
          pv: 'PV-2025-COC-0891',
          contrevenant: 'BAMBA Issa',
          telephone: '+225 0701234567',
          immatriculation: 'EF-456-GH',
          montant: 5000,
          dateEmission: '10/10/2025',
          dateLimite: '10/11/2025',
          dateResolution: '10/10/2025',
          statut: 'Résolue' as InfractionStatus,
          agent: 'KONE Ibrahim',
          lieu: 'Carrefour Gendarmerie',
          type: "Défaut d'assurance",
          categorie: 'Documents'
        },
        {
          id: '3',
          numero: '#INF-2025-COC-0890',
          pv: 'PV-2025-COC-0890',
          contrevenant: 'DIABATE Aminata',
          telephone: '+225 0709876543',
          immatriculation: 'IJ-789-KL',
          montant: 35000,
          dateEmission: '10/10/2025',
          dateLimite: '10/11/2025',
          statut: 'En attente' as InfractionStatus,
          agent: 'KOUASSI Jean',
          lieu: 'Rue des Jardins',
          type: 'Non port de ceinture',
          categorie: 'Sécurité'
        }
      ],
      stats: {
        totalInfractions: 18,
        resolues: 12,
        pourcentageResolues: 67,
        enAttente: 4,
        pourcentageAttente: 22,
        enRetard: 2,
        pourcentageRetard: 11,
        evolutionTotal: '+12.5%',
        evolutionResolues: '+8.3%',
        montantTotal: 125000
      }
    },
    semaine: {
      infractions: [
        {
          id: '1',
          numero: '#INF-2025-COC-0765',
          pv: 'PV-2025-COC-0765',
          contrevenant: 'BAMBA Sylvain',
          telephone: '+225 0702345678',
          immatriculation: 'MN-012-OP',
          montant: 40000,
          dateEmission: '04/10/2025',
          dateLimite: '04/11/2025',
          dateResolution: '06/10/2025',
          statut: 'Résolue' as InfractionStatus,
          agent: 'DIALLO Mamadou',
          lieu: 'Boulevard Latrille',
          type: 'Défaut de permis',
          categorie: 'Documents'
        },
        {
          id: '2',
          numero: '#INF-2025-COC-0766',
          pv: 'PV-2025-COC-0766',
          contrevenant: 'TRAORE Fatou',
          telephone: '+225 0703456789',
          immatriculation: 'QR-345-ST',
          montant: 8000,
          dateEmission: '05/10/2025',
          dateLimite: '05/11/2025',
          statut: 'En attente' as InfractionStatus,
          agent: 'KONE Ibrahim',
          lieu: 'Carrefour Gendarmerie',
          type: 'Éclairage défectueux',
          categorie: 'État technique'
        },
        {
          id: '3',
          numero: '#INF-2025-COC-0767',
          pv: 'PV-2025-COC-0767',
          contrevenant: 'KOFFI Marie',
          telephone: '+225 0704567890',
          immatriculation: 'UV-678-WX',
          montant: 55000,
          penalites: 5500,
          dateEmission: '02/10/2025',
          dateLimite: '02/10/2025',
          statut: 'En retard' as InfractionStatus,
          agent: 'KOUASSI Jean',
          lieu: 'Rue des Jardins',
          type: 'Conduite dangereuse',
          categorie: 'Comportement'
        }
      ],
      stats: {
        totalInfractions: 65,
        resolues: 42,
        pourcentageResolues: 65,
        enAttente: 15,
        pourcentageAttente: 23,
        enRetard: 8,
        pourcentageRetard: 12,
        evolutionTotal: '+9.8%',
        evolutionResolues: '+11.2%',
        montantTotal: 485000
      }
    },
    mois: {
      infractions: [
        {
          id: '1',
          numero: '#INF-2025-COC-0045',
          pv: 'PV-2025-COC-0045',
          contrevenant: 'TOURE Mariam',
          telephone: '+225 0708765432',
          immatriculation: 'YZ-901-AB',
          montant: 45000,
          dateEmission: '15/09/2025',
          dateLimite: '15/10/2025',
          statut: 'En attente' as InfractionStatus,
          agent: 'DIALLO Mamadou',
          lieu: 'Boulevard Latrille',
          type: 'Téléphone au volant',
          categorie: 'Sécurité'
        },
        {
          id: '2',
          numero: '#INF-2025-COC-0046',
          pv: 'PV-2025-COC-0046',
          contrevenant: 'KOUADIO Patrick',
          telephone: '+225 0701234567',
          immatriculation: 'CD-234-EF',
          montant: 5000,
          dateEmission: '20/09/2025',
          dateLimite: '20/10/2025',
          dateResolution: '25/09/2025',
          statut: 'Résolue' as InfractionStatus,
          agent: 'KONE Ibrahim',
          lieu: 'Carrefour Gendarmerie',
          type: 'Défaut de carte grise',
          categorie: 'Documents'
        },
        {
          id: '3',
          numero: '#INF-2025-COC-0044',
          pv: 'PV-2025-COC-0044',
          contrevenant: 'BEUGRE Aya',
          telephone: '+225 0701234567',
          immatriculation: 'GH-567-IJ',
          montant: 75000,
          penalites: 7500,
          dateEmission: '10/09/2025',
          dateLimite: '10/09/2025',
          statut: 'En retard' as InfractionStatus,
          agent: 'KOUASSI Jean',
          lieu: 'Rue des Jardins',
          type: 'Non-respect feu rouge',
          categorie: 'Comportement'
        },
        {
          id: '4',
          numero: '#INF-2025-COC-0043',
          pv: 'PV-2025-COC-0043',
          contrevenant: 'YAO Kouadio',
          telephone: '+225 0709876543',
          immatriculation: 'KL-890-MN',
          montant: 35000,
          dateEmission: '18/09/2025',
          dateLimite: '18/10/2025',
          statut: 'Contestée' as InfractionStatus,
          agent: 'DIALLO Mamadou',
          lieu: 'Boulevard Latrille',
          type: 'Pneus usés',
          categorie: 'État technique'
        },
        {
          id: '5',
          numero: '#INF-2025-COC-0042',
          pv: 'PV-2025-COC-0042',
          contrevenant: 'KONE Aya',
          telephone: '+225 0702345678',
          immatriculation: 'OP-123-QR',
          montant: 10000,
          dateEmission: '22/09/2025',
          dateLimite: '22/10/2025',
          dateResolution: '23/09/2025',
          statut: 'Résolue' as InfractionStatus,
          agent: 'KONE Ibrahim',
          lieu: 'Carrefour Gendarmerie',
          type: 'Défaut de casque',
          categorie: 'Sécurité'
        }
      ],
      stats: {
        totalInfractions: 187,
        resolues: 125,
        pourcentageResolues: 67,
        enAttente: 42,
        pourcentageAttente: 22,
        enRetard: 20,
        pourcentageRetard: 11,
        evolutionTotal: '+7.2%',
        evolutionResolues: '+9.8%',
        montantTotal: 1250000
      }
    },
    annee: {
      infractions: [
        {
          id: '1',
          numero: '#INF-2025-COC-0012',
          pv: 'PV-2025-COC-0012',
          contrevenant: 'KOFFI Armand',
          telephone: '+225 0705556789',
          immatriculation: 'ST-456-UV',
          montant: 60000,
          dateEmission: '15/02/2025',
          dateLimite: '15/03/2025',
          dateResolution: '18/02/2025',
          statut: 'Résolue' as InfractionStatus,
          agent: 'DIALLO Mamadou',
          lieu: 'Boulevard Latrille',
          type: 'Surcharge véhicule',
          categorie: 'Chargement'
        },
        {
          id: '2',
          numero: '#INF-2025-COC-0013',
          pv: 'PV-2025-COC-0013',
          contrevenant: 'TRAORE Salimata',
          telephone: '+225 0706667890',
          immatriculation: 'WX-789-YZ',
          montant: 10000,
          dateEmission: '22/03/2025',
          dateLimite: '22/04/2025',
          statut: 'En attente' as InfractionStatus,
          agent: 'KONE Ibrahim',
          lieu: 'Carrefour Gendarmerie',
          type: 'Bruit excessif',
          categorie: 'Environnement'
        },
        {
          id: '3',
          numero: '#INF-2025-COC-0011',
          pv: 'PV-2025-COC-0011',
          contrevenant: 'COULIBALY Seydou',
          telephone: '+225 0707778901',
          immatriculation: 'AB-012-CD',
          montant: 45000,
          penalites: 13500,
          dateEmission: '20/01/2025',
          dateLimite: '20/02/2025',
          statut: 'En retard' as InfractionStatus,
          agent: 'KOUASSI Jean',
          lieu: 'Rue des Jardins',
          type: 'Pollution excessive',
          categorie: 'Environnement'
        }
      ],
      stats: {
        totalInfractions: 1256,
        resolues: 842,
        pourcentageResolues: 67,
        enAttente: 276,
        pourcentageAttente: 22,
        enRetard: 138,
        pourcentageRetard: 11,
        evolutionTotal: '+14.3%',
        evolutionResolues: '+18.7%',
        montantTotal: 8450000
      }
    },
    tout: {
      infractions: [
        {
          id: '1',
          numero: '#INF-2022-COC-0089',
          pv: 'PV-2022-COC-0089',
          contrevenant: 'DIALLO Fatoumata',
          telephone: '+225 0708889012',
          immatriculation: 'EF-345-GH',
          montant: 35000,
          dateEmission: '20/05/2022',
          dateLimite: '20/06/2022',
          dateResolution: '22/05/2022',
          statut: 'Résolue' as InfractionStatus,
          agent: 'DIALLO Mamadou',
          lieu: 'Boulevard Latrille',
          type: 'Défaut de visite technique',
          categorie: 'État technique'
        },
        {
          id: '2',
          numero: '#INF-2023-COC-0234',
          pv: 'PV-2023-COC-0234',
          contrevenant: 'BAMBA Ibrahim',
          telephone: '+225 0709990123',
          immatriculation: 'IJ-678-KL',
          montant: 5000,
          dateEmission: '15/08/2023',
          dateLimite: '15/09/2023',
          statut: 'Contestée' as InfractionStatus,
          agent: 'KONE Ibrahim',
          lieu: 'Carrefour Gendarmerie',
          type: 'Chargement mal arrimé',
          categorie: 'Chargement'
        },
        {
          id: '3',
          numero: '#INF-2024-COC-0567',
          pv: 'PV-2024-COC-0567',
          contrevenant: 'KOFFI Laurent',
          telephone: '+225 0701112345',
          immatriculation: 'MN-901-OP',
          montant: 47000,
          penalites: 23500,
          dateEmission: '18/03/2024',
          dateLimite: '18/04/2024',
          statut: 'En retard' as InfractionStatus,
          agent: 'KOUASSI Jean',
          lieu: 'Rue des Jardins',
          type: 'Fuite huile moteur',
          categorie: 'Environnement'
        }
      ],
      stats: {
        totalInfractions: 6542,
        resolues: 4383,
        pourcentageResolues: 67,
        enAttente: 1439,
        pourcentageAttente: 22,
        enRetard: 720,
        pourcentageRetard: 11,
        evolutionTotal: '+28.5%',
        evolutionResolues: '+34.2%',
        montantTotal: 45200000
      }
    },
    personnalise: {
      infractions: [
        {
          id: '1',
          numero: '#INF-2025-COC-0235',
          pv: 'PV-2025-COC-0235',
          contrevenant: 'CAMARA Adama',
          telephone: '+225 0702223456',
          immatriculation: 'QR-234-ST',
          montant: 43000,
          dateEmission: '11/10/2025',
          dateLimite: '11/11/2025',
          dateResolution: '12/10/2025',
          statut: 'Résolue' as InfractionStatus,
          agent: 'DIALLO Mamadou',
          lieu: 'Boulevard Latrille',
          type: 'Excès de vitesse',
          categorie: 'Comportement'
        },
        {
          id: '2',
          numero: '#INF-2025-COC-0236',
          pv: 'PV-2025-COC-0236',
          contrevenant: 'BEUGRE Paul',
          telephone: '+225 0703334567',
          immatriculation: 'UV-567-WX',
          montant: 9000,
          dateEmission: '12/10/2025',
          dateLimite: '12/11/2025',
          statut: 'En attente' as InfractionStatus,
          agent: 'KONE Ibrahim',
          lieu: 'Carrefour Gendarmerie',
          type: "Défaut d'assurance",
          categorie: 'Documents'
        },
        {
          id: '3',
          numero: '#INF-2025-COC-0237',
          pv: 'PV-2025-COC-0237',
          contrevenant: 'COULIBALY Issa',
          telephone: '+225 0704445678',
          immatriculation: 'YZ-890-AB',
          montant: 51000,
          penalites: 5100,
          dateEmission: '10/10/2025',
          dateLimite: '10/10/2025',
          statut: 'En retard' as InfractionStatus,
          agent: 'KOUASSI Jean',
          lieu: 'Rue des Jardins',
          type: 'Non port de ceinture',
          categorie: 'Sécurité'
        }
      ],
      stats: {
        totalInfractions: 45,
        resolues: 30,
        pourcentageResolues: 67,
        enAttente: 10,
        pourcentageAttente: 22,
        enRetard: 5,
        pourcentageRetard: 11,
        evolutionTotal: '+11.2%',
        evolutionResolues: '+13.5%',
        montantTotal: 325000
      }
    }
  }

  // Compute current data from API or fallback to static data
  const staticData = isCustomDateRange ? dataByPeriod.personnalise : dataByPeriod[globalFilter]

  // Build stats from API data
  const computedStats: Stats = apiStats ? {
    totalInfractions: apiStats.total,
    resolues: (apiStats.par_statut['PAYEE'] || 0) + (apiStats.par_statut['ARCHIVEE'] || 0),
    pourcentageResolues: apiStats.total > 0
      ? Math.round(((apiStats.par_statut['PAYEE'] || 0) + (apiStats.par_statut['ARCHIVEE'] || 0)) / apiStats.total * 100)
      : 0,
    enAttente: (apiStats.par_statut['CONSTATEE'] || 0) + (apiStats.par_statut['VALIDEE'] || 0),
    pourcentageAttente: apiStats.total > 0
      ? Math.round(((apiStats.par_statut['CONSTATEE'] || 0) + (apiStats.par_statut['VALIDEE'] || 0)) / apiStats.total * 100)
      : 0,
    enRetard: apiStats.par_statut['CONTESTEE'] || 0,
    pourcentageRetard: apiStats.total > 0
      ? Math.round((apiStats.par_statut['CONTESTEE'] || 0) / apiStats.total * 100)
      : 0,
    evolutionTotal: '+0%',
    evolutionResolues: '+0%',
    montantTotal: apiStats.montant_total
  } : staticData.stats

  // Map API infractions to display format
  const mappedInfractions = apiInfractions.length > 0
    ? apiInfractions.map(mapApiToDisplay)
    : staticData.infractions

  const currentData = {
    infractions: mappedInfractions,
    stats: computedStats
  }

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const formatMontant = (montant: number) => {
    if (montant >= 1000000) {
      return `${(montant / 1000000).toFixed(1)}M`
    } else if (montant >= 1000) {
      return `${(montant / 1000).toFixed(0)}K`
    }
    return `${formatNumber(montant)}`
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    alert('Export des données en cours...\nFormat: CSV/Excel/PDF')
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

    const handleControlClick = (infractionId: string) => {
    const cleanId = infractionId.replace('#INF-', '')
    router.push(`/gestion/infractions/${cleanId}`)
  }

  const getStatutColor = (statut: InfractionStatus) => {
    switch (statut) {
      case 'Résolue':
        return 'bg-green-500 text-white'
      case 'En attente':
        return 'bg-yellow-500 text-white'
      case 'En retard':
        return 'bg-red-500 text-white'
      case 'Contestée':
        return 'bg-orange-500 text-white'
    }
  }

  const getCategorieIcon = (categorie: string) => {
    switch (categorie) {
      case 'Documents':
        return <FileText className="w-4 h-4" />
      case 'Sécurité':
        return <Shield className="w-4 h-4" />
      case 'Comportement':
        return <Gauge className="w-4 h-4" />
      case 'État technique':
        return <Wrench className="w-4 h-4" />
      case 'Chargement':
        return <Truck className="w-4 h-4" />
      case 'Environnement':
        return <Leaf className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen space-y-6 relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-50">
          <div className="flex items-center gap-2 bg-white p-4 rounded-lg shadow-lg">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="text-slate-700">Chargement...</span>
          </div>
        </div>
      )}

      {/* Header */}
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
      </div>

      {/* Filtre Global de Période */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 mb-8">
        <CardBody className="p-4 md:p-6">
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Période d'analyse</h2>
                  <p className="text-gray-600 text-xs md:text-sm hidden sm:block">Sélectionnez la période pour filtrer les données</p>
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

      {/* État des Infractions */}
      <Card className="mb-6 sm:mb-8">
        <CardBody className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              État des Infractions - {
                isCustomDateRange ? 'Personnalisé' :
                globalFilter === 'jour' ? "Aujourd'hui" :
                globalFilter === 'semaine' ? 'Cette Semaine' :
                globalFilter === 'mois' ? 'Ce Mois' :
                globalFilter === 'annee' ? 'Cette Année' :
                'Historique'
              }
            </h2>
            <div className="flex items-center gap-2 text-green-600 text-xs sm:text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              {currentData.stats.evolutionTotal}
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="text-center p-3 sm:p-4 bg-slate-50 rounded-lg">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-1 sm:mb-2">
                {formatNumber(currentData.stats.totalInfractions)}
              </div>
              <div className="text-slate-600 text-xs sm:text-sm">Total infractions</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mb-1 sm:mb-2">
                {formatNumber(currentData.stats.resolues)}
              </div>
              <div className="text-slate-600 text-xs sm:text-sm">Résolues ({currentData.stats.pourcentageResolues}%)</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-yellow-50 rounded-lg">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600 mb-1 sm:mb-2">
                {formatNumber(currentData.stats.enAttente)}
              </div>
              <div className="text-slate-600 text-xs sm:text-sm">En attente ({currentData.stats.pourcentageAttente}%)</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-red-50 rounded-lg">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 mb-1 sm:mb-2">
                {formatNumber(currentData.stats.enRetard)}
              </div>
              <div className="text-slate-600 text-xs sm:text-sm">En retard ({currentData.stats.pourcentageRetard}%)</div>
            </div>
          </div>
        </CardBody>
      </Card>


      {/* Vue Mobile - Cards */}
      <div className="lg:hidden space-y-4 mb-6">
        {currentData.infractions.map((infraction) => (
          <Card key={infraction.id}>
            <CardBody className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 text-sm mb-1 truncate">{infraction.numero}</div>
                  <a href="#" className="text-blue-600 hover:text-blue-800 underline text-xs">
                    {infraction.pv}
                  </a>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ml-2 ${getStatutColor(infraction.statut)}`}>
                  {infraction.statut}
                </span>
              </div>

              <div className="space-y-2 mb-3">
                <div>
                  <div className="text-xs text-slate-500">Contrevenant</div>
                  <div className="font-medium text-slate-900 text-sm">{infraction.contrevenant}</div>
                  <div className="text-xs text-slate-500">{infraction.telephone}</div>
                  <div className="text-xs text-slate-400">{infraction.immatriculation}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-slate-500">Montant</div>
                    <div className="font-bold text-slate-900 text-sm">{formatNumber(infraction.montant)} FCFA</div>
                    {infraction.penalites && (
                      <div className="text-xs text-red-600">+{formatNumber(infraction.penalites)} FCFA</div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Date limite</div>
                    <div className={`text-sm ${infraction.statut === 'En retard' ? 'text-red-600 font-bold' : 'text-slate-900'}`}>
                      {infraction.dateLimite}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getCategorieIcon(infraction.categorie)}
                  <span className="text-xs text-slate-600">{infraction.categorie}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-600">{infraction.type}</span>
                </div>

                <div>
                  <div className="text-xs text-slate-500">Agent / Lieu</div>
                  <div className="text-sm text-slate-900">{infraction.agent} • {infraction.lieu}</div>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <Button 
                  onClick={() => router.push(`/commissariat/infractions/${infraction.id}`)}
                  className="flex-1 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-xs">Voir</span>
                </Button>
                {infraction.statut === 'En attente' ? (
                  <>
                    <Button className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                      <Mail className="w-4 h-4" />
                    </Button>
                  </>
                ) : infraction.statut === 'Résolue' ? (
                  <Button className="p-2 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
                    <Download className="w-4 h-4 text-slate-600" />
                  </Button>
                ) : (
                  <>
                    <Button className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                      <AlertTriangle className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Vue Desktop - Tableau */}
      <Card className="hidden lg:block">
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">N° Infraction</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">PV Associé</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Contrevenant</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Véhicule</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Type</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Montant</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Émission</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Limite</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Statut</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentData.infractions.map((infraction) => (
                  <tr   onClick={() => handleControlClick(infraction.numero)} key={infraction.id} className="hover:bg-slate-50  cursor-pointer">
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <span className="font-bold text-slate-900 text-xs xl:text-sm">{infraction.numero}</span>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <a href="#" className="text-blue-600 hover:text-blue-800 underline font-medium text-xs xl:text-sm">
                        {infraction.pv}
                      </a>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <div>
                        <div className="font-medium text-slate-900 text-xs xl:text-sm">{infraction.contrevenant}</div>
                        <div className="text-xs text-slate-500">{infraction.telephone}</div>
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <span className="font-bold text-slate-900 text-xs xl:text-sm">{infraction.immatriculation}</span>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <div className="flex items-center gap-2">
                        {getCategorieIcon(infraction.categorie)}
                        <div>
                          <div className="text-xs xl:text-sm text-slate-900">{infraction.type}</div>
                          <div className="text-xs text-slate-500">{infraction.categorie}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <div>
                        <div className="font-bold text-slate-900 text-xs xl:text-sm">{formatNumber(infraction.montant)} FCFA</div>
                        {infraction.penalites && (
                          <div className="text-xs text-red-600">+{formatNumber(infraction.penalites)} FCFA</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <span className="text-slate-900 text-xs xl:text-sm">{infraction.dateEmission}</span>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <span className={`text-xs xl:text-sm ${infraction.statut === 'En retard' ? 'text-red-600 font-bold' : 'text-slate-900'}`}>
                        {infraction.dateLimite}
                      </span>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <span className={`inline-flex px-2 xl:px-3 py-1 text-xs font-bold rounded-full ${getStatutColor(infraction.statut)}`}>
                        {infraction.statut}
                      </span>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleControlClick(infraction.numero)}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {infraction.statut === 'En attente' ? (
                          <>
                            <Button className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                              <Mail className="w-4 h-4" />
                            </Button>
                          </>
                        ) : infraction.statut === 'Résolue' ? (
                          <Button className="p-2 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
                            <Download className="w-4 h-4 text-slate-600" />
                          </Button>
                        ) : (
                          <>
                            <Button className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                              <Phone className="w-4 h-4" />
                            </Button>
                            <Button className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                              <AlertTriangle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Desktop */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 xl:px-6 py-4 border-t border-slate-200">
            <p className="text-xs sm:text-sm text-slate-600">
              Affichage de {(currentPage - 1) * pageSize + 1} à {Math.min(currentPage * pageSize, totalCount || currentData.infractions.length)} sur {totalCount || currentData.infractions.length} infractions
            </p>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </Button>
              <Button className="px-3 xl:px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-xs xl:text-sm">
                {currentPage}
              </Button>
              <Button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage * pageSize >= (totalCount || currentData.infractions.length)}
                className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Pagination Mobile */}
      <div className="lg:hidden flex flex-col items-center gap-4 mt-4">
        <p className="text-xs text-slate-600">
          Page {currentPage} sur {Math.ceil((totalCount || currentData.infractions.length) / pageSize)} ({totalCount || currentData.infractions.length} infractions)
        </p>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </Button>
          <Button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm">
            {currentPage}
          </Button>
          <Button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage * pageSize >= (totalCount || currentData.infractions.length)}
            className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </Button>
        </div>
      </div>
    </div>
  )
}