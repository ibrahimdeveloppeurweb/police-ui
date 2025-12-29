'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Search, Filter, Download, Eye, Printer, Calendar, MapPin, User,
  Car, AlertTriangle, CheckCircle, XCircle, FileText, Archive,
  Clock, Shield, ClipboardCheck, Wrench, Trash2, FolderOpen, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'
import {
  inspectionsService,
  type Inspection as ApiInspection
} from '@/lib/api/services'

type InspectionStatus = 'Conforme' | 'Non-conforme' | 'A surveiller'

type InspectionArchive = {
  id: string
  date: string
  heure: string
  immatriculation: string
  marque: string
  modele: string
  conducteur: string
  agent: string
  lieu: string
  statut: InspectionStatus
  type: string
  defauts: string[]
  rapport: string | null
  observations: string
  dateArchivage: string
  resolution: string
}

interface Stats {
  totalArchives: number
  conformes: number
  nonConformes: number
  aSurveiller: number
  tauxResolution: number
}

export default function ArchivesInspectionsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tous les statuts')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [archivesData, setArchivesData] = useState<InspectionArchive[]>([])
  const [stats, setStats] = useState<Stats>({
    totalArchives: 0,
    conformes: 0,
    nonConformes: 0,
    aSurveiller: 0,
    tauxResolution: 0
  })

  // Mapper le statut API vers le statut d'affichage
  const mapStatut = (statut: string): InspectionStatus => {
    const upperStatut = statut?.toUpperCase() || ''
    if (upperStatut === 'CONFORME' || upperStatut === 'PASSED') return 'Conforme'
    if (upperStatut === 'NON_CONFORME' || upperStatut === 'FAILED') return 'Non-conforme'
    return 'A surveiller'
  }

  // Transformer les données API en données d'affichage
  const transformInspection = (apiInsp: ApiInspection): InspectionArchive => {
    const date = new Date(apiInsp.date_inspection)
    const archiveDate = new Date(apiInsp.updated_at || apiInsp.created_at)
    return {
      id: `#INS-${apiInsp.id.substring(0, 8).toUpperCase()}`,
      date: date.toLocaleDateString('fr-FR'),
      heure: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      immatriculation: apiInsp.vehicule_immatriculation,
      marque: apiInsp.vehicule_marque,
      modele: apiInsp.vehicule_modele,
      conducteur: `${apiInsp.conducteur_prenom} ${apiInsp.conducteur_nom}`,
      agent: apiInsp.inspecteur ? `${apiInsp.inspecteur.prenom} ${apiInsp.inspecteur.nom}` : 'Non assigné',
      lieu: apiInsp.lieu_inspection || 'Non spécifié',
      statut: mapStatut(apiInsp.statut),
      type: 'Inspection technique',
      defauts: apiInsp.verifications_echec > 0 ? ['Vérifications échouées'] : [],
      rapport: apiInsp.numero ? `RAPP-${apiInsp.numero}` : null,
      observations: apiInsp.observations || '',
      dateArchivage: archiveDate.toLocaleDateString('fr-FR'),
      resolution: ['PASSED', 'CONFORME'].includes(apiInsp.statut?.toUpperCase() || '') ? 'Aucune action requise' : 'En attente de traitement'
    }
  }

  // Calculer les statistiques à partir des inspections
  const calculateStats = useCallback((inspectionsList: ApiInspection[]): Stats => {
    const conformes = inspectionsList.filter(i => ['CONFORME', 'PASSED'].includes(i.statut?.toUpperCase())).length
    const nonConformes = inspectionsList.filter(i => ['NON_CONFORME', 'FAILED'].includes(i.statut?.toUpperCase())).length
    const aSurveiller = inspectionsList.length - conformes - nonConformes

    return {
      totalArchives: inspectionsList.length,
      conformes,
      nonConformes,
      aSurveiller,
      tauxResolution: inspectionsList.length > 0 ? Math.round((conformes / inspectionsList.length) * 100 * 10) / 10 : 0
    }
  }, [])

  // Charger les données depuis l'API (archives = inspections terminées)
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const filters: Record<string, string | undefined> = {
        statut: 'COMPLETED', // Les archives sont les inspections terminées
        search: searchTerm || undefined
      }

      if (statusFilter !== 'Tous les statuts') {
        filters.statut = statusFilter === 'Conforme' ? 'PASSED' : statusFilter === 'Non-conforme' ? 'FAILED' : 'COMPLETED'
      }

      if (dateDebut) filters.dateDebut = dateDebut
      if (dateFin) filters.dateFin = dateFin

      const response = await inspectionsService.getAll(filters, 1, 100)

      if (response.success && response.data) {
        const apiInspections = response.data.inspections || []
        setArchivesData(apiInspections.map(transformInspection))
        setStats(calculateStats(apiInspections))
      }
    } catch (error) {
      console.error('Erreur lors du chargement des archives:', error)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, statusFilter, dateDebut, dateFin, calculateStats])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const getStatColor = (color: string) => {
    const colors = {
      blue: 'border-t-blue-500',
      green: 'border-t-green-500',
      red: 'border-t-red-500',
      purple: 'border-t-purple-500'
    }
    return colors[color as keyof typeof colors]
  }

  const getStatutColor = (statut: InspectionStatus) => {
    switch (statut) {
      case 'Conforme':
        return 'bg-green-500 text-white'
      case 'Non-conforme':
        return 'bg-red-500 text-white'
      case 'A surveiller':
        return 'bg-orange-500 text-white'
    }
  }

    const handleControlClick = (inspectionId: string) => {
    const cleanId = inspectionId.replace('#INS-', '')
    router.push(`/gestion/inspections/${cleanId}`)
  }

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === archivesData.length
        ? []
        : archivesData.map(item => item.id)
    )
  }

  const handleApplyFilters = () => {
    fetchData()
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setStatusFilter('Tous les statuts')
    setDateDebut('')
    setDateFin('')
  }

  return (
    <div className="min-h-screen">
      {/* Indicateur de chargement */}
      {loading && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Chargement des archives...</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FolderOpen className="w-8 h-8 text-slate-600" />
          <h1 className="text-3xl font-bold text-slate-900">Archives des Inspections</h1>
        </div>
        <p className="text-slate-600">3ème Arrondissement - Adjamé, Abidjan</p>
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
              Inspections archivées
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
              {stats.totalArchives > 0 ? ((stats.conformes/stats.totalArchives)*100).toFixed(1) : 0}% des archives
            </div>
          </CardBody>
        </Card>

        <Card className={`border-t-4 ${getStatColor('red')} hover:shadow-lg transition-all duration-300`}>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Non-conformes</h3>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(stats.nonConformes)}</div>
            <div className="text-sm text-slate-500">
              {stats.totalArchives > 0 ? ((stats.nonConformes/stats.totalArchives)*100).toFixed(1) : 0}% des archives
            </div>
          </CardBody>
        </Card>

        <Card className={`border-t-4 ${getStatColor('purple')} hover:shadow-lg transition-all duration-300`}>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Taux Résolution</h3>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{stats.tauxResolution}%</div>
            <div className="text-sm text-slate-500">
              Cas résolus et traités
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
              <option>Non-conforme</option>
              <option>A surveiller</option>
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
            <Button variant="primary" size="md" onClick={handleApplyFilters}>
              <Filter className="w-5 h-5" />
              Appliquer les filtres
            </Button>
            <Button variant="secondary" size="md" onClick={handleResetFilters}>
              Réinitialiser
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Actions groupées */}
      {selectedItems.length > 0 && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">
                  {selectedItems.length} élément(s) sélectionné(s)
                </span>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" size="sm">
                  <Download className="w-4 h-4" />
                  Exporter
                </Button>
                <Button variant="danger" size="sm">
                  <Trash2 className="w-4 h-4" />
                  Supprimer définitivement
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
                      checked={selectedItems.length === archivesData.length && archivesData.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date Inspection</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Véhicule</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Conducteur</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date Archivage</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Résolution</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {archivesData.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center text-gray-400">
                        <Archive className="w-12 h-12 mb-3" />
                        <p className="text-lg font-medium">Aucune archive trouvée</p>
                        <p className="text-sm">Modifiez vos filtres pour voir plus de résultats</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  archivesData.map((inspection) => (
                    <tr
                     key={inspection.id}
                      onClick={() => handleControlClick(inspection.id)}
                      className="hover:bg-slate-50 cursor-pointer">
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(inspection.id)}
                          onChange={() => toggleSelectItem(inspection.id)}
                          className="w-4 h-4 rounded border-slate-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">{inspection.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-slate-900">{inspection.date}</div>
                          <div className="text-sm text-slate-500">{inspection.heure}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-bold text-slate-900">{inspection.immatriculation}</div>
                          <div className="text-sm text-slate-500">{inspection.marque} {inspection.modele}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-900">{inspection.conducteur}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatutColor(inspection.statut)}`}>
                          {inspection.statut === 'Conforme' && '✓'}
                          {inspection.statut === 'Non-conforme' && '✗'}
                          {inspection.statut === 'A surveiller' && '!'}
                          {' '}{inspection.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Archive className="w-4 h-4" />
                          <span className="text-sm">{inspection.dateArchivage}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-600 max-w-xs truncate block">{inspection.resolution}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleControlClick(inspection.id)}  className="p-2 hover:bg-slate-100 cursor-pointer rounded-lg transition-colors">
                            <Eye className="w-4 h-4 text-slate-600" />
                          </button>
                          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" onClick={(e) => e.stopPropagation()}>
                            <Printer className="w-4 h-4 text-slate-600" />
                          </button>
                          <button className="p-2 hover:bg-red-100 rounded-lg transition-colors" onClick={(e) => e.stopPropagation()}>
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
              Affichage de 1 à {archivesData.length} sur {formatNumber(stats.totalArchives)} archives
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-sm text-slate-600">←</span>
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">1</button>
              <button className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-sm text-slate-600">2</span>
              </button>
              <button className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-sm text-slate-600">3</span>
              </button>
              <span className="px-2 text-slate-400">...</span>
              <button className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-sm text-slate-600">{Math.max(1, Math.ceil(stats.totalArchives / Math.max(archivesData.length, 1)))}</span>
              </button>
              <button className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-sm text-slate-600">→</span>
              </button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
