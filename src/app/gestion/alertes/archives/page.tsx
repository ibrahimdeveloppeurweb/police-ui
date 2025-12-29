'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Search, Filter, Download, Eye, Printer, Calendar, MapPin, User,
  AlertTriangle, CheckCircle, XCircle, FileText, Archive,
  Clock, DollarSign, Shield, Target, Trash2, FolderOpen, Bell, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { useRouter, usePathname } from 'next/navigation'
import { useGestionLayout } from '@/contexts/GestionLayoutContext'
import { useAuth } from '@/hooks/useAuth'
import { useAlertesWithFilters, type AlertListItem, type AlertStats } from '@/hooks/useAlertes'

type AlertStatus = 'En cours' | 'Résolue' | 'Archivée'
type AlertSeverity = 'Critique' | 'Élevée' | 'Moyenne' | 'Faible'
type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'

type AlertArchive = {
  id: string
  date: string
  heure: string
  type: string
  lieu: string
  severite: AlertSeverity
  agent: string
  statut: AlertStatus
  description: string
  dateArchivage: string
  resolution: string
  numero?: string
  dateCloture?: string
  dateResolution?: string
}

// Données statiques supprimées - maintenant on utilise l'API

export default function ArchivesAlertesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { setTitle, setSubtitle } = useGestionLayout()
  const { user } = useAuth()
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  
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
    
    setTitle("Archives des Alertes")
    if (formattedCommissariat) {
      setSubtitle(`${formattedCommissariat} - Alertes archivées`)
    } else {
      setSubtitle("Alertes archivées")
    }
  }, [setTitle, setSubtitle, user?.commissariat?.nom, pathname])
  
  // Utiliser le hook avec le statut "Archivée" par défaut
  const {
    alerts,
    stats,
    loading,
    error,
    pagination,
    commissariat,
    commissariatId,
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

  // Calculer les dates par défaut (30 derniers jours)
  const defaultDates = React.useMemo(() => {
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)
    
    const formatDate = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    return {
      dateDebut: formatDate(thirtyDaysAgo),
      dateFin: formatDate(today)
    }
  }, [])

  // Initialiser les dates par défaut et le statut "Archivée"
  React.useEffect(() => {
    // Forcer le statut "Archivée" par défaut
    if (statusFilter === 'Tous les statuts') {
      setStatusFilter('Archivée')
    }
    
    // Initialiser les dates par défaut (30 derniers jours) si elles sont vides
    if (!dateDebut || dateDebut === '') {
      setDateDebut(defaultDates.dateDebut)
    }
    if (!dateFin || dateFin === '') {
      setDateFin(defaultDates.dateFin)
    }
  }, []) // Exécuté une seule fois au montage

  // Appliquer automatiquement les dates par défaut après leur initialisation
  React.useEffect(() => {
    // Si les dates sont maintenant définies et qu'aucune recherche personnalisée n'a été faite
    if (dateDebut && dateFin && dateDebut === defaultDates.dateDebut && dateFin === defaultDates.dateFin && !isCustomDateRange) {
      // Appliquer les dates pour déclencher le chargement initial
      const timer = setTimeout(() => {
        applyCustomDateRange()
      }, 300)
      
      return () => clearTimeout(timer)
    }
  }, [dateDebut, dateFin]) // Exécuté quand les dates changent

  // Transformer les alertes en format archives avec dateArchivage et resolution
  const archivesData: AlertArchive[] = useMemo(() => {
    return alerts.map(alert => {
      // Utiliser dateCloture ou dateResolution comme date d'archivage
      const dateArchivageObj = alert.dateCloture 
        ? new Date(alert.dateCloture)
        : alert.dateResolution
        ? new Date(alert.dateResolution)
        : new Date(alert.date.split('/').reverse().join('-')) // Utiliser dateAlerte comme fallback

      // Générer un message de résolution basé sur le statut et le rapport
      let resolutionText = '';
      if (alert.statut === 'Résolue') {
        resolutionText = 'Intervention effectuée - Dossier clos'
      } else if (alert.statut === 'Archivée') {
        resolutionText = 'Dossier archivé'
      } else {
        resolutionText = 'En cours de traitement'
      }

      return {
        id: alert.id,
        numero: alert.numero,
        date: alert.date,
        heure: alert.heure,
        type: alert.type,
        lieu: alert.lieu,
        severite: alert.severite,
        agent: alert.agent,
        statut: alert.statut as AlertStatus,
        description: alert.description || alert.titre || '',
        dateArchivage: dateArchivageObj.toLocaleDateString('fr-FR'),
        resolution: resolutionText,
        dateCloture: alert.dateCloture,
        dateResolution: alert.dateResolution,
      }
    })
  }, [alerts])

  // Calculer les statistiques depuis les données API
  const archiveStats = useMemo(() => {
    const total = pagination?.total || 0
    const resolues = alerts.filter(a => a.statut === 'Résolue').length
    const archivees = alerts.filter(a => a.statut === 'Archivée').length
    const tauxResolution = total > 0 ? ((resolues / total) * 100).toFixed(1) : 0

    return {
      totalArchives: total,
      resolues: stats?.resolues || resolues,
      archivees: stats?.archivees || archivees,
      tauxResolution: parseFloat(tauxResolution.toString()),
    }
  }, [pagination, alerts, stats])

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const getStatColor = (color: string) => {
    const colors = {
      red: 'border-t-red-500',
      green: 'border-t-green-500',
      orange: 'border-t-orange-500',
      purple: 'border-t-purple-500'
    }
    return colors[color as keyof typeof colors]
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

  const handleAlertClick = (alertId: string) => {
    // L'ID peut être au format UUID ou avec préfixe
    const cleanId = alertId.replace(/^#?ALR-[A-Z0-9-]+-/, '').replace(/^#/, '') || alertId
    router.push(`/gestion/alertes/${cleanId}`)
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

  const handleSearch = () => {
    // Appliquer la recherche textuelle
    applySearch();
    // Appliquer les dates personnalisées si elles sont définies
    if (dateDebut && dateFin) {
      setCurrentPage(1);
      applyCustomDateRange();
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Archives des Alertes Sécuritaires</h1>
            <p className="text-slate-600 mt-1">
              {commissariat ? `${commissariat.nom} • ${commissariat.code}` : 'Chargement...'}
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques des archives */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className={`bg-white border border-gray-200 border-t-4 ${getStatColor('red')} hover:shadow-lg transition-shadow`}>
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Total Archives</h3>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Archive className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">
              {loading ? '...' : formatNumber(archiveStats.totalArchives)}
            </div>
            <div className="text-sm text-slate-500">
              Alertes archivées
            </div>
          </CardBody>
        </Card>

        {/* <Card className={`bg-white border border-gray-200 border-t-4 ${getStatColor('orange')} hover:shadow-lg transition-shadow`}>
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">En cours</h3>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(stats.enCours)}</div>
            <div className="text-sm text-slate-500">
              {((stats.enCours/stats.totalArchives)*100).toFixed(1)}% des archives
            </div>
          </CardBody>
        </Card> */}

        <Card className={`bg-white border border-gray-200 border-t-4 ${getStatColor('green')} hover:shadow-lg transition-shadow`}>
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Résolues</h3>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">
              {loading ? '...' : formatNumber(archiveStats.resolues)}
            </div>
            <div className="text-sm text-slate-500">
              {archiveStats.totalArchives > 0 
                ? `${((archiveStats.resolues / archiveStats.totalArchives) * 100).toFixed(1)}% des archives`
                : '0% des archives'}
            </div>
          </CardBody>
        </Card>

     
      </div>

      {/* Filtres */}
      <Card className="mb-8">
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
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
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            >
              <option>Toutes les sévérités</option>
              <option>Critique</option>
              <option>Élevée</option>
              <option>Moyenne</option>
              <option>Faible</option>
            </select>

            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="date"
                placeholder="Date début"
                value={dateDebut || defaultDates.dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="date"
                placeholder="Date fin"
                value={dateFin || defaultDates.dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleSearch}
              disabled={loading}
              className={`${loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
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
            <Button 
              variant="secondary" 
              size="md"
              onClick={() => {
                setDateDebut('')
                setDateFin('')
                setSearchTerm('')
                setStatusFilter('Archivée')
                setSeverityFilter('Toutes les sévérités')
                setCurrentPage(1)
                applySearch()
              }}
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
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Download className="w-4 h-4" />
                  Exporter
                </Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white">
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
                      checked={selectedItems.length === archivesData.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">ID Alerte</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date Alerte</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Lieu</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Sévérité</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date Archivage</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && archivesData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                      <p className="text-slate-600">Chargement des archives...</p>
                    </td>
                  </tr>
                ) : archivesData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <Archive className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600 font-medium">Aucune archive trouvée</p>
                      <p className="text-slate-500 text-sm mt-2">Essayez de modifier vos filtres de recherche</p>
                    </td>
                  </tr>
                ) : (
                  archivesData.map((alerte) => (
                    <tr  
                      key={alerte.id} 
                      onClick={() => handleAlertClick(alerte.id)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(alerte.id)}
                          onChange={(e) => {
                            e.stopPropagation()
                            toggleSelectItem(alerte.id)
                          }}
                          className="w-4 h-4 rounded border-slate-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-blue-600">
                          {alerte.numero ? `#${alerte.numero}` : `#${alerte.id.slice(0, 8)}`}
                        </span>
                      </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-slate-900">{alerte.date}</div>
                        <div className="text-sm text-slate-500">{alerte.heure}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-900 text-sm">{alerte.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-slate-700">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{alerte.lieu}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getSeveriteColor(alerte.severite)}`}>
                        {alerte.severite}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Archive className="w-4 h-4" />
                        <span className="text-sm">{alerte.dateArchivage}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        // Déterminer si l'alerte est résolue en vérifiant le statut et la dateResolution
                        const isResolved = alerte.statut === 'Résolue' || 
                                          (alerte.dateResolution && !isNaN(new Date(alerte.dateResolution).getTime()));
                        
                        // Afficher le statut avec indication de résolution
                        return (
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatutColor(alerte.statut)}`}>
                              {alerte.statut}
                            </span>
                            {isResolved ? (
                              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Résolue
                                {alerte.dateResolution && (
                                  <span className="text-slate-500">
                                    ({new Date(alerte.dateResolution).toLocaleDateString('fr-FR')})
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-xs text-orange-600 font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Non résolue
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                              onClick={(e) => {
                            e.stopPropagation()
                            handleAlertClick(alerte.id)
                          }}
                        className="p-2 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors" title="Voir les détails">
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Imprimer">
                          <Printer className="w-4 h-4 text-slate-600" />
                        </button>
                        <button className="p-2 hover:bg-red-100 rounded-lg transition-colors" title="Supprimer">
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

          {/* Pagination - Modèle avec flèches et ellipses */}
          {pagination && pagination.total > 0 && (() => {
            const total = Number(pagination.total) || 0;
            const limitValue = Number(pagination.limit) || 20;
            
            // PRIORITÉ: Utiliser pagination.totalPages directement depuis le backend (API)
            let totalPages = Number(pagination.totalPages);
            
            // Si totalPages n'est pas disponible ou invalide, calculer depuis total/limit
            if (!totalPages || isNaN(totalPages) || totalPages < 1) {
              totalPages = Math.ceil(total / limitValue);
            }
            
            // Garantir que totalPages est au moins 1
            totalPages = Math.max(1, Math.floor(totalPages));
            
            // UTILISER currentPage du hook pour tenir compte des filtres
            const activePage = Number(currentPage) || Number(pagination.page) || 1;
            
            return (
              <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-200 gap-4">
                <p className="text-sm text-slate-600">
                  Affichage de <span className="font-medium">
                    {total > 0 ? ((activePage - 1) * limitValue) + 1 : 0}
                  </span> à{' '}
                  <span className="font-medium">
                    {Math.min(activePage * limitValue, total)}
                  </span>{' '}
                  sur <span className="font-medium">{formatNumber(total)}</span> archives
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
                    Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
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
                    ))
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
        </CardBody>
      </Card>

 
    </div>
  )
}