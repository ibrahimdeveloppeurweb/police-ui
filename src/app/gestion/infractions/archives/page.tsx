'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Search, Calendar, Download, Archive, AlertTriangle,
  TrendingUp, Clock, DollarSign, Filter, Eye, ChevronLeft, ChevronRight,
  Printer, FileDown, FolderOpen, CheckCircle, XCircle, Trash2,
  FileText, Shield, Gauge, Wrench, Truck, Leaf, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { infractionsService, APIInfraction, InfractionStatisticsResponse } from '@/lib/api/services'

type InfractionStatus = 'Résolue' | 'Annulée' | 'Classée' | 'Archivée'
type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'

type InfractionArchive = {
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
  dateResolution: string
  statut: InfractionStatus
  agent: string
  lieu: string
  type: string
  categorie: string
  description: string
  dateArchivage: string
  motifArchivage: string
  resolution: string
}

interface Stats {
  totalArchives: number
  resolues: number
  pourcentageResolues: number
  annulees: number
  pourcentageAnnulees: number
  classees: number
  pourcentageClassees: number
  evolutionTotal: string
  montantTotal: number
  penalitesTotal: number
}

export default function ArchivesInfractionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tous les statuts')
  const [categorieFilter, setCategorieFilter] = useState('Toutes les catégories')
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('mois')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // API states
  const [loading, setLoading] = useState(true)
  const [apiArchives, setApiArchives] = useState<APIInfraction[]>([])
  const [apiStats, setApiStats] = useState<InfractionStatisticsResponse | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  const commissariatName = "Commissariat 3ème Arrondissement"
  const commissariatZone = "Cocody - 2 Plateaux"

  // Helper function to map API status to display status
  const mapApiStatusToDisplay = (statut: string): InfractionStatus => {
    switch (statut) {
      case 'ARCHIVEE':
        return 'Archivée'
      case 'PAYEE':
        return 'Résolue'
      case 'ANNULEE':
        return 'Annulée'
      case 'CONTESTEE':
        return 'Classée'
      default:
        return 'Archivée'
    }
  }

  // Helper function to map category
  const mapCategoryToDisplay = (category: string): string => {
    switch (category?.toUpperCase()) {
      case 'DOCUMENTS':
        return 'Documents'
      case 'SECURITE':
        return 'Sécurité'
      case 'COMPORTEMENT':
        return 'Comportement'
      case 'TECHNIQUE':
        return 'État technique'
      case 'CHARGEMENT':
        return 'Chargement'
      case 'ENVIRONNEMENT':
        return 'Environnement'
      default:
        return category || 'Documents'
    }
  }

  // Get date range based on period
  const getDateRange = useCallback((period: PeriodKey): { dateDebut: string; dateFin: string } => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]

    switch (period) {
      case 'jour': {
        return { dateDebut: today, dateFin: today }
      }
      case 'semaine': {
        const weekAgo = new Date(now)
        weekAgo.setDate(weekAgo.getDate() - 7)
        return { dateDebut: weekAgo.toISOString().split('T')[0], dateFin: today }
      }
      case 'mois': {
        const monthAgo = new Date(now)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return { dateDebut: monthAgo.toISOString().split('T')[0], dateFin: today }
      }
      case 'annee': {
        const yearAgo = new Date(now)
        yearAgo.setFullYear(yearAgo.getFullYear() - 1)
        return { dateDebut: yearAgo.toISOString().split('T')[0], dateFin: today }
      }
      case 'tout':
        return { dateDebut: '2020-01-01', dateFin: today }
      default:
        return { dateDebut: '', dateFin: '' }
    }
  }, [])

  // Fetch archived data from API
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const range = isCustomDateRange ? { dateDebut, dateFin } : getDateRange(globalFilter)

      const [archivesRes, statsRes] = await Promise.all([
        infractionsService.getArchived(
          {
            date_debut: range.dateDebut || undefined,
            date_fin: range.dateFin || undefined,
          },
          currentPage,
          pageSize
        ),
        infractionsService.getStatistics({
          date_debut: range.dateDebut || undefined,
          date_fin: range.dateFin || undefined,
        })
      ])

      if (archivesRes.data) {
        setApiArchives(archivesRes.data.infractions || [])
        setTotalCount(archivesRes.data.total || 0)
      }

      if (statsRes.data) {
        setApiStats(statsRes.data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des archives:', error)
    } finally {
      setLoading(false)
    }
  }, [globalFilter, isCustomDateRange, dateDebut, dateFin, currentPage, getDateRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Map API data to display format
  const mapApiToDisplay = (api: APIInfraction): InfractionArchive => {
    const formatDate = (dateStr: string) => {
      if (!dateStr) return ''
      const d = new Date(dateStr)
      return d.toLocaleDateString('fr-FR')
    }

    return {
      id: api.id,
      numero: `#INF-${api.numero_pv?.replace('PV-', '') || api.id.substring(0, 8)}`,
      pv: api.numero_pv || `PV-${api.id.substring(0, 8)}`,
      contrevenant: api.conducteur
        ? `${api.conducteur.nom} ${api.conducteur.prenom}`
        : 'Conducteur inconnu',
      telephone: '+225 07XXXXXXXX',
      immatriculation: api.vehicule?.immatriculation || 'N/A',
      montant: api.montant_amende || 0,
      penalites: 0,
      dateEmission: formatDate(api.date_infraction),
      dateLimite: formatDate(new Date(new Date(api.date_infraction).getTime() + 30*24*60*60*1000).toISOString()),
      dateResolution: formatDate(api.updated_at),
      statut: mapApiStatusToDisplay(api.statut),
      agent: api.controle?.agent_nom || 'Agent inconnu',
      lieu: api.lieu_infraction || api.controle?.lieu_controle || 'Lieu inconnu',
      type: api.type_infraction?.libelle || 'Type inconnu',
      categorie: mapCategoryToDisplay(api.type_infraction?.categorie || ''),
      description: api.circonstances || api.type_infraction?.description || '',
      dateArchivage: formatDate(api.updated_at),
      motifArchivage: api.statut === 'PAYEE' ? 'Paiement effectué' : 'Archivé automatiquement',
      resolution: api.statut === 'PAYEE' ? 'Amende payée - Dossier clos' : 'Dossier archivé'
    }
  }

  // Données selon la période sélectionnée - POUR LES ARCHIVES D'INFRACTIONS
  const dataByPeriod: Record<PeriodKey, {
    archives: InfractionArchive[];
    stats: Stats;
  }> = {
    jour: {
      archives: [
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
          dateResolution: '12/10/2025',
          statut: 'Résolue',
          agent: 'DIALLO Mamadou',
          lieu: 'Boulevard Latrille',
          type: 'Excès de vitesse',
          categorie: 'Comportement',
          description: 'Dépassement de vitesse autorisée de 30 km/h dans zone limitée à 50 km/h',
          dateArchivage: '13/10/2025',
          motifArchivage: 'Paiement complet effectué',
          resolution: 'Amende payée dans les délais - Mobile Money'
        }
      ],
      stats: {
        totalArchives: 3,
        resolues: 2,
        pourcentageResolues: 67,
        annulees: 1,
        pourcentageAnnulees: 33,
        classees: 0,
        pourcentageClassees: 0,
        evolutionTotal: '+5.2%',
        montantTotal: 125000,
        penalitesTotal: 0
      }
    },
    semaine: {
      archives: [
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
          statut: 'Résolue',
          agent: 'DIALLO Mamadou',
          lieu: 'Boulevard Latrille',
          type: 'Défaut de permis',
          categorie: 'Documents',
          description: 'Permis de conduire non présenté lors du contrôle',
          dateArchivage: '07/10/2025',
          motifArchivage: 'Paiement en espèces',
          resolution: 'Règlement au commissariat - Dossier clos'
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
          dateResolution: '08/10/2025',
          statut: 'Annulée',
          agent: 'KONE Ibrahim',
          lieu: 'Carrefour Gendarmerie',
          type: 'Éclairage défectueux',
          categorie: 'État technique',
          description: 'Phares avant droit défectueux',
          dateArchivage: '09/10/2025',
          motifArchivage: 'Preuve de réparation fournie',
          resolution: 'Infraction annulée - Véhicule réparé'
        }
      ],
      stats: {
        totalArchives: 15,
        resolues: 12,
        pourcentageResolues: 80,
        annulees: 3,
        pourcentageAnnulees: 20,
        classees: 0,
        pourcentageClassees: 0,
        evolutionTotal: '+8.7%',
        montantTotal: 485000,
        penalitesTotal: 25000
      }
    },
    mois: {
      archives: [
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
          dateResolution: '12/10/2025',
          statut: 'Résolue',
          agent: 'DIALLO Mamadou',
          lieu: 'Boulevard Latrille',
          type: 'Excès de vitesse',
          categorie: 'Comportement',
          description: 'Dépassement de vitesse autorisée de 30 km/h dans zone limitée à 50 km/h',
          dateArchivage: '13/10/2025',
          motifArchivage: 'Paiement complet effectué',
          resolution: 'Amende payée dans les délais - Mobile Money'
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
          statut: 'Résolue',
          agent: 'KONE Ibrahim',
          lieu: 'Carrefour Gendarmerie',
          type: "Défaut d'assurance",
          categorie: 'Documents',
          description: 'Absence de certificat d\'assurance valide',
          dateArchivage: '11/10/2025',
          motifArchivage: 'Paiement immédiat',
          resolution: 'Paiement immédiat sur place - Mobile Money'
        },
        {
          id: '3',
          numero: '#INF-2025-COC-0890',
          pv: 'PV-2025-COC-0890',
          contrevenant: 'DIABATE Aminata',
          telephone: '+225 0709876543',
          immatriculation: 'IJ-789-KL',
          montant: 35000,
          penalites: 7000,
          dateEmission: '10/10/2025',
          dateLimite: '10/11/2025',
          dateResolution: '25/10/2025',
          statut: 'Résolue',
          agent: 'KOUASSI Jean',
          lieu: 'Rue des Jardins',
          type: 'Non port de ceinture',
          categorie: 'Sécurité',
          description: 'Conducteur et passager avant sans ceinture de sécurité',
          dateArchivage: '26/10/2025',
          motifArchivage: 'Paiement avec pénalités',
          resolution: 'Payé avec pénalités de retard - Carte Bancaire'
        },
        {
          id: '4',
          numero: '#INF-2025-COC-0889',
          pv: 'PV-2025-COC-0889',
          contrevenant: 'KOUADIO Marcel',
          telephone: '+225 0705551234',
          immatriculation: 'MN-012-OP',
          montant: 25000,
          dateEmission: '09/10/2025',
          dateLimite: '09/11/2025',
          dateResolution: '12/10/2025',
          statut: 'Annulée',
          agent: 'DIALLO Mamadou',
          lieu: 'Angré 8ème Tranche',
          type: 'Stationnement gênant',
          categorie: 'Comportement',
          description: 'Stationnement devant une bouche d\'incendie',
          dateArchivage: '13/10/2025',
          motifArchivage: 'Vice de procédure',
          resolution: 'Annulation pour vice de procédure - Dossier invalidé'
        },
        {
          id: '5',
          numero: '#INF-2025-COC-0888',
          pv: 'PV-2025-COC-0888',
          contrevenant: 'TRAORE Salimata',
          telephone: '+225 0706667890',
          immatriculation: 'OP-123-QR',
          montant: 60000,
          penalites: 18000,
          dateEmission: '08/10/2025',
          dateLimite: '08/11/2025',
          dateResolution: '30/10/2025',
          statut: 'Classée',
          agent: 'KONE Ibrahim',
          lieu: 'Riviera Palmeraie',
          type: 'Conduite en état d\'ivresse',
          categorie: 'Comportement',
          description: 'Alcoolémie positive au contrôle routier',
          dateArchivage: '31/10/2025',
          motifArchivage: 'Délai de prescription',
          resolution: 'Dossier classé sans suite - Délai de prescription dépassé'
        }
      ],
      stats: {
        totalArchives: 187,
        resolues: 125,
        pourcentageResolues: 67,
        annulees: 42,
        pourcentageAnnulees: 22,
        classees: 20,
        pourcentageClassees: 11,
        evolutionTotal: '+7.2%',
        montantTotal: 1250000,
        penalitesTotal: 156000
      }
    },
    annee: {
      archives: [
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
          statut: 'Résolue',
          agent: 'DIALLO Mamadou',
          lieu: 'Boulevard Latrille',
          type: 'Surcharge véhicule',
          categorie: 'Chargement',
          description: 'Poids total autorisé en charge dépassé de 25%',
          dateArchivage: '19/02/2025',
          motifArchivage: 'Paiement complet',
          resolution: 'Paiement complet effectué - Virement Bancaire'
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
          dateResolution: '25/03/2025',
          statut: 'Annulée',
          agent: 'KONE Ibrahim',
          lieu: 'Carrefour Gendarmerie',
          type: 'Bruit excessif',
          categorie: 'Environnement',
          description: 'Niveau sonore du pot d\'échappement non conforme',
          dateArchivage: '26/03/2025',
          motifArchivage: 'Contrôle technique valide',
          resolution: 'Infraction annulée - Contrôle technique en règle'
        }
      ],
      stats: {
        totalArchives: 1256,
        resolues: 842,
        pourcentageResolues: 67,
        annulees: 276,
        pourcentageAnnulees: 22,
        classees: 138,
        pourcentageClassees: 11,
        evolutionTotal: '+14.3%',
        montantTotal: 8450000,
        penalitesTotal: 987000
      }
    },
    tout: {
      archives: [
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
          statut: 'Résolue',
          agent: 'DIALLO Mamadou',
          lieu: 'Boulevard Latrille',
          type: 'Défaut de visite technique',
          categorie: 'État technique',
          description: 'Visite technique périmée depuis 3 mois',
          dateArchivage: '23/05/2022',
          motifArchivage: 'Paiement en espèces',
          resolution: 'Règlement en espèces - Dossier clos'
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
          dateResolution: '18/08/2023',
          statut: 'Annulée',
          agent: 'KONE Ibrahim',
          lieu: 'Carrefour Gendarmerie',
          type: 'Chargement mal arrimé',
          categorie: 'Chargement',
          description: 'Marchandises non arrimées présentant un danger',
          dateArchivage: '19/08/2023',
          motifArchivage: 'Erreur de saisie',
          resolution: 'Infraction annulée - Erreur de saisie des informations'
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
          dateResolution: '20/04/2024',
          statut: 'Classée',
          agent: 'KOUASSI Jean',
          lieu: 'Rue des Jardins',
          type: 'Fuite huile moteur',
          categorie: 'Environnement',
          description: 'Fuite d\'huile moteur sur la voie publique',
          dateArchivage: '25/04/2024',
          motifArchivage: 'Délai de prescription',
          resolution: 'Dossier classé - Délai de prescription atteint'
        }
      ],
      stats: {
        totalArchives: 6542,
        resolues: 4383,
        pourcentageResolues: 67,
        annulees: 1439,
        pourcentageAnnulees: 22,
        classees: 720,
        pourcentageClassees: 11,
        evolutionTotal: '+28.5%',
        montantTotal: 45200000,
        penalitesTotal: 3450000
      }
    },
    personnalise: {
      archives: [
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
          statut: 'Résolue',
          agent: 'DIALLO Mamadou',
          lieu: 'Boulevard Latrille',
          type: 'Excès de vitesse',
          categorie: 'Comportement',
          description: 'Vitesse excessive en agglomération',
          dateArchivage: '13/10/2025',
          motifArchivage: 'Paiement mobile money',
          resolution: 'Paiement par mobile money - Transaction validée'
        }
      ],
      stats: {
        totalArchives: 45,
        resolues: 30,
        pourcentageResolues: 67,
        annulees: 10,
        pourcentageAnnulees: 22,
        classees: 5,
        pourcentageClassees: 11,
        evolutionTotal: '+11.2%',
        montantTotal: 325000,
        penalitesTotal: 45000
      }
    }
  }

  const staticData = isCustomDateRange ? dataByPeriod.personnalise : dataByPeriod[globalFilter]

  // Map API archives to display format
  const mappedArchives: InfractionArchive[] = apiArchives.length > 0
    ? apiArchives.map(mapApiToDisplay)
    : staticData.archives

  // Compute stats from API or use static fallback
  const computedStats: Stats = apiStats ? {
    totalArchives: apiStats.par_statut?.['ARCHIVEE'] || totalCount || staticData.stats.totalArchives,
    resolues: apiStats.par_statut?.['PAYEE'] || Math.round(totalCount * 0.67) || staticData.stats.resolues,
    pourcentageResolues: totalCount > 0 ? Math.round(((apiStats.par_statut?.['PAYEE'] || Math.round(totalCount * 0.67)) / totalCount) * 100) : staticData.stats.pourcentageResolues,
    annulees: apiStats.par_statut?.['ANNULEE'] || Math.round(totalCount * 0.22) || staticData.stats.annulees,
    pourcentageAnnulees: totalCount > 0 ? Math.round(((apiStats.par_statut?.['ANNULEE'] || Math.round(totalCount * 0.22)) / totalCount) * 100) : staticData.stats.pourcentageAnnulees,
    classees: apiStats.par_statut?.['CONTESTEE'] || Math.round(totalCount * 0.11) || staticData.stats.classees,
    pourcentageClassees: totalCount > 0 ? Math.round(((apiStats.par_statut?.['CONTESTEE'] || Math.round(totalCount * 0.11)) / totalCount) * 100) : staticData.stats.pourcentageClassees,
    evolutionTotal: staticData.stats.evolutionTotal,
    montantTotal: apiStats.montant_total || staticData.stats.montantTotal,
    penalitesTotal: Math.round((apiStats.montant_total || staticData.stats.montantTotal) * 0.1),
  } : staticData.stats

  // Use computed data
  const currentData = {
    archives: mappedArchives,
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
    alert('Export des archives en cours...\nFormat: CSV/Excel/PDF')
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

  const getStatutColor = (statut: InfractionStatus) => {
    switch (statut) {
      case 'Résolue':
        return 'bg-green-500 text-white'
      case 'Annulée':
        return 'bg-gray-500 text-white'
      case 'Classée':
        return 'bg-blue-500 text-white'
      case 'Archivée':
        return 'bg-purple-500 text-white'
    }
  }

  const getStatutIcon = (statut: InfractionStatus) => {
    switch (statut) {
      case 'Résolue':
        return <CheckCircle className="w-4 h-4" />
      case 'Annulée':
        return <XCircle className="w-4 h-4" />
      case 'Classée':
        return <Archive className="w-4 h-4" />
      case 'Archivée':
        return <FolderOpen className="w-4 h-4" />
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

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === currentData.archives.length 
        ? [] 
        : currentData.archives.map(item => item.id)
    )
  }

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    const totalPages = Math.ceil(totalCount / pageSize)
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize) || 1

  return (
    <div className="min-h-screen space-y-6 relative">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-50">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-sm text-slate-600">Chargement des archives...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Archives des Infractions</h1>
            <p className="text-slate-600">{commissariatName} - {commissariatZone}</p>
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
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Période d'archivage</h2>
                  <p className="text-gray-600 text-xs md:text-sm hidden sm:block">Sélectionnez la période pour filtrer les archives</p>
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

      {/* Statistiques des archives */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border border-gray-200 border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Total Archives</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Archive className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(currentData.stats.totalArchives)}</div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <TrendingUp className="w-4 h-4 text-green-600" />
              {currentData.stats.evolutionTotal} vs période précédente
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Infractions Résolues</h3>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(currentData.stats.resolues)}</div>
            <div className="text-sm text-slate-500">
              {currentData.stats.pourcentageResolues}% des archives
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-gray-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Infractions Annulées</h3>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-gray-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(currentData.stats.annulees)}</div>
            <div className="text-sm text-slate-500">
              {currentData.stats.pourcentageAnnulees}% des archives
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-purple-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Montant Total</h3>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{formatMontant(currentData.stats.montantTotal)} FCFA</div>
            <div className="text-sm text-slate-500">
              + {formatMontant(currentData.stats.penalitesTotal)} pénalités
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Actions groupées */}
      {selectedItems.length > 0 && (
        <Card className="mb-6 bg-blue-50 border-2 border-blue-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">
                  {selectedItems.length} élément(s) sélectionné(s)
                </span>
              </div>
              <div className="flex gap-3">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2">
                  <Download className="w-4 h-4" />
                  Exporter
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2">
                  <Printer className="w-4 h-4" />
                  Imprimer
                </Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2">
                  <Trash2 className="w-4 h-4" />
                  Supprimer définitivement
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Filtres supplémentaires */}
      <Card className="mb-8">
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher infraction, contrevenant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            >
              <option>Tous les statuts</option>
              <option>Résolue</option>
              <option>Annulée</option>
              <option>Classée</option>
              <option>Archivée</option>
            </select>

            <select 
              value={categorieFilter}
              onChange={(e) => setCategorieFilter(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            >
              <option>Toutes les catégories</option>
              <option>Comportement</option>
              <option>Documents</option>
              <option>Sécurité</option>
              <option>État technique</option>
              <option>Chargement</option>
              <option>Environnement</option>
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Vue Mobile - Cards */}
      <div className="lg:hidden space-y-4 mb-6">
        {currentData.archives.map((infraction) => (
          <Card key={infraction.id}>
            <CardBody className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(infraction.id)}
                      onChange={() => toggleSelectItem(infraction.id)}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <div className="font-bold text-slate-900 text-sm truncate">{infraction.numero}</div>
                  </div>
                  <a href="#" className="text-blue-600 hover:text-blue-800 underline text-xs">
                    {infraction.pv}
                  </a>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ml-2 ${getStatutColor(infraction.statut)}`}>
                  {getStatutIcon(infraction.statut)}
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
                    <div className="text-xs text-slate-500">Date archivage</div>
                    <div className="text-sm text-slate-900">{infraction.dateArchivage}</div>
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

                <div>
                  <div className="text-xs text-slate-500">Résolution</div>
                  <div className="text-xs text-slate-600">{infraction.resolution}</div>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <Button 
                  onClick={() => alert(`Détails de ${infraction.numero}`)}
                  className="flex-1 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-xs">Voir</span>
                </Button>
                <Button 
                  onClick={() => alert(`Impression de ${infraction.numero}`)}
                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={() => {
                    if(confirm(`Supprimer définitivement ${infraction.numero} des archives ?`)) {
                      alert('Infraction supprimée des archives')
                    }
                  }}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
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
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === currentData.archives.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                  </th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">N° Infraction</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">PV Associé</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Contrevenant</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Véhicule</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Type</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Montant</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Statut</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Date Archivage</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentData.archives.map((infraction) => (
                  <tr key={infraction.id} className="hover:bg-slate-50">
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(infraction.id)}
                        onChange={() => toggleSelectItem(infraction.id)}
                        className="w-4 h-4 rounded border-slate-300"
                      />
                    </td>
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
                      <span className={`inline-flex items-center gap-2 px-2 xl:px-3 py-1 text-xs font-bold rounded-full ${getStatutColor(infraction.statut)}`}>
                        {getStatutIcon(infraction.statut)}
                        {infraction.statut}
                      </span>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Archive className="w-4 h-4" />
                        <span className="text-xs xl:text-sm">{infraction.dateArchivage}</span>
                      </div>
                    </td>
               
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => alert(`Détails de ${infraction.numero}`)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button 
                          onClick={() => alert(`Impression de ${infraction.numero}`)}
                          className="p-2 hover:bg-indigo-100 rounded-lg transition-colors"
                          title="Imprimer"
                        >
                          <Printer className="w-4 h-4 text-indigo-600" />
                        </button>
                        <button 
                          onClick={() => {
                            if(confirm(`Supprimer définitivement ${infraction.numero} des archives ?`)) {
                              alert('Infraction supprimée des archives')
                            }
                          }}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
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
              Affichage de {((currentPage - 1) * pageSize) + 1} à {Math.min(currentPage * pageSize, totalCount || currentData.archives.length)} sur {formatNumber(totalCount || currentData.stats.totalArchives)} archives
            </p>
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className={`px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </Button>
              <Button className="px-3 xl:px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-xs xl:text-sm">
                {currentPage}
              </Button>
              <span className="text-sm text-slate-500">/ {totalPages}</span>
              <Button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className={`px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors ${currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          Page {currentPage} sur {totalPages} ({formatNumber(totalCount || currentData.archives.length)} archives)
        </p>
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className={`px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </Button>
          <Button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm">
            {currentPage}
          </Button>
          <Button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className={`px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors ${currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </Button>
        </div>
      </div>
    </div>
  )
}