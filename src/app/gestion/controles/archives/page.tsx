'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Search, Filter, Download, Eye, Printer, Calendar,
  CheckCircle, XCircle, Archive, Shield, Trash2, FolderOpen, Loader2, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useGestionLayout } from '@/contexts/GestionLayoutContext'
import {
  controlesService,
  type FilterControles,
  StatutControle,
} from '@/lib/api/services'

type ControlStatus = 'Conforme' | 'Infraction' | 'Avertissement'

type ControlArchive = {
  id: string
  date: string
  heure: string
  immatriculation: string
  conducteur: string
  agent: string
  lieu: string
  statut: ControlStatus
  pv: string | null
  montant: number | null
  infraction?: string
  dateArchivage: string
  resolution: string
}

export default function ArchivesControlesPage() {
  const router = useRouter()
  const { setTitle, setSubtitle } = useGestionLayout()
  const { user: currentUser, loading: authLoading } = useAuth()

  // Loading and error state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Archives data
  const [archives, setArchives] = useState<ControlArchive[]>([])
  const [totalArchives, setTotalArchives] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tous les statuts')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Stats
  const [stats, setStats] = useState({
    totalArchives: 0,
    conformes: 0,
    infractions: 0,
    avertissements: 0,
    tauxResolution: 0
  })

  // Set title with commissariat name when user is loaded
  useEffect(() => {
    if (currentUser) {
      setTitle("Archives des Controles")
      if (currentUser.commissariat?.nom) {
        setSubtitle(`${currentUser.commissariat.nom} - Archives des controles clotures`)
      } else {
        setSubtitle("Archives des controles clotures")
      }
    }
  }, [currentUser, setTitle, setSubtitle])

  // Map API response to archive type
  const mapApiControleToArchive = (apiControle: any): ControlArchive => {
    const dateControle = new Date(apiControle.date_controle)
    const archivedAt = apiControle.archived_at ? new Date(apiControle.archived_at) : new Date(apiControle.updated_at || apiControle.date_controle)

    // Determine status based on API statut and infractions
    let statut: ControlStatus = 'Conforme'
    let resolution = 'Aucune action requise'
    const hasInfractions = apiControle.infractions && apiControle.infractions.length > 0

    if (apiControle.statut === StatutControle.NON_CONFORME || hasInfractions) {
      if (hasInfractions) {
        statut = 'Infraction'
        // Check if paid based on PV status
        const pvPaye = apiControle.pv?.statut === 'PAYE'
        resolution = pvPaye ? 'Amende payee - Dossier clos' : 'En attente de regularisation'
      } else {
        statut = 'Avertissement'
        resolution = 'Avertissement verbal - Archive'
      }
    }

    const montant = apiControle.infractions?.reduce((sum: number, i: any) => sum + (i.montant_amende || 0), 0) || null

    return {
      id: apiControle.id,
      date: dateControle.toLocaleDateString('fr-FR'),
      heure: dateControle.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      immatriculation: apiControle.vehicule_immatriculation || '-',
      conducteur: `${apiControle.conducteur_nom || ''} ${apiControle.conducteur_prenom || ''}`.trim() || '-',
      agent: apiControle.agent ? `${apiControle.agent.prenom} ${apiControle.agent.nom}` : '-',
      lieu: apiControle.lieu_controle || '-',
      statut,
      pv: apiControle.infractions?.[0]?.numero_pv || null,
      montant,
      infraction: apiControle.infractions?.[0]?.type_infraction,
      dateArchivage: archivedAt.toLocaleDateString('fr-FR'),
      resolution
    }
  }

  // Fetch archives (completed/closed controles)
  const fetchArchives = useCallback(async () => {
    if (!currentUser?.commissariatId) return

    setLoading(true)
    setError(null)

    try {
      // Filter for archived controles only
      const filters: FilterControles = {
        commissariat_id: currentUser.commissariatId,
        is_archived: true, // Only archived controles
        date_debut: dateDebut || undefined,
        date_fin: dateFin || undefined,
        search: searchTerm || undefined,
      }

      const response = await controlesService.getAll(filters, page, limit)

      if (response.success && response.data) {
        const apiData = response.data as any
        const rawControles = apiData.controles || apiData.data || []

        // Filter based on status filter
        let filteredControles = rawControles
        if (statusFilter !== 'Tous les statuts') {
          filteredControles = rawControles.filter((c: any) => {
            const hasInfractions = c.infractions && c.infractions.length > 0
            if (statusFilter === 'Conforme') {
              return c.statut === StatutControle.CONFORME && !hasInfractions
            } else if (statusFilter === 'Infraction') {
              return hasInfractions
            } else if (statusFilter === 'Avertissement') {
              return c.statut === StatutControle.NON_CONFORME && !hasInfractions
            }
            return true
          })
        }

        const mappedArchives = filteredControles.map(mapApiControleToArchive)
        setArchives(mappedArchives)
        setTotalArchives(apiData.total || mappedArchives.length)

        // Calculate stats
        const conformes = mappedArchives.filter(a => a.statut === 'Conforme').length
        const infractions = mappedArchives.filter(a => a.statut === 'Infraction').length
        const avertissements = mappedArchives.filter(a => a.statut === 'Avertissement').length
        const resolus = mappedArchives.filter(a => a.resolution.includes('clos') || a.resolution.includes('Archive')).length

        setStats({
          totalArchives: apiData.total || mappedArchives.length,
          conformes,
          infractions,
          avertissements,
          tauxResolution: mappedArchives.length > 0 ? (resolus / mappedArchives.length) * 100 : 0
        })
      }
    } catch (err) {
      console.error('Error fetching archives:', err)
      setError("Erreur lors du chargement des archives")
    } finally {
      setLoading(false)
    }
  }, [currentUser?.commissariatId, page, limit, searchTerm, statusFilter, dateDebut, dateFin])

  // Fetch archives when user or filters change
  useEffect(() => {
    if (currentUser?.commissariatId) {
      fetchArchives()
    }
  }, [currentUser?.commissariatId, fetchArchives])

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const getStatColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'border-t-blue-500',
      green: 'border-t-green-500',
      red: 'border-t-red-500',
      purple: 'border-t-purple-500'
    }
    return colors[color] || 'border-t-gray-500'
  }

  const getStatutColor = (statut: ControlStatus) => {
    switch (statut) {
      case 'Conforme':
        return 'bg-green-500 text-white'
      case 'Infraction':
        return 'bg-red-500 text-white'
      case 'Avertissement':
        return 'bg-yellow-500 text-white'
    }
  }

  const handleControlClick = (controleId: string) => {
    router.push(`/gestion/controles/${controleId}`)
  }

  const toggleSelectItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === archives.length
        ? []
        : archives.map(item => item.id)
    )
  }

  const handleApplyFilters = () => {
    setPage(1)
    fetchArchives()
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setStatusFilter('Tous les statuts')
    setDateDebut('')
    setDateFin('')
    setPage(1)
  }

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-slate-600">Chargement...</span>
        </div>
      </div>
    )
  }

  // Show error if no commissariat assigned
  if (!currentUser?.commissariatId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-slate-700 mb-2 font-medium">Aucun commissariat assigne</p>
          <p className="text-slate-500 mb-4">Veuillez vous reconnecter pour acceder aux archives de votre commissariat.</p>
          <Button onClick={() => router.push('/auth/login')}>Se reconnecter</Button>
        </div>
      </div>
    )
  }

  // Show loading state while fetching archives
  if (loading && !archives.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-slate-600">Chargement des archives...</span>
        </div>
      </div>
    )
  }

  // Show error state
  if (error && !archives.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchArchives}>Reessayer</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FolderOpen className="w-8 h-8 text-slate-600" />
          <h1 className="text-3xl font-bold text-slate-900">Archives des Controles</h1>
        </div>
        <p className="text-slate-600">{currentUser?.commissariat?.nom || 'Votre commissariat'}</p>
      </div>

      {/* Statistiques des archives */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className={`border-t-4 ${getStatColor('blue')} hover:shadow-lg transition-all duration-300`}>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Total Archives</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Archive className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(stats.totalArchives)}</div>
            <div className="text-sm text-slate-500">
              Controles archives
            </div>
          </CardBody>
        </Card>

        <Card className={`border-t-4 ${getStatColor('green')} hover:shadow-lg transition-all duration-300`}>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Conformes</h3>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(stats.conformes)}</div>
            <div className="text-sm text-slate-500">
              {stats.totalArchives > 0 ? ((stats.conformes / stats.totalArchives) * 100).toFixed(1) : 0}% des archives
            </div>
          </CardBody>
        </Card>

        <Card className={`border-t-4 ${getStatColor('red')} hover:shadow-lg transition-all duration-300`}>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Infractions</h3>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(stats.infractions)}</div>
            <div className="text-sm text-slate-500">
              {stats.totalArchives > 0 ? ((stats.infractions / stats.totalArchives) * 100).toFixed(1) : 0}% des archives
            </div>
          </CardBody>
        </Card>

        <Card className={`border-t-4 ${getStatColor('purple')} hover:shadow-lg transition-all duration-300`}>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Taux Resolution</h3>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{stats.tauxResolution.toFixed(1)}%</div>
            <div className="text-sm text-slate-500">
              Cas traites et clos
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="mb-8">
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher dans les archives..."
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
              <option>Conforme</option>
              <option>Infraction</option>
              <option>Avertissement</option>
            </select>

            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="date"
                placeholder="Date debut"
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
            <Button variant="primary" size="md" onClick={handleApplyFilters}>
              <Filter className="w-5 h-5" />
              Appliquer les filtres
            </Button>
            <Button variant="secondary" size="md" onClick={handleResetFilters}>
              Reinitialiser
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-slate-600">Chargement...</span>
        </div>
      )}

      {/* Actions groupees */}
      {selectedItems.length > 0 && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">
                  {selectedItems.length} element(s) selectionne(s)
                </span>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" size="sm">
                  <Download className="w-4 h-4" />
                  Exporter
                </Button>
                <Button variant="danger" size="sm">
                  <Trash2 className="w-4 h-4" />
                  Supprimer definitivement
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Tableau des archives */}
      <Card className="mb-8">
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === archives.length && archives.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date Controle</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Immatriculation</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Conducteur</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date Archivage</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Resolution</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {archives.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                      Aucune archive trouvee
                    </td>
                  </tr>
                ) : (
                  archives.map((controle) => (
                    <tr
                      key={controle.id}
                      onClick={() => handleControlClick(controle.id)}
                      className="hover:bg-blue-50 cursor-pointer transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(controle.id)}
                          onChange={(e) => toggleSelectItem(controle.id, e as any)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-slate-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">{controle.id.substring(0, 12)}...</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-slate-900">{controle.date}</div>
                          <div className="text-sm text-slate-500">{controle.heure}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">{controle.immatriculation}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-900">{controle.conducteur}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatutColor(controle.statut)}`}>
                          {controle.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Archive className="w-4 h-4" />
                          <span className="text-sm">{controle.dateArchivage}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-600 max-w-xs truncate block">{controle.resolution}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleControlClick(controle.id)
                            }}
                            className="p-2 hover:bg-slate-100 cursor-pointer rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </button>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Printer className="w-4 h-4 text-slate-600" />
                          </button>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Affichage de {((page - 1) * limit) + 1} a {Math.min(page * limit, totalArchives)} sur {formatNumber(totalArchives)} archives
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <span className="text-sm text-slate-600">Precedent</span>
              </button>
              <span className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
                {page}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * limit >= totalArchives}
                className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <span className="text-sm text-slate-600">Suivant</span>
              </button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
