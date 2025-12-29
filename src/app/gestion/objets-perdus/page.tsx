'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  PackageSearch, Calendar, TrendingUp, Clock, CheckCircle, AlertTriangle,
  Search, MapPin, FileText, Users, BarChart3, Loader2, TrendingDown, Plus,
  Printer, Download, X
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { usePathname, useRouter } from 'next/navigation'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { useObjetsPerdusStats } from '@/hooks/useObjetsPerdusStats'
import { useAuth } from '@/hooks/useAuth'
import ObjetPerduFormPage from './form/page'
import { useGestionLayout } from '@/contexts/GestionLayoutContext'

type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout'

export default function ObjetsPerdusGestionPage() {
  const router = useRouter()
  const { user } = useAuth()
  const pathname = usePathname()
  const { setTitle, setSubtitle } = useGestionLayout()
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // États pour les filtres locaux (UI seulement)
  const [localDateDebut, setLocalDateDebut] = useState('')
  const [localDateFin, setLocalDateFin] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tous les statuts')
  const [typeFilter, setTypeFilter] = useState('Tous les types')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)
  
  // Utiliser le hook pour charger les stats
  const {
    stats,
    topTypes,
    activityData,
    loading,
    error,
    periode,
    changePeriode,
    applyCustomDates,
    refetch
  } = useObjetsPerdusStats()

  // Formater le nom du commissariat
  const commissariatName = useMemo(() => {
    const name = user?.commissariat?.nom || ''
    if (!name) return 'Commissariat'
    if (name.toLowerCase().includes('commissariat')) return name
    return `Commissariat du ${name}`
  }, [user?.commissariat?.nom])

   // Formater le nom du commissariat avec "Commissariat du/de" si nécessaire
   const formatCommissariatName = (name: string): string => {
    if (!name) return ''
    // Si le nom contient déjà "Commissariat", on le retourne tel quel
    if (name.toLowerCase().includes('commissariat')) {
      return name
    }
    // Sinon, on ajoute "Commissariat du"
    return `Commissariat du ${name}`
  }
  
  // Mettre à jour le titre et sous-titre quand la page change
  useEffect(() => {
    const commissariatName = user?.commissariat?.nom || ''
    const formattedCommissariat = commissariatName ? formatCommissariatName(commissariatName) : ''
    
    setTitle("Tableau de bord des objets perdus")
    if (formattedCommissariat) {
      setSubtitle(`${formattedCommissariat} - Gestion des déclarations d'objets perdus`)
    } else {
      setSubtitle("Gestion des déclarations d'objets perdus")
    }
  }, [setTitle, setSubtitle, user?.commissariat?.nom, pathname])

  // Formater les nombres
  const formatNumber = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

  // Calculer le délai moyen (simulé pour l'instant)
  const delaiMoyen = useMemo(() => {
    if (!stats || stats.retrouves === 0) return 'N/A'
    // Simuler un délai moyen entre 8 et 15 jours
    return `${Math.floor(Math.random() * 8) + 8} jours`
  }, [stats])

  // Préparer les données pour le graphique de distribution
  const statusDistribution = useMemo(() => {
    if (!stats) return []
    return [
      { name: 'En recherche', value: stats.enRecherche, color: '#3B82F6' },
      { name: 'Retrouvés', value: stats.retrouves, color: '#10B981' },
      { name: 'Clôturés', value: stats.clotures, color: '#6B7280' }
    ]
  }, [stats])

  // Préparer les données pour le graphique d'activité
  const chartActivityData = useMemo(() => {
    if (!activityData || activityData.length === 0) return []
    return activityData.map(item => ({
      name: item.period,
      declarations: item.objetsPerdus,
      retrouves: item.retrouves
    }))
  }, [activityData])

  // Calculer les pourcentages pour les top types
  const topTypesWithPercentage = useMemo(() => {
    if (!topTypes || topTypes.length === 0 || !stats) return []
    const total = stats.total || 1
    return topTypes.slice(0, 5).map(item => ({
      type: item.type,
      count: item.count,
      percentage: Math.round((item.count / total) * 100)
    }))
  }, [topTypes, stats])

  // Liste des types d'objets pour le filtre
  const typesObjets = useMemo(() => {
    if (!topTypes || topTypes.length === 0) return []
    return topTypes.map(item => item.type)
  }, [topTypes])

  // Fonction pour obtenir le label de période
  const getPeriodeLabel = () => {
    if (isCustomDateRange) return 'période personnalisée'
    switch (periode) {
      case 'jour': return "aujourd'hui"
      case 'semaine': return 'cette semaine'
      case 'mois': return 'ce mois'
      case 'annee': return 'cette année'
      case 'tout': return 'historique complet'
      default: return ''
    }
  }

  // Fonction de recherche
  const handleRechercher = () => {
    console.log('Recherche avec filtres:', { 
      dateDebut: localDateDebut, 
      dateFin: localDateFin, 
      searchTerm, 
      statusFilter, 
      typeFilter 
    })
    
    // Si les deux dates sont renseignées, activer le mode personnalisé
    if (localDateDebut && localDateFin) {
      setIsCustomDateRange(true)
      // Convertir les dates au format ISO pour l'API
      const dateDebutISO = new Date(localDateDebut).toISOString()
      const dateFinISO = new Date(localDateFin + 'T23:59:59').toISOString()
      console.log('✅ Dates appliquées (période custom):', { dateDebutISO, dateFinISO })
      // Passer les dates au hook qui va automatiquement gérer la période "custom"
      applyCustomDates(dateDebutISO, dateFinISO)
    } else {
      setIsCustomDateRange(false)
      applyCustomDates('', '')
    }
  }

  // Fonction pour gérer le changement de période
  const handlePeriodeChange = (period: PeriodKey) => {
    setIsCustomDateRange(false)
    setLocalDateDebut('')
    setLocalDateFin('')
    changePeriode(period)
  }

  // Fonction d'impression
  const handleImprimer = () => {
    window.print()
  }

  // Fonction d'export
  const handleExporter = () => {
    console.log('Export des données')
    // Implémenter la logique d'export ici (CSV, Excel, PDF, etc.)
  }

  // Afficher le loader pendant le chargement initial
  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          <p className="text-slate-600">Chargement des statistiques...</p>
        </div>
      </div>
    )
  }

  // Afficher l'erreur si elle existe
  if (error && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardBody className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Erreur</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={refetch} className="bg-orange-600 hover:bg-orange-700 text-white">
              Réessayer
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <PackageSearch className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Objets Perdus</h1>
            <p className="text-slate-600 text-sm">{commissariatName}</p>
          </div>
        </div>
        <p className="text-slate-600">Tableau de bord des déclarations d'objets perdus - {getPeriodeLabel()}</p>
      </div>

      {/* Filtre Global */}
      <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 mb-8">
        <CardBody className="p-4 md:p-6">
          <div className="space-y-4">
            {/* Section période d'analyse */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Période d'analyse</h2>
                  <p className="text-gray-600 text-xs md:text-sm hidden sm:block">Sélectionnez la période</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {(['jour', 'semaine', 'mois', 'annee', 'tout'] as PeriodKey[]).map((period) => (
                  <Button 
                    key={period}
                    onClick={() => handlePeriodeChange(period)}
                    disabled={loading}
                    className={`${periode === period && !isCustomDateRange ? 'bg-orange-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-orange-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg`}
                  >
                    {loading && periode === period && !isCustomDateRange && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                    {period === 'jour' ? "Aujourd'hui" : period === 'semaine' ? 'Semaine' : period === 'mois' ? 'Mois' : period === 'annee' ? 'Année' : 'Historique'}
                  </Button>
                ))}
                
                <div className="hidden sm:block w-px h-8 bg-orange-300 mx-1"></div>
                
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm px-4 py-2 flex items-center gap-2 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </Button>
              </div>
            </div>

            {/* Séparateur */}
            <div className="border-t border-orange-200"></div>

            {/* Section filtrage par dates et boutons d'action */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">Date début:</label>
                <input 
                  type="date" 
                  value={localDateDebut}
                  onChange={(e) => setLocalDateDebut(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto bg-white"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">Date fin:</label>
                <input 
                  type="date" 
                  value={localDateFin}
                  onChange={(e) => setLocalDateFin(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto bg-white"
                />
              </div>
              
              <Button 
                onClick={handleRechercher}
                disabled={loading}
                className={`${loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 text-white'} flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Rechercher
                  </>
                )}
              </Button>

              <div className="hidden sm:block w-px h-8 bg-orange-300"></div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleImprimer}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm px-4 py-2"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimer
                </Button>
                
                <Button 
                  onClick={handleExporter}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs md:text-sm px-4 py-2"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Message d'erreur non bloquant */}
      {error && stats && (
        <Card className="bg-yellow-50 border border-yellow-200">
          <CardBody className="p-4">
            <div className="flex items-center gap-3 text-yellow-800">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Attention</p>
                <p className="text-xs">{error}</p>
              </div>
              <Button 
                onClick={refetch}
                className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1"
              >
                Actualiser
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border border-gray-200 border-t-4 border-t-orange-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Total Déclarations</h3>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <PackageSearch className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {loading ? <Loader2 className="w-8 h-8 animate-spin text-orange-600" /> : formatNumber(stats?.total || 0)}
            </div>
            <div className={`flex items-center gap-2 text-sm font-medium ${
              stats?.evolutionTotal 
                ? (stats.evolutionTotal.startsWith('-') 
                    ? 'text-red-600' 
                    : stats.evolutionTotal.startsWith('+') && stats.evolutionTotal !== '+0'
                      ? 'text-green-600'
                      : 'text-gray-600')
                : 'text-gray-600'
            }`}>
              {stats?.evolutionTotal && stats.evolutionTotal !== '+0' && stats.evolutionTotal !== '0' ? (
                stats.evolutionTotal.startsWith('-') 
                  ? <TrendingDown className="w-4 h-4" />
                  : <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4 opacity-50" />
              )}
              {stats?.evolutionTotal || '0'} {getPeriodeLabel()}
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">En Recherche</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {loading ? <Loader2 className="w-8 h-8 animate-spin text-blue-600" /> : formatNumber(stats?.enRecherche || 0)}
            </div>
            <div className={`flex items-center gap-2 text-sm font-medium ${
              stats?.evolutionEnRecherche 
                ? (stats.evolutionEnRecherche.startsWith('-') 
                    ? 'text-red-600' 
                    : stats.evolutionEnRecherche.startsWith('+') && stats.evolutionEnRecherche !== '+0'
                      ? 'text-green-600'
                      : 'text-gray-600')
                : 'text-gray-600'
            }`}>
              {stats?.evolutionEnRecherche && stats.evolutionEnRecherche !== '+0' && stats.evolutionEnRecherche !== '0' ? (
                stats.evolutionEnRecherche.startsWith('-') 
                  ? <TrendingDown className="w-4 h-4" />
                  : <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4 opacity-50" />
              )}
              {stats?.evolutionEnRecherche || '0'} {getPeriodeLabel()}
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Retrouvés</h3>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {loading ? <Loader2 className="w-8 h-8 animate-spin text-green-600" /> : formatNumber(stats?.retrouves || 0)}
            </div>
            <div className={`flex items-center gap-2 text-sm font-medium ${
              stats?.evolutionRetrouves 
                ? (stats.evolutionRetrouves.startsWith('-') 
                    ? 'text-red-600' 
                    : stats.evolutionRetrouves.startsWith('+') && stats.evolutionRetrouves !== '+0'
                      ? 'text-green-600'
                      : 'text-gray-600')
                : 'text-gray-600'
            }`}>
              {stats?.evolutionRetrouves && stats.evolutionRetrouves !== '+0' && stats.evolutionRetrouves !== '0' ? (
                stats.evolutionRetrouves.startsWith('-') 
                  ? <TrendingDown className="w-4 h-4" />
                  : <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4 opacity-50" />
              )}
              {stats?.evolutionRetrouves || '0'} {getPeriodeLabel()}
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-purple-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Délai Moyen</h3>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {loading ? <Loader2 className="w-8 h-8 animate-spin text-purple-600" /> : delaiMoyen}
            </div>
            <div className="text-sm text-slate-600">Pour retrouver</div>
          </CardBody>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Activité */}
        <Card className="bg-white border border-gray-200">
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Activité {getPeriodeLabel()}
            </h3>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
              </div>
            ) : chartActivityData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-500">
                <p>Aucune donnée d'activité disponible</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="declarations" stackId="1" stroke="#F97316" fill="#FED7AA" name="Déclarations" />
                    <Area type="monotone" dataKey="retrouves" stackId="2" stroke="#10B981" fill="#A7F3D0" name="Retrouvés" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Distribution */}
        <Card className="bg-white border border-gray-200">
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Distribution par statut</h3>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
              </div>
            ) : statusDistribution.length === 0 || statusDistribution.every(s => s.value === 0) ? (
              <div className="h-64 flex items-center justify-center text-slate-500">
                <p>Aucune donnée disponible</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={(entry: any) => entry.value > 0 ? `${entry.name}: ${entry.value}` : ''}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Top types d'objets */}
      <Card className="bg-white border border-gray-200 mb-8">
        <CardBody className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Types d'objets les plus déclarés</h3>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
          ) : topTypesWithPercentage.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-slate-500">
              <p>Aucune donnée disponible</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topTypesWithPercentage.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-slate-900">{item.type}</span>
                      <span className="text-slate-600">{item.count} déclarations</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Bouton voir liste */}
      <div className="flex justify-center">
        <Button 
          onClick={() => router.push('/gestion/objets-perdus/listes')}
          className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3"
        >
          Voir toutes les déclarations
        </Button>
      </div>

      {/* Modal Formulaire */}
      <ObjetPerduFormPage 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => {
          console.log('Objet perdu créé:', data)
          refetch()
          setIsModalOpen(false)
        }}
      />

      {/* Badge de confirmation pour période personnalisée */}
      {isCustomDateRange && localDateDebut && localDateFin && (
        <Card className="fixed bottom-4 right-4 bg-green-50 border-green-200 shadow-lg z-50">
          <CardBody className="p-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">
                Période personnalisée active: {localDateDebut} au {localDateFin}
              </span>
              <button 
                onClick={() => {
                  setIsCustomDateRange(false)
                  setLocalDateDebut('')
                  setLocalDateFin('')
                  applyCustomDates('', '')
                }}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}