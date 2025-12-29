'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Search, Filter, Download, Eye, Printer, Calendar, MapPin, User,
  AlertTriangle, CheckCircle, XCircle, FileText, TrendingUp, TrendingDown,
  Clock, Shield, Target, FileDown, Bell,
  Plus, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { useGestionLayout } from '@/contexts/GestionLayoutContext'
import { useAuth } from '@/hooks/useAuth'
import AlertForm from '../form/page'
import { useAlertesWithFilters, type AlertListItem, type AlertStats } from '@/hooks/useAlertes'

type AlertStatus = 'En cours' | 'Résolue' | 'Archivée'
type AlertSeverity = 'Critique' | 'Élevée' | 'Moyenne' | 'Faible'
type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'

export default function AlertesGestionPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { setTitle, setSubtitle } = useGestionLayout()
  const { user } = useAuth()

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
    
    setTitle("Liste des Alertes")
    if (formattedCommissariat) {
      setSubtitle(`${formattedCommissariat} - Gestion des alertes de sécurité`)
    } else {
      setSubtitle("Gestion des alertes de sécurité")
    }
  }, [setTitle, setSubtitle, user?.commissariat?.nom, pathname])

  // Utiliser le hook avec gestion automatique des filtres (comme le dashboard)
  const {
    alerts,
    stats,
    loading,
    error,
    pagination,
    commissariat,
    commissariatId,
    refetch,
    periode: globalFilter,
    dateDebut,
    dateFin,
    isCustomDateRange,
    statusFilter,
    severityFilter,
    searchTerm,
    currentPage,
    limit,
    setPeriode: setGlobalFilter,
    setDateDebut,
    setDateFin,
    applyCustomDateRange,
    setStatusFilter,
    setSeverityFilter,
    setSearchTerm,
    applySearch,
    setCurrentPage,
  } = useAlertesWithFilters()

  // Filtrer les alertes localement selon les critères de recherche (si nécessaire)
  const filteredAlerts = useMemo(() => {
    // La recherche est déjà gérée par l'API, mais on peut ajouter un filtre local supplémentaire si besoin
    return alerts;
  }, [alerts])

  // Utiliser les données du hook au lieu des données statiques
  const currentData = {
    alerts: filteredAlerts,
    stats: stats || {
      totalAlertes: 0,
      enCours: 0,
      resolues: 0,
      archivees: 0,
      tauxResolution: 0,
      evolutionAlertes: '+0%',
      evolutionResolution: '+0%',
      tempsReponse: 'N/A',
    }
  }

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    alert('Export des données en cours...\nFormat: CSV/Excel/PDF')
  }

  const handleFilterChange = (filter: PeriodKey) => {
    setGlobalFilter(filter)
  }

  const handleSearch = () => {
    // Appliquer la recherche textuelle
    applySearch();
    // Appliquer les dates personnalisées si elles sont définies
    if (dateDebut && dateFin) {
      setCurrentPage(1); // Réinitialiser à la page 1 quand les dates personnalisées changent
      applyCustomDateRange();
    }
  }

  const handleCustomDateSearch = () => {
    // Cette fonction n'est plus utilisée directement, on utilise handleSearch
    handleSearch();
  }

  const handlePageChange = (newPage: number) => {
    console.log(`🔄 handlePageChange appelé: page actuelle = ${currentPage}, nouvelle page = ${newPage}`);
    setCurrentPage(newPage);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const handleAlertClick = (alertId: string) => {
    // L'ID peut être au format UUID ou avec préfixe #ALR-...
    // On utilise directement l'ID tel quel, ou on extrait l'UUID si nécessaire
    const cleanId = alertId.replace(/^#?ALR-[A-Z0-9-]+-/, '').replace(/^#/, '') || alertId
    router.push(`/gestion/alertes/${cleanId}`)
  }


  const handleAlerteSubmit = (data: any) => {
    console.log('Nouvelle alerte créée:', data)
    // Recharger la liste des alertes
    refetch()
  }

  // Obtenir le libellé de la période actuelle
  const getPeriodeLabel = () => {
    switch (globalFilter) {
      case 'jour':
        return "aujourd'hui"
      case 'semaine':
        return 'cette semaine'
      case 'mois':
        return 'ce mois'
      case 'annee':
        return 'cette année'
      default:
        return 'vs période précédente'
    }
  }

  const getStatutColor = (statut: AlertStatus) => {
    switch (statut) {
      case 'En cours':
        return 'bg-orange-500 text-white'
      case 'Résolue':
        return 'bg-green-500 text-white'
      case 'Archivée':
        return 'bg-gray-500 text-white'
    }
  }

  const getSeveriteColor = (severite: AlertSeverity) => {
    switch (severite) {
      case 'Critique':
        return 'bg-red-500 text-white'
      case 'Élevée':
        return 'bg-orange-500 text-white'
      case 'Moyenne':
        return 'bg-yellow-500 text-white'
      case 'Faible':
        return 'bg-blue-500 text-white'
    }
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Alertes Sécuritaires</h1>
            <p className="text-slate-600 mt-1">
              {commissariat ? (
                `${commissariat.nom} • ${commissariat.code}`
              ) : (
                <span className="text-slate-400">Chargement du commissariat...</span>
              )}
            </p>
          </div>
        </div>
        <p className="text-slate-600">
          {commissariat 
            ? `Suivi de toutes les alertes de sécurité du commissariat`
            : 'Chargement des informations...'
          }
        </p>
      </div>

  {/* Filtre Global de Période */}
  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 mb-8">
    <CardBody className="p-4 md:p-6">
      <div className="space-y-4">
        {/* Header et boutons de période */}
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
          
          {/* Boutons de période - responsive */}
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
           
          </div>
        </div>


        {/* Formulaire Modal */}
        <AlertForm 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAlerteSubmit}
        />

        {/* NOUVEAUX CHAMPS : Input de recherche + 2 Selects */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-4 border-t border-blue-200">
          {/* Champ Input de recherche */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-[200px]">
            <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
              Rechercher:
            </label>
            <input 
                type="text"
                placeholder="Rechercher par ID, type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>

          {/* Select 1 : Statut */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto bg-white"
            >
              <option>Tous les statuts</option>
              <option>En cours</option>
              <option>Résolue</option>
              <option>Archivée</option>
            </select>
          </div>

          {/* Select 2 : Sévérité */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <select 
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto bg-white"
            >
              <option>Toutes les sévérités</option>
              <option>Critique</option>
              <option>Élevée</option>
              <option>Moyenne</option>
              <option>Faible</option>
            </select>
          </div>
        </div>

        {/* Sélection de dates personnalisées - responsive */}
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
            onClick={handleSearch}
            disabled={loading}
            className={`${loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'} flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2 w-full sm:w-auto`}
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

          {/* Séparateur visuel */}
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

            <Button 
             onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2"
            >
              <Plus className="w-5 h-5" />
              Faire une alerte
            </Button>
          </div>
        </div>
        
        {/* Badge de confirmation - responsive */}
        {isCustomDateRange && (
          <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg w-full sm:w-auto">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs md:text-sm font-medium">
              Période personnalisée active: {dateDebut} au {dateFin}
            </span>
          </div>
        )}
      </div>
    </CardBody>
  </Card>

      {/* Statistiques - NOUVEAU STYLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white border border-gray-200 border-t-4 border-t-red-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Total Alertes</h3>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(currentData.stats.totalAlertes)}</div>
            <div className={`flex items-center gap-2 text-sm font-medium mb-3 ${
              currentData.stats.evolutionAlertes.startsWith('-') 
                ? 'text-red-600' 
                : 'text-green-600'
            }`}>
              {currentData.stats.evolutionAlertes.startsWith('-') 
                ? <TrendingDown className="w-4 h-4" />
                : <TrendingUp className="w-4 h-4" />
              }
              {currentData.stats.evolutionAlertes} {getPeriodeLabel()}
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>En cours: {formatNumber(currentData.stats.enCours)} ({((currentData.stats.enCours/currentData.stats.totalAlertes)*100).toFixed(1)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Résolues: {formatNumber(currentData.stats.resolues)} ({((currentData.stats.resolues/currentData.stats.totalAlertes)*100).toFixed(1)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span>Archivées: {formatNumber(currentData.stats.archivees)} ({((currentData.stats.archivees/currentData.stats.totalAlertes)*100).toFixed(1)}%)</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Taux de Résolution</h3>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{currentData.stats.tauxResolution}%</div>
            <div className={`flex items-center gap-2 text-sm font-medium mb-3 ${
              currentData.stats.evolutionResolution.startsWith('-') 
                ? 'text-red-600' 
                : 'text-green-600'
            }`}>
              {currentData.stats.evolutionResolution.startsWith('-') 
                ? <TrendingDown className="w-4 h-4" />
                : <TrendingUp className="w-4 h-4" />
              }
              {currentData.stats.evolutionResolution} {getPeriodeLabel()}
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Alertes résolues: {formatNumber(currentData.stats.resolues)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-blue-600" />
                <span>Temps moyen: {currentData.stats.tempsReponse}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-orange-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Temps de Réponse</h3>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{currentData.stats.tempsReponse}</div>
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium mb-3">
              <TrendingUp className="w-4 h-4" />
              Excellent temps de réponse
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-2">
                <Target className="w-3 h-3 text-orange-600" />
                <span>Objectif commissariat: </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-blue-600" />
                <span>Zone Cocody/Riviera/Angré - Intervention rapide</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

    

      {/* Message d'erreur */}
      {error && (
        <Card className="mb-8 border-red-300 bg-red-50">
          <CardBody className="p-4">
            <div className="flex items-center gap-3 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm font-medium">{error}</span>
              <Button 
                onClick={() => refetch()}
                className="ml-auto bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1"
              >
                Réessayer
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Tableau des alertes */}
      <Card className="mb-8">
        <CardBody className="p-0">
          {loading && currentData.alerts.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-slate-600">Chargement des alertes...</span>
            </div>
          ) : currentData.alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="w-12 h-12 text-slate-400 mb-4" />
              <p className="text-slate-600 font-medium">Aucune alerte trouvée</p>
              <p className="text-slate-500 text-sm mt-2">Essayez de modifier vos filtres de recherche</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Code</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Type Alerte</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Libellé</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Type de Diffusion</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date Diffusion</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Statut</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Ville de Diffusion</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentData.alerts.map((alert) => (
                      <tr 
                        key={alert.id} 
                        onClick={() => handleAlertClick(alert.id)}
                        className="hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        {/* Code */}
                        <td className="px-6 py-4">
                          <span className="font-bold text-blue-600 hover:text-blue-800">
                            {alert.numero || `#${alert.id.slice(0, 8)}`}
                          </span>
                        </td>
                        
                        {/* Type Alerte */}
                        <td className="px-6 py-4">
                          <span className="text-slate-900 text-sm font-medium">{alert.type}</span>
                        </td>
                        
                        {/* Libellé */}
                        <td className="px-6 py-4 max-w-xs">
                          <div className="text-sm text-slate-900 font-medium line-clamp-2">
                            {alert.titre || alert.description || 'Sans titre'}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {alert.date} à {alert.heure}
                          </div>
                        </td>
                        
                        {/* Type de Diffusion */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            alert.diffusee 
                              ? alert.typeDiffusion === 'Générale' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {alert.typeDiffusion || 'Non diffusée'}
                          </span>
                        </td>
                        
                        {/* Date Diffusion */}
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-700">
                            {alert.dateDiffusion || '-'}
                          </span>
                        </td>
                        
                        {/* Statut */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatutColor(alert.statut)}`}>
                            {alert.statut}
                          </span>
                        </td>
                        
                        {/* Ville de Diffusion */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-700">
                            {alert.villeDiffusion || alert.commissariatNom || '-'}
                          </div>
                        </td>
                        
                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAlertClick(alert.id)
                              }}
                              className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Voir les détails"
                            >
                              <Eye className="w-4 h-4 text-blue-600" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                window.print()
                              }}
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Imprimer"
                            >
                              <Printer className="w-4 h-4 text-slate-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination - Modèle avec flèches et ellipses */}
              {pagination && pagination.total > 0 && (() => {
                const total = Number(pagination.total) || 0;
                const limit = Number(pagination.limit) || 20;
                
                // PRIORITÉ: Utiliser pagination.totalPages directement depuis le backend (API)
                let totalPages = Number(pagination.totalPages);
                
                // Si totalPages n'est pas disponible ou invalide, calculer depuis total/limit
                if (!totalPages || isNaN(totalPages) || totalPages < 1) {
                  totalPages = Math.ceil(total / limit);
                }
                
                // Garantir que totalPages est au moins 1
                totalPages = Math.max(1, Math.floor(totalPages));
                
                // UTILISER currentPage du hook pour tenir compte des filtres
                const activePage = Number(currentPage) || Number(pagination.page) || 1;
                
                // DEBUG: Afficher les valeurs de pagination
                console.log('🔍 PAGINATION DYNAMIQUE:', {
                  paginationFromBackend: pagination,
                  total,
                  limit,
                  totalPages,
                  activePage,
                  currentPageFromHook: currentPage,
                  willShowAllPages: totalPages <= 5 && totalPages > 0,
                  pagesToShow: totalPages <= 5 && totalPages > 0 
                    ? Array.from({ length: totalPages }, (_, i) => i + 1)
                    : []
                });
                
                return (
                  <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-200 gap-4">
                    <p className="text-sm text-slate-600">
                      Affichage de <span className="font-medium">
                        {total > 0 ? ((activePage - 1) * limit) + 1 : 0}
                      </span> à{' '}
                      <span className="font-medium">
                        {Math.min(activePage * limit, total)}
                      </span>{' '}
                      sur <span className="font-medium">{formatNumber(total)}</span> alertes
                    </p>
                    
                    <div className="flex items-center gap-2">
                      {/* Bouton Précédent avec flèche */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePageChange(activePage - 1);
                        }}
                        disabled={activePage === 1 || loading}
                        className={`px-3 py-2 border rounded-lg transition-colors ${
                          activePage === 1 
                            ? 'border-slate-200 text-slate-400 cursor-not-allowed' 
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-sm">←</span>
                      </button>
                      
                      {/* Afficher toutes les pages de 1 à totalPages */}
                      {totalPages <= 5 && totalPages > 0 ? (
                        // Mode simple : afficher toutes les pages de 1 à totalPages
                        (() => {
                          const pages = [];
                          for (let i = 1; i <= totalPages; i++) {
                            pages.push(i);
                          }
                          console.log(`✅ Génération de ${pages.length} pages:`, pages);
                          return pages.map((pageNum) => (
                            <button
                              key={`page-${pageNum}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handlePageChange(pageNum);
                              }}
                              disabled={loading}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                activePage === pageNum 
                                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          ));
                        })()
                      ) : totalPages > 5 ? (
                        // Format compact avec ellipses si totalPages > 5
                        <>
                          {/* Page 1 - Toujours affichée */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePageChange(1);
                            }}
                            disabled={loading}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              activePage === 1 
                                ? 'bg-blue-600 text-white' 
                                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            1
                          </button>
                          
                          {/* Page 2 si on est sur page 1 ou 2 */}
                          {(activePage === 1 || activePage === 2) && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePageChange(2);
                              }}
                              disabled={loading}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                activePage === 2 
                                  ? 'bg-blue-600 text-white' 
                                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              2
                            </button>
                          )}
                          
                          {/* Ellipse avant si on est loin de la première page */}
                          {activePage > 3 && (
                            <span className="px-2 text-slate-400">...</span>
                          )}
                          
                          {/* Page courante si elle n'est pas 1, 2, ou proche de la fin */}
                          {activePage > 2 && activePage < totalPages - 1 && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePageChange(activePage);
                              }}
                              disabled={loading}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
                            >
                              {activePage}
                            </button>
                          )}
                          
                          {/* Ellipse après si on est loin de la dernière page */}
                          {activePage < totalPages - 2 && (
                            <span className="px-2 text-slate-400">...</span>
                          )}
                          
                          {/* Avant-dernière page si on est sur la dernière ou près de la fin */}
                          {(activePage === totalPages || activePage === totalPages - 1) && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePageChange(totalPages - 1);
                              }}
                              disabled={loading}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                activePage === totalPages - 1 
                                  ? 'bg-blue-600 text-white' 
                                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {totalPages - 1}
                            </button>
                          )}
                          
                          {/* Dernière page - Toujours affichée */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePageChange(totalPages);
                            }}
                            disabled={loading}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              activePage === totalPages 
                                ? 'bg-blue-600 text-white' 
                                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {totalPages}
                          </button>
                        </>
                      ) : null}
                      
                      {/* Bouton Suivant avec flèche */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePageChange(activePage + 1);
                        }}
                        disabled={activePage === totalPages || loading}
                        className={`px-3 py-2 border rounded-lg transition-colors ${
                          activePage === totalPages 
                            ? 'border-slate-200 text-slate-400 cursor-not-allowed' 
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-sm">→</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  )
}