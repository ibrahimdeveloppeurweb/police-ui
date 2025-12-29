'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Search, Filter, Download, Eye, Printer, Calendar,
  AlertTriangle, CheckCircle, Clock, Archive, ArchiveRestore,
  DollarSign, Trash2, FolderOpen, XCircle, Loader2, FileText
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'
import { infractionsService, type APIInfraction } from '@/lib/api/services'

// Modal de confirmation de désarchivage
function UnarchiveConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  pvNumero,
  count,
  loading
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  pvNumero?: string
  count?: number
  loading: boolean
}) {
  if (!isOpen) return null

  const isBatch = count && count > 1
  const title = isBatch ? `Désarchiver ${count} PV` : 'Désarchiver le PV'
  const subtitle = isBatch ? `${count} éléments sélectionnés` : pvNumero

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <ArchiveRestore className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{title}</h2>
              <p className="text-slate-600">{subtitle}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <ArchiveRestore className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-green-800 block">Restauration</span>
                <p className="text-green-700 text-sm mt-1">
                  {isBatch
                    ? `Les ${count} PV sélectionnés seront restaurés dans la liste des verbalisations actives.`
                    : 'Ce PV sera restauré dans la liste des verbalisations actives.'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-medium text-slate-900 mb-2">Ce qui va se passer :</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                {isBatch ? 'Les PV seront' : 'Le PV sera'} déplacé{isBatch ? 's' : ''} vers la liste active
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Le statut passera à "Payé"
              </li>
              <li className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-amber-500" />
                {isBatch ? 'Ils pourront être' : 'Il pourra être'} archivé{isBatch ? 's' : ''} à nouveau si nécessaire
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Désarchivage...
              </>
            ) : (
              <>
                <ArchiveRestore className="w-4 h-4" />
                Confirmer
              </>
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}

type PaymentStatus = 'Payé' | 'Non payé' | 'En retard' | 'Annulé'

type PVArchive = {
  id: string
  numero: string
  dateEmission: string
  heureEmission: string
  immatriculation: string
  conducteur: string
  agent: string
  lieu: string
  montant: number
  infractions: number
  statutPaiement: PaymentStatus
  datePaiement?: string
  modePaiement?: string
  dateArchivage: string
  resolution: string
  penalites?: number
  statutOriginal: string // Pour savoir si on peut archiver (PAYEE/ANNULEE mais pas encore ARCHIVEE)
}

// Helper to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Helper to format time
const formatTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Map API status to display status
const mapStatutToPaymentStatus = (statut: string): PaymentStatus => {
  switch (statut) {
    case 'PAYEE':
    case 'ARCHIVEE': // ARCHIVEE inherits from PAYEE context
      return 'Payé'
    case 'ANNULEE':
    case 'CONTESTEE':
      return 'Annulé'
    default:
      return 'Non payé'
  }
}

// Get resolution text based on status
const getResolution = (statut: string): string => {
  switch (statut) {
    case 'PAYEE':
      return 'Amende payée - Dossier clos'
    case 'ANNULEE':
      return 'PV annulé - Dossier classé'
    case 'CONTESTEE':
      return 'PV contesté - Procédure terminée'
    case 'ARCHIVEE':
      return 'Dossier archivé'
    default:
      return 'Dossier traité'
  }
}

// Convert API infraction to archive format
const infractionToArchive = (infraction: APIInfraction): PVArchive => {
  const conducteur = infraction.conducteur
  const vehicule = infraction.vehicule
  const controle = infraction.controle

  return {
    id: infraction.id,
    numero: infraction.numero_pv,
    dateEmission: formatDate(infraction.date_infraction),
    heureEmission: formatTime(infraction.date_infraction),
    immatriculation: vehicule?.immatriculation || 'N/A',
    conducteur: conducteur ? `${conducteur.nom} ${conducteur.prenom}` : 'Inconnu',
    agent: controle?.agent_nom || 'Non assigné',
    lieu: infraction.lieu_infraction || controle?.lieu_controle || 'Non spécifié',
    montant: infraction.montant_amende,
    infractions: 1,
    statutPaiement: mapStatutToPaymentStatus(infraction.statut),
    datePaiement: infraction.statut === 'PAYEE' ? formatDate(infraction.updated_at) : undefined,
    modePaiement: infraction.statut === 'PAYEE' ? 'Paiement enregistré' : undefined,
    dateArchivage: formatDate(infraction.updated_at),
    resolution: getResolution(infraction.statut),
    statutOriginal: infraction.statut
  }
}

export default function ArchivesVerbalisationsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tous les statuts')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  // API data states
  const [archives, setArchives] = useState<PVArchive[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [archivingId, setArchivingId] = useState<string | null>(null)
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false)
  const [pvToUnarchive, setPvToUnarchive] = useState<PVArchive | null>(null)
  const [isBatchUnarchive, setIsBatchUnarchive] = useState(false)
  const [stats, setStats] = useState({
    totalArchives: 0,
    payes: 0,
    annules: 0,
    montantTotal: 0
  })

  const commissariatName = "Commissariat Central de Cocody"
  const commissariatZone = "Cocody - 2 Plateaux"
  const itemsPerPage = 10

  // Fetch archived infractions
  const fetchArchives = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const filters: Record<string, string> = {}

      if (dateDebut) {
        filters.date_debut = dateDebut
      }
      if (dateFin) {
        filters.date_fin = dateFin
      }
      if (searchTerm) {
        filters.search = searchTerm
      }

      // Fetch only truly archived infractions (ARCHIVEE status)
      const archivedResponse = await infractionsService.getArchived(filters, 1, 100)

      let uniqueArchived: APIInfraction[] = []

      if (archivedResponse.success && archivedResponse.data) {
        uniqueArchived = archivedResponse.data.infractions || []
      }

      // Apply status filter if selected
      let filteredArchives = uniqueArchived
      if (statusFilter !== 'Tous les statuts') {
        filteredArchives = uniqueArchived.filter(inf => {
          const displayStatus = mapStatutToPaymentStatus(inf.statut)
          return displayStatus === statusFilter
        })
      }

      // Convert to archive format
      const convertedArchives = filteredArchives.map(infractionToArchive)

      // Sort by date (most recent first)
      convertedArchives.sort((a, b) => {
        const dateA = new Date(a.dateArchivage.split('/').reverse().join('-'))
        const dateB = new Date(b.dateArchivage.split('/').reverse().join('-'))
        return dateB.getTime() - dateA.getTime()
      })

      setArchives(convertedArchives)

      // Calculate stats
      const total = convertedArchives.length
      const payes = convertedArchives.filter(a => a.statutPaiement === 'Payé').length
      const annules = convertedArchives.filter(a => a.statutPaiement === 'Annulé').length
      const montantTotal = convertedArchives
        .filter(a => a.statutPaiement === 'Payé')
        .reduce((sum, a) => sum + a.montant, 0)

      setStats({
        totalArchives: total,
        payes,
        annules,
        montantTotal
      })
    } catch (err) {
      console.error('Error fetching archives:', err)
      setError('Erreur lors du chargement des archives')
    } finally {
      setLoading(false)
    }
  }, [dateDebut, dateFin, searchTerm, statusFilter])

  useEffect(() => {
    fetchArchives()
  }, [fetchArchives])

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const formatMontant = (montant: number) => {
    if (montant >= 1000000) {
      return `${(montant / 1000000).toFixed(1)}M`
    }
    if (montant >= 1000) {
      return `${(montant / 1000).toFixed(0)}K`
    }
    return `${formatNumber(montant)}`
  }

  const handleControlClick = (pvId: string) => {
    router.push(`/gestion/verbalisations/${pvId}`)
  }

  const getStatutColor = (statut: PaymentStatus) => {
    switch (statut) {
      case 'Payé':
        return 'bg-green-500 text-white'
      case 'Non payé':
        return 'bg-yellow-500 text-white'
      case 'En retard':
        return 'bg-red-500 text-white'
      case 'Annulé':
        return 'bg-gray-500 text-white'
    }
  }

  const getStatutIcon = (statut: PaymentStatus) => {
    switch (statut) {
      case 'Payé':
        return <CheckCircle className="w-4 h-4" />
      case 'Non payé':
        return <Clock className="w-4 h-4" />
      case 'En retard':
        return <AlertTriangle className="w-4 h-4" />
      case 'Annulé':
        return <XCircle className="w-4 h-4" />
    }
  }

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    const currentPageArchives = archives.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    const allSelected = currentPageArchives.every(item => selectedItems.includes(item.id))

    if (allSelected) {
      setSelectedItems(prev => prev.filter(id => !currentPageArchives.find(a => a.id === id)))
    } else {
      setSelectedItems(prev => [...new Set([...prev, ...currentPageArchives.map(item => item.id)])])
    }
  }

  const handleApplyFilters = () => {
    setCurrentPage(1)
    fetchArchives()
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setStatusFilter('Tous les statuts')
    setDateDebut('')
    setDateFin('')
    setCurrentPage(1)
  }

  // Open unarchive modal for batch
  const handleUnarchiveSelectedClick = () => {
    if (selectedItems.length === 0) {
      alert('Aucun élément sélectionné')
      return
    }

    setIsBatchUnarchive(true)
    setPvToUnarchive(null)
    setShowUnarchiveModal(true)
  }

  // Unarchive selected infractions (batch) - called from modal
  const handleUnarchiveConfirm = async () => {
    if (isBatchUnarchive) {
      // Batch unarchive - all selected items
      const itemsToUnarchive = archives.filter(a => selectedItems.includes(a.id))

      setArchivingId('batch')
      try {
        const unarchivePromises = itemsToUnarchive.map(item =>
          infractionsService.unarchive(item.id)
        )
        await Promise.all(unarchivePromises)

        setArchives(prev => prev.filter(archive =>
          !itemsToUnarchive.find(a => a.id === archive.id)
        ))
        setSelectedItems([])
        setShowUnarchiveModal(false)
      } catch (err) {
        console.error('Error unarchiving:', err)
        alert('Erreur lors du désarchivage des PV')
      } finally {
        setArchivingId(null)
      }
    } else if (pvToUnarchive) {
      // Single unarchive
      setArchivingId(pvToUnarchive.id)
      try {
        const response = await infractionsService.unarchive(pvToUnarchive.id)
        if (response.success && response.data?.success) {
          setArchives(prev => prev.filter(archive => archive.id !== pvToUnarchive.id))
          setShowUnarchiveModal(false)
          setPvToUnarchive(null)
        } else {
          alert(response.data?.message || 'Erreur lors du désarchivage')
        }
      } catch (err) {
        console.error('Error unarchiving:', err)
        alert('Erreur lors du désarchivage du PV')
      } finally {
        setArchivingId(null)
      }
    }
  }

  // Open unarchive modal for single item
  const handleUnarchiveSingleClick = (pv: PVArchive) => {
    setIsBatchUnarchive(false)
    setPvToUnarchive(pv)
    setShowUnarchiveModal(true)
  }

  // Count selected items (all are ARCHIVEE, so all can be unarchived)
  const unarchivableCount = selectedItems.length

  // Pagination
  const totalPages = Math.ceil(archives.length / itemsPerPage)
  const paginatedArchives = archives.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Archives des Verbalisations</h1>
            <p className="text-slate-600">{commissariatName} - {commissariatZone}</p>
          </div>
        </div>
        <p className="text-slate-600">Historique complet des PV archivés (payés ou annulés)</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Chargement des archives...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="bg-red-50 border-red-200 mb-8">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertTriangle className="w-6 h-6" />
              <span>{error}</span>
            </div>
          </CardBody>
        </Card>
      )}

      {!loading && !error && (
        <>
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
                <div className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(stats.totalArchives)}</div>
                <div className="text-sm text-slate-500">
                  PV archivés
                </div>
              </CardBody>
            </Card>

            <Card className="bg-white border border-gray-200 border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-600 text-sm font-medium uppercase">PV Payés</h3>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(stats.payes)}</div>
                <div className="text-sm text-slate-500">
                  {stats.totalArchives > 0 ? ((stats.payes / stats.totalArchives) * 100).toFixed(1) : 0}% des archives
                </div>
              </CardBody>
            </Card>

            <Card className="bg-white border border-gray-200 border-t-4 border-t-gray-500 hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-600 text-sm font-medium uppercase">PV Annulés</h3>
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(stats.annules)}</div>
                <div className="text-sm text-slate-500">
                  {stats.totalArchives > 0 ? ((stats.annules / stats.totalArchives) * 100).toFixed(1) : 0}% des archives
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
                <div className="text-4xl font-bold text-slate-900 mb-2">{formatMontant(stats.montantTotal)} FCFA</div>
                <div className="text-sm text-slate-500">
                  Recettes archivées
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Filtres */}
          <Card className="mb-8">
            <CardBody className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher PV, conducteur..."
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
                  <option>Payé</option>
                  <option>Annulé</option>
                </select>

                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="date"
                    placeholder="Date début"
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                  />
                </div>

                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="date"
                    placeholder="Date fin"
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleApplyFilters} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Filter className="w-5 h-5" />
                  Appliquer les filtres
                </Button>
                <Button onClick={handleResetFilters} className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-300">
                  Réinitialiser
                </Button>
              </div>
            </CardBody>
          </Card>

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
                    <Button
                      onClick={handleUnarchiveSelectedClick}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2"
                    >
                      <ArchiveRestore className="w-4 h-4" />
                      Désarchiver ({selectedItems.length})
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2">
                      <Download className="w-4 h-4" />
                      Exporter
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2">
                      <Printer className="w-4 h-4" />
                      Imprimer
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Empty State */}
          {archives.length === 0 && (
            <Card className="bg-gray-50">
              <CardBody className="p-12 text-center">
                <Archive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune archive trouvée</h3>
                <p className="text-gray-500">Aucun PV archivé ne correspond aux critères de recherche.</p>
              </CardBody>
            </Card>
          )}

          {/* Tableau des archives */}
          {archives.length > 0 && (
            <Card className="mb-8">
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={paginatedArchives.every(item => selectedItems.includes(item.id))}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 rounded border-slate-300"
                          />
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Numéro PV</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date Émission</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Véhicule</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Conducteur</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Montant</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Statut</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date Archivage</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Résolution</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedArchives.map((pv) => (
                        <tr
                          onClick={() => handleControlClick(pv.id)}
                          key={pv.id}
                          className="hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(pv.id)}
                              onChange={() => toggleSelectItem(pv.id)}
                              className="w-4 h-4 rounded border-slate-300"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-900">{pv.numero}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-slate-900">{pv.dateEmission}</div>
                              <div className="text-sm text-slate-500">{pv.heureEmission}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-900">{pv.immatriculation}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-slate-900">{pv.conducteur}</div>
                              <div className="text-sm text-slate-500">{pv.infractions} infraction{pv.infractions > 1 ? 's' : ''}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-bold text-slate-900">{formatNumber(pv.montant)} FCFA</div>
                              {pv.penalites && (
                                <div className="text-xs text-red-600">+ {formatNumber(pv.penalites)} pénalités</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-bold rounded-full ${getStatutColor(pv.statutPaiement)}`}>
                              {getStatutIcon(pv.statutPaiement)}
                              {pv.statutPaiement}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Archive className="w-4 h-4" />
                              <span className="text-sm">{pv.dateArchivage}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-slate-600 max-w-xs truncate block">{pv.resolution}</span>
                          </td>
                          <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleControlClick(pv.id)}
                                className="p-2 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                                title="Voir détails"
                              >
                                <Eye className="w-4 h-4 text-blue-600" />
                              </button>
                              <button
                                onClick={() => alert(`Impression du ${pv.numero}`)}
                                className="p-2 hover:bg-indigo-100 rounded-lg transition-colors"
                                title="Imprimer"
                              >
                                <Printer className="w-4 h-4 text-indigo-600" />
                              </button>
                              {/* Bouton de désarchivage */}
                              <button
                                onClick={() => handleUnarchiveSingleClick(pv)}
                                className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                                title="Désarchiver"
                              >
                                <ArchiveRestore className="w-4 h-4 text-green-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-200 gap-4">
                  <p className="text-sm text-slate-600">
                    Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, archives.length)} sur {formatNumber(archives.length)} archives
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 border border-slate-200 rounded-lg transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}
                    >
                      <span className="text-sm text-slate-600">←</span>
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1
                      if (totalPages > 5) {
                        if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-4 py-2 rounded-lg font-medium ${currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-slate-200 hover:bg-slate-50 text-slate-600'
                            }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="px-2 text-slate-400">...</span>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <span className="text-sm text-slate-600">{totalPages}</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className={`px-3 py-2 border border-slate-200 rounded-lg transition-colors ${currentPage === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}
                    >
                      <span className="text-sm text-slate-600">→</span>
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </>
      )}

      {/* Modal de confirmation de désarchivage */}
      <UnarchiveConfirmModal
        isOpen={showUnarchiveModal}
        onClose={() => {
          setShowUnarchiveModal(false)
          setPvToUnarchive(null)
          setIsBatchUnarchive(false)
        }}
        onConfirm={handleUnarchiveConfirm}
        pvNumero={pvToUnarchive?.numero}
        count={isBatchUnarchive ? unarchivableCount : undefined}
        loading={archivingId === 'batch' || archivingId === pvToUnarchive?.id}
      />
    </div>
  )
}
