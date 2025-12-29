'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Plus, RefreshCw, Car, Search, Shield, CheckCircle,
  Eye, MapPin, Radio, Users, FileText, Download, Clock, AlertCircle, TrendingUp,
  Calendar, Printer, FileDown, Activity, Target, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type AlertStatus = 'DÉTECTÉ' | 'RECHERCHÉ' | 'VOLÉ';
type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise';

type VehicleAlert = {
  id: string;
  plaque: string;
  vehicule: string;
  couleur: string;
  proprietaire: string;
  status: AlertStatus;
  signalement: string;
  zone: string;
  temps: string;
  description: string;
  priorite: 'CRITIQUE' | 'HAUTE' | 'NORMALE' | 'VOLÉ';
};

interface Stats {
  vehiculesVoles: {
    total: number;
    evolution: string;
    critiques: number;
    moyens: number;
    anciens: number;
  };
  avisRecherche: {
    total: number;
    status: string;
    hautePriorite: number;
    normale: number;
  };
  alertesAmber: {
    total: number;
    status: string;
    type: string;
    zone: string;
  };
  resolues: {
    total: number;
    evolution: string;
    vehiculesRetrouve: number;
    suspectsArretes: number;
  };
  tempsReponse: {
    moyen: string;
    evolution: string;
  };
  tauxResolution: {
    pourcentage: string;
    evolution: string;
  };
  commissariatsActifs: {
    nombre: string;
    total: string;
  };
  montantRecupere: {
    total: string;
    evolution: string;
  };
}

