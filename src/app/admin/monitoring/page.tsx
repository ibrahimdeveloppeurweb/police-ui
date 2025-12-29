'use client';

import React, { useState, useEffect } from 'react';
import { 
  Eye, Users, Car, AlertTriangle, CheckCircle, XCircle, Clock, MapPin, Radio,
  Shield, Activity, Wifi, WifiOff, Zap, Bell, RefreshCw, TrendingUp, Signal,
  Phone, MessageSquare, Navigation, Timer, AlertCircle, DollarSign, Cpu,
  HardDrive, BarChart3, Target, ChevronDown, Map, Database, Download, Building,
  CreditCard, FileText, UserCheck, TrendingDown, Wrench, Calendar, Search,
  Printer, FileDown, Award
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';

type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'

type ActivityType = {
  type: string;
  title: string;
  location: string;
  description: string;
  time: string;
  bgColor: string;
  borderColor: string;
  iconType: string;
}

export default function MonitoringPage() {
  const [isLive, setIsLive] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [mounted, setMounted] = useState(false);
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('jour');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [isCustomDateRange, setIsCustomDateRange] = useState(false);

  const getActivityIcon = (iconType: string) => {
    const iconClass = "w-5 h-5";
    switch(iconType) {
      case 'dollar': return <DollarSign className={`${iconClass} text-green-600`} />;
      case 'user': return <UserCheck className={`${iconClass} text-blue-600`} />;
      case 'chart': return <BarChart3 className={`${iconClass} text-slate-600`} />;
      case 'car': return <Car className={`${iconClass} text-orange-600`} />;
      case 'file': return <FileText className={`${iconClass} text-purple-600`} />;
      case 'users': return <Users className={`${iconClass} text-blue-600`} />;
      case 'award': return <Award className={`${iconClass} text-yellow-600`} />;
      case 'cpu': return <Cpu className={`${iconClass} text-indigo-600`} />;
      case 'database': return <Database className={`${iconClass} text-slate-600`} />;
      case 'target': return <Target className={`${iconClass} text-purple-600`} />;
      case 'calendar': return <Calendar className={`${iconClass} text-blue-600`} />;
      default: return <Activity className={`${iconClass} text-gray-600`} />;
    }
  };
  
  const dataByPeriod = {
    jour: {
      stats: {
        controles: 1309,
        revenus: 10.9,
        infractions: 228,
        agents: { actifs: 842, total: 956 },
        commissariats: { actifs: 23, total: 25 },
        evolution: '+201',
        performance: 109
      },
      commissariatsDetails: [
        { name: '3ème Arrdt', agents: 23, controles: 47, perf: 97, location: 'Adjamé, Abidjan', time: '30s', status: 'ACTIF', color: 'green' },
        { name: '5ème Arrdt', agents: 19, controles: 38, perf: 94, location: 'Marcory, Abidjan', time: '2min', status: 'ACTIF', color: 'green' },
        { name: '7ème Arrdt', agents: 21, controles: 42, perf: 89, location: 'Treichville, Abidjan', time: '1min', status: 'ACTIF', color: 'green' },
        { name: '10ème Arrdt', agents: 8, controles: 12, perf: 67, location: 'Abobo, Abidjan', time: '35min', status: 'MAINT.', color: 'yellow' },
        { name: '15ème Arrdt', agents: 16, controles: 29, perf: 82, location: 'Yopougon, Abidjan', time: '8min', status: 'ACTIF', color: 'green' }
      ],
      alertes: {
        vehicules: [
          { nom: 'Toyota Corolla - AB 1234 CI', info: '08:30' },
          { nom: 'Mercedes C300 - CD 5678 CI', info: 'Interpol' }
        ],
        personnes: [
          { nom: 'KONE Mamadou - 28 ans', info: 'Mandat' },
          { nom: 'DIALLO Aminata - 35 ans', info: 'Escroquerie' }
        ],
        zones: [
          { nom: 'Adjamé - Marché Central', info: 'Patrouilles' }
        ],
        communications: [
          { nom: 'Fréquence 1: Secteur Nord', info: '23 agents' }
        ]
      },
      activities: [
        {
          type: "PAIEMENT_AMENDE",
          title: "Système Mobile Money",
          location: "7ème Arrondissement", 
          description: "Amende payée - 25,000 FCFA",
          time: "5min",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          iconType: "dollar"
        },
        {
          type: "AGENT_CONNECTE", 
          title: "Agent KONE Ibrahim",
          location: "10ème Arrondissement",
          description: "Prise de service - Patrouille Zone Nord",
          time: "7min",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          iconType: "user"
        },
        {
          type: "RAPPORT_QUOTIDIEN",
          title: "Chef TRAORE",
          location: "15ème Arrondissement", 
          description: "Rapport envoyé - 47 contrôles, 8 infractions",
          time: "12min",
          bgColor: "bg-slate-50", 
          borderColor: "border-slate-200",
          iconType: "chart"
        }
      ]
    },
    semaine: {
      stats: {
        controles: 8393,
        revenus: 60.1,
        infractions: 1523,
        agents: { actifs: 842, total: 956 },
        commissariats: { actifs: 24, total: 25 },
        evolution: '+1287',
        performance: 118
      },
      commissariatsDetails: [
        { name: '3ème Arrdt', agents: 23, controles: 287, perf: 95, location: 'Adjamé, Abidjan', time: '2min', status: 'ACTIF', color: 'green' },
        { name: '5ème Arrdt', agents: 19, controles: 245, perf: 92, location: 'Marcory, Abidjan', time: '5min', status: 'ACTIF', color: 'green' },
        { name: '7ème Arrdt', agents: 21, controles: 268, perf: 90, location: 'Treichville, Abidjan', time: '3min', status: 'ACTIF', color: 'green' },
        { name: '10ème Arrdt', agents: 8, controles: 89, perf: 71, location: 'Abobo, Abidjan', time: '18min', status: 'ATTENTION', color: 'yellow' },
        { name: '15ème Arrdt', agents: 16, controles: 198, perf: 85, location: 'Yopougon, Abidjan', time: '7min', status: 'ACTIF', color: 'green' }
      ],
      alertes: {
        vehicules: [
          { nom: 'Toyota Corolla - AB 1234 CI', info: 'Lundi 08:30' },
          { nom: 'Mercedes C300 - CD 5678 CI', info: 'Interpol' },
          { nom: 'Peugeot 308 - EF 9012 CI', info: 'Mardi 14:20' }
        ],
        personnes: [
          { nom: 'KONE Mamadou - 28 ans', info: 'Mandat actif' },
          { nom: 'DIALLO Aminata - 35 ans', info: 'Escroquerie' },
          { nom: 'TRAORE Sekou - 42 ans', info: 'Abus confiance' }
        ],
        zones: [
          { nom: 'Adjamé - Marché Central', info: 'Patrouilles renforcées' },
          { nom: 'Yopougon - Zone 4', info: 'Surveillance accrue' }
        ],
        communications: [
          { nom: 'Fréquence 1: Secteur Nord', info: '23 agents' },
          { nom: 'Fréquence 2: Secteur Sud', info: '18 agents' }
        ]
      },
      activities: [
        {
          type: "CONTROLE_VEHICULE",
          title: "Poste de Contrôle Fixe",
          location: "3ème Arrondissement", 
          description: "Infraction détectée - Défaut assurance (45,000 FCFA)",
          time: "3min",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          iconType: "car"
        },
        {
          type: "PAIEMENT_AMENDE",
          title: "Mobile Money Orange",
          location: "5ème Arrondissement", 
          description: "3 amendes payées - Total: 85,000 FCFA",
          time: "8min",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          iconType: "dollar"
        },
        {
          type: "RAPPORT_HEBDO",
          title: "Synthèse Commissariats",
          location: "Direction Nationale", 
          description: "7 rapports reçus - 1,287 contrôles cette semaine",
          time: "15min",
          bgColor: "bg-slate-50", 
          borderColor: "border-slate-200",
          iconType: "chart"
        }
      ]
    },
    mois: {
      stats: {
        controles: 31674,
        revenus: 228.6,
        infractions: 5789,
        agents: { actifs: 842, total: 956 },
        commissariats: { actifs: 25, total: 25 },
        evolution: '+4856',
        performance: 125
      },
      commissariatsDetails: [
        { name: '3ème Arrdt', agents: 23, controles: 1234, perf: 96, location: 'Adjamé, Abidjan', time: '1min', status: 'ACTIF', color: 'green' },
        { name: '5ème Arrdt', agents: 19, controles: 1087, perf: 93, location: 'Marcory, Abidjan', time: '4min', status: 'ACTIF', color: 'green' },
        { name: '7ème Arrdt', agents: 21, controles: 1156, perf: 91, location: 'Treichville, Abidjan', time: '2min', status: 'ACTIF', color: 'green' },
        { name: '10ème Arrdt', agents: 8, controles: 456, perf: 74, location: 'Abobo, Abidjan', time: '12min', status: 'ATTENTION', color: 'yellow' },
        { name: '15ème Arrdt', agents: 16, controles: 892, perf: 87, location: 'Yopougon, Abidjan', time: '6min', status: 'ACTIF', color: 'green' }
      ],
      alertes: {
        vehicules: [
          { nom: '12 véhicules recherchés', info: 'Ce mois' },
          { nom: 'Mercedes C300 - CD 5678 CI', info: 'Priorité Interpol' },
          { nom: 'BMW X5 - GH 3456 CI', info: '15/10 - Vol aggravé' }
        ],
        personnes: [
          { nom: '28 personnes recherchées', info: 'Mandats actifs' },
          { nom: 'KONE Mamadou - 28 ans', info: 'Mandat depuis 03/10' },
          { nom: 'DIALLO Aminata - 35 ans', info: 'Escroquerie majeure' }
        ],
        zones: [
          { nom: 'Adjamé - Marché Central', info: 'Patrouilles quotidiennes' },
          { nom: 'Yopougon - Multiple zones', info: 'Surveillance continue' },
          { nom: 'Treichville - Port', info: 'Contrôles renforcés' }
        ],
        communications: [
          { nom: 'Toutes fréquences actives', info: 'Réseau national' },
          { nom: 'Coordination inter-commissariats', info: '25 postes' }
        ]
      },
      activities: [
        {
          type: "BILAN_MENSUEL",
          title: "Rapport National",
          location: "Direction Générale", 
          description: "Synthèse octobre - 31,674 contrôles, 5,789 infractions",
          time: "2h",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200",
          iconType: "file"
        },
        {
          type: "REVENUS_COLLECTES",
          title: "Trésorerie Nationale",
          location: "Service Financier", 
          description: "Revenus mensuels: 228.6M FCFA collectés",
          time: "3h",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          iconType: "dollar"
        },
        {
          type: "FORMATION_AGENTS",
          title: "Centre de Formation",
          location: "Abidjan Centre", 
          description: "56 agents formés - Nouvelles procédures",
          time: "5h",
          bgColor: "bg-blue-50", 
          borderColor: "border-blue-200",
          iconType: "users"
        }
      ]
    },
    annee: {
      stats: {
        controles: 303352,
        revenus: 2203,
        infractions: 55234,
        agents: { actifs: 842, total: 956 },
        commissariats: { actifs: 25, total: 25 },
        evolution: '+48567',
        performance: 132
      },
      commissariatsDetails: [
        { name: '3ème Arrdt', agents: 23, controles: 14567, perf: 97, location: 'Adjamé, Abidjan', time: '45s', status: 'ACTIF', color: 'green' },
        { name: '5ème Arrdt', agents: 19, controles: 12845, perf: 94, location: 'Marcory, Abidjan', time: '3min', status: 'ACTIF', color: 'green' },
        { name: '7ème Arrdt', agents: 21, controles: 13456, perf: 92, location: 'Treichville, Abidjan', time: '2min', status: 'ACTIF', color: 'green' },
        { name: '10ème Arrdt', agents: 8, controles: 5234, perf: 78, location: 'Abobo, Abidjan', time: '8min', status: 'ATTENTION', color: 'yellow' },
        { name: '15ème Arrdt', agents: 16, controles: 9876, perf: 89, location: 'Yopougon, Abidjan', time: '5min', status: 'ACTIF', color: 'green' }
      ],
      alertes: {
        vehicules: [
          { nom: '156 véhicules recherchés', info: 'Cette année' },
          { nom: '23 retrouvés', info: 'Taux: 14.7%' },
          { nom: 'Mercedes C300 - CD 5678 CI', info: 'Alerte Interpol active' }
        ],
        personnes: [
          { nom: '342 personnes recherchées', info: 'Mandats annuels' },
          { nom: '89 interpellations', info: 'Taux: 26%' },
          { nom: 'Bases de données nationales', info: 'Mises à jour' }
        ],
        zones: [
          { nom: 'Surveillance annuelle', info: '25 commissariats' },
          { nom: 'Zones à risque identifiées', info: '12 secteurs' },
          { nom: 'Patrouilles optimisées', info: 'Couverture 95%' }
        ],
        communications: [
          { nom: 'Réseau national opérationnel', info: '365 jours' },
          { nom: 'Coordination maximale', info: '100% disponibilité' }
        ]
      },
      activities: [
        {
          type: "BILAN_ANNUEL",
          title: "Rapport Annuel 2025",
          location: "Ministère Intérieur", 
          description: "Année record - 303,352 contrôles, Performance: 132%",
          time: "1j",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          iconType: "award"
        },
        {
          type: "REVENUS_ANNUELS",
          title: "Bilan Financier",
          location: "Trésorerie Publique", 
          description: "Revenus annuels: 2.2 Milliards FCFA",
          time: "1j",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          iconType: "dollar"
        },
        {
          type: "EVOLUTION_SYSTEME",
          title: "Modernisation",
          location: "Direction Technique", 
          description: "Déploiement nouveau système - 25 commissariats",
          time: "2j",
          bgColor: "bg-indigo-50", 
          borderColor: "border-indigo-200",
          iconType: "cpu"
        }
      ]
    },
    tout: {
      stats: {
        controles: 1398840,
        revenus: 10092,
        infractions: 254789,
        agents: { actifs: 842, total: 956 },
        commissariats: { actifs: 25, total: 25 },
        evolution: '+234567',
        performance: 145
      },
      commissariatsDetails: [
        { name: '3ème Arrdt', agents: 23, controles: 72456, perf: 98, location: 'Adjamé, Abidjan', time: '30s', status: 'ACTIF', color: 'green' },
        { name: '5ème Arrdt', agents: 19, controles: 64287, perf: 96, location: 'Marcory, Abidjan', time: '2min', status: 'ACTIF', color: 'green' },
        { name: '7ème Arrdt', agents: 21, controles: 68934, perf: 94, location: 'Treichville, Abidjan', time: '1min', status: 'ACTIF', color: 'green' },
        { name: '10ème Arrdt', agents: 8, controles: 28567, perf: 82, location: 'Abobo, Abidjan', time: '5min', status: 'ACTIF', color: 'green' },
        { name: '15ème Arrdt', agents: 16, controles: 52134, perf: 91, location: 'Yopougon, Abidjan', time: '3min', status: 'ACTIF', color: 'green' }
      ],
      alertes: {
        vehicules: [
          { nom: 'Base de données complète', info: 'Archives nationales' },
          { nom: '1,245 véhicules traités', info: 'Historique total' },
          { nom: 'Taux de résolution', info: '18.5%' }
        ],
        personnes: [
          { nom: '2,876 dossiers traités', info: 'Archives complètes' },
          { nom: '743 interpellations', info: 'Taux: 25.8%' },
          { nom: 'Base nationale active', info: 'Système opérationnel' }
        ],
        zones: [
          { nom: 'Couverture nationale totale', info: '25 commissariats' },
          { nom: 'Historique des interventions', info: '5+ années' },
          { nom: 'Optimisation continue', info: 'Amélioration 23%' }
        ],
        communications: [
          { nom: 'Infrastructure complète', info: 'Réseau établi' },
          { nom: 'Coordination historique', info: 'Excellence opérationnelle' }
        ]
      },
      activities: [
        {
          type: "ARCHIVES_HISTORIQUES",
          title: "Base de Données Nationale",
          location: "Centre Informatique", 
          description: "Archives complètes - 1.4M contrôles depuis création",
          time: "5j",
          bgColor: "bg-slate-50",
          borderColor: "border-slate-200",
          iconType: "database"
        },
        {
          type: "REVENUS_TOTAL",
          title: "Bilan Historique",
          location: "Ministère Finances", 
          description: "Revenus cumulés: 10.1 Milliards FCFA",
          time: "5j",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          iconType: "dollar"
        },
        {
          type: "EXCELLENCE_OPERATIONNELLE",
          title: "Performance Nationale",
          location: "Direction Générale", 
          description: "Performance globale: 145% - Record historique",
          time: "7j",
          bgColor: "bg-purple-50", 
          borderColor: "border-purple-200",
          iconType: "target"
        }
      ]
    },
    personnalise: {
      stats: {
        controles: 6036,
        revenus: 43.6,
        infractions: 1098,
        agents: { actifs: 842, total: 956 },
        commissariats: { actifs: 24, total: 25 },
        evolution: '+892',
        performance: 115
      },
      commissariatsDetails: [
        { name: '3ème Arrdt', agents: 23, controles: 187, perf: 94, location: 'Adjamé, Abidjan', time: '3min', status: 'ACTIF', color: 'green' },
        { name: '5ème Arrdt', agents: 19, controles: 156, perf: 91, location: 'Marcory, Abidjan', time: '6min', status: 'ACTIF', color: 'green' },
        { name: '7ème Arrdt', agents: 21, controles: 168, perf: 88, location: 'Treichville, Abidjan', time: '4min', status: 'ACTIF', color: 'green' },
        { name: '10ème Arrdt', agents: 8, controles: 56, perf: 69, location: 'Abobo, Abidjan', time: '22min', status: 'ATTENTION', color: 'yellow' },
        { name: '15ème Arrdt', agents: 16, controles: 134, perf: 83, location: 'Yopougon, Abidjan', time: '9min', status: 'ACTIF', color: 'green' }
      ],
      alertes: {
        vehicules: [
          { nom: 'Période sélectionnée', info: 'Données filtrées' },
          { nom: 'Véhicules recherchés', info: 'Voir détails' }
        ],
        personnes: [
          { nom: 'Période personnalisée', info: 'Analyse en cours' },
          { nom: 'Mandats actifs', info: 'Période ciblée' }
        ],
        zones: [
          { nom: 'Surveillance période', info: 'Selon dates' }
        ],
        communications: [
          { nom: 'Activité période', info: 'Analyse complète' }
        ]
      },
      activities: [
        {
          type: "ANALYSE_PERSONNALISEE",
          title: "Rapport Période Ciblée",
          location: "Analyse de données", 
          description: "Période personnalisée sélectionnée",
          time: "Custom",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          iconType: "calendar"
        },
        {
          type: "DONNEES_FILTREES",
          title: "Statistiques Filtrées",
          location: "Système Central", 
          description: "6,036 contrôles - 1,098 infractions détectées",
          time: "Custom",
          bgColor: "bg-slate-50", 
          borderColor: "border-slate-200",
          iconType: "chart"
        },
        {
          type: "REVENUS_PERIODE",
          title: "Revenus Période",
          location: "Service Financier", 
          description: "43.6M FCFA collectés sur la période",
          time: "Custom",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          iconType: "dollar"
        }
      ]
    }
  };

  const currentData = isCustomDateRange ? dataByPeriod.personnalise : dataByPeriod[globalFilter];

  const [stats, setStats] = useState(currentData.stats);
  const [activities, setActivities] = useState<ActivityType[]>(currentData.activities);

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const handleFilterChange = (filter: PeriodKey) => {
    setGlobalFilter(filter);
    setIsCustomDateRange(false);
    setDateDebut('');
    setDateFin('');
    setStats(dataByPeriod[filter].stats);
    setActivities(dataByPeriod[filter].activities);
  };

  const handleCustomDateSearch = () => {
    if (dateDebut && dateFin) {
      setIsCustomDateRange(true);
      setGlobalFilter('personnalise');
      setStats(dataByPeriod.personnalise.stats);
      setActivities(dataByPeriod.personnalise.activities);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    alert('Export des données en cours...\nFormat: CSV/Excel/PDF');
  };

  useEffect(() => {
    setMounted(true);
    
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    
    updateTime();
    
    if (isLive) {
      const interval = setInterval(() => {
        updateTime();
        
        setStats(prev => ({
          ...prev,
          controles: prev.controles + Math.floor(Math.random() * 2),
          revenus: prev.revenus + (Math.random() * 0.05),
          infractions: prev.infractions + Math.floor(Math.random() * 2)
        }));

        setActivities(prev => prev.map(activity => ({
          ...activity,
          time: activity.time.includes('min') ? (parseInt(activity.time) + 1) + "min" : activity.time
        })));
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [isLive]);

  return (
    <div className="min-h-screen space-y-6">
      {/* Header principal */}
      <Card className="border-l-4 border-blue-500">
        <CardBody className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span className="truncate">SUPERVISION NATIONALE</span>
                  <span className="flex items-center gap-2 text-xs sm:text-sm bg-blue-100 text-blue-600 px-2 sm:px-3 py-1 rounded-full w-fit">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    LIVE
                  </span>
                </h1>
                <p className="text-blue-600 mt-1 font-medium text-xs sm:text-sm">
                  Police Nationale CI - {mounted ? currentTime : '--:--:--'}
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setIsLive(!isLive)}
              variant="warning"
              size="sm"
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`w-4 h-4 ${isLive ? 'animate-spin' : ''}`} />
              <span>Actualisation Auto</span>
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="border-t-4 border-orange-500">
          <CardBody className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-xs sm:text-sm font-medium">CONTRÔLES<br/>PÉRIODE</h3>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{formatNumber(stats.controles)}</div>
            <div className="flex items-center gap-2 text-green-600 text-xs sm:text-sm font-medium mb-3">
              <TrendingUp className="w-4 h-4" />
              {stats.evolution} vs précédent
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Objectif: {formatNumber(Math.round(stats.controles * 0.92))}</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-3 h-3 text-blue-600" />
                <span>Performance: {stats.performance}%</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-green-500">
          <CardBody className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-xs sm:text-sm font-medium">REVENUS COLLECTÉS</h3>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              {stats.revenus >= 1000 ? `${(stats.revenus/1000).toFixed(1)}Mrd` : `${stats.revenus.toFixed(1)}M`}
            </div>
            <div className="flex items-center gap-2 text-green-600 text-xs sm:text-sm font-medium mb-3">
              <TrendingUp className="w-4 h-4" />
              {formatNumber(stats.infractions)} infractions
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center gap-2">
                <DollarSign className="w-3 h-3 text-green-600" />
                <span>Amendes payées</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-blue-600" />
                <span>{formatNumber(Math.round((stats.revenus * 1000000) / stats.infractions))} FCFA/infraction</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-blue-500">
          <CardBody className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-xs sm:text-sm font-medium">AGENTS<br/>OPÉRATIONNELS</h3>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{stats.agents.actifs}/{stats.agents.total}</div>
            <div className="flex items-center gap-2 text-green-600 text-xs sm:text-sm font-medium mb-3">
              <Users className="w-4 h-4" />
              {Math.round((stats.agents.actifs / stats.agents.total) * 100)}% disponibles
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center gap-2">
                <UserCheck className="w-3 h-3 text-blue-600" />
                <span>Sur le terrain</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-green-600" />
                <span>{stats.commissariats.actifs} commissariats</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-purple-500">
          <CardBody className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-xs sm:text-sm font-medium">COMMISSARIATS<br/>ACTIFS</h3>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Building className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{stats.commissariats.actifs}/{stats.commissariats.total}</div>
            <div className="flex items-center gap-2 text-green-600 text-xs sm:text-sm font-medium mb-3">
              <TrendingUp className="w-4 h-4" />
              Optimales
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center gap-2">
                <Building className="w-3 h-3 text-purple-600" />
                <span>Connectés</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-yellow-600" />
                <span>Charge: {Math.round((stats.commissariats.actifs / stats.commissariats.total) * 100)}%</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Alertes Sécuritaires */}
        <Card>
          <CardBody className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Alertes Sécuritaires</h3>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span className="text-sm font-bold text-red-800">Véhicules Recherchés</span>
                  </div>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold w-fit">URGENT</span>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  {currentData.alertes.vehicules.map((vehicule, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2">
                      <span className="text-red-700 truncate">{vehicule.nom}</span>
                      <span className="text-xs text-red-600 whitespace-nowrap">{vehicule.info}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-600 flex-shrink-0" />
                    <span className="text-sm font-bold text-orange-800">Personnes Recherchées</span>
                  </div>
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold w-fit">
                    {currentData.alertes.personnes.length} ACTIVES
                  </span>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  {currentData.alertes.personnes.slice(0, 2).map((personne, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2">
                      <span className="text-orange-700 truncate">{personne.nom}</span>
                      <span className="text-xs text-orange-600 whitespace-nowrap">{personne.info}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <span className="text-sm font-bold text-yellow-800">Zones Surveillées</span>
                  </div>
                  <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold w-fit">
                    {currentData.alertes.zones.length > 1 ? 'RENFORTS' : 'SURVEILLANCE'}
                  </span>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  {currentData.alertes.zones.map((zone, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2">
                      <span className="text-yellow-700 truncate">{zone.nom}</span>
                      <span className="text-xs text-yellow-600 whitespace-nowrap">{zone.info}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="text-sm font-bold text-blue-800">Communications</span>
                  </div>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  {currentData.alertes.communications.map((comm, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2">
                      <span className="text-blue-700 truncate">{comm.nom}</span>
                      <span className="text-xs text-blue-600 whitespace-nowrap">{comm.info}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </CardBody>
        </Card>

        {/* Activités Opérationnelles */}
        <Card>
          <CardBody className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Radio className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Activités en Direct</h3>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className={`rounded-xl p-3 sm:p-4 border ${activity.bgColor} ${activity.borderColor}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-900 text-xs sm:text-sm truncate">{activity.type}</h4>
                    <span className="text-xs text-gray-500 flex items-center gap-1 whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">{getActivityIcon(activity.iconType)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-blue-600 text-sm truncate">{activity.title}</div>
                      <div className="text-xs sm:text-sm text-gray-600 truncate">{activity.location}</div>
                      <div className="text-xs text-gray-600 truncate">{activity.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">6 événements/15min</span>
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Download className="w-4 h-4" />
                Journal
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* État des Commissariats */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">État des Commissariats</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <select className="bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm">
              <option>Toutes les zones</option>
              <option>Abidjan Centre</option>
              <option>Abidjan Nord</option>
              <option>Abidjan Sud</option>
            </select>
            <Button variant="warning" size="md" className="w-full sm:w-auto">
              <MapPin className="w-4 h-4" />
              Vue Carte
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {currentData.commissariatsDetails.map((comm, idx) => (
            <Card key={idx} className={`border-2 ${comm.color === 'green' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
              <CardBody className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">{comm.name}</h3>
                  <span className={`${comm.color === 'green' ? 'bg-green-500' : 'bg-yellow-500'} text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap`}>{comm.status}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">{comm.agents}</div>
                    <div className="text-xs text-gray-600">AGENTS</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">{formatNumber(comm.controles)}</div>
                    <div className="text-xs text-gray-600">CONTRÔLES</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">{comm.perf}%</div>
                    <div className="text-xs text-gray-600">PERF.</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 text-xs sm:text-sm">Dernière activité</span>
                    <span className="font-semibold text-xs sm:text-sm">{comm.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{comm.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="primary" size="sm" className="flex-1">
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Superviser</span>
                  </Button>
                  <button className="w-10 h-10 bg-white hover:bg-gray-50 rounded-xl flex items-center justify-center transition-colors border">
                    <Phone className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

   
      </div>
    </div>
  );
}