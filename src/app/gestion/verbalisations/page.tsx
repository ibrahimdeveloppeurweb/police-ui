'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  FileText, Calendar, Search, Printer, FileDown, CheckCircle,
  AlertTriangle, Clock, DollarSign, TrendingUp, Users, MapPin,
  CreditCard, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { infractionsService, type APIInfraction } from '@/lib/api/services'

type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'

interface PeriodStats {
  totalPV: number
  payes: number
  nonPayes: number
  enRetard: number
  montantTotal: number
  tauxPaiement: string
  montantMoyen: number
}

interface InfractionCount {
  type: string
  nombre: number
}

interface ChartData {
  name: string
  value: number
  color: string
}

export default function CommissariatVerbalisationsDashboard() {
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('tout')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  // API data state
  const [stats, setStats] = useState<PeriodStats>({
    totalPV: 0,
    payes: 0,
    nonPayes: 0,
    enRetard: 0,
    montantTotal: 0,
    tauxPaiement: '0%',
    montantMoyen: 0
  })
  const [pieData, setPieData] = useState<ChartData[]>([])
  const [infractions, setInfractions] = useState<InfractionCount[]>([])
  const [activityData, setActivityData] = useState<{ period: string; pv: number; nonPayes: number }[]>([])

  // Informations du commissariat
  const commissariatInfo = {
    nom: 'Commissariat Central de Cocody',
    code: 'CC-001',
    adresse: 'Boulevard Latrille, Cocody, Abidjan',
    telephone: '+225 27 22 44 55 66',
    commandant: 'Commissaire KOUASSI Jean-Baptiste',
    agentsTotal: 8,
    zones: ['Cocody Centre', '2 Plateaux', 'Riviera', 'Angré']
  }

  // Fetch data based on filters
  const fetchData = useCallback(async () => {
    setLoading(true)

    try {
      const filters: Record<string, string> = {}

      if (isCustomDateRange && dateDebut && dateFin) {
        filters.date_debut = dateDebut
        filters.date_fin = dateFin
      } else {
        const now = new Date()
        let startDate: Date | null = null

        switch (globalFilter) {
          case 'jour':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            break
          case 'semaine':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'mois':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          case 'annee':
            startDate = new Date(now.getFullYear(), 0, 1)
            break
          case 'tout':
          default:
            // No date filter
            break
        }

        if (startDate) {
          filters.date_debut = startDate.toISOString().split('T')[0]
        }
      }

      const response = await infractionsService.getAll(filters, 1, 100)

      if (response.success && response.data) {
        const allInfractions = response.data.infractions || []
        processInfractions(allInfractions)
      }
    } catch (err) {
      console.error('Error fetching infractions:', err)
    } finally {
      setLoading(false)
    }
  }, [globalFilter, isCustomDateRange, dateDebut, dateFin])

  // Process infractions data
  const processInfractions = (allInfractions: APIInfraction[]) => {
    const total = allInfractions.length
    const payes = allInfractions.filter(i => i.statut === 'PAYEE').length
    const nonPayes = allInfractions.filter(i => i.statut === 'CONSTATEE' || i.statut === 'VALIDEE').length
    const enRetard = allInfractions.filter(i => i.statut === 'CONTESTEE' || i.statut === 'ANNULEE').length
    const montantTotal = allInfractions.reduce((sum, i) => sum + i.montant_amende, 0)
    const tauxPaiement = total > 0 ? ((payes / total) * 100).toFixed(1) : '0'
    const montantMoyen = total > 0 ? Math.round(montantTotal / total) : 0

    setStats({
      totalPV: total,
      payes,
      nonPayes,
      enRetard,
      montantTotal,
      tauxPaiement: `${tauxPaiement}%`,
      montantMoyen
    })

    // Pie chart data
    setPieData([
      { name: 'Payés', value: payes, color: '#10b981' },
      { name: 'Non Payés', value: nonPayes, color: '#f59e0b' },
      { name: 'En Retard', value: enRetard, color: '#ef4444' }
    ])

    // Count infractions by type
    const infractionCounts: Record<string, number> = {}
    allInfractions.forEach(i => {
      const type = i.type_infraction?.libelle || 'Autre'
      infractionCounts[type] = (infractionCounts[type] || 0) + 1
    })

    const sortedInfractions = Object.entries(infractionCounts)
      .map(([type, nombre]) => ({ type, nombre }))
      .sort((a, b) => b.nombre - a.nombre)
      .slice(0, 5)

    setInfractions(sortedInfractions)

    // Activity data - group by date
    const activityMap: Record<string, { pv: number; nonPayes: number }> = {}
    allInfractions.forEach(i => {
      const date = new Date(i.date_infraction).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
      if (!activityMap[date]) {
        activityMap[date] = { pv: 0, nonPayes: 0 }
      }
      activityMap[date].pv++
      if (i.statut !== 'PAYEE') {
        activityMap[date].nonPayes++
      }
    })

    const activity = Object.entries(activityMap)
      .map(([period, data]) => ({ period, ...data }))
      .slice(-7)

    setActivityData(activity)
  }

  useEffect(() => {
    setIsMounted(true)
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
    alert('Export des données en cours...\nFormat: CSV/Excel/PDF')
  }

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

  if (!isMounted) {
    return null
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Filtre Global */}
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
                  <p className="text-gray-600 text-xs md:text-sm hidden sm:block">Verbalisations - {commissariatInfo.nom}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => handleFilterChange('jour')}
                  className={`${globalFilter === 'jour' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2 font-medium`}
                >
                  Aujourd'hui
                </Button>
                <Button
                  onClick={() => handleFilterChange('semaine')}
                  className={`${globalFilter === 'semaine' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2 font-medium`}
                >
                  Semaine
                </Button>
                <Button
                  onClick={() => handleFilterChange('mois')}
                  className={`${globalFilter === 'mois' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2 font-medium`}
                >
                  Mois
                </Button>
                <Button
                  onClick={() => handleFilterChange('annee')}
                  className={`${globalFilter === 'annee' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2 font-medium`}
                >
                  Année
                </Button>
                <Button
                  onClick={() => handleFilterChange('tout')}
                  className={`${globalFilter === 'tout' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2 font-medium`}
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
                <span className="text-xs md:text-sm font-medium">Période personnalisée active: {dateDebut} au {dateFin}</span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Chargement des statistiques...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Statistiques - 8 cartes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white border border-gray-200 border-t-4 border-t-blue-500 hover:shadow-lg transition-all duration-300">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 text-sm font-medium uppercase">TOTAL PV</h3>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{formatNumber(stats.totalPV)}</div>
                <div className="text-blue-600 text-sm font-medium">Total des verbalisations</div>
              </CardBody>
            </Card>

            <Card className="bg-white border border-gray-200 border-t-4 border-t-green-500 hover:shadow-lg transition-all duration-300">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 text-sm font-medium uppercase">PAYÉS</h3>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{formatNumber(stats.payes)}</div>
                <div className="text-green-600 text-sm font-medium">Amendes réglées</div>
              </CardBody>
            </Card>

            <Card className="bg-white border border-gray-200 border-t-4 border-t-yellow-500 hover:shadow-lg transition-all duration-300">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 text-sm font-medium uppercase">NON PAYÉS</h3>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{formatNumber(stats.nonPayes)}</div>
                <div className="text-yellow-600 text-sm font-medium">En attente de paiement</div>
              </CardBody>
            </Card>

            <Card className="bg-white border border-gray-200 border-t-4 border-t-red-500 hover:shadow-lg transition-all duration-300">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 text-sm font-medium uppercase">CONTESTÉS</h3>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{formatNumber(stats.enRetard)}</div>
                <div className="text-red-600 text-sm font-medium">Annulés ou contestés</div>
              </CardBody>
            </Card>

            <Card className="bg-white border border-gray-200 border-t-4 border-t-purple-500 hover:shadow-lg transition-all duration-300">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 text-sm font-medium uppercase">MONTANT TOTAL</h3>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{formatMontant(stats.montantTotal)} FCFA</div>
                <div className="text-purple-600 text-sm font-medium">Total des amendes</div>
              </CardBody>
            </Card>

            <Card className="bg-white border border-gray-200 border-t-4 border-t-indigo-500 hover:shadow-lg transition-all duration-300">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 text-sm font-medium uppercase">TAUX PAIEMENT</h3>
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stats.tauxPaiement}</div>
                <div className="text-indigo-600 text-sm font-medium">Taux de recouvrement</div>
              </CardBody>
            </Card>

            <Card className="bg-white border border-gray-200 border-t-4 border-t-orange-500 hover:shadow-lg transition-all duration-300">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 text-sm font-medium uppercase">AGENTS ACTIFS</h3>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{commissariatInfo.agentsTotal}</div>
                <div className="text-orange-600 text-sm font-medium">Agents du commissariat</div>
              </CardBody>
            </Card>

            <Card className="bg-white border border-gray-200 border-t-4 border-t-cyan-500 hover:shadow-lg transition-all duration-300">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 text-sm font-medium uppercase">MONTANT MOYEN</h3>
                  <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-cyan-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{formatNumber(stats.montantMoyen)} FCFA</div>
                <div className="text-cyan-600 text-sm font-medium">Par verbalisation</div>
              </CardBody>
            </Card>
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardBody className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Activité Verbalisations</h3>

                <div className="h-80 w-full">
                  {activityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={activityData}
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
                          dataKey="pv"
                          fill="#6B9FED"
                          radius={[8, 8, 0, 0]}
                          maxBarSize={50}
                          name="PV émis"
                        />
                        <Bar
                          dataKey="nonPayes"
                          fill="#F59E0B"
                          radius={[8, 8, 0, 0]}
                          maxBarSize={50}
                          name="Non payés"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">Aucune donnée disponible</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Répartition Statuts</h3>

                <div className="h-64 w-full">
                  {pieData.length > 0 && stats.totalPV > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry: { value: number }) => `${((entry.value / stats.totalPV) * 100).toFixed(1)}%`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
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
                      <p className="text-gray-500">Aucune donnée disponible</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  {pieData.map((item, index) => (
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

          {/* Top 5 Infractions */}
          <Card>
            <CardBody className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Top {infractions.length} Types d'Infractions</h3>

              {infractions.length > 0 ? (
                <div className="space-y-4">
                  {infractions.map((infraction, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="font-bold text-gray-700">{index + 1}</span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{infraction.type}</span>
                          <span className="text-sm font-bold text-gray-700">{formatNumber(infraction.nombre)} PV</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(infraction.nombre / infractions[0].nombre) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucune infraction trouvée pour cette période</p>
                </div>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  )
}
