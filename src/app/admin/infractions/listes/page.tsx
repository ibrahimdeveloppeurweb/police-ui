'use client'

import React, { useState } from 'react'
import {
  FileText, Shield, Gauge, Wrench, Truck, Leaf, Plus, Calendar,
  CheckCircle, Search, Printer, FileDown, TrendingUp, TrendingDown
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import InfractionForm from '../form/page'

type InfractionCategory = {
  id: string
  title: string
  count: number
  icon: React.ElementType
  bgColor: string
  iconColor: string
  infractions: string[]
  evolution: number
}

type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'

export default function InfractionsAdminPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('jour')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)

  // Données par période
  const dataByPeriod = {
    jour: {
      categories: [
        {
          id: 'documents',
          title: 'Documents',
          count: 42,
          icon: FileText,
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
          infractions: [
            'Défaut de permis',
            "Défaut d'assurance",
            'Défaut de carte grise'
          ],
          evolution: 8.5
        },
        {
          id: 'securite',
          title: 'Sécurité',
          count: 38,
          icon: Shield,
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600',
          infractions: [
            'Non port de ceinture',
            'Défaut de casque',
            'Téléphone au volant'
          ],
          evolution: 12.3
        },
        {
          id: 'comportement',
          title: 'Comportement',
          count: 35,
          icon: Gauge,
          bgColor: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
          infractions: [
            'Excès de vitesse',
            'Conduite dangereuse',
            'Non-respect feu rouge'
          ],
          evolution: -5.2
        },
        {
          id: 'etat-technique',
          title: 'État technique',
          count: 22,
          icon: Wrench,
          bgColor: 'bg-purple-50',
          iconColor: 'text-purple-600',
          infractions: [
            'Défaut de visite technique',
            'Pneus usés',
            'Éclairage défectueux'
          ],
          evolution: 3.8
        },
        {
          id: 'chargement',
          title: 'Chargement',
          count: 12,
          icon: Truck,
          bgColor: 'bg-orange-50',
          iconColor: 'text-orange-600',
          infractions: [
            'Surcharge',
            'Chargement mal arrimé',
            'Dimensions excessives'
          ],
          evolution: -2.1
        },
        {
          id: 'environnement',
          title: 'Environnement',
          count: 7,
          icon: Leaf,
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600',
          infractions: [
            'Pollution excessive',
            'Bruit excessif',
            "Fuite d'huile"
          ],
          evolution: 1.5
        }
      ],
      stats: {
        totalTypes: 156,
        totalInfractions: 1247,
        revenus: '8.7M',
        evolution: 6.8
      },
      topInfractions: [
        { name: "Défaut d'assurance", count: 342, percentage: 27.4, category: 'Documents' },
        { name: 'Excès de vitesse', count: 289, percentage: 23.2, category: 'Comportement' },
        { name: 'Non port de ceinture', count: 198, percentage: 15.9, category: 'Sécurité' },
        { name: 'Défaut de permis', count: 156, percentage: 12.5, category: 'Documents' },
        { name: 'Téléphone au volant', count: 134, percentage: 10.7, category: 'Sécurité' }
      ]
    },
    semaine: {
      categories: [
        {
          id: 'documents',
          title: 'Documents',
          count: 287,
          icon: FileText,
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
          infractions: [
            'Défaut de permis',
            "Défaut d'assurance",
            'Défaut de carte grise'
          ],
          evolution: 9.2
        },
        {
          id: 'securite',
          title: 'Sécurité',
          count: 245,
          icon: Shield,
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600',
          infractions: [
            'Non port de ceinture',
            'Défaut de casque',
            'Téléphone au volant'
          ],
          evolution: 11.5
        },
        {
          id: 'comportement',
          title: 'Comportement',
          count: 198,
          icon: Gauge,
          bgColor: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
          infractions: [
            'Excès de vitesse',
            'Conduite dangereuse',
            'Non-respect feu rouge'
          ],
          evolution: -3.8
        },
        {
          id: 'etat-technique',
          title: 'État technique',
          count: 156,
          icon: Wrench,
          bgColor: 'bg-purple-50',
          iconColor: 'text-purple-600',
          infractions: [
            'Défaut de visite technique',
            'Pneus usés',
            'Éclairage défectueux'
          ],
          evolution: 4.5
        },
        {
          id: 'chargement',
          title: 'Chargement',
          count: 89,
          icon: Truck,
          bgColor: 'bg-orange-50',
          iconColor: 'text-orange-600',
          infractions: [
            'Surcharge',
            'Chargement mal arrimé',
            'Dimensions excessives'
          ],
          evolution: -1.2
        },
        {
          id: 'environnement',
          title: 'Environnement',
          count: 48,
          icon: Leaf,
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600',
          infractions: [
            'Pollution excessive',
            'Bruit excessif',
            "Fuite d'huile"
          ],
          evolution: 2.8
        }
      ],
      stats: {
        totalTypes: 156,
        totalInfractions: 8393,
        revenus: '60.1M',
        evolution: 7.5
      },
      topInfractions: [
        { name: "Défaut d'assurance", count: 2387, percentage: 28.4, category: 'Documents' },
        { name: 'Excès de vitesse', count: 1945, percentage: 23.2, category: 'Comportement' },
        { name: 'Non port de ceinture', count: 1342, percentage: 16.0, category: 'Sécurité' },
        { name: 'Défaut de permis', count: 1089, percentage: 13.0, category: 'Documents' },
        { name: 'Téléphone au volant', count: 892, percentage: 10.6, category: 'Sécurité' }
      ]
    },
    mois: {
      categories: [
        {
          id: 'documents',
          title: 'Documents',
          count: 1234,
          icon: FileText,
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
          infractions: [
            'Défaut de permis',
            "Défaut d'assurance",
            'Défaut de carte grise'
          ],
          evolution: 10.8
        },
        {
          id: 'securite',
          title: 'Sécurité',
          count: 1087,
          icon: Shield,
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600',
          infractions: [
            'Non port de ceinture',
            'Défaut de casque',
            'Téléphone au volant'
          ],
          evolution: 12.7
        },
        {
          id: 'comportement',
          title: 'Comportement',
          count: 892,
          icon: Gauge,
          bgColor: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
          infractions: [
            'Excès de vitesse',
            'Conduite dangereuse',
            'Non-respect feu rouge'
          ],
          evolution: -2.5
        },
        {
          id: 'etat-technique',
          title: 'État technique',
          count: 678,
          icon: Wrench,
          bgColor: 'bg-purple-50',
          iconColor: 'text-purple-600',
          infractions: [
            'Défaut de visite technique',
            'Pneus usés',
            'Éclairage défectueux'
          ],
          evolution: 5.3
        },
        {
          id: 'chargement',
          title: 'Chargement',
          count: 387,
          icon: Truck,
          bgColor: 'bg-orange-50',
          iconColor: 'text-orange-600',
          infractions: [
            'Surcharge',
            'Chargement mal arrimé',
            'Dimensions excessives'
          ],
          evolution: 0.8
        },
        {
          id: 'environnement',
          title: 'Environnement',
          count: 198,
          icon: Leaf,
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600',
          infractions: [
            'Pollution excessive',
            'Bruit excessif',
            "Fuite d'huile"
          ],
          evolution: 3.2
        }
      ],
      stats: {
        totalTypes: 156,
        totalInfractions: 31674,
        revenus: '228.6M',
        evolution: 8.2
      },
      topInfractions: [
        { name: "Défaut d'assurance", count: 8945, percentage: 28.2, category: 'Documents' },
        { name: 'Excès de vitesse', count: 7356, percentage: 23.2, category: 'Comportement' },
        { name: 'Non port de ceinture', count: 5067, percentage: 16.0, category: 'Sécurité' },
        { name: 'Défaut de permis', count: 4117, percentage: 13.0, category: 'Documents' },
        { name: 'Téléphone au volant', count: 3378, percentage: 10.7, category: 'Sécurité' }
      ]
    },
    annee: {
      categories: [
        {
          id: 'documents',
          title: 'Documents',
          count: 14567,
          icon: FileText,
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
          infractions: [
            'Défaut de permis',
            "Défaut d'assurance",
            'Défaut de carte grise'
          ],
          evolution: 15.2
        },
        {
          id: 'securite',
          title: 'Sécurité',
          count: 12845,
          icon: Shield,
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600',
          infractions: [
            'Non port de ceinture',
            'Défaut de casque',
            'Téléphone au volant'
          ],
          evolution: 18.5
        },
        {
          id: 'comportement',
          title: 'Comportement',
          count: 10234,
          icon: Gauge,
          bgColor: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
          infractions: [
            'Excès de vitesse',
            'Conduite dangereuse',
            'Non-respect feu rouge'
          ],
          evolution: 8.7
        },
        {
          id: 'etat-technique',
          title: 'État technique',
          count: 7823,
          icon: Wrench,
          bgColor: 'bg-purple-50',
          iconColor: 'text-purple-600',
          infractions: [
            'Défaut de visite technique',
            'Pneus usés',
            'Éclairage défectueux'
          ],
          evolution: 12.3
        },
        {
          id: 'chargement',
          title: 'Chargement',
          count: 4567,
          icon: Truck,
          bgColor: 'bg-orange-50',
          iconColor: 'text-orange-600',
          infractions: [
            'Surcharge',
            'Chargement mal arrimé',
            'Dimensions excessives'
          ],
          evolution: 6.5
        },
        {
          id: 'environnement',
          title: 'Environnement',
          count: 2316,
          icon: Leaf,
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600',
          infractions: [
            'Pollution excessive',
            'Bruit excessif',
            "Fuite d'huile"
          ],
          evolution: 9.8
        }
      ],
      stats: {
        totalTypes: 156,
        totalInfractions: 303352,
        revenus: '2.2Mrd',
        evolution: 12.5
      },
      topInfractions: [
        { name: "Défaut d'assurance", count: 85546, percentage: 78.2, category: 'Documents' },
        { name: 'Excès de vitesse', count: 70378, percentage: 13.2, category: 'Comportement' },
        { name: 'Non port de ceinture', count: 48536, percentage: 46.0, category: 'Sécurité' },
        { name: 'Défaut de permis', count: 39436, percentage: 13.0, category: 'Documents' },
        { name: 'Téléphone au volant', count: 32459, percentage: 10.7, category: 'Sécurité' }
      ]
    },
    tout: {
      categories: [
        {
          id: 'documents',
          title: 'Documents',
          count: 72456,
          icon: FileText,
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
          infractions: [
            'Défaut de permis',
            "Défaut d'assurance",
            'Défaut de carte grise'
          ],
          evolution: 22.5
        },
        {
          id: 'securite',
          title: 'Sécurité',
          count: 64287,
          icon: Shield,
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600',
          infractions: [
            'Non port de ceinture',
            'Défaut de casque',
            'Téléphone au volant'
          ],
          evolution: 28.3
        },
        {
          id: 'comportement',
          title: 'Comportement',
          count: 51234,
          icon: Gauge,
          bgColor: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
          infractions: [
            'Excès de vitesse',
            'Conduite dangereuse',
            'Non-respect feu rouge'
          ],
          evolution: 18.7
        },
        {
          id: 'etat-technique',
          title: 'État technique',
          count: 38956,
          icon: Wrench,
          bgColor: 'bg-purple-50',
          iconColor: 'text-purple-600',
          infractions: [
            'Défaut de visite technique',
            'Pneus usés',
            'Éclairage défectueux'
          ],
          evolution: 15.8
        },
        {
          id: 'chargement',
          title: 'Chargement',
          count: 22789,
          icon: Truck,
          bgColor: 'bg-orange-50',
          iconColor: 'text-orange-600',
          infractions: [
            'Surcharge',
            'Chargement mal arrimé',
            'Dimensions excessives'
          ],
          evolution: 12.3
        },
        {
          id: 'environnement',
          title: 'Environnement',
          count: 11567,
          icon: Leaf,
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600',
          infractions: [
            'Pollution excessive',
            'Bruit excessif',
            "Fuite d'huile"
          ],
          evolution: 19.5
        }
      ],
      stats: {
        totalTypes: 156,
        totalInfractions: 1398840,
        revenus: '10.1Mrd',
        evolution: 20.8
      },
      topInfractions: [
        { name: "Défaut d'assurance", count: 394572, percentage: 28.2, category: 'Documents' },
        { name: 'Excès de vitesse', count: 324612, percentage: 23.2, category: 'Comportement' },
        { name: 'Non port de ceinture', count: 223814, percentage: 16.0, category: 'Sécurité' },
        { name: 'Défaut de permis', count: 181849, percentage: 13.0, category: 'Documents' },
        { name: 'Téléphone au volant', count: 149650, percentage: 10.7, category: 'Sécurité' }
      ]
    },
    personnalise: {
      categories: [
        {
          id: 'documents',
          title: 'Documents',
          count: 187,
          icon: FileText,
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
          infractions: [
            'Défaut de permis',
            "Défaut d'assurance",
            'Défaut de carte grise'
          ],
          evolution: 9.5
        },
        {
          id: 'securite',
          title: 'Sécurité',
          count: 156,
          icon: Shield,
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600',
          infractions: [
            'Non port de ceinture',
            'Défaut de casque',
            'Téléphone au volant'
          ],
          evolution: 11.8
        },
        {
          id: 'comportement',
          title: 'Comportement',
          count: 134,
          icon: Gauge,
          bgColor: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
          infractions: [
            'Excès de vitesse',
            'Conduite dangereuse',
            'Non-respect feu rouge'
          ],
          evolution: -3.2
        },
        {
          id: 'etat-technique',
          title: 'État technique',
          count: 98,
          icon: Wrench,
          bgColor: 'bg-purple-50',
          iconColor: 'text-purple-600',
          infractions: [
            'Défaut de visite technique',
            'Pneus usés',
            'Éclairage défectueux'
          ],
          evolution: 4.7
        },
        {
          id: 'chargement',
          title: 'Chargement',
          count: 56,
          icon: Truck,
          bgColor: 'bg-orange-50',
          iconColor: 'text-orange-600',
          infractions: [
            'Surcharge',
            'Chargement mal arrimé',
            'Dimensions excessives'
          ],
          evolution: 1.2
        },
        {
          id: 'environnement',
          title: 'Environnement',
          count: 32,
          icon: Leaf,
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600',
          infractions: [
            'Pollution excessive',
            'Bruit excessif',
            "Fuite d'huile"
          ],
          evolution: 2.8
        }
      ],
      stats: {
        totalTypes: 156,
        totalInfractions: 6036,
        revenus: '43.6M',
        evolution: 7.8
      },
      topInfractions: [
        { name: "Défaut d'assurance", count: 1702, percentage: 28.2, category: 'Documents' },
        { name: 'Excès de vitesse', count: 1400, percentage: 23.2, category: 'Comportement' },
        { name: 'Non port de ceinture', count: 966, percentage: 16.0, category: 'Sécurité' },
        { name: 'Défaut de permis', count: 785, percentage: 13.0, category: 'Documents' },
        { name: 'Téléphone au volant', count: 646, percentage: 10.7, category: 'Sécurité' }
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

  const handleInfractionSubmit = (data: any) => {
    console.log('Nouvelle infraction:', data)
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Infractions</h1>
          <p className="text-slate-600 mt-2">Classification des infractions routières</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5" />
          Nouvelle Infraction
        </Button>
      </div>

      {/* Formulaire Modal */}
      <InfractionForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleInfractionSubmit}
      />

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

      {/* Grille des catégories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentData.categories.map((category) => (
          <Card key={category.id} className="hover:border-slate-300 transition-colors cursor-pointer">
            <CardBody className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-16 h-16 ${category.bgColor} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                  <category.icon className={`w-8 h-8 ${category.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{category.title}</h3>
                  <p className="text-slate-600 text-sm">{formatNumber(category.count)} infractions</p>
                  <div className={`flex items-center gap-1 text-xs font-medium mt-1 ${
                    category.evolution > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {category.evolution > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(category.evolution)}%
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold text-slate-700 mb-3">Infractions principales:</p>
                <ul className="space-y-2">
                  {category.infractions.map((infraction, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-slate-400 mt-1">•</span>
                      <span>{infraction}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button variant="outline" size="sm" className="w-full">
                Voir tous les détails
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Statistiques globales */}
      <Card className="mt-8">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Statistiques Globales</h2>
            <div className={`flex items-center gap-1 text-sm font-medium ${
              currentData.stats.evolution > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {currentData.stats.evolution > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {currentData.stats.evolution}% vs période précédente
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-slate-900 mb-2">{currentData.stats.totalTypes}</div>
              <div className="text-slate-600 text-sm">Total types d'infractions</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">{formatNumber(currentData.stats.totalInfractions)}</div>
              <div className="text-slate-600 text-sm">Infractions période</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-green-600 mb-2">{currentData.stats.revenus}</div>
              <div className="text-slate-600 text-sm">FCFA collectés</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Top 5 infractions */}
      <Card className="mt-8">
        <CardBody className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Top 5 Infractions les Plus Fréquentes</h2>
          <div className="space-y-4">
            {currentData.topInfractions.map((infraction, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-slate-600">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-slate-900">{infraction.name}</span>
                      <span className="text-sm text-slate-500 ml-2">({infraction.category})</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">{formatNumber(infraction.count)}</span>
                      <span className="text-sm text-slate-500 ml-2">{infraction.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${infraction.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}