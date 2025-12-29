import { useState, useEffect, useCallback } from 'react'
import Cookies from 'js-cookie'
import api from '@/lib/axios'

export interface PlainteStats {
  total: number
  enCours: number
  resolues: number
  classees: number
  transferees: number
  slaDepasse: number
  delaiMoyenJours: number
  parType: Record<string, number>
  parPriorite: Record<string, number>
  parEtape: Record<string, number>
  evolutionTotal: string
  evolutionEnCours: string
  evolutionResolues: string
  evolutionDelai: string
}

export interface TopType {
  type: string
  count: number
}

export interface ActivityDataPoint {
  period: string
  plaintes: number
  urgentes: number
  resolues: number
}

export interface PlaintesStatsResponse {
  stats: PlainteStats
  topTypes: TopType[]
  activityData: ActivityDataPoint[]
}

type PeriodeType = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'custom'

export const usePlaintesStats = () => {
  const [stats, setStats] = useState<PlainteStats | null>(null)
  const [topTypes, setTopTypes] = useState<TopType[]>([])
  const [activityData, setActivityData] = useState<ActivityDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commissariatId, setCommissariatId] = useState<string | null>(null)
  const [periode, setPeriode] = useState<PeriodeType>('jour')
  const [dateDebut, setDateDebut] = useState<string>('')
  const [dateFin, setDateFin] = useState<string>('')

  // Récupérer le commissariatId au chargement
  useEffect(() => {
    // Récupérer directement depuis le cookie commissariat_id
    const commissariatIdFromCookie = Cookies.get('commissariat_id')
    console.log('🔍 usePlaintesStats - commissariat_id cookie:', commissariatIdFromCookie)
    
    if (commissariatIdFromCookie) {
      console.log('✅ usePlaintesStats - commissariatId trouvé:', commissariatIdFromCookie)
      setCommissariatId(commissariatIdFromCookie)
    } else {
      console.warn('⚠️ usePlaintesStats - Aucun commissariat_id trouvé dans les cookies')
    }
  }, [])

  // Fonction pour calculer les dates selon la période
  const getDateRange = useCallback((periodType: PeriodeType): { dateDebut: string; dateFin: string } => {
    const now = new Date()
    const dateFin = now.toISOString()
    let dateDebut = ''

    switch (periodType) {
      case 'jour':
        dateDebut = new Date(now.setHours(0, 0, 0, 0)).toISOString()
        break
      case 'semaine':
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - 7)
        dateDebut = weekStart.toISOString()
        break
      case 'mois':
        const monthStart = new Date(now)
        monthStart.setDate(1)
        monthStart.setHours(0, 0, 0, 0)
        dateDebut = monthStart.toISOString()
        break
      case 'annee':
        const yearStart = new Date(now.getFullYear(), 0, 1)
        dateDebut = yearStart.toISOString()
        break
      case 'tout':
        dateDebut = ''
        break
      default:
        dateDebut = ''
    }

    return { dateDebut, dateFin }
  }, [])

  // Fonction pour charger les statistiques
  const fetchStats = useCallback(async () => {
    console.log('🚀 fetchStats appelé - commissariatId:', commissariatId)
    if (!commissariatId) {
      console.warn('⚠️ fetchStats - Aucun commissariatId, arrêt')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { dateDebut: start, dateFin: end } = periode === 'custom' 
        ? { dateDebut, dateFin } 
        : getDateRange(periode)

      const params: any = {
        commissariat_id: commissariatId,
      }

      if (start) params.date_debut = start
      if (end) params.date_fin = end

      console.log('📊 Chargement stats plaintes avec params:', params)
      console.log('📊 URL complète:', api.defaults.baseURL + '/plaintes/statistics')

      const response = await api.get('/plaintes/statistics', { params })
      console.log('✅ Réponse API reçue:', response.data)
      const data = response.data

      // Calculer les évolutions (simulées pour l'instant)
      const statsData: PlainteStats = {
        total: data.total || 0,
        enCours: data.en_cours || 0,
        resolues: data.resolues || 0,
        classees: data.classees || 0,
        transferees: data.transferees || 0,
        slaDepasse: data.sla_depasse || 0,
        delaiMoyenJours: data.delai_moyen_jours || 0,
        parType: data.par_type || {},
        parPriorite: data.par_priorite || {},
        parEtape: data.par_etape || {},
        evolutionTotal: '+0',
        evolutionEnCours: '+0',
        evolutionResolues: '+0',
        evolutionDelai: '-0 jour'
      }

      // Préparer les top types
      const types: TopType[] = Object.entries(data.par_type || {})
        .map(([type, count]) => ({ type, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Préparer les données d'activité (selon la période)
      const activity = prepareActivityData(periode, data)

      setStats(statsData)
      setTopTypes(types)
      setActivityData(activity)

      console.log('✅ Stats plaintes chargées:', { statsData, types, activity })
    } catch (err: any) {
      console.error('❌ Erreur chargement stats plaintes:', err)
      setError(err.response?.data?.error || 'Erreur lors du chargement des statistiques')
    } finally {
      setLoading(false)
    }
  }, [commissariatId, periode, dateDebut, dateFin, getDateRange])

  // Préparer les données d'activité selon la période
  const prepareActivityData = (period: PeriodeType, data: any): ActivityDataPoint[] => {
    // Pour l'instant, on retourne des données simulées
    // TODO: Adapter selon les vraies données du backend
    const baseData = {
      plaintes: data.total || 0,
      urgentes: data.par_priorite?.URGENTE || 0,
      resolues: data.resolues || 0
    }

    switch (period) {
      case 'jour':
        return [
          { period: '00h-04h', plaintes: 0, urgentes: 0, resolues: 0 },
          { period: '04h-08h', plaintes: Math.floor(baseData.plaintes * 0.05), urgentes: 0, resolues: 0 },
          { period: '08h-12h', plaintes: Math.floor(baseData.plaintes * 0.3), urgentes: Math.floor(baseData.urgentes * 0.4), resolues: Math.floor(baseData.resolues * 0.25) },
          { period: '12h-16h', plaintes: Math.floor(baseData.plaintes * 0.25), urgentes: Math.floor(baseData.urgentes * 0.2), resolues: Math.floor(baseData.resolues * 0.25) },
          { period: '16h-20h', plaintes: Math.floor(baseData.plaintes * 0.25), urgentes: Math.floor(baseData.urgentes * 0.3), resolues: Math.floor(baseData.resolues * 0.25) },
          { period: '20h-24h', plaintes: Math.floor(baseData.plaintes * 0.15), urgentes: Math.floor(baseData.urgentes * 0.1), resolues: Math.floor(baseData.resolues * 0.25) }
        ]
      case 'semaine':
        return ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => ({
          period: day,
          plaintes: Math.floor(baseData.plaintes / 7),
          urgentes: Math.floor(baseData.urgentes / 7),
          resolues: Math.floor(baseData.resolues / 7)
        }))
      case 'mois':
        return ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'].map(week => ({
          period: week,
          plaintes: Math.floor(baseData.plaintes / 4),
          urgentes: Math.floor(baseData.urgentes / 4),
          resolues: Math.floor(baseData.resolues / 4)
        }))
      default:
        return []
    }
  }

  // Charger les stats au montage et quand les dépendances changent
  useEffect(() => {
    if (commissariatId) {
      fetchStats()
    }
  }, [commissariatId, periode, dateDebut, dateFin, fetchStats])

  // Fonction pour changer la période
  const changePeriode = useCallback((newPeriode: PeriodeType) => {
    setPeriode(newPeriode)
    setDateDebut('')
    setDateFin('')
  }, [])

  // Fonction pour appliquer des dates personnalisées
  const applyCustomDates = useCallback((debut: string, fin: string) => {
    setDateDebut(debut)
    setDateFin(fin)
    if (debut && fin) {
      setPeriode('custom')
    }
  }, [])

  // Fonction pour rafraîchir
  const refetch = useCallback(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    topTypes,
    activityData,
    loading,
    error,
    periode,
    changePeriode,
    applyCustomDates,
    refetch
  }
}
