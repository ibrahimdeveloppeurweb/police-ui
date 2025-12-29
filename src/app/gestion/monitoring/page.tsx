'use client';

import React, { useState, useEffect } from 'react';
import { 
  Eye, Users, Car, AlertTriangle, CheckCircle, XCircle, Clock, MapPin, Radio,
  Shield, Activity, Wifi, WifiOff, Zap, Bell, RefreshCw, TrendingUp, Signal,
  Phone, MessageSquare, Navigation, Timer, AlertCircle, DollarSign, Cpu,
  HardDrive, BarChart3, Target, ChevronDown, Map, Database, Download, Building,
  CreditCard, FileText, UserCheck, TrendingDown, Wrench, Calendar, Search,
  Printer, FileDown, Award, X, Info, ExternalLink, ChevronRight
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
  details?: {
    agent?: string;
    montant?: string;
    vehicule?: string;
    infractions?: string[];
    statut?: string;
    coordonnees?: string;
    observations?: string;
  };
}

type AlerteVehicule = {
  nom: string;
  info: string;
  details?: {
    immatriculation: string;
    marque: string;
    modele: string;
    couleur: string;
    dateMiseRecherche: string;
    motif: string;
    proprietaire: string;
    derniereLoc: string;
    niveau: 'URGENT' | 'IMPORTANT' | 'SURVEILLANCE';
  };
}

type AlertePersonne = {
  nom: string;
  info: string;
  details?: {
    identite: string;
    age: string;
    adresse: string;
    motif: string;
    dateMandat: string;
    juridiction: string;
    contacts: string;
    signalement: string;
  };
}

type AlerteZone = {
  nom: string;
  info: string;
  details?: {
    zone: string;
    niveauAlerte: string;
    motif: string;
    mesures: string;
    effectif: string;
    incidents: string;
    derniereAction: string;
  };
}

type AlerteCommunication = {
  nom: string;
  info: string;
  details?: {
    reseau: string;
    frequence: string;
    agentsConnectes: string;
    qualiteSignal: string;
    derniereVerif: string;
    couverture: string;
    backup: string;
  };
}

