'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Bell, Calendar, TrendingUp, Clock, CheckCircle, AlertTriangle,
  Search, Printer, Download, X, Loader2, TrendingDown, Plus, Shield, Flag
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { useGestionLayout } from '@/contexts/GestionLayoutContext';
import FomConvocationPage from './form/page';
import useConvocationsStats from '@/hooks/useConvocationsStats';

type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise';

export default function ConvocationsCommissariatDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const pathname = usePathname();
  const { setTitle, setSubtitle } = useGestionLayout();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // États pour les filtres locaux (UI seulement)
  const [localDateDebut, setLocalDateDebut] = useState('');
  const [localDateFin, setLocalDateFin] = useState('');
  const [isCustomDateRange, setIsCustomDateRange] = useState(false);
  
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
  } = useConvocationsStats();

  // Formater le nom du commissariat
  const formatCommissariatName = (name: string): string => {
    if (!name) return '';
    if (name.toLowerCase().includes('commissariat')) return name;
    return `Commissariat du ${name}`;
  };

  const commissariatName = useMemo(() => {
    const name = user?.commissariat?.nom || '';
    return name ? formatCommissariatName(name) : 'Commissariat';
  }, [user?.commissariat?.nom]);

  // Mettre à jour le titre et sous-titre
  useEffect(() => {
    const name = user?.commissariat?.nom || '';
    const formatted = name ? formatCommissariatName(name) : '';
    setTitle("Tableau de bord des convocations");
    setSubtitle(formatted ? `${formatted} - Gestion des convocations` : "Gestion des convocations");
  }, [setTitle, setSubtitle, user?.commissariat?.nom, pathname]);

  const formatNumber = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  const delaiMoyenFormate = useMemo(() => {
    if (!stats || stats.delaiMoyenJours === 0) return 'N/A';
    const jours = Math.round(stats.delaiMoyenJours);
    return `${jours} jour${jours > 1 ? 's' : ''}`;
  }, [stats]);

  const tauxHonore = useMemo(() => {
    if (!stats || stats.totalConvocations === 0) return '0%';
    return `${((stats.honorees / stats.totalConvocations) * 100).toFixed(1)}%`;
  }, [stats]);

  const statusDistribution = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Envo yées', value: stats.envoyees, color: '#3B82F6' },
      { name: 'Honorées', value: stats.honorees, color: '#10B981' },
      { name: 'En Attente', value: stats.enAttente, color: '#F59E0B' }
    ].filter(item => item.value > 0);
  }, [stats]);

  const chartActivityData = useMemo(() => {
    if (!activityData) return [];
    return activityData.map(item => ({
      name: item.period,
      convocations: item.convocations,
      envoyees: item.envoyees,
      honorees: item.honorees
    }));
  }, [activityData]);

  const topTypesWithPercentage = useMemo(() => {
    if (!topTypes || !stats) return [];
    const total = stats.totalConvocations || 1;
    return topTypes.slice(0, 5).map(item => ({
      type: item.type,
      count: item.count,
      percentage: Math.round((item.count / total) * 100)
    }));
  }, [topTypes, stats]);

  const getPeriodeLabel = () => {
    if (isCustomDateRange) return 'période personnalisée';
    switch (periode) {
      case 'jour': return "aujourd'hui";
      case 'semaine': return 'cette semaine';
      case 'mois': return 'ce mois';
      case 'annee': return 'cette année';
      case 'tout': return 'historique complet';
      default: return '';
    }
  };

  const handleRechercher = () => {
    if (localDateDebut && localDateFin) {
      setIsCustomDateRange(true);
      const dateDebutISO = new Date(localDateDebut).toISOString();
      const dateFinISO = new Date(localDateFin + 'T23:59:59').toISOString();
      applyCustomDates(dateDebutISO, dateFinISO);
    } else {
      setIsCustomDateRange(false);
      applyCustomDates('', '');
    }
  };

  const handlePeriodeChange = (period: PeriodKey) => {
    if (period === 'personnalise') return;
    setIsCustomDateRange(false);
    setLocalDateDebut('');
    setLocalDateFin('');
    changePeriode(period);
  };

  const handleImprimer = () => window.print();
  const handleExporter = () => alert('Export en cours...');

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardBody className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Erreur</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={refetch} className="bg-blue-600 hover:bg-blue-700 text-white">
              Réessayer
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Bell className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Convocations</h1>
            <p className="text-slate-600 text-sm">{commissariatName}</p>
          </div>
        </div>
        <p className="text-slate-600">Tableau de bord des convocations - {getPeriodeLabel()}</p>
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
                {(['jour', 'semaine', 'mois', 'annee', 'tout'] as PeriodKey[]).map((period) => (
                  <Button 
                    key={period}
                    onClick={() => handlePeriodeChange(period)}
                    disabled={loading}
                    className={`${periode === period && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg`}
                  >
                    {period === 'jour' ? "Aujourd'hui" : period === 'semaine' ? 'Semaine' : period === 'mois' ? 'Mois' : period === 'annee' ? 'Année' : 'Historique'}
                  </Button>
                ))}
                
                <div className="hidden sm:block w-px h-8 bg-blue-300 mx-1"></div>
                
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm px-4 py-2 flex items-center gap-2 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </Button>
              </div>
            </div>

            <div className="border-t border-blue-200"></div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">Date début:</label>
                <input 
                  type="date" 
                  value={localDateDebut}
                  onChange={(e) => setLocalDateDebut(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto bg-white"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">Date fin:</label>
                <input 
                  type="date" 
                  value={localDateFin}
                  onChange={(e) => setLocalDateFin(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto bg-white"
                />
              </div>
              
              <Button 
                onClick={handleRechercher}
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
                  onClick={handleImprimer}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm px-4 py-2"
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

      {/* Statistiques - 8 cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border border-gray-200 border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Total Convocations</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {loading ? <Loader2 className="w-8 h-8 animate-spin text-blue-600" /> : formatNumber(stats?.totalConvocations || 0)}
            </div>
            <div className={`flex items-center gap-2 text-sm font-medium ${
              stats?.evolutionConvocations 
                ? (stats.evolutionConvocations.startsWith('-') 
                    ? 'text-red-600' 
                    : 'text-green-600')
                : 'text-gray-600'
            }`}>
              {stats?.evolutionConvocations?.startsWith('-') ? 
                <TrendingDown className="w-4 h-4" /> : 
                <TrendingUp className="w-4 h-4" />
              }
              {stats?.evolutionConvocations || '0'} {getPeriodeLabel()}
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Envoyées</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {loading ? <Loader2 className="w-8 h-8 animate-spin text-blue-600" /> : formatNumber(stats?.envoyees || 0)}
            </div>
            <div className={`flex items-center gap-2 text-sm font-medium ${
              stats?.evolutionEnvoyees 
                ? (stats.evolutionEnvoyees.startsWith('-') 
                    ? 'text-red-600' 
                    : 'text-green-600')
                : 'text-gray-600'
            }`}>
              {stats?.evolutionEnvoyees?.startsWith('-') ? 
                <TrendingDown className="w-4 h-4" /> : 
                <TrendingUp className="w-4 h-4" />
              }
              {stats?.evolutionEnvoyees || '0'} {getPeriodeLabel()}
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Honorées</h3>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {loading ? <Loader2 className="w-8 h-8 animate-spin text-green-600" /> : formatNumber(stats?.honorees || 0)}
            </div>
            <div className={`flex items-center gap-2 text-sm font-medium ${
              stats?.evolutionHonorees 
                ? (stats.evolutionHonorees.startsWith('-') 
                    ? 'text-red-600' 
                    : 'text-green-600')
                : 'text-gray-600'
            }`}>
              {stats?.evolutionHonorees?.startsWith('-') ? 
                <TrendingDown className="w-4 h-4" /> : 
                <TrendingUp className="w-4 h-4" />
              }
              {stats?.evolutionHonorees || '0'} {getPeriodeLabel()}
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
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {loading ? <Loader2 className="w-8 h-8 animate-spin text-orange-600" /> : formatNumber(stats?.enAttente || 0)}
            </div>
            <div className={`flex items-center gap-2 text-sm font-medium ${
              stats?.evolutionEnAttente 
                ? (stats.evolutionEnAttente.startsWith('-') 
                    ? 'text-green-600' 
                    : 'text-red-600')
                : 'text-gray-600'
            }`}>
           
             
            </div>
          </CardBody>
        </Card>

        {/* <Card className="bg-white border border-gray-200 border-t-4 border-t-purple-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Délai Moyen</h3>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {loading ? <Loader2 className="w-8 h-8 animate-spin text-purple-600" /> : delaiMoyenFormate}
            </div>
            <div className={`text-sm font-medium ${
              stats?.evolutionDelai?.startsWith('-') ? 'text-green-600' : 'text-slate-600'
            }`}>
              {stats?.evolutionDelai || 'De résolution'}
            </div>
          </CardBody>
        </Card> */}
{/* 
        <Card className="bg-white border border-gray-200 border-t-4 border-t-indigo-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Taux d'Honneur</h3>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {loading ? <Loader2 className="w-8 h-8 animate-spin text-indigo-600" /> : tauxHonore}
            </div>
            <div className={`flex items-center gap-2 text-sm font-medium ${
              stats?.evolutionTauxHonore 
                ? (stats.evolutionTauxHonore.startsWith('-') 
                    ? 'text-red-600' 
                    : 'text-green-600')
                : 'text-gray-600'
            }`}>
              {stats?.evolutionTauxHonore?.startsWith('-') ? 
                <TrendingDown className="w-4 h-4" /> : 
                <TrendingUp className="w-4 h-4" />
              }
              {stats?.evolutionTauxHonore || '0'} {getPeriodeLabel()}
            </div>
          </CardBody>
        </Card> */}

        {/* <Card className="bg-white border border-gray-200 border-t-4 border-t-cyan-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Agents Actifs</h3>
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                <Flag className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {loading ? <Loader2 className="w-8 h-8 animate-spin text-cyan-600" /> : `${stats?.agentsActifsCount || 0}/${stats?.totalAgents || 0}`}
            </div>
            <div className="text-sm text-slate-600">En opération</div>
          </CardBody>
        </Card> */}

        {/* <Card className="bg-white border border-gray-200 border-t-4 border-t-pink-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Nouvelles</h3>
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-pink-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {loading ? <Loader2 className="w-8 h-8 animate-spin text-pink-600" /> : formatNumber(stats?.nouvelles || 0)}
            </div>
            <div className={`flex items-center gap-2 text-sm font-medium ${
              stats?.evolutionNouvelles 
                ? (stats.evolutionNouvelles.startsWith('-') 
                    ? 'text-red-600' 
                    : 'text-green-600')
                : 'text-gray-600'
            }`}>
              {stats?.evolutionNouvelles?.startsWith('-') ? 
                <TrendingDown className="w-4 h-4" /> : 
                <TrendingUp className="w-4 h-4" />
              }
              {stats?.evolutionNouvelles || '0'} {getPeriodeLabel()}
            </div>
          </CardBody>
        </Card> */}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Activité Convocations {getPeriodeLabel()}
            </h3>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : chartActivityData.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-slate-500">
                <p>Aucune donnée d'activité disponible</p>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartActivityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} axisLine={false} tickLine={false} />
                    <YAxis stroke="#6b7280" fontSize={12} axisLine={false} tickLine={false} />
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
                    <Bar dataKey="convocations" fill="#6B9FED" radius={[8, 8, 0, 0]} maxBarSize={50} name="Convocations" />
                    <Bar dataKey="envoyees" fill="#3B82F6" radius={[8, 8, 0, 0]} maxBarSize={50} name="Envoyées" />
                    <Bar dataKey="honorees" fill="#10B981" radius={[8, 8, 0, 0]} maxBarSize={50} name="Honorées" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Répartition par statut</h3>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : statusDistribution.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-500">
                <p>Aucune donnée disponible</p>
              </div>
            ) : (
              <>
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
                        label={(entry: any) => entry.value > 0 ? `${entry.value}` : ''}
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 space-y-3">
                  {statusDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm text-gray-700">{item.name}</span>
                      </div>
                      <span className="font-bold text-gray-900">{formatNumber(item.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Top 5 Types de Convocations */}
      <Card className="mb-8">
        <CardBody className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Top 5 Types de Convocations</h3>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : topTypesWithPercentage.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-slate-500">
              <p>Aucune donnée disponible</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topTypesWithPercentage.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-slate-900">{item.type}</span>
                      <span className="text-slate-600">{item.count} convocations</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
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

      <div className="flex justify-center">
        <Button 
          onClick={() => router.push('/gestion/convocations')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
        >
          Voir toutes les convocations
        </Button>
      </div>

      <FomConvocationPage 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => {
          console.log('Convocation créée:', data);
          refetch();
          setIsModalOpen(false);
        }}
      />

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
                  setIsCustomDateRange(false);
                  setLocalDateDebut('');
                  setLocalDateFin('');
                  applyCustomDates('', '');
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
  );
}