'use client'
import { useState } from 'react'
import { 
  Grid, Map, Table, Search, Filter, Download, Plus, Eye, Settings, Edit,
  MapPin, Users, TrendingUp, TrendingDown, AlertTriangle, Phone, Calendar,
  CheckCircle, Printer, FileDown
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'
import PoliceStationForm from '../form/page'

type Commissariat = {
  id: string; nom: string; localisation: string; responsable: string;
  titre: string; telephone: string; statut: string; niveau: string;
  agentsActifs: number; agentsTotal: number; tauxActivite: number;
  performance: number; controles: number; evolutionControles: number;
  revenus: string; evolutionRevenus: number; conformite: number;
  evolutionConformite: number;
};

type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'

const arrondissementsData = [
  {
    "id": "e06b13e7-4db2-45d7-b556-7c41f7b8885f",
    "code": "ARR_SONGON_1",
    "name": "Songon Commune",
    "region_id": "c971329f-1b20-495e-a0f9-94ab2b47cfdb",
    "city_id": "b6d53155-df11-4755-9a8c-2c09832a8349",
    "population": 172884,
    "area_km2": 897,
    "latitude": 5.278,
    "longitude": -4.289,
    "active": true,
    "created_at": "2025-10-08T15:51:02.599584Z",
    "updated_at": "2025-10-08T15:51:02.599584Z"
  },
  {
    "id": "9f205350-385e-4c0a-8b93-133cc36a0606",
    "code": "ARR_BINGERVILLE_1",
    "name": "Bingerville Commune",
    "region_id": "c971329f-1b20-495e-a0f9-94ab2b47cfdb",
    "city_id": "58fe2b71-d0ad-4eec-9887-3ea07c1c925f",
    "population": 273526,
    "area_km2": 199,
    "latitude": 5.3558,
    "longitude": -3.895,
    "active": true,
    "created_at": "2025-10-08T15:51:02.598466Z",
    "updated_at": "2025-10-08T15:51:02.598466Z"
  },
  {
    "id": "b399f877-de86-4afc-8500-27d4087703ba",
    "code": "ARR_ANYAMA_1",
    "name": "Anyama Commune",
    "region_id": "c971329f-1b20-495e-a0f9-94ab2b47cfdb",
    "city_id": "5f4c7fd1-3e3a-4a73-b7cd-e67966423676",
    "population": 378729,
    "area_km2": 242,
    "latitude": 5.4969,
    "longitude": -4.0517,
    "active": true,
    "created_at": "2025-10-08T15:51:02.597425Z",
    "updated_at": "2025-10-08T15:51:02.597425Z"
  }
]

export default function CommissariatsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()
  const [currentView, setCurrentView] = useState('grille')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tous les statuts')
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('jour')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)

  // Données par période
  const dataByPeriod = {
    jour: {
      commissariats: [
        {
          id: 'COM-ABJ-003', nom: '3ème Arrondissement', localisation: 'Adjamé, Abidjan',
          responsable: 'Moussa DIABATE', titre: 'Commissaire Principal', telephone: '+225 21 37 45 67',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 38, agentsTotal: 45, tauxActivite: 84,
          performance: 94.2, controles: 1247, evolutionControles: 8.6, revenus: '8.7M',
          evolutionRevenus: 11.5, conformite: 76.8, evolutionConformite: 3.5
        },
        {
          id: 'COM-ABJ-005', nom: '5ème Arrondissement', localisation: 'Marcory, Abidjan',
          responsable: 'Aminata KONE', titre: 'Commissaire', telephone: '+225 21 26 78 90',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 32, agentsTotal: 38, tauxActivite: 84,
          performance: 89.7, controles: 1087, evolutionControles: 6.5, revenus: '7.2M',
          evolutionRevenus: 4.3, conformite: 78.5, evolutionConformite: 3.3
        },
        {
          id: 'COM-ABJ-010', nom: '10ème Arrondissement', localisation: 'Abobo, Abidjan',
          responsable: 'Ibrahim OUATTARA', titre: 'Commissaire Adjoint', telephone: '+225 21 35 89 12',
          statut: 'CRITIQUE', niveau: 'ROUGE', agentsActifs: 25, agentsTotal: 32, tauxActivite: 78,
          performance: 72.4, controles: 678, evolutionControles: -10.3, revenus: '4.2M',
          evolutionRevenus: -12.5, conformite: 68.9, evolutionConformite: -3.2
        }
      ],
      regions: [
        { name: "Région d'Abidjan", commissariats: 12, agents: 456, performance: 87.4, revenus: "95.4M FCFA" },
        { name: "Région du Centre", commissariats: 8, agents: 287, performance: 82.1, revenus: "62.8M FCFA" },
        { name: "Région de l'Ouest", commissariats: 6, agents: 198, performance: 79.6, revenus: "45.2M FCFA" },
        { name: "Région du Nord", commissariats: 5, agents: 167, performance: 76.8, revenus: "38.9M FCFA" }
      ]
    },
    semaine: {
      commissariats: [
        {
          id: 'COM-ABJ-003', nom: '3ème Arrondissement', localisation: 'Adjamé, Abidjan',
          responsable: 'Moussa DIABATE', titre: 'Commissaire Principal', telephone: '+225 21 37 45 67',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 38, agentsTotal: 45, tauxActivite: 84,
          performance: 92.8, controles: 8393, evolutionControles: 7.2, revenus: '60.1M',
          evolutionRevenus: 9.8, conformite: 78.2, evolutionConformite: 2.8
        },
        {
          id: 'COM-ABJ-005', nom: '5ème Arrondissement', localisation: 'Marcory, Abidjan',
          responsable: 'Aminata KONE', titre: 'Commissaire', telephone: '+225 21 26 78 90',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 32, agentsTotal: 38, tauxActivite: 84,
          performance: 88.3, controles: 7245, evolutionControles: 5.8, revenus: '52.3M',
          evolutionRevenus: 6.4, conformite: 79.8, evolutionConformite: 3.1
        },
        {
          id: 'COM-ABJ-010', nom: '10ème Arrondissement', localisation: 'Abobo, Abidjan',
          responsable: 'Ibrahim OUATTARA', titre: 'Commissaire Adjoint', telephone: '+225 21 35 89 12',
          statut: 'ATTENTION', niveau: 'ORANGE', agentsActifs: 25, agentsTotal: 32, tauxActivite: 78,
          performance: 74.6, controles: 4892, evolutionControles: -8.7, revenus: '31.5M',
          evolutionRevenus: -9.2, conformite: 70.3, evolutionConformite: -2.8
        }
      ],
      regions: [
        { name: "Région d'Abidjan", commissariats: 12, agents: 456, performance: 86.8, revenus: "642.5M FCFA" },
        { name: "Région du Centre", commissariats: 8, agents: 287, performance: 81.4, revenus: "423.7M FCFA" },
        { name: "Région de l'Ouest", commissariats: 6, agents: 198, performance: 78.9, revenus: "298.4M FCFA" },
        { name: "Région du Nord", commissariats: 5, agents: 167, performance: 75.2, revenus: "254.8M FCFA" }
      ]
    },
    mois: {
      commissariats: [
        {
          id: 'COM-ABJ-003', nom: '3ème Arrondissement', localisation: 'Adjamé, Abidjan',
          responsable: 'Moussa DIABATE', titre: 'Commissaire Principal', telephone: '+225 21 37 45 67',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 38, agentsTotal: 45, tauxActivite: 84,
          performance: 91.5, controles: 31674, evolutionControles: 6.8, revenus: '228.6M',
          evolutionRevenus: 8.5, conformite: 79.5, evolutionConformite: 3.2
        },
        {
          id: 'COM-ABJ-005', nom: '5ème Arrondissement', localisation: 'Marcory, Abidjan',
          responsable: 'Aminata KONE', titre: 'Commissaire', telephone: '+225 21 26 78 90',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 32, agentsTotal: 38, tauxActivite: 84,
          performance: 87.1, controles: 28456, evolutionControles: 5.2, revenus: '198.4M',
          evolutionRevenus: 7.1, conformite: 80.2, evolutionConformite: 2.9
        },
        {
          id: 'COM-ABJ-010', nom: '10ème Arrondissement', localisation: 'Abobo, Abidjan',
          responsable: 'Ibrahim OUATTARA', titre: 'Commissaire Adjoint', telephone: '+225 21 35 89 12',
          statut: 'ATTENTION', niveau: 'ORANGE', agentsActifs: 25, agentsTotal: 32, tauxActivite: 78,
          performance: 76.2, controles: 19234, evolutionControles: -7.5, revenus: '124.8M',
          evolutionRevenus: -8.3, conformite: 72.1, evolutionConformite: -2.5
        }
      ],
      regions: [
        { name: "Région d'Abidjan", commissariats: 12, agents: 456, performance: 85.9, revenus: "2.5Mrd FCFA" },
        { name: "Région du Centre", commissariats: 8, agents: 287, performance: 80.8, revenus: "1.7Mrd FCFA" },
        { name: "Région de l'Ouest", commissariats: 6, agents: 198, performance: 78.1, revenus: "1.2Mrd FCFA" },
        { name: "Région du Nord", commissariats: 5, agents: 167, performance: 74.5, revenus: "987M FCFA" }
      ]
    },
    annee: {
      commissariats: [
        {
          id: 'COM-ABJ-003', nom: '3ème Arrondissement', localisation: 'Adjamé, Abidjan',
          responsable: 'Moussa DIABATE', titre: 'Commissaire Principal', telephone: '+225 21 37 45 67',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 38, agentsTotal: 45, tauxActivite: 84,
          performance: 90.2, controles: 303352, evolutionControles: 8.2, revenus: '2.2Mrd',
          evolutionRevenus: 10.3, conformite: 80.8, evolutionConformite: 4.5
        },
        {
          id: 'COM-ABJ-005', nom: '5ème Arrondissement', localisation: 'Marcory, Abidjan',
          responsable: 'Aminata KONE', titre: 'Commissaire', telephone: '+225 21 26 78 90',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 32, agentsTotal: 38, tauxActivite: 84,
          performance: 86.4, controles: 267891, evolutionControles: 6.9, revenus: '1.9Mrd',
          evolutionRevenus: 8.7, conformite: 81.5, evolutionConformite: 3.8
        },
        {
          id: 'COM-ABJ-010', nom: '10ème Arrondissement', localisation: 'Abobo, Abidjan',
          responsable: 'Ibrahim OUATTARA', titre: 'Commissaire Adjoint', telephone: '+225 21 35 89 12',
          statut: 'ATTENTION', niveau: 'ORANGE', agentsActifs: 25, agentsTotal: 32, tauxActivite: 78,
          performance: 77.8, controles: 189456, evolutionControles: -5.8, revenus: '1.3Mrd',
          evolutionRevenus: -6.5, conformite: 74.2, evolutionConformite: -1.8
        }
      ],
      regions: [
        { name: "Région d'Abidjan", commissariats: 12, agents: 456, performance: 84.8, revenus: "28.5Mrd FCFA" },
        { name: "Région du Centre", commissariats: 8, agents: 287, performance: 79.5, revenus: "19.2Mrd FCFA" },
        { name: "Région de l'Ouest", commissariats: 6, agents: 198, performance: 77.2, revenus: "13.8Mrd FCFA" },
        { name: "Région du Nord", commissariats: 5, agents: 167, performance: 73.8, revenus: "11.4Mrd FCFA" }
      ]
    },
    tout: {
      commissariats: [
        {
          id: 'COM-ABJ-003', nom: '3ème Arrondissement', localisation: 'Adjamé, Abidjan',
          responsable: 'Moussa DIABATE', titre: 'Commissaire Principal', telephone: '+225 21 37 45 67',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 38, agentsTotal: 45, tauxActivite: 84,
          performance: 89.5, controles: 1398840, evolutionControles: 12.5, revenus: '10.1Mrd',
          evolutionRevenus: 15.2, conformite: 82.3, evolutionConformite: 6.8
        },
        {
          id: 'COM-ABJ-005', nom: '5ème Arrondissement', localisation: 'Marcory, Abidjan',
          responsable: 'Aminata KONE', titre: 'Commissaire', telephone: '+225 21 26 78 90',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 32, agentsTotal: 38, tauxActivite: 84,
          performance: 85.7, controles: 1156723, evolutionControles: 10.8, revenus: '8.7Mrd',
          evolutionRevenus: 13.4, conformite: 83.1, evolutionConformite: 5.9
        },
        {
          id: 'COM-ABJ-010', nom: '10ème Arrondissement', localisation: 'Abobo, Abidjan',
          responsable: 'Ibrahim OUATTARA', titre: 'Commissaire Adjoint', telephone: '+225 21 35 89 12',
          statut: 'CRITIQUE', niveau: 'ROUGE', agentsActifs: 25, agentsTotal: 32, tauxActivite: 78,
          performance: 76.4, controles: 892341, evolutionControles: -3.2, revenus: '6.1Mrd',
          evolutionRevenus: -2.8, conformite: 75.8, evolutionConformite: -0.5
        }
      ],
      regions: [
        { name: "Région d'Abidjan", commissariats: 12, agents: 456, performance: 83.5, revenus: "124.8Mrd FCFA" },
        { name: "Région du Centre", commissariats: 8, agents: 287, performance: 78.2, revenus: "87.3Mrd FCFA" },
        { name: "Région de l'Ouest", commissariats: 6, agents: 198, performance: 76.1, revenus: "62.4Mrd FCFA" },
        { name: "Région du Nord", commissariats: 5, agents: 167, performance: 72.5, revenus: "48.9Mrd FCFA" }
      ]
    },
    personnalise: {
      commissariats: [
        {
          id: 'COM-ABJ-003', nom: '3ème Arrondissement', localisation: 'Adjamé, Abidjan',
          responsable: 'Moussa DIABATE', titre: 'Commissaire Principal', telephone: '+225 21 37 45 67',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 38, agentsTotal: 45, tauxActivite: 84,
          performance: 93.1, controles: 6036, evolutionControles: 9.8, revenus: '43.6M',
          evolutionRevenus: 10.2, conformite: 77.5, evolutionConformite: 5.1
        },
        {
          id: 'COM-ABJ-005', nom: '5ème Arrondissement', localisation: 'Marcory, Abidjan',
          responsable: 'Aminata KONE', titre: 'Commissaire', telephone: '+225 21 26 78 90',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 32, agentsTotal: 38, tauxActivite: 84,
          performance: 88.9, controles: 5234, evolutionControles: 7.3, revenus: '38.2M',
          evolutionRevenus: 8.5, conformite: 79.1, evolutionConformite: 4.2
        },
        {
          id: 'COM-ABJ-010', nom: '10ème Arrondissement', localisation: 'Abobo, Abidjan',
          responsable: 'Ibrahim OUATTARA', titre: 'Commissaire Adjoint', telephone: '+225 21 35 89 12',
          statut: 'ATTENTION', niveau: 'ORANGE', agentsActifs: 25, agentsTotal: 32, tauxActivite: 78,
          performance: 75.3, controles: 3456, evolutionControles: -6.5, revenus: '22.8M',
          evolutionRevenus: -7.2, conformite: 71.5, evolutionConformite: -1.9
        }
      ],
      regions: [
        { name: "Région d'Abidjan", commissariats: 12, agents: 456, performance: 86.2, revenus: "387.5M FCFA" },
        { name: "Région du Centre", commissariats: 8, agents: 287, performance: 81.1, revenus: "256.8M FCFA" },
        { name: "Région de l'Ouest", commissariats: 6, agents: 198, performance: 78.5, revenus: "189.3M FCFA" },
        { name: "Région du Nord", commissariats: 5, agents: 167, performance: 75.4, revenus: "145.7M FCFA" }
      ]
    }
  }

  const currentData = isCustomDateRange ? dataByPeriod.personnalise : dataByPeriod[globalFilter]

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
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

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    alert('Export des données en cours...\nFormat: CSV/Excel/PDF')
  }

  const handleCommissariatSubmit = (data: any) => {
    console.log('Nouveau commissariat:', data)
  }

  const ViewSelector = () => (
    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
      {['grille', 'carte', 'tableau'].map((view) => (
        <button 
          key={view}
          onClick={() => setCurrentView(view)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            currentView === view ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          {view === 'grille' && <Grid className="w-4 h-4" />}
          {view === 'carte' && <Map className="w-4 h-4" />}
          {view === 'tableau' && <Table className="w-4 h-4" />}
          {view.charAt(0).toUpperCase() + view.slice(1)}
        </button>
      ))}
    </div>
  )

  const CommissariatCard = ({ commissariat }: { commissariat: Commissariat }) => (
    <Card className={`border-t-[3px] ${commissariat.niveau === 'VERT' ? 'border-t-green-500' : commissariat.niveau === 'ORANGE' ? 'border-t-orange-500' : 'border-t-red-500'}`}>
      <CardBody>
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h3 className="font-bold text-xl text-slate-900 mb-1">{commissariat.nom}</h3>
            <p className="text-sm text-slate-500 mb-2">{commissariat.id}</p>
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
              <MapPin className="w-4 h-4" />
              {commissariat.localisation}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
              <Users className="w-4 h-4" />
              {commissariat.titre} {commissariat.responsable}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="w-4 h-4" />
              {commissariat.telephone}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
              commissariat.statut === 'ACTIF' ? 'bg-green-100 text-green-800' : commissariat.statut === 'ATTENTION' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
            }`}>{commissariat.statut}</span>
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
              commissariat.niveau === 'VERT' ? 'bg-green-100 text-green-800' : commissariat.niveau === 'ORANGE' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
            }`}>{commissariat.niveau}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {commissariat.agentsActifs}/{commissariat.agentsTotal}
            </div>
            <div className="text-sm text-slate-500">Agents Actifs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">{commissariat.performance}%</div>
            <div className="text-sm text-slate-500">Performance</div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <p className="text-sm font-medium text-slate-700 mb-4">Statistiques de la période</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { val: formatNumber(commissariat.controles), label: 'Contrôles', evol: commissariat.evolutionControles },
              { val: commissariat.revenus, label: 'FCFA', evol: commissariat.evolutionRevenus },
              { val: commissariat.conformite + '%', label: 'Conformité', evol: commissariat.evolutionConformite }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-bold text-lg text-slate-900">{stat.val}</div>
                <div className="text-xs text-slate-500 mb-1">{stat.label}</div>
                <div className={`flex items-center justify-center gap-1 text-xs font-medium ${
                  stat.evol > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.evol > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(stat.evol)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-slate-100">
          <Button 
            onClick={() => router.push(`/admin/commissariats/${commissariat.id}`)}
            variant="primary" size="sm" className="flex-1">
            <Eye className="w-4 h-4" />
            Superviser
          </Button>
          <Button variant="outline" size="sm"><Settings className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm"><Edit className="w-4 h-4" /></Button>
        </div>

        {commissariat.niveau === 'ROUGE' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Attention requise - Performance en baisse</span>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestion des Commissariats</h1>
          <p className="text-slate-600 mt-1">Administration centralisée de tous les commissariats nationaux</p>
        </div>
        <div className="flex items-center gap-4">
          <ViewSelector />
          <Button variant="warning" size="md" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-5 h-5" />
            Nouveau Commissariat
          </Button>
        </div>
      </div>

      {/* Formulaire Modal */}
      <PoliceStationForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCommissariatSubmit} 
        arrondissements={arrondissementsData}   
      />

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
                          placeholder="Rechercher..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                      />
                  </div>
          
                <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                >
                <option>Tous les statuts</option>
                <option>Actif</option>
                <option>Attention</option>
                <option>Critique</option>
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

      {/* Régions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {currentData.regions.map((region, index) => (
          <Card key={index}>
            <CardBody className="p-6">
              <div className="mb-4">
                <h3 className="font-medium text-slate-700 text-sm mb-2">{region.name}</h3>
                <div className="flex items-baseline gap-4">
                  <span className="text-3xl font-bold text-slate-900">{region.commissariats}</span>
                  <span className="text-2xl font-bold text-blue-600">{region.performance}%</span>
                </div>
                <p className="text-sm text-slate-500 mt-1">{region.agents} agents</p>
                <p className="text-xs text-slate-400 mt-2">Performance</p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-600 mb-1">Revenus</p>
                <p className="text-lg font-bold text-green-600">{region.revenus}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

    

      {/* Contenu */}
      {(currentView === 'grille' || currentView === 'carte') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {currentData.commissariats.map((commissariat) => (
            <CommissariatCard key={commissariat.id} commissariat={commissariat} />
          ))}
        </div>
      )}

      {currentView === 'tableau' && (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Commissariat', 'Statut', 'Responsable', 'Effectifs', 'Contrôles', 'Revenus', 'Performance', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-slate-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentData.commissariats.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{c.nom}</div>
                        <div className="text-sm text-slate-500">{c.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                          c.statut === 'ACTIF' ? 'bg-green-100 text-green-800' : c.statut === 'ATTENTION' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                        }`}>{c.statut}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{c.responsable}</div>
                        <div className="text-sm text-slate-600">{c.titre}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{c.agentsActifs}/{c.agentsTotal}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{formatNumber(c.controles)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{c.revenus} FCFA</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{c.performance}%</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          <Button 
                            onClick={() => router.push(`/admin/commissariats/${c.id}`)}
                            variant="primary" size="sm" className="p-2">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="p-2">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}