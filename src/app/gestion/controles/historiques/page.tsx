'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Search, Filter, Download, Eye, Printer, Calendar, User,
  CheckCircle, XCircle, Archive, DollarSign, Loader2, AlertTriangle
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

type Control = {
  id: string
  date: string
  heure: string
  immatriculation: string
  conducteur: string
  agent: string
  agentId: string
  lieu: string
  statut: ControlStatus
  pv: string | null
  montant: number | null
  infraction?: string
  suivi: string
}

export default function HistoriqueControlesPage() {
  const router = useRouter()
  const { setTitle, setSubtitle } = useGestionLayout()
  const { user: currentUser, loading: authLoading } = useAuth()

  // Loading and error state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Controls data
  const [controles, setControles] = useState<Control[]>([])
  const [totalControles, setTotalControles] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tous les statuts')
  const [agentFilter, setAgentFilter] = useState('Tous les agents')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')

  // Agents list for filter
  const [agents, setAgents] = useState<{ id: string, nom: string }[]>([])

  // Selection state for archiving
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [archiving, setArchiving] = useState(false)

  // Stats
  const [stats, setStats] = useState({
    totalControles: 0,
    conformes: 0,
    infractions: 0,
    avertissements: 0,
    tauxConformite: 0,
    revenusTotal: 0
  })

  // Set title with commissariat name when user is loaded
  useEffect(() => {
    if (currentUser) {
      setTitle("Historique des Controles")
      if (currentUser.commissariat?.nom) {
        setSubtitle(`${currentUser.commissariat.nom} - Historique complet des controles`)
      } else {
        setSubtitle("Historique complet des controles")
      }
    }
  }, [currentUser, setTitle, setSubtitle])

  // Map API response to control type
  const mapApiControle = (apiControle: any): Control => {
    const dateControle = new Date(apiControle.date_controle)

    // Determine status based on API statut and infractions
    let statut: ControlStatus = 'Conforme'
    let suivi = 'Aucune action requise'
    const hasInfractions = apiControle.infractions && apiControle.infractions.length > 0

    if (apiControle.statut === StatutControle.NON_CONFORME || hasInfractions) {
      if (hasInfractions) {
        statut = 'Infraction'
        const pvPaye = apiControle.pv?.statut === 'PAYE'
        if (pvPaye) {
          suivi = 'Amende payee'
        } else {
          suivi = 'En attente de paiement'
        }
      } else {
        statut = 'Avertissement'
        suivi = 'Avertissement verbal'
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
      agentId: apiControle.agent?.id || '',
      lieu: apiControle.lieu_controle || '-',
      statut,
      pv: apiControle.infractions?.[0]?.numero_pv || null,
      montant,
      infraction: apiControle.infractions?.[0]?.type_infraction,
      suivi
    }
  }

  // Fetch controles
  const fetchControles = useCallback(async () => {
    if (!currentUser?.commissariatId) return

    setLoading(true)
    setError(null)

    try {
      const filters: FilterControles = {
        commissariat_id: currentUser.commissariatId,
        is_archived: false, // Only non-archived controles
        date_debut: dateDebut || undefined,
        date_fin: dateFin || undefined,
        search: searchTerm || undefined,
      }

      const response = await controlesService.getAll(filters, page, limit)

      if (response.success && response.data) {
        const apiData = response.data as any
        const rawControles = apiData.controles || apiData.data || []

        // Map and filter
        let mappedControles = rawControles.map(mapApiControle)

        // Filter by status
        if (statusFilter !== 'Tous les statuts') {
          mappedControles = mappedControles.filter((c: Control) => c.statut === statusFilter)
        }

        // Filter by agent
        if (agentFilter !== 'Tous les agents') {
          mappedControles = mappedControles.filter((c: Control) => c.agent === agentFilter)
        }

        setControles(mappedControles)
        setTotalControles(apiData.total || mappedControles.length)

        // Extract unique agents for filter
        const uniqueAgents = new Map<string, { id: string, nom: string }>()
        rawControles.forEach((c: any) => {
          if (c.agent) {
            uniqueAgents.set(c.agent.id, {
              id: c.agent.id,
              nom: `${c.agent.prenom} ${c.agent.nom}`
            })
          }
        })
        setAgents(Array.from(uniqueAgents.values()))

        // Calculate stats from all data (not just filtered)
        const allMapped = rawControles.map(mapApiControle)
        const conformes = allMapped.filter((c: Control) => c.statut === 'Conforme').length
        const infractions = allMapped.filter((c: Control) => c.statut === 'Infraction').length
        const avertissements = allMapped.filter((c: Control) => c.statut === 'Avertissement').length
        const revenus = allMapped.reduce((sum: number, c: Control) => sum + (c.montant || 0), 0)

        setStats({
          totalControles: apiData.total || allMapped.length,
          conformes,
          infractions,
          avertissements,
          tauxConformite: allMapped.length > 0 ? (conformes / allMapped.length) * 100 : 0,
          revenusTotal: revenus
        })
      }
    } catch (err) {
      console.error('Error fetching controles:', err)
      setError("Erreur lors du chargement de l'historique")
    } finally {
      setLoading(false)
    }
  }, [currentUser?.commissariatId, page, limit, searchTerm, statusFilter, agentFilter, dateDebut, dateFin])

  // Fetch controles when user or filters change
  useEffect(() => {
    if (currentUser?.commissariatId) {
      fetchControles()
    }
  }, [currentUser?.commissariatId, fetchControles])

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

  const handleApplyFilters = () => {
    setPage(1)
    fetchControles()
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setStatusFilter('Tous les statuts')
    setAgentFilter('Tous les agents')
    setDateDebut('')
    setDateFin('')
    setPage(1)
  }

  const handleExport = () => {
    alert('Export de l\'historique en cours...\nFormat: CSV/Excel/PDF')
  }

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.size === controles.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(controles.map(c => c.id)))
    }
  }

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  // Archive selected controles
  const handleArchiveSelected = async () => {
    if (selectedIds.size === 0) return

    setArchiving(true)
    try {
      const archivePromises = Array.from(selectedIds).map(id =>
        controlesService.archive(id)
      )
      await Promise.all(archivePromises)

      // Clear selection and refresh
      setSelectedIds(new Set())
      fetchControles()
    } catch (err) {
      console.error('Error archiving controles:', err)
      alert('Erreur lors de l\'archivage des controles')
    } finally {
      setArchiving(false)
    }
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
          <p className="text-slate-500 mb-4">Veuillez vous reconnecter pour acceder a l'historique de votre commissariat.</p>
          <Button onClick={() => router.push('/auth/login')}>Se reconnecter</Button>
        </div>
      </div>
    )
  }

  // Show loading state while fetching controles
  if (loading && !controles.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-slate-600">Chargement de l'historique...</span>
        </div>
      </div>
    )
  }

  // Show error state
  if (error && !controles.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchControles}>Reessayer</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Archive className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">Historique des Controles</h1>
        </div>
        <p className="text-slate-600">{currentUser?.commissariat?.nom || 'Votre commissariat'}</p>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className={`border-t-4 ${getStatColor('blue')} hover:shadow-lg transition-all duration-300`}>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Total Historique</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Archive className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(stats.totalControles)}</div>
            <div className="text-sm text-slate-500">
              Depuis le debut de l'annee
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
              {stats.tauxConformite.toFixed(1)}% du total
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
              {stats.totalControles > 0 ? ((stats.infractions / stats.totalControles) * 100).toFixed(1) : 0}% du total
            </div>
          </CardBody>
        </Card>

        <Card className={`border-t-4 ${getStatColor('purple')} hover:shadow-lg transition-all duration-300`}>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Revenus Totaux</h3>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">
              {stats.revenusTotal >= 1000000
                ? `${(stats.revenusTotal / 1000000).toFixed(1)}M`
                : formatNumber(stats.revenusTotal)
              }
            </div>
            <div className="text-sm text-slate-500">
              FCFA collectes
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filtres avances */}
      <Card className="mb-8">
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par immatriculation, conducteur..."
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

            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            >
              <option>Tous les agents</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.nom}>{agent.nom}</option>
              ))}
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

      {/* Tableau historique */}
      <Card className="mb-8">
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={controles.length > 0 && selectedIds.size === controles.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date/Heure</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Immatriculation</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Conducteur</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Agent</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Montant</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Suivi</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {controles.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-slate-500">
                      Aucun controle trouve dans l'historique
                    </td>
                  </tr>
                ) : (
                  controles.map((controle) => (
                    <tr
                      key={controle.id}
                      onClick={() => handleControlClick(controle.id)}
                      className={`hover:bg-blue-50 cursor-pointer transition-colors ${selectedIds.has(controle.id) ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(controle.id)}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleSelectOne(controle.id)
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
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
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-900">{controle.agent}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatutColor(controle.statut)}`}>
                          {controle.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {controle.montant ? (
                          <div>
                            <div className="font-bold text-slate-900">{formatNumber(controle.montant)}</div>
                            <div className="text-xs text-slate-500">FCFA</div>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-600 max-w-xs truncate block">{controle.suivi}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleControlClick(controle.id)
                            }}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </button>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Printer className="w-4 h-4 text-slate-600" />
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
              Affichage de {((page - 1) * limit) + 1} a {Math.min(page * limit, totalControles)} sur {formatNumber(totalControles)} controles
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
                disabled={page * limit >= totalControles}
                className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <span className="text-sm text-slate-600">Suivant</span>
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Actions groupees */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="md"
            onClick={handleArchiveSelected}
            disabled={selectedIds.size === 0 || archiving}
          >
            {archiving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Archive className="w-5 h-5" />
            )}
            {archiving ? 'Archivage...' : `Archiver la selection ${selectedIds.size > 0 ? `(${selectedIds.size})` : ''}`}
          </Button>
          {selectedIds.size > 0 && (
            <span className="text-sm text-slate-600">
              {selectedIds.size} controle{selectedIds.size > 1 ? 's' : ''} selectionne{selectedIds.size > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <Button variant="success" size="md" onClick={handleExport}>
          <Download className="w-5 h-5" />
          Exporter l'Historique
        </Button>
      </div>
    </div>
  )
}
