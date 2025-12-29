'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell, Search, Calendar, Eye, Printer, AlertTriangle,
  CheckCircle, Clock, TrendingUp, FileDown, MapPin,
  User, Archive, Phone, Plus, X, Loader2, FileText, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { useRouter, usePathname } from 'next/navigation';
import { useGestionLayout } from '@/contexts/GestionLayoutContext';
import { useAuth } from '@/hooks/useAuth';
import FomConvocationPage from '../form/page';
import { useConvocationsWithFilters, type ConvocationListItem, type ConvocationStats } from '@/hooks/useConvocations';

// Formatage déterministe
const formatDateOnly = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return 'N/A';
  }
};

export default function ConvocationsCommissariatPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { setTitle, setSubtitle } = useGestionLayout();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'cartes' | 'tableau'>('tableau');

  // Formater le nom du commissariat
  const formatCommissariatName = (name: string): string => {
    if (!name) return '';
    if (name.toLowerCase().includes('commissariat')) return name;
    return `Commissariat du ${name}`;
  };

  useEffect(() => {
    const commissariatName = user?.commissariat?.nom || '';
    const formattedCommissariat = commissariatName ? formatCommissariatName(commissariatName) : '';
    setTitle('Liste des Convocations');
    if (formattedCommissariat) {
      setSubtitle(`${formattedCommissariat} - Gestion des convocations`);
    } else {
      setSubtitle('Gestion des convocations');
    }
  }, [setTitle, setSubtitle, user?.commissariat?.nom, pathname]);

  // Utiliser le hook dynamique
  const {
    convocations,
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
    typeFilter,
    searchTerm,
    currentPage,
    limit,
    setPeriode: setGlobalFilter,
    setDateDebut,
    setDateFin,
    applyCustomDateRange,
    setStatusFilter,
    setTypeFilter,
    setSearchTerm,
    applySearch,
    setCurrentPage,
  } = useConvocationsWithFilters();

  const filteredConvocations = useMemo(() => convocations, [convocations]);

  const currentData = {
    convocations: filteredConvocations,
    stats: stats || {
      totalConvocations: 0,
      convocationsJour: 0,
      envoyes: 0,
      honores: 0,
      pourcentageHonores: 0,
      enAttente: 0,
      evolutionConvocations: '+0%',
      evolutionEnvoyes: '+0%',
      evolutionHonores: '+0%',
    },
  };

  const formatNumber = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  const handlePrint = () => window.print();
  const handleExport = () => alert('Export en cours...');

  const handleFilterChange = (filter: 'jour' | 'semaine' | 'mois' | 'annee') => {
    setGlobalFilter(filter);
  };

  const getPeriodeLabel = () => {
    switch (globalFilter) {
      case 'jour': return "aujourd'hui";
      case 'semaine': return 'cette semaine';
      case 'mois': return 'ce mois';
      case 'annee': return 'cette année';
      default: return '';
    }
  };

  const handleSearch = () => {
    applySearch();
    if (dateDebut && dateFin) {
      setCurrentPage(1);
      applyCustomDateRange();
    }
  };

  const handlePageChange = (newPage: number) => {
    console.log(`🔄 handlePageChange convocations: page actuelle = ${currentPage}, nouvelle page = ${newPage}`);
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConvocationSubmit = (data: any) => {
    console.log('Nouvelle convocation créée:', data);
    refetch();
    setIsModalOpen(false);
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'ENVOYÉ': return 'bg-blue-500 text-white';
      case 'HONORÉ': return 'bg-green-500 text-white';
      case 'EN ATTENTE': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatutLabel = (statut: string) => {
    return statut;
  };

  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(currentData.convocations.map(c => c.type))).sort();
  }, [currentData.convocations]);

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Bell className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Liste des Convocations</h1>
            <p className="text-slate-600 text-sm">
              {commissariat ? (
                `${formatCommissariatName(commissariat.nom)} • ${commissariat.code || ''}`
              ) : (
                <span className="text-slate-400">Chargement du commissariat...</span>
              )}
            </p>
          </div>
        </div>
        <p className="text-slate-600">Gestion des convocations du commissariat</p>
      </div>

      {/* Filtre Global */}
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
                  <p className="text-gray-600 text-xs md:text-sm hidden sm:block">Sélectionnez la période</p>
                </div>
              </div>
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

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-4 border-t border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-[200px]">
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">Rechercher:</label>
                <div className="flex items-center gap-2 w-full">
                  <input 
                    type="text"
                    placeholder="Rechercher par numéro, témoin..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option>Statut convocation</option>
                <option>ENVOYÉ</option>
                <option>HONORÉ</option>
                <option>EN ATTENTE</option>
              </select>

              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option>Type d'audition</option>
                {uniqueTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
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
                onClick={handleSearch}
                disabled={loading}
                className={`${loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'} flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2`}
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

              <div className="hidden sm:block w-px h-8 bg-blue-300"></div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm px-4 py-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
                <Button 
                  onClick={handlePrint}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm px-4 py-2"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimer
                </Button>
                <Button 
                  onClick={handleExport}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs md:text-sm px-4 py-2"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </div>

            {isCustomDateRange && (
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs md:text-sm font-medium">
                  Période personnalisée active: {dateDebut} au {dateFin}
                </span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border border-gray-200 border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Total Convocations</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">{formatNumber(currentData.stats.totalConvocations)}</div>
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              {currentData.stats.evolutionConvocations} {getPeriodeLabel()}
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Envoyés</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">{formatNumber(currentData.stats.envoyes)}</div>
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              {currentData.stats.evolutionEnvoyes} {getPeriodeLabel()}
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Honorés</h3>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">{formatNumber(currentData.stats.honores)}</div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                {currentData.stats.evolutionHonores} {getPeriodeLabel()}
              </div>
              <span className="text-slate-400 text-sm">•</span>
              <div className="text-slate-600 text-sm">{currentData.stats.pourcentageHonores.toFixed(1)}% du total</div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-orange-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">En Attente</h3>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">{formatNumber(currentData.stats.enAttente)}</div>
            <div className="text-sm text-slate-600">À confirmer</div>
          </CardBody>
        </Card>
      </div>

      {/* Onglets d'affichage */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setActiveTab('cartes')}
          className={`px-6 py-3 font-semibold text-sm transition-all rounded-lg ${
            activeTab === 'cartes'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-300 hover:border-blue-400'
          }`}
        >
          Affichage Cartes
        </button>
        <button
          onClick={() => setActiveTab('tableau')}
          className={`px-6 py-3 font-semibold text-sm transition-all rounded-lg ${
            activeTab === 'tableau'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-300 hover:border-blue-400'
          }`}
        >
          Affichage Tableau
        </button>
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

      {/* Liste des Convocations - Affichage selon l'onglet */}
      {activeTab === 'cartes' ? (
        <div className="space-y-6 mb-8">
          {loading && currentData.convocations.length === 0 ? (
            <Card>
              <CardBody className="p-6">
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                  <p className="mt-4 text-slate-600">Chargement des convocations...</p>
                </div>
              </CardBody>
            </Card>
          ) : currentData.convocations.length === 0 ? (
            <Card>
              <CardBody className="p-6">
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">Aucune convocation trouvée</p>
                  <p className="text-slate-500 text-sm mt-2">Essayez de modifier vos filtres de recherche</p>
                </div>
              </CardBody>
            </Card>
          ) : (
            currentData.convocations.map((convocation) => (
              <Card 
                key={convocation.id} 
                onClick={() => router.push(`/gestion/convocations/${convocation.id}`)}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardBody className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{convocation.numero}</h3>
                      <p className="text-sm text-blue-600 font-semibold mb-2">{convocation.type} - {convocation.qualiteConvoque || 'N/A'}</p>
                      
                      {/* Informations du convoqué */}
                      <div className="bg-slate-50 p-3 rounded-lg mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-slate-500" />
                          <p className="font-bold text-slate-900">
                            {convocation.convoquePrenom} {convocation.convoqueNom}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-4 h-4" />
                          <span>{convocation.convoqueTelephone || 'N/A'}</span>
                        </div>
                        {convocation.convoqueAdresse && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                            <MapPin className="w-4 h-4" />
                            <span>{convocation.convoqueAdresse}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Motif */}
                      {convocation.motif && (
                        <div className="bg-blue-50 p-3 rounded-lg mb-3">
                          <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Motif</p>
                          <p className="text-sm text-slate-700 line-clamp-2">{convocation.motif}</p>
                        </div>
                      )}
                      
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${getStatutColor(convocation.statutConvocation)}`}>
                        {getStatutLabel(convocation.statutConvocation)}
                      </span>
                    </div>
                    <div className="text-right">
                      {convocation.rdvProgramme && (
                        <>
                          <div className="text-sm text-slate-500 mb-1">RDV programmé</div>
                          <div className="text-lg font-bold text-blue-600">
                            {convocation.rdvProgramme}{convocation.heureRdv && ` ${convocation.heureRdv}`}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2">
                      {Array.from({ length: convocation.etapeTotal }).map((_, index) => (
                        <React.Fragment key={index}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            index < convocation.etapeProgression 
                              ? 'bg-green-500 text-white' 
                              : index === convocation.etapeProgression 
                                ? 'bg-orange-500 text-white' 
                                : 'bg-gray-300 text-gray-600'
                          }`}>
                            {index < convocation.etapeProgression ? <CheckCircle className="w-4 h-4" /> : index + 1}
                          </div>
                          {index < convocation.etapeTotal - 1 && (
                            <div className={`h-1 w-6 ${index < convocation.etapeProgression ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Date création</p>
                      <p className="font-bold text-slate-900">
                        {(() => {
                          try {
                            const date = new Date(convocation.createdAt || convocation.dateCreation);
                            if (isNaN(date.getTime())) return convocation.dateCreation || 'N/A';
                            return date.toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            });
                          } catch {
                            return convocation.dateCreation || 'N/A';
                          }
                        })()}
                      </p>
                    </div>

                    {convocation.affaireLiee && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Affaire liée</p>
                        <p className="font-bold text-slate-900">{convocation.affaireLiee}</p>
                      </div>
                    )}
                  
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Agent</p>
                      <p className="font-bold text-slate-900">{convocation.agent}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Étape actuelle</p>
                      <p className="font-bold text-slate-900">{convocation.etapeActuelle}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4" />
                      {convocation.tempsEcoule}
                    </div>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <Button onClick={(e) => { e.stopPropagation(); router.push(`/gestion/convocations/${convocation.id}`); }} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Voir détails
                    </Button>
                    {convocation.statutConvocation === 'EN ATTENTE' && (
                      <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Confirmer
                      </Button>
                    )}
                    {convocation.statutConvocation === 'ENVOYÉ' && (
                      <Button className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Rappel
                      </Button>
                    )}
                    {convocation.statutConvocation === 'HONORÉ' && (
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Voir PV
                      </Button>
                    )}
                    <Button className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 flex items-center gap-2">
                      <Printer className="w-4 h-4" />
                      Imprimer
                    </Button>
                    {convocation.statutConvocation === 'HONORÉ' && (
                      <Button className="bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-2">
                        <Archive className="w-4 h-4" />
                        Archiver
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      ) : (
        /* Affichage en tableau */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-bold text-gray-600 uppercase text-xs tracking-wider">Numéro</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-600 uppercase text-xs tracking-wider">Type</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-600 uppercase text-xs tracking-wider">Convoqué</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-600 uppercase text-xs tracking-wider">Date RDV</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-600 uppercase text-xs tracking-wider">Statut</th>
                  <th className="text-right py-4 px-6 font-bold text-gray-600 uppercase text-xs tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && currentData.convocations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                      <p className="mt-4 text-slate-600 font-medium">Chargement des convocations...</p>
                    </td>
                  </tr>
                ) : currentData.convocations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Bell className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-semibold text-lg">Aucune convocation trouvée</p>
                        <p className="text-gray-500 text-sm mt-1">Essayez de modifier vos filtres de recherche</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentData.convocations.map((convocation, index) => (
                    <tr 
                      key={convocation.id} 
                      className={`hover:bg-blue-50/50 cursor-pointer transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                      onClick={() => router.push(`/gestion/convocations/${convocation.id}`)}
                    >
                      <td className="py-5 px-6">
                        <span className="font-bold text-blue-600 text-base hover:text-blue-700 transition-colors">
                          {convocation.numero}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Bell className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="font-semibold text-gray-800 text-sm">{convocation.type}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="text-gray-700 font-medium text-sm">
                            {convocation.convoquePrenom} {convocation.convoqueNom}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 text-sm font-medium">
                            {convocation.rdvProgramme || 'Non programmé'}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                          convocation.statutConvocation === 'HONORÉ' 
                            ? 'bg-green-100 text-green-700'
                            : convocation.statutConvocation === 'ENVOYÉ'
                            ? 'bg-blue-100 text-blue-700'
                            : convocation.statutConvocation === 'EN ATTENTE'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {getStatutLabel(convocation.statutConvocation)}
                        </span>
                      </td>
                      <td className="py-5 px-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/gestion/convocations/${convocation.id}`)}
                            className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all duration-200 hover:scale-105"
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handlePrint}
                            className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-all duration-200 hover:scale-105"
                            title="Imprimer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total > 0 && (() => {
        const total = Number(pagination.total) || 0;
        const limit = Number(pagination.limit) || 5;
        let totalPages = Number(pagination.totalPages);
        if (!totalPages || isNaN(totalPages) || totalPages < 1) {
          totalPages = Math.ceil(total / limit);
        }
        totalPages = Math.max(1, Math.floor(totalPages));
        const activePage = Number(currentPage) || Number(pagination.page) || 1;

        return (
          <Card className="mb-8">
            <CardBody className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-slate-600">
                  Affichage de <span className="font-medium">
                    {total > 0 ? ((activePage - 1) * limit) + 1 : 0}
                  </span> à{' '}
                  <span className="font-medium">
                    {Math.min(activePage * limit, total)}
                  </span>{' '}
                  sur <span className="font-medium">{formatNumber(total)}</span> convocations
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handlePageChange(activePage - 1)}
                    disabled={activePage === 1 || loading}
                    className={`px-3 py-2 border rounded-lg transition-colors ${
                      activePage === 1 
                        ? 'border-slate-200 text-slate-400 cursor-not-allowed' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-sm">←</span>
                  </button>

                  {totalPages <= 5 && totalPages > 0 ? (
                    Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={`page-${pageNum}`}
                        onClick={() => handlePageChange(pageNum)}
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
                  ) : (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
                      {activePage}
                    </button>
                  )}

                  <button 
                    onClick={() => handlePageChange(activePage + 1)}
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
            </CardBody>
          </Card>
        );
      })()}

      {/* Modal Formulaire */}
      <FomConvocationPage
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleConvocationSubmit}
      />
    </div>
  );
}