export default function CommissariatMonitoringPage() {
  const [isLive, setIsLive] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [mounted, setMounted] = useState(false);
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('jour');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [isCustomDateRange, setIsCustomDateRange] = useState(false);

  // States pour les modals
  const [selectedVehicule, setSelectedVehicule] = useState<AlerteVehicule | null>(null);
  const [selectedPersonne, setSelectedPersonne] = useState<AlertePersonne | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  
  // Modals pour éléments individuels
  const [selectedZone, setSelectedZone] = useState<AlerteZone | null>(null);
  const [selectedCommunication, setSelectedCommunication] = useState<AlerteCommunication | null>(null);

  const commissariatInfo = {
    nom: 'Commissariat Central de Cocody',
    code: 'CC-001',
    adresse: 'Boulevard Latrille, Cocody, Abidjan',
    telephone: '+225 27 22 44 55 66',
    commandant: 'Commissaire KOUASSI Jean-Baptiste',
    agentsTotal: 23,
    zones: ['Cocody Centre', '2 Plateaux', 'Riviera', 'Angré']
  };

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
      case 'wrench': return <Wrench className={`${iconClass} text-gray-600`} />;
      default: return <Activity className={`${iconClass} text-gray-600`} />;
    }
  };
  
  const dataByPeriod = {
    jour: {
      stats: {
        controles: 67,
        revenus: 0.485,
        infractions: 10,
        agents: { actifs: 19, total: 23 },
        patrouilles: { actives: 4, total: 5 },
        evolution: '+8',
        performance: 109
      },
      agentsDetails: [
        { nom: 'Brigadier KONE Aya', matricule: 'CC-001-045', controles: 12, perf: 95, zone: '2 Plateaux', time: '2min', status: 'PATROUILLE', color: 'green' },
        { nom: 'Agent TOURE Salif', matricule: 'CC-001-078', controles: 9, perf: 89, zone: 'Riviera', time: '5min', status: 'PATROUILLE', color: 'green' },
        { nom: 'Agent BAMBA Fatou', matricule: 'CC-001-112', controles: 8, perf: 87, zone: 'Cocody Centre', time: '3min', status: 'PATROUILLE', color: 'green' },
        { nom: 'Brigadier YAO Kofi', matricule: 'CC-001-089', controles: 7, perf: 82, zone: 'Angré', time: '15min', status: 'REPOS', color: 'yellow' },
        { nom: 'Agent DIALLO Mariam', matricule: 'CC-001-156', controles: 6, perf: 78, zone: '2 Plateaux', time: '8min', status: 'PATROUILLE', color: 'green' }
      ],
      alertes: {
        vehicules: [
          { 
            nom: 'Toyota Corolla - AB 1234 CI', 
            info: 'Aujourd\'hui 08:30',
            details: {
              immatriculation: 'AB 1234 CI',
              marque: 'Toyota',
              modele: 'Corolla 2020',
              couleur: 'Gris métallisé',
              dateMiseRecherche: '15/10/2024 08:30',
              motif: 'Vol avec violence - Agression conducteur',
              proprietaire: 'M. COULIBALY Ibrahim - 0707123456',
              derniereLoc: '2 Plateaux, près du centre commercial',
              niveau: 'URGENT' as const
            }
          } as AlerteVehicule,
          { 
            nom: 'Mercedes C300 - CD 5678 CI', 
            info: 'Alerte Interpol',
            details: {
              immatriculation: 'CD 5678 CI',
              marque: 'Mercedes-Benz',
              modele: 'C300 2022',
              couleur: 'Noir',
              dateMiseRecherche: '10/10/2024 14:20',
              motif: 'Alerte Interpol - Trafic international',
              proprietaire: 'Recherche internationale en cours',
              derniereLoc: 'Frontière Mali-CI signalée',
              niveau: 'URGENT' as const
            }
          } as AlerteVehicule
        ],
        personnes: [
          { 
            nom: 'KONE Mamadou - 28 ans', 
            info: 'Mandat national',
            details: {
              identite: 'KONE Mamadou',
              age: '28 ans',
              adresse: 'Abobo Pk18, Abidjan (dernière connue)',
              motif: 'Escroquerie en bande organisée - Fraude bancaire',
              dateMandat: '05/10/2024',
              juridiction: 'Tribunal de Première Instance d\'Abidjan',
              contacts: 'Inconnus actuellement',
              signalement: 'Homme 1m75, teint noir, cicatrice joue droite'
            }
          } as AlertePersonne,
          { 
            nom: 'DIALLO Aminata - 35 ans', 
            info: 'Escroquerie',
            details: {
              identite: 'DIALLO Aminata',
              age: '35 ans',
              adresse: 'Yopougon, zone industrielle',
              motif: 'Abus de confiance et faux documents',
              dateMandat: '12/10/2024',
              juridiction: 'Parquet d\'Abidjan',
              contacts: '0708998877 (désactivé)',
              signalement: 'Femme 1m68, teint clair, cheveux longs'
            }
          } as AlertePersonne
        ],
        zones: [
          { 
            nom: '2 Plateaux - Centre Commercial', 
            info: 'Surveillance accrue',
            details: {
              zone: '2 Plateaux - Centre Commercial',
              niveauAlerte: 'ORANGE',
              motif: 'Recrudescence vols à l\'arraché',
              mesures: 'Patrouilles renforcées 08h-20h',
              effectif: '2 agents permanents + 1 patrouille mobile',
              incidents: '5 signalements cette semaine',
              derniereAction: 'Interpellation suspect hier 18h30'
            }
          }
        ],
        communications: [
          { 
            nom: 'Radio Commissariat', 
            info: '19 agents connectés',
            details: {
              reseau: 'Radio Commissariat CC-001',
              frequence: '156.450 MHz',
              agentsConnectes: '19/23',
              qualiteSignal: 'Excellente',
              derniereVerif: 'Il y a 5 minutes',
              couverture: 'Toute zone Cocody',
              backup: 'Système secondaire opérationnel'
            }
          }
        ]
      },
      activities: [
        {
          type: "PAIEMENT_AMENDE",
          title: "Mobile Money Orange",
          location: "2 Plateaux", 
          description: "Amende payée - 25,000 FCFA (Défaut éclairage)",
          time: "3min",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          iconType: "dollar",
          details: {
            agent: "Agent BAMBA Fatou - CC-001-112",
            montant: "25,000 FCFA",
            vehicule: "Peugeot 206 - IJ 8765 CI",
            infractions: ["Défaut éclairage avant", "Feux de position non conformes"],
            statut: "PAYÉ - Mobile Money Orange",
            coordonnees: "5.356889, -3.987456",
            observations: "Conducteur coopératif, paiement immédiat effectué"
          }
        },
        {
          type: "AGENT_CONNECTE", 
          title: "Brigadier KONE Aya",
          location: "2 Plateaux",
          description: "Début patrouille - Zone commerciale",
          time: "5min",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          iconType: "user",
          details: {
            agent: "Brigadier KONE Aya - CC-001-045",
            statut: "EN PATROUILLE",
            coordonnees: "5.367234, -3.989012",
            observations: "Patrouille débutée à 14h45, zone centre commercial 2 Plateaux"
          }
        },
        {
          type: "CONTROLE_VEHICULE",
          title: "Agent TOURE Salif",
          location: "Riviera Golf", 
          description: "Contrôle effectué - Véhicule conforme",
          time: "8min",
          bgColor: "bg-slate-50", 
          borderColor: "border-slate-200",
          iconType: "car",
          details: {
            agent: "Agent TOURE Salif - CC-001-078",
            vehicule: "Toyota Camry - GH 4321 CI",
            statut: "CONFORME",
            coordonnees: "5.378901, -3.965432",
            observations: "Documents en règle, assurance valide jusqu'au 31/12/2024"
          }
        },
        {
          type: "INFRACTION_DETECTEE",
          title: "Excès de vitesse",
          location: "Boulevard Latrille",
          description: "Radar mobile - 85 km/h en zone 50",
          time: "12min",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          iconType: "car",
          details: {
            agent: "Agent DIALLO Mariam - CC-001-156",
            vehicule: "BMW X5 - KL 9876 CI",
            infractions: ["Excès de vitesse: 85 km/h en zone 50"],
            montant: "50,000 FCFA",
            statut: "PV DRESSÉ",
            coordonnees: "5.345678, -4.012345",
            observations: "Conducteur contestataire, PV dressé avec photos radar"
          }
        },
        {
          type: "ASSISTANCE_USAGER",
          title: "Panne véhicule",
          location: "Angré 8ème Tranche",
          description: "Assistance dépannage - Batterie déchargée",
          time: "25min",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          iconType: "wrench",
          details: {
            agent: "Brigadier YAO Kofi - CC-001-089",
            vehicule: "Renault Clio - MN 5544 CI",
            statut: "ASSISTANCE TERMINÉE",
            coordonnees: "5.389012, -3.978654",
            observations: "Batterie déchargée, démarrage effectué, conseil vérification alternateur"
          }
        }
      ]
    },
    semaine: {
      stats: {
        controles: 446,
        revenus: 3.2,
        infractions: 64,
        agents: { actifs: 19, total: 23 },
        patrouilles: { actives: 4, total: 5 },
        evolution: '+30',
        performance: 115
      },
      agentsDetails: [
        { nom: 'Brigadier KONE Aya', matricule: 'CC-001-045', controles: 78, perf: 94, zone: '2 Plateaux', time: '4min', status: 'PATROUILLE', color: 'green' },
        { nom: 'Agent TOURE Salif', matricule: 'CC-001-078', controles: 69, perf: 90, zone: 'Riviera', time: '6min', status: 'PATROUILLE', color: 'green' },
        { nom: 'Agent BAMBA Fatou', matricule: 'CC-001-112', controles: 62, perf: 87, zone: 'Cocody Centre', time: '5min', status: 'PATROUILLE', color: 'green' },
        { nom: 'Brigadier YAO Kofi', matricule: 'CC-001-089', controles: 54, perf: 81, zone: 'Angré', time: '18min', status: 'DISPONIBLE', color: 'yellow' },
        { nom: 'Agent DIALLO Mariam', matricule: 'CC-001-156', controles: 48, perf: 76, zone: '2 Plateaux', time: '12min', status: 'PATROUILLE', color: 'green' }
      ],
      alertes: {
        vehicules: [
          { nom: 'Toyota Corolla - AB 1234 CI', info: 'Lundi 08:30' } as AlerteVehicule,
          { nom: 'Mercedes C300 - CD 5678 CI', info: 'Alerte Interpol active' } as AlerteVehicule,
          { nom: 'Peugeot 308 - EF 9012 CI', info: 'Mercredi 14:20' } as AlerteVehicule
        ],
        personnes: [
          { nom: 'KONE Mamadou - 28 ans', info: 'Mandat actif' } as AlertePersonne,
          { nom: 'DIALLO Aminata - 35 ans', info: 'Recherchée' } as AlertePersonne,
          { nom: 'TRAORE Sekou - 42 ans', info: 'Abus de confiance' } as AlertePersonne
        ],
        zones: [
          { nom: '2 Plateaux - Zone commerciale', info: 'Patrouilles renforcées' } as AlerteZone,
          { nom: 'Riviera Golf', info: 'Surveillance continue' } as AlerteZone
        ],
        communications: [
          { nom: 'Radio Commissariat', info: '19 agents actifs' } as AlerteCommunication,
          { nom: 'Coordination zones', info: '4 patrouilles' } as AlerteCommunication
        ]
      },
      activities: [
        {
          type: "CONTROLE_MAJEUR",
          title: "Opération 2 Plateaux",
          location: "Centre Commercial", 
          description: "23 contrôles - 4 infractions détectées",
          time: "2h",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          iconType: "car"
        },
        {
          type: "PAIEMENTS_MULTIPLES",
          title: "Collecte Hebdomadaire",
          location: commissariatInfo.nom, 
          description: "12 amendes payées - Total: 320,000 FCFA",
          time: "1j",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          iconType: "dollar"
        },
        {
          type: "RAPPORT_HEBDO",
          title: "Synthèse Semaine",
          location: "Bureau Chef", 
          description: "446 contrôles effectués - Performance 115%",
          time: "1j",
          bgColor: "bg-slate-50", 
          borderColor: "border-slate-200",
          iconType: "chart"
        }
      ]
    },
    mois: {
      stats: {
        controles: 1675,
        revenus: 12.8,
        infractions: 245,
        agents: { actifs: 19, total: 23 },
        patrouilles: { actives: 4, total: 5 },
        evolution: '+107',
        performance: 118
      },
      agentsDetails: [
        { nom: 'Brigadier KONE Aya', matricule: 'CC-001-045', controles: 312, perf: 93, zone: '2 Plateaux', time: '3min', status: 'PATROUILLE', color: 'green' },
        { nom: 'Agent TOURE Salif', matricule: 'CC-001-078', controles: 289, perf: 91, zone: 'Riviera', time: '5min', status: 'PATROUILLE', color: 'green' },
        { nom: 'Agent BAMBA Fatou', matricule: 'CC-001-112', controles: 256, perf: 88, zone: 'Cocody Centre', time: '7min', status: 'PATROUILLE', color: 'green' },
        { nom: 'Brigadier YAO Kofi', matricule: 'CC-001-089', controles: 234, perf: 84, zone: 'Angré', time: '15min', status: 'DISPONIBLE', color: 'yellow' },
        { nom: 'Agent DIALLO Mariam', matricule: 'CC-001-156', controles: 198, perf: 79, zone: '2 Plateaux', time: '10min', status: 'PATROUILLE', color: 'green' }
      ],
      alertes: {
        vehicules: [
          { nom: '5 véhicules recherchés', info: 'Ce mois' } as AlerteVehicule,
          { nom: 'Mercedes C300 - CD 5678 CI', info: 'Priorité Interpol' } as AlerteVehicule,
          { nom: 'BMW X5 - GH 3456 CI', info: '15/10 - Vol avec violence' } as AlerteVehicule
        ],
        personnes: [
          { nom: '12 personnes recherchées', info: 'Mandats actifs' } as AlertePersonne,
          { nom: 'KONE Mamadou - 28 ans', info: 'Depuis 03/10' } as AlertePersonne,
          { nom: 'Base zone Cocody', info: 'Mise à jour' } as AlertePersonne
        ],
        zones: [
          { nom: '2 Plateaux', info: 'Patrouilles quotidiennes' } as AlerteZone,
          { nom: 'Riviera - Multiple zones', info: 'Surveillance continue' } as AlerteZone,
          { nom: 'Angré', info: 'Contrôles renforcés' } as AlerteZone
        ],
        communications: [
          { nom: 'Radio opérationnelle', info: '30j/30j' } as AlerteCommunication,
          { nom: 'Coordination commissariat', info: '100%' } as AlerteCommunication
        ]
      },
      activities: [
        {
          type: "BILAN_MENSUEL",
          title: "Rapport Octobre",
          location: commissariatInfo.nom, 
          description: "1,675 contrôles - 245 infractions - 12.8M FCFA",
          time: "1j",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200",
          iconType: "file"
        },
        {
          type: "REVENUS_MOIS",
          title: "Collecte Mensuelle",
          location: "Service Financier", 
          description: "Revenus octobre: 12.8M FCFA collectés",
          time: "1j",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          iconType: "dollar"
        },
        {
          type: "FORMATION",
          title: "Session Formation",
          location: commissariatInfo.nom, 
          description: "8 agents formés - Nouvelles procédures",
          time: "2j",
          bgColor: "bg-blue-50", 
          borderColor: "border-blue-200",
          iconType: "users"
        }
      ]
    },
    annee: {
      stats: {
        controles: 15851,
        revenus: 118.5,
        infractions: 2147,
        agents: { actifs: 19, total: 23 },
        patrouilles: { actives: 4, total: 5 },
        evolution: '+1300',
        performance: 125
      },
      agentsDetails: [
        { nom: 'Brigadier KONE Aya', matricule: 'CC-001-045', controles: 3156, perf: 93, zone: '2 Plateaux', time: '2min', status: 'PATROUILLE', color: 'green' },
        { nom: 'Agent TOURE Salif', matricule: 'CC-001-078', controles: 2912, perf: 91, zone: 'Riviera', time: '4min', status: 'PATROUILLE', color: 'green' },
        { nom: 'Agent BAMBA Fatou', matricule: 'CC-001-112', controles: 2567, perf: 89, zone: 'Cocody Centre', time: '6min', status: 'PATROUILLE', color: 'green' },
        { nom: 'Brigadier YAO Kofi', matricule: 'CC-001-089', controles: 2234, perf: 86, zone: 'Angré', time: '12min', status: 'DISPONIBLE', color: 'yellow' },
        { nom: 'Agent DIALLO Mariam', matricule: 'CC-001-156', controles: 1998, perf: 82, zone: '2 Plateaux', time: '9min', status: 'PATROUILLE', color: 'green' }
      ],
      alertes: {
        vehicules: [
          { nom: '67 véhicules traités', info: 'Cette année' } as AlerteVehicule,
          { nom: '12 retrouvés', info: 'Taux: 17.9%' } as AlerteVehicule,
          { nom: 'Base de données', info: 'Mise à jour active' } as AlerteVehicule
        ],
        personnes: [
          { nom: '156 dossiers traités', info: 'Année 2024' } as AlertePersonne,
          { nom: '42 interpellations', info: 'Taux: 26.9%' } as AlertePersonne,
          { nom: 'Coordination nationale', info: 'Active' } as AlertePersonne
        ],
        zones: [
          { nom: 'Couverture zone Cocody', info: '4 secteurs' } as AlerteZone,
          { nom: 'Zones à risque', info: '3 identifiées' } as AlerteZone,
          { nom: 'Patrouilles optimisées', info: '98% couverture' } as AlerteZone
        ],
        communications: [
          { nom: 'Radio commissariat', info: '365j/365j' } as AlerteCommunication,
          { nom: 'Coordination', info: '100% disponibilité' } as AlerteCommunication
        ]
      },
      activities: [
        {
          type: "BILAN_ANNUEL",
          title: "Rapport Annuel 2024",
          location: commissariatInfo.nom, 
          description: "15,851 contrôles - Performance record 125%",
          time: "3j",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          iconType: "award"
        },
        {
          type: "REVENUS_ANNUELS",
          title: "Bilan Financier",
          location: "Service Comptable", 
          description: "Revenus annuels: 118.5M FCFA",
          time: "3j",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          iconType: "dollar"
        },
        {
          type: "MODERNISATION",
          title: "Équipements Nouveaux",
          location: commissariatInfo.nom, 
          description: "Nouveau système déployé - 23 agents formés",
          time: "5j",
          bgColor: "bg-indigo-50", 
          borderColor: "border-indigo-200",
          iconType: "cpu"
        }
      ]
    },
    tout: {
      stats: {
        controles: 70625,
        revenus: 512.3,
        infractions: 10405,
        agents: { actifs: 19, total: 23 },
        patrouilles: { actives: 4, total: 5 },
        evolution: '+5680',
        performance: 132
      },
      agentsDetails: [
        { nom: 'Brigadier KONE Aya', matricule: 'CC-001-045', controles: 14567, perf: 92, zone: '2 Plateaux', time: '1min', status: 'PATROUILLE', color: 'green' },
        { nom: 'Agent TOURE Salif', matricule: 'CC-001-078', controles: 13234, perf: 90, zone: 'Riviera', time: '3min', status: 'PATROUILLE', color: 'green' },
        { nom: 'Agent BAMBA Fatou', matricule: 'CC-001-112', controles: 11456, perf: 88, zone: 'Cocody Centre', time: '5min', status: 'PATROUILLE', color: 'green' },
        { nom: 'Brigadier YAO Kofi', matricule: 'CC-001-089', controles: 9845, perf: 85, zone: 'Angré', time: '8min', status: 'DISPONIBLE', color: 'yellow' },
        { nom: 'Agent DIALLO Mariam', matricule: 'CC-001-156', controles: 8567, perf: 81, zone: '2 Plateaux', time: '7min', status: 'PATROUILLE', color: 'green' }
      ],
      alertes: {
        vehicules: [
          { nom: 'Base historique complète', info: 'Archives' } as AlerteVehicule,
          { nom: '345 véhicules traités', info: 'Total' } as AlerteVehicule,
          { nom: 'Taux résolution', info: '19.2%' } as AlerteVehicule
        ],
        personnes: [
          { nom: '876 dossiers', info: 'Archives complètes' } as AlertePersonne,
          { nom: '223 interpellations', info: 'Taux: 25.5%' } as AlertePersonne,
          { nom: 'Base commissariat', info: 'Opérationnelle' } as AlertePersonne
        ],
        zones: [
          { nom: 'Historique complet', info: '4 zones Cocody' } as AlerteZone,
          { nom: 'Données 5+ ans', info: 'Archives' } as AlerteZone,
          { nom: 'Performance', info: '+32% amélioration' } as AlerteZone
        ],
        communications: [
          { nom: 'Infrastructure établie', info: 'Depuis création' } as AlerteCommunication,
          { nom: 'Excellence', info: 'Coordination optimale' } as AlerteCommunication
        ]
      },
      activities: [
        {
          type: "ARCHIVES_HISTORIQUES",
          title: "Base Commissariat",
          location: "Centre Données", 
          description: "70,625 contrôles depuis création commissariat",
          time: "7j",
          bgColor: "bg-slate-50",
          borderColor: "border-slate-200",
          iconType: "database"
        },
        {
          type: "REVENUS_TOTAL",
          title: "Historique Financier",
          location: "Service Comptable", 
          description: "Revenus cumulés: 512.3M FCFA",
          time: "7j",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          iconType: "dollar"
        },
        {
          type: "EXCELLENCE",
          title: "Performance Globale",
          location: commissariatInfo.nom, 
          description: "132% - Record historique du commissariat",
          time: "10j",
          bgColor: "bg-purple-50", 
          borderColor: "border-purple-200",
          iconType: "target"
        }
      ]
    },
    personnalise: {
      stats: {
        controles: 316,
        revenus: 2.3,
        infractions: 44,
        agents: { actifs: 19, total: 23 },
        patrouilles: { actives: 4, total: 5 },
        evolution: '+25',
        performance: 112
      },
      agentsDetails: [
        { nom: 'Brigadier KONE Aya', matricule: 'CC-001-045', controles: 58, perf: 94, zone: '2 Plateaux', time: '4min', status: 'PATROUILLE', color: 'green' },
        { nom: 'Agent TOURE Salif', matricule: 'CC-001-078', controles: 52, perf: 91, zone: 'Riviera', time: '7min', status: 'PATROUILLE', color: 'green' },
        { nom: 'Agent BAMBA Fatou', matricule: 'CC-001-112', controles: 46, perf: 87, zone: 'Cocody Centre', time: '6min', status: 'PATROUILLE', color: 'green' },
        { nom: 'Brigadier YAO Kofi', matricule: 'CC-001-089', controles: 38, perf: 82, zone: 'Angré', time: '20min', status: 'DISPONIBLE', color: 'yellow' },
        { nom: 'Agent DIALLO Mariam', matricule: 'CC-001-156', controles: 34, perf: 78, zone: '2 Plateaux', time: '14min', status: 'PATROUILLE', color: 'green' }
      ],
      alertes: {
        vehicules: [
          { nom: 'Période personnalisée', info: 'Données filtrées' } as AlerteVehicule,
          { nom: 'Alertes actives', info: 'Voir détails' } as AlerteVehicule
        ],
        personnes: [
          { nom: 'Période sélectionnée', info: 'Analyse' } as AlertePersonne,
          { nom: 'Mandats zone', info: 'Cocody' } as AlertePersonne
        ],
        zones: [
          { nom: 'Surveillance période', info: 'Selon dates' } as AlerteZone
        ],
        communications: [
          { nom: 'Activité commissariat', info: 'Période ciblée' } as AlerteCommunication
        ]
      },
      activities: [
        {
          type: "ANALYSE_PERSONNALISEE",
          title: "Rapport Période",
          location: commissariatInfo.nom, 
          description: "Analyse période personnalisée",
          time: "Custom",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          iconType: "calendar"
        },
        {
          type: "DONNEES_FILTREES",
          title: "Stats Filtrées",
          location: "Système", 
          description: "316 contrôles - 44 infractions",
          time: "Custom",
          bgColor: "bg-slate-50", 
          borderColor: "border-slate-200",
          iconType: "chart"
        },
        {
          type: "REVENUS_PERIODE",
          title: "Collecte Période",
          location: "Comptabilité", 
          description: "2.3M FCFA sur période",
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

  // Modal pour un véhicule
  const VehiculeModal = () => {
    if (!selectedVehicule) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Détails Véhicule</h2>
                <p className="text-sm text-gray-600">{selectedVehicule.nom}</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedVehicule(null)}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="p-6">
            {selectedVehicule.details ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedVehicule.nom}</h3>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold text-white ${
                    selectedVehicule.details.niveau === 'URGENT' ? 'bg-red-600' : 'bg-orange-500'
                  }`}>
                    {selectedVehicule.details.niveau}
                  </span>
                </div>

                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Immatriculation</div>
                      <div className="text-lg font-bold text-gray-900">{selectedVehicule.details.immatriculation}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Couleur</div>
                      <div className="text-lg font-bold text-gray-900">{selectedVehicule.details.couleur}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Modèle</div>
                    <div className="text-lg font-bold text-gray-900">{selectedVehicule.details.marque} {selectedVehicule.details.modele}</div>
                  </div>

                  <div className="pt-4 border-t border-red-200">
                    <div className="text-sm font-semibold text-red-800 mb-2">Motif de recherche</div>
                    <div className="text-red-700 bg-white rounded-lg p-3">{selectedVehicule.details.motif}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Propriétaire</div>
                    <div className="font-semibold text-gray-900">{selectedVehicule.details.proprietaire}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Dernière localisation connue</div>
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-600" />
                      {selectedVehicule.details.derniereLoc}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Date mise en recherche</div>
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-red-600" />
                      {selectedVehicule.details.dateMiseRecherche}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="primary" className="flex-1">
                    <Phone className="w-4 h-4" />
                    Contacter Patrouilles
                  </Button>
                  <Button variant="outline">
                    <Printer className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Aucun détail disponible pour ce véhicule</p>
                <p className="text-sm mt-1">{selectedVehicule.info}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Modal pour une personne
  const PersonneModal = () => {
    if (!selectedPersonne) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Personne Recherchée</h2>
                <p className="text-sm text-gray-600">{selectedPersonne.nom}</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedPersonne(null)}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="p-6">
            {selectedPersonne.details ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedPersonne.details.identite}</h3>
                  <span className="bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                    RECHERCHÉ
                  </span>
                </div>

                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Âge</div>
                      <div className="text-lg font-bold text-gray-900">{selectedPersonne.details.age}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Date mandat</div>
                      <div className="text-lg font-bold text-gray-900">{selectedPersonne.details.dateMandat}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Adresse dernière connue</div>
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-600" />
                      {selectedPersonne.details.adresse}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-orange-200">
                    <div className="text-sm font-semibold text-orange-800 mb-2">Motif du mandat</div>
                    <div className="text-orange-700 bg-white rounded-lg p-3">{selectedPersonne.details.motif}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Juridiction</div>
                    <div className="font-semibold text-gray-900">{selectedPersonne.details.juridiction}</div>
                  </div>

                  <div className="pt-4 border-t border-orange-200">
                    <div className="text-sm font-semibold text-orange-800 mb-2">Signalement physique</div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="text-orange-700">{selectedPersonne.details.signalement}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Contacts connus</div>
                    <div className="font-semibold text-gray-900">{selectedPersonne.details.contacts}</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="primary" className="flex-1">
                    <Phone className="w-4 h-4" />
                    Alerter Patrouilles
                  </Button>
                  <Button variant="outline">
                    <Printer className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Aucun détail disponible</p>
                <p className="text-sm mt-1">{selectedPersonne.info}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Modal pour une activité
  const ActivityModal = () => {
    if (!selectedActivity) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Détails Activité</h2>
                <p className="text-sm text-gray-600">{selectedActivity.type}</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedActivity(null)}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="p-6">
            <div className={`rounded-xl p-6 border-2 ${selectedActivity.bgColor} ${selectedActivity.borderColor} mb-6`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border-2 border-gray-200">
                    {getActivityIcon(selectedActivity.iconType)}
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl text-gray-900">{selectedActivity.type}</h3>
                    <div className="text-blue-600 font-semibold text-lg mt-1">{selectedActivity.title}</div>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                  selectedActivity.type.includes('PAIEMENT') ? 'bg-green-500 text-white' :
                  selectedActivity.type.includes('INFRACTION') ? 'bg-red-500 text-white' :
                  selectedActivity.type.includes('ASSISTANCE') ? 'bg-yellow-500 text-white' :
                  'bg-blue-500 text-white'
                }`}>
                  {selectedActivity.type.includes('PAIEMENT') ? 'PAYÉ' :
                   selectedActivity.type.includes('INFRACTION') ? 'PV DRESSÉ' :
                   selectedActivity.type.includes('ASSISTANCE') ? 'TERMINÉ' :
                   'EN COURS'}
                </span>
              </div>

              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="font-semibold">{selectedActivity.location}</span>
                </div>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>Il y a {selectedActivity.time}</span>
                </div>
              </div>

              <div className="bg-white bg-opacity-70 rounded-lg p-4">
                <p className="text-gray-800 text-lg">{selectedActivity.description}</p>
              </div>
            </div>

            {selectedActivity.details && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedActivity.details.agent && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <UserCheck className="w-5 h-5 text-blue-600" />
                        <div className="text-sm text-gray-600">Agent responsable</div>
                      </div>
                      <div className="font-bold text-gray-900">{selectedActivity.details.agent}</div>
                    </div>
                  )}
                  {selectedActivity.details.vehicule && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Car className="w-5 h-5 text-orange-600" />
                        <div className="text-sm text-gray-600">Véhicule concerné</div>
                      </div>
                      <div className="font-bold text-gray-900">{selectedActivity.details.vehicule}</div>
                    </div>
                  )}
                  {selectedActivity.details.montant && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <div className="text-sm text-gray-600">Montant</div>
                      </div>
                      <div className="font-bold text-green-600 text-xl">{selectedActivity.details.montant}</div>
                    </div>
                  )}
                  {selectedActivity.details.statut && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                        <div className="text-sm text-gray-600">Statut</div>
                      </div>
                      <div className="font-bold text-gray-900">{selectedActivity.details.statut}</div>
                    </div>
                  )}
                </div>

                {selectedActivity.details.coordonnees && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      <div className="text-sm text-gray-600">Coordonnées GPS</div>
                    </div>
                    <div className="font-mono font-bold text-gray-900">{selectedActivity.details.coordonnees}</div>
                  </div>
                )}

                {selectedActivity.details.infractions && selectedActivity.details.infractions.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="text-sm font-semibold text-red-800 mb-3">Infractions relevées</div>
                    <div className="space-y-2">
                      {selectedActivity.details.infractions.map((infraction, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-white rounded-lg p-3">
                          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-red-700 font-semibold">{infraction}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedActivity.details.observations && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-blue-800 mb-2">Observations</div>
                        <div className="text-blue-700">{selectedActivity.details.observations}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button variant="primary" className="flex-1">
                    <Download className="w-4 h-4" />
                    Télécharger Rapport
                  </Button>
                  <Button variant="outline">
                    <Printer className="w-4 h-4" />
                    Imprimer
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen space-y-6">
      <VehiculeModal />
      <PersonneModal />
      <ActivityModal />

      {/* Header principal */}
      <Card className="border-l-4 border-blue-500">
        <CardBody className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                <Building className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span className="truncate">{commissariatInfo.nom}</span>
                  <span className="flex items-center gap-2 text-xs sm:text-sm bg-blue-100 text-blue-600 px-2 sm:px-3 py-1 rounded-full w-fit">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    LIVE
                  </span>
                </h1>
                <p className="text-blue-600 mt-1 font-medium text-xs sm:text-sm">
                  {commissariatInfo.commandant} • {mounted ? currentTime : '--:--:--'}
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
        <Card className="bg-white border border-gray-200 border-t-4 border-t-orange-500 hover:shadow-lg transition-all duration-300">
          <CardBody className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-xs sm:text-sm font-medium uppercase">CONTRÔLES<br/>PÉRIODE</h3>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{formatNumber(stats.controles)}</div>
            <div className="flex items-center gap-2 text-green-600 text-xs sm:text-sm font-medium mb-3">
              <TrendingUp className="w-4 h-4" />
              {stats.evolution} vs précédent
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-3 h-3 text-blue-600" />
                  <span>Performance: {stats.performance}%</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-green-500 hover:shadow-lg transition-all duration-300">
          <CardBody className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-xs sm:text-sm font-medium uppercase">REVENUS<br/>COLLECTÉS</h3>
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
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3 h-3 text-green-600" />
                  <span>FCFA collectés</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-blue-500 hover:shadow-lg transition-all duration-300">
          <CardBody className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-xs sm:text-sm font-medium uppercase">AGENTS<br/>OPÉRATIONNELS</h3>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{stats.agents.actifs}/{stats.agents.total}</div>
            <div className="flex items-center gap-2 text-green-600 text-xs sm:text-sm font-medium mb-3">
              <Users className="w-4 h-4" />
              {Math.round((stats.agents.actifs / stats.agents.total) * 100)}% disponibles
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-blue-600" />
                  <span>Sur le terrain</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-purple-500 hover:shadow-lg transition-all duration-300">
          <CardBody className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-xs sm:text-sm font-medium uppercase">PATROUILLES<br/>ACTIVES</h3>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{stats.patrouilles.actives}/{stats.patrouilles.total}</div>
            <div className="flex items-center gap-2 text-green-600 text-xs sm:text-sm font-medium mb-3">
              <TrendingUp className="w-4 h-4" />
              Opérationnelles
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-purple-600" />
                  <span>Zones couvertes</span>
                </div>
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
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Alertes Sécuritaires Zone</h3>
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
                  {currentData.alertes.vehicules.slice(0, 2).map((vehicule, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedVehicule(vehicule)}
                      className="flex items-center justify-between gap-2 p-2 hover:bg-red-100 rounded-lg cursor-pointer transition-colors"
                    >
                      <span className="text-red-700 truncate">{vehicule.nom}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-600 whitespace-nowrap">{vehicule.info}</span>
                        <Eye className="w-4 h-4 text-red-600" />
                      </div>
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
                    <div 
                      key={idx}
                      onClick={() => setSelectedPersonne(personne)}
                      className="flex items-center justify-between gap-2 p-2 hover:bg-orange-100 rounded-lg cursor-pointer transition-colors"
                    >
                      <span className="text-orange-700 truncate">{personne.nom}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-orange-600 whitespace-nowrap">{personne.info}</span>
                        <Eye className="w-4 h-4 text-orange-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Cliquez sur un élément pour les détails</span>
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
              <span className="bg-gradient-to-r from-orange-400 to-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold w-fit">
                ACTIVE
              </span>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {activities.slice(0, 3).map((activity, index) => (
                <div 
                  key={index} 
                  onClick={() => setSelectedActivity(activity)}
                  className={`rounded-xl p-3 sm:p-4 border ${activity.bgColor} ${activity.borderColor} cursor-pointer hover:shadow-lg transition-all`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-900 text-xs sm:text-sm truncate">{activity.type}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 flex items-center gap-1 whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </span>
                      <Eye className="w-4 h-4 text-gray-400" />
                    </div>
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
                <span className="text-xs sm:text-sm">Cliquez sur une activité pour voir les détails</span>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
                Journal
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Agents du Commissariat */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Agents du Commissariat</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <select className="bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm">
              <option>Toutes les zones</option>
              <option>2 Plateaux</option>
              <option>Riviera</option>
              <option>Cocody Centre</option>
              <option>Angré</option>
            </select>
            <Button variant="warning" size="md" className="w-full sm:w-auto">
              <MapPin className="w-4 h-4" />
              Vue Carte
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {currentData.agentsDetails.map((agent, idx) => (
            <Card key={idx} className={`border-2 ${agent.color === 'green' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
              <CardBody className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">{agent.nom}</h3>
                    <p className="text-xs text-gray-600">{agent.matricule}</p>
                  </div>
                  <span className={`${agent.color === 'green' ? 'bg-green-500' : 'bg-yellow-500'} text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-2`}>{agent.status}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">{formatNumber(agent.controles)}</div>
                    <div className="text-xs text-gray-600">CONTRÔLES</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">{agent.perf}%</div>
                    <div className="text-xs text-gray-600">PERF.</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 text-xs sm:text-sm">Dernière activité</span>
                    <span className="font-semibold text-xs sm:text-sm">{agent.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{agent.zone}</span>
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