export default function SecuritePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('jour');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [isCustomDateRange, setIsCustomDateRange] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Données selon la période sélectionnée
  const dataByPeriod = {
    jour: {
      activityData: [
        { period: '00h-04h', alertes: 1, critiques: 0, resolues: 0 },
        { period: '04h-08h', alertes: 2, critiques: 1, resolues: 0 },
        { period: '08h-12h', alertes: 5, critiques: 2, resolues: 1 },
        { period: '12h-16h', alertes: 8, critiques: 3, resolues: 2 },
        { period: '16h-20h', alertes: 6, critiques: 2, resolues: 1 },
        { period: '20h-24h', alertes: 3, critiques: 1, resolues: 0 }
      ],
      pieData: [
        { name: 'Détectés', value: 8, color: '#ef4444' },
        { name: 'Recherchés', value: 12, color: '#f59e0b' },
        { name: 'Résolus', value: 5, color: '#10b981' }
      ],
      vehiculesTypes: [
        { type: 'Toyota', nombre: 8 },
        { type: 'Mercedes', nombre: 6 },
        { type: 'BMW', nombre: 5 },
        { type: 'Peugeot', nombre: 3 },
        { type: 'Nissan', nombre: 3 }
      ],
      zonesRisque: [
        { zone: 'Boulevard Principal', alertes: 12 },
        { zone: 'Marcory', alertes: 8 },
        { zone: 'Cocody', alertes: 7 },
        { zone: 'Yopougon', alertes: 5 },
        { zone: 'Plateau', alertes: 3 }
      ],
      alerts: [
        {
          id: 'AB-789-EF',
          plaque: 'AB-789-EF',
          vehicule: 'Toyota Corolla 2019',
          couleur: 'Blanc',
          proprietaire: 'DIABATE Moussa',
          status: 'DÉTECTÉ' as AlertStatus,
          signalement: 'Aujourd\'hui 18h30',
          zone: 'Boulevard Principal',
          temps: '2H',
          description: 'Vol avec violence',
          priorite: 'CRITIQUE' as const
        },
        {
          id: 'CD-456-GH',
          plaque: 'CD-456-GH',
          vehicule: 'Peugeot 307',
          couleur: 'Grise',
          proprietaire: 'Suspect armé',
          status: 'RECHERCHÉ' as AlertStatus,
          signalement: 'Aujourd\'hui 14h',
          zone: "Région d'Abidjan",
          temps: '6H',
          description: 'Vol à main armée',
          priorite: 'HAUTE' as const
        },
        {
          id: 'GH-123-JK',
          plaque: 'GH-123-JK',
          vehicule: 'Mercedes C-Class',
          couleur: 'Noire',
          proprietaire: 'KONE Aminata',
          status: 'VOLÉ' as AlertStatus,
          signalement: 'Aujourd\'hui 8h',
          zone: 'Marcory',
          temps: '12H',
          description: 'Vol simple',
          priorite: 'VOLÉ' as const
        }
      ],
      stats: {
        vehiculesVoles: {
          total: 25,
          evolution: '+3 aujourd\'hui',
          critiques: 8,
          moyens: 12,
          anciens: 5
        },
        avisRecherche: {
          total: 12,
          status: 'Actif',
          hautePriorite: 5,
          normale: 7
        },
        alertesAmber: {
          total: 0,
          status: 'Aucune',
          type: '-',
          zone: '-'
        },
        resolues: {
          total: 5,
          evolution: '+2 aujourd\'hui',
          vehiculesRetrouve: 3,
          suspectsArretes: 2
        },
        tempsReponse: {
          moyen: '23 min',
          evolution: '-5 min vs hier'
        },
        tauxResolution: {
          pourcentage: '20.0%',
          evolution: '+5.0%'
        },
        commissariatsActifs: {
          nombre: '15',
          total: '18'
        },
        montantRecupere: {
          total: '45.2M',
          evolution: '+8.5M aujourd\'hui'
        }
      }
    },
    semaine: {
      activityData: [
        { period: 'Lun', alertes: 28, critiques: 8, resolues: 6 },
        { period: 'Mar', alertes: 25, critiques: 7, resolues: 5 },
        { period: 'Mer', alertes: 32, critiques: 10, resolues: 7 },
        { period: 'Jeu', alertes: 29, critiques: 9, resolues: 6 },
        { period: 'Ven', alertes: 35, critiques: 12, resolues: 8 },
        { period: 'Sam', alertes: 22, critiques: 6, resolues: 4 },
        { period: 'Dim', alertes: 18, critiques: 5, resolues: 3 }
      ],
      pieData: [
        { name: 'Détectés', value: 52, color: '#ef4444' },
        { name: 'Recherchés', value: 78, color: '#f59e0b' },
        { name: 'Résolus', value: 39, color: '#10b981' }
      ],
      vehiculesTypes: [
        { type: 'Toyota', nombre: 45 },
        { type: 'Mercedes', nombre: 38 },
        { type: 'BMW', nombre: 32 },
        { type: 'Peugeot', nombre: 28 },
        { type: 'Nissan', nombre: 26 }
      ],
      zonesRisque: [
        { zone: 'Boulevard Principal', alertes: 45 },
        { zone: 'Marcory', alertes: 38 },
        { zone: 'Cocody', alertes: 32 },
        { zone: 'Yopougon', alertes: 28 },
        { zone: 'Plateau', alertes: 26 }
      ],
      alerts: [
        {
          id: 'MN-789-PQ',
          plaque: 'MN-789-PQ',
          vehicule: 'BMW X5',
          couleur: 'Bleue',
          proprietaire: 'TRAORE Sekou',
          status: 'DÉTECTÉ' as AlertStatus,
          signalement: 'Il y a 2 jours',
          zone: 'Cocody',
          temps: '2J',
          description: 'Vol avec effraction',
          priorite: 'CRITIQUE' as const
        }
      ],
      stats: {
        vehiculesVoles: {
          total: 169,
          evolution: '+12 cette semaine',
          critiques: 52,
          moyens: 78,
          anciens: 39
        },
        avisRecherche: {
          total: 78,
          status: 'Stable',
          hautePriorite: 28,
          normale: 50
        },
        alertesAmber: {
          total: 1,
          status: 'Active 2j',
          type: 'Enlèvement',
          zone: 'Abidjan'
        },
        resolues: {
          total: 39,
          evolution: '+8 vs semaine dernière',
          vehiculesRetrouve: 24,
          suspectsArretes: 15
        },
        tempsReponse: {
          moyen: '28 min',
          evolution: '-3 min vs semaine dernière'
        },
        tauxResolution: {
          pourcentage: '23.1%',
          evolution: '+2.5%'
        },
        commissariatsActifs: {
          nombre: '17',
          total: '18'
        },
        montantRecupere: {
          total: '287.5M',
          evolution: '+45.8M cette semaine'
        }
      }
    },
    mois: {
      activityData: [
        { period: 'Sem 1', alertes: 156, critiques: 45, resolues: 32 },
        { period: 'Sem 2', alertes: 178, critiques: 52, resolues: 38 },
        { period: 'Sem 3', alertes: 165, critiques: 48, resolues: 35 },
        { period: 'Sem 4', alertes: 189, critiques: 57, resolues: 42 }
      ],
      pieData: [
        { name: 'Détectés', value: 215, color: '#ef4444' },
        { name: 'Recherchés', value: 326, color: '#f59e0b' },
        { name: 'Résolus', value: 147, color: '#10b981' }
      ],
      vehiculesTypes: [
        { type: 'Toyota', nombre: 189 },
        { type: 'Mercedes', nombre: 156 },
        { type: 'BMW', nombre: 134 },
        { type: 'Peugeot', nombre: 112 },
        { type: 'Nissan', nombre: 97 }
      ],
      zonesRisque: [
        { zone: 'Boulevard Principal', alertes: 167 },
        { zone: 'Marcory', alertes: 145 },
        { zone: 'Cocody', alertes: 123 },
        { zone: 'Yopougon', alertes: 108 },
        { zone: 'Plateau', alertes: 92 }
      ],
      alerts: [],
      stats: {
        vehiculesVoles: {
          total: 688,
          evolution: '+56 ce mois',
          critiques: 215,
          moyens: 326,
          anciens: 147
        },
        avisRecherche: {
          total: 326,
          status: 'Stable',
          hautePriorite: 112,
          normale: 214
        },
        alertesAmber: {
          total: 3,
          status: 'Active 3h15',
          type: 'Enlèvement enfant',
          zone: 'Zone nationale'
        },
        resolues: {
          total: 147,
          evolution: '+23 vs mois dernier',
          vehiculesRetrouve: 89,
          suspectsArretes: 58
        },
        tempsReponse: {
          moyen: '32 min',
          evolution: '-2 min vs mois dernier'
        },
        tauxResolution: {
          pourcentage: '21.4%',
          evolution: '+1.8%'
        },
        commissariatsActifs: {
          nombre: '18',
          total: '18'
        },
        montantRecupere: {
          total: '1.2Mrd',
          evolution: '+178M ce mois'
        }
      }
    },
    annee: {
      activityData: [
        { period: 'Jan', alertes: 567, critiques: 178, resolues: 123 },
        { period: 'Fév', alertes: 523, critiques: 165, resolues: 112 },
        { period: 'Mar', alertes: 645, critiques: 201, resolues: 135 },
        { period: 'Avr', alertes: 612, critiques: 189, resolues: 128 },
        { period: 'Mai', alertes: 689, critiques: 215, resolues: 145 },
        { period: 'Juin', alertes: 678, critiques: 212, resolues: 142 },
        { period: 'Juil', alertes: 723, critiques: 225, resolues: 156 },
        { period: 'Août', alertes: 701, critiques: 219, resolues: 149 },
        { period: 'Sep', alertes: 656, critiques: 205, resolues: 138 },
        { period: 'Oct', alertes: 688, critiques: 215, resolues: 147 }
      ],
      pieData: [
        { name: 'Détectés', value: 2145, color: '#ef4444' },
        { name: 'Recherchés', value: 3267, color: '#f59e0b' },
        { name: 'Résolus', value: 1375, color: '#10b981' }
      ],
      vehiculesTypes: [
        { type: 'Toyota', nombre: 1890 },
        { type: 'Mercedes', nombre: 1567 },
        { type: 'BMW', nombre: 1342 },
        { type: 'Peugeot', nombre: 1123 },
        { type: 'Nissan', nombre: 978 }
      ],
      zonesRisque: [
        { zone: 'Boulevard Principal', alertes: 1678 },
        { zone: 'Marcory', alertes: 1456 },
        { zone: 'Cocody', alertes: 1234 },
        { zone: 'Yopougon', alertes: 1089 },
        { zone: 'Plateau', alertes: 923 }
      ],
      alerts: [],
      stats: {
        vehiculesVoles: {
          total: 6787,
          evolution: '+456 cette année',
          critiques: 2145,
          moyens: 3267,
          anciens: 1375
        },
        avisRecherche: {
          total: 3267,
          status: 'En hausse',
          hautePriorite: 1123,
          normale: 2144
        },
        alertesAmber: {
          total: 18,
          status: '3 actives',
          type: 'Divers',
          zone: 'National'
        },
        resolues: {
          total: 1375,
          evolution: '+234 vs année dernière',
          vehiculesRetrouve: 834,
          suspectsArretes: 541
        },
        tempsReponse: {
          moyen: '35 min',
          evolution: '-8 min vs année dernière'
        },
        tauxResolution: {
          pourcentage: '20.3%',
          evolution: '+3.2%'
        },
        commissariatsActifs: {
          nombre: '18',
          total: '18'
        },
        montantRecupere: {
          total: '12.8Mrd',
          evolution: '+2.3Mrd cette année'
        }
      }
    },
    tout: {
      activityData: [
        { period: '2020', alertes: 4567, critiques: 1423, resolues: 892 },
        { period: '2021', alertes: 5234, critiques: 1634, resolues: 1045 },
        { period: '2022', alertes: 5789, critiques: 1812, resolues: 1156 },
        { period: '2023', alertes: 6123, critiques: 1923, resolues: 1234 },
        { period: '2024', alertes: 6787, critiques: 2145, resolues: 1375 }
      ],
      pieData: [
        { name: 'Détectés', value: 8934, color: '#ef4444' },
        { name: 'Recherchés', value: 13612, color: '#f59e0b' },
        { name: 'Résolus', value: 5702, color: '#10b981' }
      ],
      vehiculesTypes: [
        { type: 'Toyota', nombre: 8567 },
        { type: 'Mercedes', nombre: 7123 },
        { type: 'BMW', nombre: 6089 },
        { type: 'Peugeot', nombre: 5234 },
        { type: 'Nissan', nombre: 4456 }
      ],
      zonesRisque: [
        { zone: 'Boulevard Principal', alertes: 7234 },
        { zone: 'Marcory', alertes: 6456 },
        { zone: 'Cocody', alertes: 5678 },
        { zone: 'Yopougon', alertes: 4890 },
        { zone: 'Plateau', alertes: 4123 }
      ],
      alerts: [],
      stats: {
        vehiculesVoles: {
          total: 28500,
          evolution: '+2340 depuis 2020',
          critiques: 8934,
          moyens: 13612,
          anciens: 5702
        },
        avisRecherche: {
          total: 13612,
          status: 'Base complète',
          hautePriorite: 4678,
          normale: 8934
        },
        alertesAmber: {
          total: 67,
          status: 'Historique',
          type: 'Tous types',
          zone: 'National'
        },
        resolues: {
          total: 5702,
          evolution: '+1890 depuis 2020',
          vehiculesRetrouve: 3456,
          suspectsArretes: 2246
        },
        tempsReponse: {
          moyen: '38 min',
          evolution: '-15 min depuis 2020'
        },
        tauxResolution: {
          pourcentage: '20.0%',
          evolution: '+5.5% depuis 2020'
        },
        commissariatsActifs: {
          nombre: '18',
          total: '18'
        },
        montantRecupere: {
          total: '48.5Mrd',
          evolution: '+12.3Mrd depuis 2020'
        }
      }
    },
    personnalise: {
      activityData: [
        { period: '10/10', alertes: 28, critiques: 8, resolues: 6 },
        { period: '11/10', alertes: 25, critiques: 7, resolues: 5 },
        { period: '12/10', alertes: 32, critiques: 10, resolues: 7 },
        { period: '13/10', alertes: 29, critiques: 9, resolues: 6 },
        { period: '14/10', alertes: 25, critiques: 8, resolues: 5 }
      ],
      pieData: [
        { name: 'Détectés', value: 42, color: '#ef4444' },
        { name: 'Recherchés', value: 63, color: '#f59e0b' },
        { name: 'Résolus', value: 29, color: '#10b981' }
      ],
      vehiculesTypes: [
        { type: 'Toyota', nombre: 38 },
        { type: 'Mercedes', nombre: 31 },
        { type: 'BMW', nombre: 26 },
        { type: 'Peugeot', nombre: 22 },
        { type: 'Nissan', nombre: 19 }
      ],
      zonesRisque: [
        { zone: 'Boulevard Principal', alertes: 38 },
        { zone: 'Marcory', alertes: 31 },
        { zone: 'Cocody', alertes: 26 },
        { zone: 'Yopougon', alertes: 22 },
        { zone: 'Plateau', alertes: 19 }
      ],
      alerts: [],
      stats: {
        vehiculesVoles: {
          total: 139,
          evolution: 'Période personnalisée',
          critiques: 42,
          moyens: 63,
          anciens: 29
        },
        avisRecherche: {
          total: 63,
          status: 'Actif',
          hautePriorite: 22,
          normale: 41
        },
        alertesAmber: {
          total: 1,
          status: 'Active',
          type: 'Enlèvement',
          zone: 'Abidjan'
        },
        resolues: {
          total: 29,
          evolution: 'Période sélectionnée',
          vehiculesRetrouve: 18,
          suspectsArretes: 11
        },
        tempsReponse: {
          moyen: '26 min',
          evolution: 'Période personnalisée'
        },
        tauxResolution: {
          pourcentage: '20.9%',
          evolution: 'Période personnalisée'
        },
        commissariatsActifs: {
          nombre: '16',
          total: '18'
        },
        montantRecupere: {
          total: '234.5M',
          evolution: 'Période personnalisée'
        }
      }
    }
  };

  const currentData = isCustomDateRange ? dataByPeriod.personnalise : dataByPeriod[globalFilter];

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    alert('Export des données en cours...\nFormat: CSV/Excel/PDF');
  };

  const handleFilterChange = (filter: PeriodKey) => {
    setGlobalFilter(filter);
    setIsCustomDateRange(false);
    setDateDebut('');
    setDateFin('');
  };

  const handleCustomDateSearch = () => {
    if (dateDebut && dateFin) {
      setIsCustomDateRange(true);
      setGlobalFilter('personnalise');
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null || isNaN(num)) {
      return '0';
    }
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Alertes Sécuritaires - Tableau de Bord</h1>
        <p className="text-slate-600 mt-2">Gestion centralisée des véhicules volés et avis de recherche</p>
      </div>

      {/* Filtre Global de Période */}
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
                  <p className="text-gray-600 text-xs md:text-sm hidden sm:block">Sélectionnez la période pour filtrer toutes les données</p>
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
                <Button 
                  onClick={() => handleFilterChange('tout')}
                  className={`${globalFilter === 'tout' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
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
                <span className="text-xs md:text-sm font-medium">Période personnalisée active</span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Statistiques - 8 cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-t-4 border-red-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">VÉHICULES VOLÉS</h3>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Car className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{formatNumber(currentData.stats?.vehiculesVoles?.total)}</div>
            <div className="text-green-600 text-sm font-bold">{currentData.stats?.vehiculesVoles?.evolution || 'N/A'}</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-orange-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">AVIS DE RECHERCHE</h3>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Search className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{formatNumber(currentData.stats?.avisRecherche?.total)}</div>
            <div className="text-slate-600 text-sm font-bold">{currentData.stats?.avisRecherche?.status || 'N/A'}</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-blue-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">ALERTES AMBER</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{formatNumber(currentData.stats?.alertesAmber?.total)}</div>
            <div className={`text-sm font-bold ${(currentData.stats?.alertesAmber?.total || 0) > 0 ? 'text-red-600' : 'text-slate-600'}`}>
              {currentData.stats?.alertesAmber?.status || 'N/A'}
            </div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-green-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">RÉSOLUES</h3>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{formatNumber(currentData.stats?.resolues?.total)}</div>
            <div className="text-green-600 text-sm font-bold">{currentData.stats?.resolues?.evolution || 'N/A'}</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-purple-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">TEMPS RÉPONSE MOYEN</h3>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats?.tempsReponse?.moyen || 'N/A'}</div>
            <div className="text-green-600 text-sm font-bold">{currentData.stats?.tempsReponse?.evolution || 'N/A'}</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-indigo-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">TAUX DE RÉSOLUTION</h3>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats?.tauxResolution?.pourcentage || 'N/A'}</div>
            <div className="text-green-600 text-sm font-bold">{currentData.stats?.tauxResolution?.evolution || 'N/A'}</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-cyan-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">COMMISSARIATS ACTIFS</h3>
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">
              {currentData.stats?.commissariatsActifs?.nombre || '0'}/{currentData.stats?.commissariatsActifs?.total || '0'}
            </div>
            <div className="text-green-600 text-sm font-bold">
              {currentData.stats?.commissariatsActifs?.nombre && currentData.stats?.commissariatsActifs?.total 
                ? `${Math.round((parseInt(currentData.stats.commissariatsActifs.nombre) / parseInt(currentData.stats.commissariatsActifs.total)) * 100)}% opérationnel`
                : 'N/A'}
            </div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-teal-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">MONTANT RÉCUPÉRÉ</h3>
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-teal-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats?.montantRecupere?.total || 'N/A'}</div>
            <div className="text-green-600 text-sm font-bold">{currentData.stats?.montantRecupere?.evolution || 'N/A'} FCFA</div>
          </CardBody>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardBody className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Évolution des alertes sécuritaires</h3>
            
            <div className="h-80 w-full">
              {currentData.activityData && currentData.activityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={currentData.activityData} 
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
                      dataKey="alertes" 
                      fill="#6B9FED" 
                      radius={[8, 8, 0, 0]}
                      maxBarSize={50}
                      name="Total alertes"
                      isAnimationActive={false}
                    />
                    <Bar 
                      dataKey="critiques" 
                      fill="#EF4444" 
                      radius={[8, 8, 0, 0]}
                      maxBarSize={50}
                      name="Critiques"
                      isAnimationActive={false}
                    />
                    <Bar 
                      dataKey="resolues" 
                      fill="#10B981" 
                      radius={[8, 8, 0, 0]}
                      maxBarSize={50}
                      name="Résolues"
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Chargement des données...</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Répartition Statuts
            </h3>
            
            <div className="h-64 w-full">
              {currentData.pieData && currentData.pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentData.pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry:any) => `${(entry.percent * 100).toFixed(1)}%`}
                      outerRadius={80}
                      dataKey="value"
                      isAnimationActive={false}
                    >
                      {currentData.pieData.map((entry, index) => (
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
                  <p className="text-gray-500">Chargement des données...</p>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              {currentData.pieData.map((item, index) => (
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

      {/* Tableaux de données supplémentaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardBody className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Car className="w-6 h-6 text-blue-600" />
              Types de véhicules les plus volés
            </h3>
            <div className="space-y-4">
              {currentData.vehiculesTypes && currentData.vehiculesTypes.length > 0 ? (
                currentData.vehiculesTypes.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <span className="font-semibold text-slate-700">{item.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${currentData.vehiculesTypes[0]?.nombre ? (item.nombre / currentData.vehiculesTypes[0].nombre) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-slate-900 w-16 text-right">{formatNumber(item.nombre)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">Aucune donnée disponible</div>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-red-600" />
              Zones à haut risque
            </h3>
            <div className="space-y-4">
              {currentData.zonesRisque && currentData.zonesRisque.length > 0 ? (
                currentData.zonesRisque.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-red-600">#{index + 1}</span>
                      </div>
                      <span className="font-semibold text-slate-700">{item.zone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-red-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full" 
                          style={{ width: `${currentData.zonesRisque[0]?.alertes ? (item.alertes / currentData.zonesRisque[0].alertes) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-slate-900 w-16 text-right">{formatNumber(item.alertes)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">Aucune donnée disponible</div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}