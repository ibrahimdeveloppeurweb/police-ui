'use client';

import React, { useState } from 'react';
import {
  AlertTriangle, Plus, Database, RefreshCw, Car, Search, Shield, CheckCircle,
  Eye, MapPin, Radio, Users, FileText, Download, Clock, AlertCircle, TrendingUp,
  Calendar, Printer, FileDown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';

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
}

export default function SecuritePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('jour');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [isCustomDateRange, setIsCustomDateRange] = useState(false);

  // Données selon la période sélectionnée
  const dataByPeriod = {
    jour: {
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
          total: 3,
          evolution: '+3 aujourd\'hui',
          critiques: 1,
          moyens: 1,
          anciens: 1
        },
        avisRecherche: {
          total: 2,
          status: 'Actif',
          hautePriorite: 1,
          normale: 1
        },
        alertesAmber: {
          total: 0,
          status: 'Aucune',
          type: '-',
          zone: '-'
        },
        resolues: {
          total: 1,
          evolution: '+1 aujourd\'hui',
          vehiculesRetrouve: 1,
          suspectsArretes: 0
        }
      }
    },
    semaine: {
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
        },
        {
          id: 'RS-456-TU',
          plaque: 'RS-456-TU',
          vehicule: 'Toyota RAV4',
          couleur: 'Rouge',
          proprietaire: 'YAO Patrick',
          status: 'VOLÉ' as AlertStatus,
          signalement: 'Il y a 3 jours',
          zone: 'Marcory',
          temps: '3J',
          description: 'Vol récent',
          priorite: 'VOLÉ' as const
        },
        {
          id: 'VW-890-XY',
          plaque: 'VW-890-XY',
          vehicule: 'Nissan Patrol',
          couleur: 'Verte',
          proprietaire: 'KOUASSI Marie',
          status: 'RECHERCHÉ' as AlertStatus,
          signalement: 'Il y a 5 jours',
          zone: 'Multi-zones',
          temps: '5J',
          description: 'Enquête en cours',
          priorite: 'HAUTE' as const
        }
      ],
      stats: {
        vehiculesVoles: {
          total: 12,
          evolution: '+5 cette semaine',
          critiques: 2,
          moyens: 7,
          anciens: 3
        },
        avisRecherche: {
          total: 5,
          status: 'Stable',
          hautePriorite: 2,
          normale: 3
        },
        alertesAmber: {
          total: 1,
          status: 'Active 2j',
          type: 'Enlèvement',
          zone: 'Abidjan'
        },
        resolues: {
          total: 3,
          evolution: '+1 vs semaine dernière',
          vehiculesRetrouve: 2,
          suspectsArretes: 1
        }
      }
    },
    mois: {
      alerts: [
        {
          id: 'AB-789-EF',
          plaque: 'AB-789-EF',
          vehicule: 'Toyota Corolla 2019',
          couleur: 'Blanc',
          proprietaire: 'DIABATE Moussa',
          status: 'DÉTECTÉ' as AlertStatus,
          signalement: 'Il y a 1 jour',
          zone: 'Boulevard Principal',
          temps: '1J',
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
          signalement: 'Il y a 1 jour',
          zone: "Région d'Abidjan",
          temps: '1J',
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
          signalement: 'Il y a 2 jours',
          zone: 'Zone non définie',
          temps: '2J',
          description: 'Vol simple',
          priorite: 'VOLÉ' as const
        },
        {
          id: 'MN-789-PQ',
          plaque: 'MN-789-PQ',
          vehicule: 'BMW X5',
          couleur: 'Bleue',
          proprietaire: 'Recherche routine',
          status: 'RECHERCHÉ' as AlertStatus,
          signalement: 'Il y a 3 jours',
          zone: 'Multi-zones',
          temps: '3J',
          description: 'Enquête en cours',
          priorite: 'NORMALE' as const
        },
        {
          id: 'RS-456-TU',
          plaque: 'RS-456-TU',
          vehicule: 'Toyota RAV4',
          couleur: 'Rouge',
          proprietaire: 'YAO Patrick',
          status: 'VOLÉ' as AlertStatus,
          signalement: 'Il y a 1 semaine',
          zone: 'Marcory',
          temps: '7J',
          description: 'Vol récent',
          priorite: 'VOLÉ' as const
        }
      ],
      stats: {
        vehiculesVoles: {
          total: 23,
          evolution: '+3 ce mois',
          critiques: 2,
          moyens: 15,
          anciens: 6
        },
        avisRecherche: {
          total: 8,
          status: 'Stable',
          hautePriorite: 3,
          normale: 5
        },
        alertesAmber: {
          total: 1,
          status: 'Active 3h15',
          type: 'Enlèvement enfant',
          zone: 'Zone nationale'
        },
        resolues: {
          total: 5,
          evolution: '+2 vs mois dernier',
          vehiculesRetrouve: 3,
          suspectsArretes: 2
        }
      }
    },
    annee: {
      alerts: [
        {
          id: 'ZA-234-BC',
          plaque: 'ZA-234-BC',
          vehicule: 'Land Cruiser V8',
          couleur: 'Noir',
          proprietaire: 'BAMBA Issiaka',
          status: 'DÉTECTÉ' as AlertStatus,
          signalement: 'Il y a 2 mois',
          zone: 'Zone nationale',
          temps: '2M',
          description: 'Vol organisé',
          priorite: 'CRITIQUE' as const
        },
        {
          id: 'DE-567-FG',
          plaque: 'DE-567-FG',
          vehicule: 'Range Rover Sport',
          couleur: 'Blanche',
          proprietaire: 'KOUAME Patrick',
          status: 'RECHERCHÉ' as AlertStatus,
          signalement: 'Il y a 4 mois',
          zone: 'Multi-régions',
          temps: '4M',
          description: 'Réseau international',
          priorite: 'HAUTE' as const
        },
        {
          id: 'HI-890-JK',
          plaque: 'HI-890-JK',
          vehicule: 'Lexus LX570',
          couleur: 'Grise',
          proprietaire: 'DIALLO Fatou',
          status: 'VOLÉ' as AlertStatus,
          signalement: 'Il y a 6 mois',
          zone: 'Abidjan-Yamoussoukro',
          temps: '6M',
          description: 'Vol avec violence',
          priorite: 'VOLÉ' as const
        }
      ],
      stats: {
        vehiculesVoles: {
          total: 187,
          evolution: '+45 cette année',
          critiques: 23,
          moyens: 98,
          anciens: 66
        },
        avisRecherche: {
          total: 67,
          status: 'En hausse',
          hautePriorite: 18,
          normale: 49
        },
        alertesAmber: {
          total: 8,
          status: '3 actives',
          type: 'Divers',
          zone: 'National'
        },
        resolues: {
          total: 89,
          evolution: '+23 vs année dernière',
          vehiculesRetrouve: 54,
          suspectsArretes: 35
        }
      }
    },
    tout: {
      alerts: [
        {
          id: 'LM-123-NO',
          plaque: 'LM-123-NO',
          vehicule: 'Mercedes G-Wagon',
          couleur: 'Noir mat',
          proprietaire: 'SANGARE Adama',
          status: 'DÉTECTÉ' as AlertStatus,
          signalement: 'Il y a 1 an',
          zone: 'Frontière Ghana',
          temps: '1A',
          description: 'Trafic international',
          priorite: 'CRITIQUE' as const
        },
        {
          id: 'PQ-456-RS',
          plaque: 'PQ-456-RS',
          vehicule: 'Porsche Cayenne',
          couleur: 'Bleu métallisé',
          proprietaire: 'TOURE Mariam',
          status: 'RECHERCHÉ' as AlertStatus,
          signalement: 'Il y a 2 ans',
          zone: 'Afrique de l\'Ouest',
          temps: '2A',
          description: 'Réseau criminel',
          priorite: 'HAUTE' as const
        },
        {
          id: 'TU-789-VW',
          plaque: 'TU-789-VW',
          vehicule: 'BMW X7',
          couleur: 'Blanc perle',
          proprietaire: 'KOFFI Laurent',
          status: 'VOLÉ' as AlertStatus,
          signalement: 'Il y a 3 ans',
          zone: 'International',
          temps: '3A',
          description: 'Vol historique',
          priorite: 'VOLÉ' as const
        }
      ],
      stats: {
        vehiculesVoles: {
          total: 892,
          evolution: '+234 depuis 2020',
          critiques: 89,
          moyens: 456,
          anciens: 347
        },
        avisRecherche: {
          total: 345,
          status: 'Base complète',
          hautePriorite: 78,
          normale: 267
        },
        alertesAmber: {
          total: 45,
          status: 'Historique',
          type: 'Tous types',
          zone: 'National'
        },
        resolues: {
          total: 567,
          evolution: '+189 depuis 2020',
          vehiculesRetrouve: 389,
          suspectsArretes: 178
        }
      }
    },
    personnalise: {
      alerts: [
        {
          id: 'YZ-901-AB',
          plaque: 'YZ-901-AB',
          vehicule: 'Audi Q7',
          couleur: 'Gris anthracite',
          proprietaire: 'OUATTARA Sekou',
          status: 'DÉTECTÉ' as AlertStatus,
          signalement: 'Période sélectionnée',
          zone: 'Plateau',
          temps: '12H',
          description: 'Vol avec clés',
          priorite: 'CRITIQUE' as const
        },
        {
          id: 'CD-234-EF',
          plaque: 'CD-234-EF',
          vehicule: 'Honda CRV',
          couleur: 'Argent',
          proprietaire: 'BEUGRE Simon',
          status: 'RECHERCHÉ' as AlertStatus,
          signalement: 'Période sélectionnée',
          zone: 'Yopougon',
          temps: '2J',
          description: 'Enquête',
          priorite: 'NORMALE' as const
        }
      ],
      stats: {
        vehiculesVoles: {
          total: 8,
          evolution: 'Période personnalisée',
          critiques: 1,
          moyens: 4,
          anciens: 3
        },
        avisRecherche: {
          total: 3,
          status: 'Actif',
          hautePriorite: 1,
          normale: 2
        },
        alertesAmber: {
          total: 0,
          status: 'Aucune',
          type: '-',
          zone: '-'
        },
        resolues: {
          total: 2,
          evolution: 'Période sélectionnée',
          vehiculesRetrouve: 1,
          suspectsArretes: 1
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

  const getPriorityColor = (priorite: string) => {
    switch (priorite) {
      case 'CRITIQUE':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'HAUTE':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'VOLÉ':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getStatusColor = (status: AlertStatus) => {
    switch (status) {
      case 'DÉTECTÉ':
        return 'bg-red-500 text-white';
      case 'RECHERCHÉ':
        return 'bg-yellow-500 text-white';
      case 'VOLÉ':
        return 'bg-red-500 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Alertes Sécuritaires</h1>
        <p className="text-slate-600 mt-2">Gestion centralisée des véhicules volés et avis de recherche - Remontées de tous les commissariats nationaux</p>
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
                <span className="text-xs md:text-sm font-medium">Période personnalisée active: {dateDebut} au {dateFin}</span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Boutons d'action principaux */}
      <div className="flex items-center gap-3 mb-8">
        <Button variant="outline" size="sm" className="bg-red-600 text-white hover:bg-red-700 border-red-600">
          <AlertTriangle className="w-4 h-4" />
          Alerte d'Urgence
        </Button>
        <Button variant="warning" size="sm">
          <Plus className="w-4 h-4" />
          Nouvelle Alerte
        </Button>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </Button>
      </div>

      {/* Alertes critiques en cours */}
      <Card className="bg-red-50 border-l-4 border-red-600 mb-8">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-bold text-red-900">ALERTES CRITIQUES EN COURS</h2>
            </div>
            <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold">
              {currentData.stats.vehiculesVoles.critiques} ACTIVES
            </span>
          </div>

          {/* Affichage des alertes critiques selon les données */}
          {currentData.alerts.filter(alert => alert.priorite === 'CRITIQUE').map((alert, index) => (
            <Card key={alert.id} className={`border-2 border-red-300 ${index > 0 ? 'mt-4' : ''}`}>
              <CardBody className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Car className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">VÉHICULE VOLÉ DÉTECTÉ</h3>
                      <p className="text-sm text-slate-600">Contrôle en cours • Interception nécessaire</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold inline-block mb-2">
                      CRITIQUE
                    </span>
                    <p className="text-xl font-bold text-red-600">{alert.temps}</p>
                    <p className="text-xs text-slate-500">Il y a</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-6 bg-slate-50 rounded-xl p-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Véhicule</p>
                    <p className="font-bold text-slate-900 mb-1">{alert.plaque}</p>
                    <p className="text-sm text-slate-600">{alert.vehicule}</p>
                    <p className="text-sm text-slate-600">{alert.couleur}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Propriétaire</p>
                    <p className="font-bold text-slate-900 mb-1">{alert.proprietaire}</p>
                    <p className="text-sm text-slate-600">Signalé: {alert.signalement}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Zone</p>
                    <p className="font-bold text-slate-900 mb-1">{alert.zone}</p>
                    <p className="text-sm text-slate-600">{alert.description}</p>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {alert.zone}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" size="sm" className="col-span-2 md:col-span-2 bg-red-600 text-white hover:bg-red-700 border-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    COORDONNER INTERCEPTION
                  </Button>
                  <Button variant="outline" size="sm">
                    <MapPin className="w-4 h-4" />
                    Localiser
                  </Button>
                  <Button variant="outline" size="sm">
                    <Radio className="w-4 h-4" />
                    Contact
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}

          {/* Affichage des alertes HAUTE priorité */}
          {currentData.alerts.filter(alert => alert.priorite === 'HAUTE').map((alert) => (
            <Card key={alert.id} className="bg-yellow-50 border-2 border-yellow-400 mt-4">
              <CardBody className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Search className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">AVIS DE RECHERCHE</h3>
                      <p className="text-sm text-slate-600">Surveillance active requise • Priorité haute</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-lg text-xs font-bold inline-block mb-2">
                      HAUTE
                    </span>
                    <p className="text-xl font-bold text-orange-600">{alert.temps}</p>
                    <p className="text-xs text-slate-500">Émis</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-6 bg-white rounded-xl p-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Véhicule Recherché</p>
                    <p className="font-bold text-slate-900 mb-1">{alert.plaque}</p>
                    <p className="text-sm text-slate-600">{alert.vehicule}</p>
                    <p className="text-sm text-slate-600">{alert.couleur}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Motif</p>
                    <p className="font-bold text-slate-900 mb-1">{alert.description}</p>
                    <p className="text-sm text-slate-600">{alert.proprietaire}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Zone de Recherche</p>
                    <p className="font-bold text-slate-900 mb-1">{alert.zone}</p>
                    <p className="text-sm text-slate-600">Signalé: {alert.signalement}</p>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Tous commissariats alertés
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Button variant="warning" size="sm">
                    <Eye className="w-4 h-4" />
                    SURVEILLER ACTIVEMENT
                  </Button>
                  <Button variant="outline" size="sm">
                    <Radio className="w-4 h-4" />
                    Diffuser Équipes
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4" />
                    Rapport
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}

          {/* Message si aucune alerte critique */}
          {currentData.alerts.filter(alert => alert.priorite === 'CRITIQUE' || alert.priorite === 'HAUTE').length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-700">Aucune alerte critique en cours</p>
              <p className="text-sm text-slate-500">Toutes les alertes critiques ont été résolues</p>
            </div>
          )}
        </CardBody>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Véhicules volés */}
        <Card className="border-t-4 border-red-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Véhicules Volés</h3>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{currentData.stats.vehiculesVoles.total}</div>
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium mb-3">
              <TrendingUp className="w-4 h-4" />
              {currentData.stats.vehiculesVoles.evolution}
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Critiques: {currentData.stats.vehiculesVoles.critiques}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Moyens: {currentData.stats.vehiculesVoles.moyens}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Anciens: {currentData.stats.vehiculesVoles.anciens}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Avis de recherche */}
        <Card className="border-t-4 border-orange-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Avis de Recherche</h3>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{currentData.stats.avisRecherche.total}</div>
            <div className="flex items-center gap-2 text-slate-600 text-sm font-medium mb-3">
              — {currentData.stats.avisRecherche.status}
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-orange-600" />
                <span>Haute priorité: {currentData.stats.avisRecherche.hautePriorite}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-slate-600" />
                <span>Normale: {currentData.stats.avisRecherche.normale}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Alertes Amber */}
        <Card className="border-t-4 border-blue-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Alertes Amber</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{currentData.stats.alertesAmber.total}</div>
            <div className={`flex items-center gap-2 text-sm font-medium mb-3 ${currentData.stats.alertesAmber.total > 0 ? 'text-red-600' : 'text-slate-600'}`}>
              <Clock className="w-4 h-4" />
              {currentData.stats.alertesAmber.status}
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3 h-3 text-red-600" />
                <span>{currentData.stats.alertesAmber.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-blue-600" />
                <span>{currentData.stats.alertesAmber.zone}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Résolues */}
        <Card className="border-t-4 border-green-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Résolues</h3>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{currentData.stats.resolues.total}</div>
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium mb-3">
              <TrendingUp className="w-4 h-4" />
              {currentData.stats.resolues.evolution}
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Véhicules retrouvés: {currentData.stats.resolues.vehiculesRetrouve}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3 text-blue-600" />
                <span>Suspects arrêtés: {currentData.stats.resolues.suspectsArretes}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Base de données - Vue tableau */}
      <Card className="border border-slate-100">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Base de Données - Véhicules Recherchés ({
                isCustomDateRange ? 'Personnalisé' :
                globalFilter === 'jour' ? "Aujourd'hui" :
                globalFilter === 'semaine' ? 'Cette Semaine' :
                globalFilter === 'mois' ? 'Ce Mois' :
                globalFilter === 'annee' ? 'Cette Année' :
                'Historique'
              })
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher plaque..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-80"
                />
              </div>
              <Button variant="primary" size="sm">
                <Search className="w-4 h-4" />
                Rechercher
              </Button>
              <Button variant="success" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4" />
                Exporter
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Priorité</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Plaque</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Véhicule</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Signalement</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Zone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentData.alerts.map((alert) => (
                  <tr key={alert.id} className={`hover:bg-slate-50 ${
                    alert.priorite === 'CRITIQUE' ? 'bg-red-50' : 
                    alert.priorite === 'HAUTE' ? 'bg-yellow-50' : ''
                  }`}>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${getPriorityColor(alert.priorite)}`}>
                        {alert.priorite}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900">{alert.plaque}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{alert.vehicule}</p>
                        <p className="text-sm text-slate-500">{alert.couleur} • {alert.proprietaire}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(alert.status)}`}>
                        {alert.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{alert.signalement}</p>
                        <p className="text-sm text-slate-500">{alert.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700">{alert.zone}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {alert.priorite === 'CRITIQUE' ? (
                          <Button variant="outline" size="sm" className="bg-red-600 text-white hover:bg-red-700 border-red-600">
                            <AlertTriangle className="w-3 h-3" />
                            Intercepter
                          </Button>
                        ) : alert.priorite === 'HAUTE' ? (
                          <Button variant="warning" size="sm">
                            <Eye className="w-3 h-3" />
                            Surveiller
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm">
                            <Eye className="w-3 h-3" />
                            Détails
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}