'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Target, Users, Calendar, MapPin, Clock, Play, XCircle,
  Plus, Search, Activity, BarChart3,
  CheckCircle, ArrowRight, Printer, FileDown
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import Link from 'next/link'
import {
  missionService,
  type Mission, type FilterMissions,
  StatutMission, TypeMission
} from '@/lib/api/services'

type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'

export default function MissionsDashboardPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('tout')
  const [filterStatut, setFilterStatut] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)

  // Calculate date range based on period filter
  const getDateRangeForPeriod = useCallback((period: PeriodKey): { dateDebut?: string; dateFin?: string } => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]

    switch (period) {
      case 'jour':
        return { dateDebut: today, dateFin: today }
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
      case 'personnalise':
        return dateDebut && dateFin ? { dateDebut, dateFin } : {}
      case 'tout':
      default:
        return {}
    }
  }, [dateDebut, dateFin])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const dateRange = getDateRangeForPeriod(globalFilter)
      const filters: FilterMissions = {
        statut: filterStatut || undefined,
        type: filterType || undefined,
        dateDebut: dateRange.dateDebut,
        dateFin: dateRange.dateFin,
      }

      const response = await missionService.getAll(filters)
      if (response.success && response.data) {
        setMissions(response.data)
      }
    } catch (err) {
      console.error('Error fetching missions:', err)
      setError('Erreur lors du chargement des donnees')
    } finally {
      setLoading(false)
    }
  }, [globalFilter, filterStatut, filterType, getDateRangeForPeriod])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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
    alert('Export des donnees en cours...\nFormat: CSV/Excel/PDF')
  }

  // Filter missions by search term (client-side)
  const filteredMissions = missions.filter(m => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      const matchTitre = m.titre?.toLowerCase().includes(search)
      const matchZone = m.zone?.toLowerCase().includes(search)
      const matchType = m.type.toLowerCase().includes(search)
      if (!matchTitre && !matchZone && !matchType) return false
    }
    return true
  })

  // Stats
  const stats = {
    total: filteredMissions.length,
    planifiees: filteredMissions.filter(m => m.statut === StatutMission.PLANIFIEE).length,
    enCours: filteredMissions.filter(m => m.statut === StatutMission.EN_COURS).length,
    terminees: filteredMissions.filter(m => m.statut === StatutMission.TERMINEE).length,
    annulees: filteredMissions.filter(m => m.statut === StatutMission.ANNULEE).length,
  }

  // Stats par type
  const statsByType = Object.values(TypeMission).map(type => ({
    type,
    count: filteredMissions.filter(m => m.type === type).length,
    enCours: filteredMissions.filter(m => m.type === type && m.statut === StatutMission.EN_COURS).length,
  }))

  // Missions recentes (5 dernieres)
  const recentMissions = [...filteredMissions]
    .sort((a, b) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime())
    .slice(0, 5)

  // Missions en cours
  const activeMissions = filteredMissions.filter(m => m.statut === StatutMission.EN_COURS)

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case StatutMission.PLANIFIEE:
        return 'bg-blue-100 text-blue-800'
      case StatutMission.EN_COURS:
        return 'bg-green-100 text-green-800'
      case StatutMission.TERMINEE:
        return 'bg-slate-100 text-slate-800'
      case StatutMission.ANNULEE:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tableau de Bord - Missions</h1>
          <p className="text-slate-600 mt-2">Vue d'ensemble des missions en cours et planifiees</p>
        </div>
        <Link href="/admin/missions/listes">
          <Button variant="primary">
            <Plus className="w-5 h-5" />
            Gerer les Missions
          </Button>
        </Link>
      </div>

      {/* Filtre Global de Periode */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 mb-8">
        <CardBody className="p-4 md:p-6">
          <div className="space-y-4">
            {/* Header et boutons de periode */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Periode d'analyse</h2>
                  <p className="text-gray-600 text-xs md:text-sm hidden sm:block">
                    Selectionnez la periode pour filtrer toutes les donnees
                  </p>
                </div>
              </div>

              {/* Boutons de periode */}
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
                  Annee
                </Button>
                <Button
                  onClick={() => handleFilterChange('tout')}
                  className={`${globalFilter === 'tout' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Historique
                </Button>
              </div>
            </div>

            {/* Input de recherche + Selects */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-4 border-t border-blue-200">
              {/* Champ Input de recherche */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-[200px]">
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Rechercher:
                </label>
                <input
                  type="text"
                  placeholder="Rechercher par titre, zone, type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>

              {/* Select Statut */}
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                <option value="">Tous les statuts</option>
                {Object.values(StatutMission).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* Select Type */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                <option value="">Tous les types</option>
                {Object.values(TypeMission).map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            {/* Selection de dates personnalisees */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-4 border-t border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Date debut:
                </label>
                <input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Date fin:
                </label>
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

              {/* Separateur visuel */}
              <div className="hidden sm:block w-px h-8 bg-blue-300"></div>

              {/* Boutons Imprimer et Exporter */}
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

            {/* Badge de confirmation */}
            {isCustomDateRange && (
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg w-full sm:w-auto">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs md:text-sm font-medium">
                  Periode personnalisee active: {dateDebut} au {dateFin}
                </span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
          <Button onClick={fetchData} className="ml-4" variant="outline" size="sm">
            Reessayer
          </Button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-slate-600">Chargement...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="border-t-4 border-slate-500">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                    <div className="text-sm text-slate-600">Total Missions</div>
                  </div>
                  <Target className="w-8 h-8 text-slate-400" />
                </div>
              </CardBody>
            </Card>

            <Card className="border-t-4 border-blue-500">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{stats.planifiees}</div>
                    <div className="text-sm text-slate-600">Planifiees</div>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-400" />
                </div>
              </CardBody>
            </Card>

            <Card className="border-t-4 border-green-500">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.enCours}</div>
                    <div className="text-sm text-slate-600">En cours</div>
                  </div>
                  <Play className="w-8 h-8 text-green-400" />
                </div>
              </CardBody>
            </Card>

            <Card className="border-t-4 border-slate-400">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-slate-600">{stats.terminees}</div>
                    <div className="text-sm text-slate-600">Terminees</div>
                  </div>
                  <CheckCircle className="w-8 h-8 text-slate-400" />
                </div>
              </CardBody>
            </Card>

            <Card className="border-t-4 border-red-500">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-red-600">{stats.annulees}</div>
                    <div className="text-sm text-slate-600">Annulees</div>
                  </div>
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Missions en cours */}
            <div className="lg:col-span-2">
              <Card>
                <CardBody className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-600" />
                      Missions en cours ({activeMissions.length})
                    </h2>
                    <Link href="/admin/missions/listes?statut=EN_COURS">
                      <Button variant="outline" size="sm">
                        Voir tout
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>

                  {activeMissions.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Play className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      Aucune mission en cours
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeMissions.slice(0, 5).map(mission => (
                        <div key={mission.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Play className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-900">
                                {mission.titre || mission.type.replace('_', ' ')}
                              </h4>
                              <div className="flex items-center gap-4 text-sm text-slate-600">
                                {mission.zone && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {mission.zone}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {mission.agents?.length || 0} agents
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-slate-500">
                              {new Date(mission.dateDebut).toLocaleDateString('fr-FR')}
                            </div>
                            {mission.duree && (
                              <div className="text-xs text-slate-400">{mission.duree}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Stats par type */}
            <div>
              <Card>
                <CardBody className="p-6">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Par type de mission
                  </h2>

                  <div className="space-y-3">
                    {statsByType.filter(s => s.count > 0).map(stat => (
                      <div key={stat.type} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-700">
                          {stat.type.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-slate-900">{stat.count}</span>
                          {stat.enCours > 0 && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                              {stat.enCours} actives
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {statsByType.filter(s => s.count > 0).length === 0 && (
                      <div className="text-center py-4 text-slate-500 text-sm">
                        Aucune mission enregistree
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* Missions recentes */}
              <Card className="mt-6">
                <CardBody className="p-6">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-slate-600" />
                    Activite recente
                  </h2>

                  <div className="space-y-2">
                    {recentMissions.map(mission => (
                      <div key={mission.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {mission.titre || mission.type.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(mission.dateDebut).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${getStatutColor(mission.statut)}`}>
                          {mission.statut}
                        </span>
                      </div>
                    ))}
                    {recentMissions.length === 0 && (
                      <div className="text-center py-4 text-slate-500 text-sm">
                        Aucune mission recente
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardBody className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Actions rapides</h2>
              <div className="flex flex-wrap gap-3">
                <Link href="/admin/missions/listes">
                  <Button variant="primary">
                    <Plus className="w-4 h-4" />
                    Nouvelle mission
                  </Button>
                </Link>
                <Link href="/admin/missions/listes?statut=PLANIFIEE">
                  <Button variant="outline">
                    <Calendar className="w-4 h-4" />
                    Missions planifiees
                  </Button>
                </Link>
                <Link href="/admin/missions/listes?statut=EN_COURS">
                  <Button variant="outline">
                    <Play className="w-4 h-4" />
                    Missions en cours
                  </Button>
                </Link>
                <Link href="/admin/missions/listes?statut=TERMINEE">
                  <Button variant="outline">
                    <CheckCircle className="w-4 h-4" />
                    Missions terminees
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  )
}
