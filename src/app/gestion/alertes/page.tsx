// src/app/gestion/alertes/dashboard/page.tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import { 
  Search, Car, AlertTriangle, Shield, CheckCircle, 
  MapPin, Clock, Target, Calendar, Printer, 
  FileDown, RefreshCw, Eye, Radio,
  Plus, Activity, Loader2, TrendingUp, TrendingDown
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { alertesService } from '@/lib/api/services'
import Cookies from 'js-cookie'
import { useRouter, usePathname } from 'next/navigation'
import { useGestionLayout } from '@/contexts/GestionLayoutContext'
import { useAuth } from '@/hooks/useAuth'
import dynamic from 'next/dynamic'
import * as Chart from 'chart.js'

// Import dynamique du formulaire d'alerte
const AlertForm = dynamic(() => import('@/app/gestion/alertes/form/page'), { ssr: false })

// Enregistrement global de tous les composants Chart.js nécessaires
Chart.Chart.register(
  Chart.CategoryScale,
  Chart.LinearScale,
  Chart.PointElement,
  Chart.LineElement,
  Chart.BarController,
  Chart.BarElement,
  Chart.DoughnutController,
  Chart.ArcElement,
  Chart.Title,
  Chart.Tooltip,
  Chart.Legend,
  Chart.Filler
)

type AlertStatus = 'DÉTECTÉ' | 'RECHERCHÉ' | 'EN COURS' | 'RÉSOLU'
type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout'

type VehicleAlert = {
  id: string
  code: string
  typeAlerte: string
  libelle: string
  typeDiffusion: string
  dateDiffusion: string
  status: AlertStatus
  villeDiffusion: string
  priorite: 'CRITIQUE' | 'HAUTE' | 'NORMALE'
}

