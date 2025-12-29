'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Search, Filter, Download, Eye, Printer, Calendar,
  AlertTriangle, CheckCircle, Clock, Archive,
  DollarSign, Trash2, FolderOpen, XCircle, Loader2, ChevronLeft, ChevronRight, RotateCcw
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'
import { infractionsService, type APIInfraction } from '@/lib/api/services'

type PaymentStatus = 'Payé' | 'Archivé' | 'Annulé'

type AmendeArchive = {
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
  statutPaiement: PaymentStatus
  modePaiement?: string
  agent: string
  lieu: string
  infractions: number
  dateArchivage: string
  resolution: string
  statutOriginal: string
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

// Calculate date limite (30 days after emission)
const getDateLimite = (dateEmission: string): string => {
  const date = new Date(dateEmission)
  date.setDate(date.getDate() + 30)
  return formatDate(date.toISOString())
}

// Map API status to display status
const mapStatutToPaymentStatus = (statut: string): PaymentStatus => {
  switch (statut) {
    case 'PAYEE':
      return 'Payé'
    case 'ARCHIVEE':
      return 'Archivé'
    case 'ANNULEE':
      return 'Annulé'
    default:
      return 'Archivé'
  }
}

// Get resolution text based on status
const getResolutionText = (statut: string): string => {
  switch (statut) {
    case 'PAYEE':
      return 'Amende payée'
    case 'ARCHIVEE':
      return 'Archivée après traitement'
    case 'ANNULEE':
      return 'Annulée'
    default:
      return 'Archivée'
  }
}

// Convert API infraction to AmendeArchive
const infractionToArchive = (infraction: APIInfraction): AmendeArchive => {
  const contrevenant = infraction.conducteur
    ? `${infraction.conducteur.nom} ${infraction.conducteur.prenom}`
    : 'Inconnu'

  return {
    id: infraction.id,
    numero: `#AMN-${infraction.numero_pv}`,
    pv: infraction.numero_pv,
    contrevenant,
    telephone: infraction.conducteur?.numero_permis ? `Permis: ${infraction.conducteur.numero_permis}` : 'N/A',
    montant: infraction.montant_amende,
    dateEmission: formatDate(infraction.date_infraction),
    dateLimite: getDateLimite(infraction.date_infraction),
    datePaiement: infraction.statut === 'PAYEE' ? formatDate(infraction.updated_at) : undefined,
    statutPaiement: mapStatutToPaymentStatus(infraction.statut),
    agent: infraction.controle?.agent_nom || 'N/A',
    lieu: infraction.lieu_infraction || 'Non spécifié',
    infractions: 1,
    dateArchivage: formatDate(infraction.updated_at),
    resolution: getResolutionText(infraction.statut),
    statutOriginal: infraction.statut
  }
}

export default function ArchivesAmendesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tous les statuts')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // API data states
  const [archives, setArchives] = useState<AmendeArchive[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unarchiving, setUnarchiving] = useState<string | null>(null)

  const [stats, setStats] = useState({
    totalArchives: 0,
    payes: 0,
    archives: 0,
    annules: 0,
    montantTotal: 0,
    penalitesTotal: 0
  })

  const commissariatName = "Commissariat 3ème Arrondissement"
  const commissariatZone = "Cocody - 2 Plateaux"

  // Fetch archives (PAYEE and ARCHIVEE statuses)
  const fetchArchives = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch paid infractions
      const payeesResponse = await infractionsService.getAll({ statut: 'PAYEE' }, 1, 100)
      // Fetch archived infractions
      const archiveesResponse = await infractionsService.getAll({ statut: 'ARCHIVEE' }, 1, 100)

      const payees = payeesResponse.success && payeesResponse.data?.infractions ? payeesResponse.data.infractions : []
      const archivees = archiveesResponse.success && archiveesResponse.data?.infractions ? archiveesResponse.data.infractions : []

      // Combine and convert
      const allArchives = [...payees, ...archivees].map(infractionToArchive)

      // Apply filters
      let filtered = allArchives

      // Status filter
      if (statusFilter !== 'Tous les statuts') {
        filtered = filtered.filter(a => a.statutPaiement === statusFilter)
      }

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        filtered = filtered.filter(a =>
          a.numero.toLowerCase().includes(search) ||
          a.pv.toLowerCase().includes(search) ||
          a.contrevenant.toLowerCase().includes(search)
        )
      }

      // Date filters
      if (dateDebut) {
        const start = new Date(dateDebut)
        filtered = filtered.filter(a => {
          const date = new Date(a.dateArchivage.split('/').reverse().join('-'))
          return date >= start
        })
      }

      if (dateFin) {
        const end = new Date(dateFin)
        filtered = filtered.filter(a => {
          const date = new Date(a.dateArchivage.split('/').reverse().join('-'))
          return date <= end
        })
      }

      setArchives(filtered)

      // Calculate stats
      const montantTotal = allArchives.reduce((sum, a) => sum + a.montant, 0)
      const payesCount = payees.length
      const archivesCount = archivees.length

      setStats({
        totalArchives: allArchives.length,
        payes: payesCount,
        archives: archivesCount,
        annules: 0,
        montantTotal,
        penalitesTotal: 0
      })
    } catch (err) {
      console.error('Error fetching archives:', err)
      setError('Erreur lors du chargement des archives')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchTerm, dateDebut, dateFin])

  useEffect(() => {
    fetchArchives()
  }, [fetchArchives])

  const totalPages = Math.ceil(archives.length / itemsPerPage)
  const paginatedArchives = archives.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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

  const getStatutColor = (statut: PaymentStatus) => {
    switch (statut) {
      case 'Payé':
        return 'bg-green-500 text-white'
      case 'Archivé':
        return 'bg-blue-500 text-white'
      case 'Annulé':
        return 'bg-gray-500 text-white'
    }
  }

  const getStatutIcon = (statut: PaymentStatus) => {
    switch (statut) {
      case 'Payé':
        return <CheckCircle className="w-4 h-4" />
      case 'Archivé':
        return <Archive className="w-4 h-4" />
      case 'Annulé':
        return <XCircle className="w-4 h-4" />
    }
  }

  const handleControlClick = (amendeId: string) => {
    router.push(`/gestion/amendes/${amendeId}`)
  }

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === paginatedArchives.length
        ? []
        : paginatedArchives.map(item => item.id)
    )
  }

  // Unarchive an infraction
  const handleUnarchive = async (amende: AmendeArchive) => {
    if (!confirm(`Désarchiver l'amende ${amende.numero} ?`)) return

    setUnarchiving(amende.id)
    try {
      const response = await infractionsService.unarchive(amende.id)
      if (response.success) {
        // Remove from list
        setArchives(prev => prev.filter(a => a.id !== amende.id))
        setStats(prev => ({
          ...prev,
          totalArchives: prev.totalArchives - 1,
          archives: prev.archives - 1
        }))
      } else {
        alert('Erreur lors du désarchivage')
      }
    } catch (err) {
      console.error('Error unarchiving:', err)
      alert('Erreur lors du désarchivage')
    } finally {
      setUnarchiving(null)
    }
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Archives des Amendes</h1>
            <p className="text-slate-600">{commissariatName} - {commissariatZone}</p>
          </div>
        </div>
      </div>

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
              Amendes archivées
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Amendes Payées</h3>
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

        <Card className="bg-white border border-gray-200 border-t-4 border-t-indigo-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Archivées</h3>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(stats.archives)}</div>
            <div className="text-sm text-slate-500">
              {stats.totalArchives > 0 ? ((stats.archives / stats.totalArchives) * 100).toFixed(1) : 0}% des archives
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
              Total des amendes archivées
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
                placeholder="Rechercher amende, contrevenant..."
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
              <option>Archivé</option>
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
            <Button onClick={fetchArchives} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Filter className="w-5 h-5" />
              Appliquer les filtres
            </Button>
            <Button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('Tous les statuts')
                setDateDebut('')
                setDateFin('')
              }}
              className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-300"
            >
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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Chargement des archives...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertTriangle className="w-6 h-6" />
              <span>{error}</span>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && archives.length === 0 && (
        <Card className="bg-gray-50">
          <CardBody className="p-12 text-center">
            <Archive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune archive trouvée</h3>
            <p className="text-gray-500">Aucune amende archivée ne correspond aux critères de recherche.</p>
          </CardBody>
        </Card>
      )}

      {/* Tableau des archives */}
      {!loading && !error && archives.length > 0 && (
        <Card className="mb-8">
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === paginatedArchives.length && paginatedArchives.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-slate-300"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">N° Amende</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">PV Associé</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Contrevenant</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Montant</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Statut</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date Archivage</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Résolution</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedArchives.map((amende) => (
                    <tr
                      onClick={() => handleControlClick(amende.id)}
                      key={amende.id}
                      className="hover:bg-slate-50 cursor-pointer"
                    >
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(amende.id)}
                          onChange={() => toggleSelectItem(amende.id)}
                          className="w-4 h-4 rounded border-slate-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">{amende.numero}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-blue-600 hover:text-blue-800 underline font-medium">
                          {amende.pv}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-slate-900">{amende.contrevenant}</div>
                          <div className="text-sm text-slate-500">{amende.telephone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-bold text-slate-900">{formatNumber(amende.montant)} FCFA</div>
                          {amende.penalites && (
                            <div className="text-xs text-red-600">+ {formatNumber(amende.penalites)} pénalités</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-bold rounded-full ${getStatutColor(amende.statutPaiement)}`}>
                          {getStatutIcon(amende.statutPaiement)}
                          {amende.statutPaiement}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Archive className="w-4 h-4" />
                          <span className="text-sm">{amende.dateArchivage}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-600 max-w-xs truncate block">{amende.resolution}</span>
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleControlClick(amende.id)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </button>
                          {amende.statutOriginal === 'ARCHIVEE' && (
                            <button
                              onClick={() => handleUnarchive(amende)}
                              disabled={unarchiving === amende.id}
                              className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
                              title="Désarchiver"
                            >
                              {unarchiving === amende.id ? (
                                <Loader2 className="w-4 h-4 text-orange-600 animate-spin" />
                              ) : (
                                <RotateCcw className="w-4 h-4 text-orange-600" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => alert(`Impression de ${amende.numero}`)}
                            className="p-2 hover:bg-indigo-100 rounded-lg transition-colors"
                            title="Imprimer"
                          >
                            <Printer className="w-4 h-4 text-indigo-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-200 gap-4">
                <p className="text-sm text-slate-600">
                  Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, archives.length)} sur {formatNumber(archives.length)} archives
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="px-4 py-2 text-sm font-medium">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
