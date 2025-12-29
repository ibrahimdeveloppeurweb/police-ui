'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  FileText, Search, Calendar, Eye, Printer,
  CheckCircle, Clock, TrendingUp, FileDown, MapPin, Bell,
  Edit, Archive, Plus, Loader2, AlertTriangle, X
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'
import { usePlaintes } from '@/hooks/usePlaintes'
import { usePlaintesStatistics } from '@/hooks/usePlaintesStatistics'
import { useAuth } from '@/hooks/useAuth'
import FormulaireCreationPlainte from '../form/page'

type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'

export default function PlaintesCommissariatPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tous les statuts')
  const [prioriteFilter, setPrioriteFilter] = useState('Tous les niveaux')
  const [etapeFilter, setEtapeFilter] = useState('Toutes les étapes')
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('jour')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const itemsPerPage = 10

  // Calculer les dates selon la période
  const getDateRange = (period: PeriodKey) => {
    const now = new Date()
    let debut = ''
    let fin = now.toISOString()

    switch (period) {
      case 'jour':
        debut = new Date(now.setHours(0, 0, 0, 0)).toISOString()
        break
      case 'semaine':
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - 7)
        debut = weekStart.toISOString()
        break
      case 'mois':
        const monthStart = new Date(now)
        monthStart.setDate(1)
        monthStart.setHours(0, 0, 0, 0)
        debut = monthStart.toISOString()
        break
      case 'annee':
        const yearStart = new Date(now.getFullYear(), 0, 1)
        debut = yearStart.toISOString()
        break
      case 'tout':
        debut = ''
        fin = ''
        break
      default:
        debut = ''
    }

    return { debut, fin }
  }

  // Préparer les filtres pour le hook
  const filters = useMemo(() => {
    const { debut, fin } = isCustomDateRange 
      ? { debut: dateDebut ? new Date(dateDebut).toISOString() : '', fin: dateFin ? new Date(dateFin + 'T23:59:59').toISOString() : '' }
      : getDateRange(globalFilter)

    return {
      search: searchTerm || undefined,
      statut: statusFilter !== 'Tous les statuts' ? statusFilter : undefined,
      priorite: prioriteFilter !== 'Tous les niveaux' ? prioriteFilter : undefined,
      etape_actuelle: etapeFilter !== 'Toutes les étapes' ? etapeFilter : undefined,
      date_debut: debut || undefined,
      date_fin: fin || undefined,
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage
    }
  }, [searchTerm, statusFilter, prioriteFilter, etapeFilter, globalFilter, isCustomDateRange, dateDebut, dateFin, currentPage])

  // Utiliser le hook pour charger les plaintes
  const {
    plaintes,
    total,
    loading,
    error,
    refetch
  } = usePlaintes(filters)

  // Charger les statistiques avec les mêmes filtres
  const { statistics } = usePlaintesStatistics(filters)

  const commissariatInfo = useMemo(() => ({
    nom: user?.commissariat?.nom || 'Commissariat Central',
    zone: user?.commissariat?.adresse || 'Zone non définie'
  }), [user])

  const totalPages = Math.ceil(total / itemsPerPage)

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
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
    setCurrentPage(1)
  }

  const handleCustomDateSearch = () => {
    if (dateDebut && dateFin) {
      setIsCustomDateRange(true)
      setGlobalFilter('personnalise')
      setCurrentPage(1)
    }
  }

  const getStatutPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'URGENTE':
        return 'bg-red-500 text-white'
      case 'HAUTE':
        return 'bg-orange-500 text-white'
      case 'NORMALE':
        return 'bg-blue-500 text-white'
      case 'BASSE':
        return 'bg-gray-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getEtatColor = (statut: string) => {
    switch (statut) {
      case 'EN_COURS':
        return 'bg-yellow-500 text-white'
      case 'RESOLU':
        return 'bg-green-500 text-white'
      case 'CLASSE':
        return 'bg-gray-500 text-white'
      case 'TRANSFERE':
        return 'bg-purple-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getEtapeLabel = (etape: string) => {
    switch (etape) {
      case 'DEPOT': return 'Dépôt'
      case 'ENQUETE': return 'Enquête préliminaire'
      case 'CONVOCATIONS': return 'Convocations'
      case 'RESOLUTION': return 'Résolution complète'
      case 'CLOTURE': return 'Clôture'
      default: return etape
    }
  }

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'EN_COURS': return 'En cours'
      case 'RESOLU': return 'Résolu'
      case 'CLASSE': return 'Classé'
      case 'TRANSFERE': return 'Transféré'
      default: return statut
    }
  }

  const getEtapeProgression = (etape: string) => {
    const etapes = ['DEPOT', 'ENQUETE', 'CONVOCATIONS', 'RESOLUTION', 'CLOTURE']
    const index = etapes.indexOf(etape)
    return { progression: index + 1, total: 5 }
  }

  const handleControlClick = (plainteId: string) => {
    router.push(`/gestion/plaintes/${plainteId}`)
  }

  const renderProgressSteps = (etapeActuelle: string) => {
    const etapes = ['DEPOT', 'ENQUETE', 'CONVOCATIONS', 'RESOLUTION', 'CLOTURE']
    const currentIndex = etapes.indexOf(etapeActuelle)

    return (
      <div className="flex items-center gap-2">
        {etapes.map((etape, index) => (
          <React.Fragment key={index}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
              index < currentIndex 
                ? 'bg-green-500 text-white' 
                : index === currentIndex 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-300 text-gray-600'
            }`}>
              {index < currentIndex ? <CheckCircle className="w-5 h-5" /> : index + 1}
            </div>
            {index < etapes.length - 1 && (
              <div className={`h-1 w-8 ${index < currentIndex ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    )
  }

  const handlePlainteCreated = () => {
    refetch()
    setShowCreateModal(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const calculateTempsEcoule = (dateDepot: string, etapeActuelle: string) => {
    const now = new Date()
    const depot = new Date(dateDepot)
    const diffTime = Math.abs(now.getTime() - depot.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const { progression, total } = getEtapeProgression(etapeActuelle)
    
    return `Étape ${progression}/${total} - ${diffDays} jour${diffDays > 1 ? 's' : ''} depuis le dépôt`
  }

  // Afficher le loader pendant le chargement initial
  if (loading && plaintes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-600">Chargement des plaintes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <MapPin className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{commissariatInfo.nom}</h1>
            <p className="text-slate-600">{commissariatInfo.zone}</p>
          </div>
        </div>
        <p className="text-slate-600">Gestion des plaintes du commissariat</p>
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
                  <p className="text-gray-600 text-xs md:text-sm hidden sm:block">
                    Sélectionnez la période pour filtrer toutes les données
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  onClick={() => handleFilterChange('jour')}
                  disabled={loading}
                  className={`${globalFilter === 'jour' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Aujourd'hui
                </Button>
                <Button 
                  onClick={() => handleFilterChange('semaine')}
                  disabled={loading}
                  className={`${globalFilter === 'semaine' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Semaine
                </Button>
                <Button 
                  onClick={() => handleFilterChange('mois')}
                  disabled={loading}
                  className={`${globalFilter === 'mois' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Mois
                </Button>
                <Button 
                  onClick={() => handleFilterChange('annee')}
                  disabled={loading}
                  className={`${globalFilter === 'annee' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Année
                </Button>
                <Button 
                  onClick={() => handleFilterChange('tout')}
                  disabled={loading}
                  className={`${globalFilter === 'tout' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Historique
                </Button>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 text-xs md:text-sm px-4 py-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-4 border-t border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-[200px]">
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Rechercher:
                </label>
                <input 
                  type="text"
                  placeholder="Rechercher par numéro, plaignant..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>

              <select 
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option>Tous les statuts</option>
                <option value="EN_COURS">En cours</option>
                <option value="RESOLU">Résolu</option>
                <option value="CLASSE">Classé</option>
                <option value="TRANSFERE">Transféré</option>
              </select>

              <select 
                value={prioriteFilter}
                onChange={(e) => {
                  setPrioriteFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option>Tous les niveaux</option>
                <option value="URGENTE">Urgente</option>
                <option value="HAUTE">Haute</option>
                <option value="NORMALE">Normale</option>
                <option value="BASSE">Basse</option>
              </select>

              <select 
                value={etapeFilter}
                onChange={(e) => {
                  setEtapeFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option>Toutes les étapes</option>
                <option value="DEPOT">Dépôt</option>
                <option value="ENQUETE">Enquête</option>
                <option value="CONVOCATIONS">Convocations</option>
                <option value="RESOLUTION">Résolution</option>
                <option value="CLOTURE">Clôture</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-4 border-t border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Date début:
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
                disabled={!dateDebut || !dateFin || loading}
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
                <span className="text-xs md:text-sm font-medium">
                  Période personnalisée active: {dateDebut} au {dateFin}
                </span>
                <button 
                  onClick={() => {
                    setIsCustomDateRange(false)
                    setDateDebut('')
                    setDateFin('')
                    setCurrentPage(1)
                  }}
                  className="ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Message d'erreur */}
      {error && (
        <Card className="bg-red-50 border border-red-200">
          <CardBody className="p-4">
            <div className="flex items-center gap-3 text-red-800">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Erreur</p>
                <p className="text-xs">{error}</p>
              </div>
              <Button 
                onClick={refetch}
                className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1"
              >
                Réessayer
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border border-gray-200 border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Total Plaintes</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">
              {loading ? <Loader2 className="w-8 h-8 animate-spin text-blue-600" /> : statistics.total}
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-600">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span>{statistics.totalEvolution}</span>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-orange-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">En Cours</h3>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">
              {loading ? <Loader2 className="w-8 h-8 animate-spin text-orange-600" /> : statistics.enCours}
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-600">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span>{statistics.enCoursEvolution}</span>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Résolues</h3>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">
              {loading ? <Loader2 className="w-8 h-8 animate-spin text-green-600" /> : statistics.resolues}
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-600">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span>{statistics.resoluesEvolution}</span>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-red-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">SLA Dépassé</h3>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">
              {loading ? <Loader2 className="w-8 h-8 animate-spin text-red-600" /> : statistics.slaDepasse}
            </div>
            <div className="text-sm text-slate-600">Plaintes en retard</div>
          </CardBody>
        </Card>
      </div>

      {/* Liste des Plaintes */}
      {loading && plaintes.length > 0 && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="ml-2 text-slate-600">Mise à jour...</span>
        </div>
      )}

      {plaintes.length === 0 && !loading && (
        <Card>
          <CardBody className="p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Aucune plainte trouvée</h3>
            <p className="text-slate-600 mb-6">
              Aucune plainte ne correspond à vos critères de recherche.
            </p>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer une plainte
            </Button>
          </CardBody>
        </Card>
      )}

      <div className="space-y-6 mb-8">
        {plaintes.map((plainte) => (
          <Card key={plainte.id} onClick={() => handleControlClick(plainte.id)} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{plainte.numero}</h3>
                  <p className="text-slate-600 mb-3">
                    {plainte.type_plainte} - {plainte.plaignant_nom} {plainte.plaignant_prenom}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${getStatutPrioriteColor(plainte.priorite)}`}>
                      {plainte.priorite}
                    </span>
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${getEtatColor(plainte.statut)}`}>
                      {getStatutLabel(plainte.statut)}
                    </span>
                    {plainte.sla_depasse && (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        <AlertTriangle className="w-3 h-3" />
                        SLA Dépassé
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500 mb-1">Délai SLA</div>
                  <div className={`text-lg font-bold ${plainte.sla_depasse ? 'text-red-600' : 'text-blue-600'}`}>
                    {plainte.delai_sla || 'N/A'}
                  </div>
                  {plainte.date_resolution && (
                    <div className="text-sm text-green-600 font-medium mt-2">
                      Résolu le {formatDate(plainte.date_resolution)}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                {renderProgressSteps(plainte.etape_actuelle)}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Date dépôt</p>
                  <p className="font-bold text-slate-900">{formatDate(plainte.date_depot)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Agent assigné</p>
                  <p className="font-bold text-slate-900">
                    {plainte.agent_assigne 
                      ? `${plainte.agent_assigne.nom} ${plainte.agent_assigne.prenom}`
                      : 'Non assigné'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Étape actuelle</p>
                  <p className="font-bold text-slate-900">{getEtapeLabel(plainte.etape_actuelle)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Convocations</p>
                  <p className="font-bold text-slate-900">{plainte.nombre_convocations || 0}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4" />
                  {calculateTempsEcoule(plainte.date_depot, plainte.etape_actuelle)}
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                <Button onClick={(e) => { e.stopPropagation(); handleControlClick(plainte.id) }} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Eye className="w-4 h-4 mr-2" />
                  Voir détails
                </Button>
                {plainte.statut === 'EN_COURS' && plainte.etape_actuelle === 'CONVOCATIONS' && (
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Bell className="w-4 h-4 mr-2" />
                    Voir Convocations
                  </Button>
                )}
                {plainte.statut === 'EN_COURS' && (
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                )}
                {plainte.statut === 'RESOLU' && (
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <FileText className="w-4 h-4 mr-2" />
                    Rapport Final
                  </Button>
                )}
                <Button className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-300">
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimer
                </Button>
                {plainte.statut === 'RESOLU' && (
                  <Button className="bg-gray-600 hover:bg-gray-700 text-white">
                    <Archive className="w-4 h-4 mr-2" />
                    Archiver
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="mb-8">
          <CardBody className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-600">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, total)} sur {formatNumber(total)} plaintes
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1 || loading}
                  className={`px-3 py-2 border rounded-lg transition-colors ${
                    currentPage === 1 || loading
                      ? 'border-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm">←</span>
                </button>
                
                <button 
                  onClick={() => handlePageChange(1)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === 1 
                      ? 'bg-blue-600 text-white' 
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  1
                </button>
                
                {currentPage > 3 && (
                  <span className="px-2 text-slate-400">...</span>
                )}
                
                {currentPage > 2 && currentPage < totalPages && (
                  <button 
                    onClick={() => handlePageChange(currentPage)}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
                  >
                    {currentPage}
                  </button>
                )}
                
                {currentPage < totalPages - 2 && (
                  <span className="px-2 text-slate-400">...</span>
                )}
                
                {totalPages > 1 && (
                  <button 
                    onClick={() => handlePageChange(totalPages)}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === totalPages 
                        ? 'bg-blue-600 text-white' 
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {totalPages}
                  </button>
                )}
                
                <button 
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || loading}
                  className={`px-3 py-2 border rounded-lg transition-colors ${
                    currentPage === totalPages || loading
                      ? 'border-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm">→</span>
                </button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Modal Formulaire */}
      <FormulaireCreationPlainte
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handlePlainteCreated}
      />
    </div>
  )
}
