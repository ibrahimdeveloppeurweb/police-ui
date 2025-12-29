'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, Filter, Download, Eye, Printer, Calendar, MapPin, User,
  Car, AlertTriangle, CheckCircle, XCircle, FileText, TrendingUp,
  Clock, DollarSign, Shield, Target, FileDown
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'

type ControlStatus = 'Conforme' | 'Infraction' | 'Avertissement'

type Control = {
  id: string
  date: string
  heure: string
  immatriculation: string
  conducteur: string
  agent: string
  commissariat: string
  lieu: string
  statut: ControlStatus
  pv: string | null
  montant: number | null
}

type Stats = {
  totalControles: number
  conformes: number
  infractions: number
  avertissements: number
  revenusJour: number
  tauxConformite: number
  evolutionControles: string
  evolutionRevenus: string
  evolutionConformite: string
}

type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'

export default function ControlesAdminPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tous les statuts')
  const [dateFilter, setDateFilter] = useState('')
  const [agentFilter, setAgentFilter] = useState('Tous les agents')
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('jour')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)

  // Données selon la période sélectionnée
  const dataByPeriod = {
    jour: {
      controls: [
        {
          id: '#CTR-2025-0247',
          date: '10/10/2025',
          heure: '14:35',
          immatriculation: 'AB-123-CD',
          conducteur: 'KOUASSI Jean-Marc',
          agent: 'KOUAME Jean',
          commissariat: '3ème Arrondissement',
          lieu: 'Carrefour Indénié',
          statut: 'Conforme' as ControlStatus,
          pv: null,
          montant: null
        },
        {
          id: '#CTR-2025-0246',
          date: '10/10/2025',
          heure: '14:20',
          immatriculation: 'EF-789-GH',
          conducteur: 'TRAORE Moussa',
          agent: 'DIALLO Mamadou',
          commissariat: '5ème Arrondissement',
          lieu: 'Boulevard de Marseille',
          statut: 'Infraction' as ControlStatus,
          pv: 'PV-0892',
          montant: 45000
        },
        {
          id: '#CTR-2025-0245',
          date: '10/10/2025',
          heure: '14:05',
          immatriculation: 'IJ-456-KL',
          conducteur: 'BAMBA Issa',
          agent: 'KONE Ibrahim',
          commissariat: '7ème Arrondissement',
          lieu: 'Rue des Jardins',
          statut: 'Avertissement' as ControlStatus,
          pv: 'PV-0891',
          montant: 5000
        },
        {
          id: '#CTR-2025-0244',
          date: '10/10/2025',
          heure: '13:50',
          immatriculation: 'MN-789-PQ',
          conducteur: 'YAO Kofi',
          agent: 'ASSANE Fatou',
          commissariat: '15ème Arrondissement',
          lieu: 'Yopougon Zone 4',
          statut: 'Conforme' as ControlStatus,
          pv: null,
          montant: null
        },
        {
          id: '#CTR-2025-0243',
          date: '10/10/2025',
          heure: '13:30',
          immatriculation: 'RS-234-TU',
          conducteur: 'DIABATE Aminata',
          agent: 'KOUASSI Jean',
          commissariat: '3ème Arrondissement',
          lieu: 'Adjamé Marché',
          statut: 'Infraction' as ControlStatus,
          pv: 'PV-0890',
          montant: 35000
        },
        {
          id: '#CTR-2025-0242',
          date: '10/10/2025',
          heure: '13:15',
          immatriculation: 'VW-567-XY',
          conducteur: 'KONE Aya',
          agent: 'DIALLO Mamadou',
          commissariat: '5ème Arrondissement',
          lieu: 'Avenue Centrale',
          statut: 'Avertissement' as ControlStatus,
          pv: 'PV-0889',
          montant: 10000
        },
        {
          id: '#CTR-2025-0241',
          date: '10/10/2025',
          heure: '12:55',
          immatriculation: 'ZA-890-BC',
          conducteur: 'OUATTARA Sekou',
          agent: 'KONE Ibrahim',
          commissariat: '7ème Arrondissement',
          lieu: 'Treichville Port',
          statut: 'Conforme' as ControlStatus,
          pv: null,
          montant: null
        },
        {
          id: '#CTR-2025-0240',
          date: '10/10/2025',
          heure: '12:40',
          immatriculation: 'DE-123-FG',
          conducteur: 'TOURE Ibrahim',
          agent: 'KOUAME Jean',
          commissariat: '3ème Arrondissement',
          lieu: 'Boulevard Principal',
          statut: 'Infraction' as ControlStatus,
          pv: 'PV-0888',
          montant: 50000
        }
      ],
      stats: {
        totalControles: 1247,
        conformes: 1042,
        infractions: 156,
        avertissements: 49,
        revenusJour: 8700000,
        tauxConformite: 83.6,
        evolutionControles: '+12.5%',
        evolutionRevenus: '+8.2%',
        evolutionConformite: '+2.3%'
      }
    },
    semaine: {
      controls: [
        {
          id: '#CTR-2025-0890',
          date: '23/09/2025',
          heure: '09:15',
          immatriculation: 'QR-445-ST',
          conducteur: 'KOUAME Ange',
          agent: 'KOUAME Jean',
          commissariat: '3ème Arrondissement',
          lieu: 'Carrefour Soleil',
          statut: 'Conforme' as ControlStatus,
          pv: null,
          montant: null
        },
        {
          id: '#CTR-2025-0889',
          date: '24/09/2025',
          heure: '11:45',
          immatriculation: 'UV-778-WX',
          conducteur: 'BAMBA Sylvain',
          agent: 'DIALLO Mamadou',
          commissariat: '5ème Arrondissement',
          lieu: 'Avenue de la République',
          statut: 'Infraction' as ControlStatus,
          pv: 'PV-0765',
          montant: 40000
        },
        {
          id: '#CTR-2025-0888',
          date: '25/09/2025',
          heure: '15:20',
          immatriculation: 'YZ-223-AB',
          conducteur: 'TRAORE Fatou',
          agent: 'KONE Ibrahim',
          commissariat: '7ème Arrondissement',
          lieu: 'Rue du Commerce',
          statut: 'Avertissement' as ControlStatus,
          pv: 'PV-0766',
          montant: 8000
        },
        {
          id: '#CTR-2025-0887',
          date: '26/09/2025',
          heure: '10:30',
          immatriculation: 'CD-556-EF',
          conducteur: 'OUEDRAOGO Paul',
          agent: 'ASSANE Fatou',
          commissariat: '15ème Arrondissement',
          lieu: 'Boulevard Principal',
          statut: 'Conforme' as ControlStatus,
          pv: null,
          montant: null
        },
        {
          id: '#CTR-2025-0886',
          date: '27/09/2025',
          heure: '16:50',
          immatriculation: 'GH-889-IJ',
          conducteur: 'KOFFI Marie',
          agent: 'KOUASSI Jean',
          commissariat: '3ème Arrondissement',
          lieu: 'Adjamé Gare',
          statut: 'Infraction' as ControlStatus,
          pv: 'PV-0767',
          montant: 55000
        },
        {
          id: '#CTR-2025-0885',
          date: '28/09/2025',
          heure: '08:40',
          immatriculation: 'KL-112-MN',
          conducteur: 'DIARRA Issouf',
          agent: 'DIALLO Mamadou',
          commissariat: '5ème Arrondissement',
          lieu: 'Zone Industrielle',
          statut: 'Conforme' as ControlStatus,
          pv: null,
          montant: null
        },
        {
          id: '#CTR-2025-0884',
          date: '29/09/2025',
          heure: '13:25',
          immatriculation: 'OP-445-QR',
          conducteur: 'SANGARE Adama',
          agent: 'KONE Ibrahim',
          commissariat: '7ème Arrondissement',
          lieu: 'Port Autonome',
          statut: 'Avertissement' as ControlStatus,
          pv: 'PV-0768',
          montant: 12000
        },
        {
          id: '#CTR-2025-0883',
          date: '29/09/2025',
          heure: '17:10',
          immatriculation: 'ST-778-UV',
          conducteur: 'BASSOLE Jean',
          agent: 'KOUAME Jean',
          commissariat: '3ème Arrondissement',
          lieu: 'Plateau Centre',
          statut: 'Infraction' as ControlStatus,
          pv: 'PV-0769',
          montant: 48000
        }
      ],
      stats: {
        totalControles: 8393,
        conformes: 7012,
        infractions: 1048,
        avertissements: 333,
        revenusJour: 60100000,
        tauxConformite: 83.5,
        evolutionControles: '+8.7%',
        evolutionRevenus: '+11.3%',
        evolutionConformite: '+1.8%'
      }
    },
    mois: {
      controls: [
        {
          id: '#CTR-2025-1234',
          date: '01/09/2025',
          heure: '08:20',
          immatriculation: 'WX-334-YZ',
          conducteur: 'CAMARA Souleymane',
          agent: 'KOUAME Jean',
          commissariat: '3ème Arrondissement',
          lieu: 'Adjamé Centre',
          statut: 'Conforme' as ControlStatus,
          pv: null,
          montant: null
        },
        {
          id: '#CTR-2025-1233',
          date: '05/09/2025',
          heure: '14:35',
          immatriculation: 'AB-667-CD',
          conducteur: 'TOURE Mariam',
          agent: 'DIALLO Mamadou',
          commissariat: '5ème Arrondissement',
          lieu: 'Zone 4C',
          statut: 'Infraction' as ControlStatus,
          pv: 'PV-0456',
          montant: 42000
        },
        {
          id: '#CTR-2025-1232',
          date: '10/09/2025',
          heure: '11:15',
          immatriculation: 'EF-889-GH',
          conducteur: 'KOUADIO Patrick',
          agent: 'KONE Ibrahim',
          commissariat: '7ème Arrondissement',
          lieu: 'Vridi Canal',
          statut: 'Avertissement' as ControlStatus,
          pv: 'PV-0457',
          montant: 7000
        },
        {
          id: '#CTR-2025-1231',
          date: '15/09/2025',
          heure: '16:40',
          immatriculation: 'IJ-223-KL',
          conducteur: 'SORO Lassina',
          agent: 'ASSANE Fatou',
          commissariat: '15ème Arrondissement',
          lieu: 'Yopougon Millionnaire',
          statut: 'Conforme' as ControlStatus,
          pv: null,
          montant: null
        },
        {
          id: '#CTR-2025-1230',
          date: '18/09/2025',
          heure: '09:55',
          immatriculation: 'MN-556-OP',
          conducteur: 'BEUGRE Aya',
          agent: 'KOUASSI Jean',
          commissariat: '3ème Arrondissement',
          lieu: 'Carrefour Life',
          statut: 'Infraction' as ControlStatus,
          pv: 'PV-0458',
          montant: 50000
        },
        {
          id: '#CTR-2025-1229',
          date: '22/09/2025',
          heure: '13:30',
          immatriculation: 'QR-778-ST',
          conducteur: 'DIABATE Moussa',
          agent: 'DIALLO Mamadou',
          commissariat: '5ème Arrondissement',
          lieu: 'Boulevard Latrille',
          statut: 'Conforme' as ControlStatus,
          pv: null,
          montant: null
        },
        {
          id: '#CTR-2025-1228',
          date: '25/09/2025',
          heure: '10:20',
          immatriculation: 'UV-990-WX',
          conducteur: 'KONE Aminata',
          agent: 'KONE Ibrahim',
          commissariat: '7ème Arrondissement',
          lieu: 'Treichville Gare',
          statut: 'Avertissement' as ControlStatus,
          pv: 'PV-0459',
          montant: 15000
        },
        {
          id: '#CTR-2025-1227',
          date: '28/09/2025',
          heure: '15:45',
          immatriculation: 'YZ-112-AB',
          conducteur: 'YAO Stephane',
          agent: 'KOUAME Jean',
          commissariat: '3ème Arrondissement',
          lieu: 'Cocody Angré',
          statut: 'Infraction' as ControlStatus,
          pv: 'PV-0460',
          montant: 38000
        }
      ],
      stats: {
        totalControles: 31674,
        conformes: 26458,
        infractions: 3956,
        avertissements: 1260,
        revenusJour: 228600000,
        tauxConformite: 83.5,
        evolutionControles: '+5.2%',
        evolutionRevenus: '+7.8%',
        evolutionConformite: '+4.2%'
      }
    },
    annee: {
      controls: [
        {
          id: '#CTR-2025-5678',
          date: '15/01/2025',
          heure: '10:30',
          immatriculation: 'CD-445-EF',
          conducteur: 'OUATTARA Bakary',
          agent: 'KOUAME Jean',
          commissariat: '3ème Arrondissement',
          lieu: 'Adjamé Liberté',
          statut: 'Conforme' as ControlStatus,
          pv: null,
          montant: null
        },
        {
          id: '#CTR-2025-5677',
          date: '12/02/2025',
          heure: '14:20',
          immatriculation: 'GH-778-IJ',
          conducteur: 'KOFFI Armand',
          agent: 'DIALLO Mamadou',
          commissariat: '5ème Arrondissement',
          lieu: 'Marcory Résidentiel',
          statut: 'Infraction' as ControlStatus,
          pv: 'PV-0123',
          montant: 60000
        },
        {
          id: '#CTR-2025-5676',
          date: '20/03/2025',
          heure: '09:15',
          immatriculation: 'KL-990-MN',
          conducteur: 'TRAORE Salimata',
          agent: 'KONE Ibrahim',
          commissariat: '7ème Arrondissement',
          lieu: 'Avenue 13',
          statut: 'Avertissement' as ControlStatus,
          pv: 'PV-0124',
          montant: 10000
        },
        {
          id: '#CTR-2025-5675',
          date: '08/04/2025',
          heure: '16:50',
          immatriculation: 'OP-223-QR',
          conducteur: 'BAMBA Rodrigue',
          agent: 'ASSANE Fatou',
          commissariat: '15ème Arrondissement',
          lieu: 'Yopougon Sicogi',
          statut: 'Conforme' as ControlStatus,
          pv: null,
          montant: null
        },
        {
          id: '#CTR-2025-5674',
          date: '25/05/2025',
          heure: '11:40',
          immatriculation: 'ST-556-UV',
          conducteur: 'COULIBALY Seydou',
          agent: 'KOUASSI Jean',
          commissariat: '3ème Arrondissement',
          lieu: 'Plateau Cité',
          statut: 'Infraction' as ControlStatus,
          pv: 'PV-0125',
          montant: 45000
        },
        {
          id: '#CTR-2025-5673',
          date: '17/06/2025',
          heure: '13:25',
          immatriculation: 'WX-889-YZ',
          conducteur: 'DIABATE Mariame',
          agent: 'DIALLO Mamadou',
          commissariat: '5ème Arrondissement',
          lieu: 'Zone Industrielle',
          statut: 'Conforme' as ControlStatus,
          pv: null,
          montant: null
        },
        {
          id: '#CTR-2025-5672',
          date: '30/07/2025',
          heure: '15:10',
          immatriculation: 'AB-112-CD',
          conducteur: 'SORO N\'Golo',
          agent: 'KONE Ibrahim',
          commissariat: '7ème Arrondissement',
          lieu: 'Port Bouet Aéroport',
          statut: 'Avertissement' as ControlStatus,
          pv: 'PV-0126',
          montant: 18000
        },
        {
          id: '#CTR-2025-5671',
          date: '22/09/2025',
          heure: '08:35',
          immatriculation: 'EF-334-GH',
          conducteur: 'YAO Christine',
          agent: 'KOUAME Jean',
          commissariat: '3ème Arrondissement',
          lieu: 'Cocody Riviera',
          statut: 'Infraction' as ControlStatus,
          pv: 'PV-0127',
          montant: 52000
        }
      ],
      stats: {
        totalControles: 303352,
        conformes: 253394,
        infractions: 37900,
        avertissements: 12058,
        revenusJour: 2203000000,
        tauxConformite: 82.5,
        evolutionControles: '+6.8%',
        evolutionRevenus: '+9.2%',
        evolutionConformite: '+8.3%'
      }
    },
    tout: {
      controls: [
        {
          id: '#CTR-2020-0001',
          date: '05/01/2020',
          heure: '09:00',
          immatriculation: 'IJ-667-KL',
          conducteur: 'KOUAME Yves',
          agent: 'KOUAME Jean',
          commissariat: '3ème Arrondissement',
          lieu: 'Adjamé Marché',
          statut: 'Conforme' as ControlStatus,
          pv: null,
          montant: null
        },
        {
          id: '#CTR-2021-0234',
          date: '18/03/2021',
          heure: '11:30',
          immatriculation: 'MN-889-OP',
          conducteur: 'DIALLO Fatoumata',
          agent: 'DIALLO Mamadou',
          commissariat: '5ème Arrondissement',
          lieu: 'Marcory Zone 4',
          statut: 'Infraction' as ControlStatus,
          pv: 'PV-0034',
          montant: 35000
        },
        {
          id: '#CTR-2022-1456',
          date: '22/07/2022',
          heure: '14:45',
          immatriculation: 'QR-223-ST',
          conducteur: 'BAMBA Ibrahim',
          agent: 'KONE Ibrahim',
          commissariat: '7ème Arrondissement',
          lieu: 'Treichville Centre',
          statut: 'Avertissement' as ControlStatus,
          pv: 'PV-0089',
          montant: 5000
        },
        {
          id: '#CTR-2023-2789',
          date: '10/11/2023',
          heure: '10:20',
          immatriculation: 'UV-556-WX',
          conducteur: 'TOURE Awa',
          agent: 'ASSANE Fatou',
          commissariat: '15ème Arrondissement',
          lieu: 'Yopougon Banco',
          statut: 'Conforme' as ControlStatus,
          pv: null,
          montant: null
        },
        {
          id: '#CTR-2024-4567',
          date: '28/05/2024',
          heure: '16:15',
          immatriculation: 'YZ-778-AB',
          conducteur: 'KOFFI Laurent',
          agent: 'KOUASSI Jean',
          commissariat: '3ème Arrondissement',
          lieu: 'Cocody Deux Plateaux',
          statut: 'Infraction' as ControlStatus,
          pv: 'PV-0234',
          montant: 47000
        },
        {
          id: '#CTR-2024-6789',
          date: '15/08/2024',
          heure: '13:50',
          immatriculation: 'CD-990-EF',
          conducteur: 'SANGARE Moussa',
          agent: 'DIALLO Mamadou',
          commissariat: '5ème Arrondissement',
          lieu: 'Boulevard VGE',
          statut: 'Conforme' as ControlStatus,
          pv: null,
          montant: null
        },
        {
          id: '#CTR-2025-0123',
          date: '03/01/2025',
          heure: '09:30',
          immatriculation: 'GH-112-IJ',
          conducteur: 'DIABATE Salif',
          agent: 'KONE Ibrahim',
          commissariat: '7ème Arrondissement',
          lieu: 'Port Autonome',
          statut: 'Avertissement' as ControlStatus,
          pv: 'PV-0678',
          montant: 12000
        },
        {
          id: '#CTR-2025-0247',
          date: '10/10/2025',
          heure: '14:35',
          immatriculation: 'KL-445-MN',
          conducteur: 'OUEDRAOGO Simon',
          agent: 'KOUAME Jean',
          commissariat: '3ème Arrondissement',
          lieu: 'Adjamé Liberté',
          statut: 'Infraction' as ControlStatus,
          pv: 'PV-0892',
          montant: 55000
        }
      ],
      stats: {
        totalControles: 1398840,
        conformes: 1168014,
        infractions: 174699,
        avertissements: 56127,
        revenusJour: 10092000000,
        tauxConformite: 12.5,
        evolutionControles: '+23.5%',
        evolutionRevenus: '+23.7%',
        evolutionConformite: '+15.6%'
      }
    },
    personnalise: {
      controls: [
        {
          id: '#CTR-2025-0312',
          date: '10/10/2025',
          heure: '10:15',
          immatriculation: 'OP-445-QR',
          conducteur: 'KONE Raissa',
          agent: 'KOUAME Jean',
          commissariat: '3ème Arrondissement',
          lieu: 'Adjamé Liberté',
          statut: 'Conforme' as ControlStatus,
          pv: null,
          montant: null
        },
        {
          id: '#CTR-2025-0311',
          date: '11/10/2025',
          heure: '12:35',
          immatriculation: 'ST-778-UV',
          conducteur: 'CAMARA Adama',
          agent: 'DIALLO Mamadou',
          commissariat: '5ème Arrondissement',
          lieu: 'Marcory Biafra',
          statut: 'Infraction' as ControlStatus,
          pv: 'PV-0923',
          montant: 43000
        },
        {
          id: '#CTR-2025-0310',
          date: '12/10/2025',
          heure: '14:50',
          immatriculation: 'WX-223-YZ',
          conducteur: 'BEUGRE Paul',
          agent: 'KONE Ibrahim',
          commissariat: '7ème Arrondissement',
          lieu: 'Koumassi Remblais',
          statut: 'Avertissement' as ControlStatus,
          pv: 'PV-0924',
          montant: 9000
        },
        {
          id: '#CTR-2025-0309',
          date: '13/10/2025',
          heure: '09:40',
          immatriculation: 'AB-556-CD',
          conducteur: 'TRAORE Salimata',
          agent: 'ASSANE Fatou',
          commissariat: '15ème Arrondissement',
          lieu: 'Yopougon Niangon',
          statut: 'Conforme' as ControlStatus,
          pv: null,
          montant: null
        },
        {
          id: '#CTR-2025-0308',
          date: '14/10/2025',
          heure: '15:25',
          immatriculation: 'EF-889-GH',
          conducteur: 'COULIBALY Issa',
          agent: 'KOUASSI Jean',
          commissariat: '3ème Arrondissement',
          lieu: 'Cocody Angré',
          statut: 'Infraction' as ControlStatus,
          pv: 'PV-0925',
          montant: 51000
        },
        {
          id: '#CTR-2025-0307',
          date: '14/10/2025',
          heure: '11:10',
          immatriculation: 'IJ-112-KL',
          conducteur: 'SORO Aminata',
          agent: 'DIALLO Mamadou',
          commissariat: '5ème Arrondissement',
          lieu: 'Boulevard Marseille',
          statut: 'Conforme' as ControlStatus,
          pv: null,
          montant: null
        },
        {
          id: '#CTR-2025-0306',
          date: '14/10/2025',
          heure: '16:45',
          immatriculation: 'MN-334-OP',
          conducteur: 'YAO Konan',
          agent: 'KONE Ibrahim',
          commissariat: '7ème Arrondissement',
          lieu: 'Treichville Biafra',
          statut: 'Avertissement' as ControlStatus,
          pv: 'PV-0926',
          montant: 14000
        },
        {
          id: '#CTR-2025-0305',
          date: '14/10/2025',
          heure: '13:20',
          immatriculation: 'QR-667-ST',
          conducteur: 'DIABATE Marie',
          agent: 'KOUAME Jean',
          commissariat: '3ème Arrondissement',
          lieu: 'Plateau Dokui',
          statut: 'Infraction' as ControlStatus,
          pv: 'PV-0927',
          montant: 46000
        }
      ],
      stats: {
        totalControles: 6036,
        conformes: 5042,
        infractions: 756,
        avertissements: 238,
        revenusJour: 43600000,
        tauxConformite: 83.5,
        evolutionControles: '+9.8%',
        evolutionRevenus: '+10.2%',
        evolutionConformite: '+5.1%'
      }
    }
  }

  const currentData = isCustomDateRange ? dataByPeriod.personnalise : dataByPeriod[globalFilter]

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
    setIsCustomDateRange(false)
    setDateDebut('')
    setDateFin('')
  }

  const handleCustomDateSearch = () => {
    if (dateDebut && dateFin) {
      setIsCustomDateRange(true)
      setGlobalFilter('personnalise')
    }
  }

  const handleControlClick = (controleId: string) => {
    // Nettoie l'ID pour ne garder que le numéro
    const cleanId = controleId.replace('#CTR-', '')
    router.push(`/admin/controles/${cleanId}`)
  }

  const getStatutColor = (statut: ControlStatus) => {
    switch (statut) {
      case 'Conforme':
        return 'bg-green-500 text-white'
      case 'Infraction':
        return 'bg-red-500 text-white'
      case 'Avertissement':
        return 'bg-yellow-500 text-white'
    }
  }

  return (
     <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Contrôles Nationaux</h1>
        <p className="text-slate-600 mt-2">Suivi centralisé de tous les contrôles effectués par les commissariats</p>
      </div>

      {/* Filtre Global de Période */}
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
                       <Button 
                         onClick={() => handleFilterChange('tout')}
                         className={`${globalFilter === 'tout' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                       >
                         Historique
                       </Button>
                     </div>
                   </div>
           
                   {/* NOUVEAUX CHAMPS : Input de recherche + 2 Selects */}
                   <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-4 border-t border-blue-200">
                     {/* Champ Input de recherche */}
                     <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-[200px]">
                       <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                         Rechercher:
                       </label>
                       <input 
                           type="text"
                           placeholder="Rechercher par ID, Immatriculation..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                         className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                       />
                     </div>
           
                     {/* Select 1 : Commissariat */}
                     <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                       <select 
                         value={agentFilter}
                         onChange={(e) => setAgentFilter(e.target.value)}
                         className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                         >
                         <option>Tous les agents</option>
                         <option>KOUAME Jean</option>
                         <option>DIALLO Mamadou</option>
                         <option>KONE Ibrahim</option>
                         <option>ASSANE Fatou</option>
                         <option>KOUASSI Jean</option>
                         </select>
                     </div>
           
                     {/* Select 2 : Type d'opération */}
                     <select 
                         value={statusFilter}
                         onChange={(e) => setStatusFilter(e.target.value)}
                         className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                         >
                         <option>Tous les statuts</option>
                         <option>Conforme</option>
                         <option>Infraction</option>
                         <option>Avertissement</option>
                     </select>
                   
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
                       onClick={handleCustomDateSearch}
                       disabled={!dateDebut || !dateFin}
                       className={`${!dateDebut || !dateFin ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'} flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2 w-full sm:w-auto`}
                     >
                       <Search className="w-4 h-4" />
                       Rechercher
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
          

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="border-t-[3px] border-blue-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Total Contrôles</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(currentData.stats.totalControles)}</div>
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium mb-3">
              <TrendingUp className="w-4 h-4" />
              {currentData.stats.evolutionControles} vs période précédente
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Conformes: {formatNumber(currentData.stats.conformes)} ({((currentData.stats.conformes/currentData.stats.totalControles)*100).toFixed(1)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Infractions: {formatNumber(currentData.stats.infractions)} ({((currentData.stats.infractions/currentData.stats.totalControles)*100).toFixed(1)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Avertissements: {formatNumber(currentData.stats.avertissements)} ({((currentData.stats.avertissements/currentData.stats.totalControles)*100).toFixed(1)}%)</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-t-[3px] border-green-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Revenus Période</h3>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">
              {globalFilter === 'tout' || globalFilter === 'annee' 
                ? `${(currentData.stats.revenusJour/1000000000).toFixed(1)}Mrd`
                : `${(currentData.stats.revenusJour/1000000).toFixed(1)}M`}
            </div>
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium mb-3">
              <TrendingUp className="w-4 h-4" />
              {currentData.stats.evolutionRevenus} FCFA collectés
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-2">
                <DollarSign className="w-3 h-3 text-green-600" />
                <span>Moyenne par infraction: {formatNumber(Math.round(currentData.stats.revenusJour/currentData.stats.infractions))} FCFA</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-3 h-3 text-blue-600" />
                <span>PV émis: {formatNumber(currentData.stats.infractions)}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-t-[3px] border-purple-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Taux de Conformité</h3>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{currentData.stats.tauxConformite}%</div>
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium mb-3">
              <TrendingUp className="w-4 h-4" />
              {currentData.stats.evolutionConformite} vs période précédente
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-purple-600" />
                <span>Objectif national: 85%</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-yellow-600" />
                <span>Principales infractions: Éclairage (34%), Assurance (28%)</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>


      {/* Tableau des contrôles */}
      <Card className="mb-8">
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">ID Contrôle</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date/Heure</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Immatriculation</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Conducteur</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Agent</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Lieu</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">PV</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Montant</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentData.controls.map((controle) => (
                  <tr 
                    key={controle.id} 
                    onClick={() => handleControlClick(controle.id)}
                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-bold text-blue-600 hover:text-blue-800">{controle.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-slate-900">{controle.date}</div>
                        <div className="text-sm text-slate-500">{controle.heure}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900">{controle.immatriculation}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-900">{controle.conducteur}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-slate-900">{controle.agent}</div>
                        <div className="text-sm text-slate-500">{controle.commissariat}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-slate-700">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{controle.lieu}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatutColor(controle.statut)}`}>
                        {controle.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {controle.pv ? (
                        <span className="bg-yellow-500 text-white px-3 py-1 rounded-lg text-xs font-bold">
                          {controle.pv}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {controle.montant ? (
                        <div>
                          <div className="font-bold text-slate-900">{formatNumber(controle.montant)}</div>
                          <div className="text-xs text-slate-500">FCFA</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleControlClick(controle.id)
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

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-200 gap-4">
            <p className="text-sm text-slate-600">
              Affichage de 1 à {currentData.controls.length} sur {formatNumber(currentData.stats.totalControles)} contrôles
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-sm text-slate-600">←</span>
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
                1
              </button>
              <button className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-sm text-slate-600">2</span>
              </button>
              <button className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-sm text-slate-600">3</span>
              </button>
              <span className="px-2 text-slate-400">...</span>
              <button className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-sm text-slate-600">{Math.ceil(currentData.stats.totalControles/currentData.controls.length)}</span>
              </button>
              <button className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-sm text-slate-600">→</span>
              </button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}