const AlertesSecuritePage = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { setTitle, setSubtitle } = useGestionLayout()
  const { user } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('jour')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'alertes' | 'statistiques'>('alertes')
  const [isLoading, setIsLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const chartRef = useRef<HTMLCanvasElement | null>(null)
  const chartInstance = useRef<Chart.Chart | null>(null)

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
    
    setTitle("Tableau de Bord des Alertes")
    if (formattedCommissariat) {
      setSubtitle(`${formattedCommissariat} - Vue d'ensemble des alertes de sécurité`)
    } else {
      setSubtitle("Vue d'ensemble des alertes de sécurité")
    }
  }, [setTitle, setSubtitle, user?.commissariat?.nom, pathname])


  // Utiliser uniquement les données du backend, avec fallback vide
  const currentData = dashboardData || {
    stats: {
      totalAlertes: { total: 0, evolution: '+0' },
      resolues: { total: 0, evolution: '+0' },
      enCours: { total: 0, evolution: '+0' },
      tempsReponse: { moyen: '0 min', evolution: '+0 min' }
    },
    statsTable: [],
    activityData: [],
    alerts: []
  }

  // Récupérer les données du dashboard depuis l'API
  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const commissariatId = Cookies.get('user_commissariat_id') || localStorage.getItem('user_commissariat_id')
      
      // Calculer les dates selon la période
      const getDateRange = (periode: PeriodKey) => {
        const now = new Date()
        let start = new Date()
        let end = new Date()

        switch (periode) {
          case 'jour':
            start.setHours(0, 0, 0, 0)
            end.setHours(23, 59, 59, 999)
            break
          case 'semaine':
            const dayOfWeek = now.getDay()
            const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
            start = new Date(now)
            start.setDate(now.getDate() - diff)
            start.setHours(0, 0, 0, 0)
            end.setHours(23, 59, 59, 999)
            break
          case 'mois':
            start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
            end.setHours(23, 59, 59, 999)
            break
          case 'annee':
            start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
            end.setHours(23, 59, 59, 999)
            break
          default: // 'tout'
            start = new Date(2020, 0, 1, 0, 0, 0, 0)
            end.setHours(23, 59, 59, 999)
        }

        return {
          dateDebut: start.toISOString().split('T')[0] + 'T00:00:00',
          dateFin: end.toISOString().split('T')[0] + 'T23:59:59'
        }
      }

      const dateRange = getDateRange(globalFilter)

      // Si des dates personnalisées sont définies, les utiliser avec les heures précises
      let finalDateDebut = dateRange.dateDebut
      let finalDateFin = dateRange.dateFin
      
      if (dateDebut && dateFin) {
        finalDateDebut = dateDebut + 'T00:00:00'
        finalDateFin = dateFin + 'T23:59:59'
      }

      const response = await alertesService.getDashboard({
        commissariatId: commissariatId || undefined,
        dateDebut: finalDateDebut,
        dateFin: finalDateFin,
        periode: globalFilter
      })

      if (response.success && response.data) {
        setDashboardData(response.data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error)
      // En cas d'erreur, on garde les données statiques
      setDashboardData(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Charger les données au montage et à chaque changement de période
  useEffect(() => {
    fetchDashboardData()
  }, [globalFilter]) // Retirer dateDebut et dateFin pour forcer l'utilisation du bouton Rechercher

  // Statistiques pour les cartes - 4 CARTES
  const alertesStats = dashboardData ? [
    {
      title: "Total Alertes",
      value: dashboardData.stats.totalAlertes.total.toString(),
      change: {
        type: dashboardData.stats.totalAlertes.evolution.startsWith('-') ? 'negative' : 'positive' as const,
        value: dashboardData.stats.totalAlertes.evolution,
        label: ''
      },
      icon: AlertTriangle,
      color: 'blue' as const
    },
    {
      title: "Résolues",
      value: dashboardData.stats.resolues.total.toString(),
      change: {
        type: 'positive' as const,
        value: dashboardData.stats.resolues.evolution,
        label: ''
      },
      icon: CheckCircle,
      color: 'green' as const
    },
    {
      title: "En Cours",
      value: dashboardData.stats.enCours.total.toString(),
      change: {
        type: dashboardData.stats.enCours.evolution.startsWith('-') ? 'positive' : 'neutral' as const,
        value: dashboardData.stats.enCours.evolution,
        label: ''
      },
      icon: Activity,
      color: 'orange' as const
    },
    {
      title: "Temps Réponse Moyen",
      value: dashboardData.stats.tempsReponse.moyen,
      change: {
        type: dashboardData.stats.tempsReponse.evolution.startsWith('-') ? 'positive' : 'neutral' as const,
        value: dashboardData.stats.tempsReponse.evolution,
        label: ''
      },
      icon: Clock,
      color: 'purple' as const
    }
  ] : [
    {
      title: "Total Alertes",
      value: currentData.stats.totalAlertes.total.toString(),
      change: {
        type: 'negative' as const,
        value: currentData.stats.totalAlertes.evolution,
        label: ''
      },
      icon: AlertTriangle,
      color: 'blue' as const
    },
    {
      title: "Résolues",
      value: currentData.stats.resolues.total.toString(),
      change: {
        type: 'positive' as const,
        value: currentData.stats.resolues.evolution,
        label: ''
      },
      icon: CheckCircle,
      color: 'green' as const
    },
    {
      title: "En Cours",
      value: currentData.stats.enCours.total.toString(),
      change: {
        type: 'neutral' as const,
        value: currentData.stats.enCours.evolution,
        label: ''
      },
      icon: Activity,
      color: 'orange' as const
    },
    {
      title: "Temps Réponse Moyen",
      value: currentData.stats.tempsReponse.moyen,
      change: {
        type: 'positive' as const,
        value: currentData.stats.tempsReponse.evolution,
        label: ''
      },
      icon: Clock,
      color: 'purple' as const
    }
  ]

  const getStatColor = (color: string) => {
    const colors = {
      red: 'border-t-red-500',
      orange: 'border-t-orange-500',
      blue: 'border-t-blue-500',
      green: 'border-t-green-500',
      purple: 'border-t-purple-500',
      indigo: 'border-t-indigo-500'
    }
    return colors[color as keyof typeof colors]
  }

  const getIconBg = (color: string) => {
    const colors = {
      red: 'bg-red-100 text-red-600',
      orange: 'bg-orange-100 text-orange-600',
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      indigo: 'bg-indigo-100 text-indigo-600'
    }
    return colors[color as keyof typeof colors]
  }

  const getChangeColor = (type: string) => {
    const colors = {
      positive: 'text-green-600',
      negative: 'text-red-600',
      neutral: 'text-gray-600'
    }
    return colors[type as keyof typeof colors]
  }

  const getStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case 'DÉTECTÉ':
        return <Badge variant="danger">DÉTECTÉ</Badge>
      case 'RECHERCHÉ':
        return <Badge variant="warning">RECHERCHÉ</Badge>
      case 'EN COURS':
        return <Badge variant="warning">EN COURS</Badge>
      case 'RÉSOLU':
        return <Badge variant="success">RÉSOLU</Badge>
    }
  }

  const getPriorityBadge = (priorite: string) => {
    switch (priorite) {
      case 'CRITIQUE':
        return <Badge variant="danger">CRITIQUE</Badge>
      case 'HAUTE':
        return <Badge variant="warning">HAUTE</Badge>
      case 'NORMALE':
        return <Badge variant="secondary">NORMALE</Badge>
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    alert('Export des données en cours...\nFormat: CSV/Excel/PDF')
  }

  const handleSearch = () => {
    if (dateDebut && dateFin) {
      console.log('Recherche avec dates:', dateDebut, dateFin)
      // Recharger les données avec les dates personnalisées
      fetchDashboardData()
    } else {
      // Si pas de dates, utiliser la période sélectionnée
      fetchDashboardData()
    }
  }

  const handleAlerteSubmit = (data: any) => {
    console.log('Nouvelle alerte:', data)
    setIsModalOpen(false)
    // Recharger les données du dashboard
    fetchDashboardData()
  }

  const handleAlerteSuccess = () => {
    setIsModalOpen(false)
    // Recharger les données du dashboard
    fetchDashboardData()
  }

  // Obtenir le libellé de la période actuelle
  const getPeriodeLabel = () => {
    switch (globalFilter) {
      case 'jour':
        return "aujourd'hui"
      case 'semaine':
        return 'cette semaine'
      case 'mois':
        return 'ce mois'
      case 'annee':
        return 'cette année'
      default:
        return 'vs période précédente'
    }
  }

  // Initialisation du graphique en barres
  useEffect(() => {
    if (!chartRef.current) return

    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const activityData = dashboardData?.activityData || currentData.activityData
    const labels = activityData.map((d: any) => d.period)
    const dataAlertes = activityData.map((d: any) => d.alertes)
    const dataEnCours = activityData.map((d: any) => d.enCours)
    const dataResolues = activityData.map((d: any) => d.resolues)

    if (chartRef.current) {
      chartInstance.current = new Chart.Chart(chartRef.current, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Total alertes',
              data: dataAlertes,
              backgroundColor: 'rgba(59, 130, 246, 0.8)',
              borderColor: 'rgb(59, 130, 246)',
              borderWidth: 2,
              borderRadius: 6,
              barPercentage: 0.7,
            },
            {
              label: 'En cours',
              data: dataEnCours,
              backgroundColor: 'rgba(251, 146, 60, 0.8)',
              borderColor: 'rgb(251, 146, 60)',
              borderWidth: 2,
              borderRadius: 6,
              barPercentage: 0.7,
            },
            {
              label: 'Résolues',
              data: dataResolues,
              backgroundColor: 'rgba(16, 185, 129, 0.8)',
              borderColor: 'rgb(16, 185, 129)',
              borderWidth: 2,
              borderRadius: 6,
              barPercentage: 0.7,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                padding: 20,
                font: {
                  size: 13,
                  weight: 600
                },
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              titleFont: {
                size: 14,
                weight: 'bold'
              },
              bodyFont: {
                size: 13
              },
              bodySpacing: 8,
              cornerRadius: 8,
              displayColors: true
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                font: {
                  size: 12
                },
                color: '#6b7280'
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              },
              title: {
                display: true,
                text: 'Nombre',
                font: {
                  size: 13,
                  weight: 600
                },
                color: '#374151'
              }
            },
            x: {
              ticks: {
                font: {
                  size: 12,
                  weight: 600
                },
                color: '#374151'
              },
              grid: {
                display: false
              }
            }
          }
        }
      })
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [globalFilter, dashboardData, currentData.activityData])

  return (
    <>
      <AlertForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAlerteSubmit}
        onSuccess={handleAlerteSuccess}
      />
      
      <div className="space-y-6">
      {/* Filtre de période */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardBody className="p-6">
          <div className="space-y-6">
            {/* En-tête et boutons de période */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Période d'analyse</h2>
                  <p className="text-gray-600 text-sm">Sélectionnez la période pour filtrer toutes les données</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  onClick={() => setGlobalFilter('jour')}
                  className={`${globalFilter === 'jour' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors px-6 py-2.5 font-medium`}
                >
                  Aujourd'hui
                </Button>
                <Button 
                  onClick={() => setGlobalFilter('semaine')}
                  className={`${globalFilter === 'semaine' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors px-6 py-2.5 font-medium`}
                >
                  Semaine
                </Button>
                <Button 
                  onClick={() => setGlobalFilter('mois')}
                  className={`${globalFilter === 'mois' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors px-6 py-2.5 font-medium`}
                >
                  Mois
                </Button>
                <Button 
                  onClick={() => setGlobalFilter('annee')}
                  className={`${globalFilter === 'annee' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors px-6 py-2.5 font-medium`}
                >
                  Année
                </Button>
                <Button 
                  onClick={() => setGlobalFilter('tout')}
                  className={`${globalFilter === 'tout' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors px-6 py-2.5 font-medium`}
                >
                  Tout
                </Button>
              </div>
            </div>

            {/* Filtres personnalisés et actions */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 pt-4 border-t border-blue-200">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Date début:</label>
                  <input 
                    type="date" 
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Date fin:</label>
                  <input 
                    type="date" 
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <Button 
                  onClick={handleSearch}
                  disabled={isLoading}
                  className={`${isLoading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'} flex items-center gap-2 px-6 py-2.5 font-medium`}
                >
                  {isLoading ? (
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
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  onClick={handlePrint}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-6 py-2.5 font-medium"
                >
                  <Printer className="w-4 h-4" />
                  Imprimer
                </Button>
                
                <Button 
                  onClick={handleExport}
                  className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 px-6 py-2.5 font-medium"
                >
                  <FileDown className="w-4 h-4" />
                  Exporter
                </Button>
                
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 px-6 py-2.5 font-medium" 
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus className="w-5 h-5" />
                  Nouvelle alerte
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Grille des statistiques - 4 CARTES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {alertesStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className={`border-t-4 ${getStatColor(stat.color)} hover:shadow-lg transition-all duration-300`}>
              <CardBody>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm font-medium text-gray-600 uppercase">
                    {stat.title}
                  </div>
                  <div className={`p-2 rounded-lg ${getIconBg(stat.color)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                
                <div className={`flex items-center gap-2 text-sm font-medium ${getChangeColor(stat.change.type)}`}>
                  {stat.change.value.startsWith('-') 
                    ? <TrendingDown className="w-4 h-4" />
                    : <TrendingUp className="w-4 h-4" />
                  }
                  {stat.change.value} {getPeriodeLabel()}
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>

      {/* Graphique en barres */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des alertes</CardTitle>
      
        </CardHeader>
        <CardBody>
          <div className="h-80">
            <canvas ref={chartRef}></canvas>
          </div>
        </CardBody>
      </Card>

      {/* Tableau des alertes avec onglets */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('alertes')}
              className={`px-4 py-2 font-semibold text-sm transition-all ${
                activeTab === 'alertes'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Alertes Actives
            </button>
            <button
              onClick={() => setActiveTab('statistiques')}
              className={`px-4 py-2 font-semibold text-sm transition-all ${
                activeTab === 'statistiques'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Statistiques type d'alerte
            </button>
          </div>
       
        </CardHeader>
        <CardBody>
          {activeTab === 'alertes' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Code</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Type Alerte</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Libellé</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Type de Diffusion</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date Diffusion</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Ville de Diffusion</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Chargement des alertes...
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {(dashboardData?.alerts || currentData.alerts).map((alert: any) => (
                        <tr 
                          key={alert.id} 
                          className="border-b hover:bg-blue-50 cursor-pointer transition-colors"
                          onClick={() => router.push(`/gestion/alertes/${alert.id}`)}
                        >
                          <td className="py-3 px-4 font-semibold text-blue-600">{alert.code}</td>
                          <td className="py-3 px-4">
                            <div className="font-medium">{alert.typeAlerte}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">{alert.libelle}</div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="secondary">{alert.typeDiffusion}</Badge>
                          </td>
                          <td className="py-3 px-4 text-sm">{alert.dateDiffusion}</td>
                          <td className="py-3 px-4">
                            {getStatusBadge(alert.status as AlertStatus)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              {alert.villeDiffusion}
                            </div>
                          </td>
                          <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="secondary" 
                                size="sm"
                                onClick={() => router.push(`/gestion/alertes/${alert.id}`)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="danger" 
                                size="sm"
                                onClick={() => {
                                  // Action pour diffuser/alerter
                                  console.log('Diffuser alerte:', alert.id)
                                }}
                              >
                                <Radio className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {(dashboardData?.alerts || currentData.alerts).length === 0 && !isLoading && (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-gray-500">
                            Aucune alerte active pour cette période
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-4 px-4 font-bold text-gray-700 uppercase text-sm">Type d'Alerte</th>
                      <th className="text-left py-4 px-4 font-bold text-gray-700 uppercase text-sm">Nombre</th>
                      <th className="text-left py-4 px-4 font-bold text-gray-700 uppercase text-sm">Résolues</th>
                      <th className="text-left py-4 px-4 font-bold text-gray-700 uppercase text-sm">Taux</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Chargement des statistiques...
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <>
                        {(dashboardData?.statsTable || currentData.statsTable).map((stat: any, index: number) => {
                          const icons = [
                            { icon: Car, color: 'red' },
                            { icon: Search, color: 'blue' },
                            { icon: AlertTriangle, color: 'orange' },
                            { icon: Shield, color: 'purple' }
                          ]
                          const IconComponent = icons[index]?.icon || Car
                          const colorClass = icons[index]?.color || 'blue'
                          
                          const getColorClasses = (color: string) => {
                            const colors = {
                              red: { bg: 'bg-red-100', text: 'text-red-600' },
                              blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
                              orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
                              purple: { bg: 'bg-purple-100', text: 'text-purple-600' }
                            }
                            return colors[color as keyof typeof colors]
                          }
                          
                          const colors = getColorClasses(colorClass)
                          
                          const getTauxColor = (taux: number) => {
                            if (taux >= 90) return 'bg-green-100 text-green-700'
                            if (taux >= 70) return 'bg-green-50 text-green-600'
                            if (taux >= 50) return 'bg-yellow-100 text-yellow-700'
                            if (taux > 0) return 'bg-orange-100 text-orange-700'
                            return 'bg-gray-100 text-gray-600'
                          }
                          
                          return (
                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
                                    <IconComponent className={`w-5 h-5 ${colors.text}`} />
                                  </div>
                                  <span className="font-semibold text-gray-900">{stat.type}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-gray-900 font-bold text-lg">{stat.nombre}</td>
                              <td className="py-4 px-4 text-gray-900 font-bold text-lg">{stat.resolues}</td>
                              <td className="py-4 px-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getTauxColor(stat.taux)}`}>
                                  {stat.taux}%
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                        <tr className="bg-blue-50 hover:bg-blue-100 transition-colors border-t-2 border-blue-200">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-lg text-gray-900">TOTAL</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-900 font-bold text-xl">
                            {(dashboardData?.statsTable || currentData.statsTable).reduce((acc: number, stat: any) => acc + stat.nombre, 0)}
                          </td>
                          <td className="py-4 px-4 text-gray-900 font-bold text-xl">
                            {(dashboardData?.statsTable || currentData.statsTable).reduce((acc: number, stat: any) => acc + stat.resolues, 0)}
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-4 py-2 rounded-full text-base font-bold bg-green-100 text-green-700">
                              {Math.round(
                                ((dashboardData?.statsTable || currentData.statsTable).reduce((acc: number, stat: any) => acc + stat.resolues, 0) /
                                  (dashboardData?.statsTable || currentData.statsTable).reduce((acc: number, stat: any) => acc + stat.nombre, 0)) *
                                  100
                              ) || 0}%
                            </span>
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
      </div>
    </>
  )
}

export default AlertesSecuritePage