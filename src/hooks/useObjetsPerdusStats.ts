import { useState, useEffect, useCallback } from 'react'
import Cookies from 'js-cookie'
import api from '@/lib/axios'

export interface ObjetPerduStats {
  total: number
  enRecherche: number
  retrouves: number
  clotures: number
  tauxRetrouve: number
  evolutionTotal: string
  evolutionEnRecherche: string
  evolutionRetrouves: string
  evolutionClotures: string
  evolutionTauxRetrouve: string
}

export interface TopType {
  type: string
  count: number
}

export interface ActivityDataPoint {
  period: string
  objetsPerdus: number
  recherche: number
  retrouves: number
  clotures: number
}

export interface ObjetsPerdusStatsResponse {
  stats: ObjetPerduStats
  topTypes: TopType[]
  activityData: ActivityDataPoint[]
}

type PeriodeType = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'custom'

export const useObjetsPerdusStats = () => {
  const [stats, setStats] = useState<ObjetPerduStats | null>(null)
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
    const getCommissariatId = (): string | null => {
      try {
        // Essayer d'abord les cookies/localStorage directs
        const directId = Cookies.get('commissariat_id') || localStorage.getItem('commissariat_id')
        if (directId) return directId

        // Essayer l'ancien format
        const oldId = Cookies.get('user_commissariat_id') || localStorage.getItem('user_commissariat_id')
        if (oldId) return oldId

        // Essayer d'extraire depuis l'objet commissariat
        const commissariatData = Cookies.get('user_commissariat') || localStorage.getItem('user_commissariat')
        if (commissariatData) {
          const commissariat = JSON.parse(commissariatData)
          return commissariat?.id || null
        }

        return null
      } catch (e) {
        console.error('Erreur lors de la récupération du commissariat:', e)
        return null
      }
    }

    setCommissariatId(getCommissariatId())
  }, [])

  // Calculer les dates en fonction de la période
  const calculateDates = useCallback((periode: PeriodeType): { dateDebut: string; dateFin: string } => {
    const now = new Date()
    const dateFin = new Date(now)
    let dateDebut = new Date(now)

    switch (periode) {
      case 'jour':
        dateDebut.setHours(0, 0, 0, 0)
        dateFin.setHours(23, 59, 59, 999)
        break
      case 'semaine':
        const dayOfWeek = now.getDay()
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        dateDebut.setDate(now.getDate() - diff)
        dateDebut.setHours(0, 0, 0, 0)
        dateFin.setHours(23, 59, 59, 999)
        break
      case 'mois':
        dateDebut.setDate(1)
        dateDebut.setHours(0, 0, 0, 0)
        dateFin.setMonth(now.getMonth() + 1, 0)
        dateFin.setHours(23, 59, 59, 999)
        break
      case 'annee':
        dateDebut.setMonth(0, 1)
        dateDebut.setHours(0, 0, 0, 0)
        dateFin.setMonth(11, 31)
        dateFin.setHours(23, 59, 59, 999)
        break
      case 'tout':
        dateDebut.setFullYear(2020, 0, 1)
        dateDebut.setHours(0, 0, 0, 0)
        dateFin.setHours(23, 59, 59, 999)
        break
      case 'custom':
        // Pour custom, on utilise les dates fournies
        break
    }

    return {
      dateDebut: dateDebut.toISOString(),
      dateFin: dateFin.toISOString()
    }
  }, [])

  // Fonction pour charger les stats
  const fetchStats = useCallback(async () => {
    if (!commissariatId) {
      console.log('⏳ Attente du commissariatId...')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const dates = calculateDates(periode)
      
      // Si des dates personnalisées sont définies, utiliser la période "custom"
      const periodeToSend = (dateDebut && dateFin) ? 'custom' : periode
      
      const params = new URLSearchParams({
        commissariatId,
        dateDebut: dateDebut || dates.dateDebut,
        dateFin: dateFin || dates.dateFin,
        periode: periodeToSend
      })

      console.log('📊 Chargement des stats objets perdus:', {
        commissariatId,
        periode: periodeToSend,
        dateDebut: dateDebut || dates.dateDebut,
        dateFin: dateFin || dates.dateFin
      })

      const response = await api.get(`/objets-perdus/dashboard?${params.toString()}`)

      console.log('✅ Stats objets perdus récupérées:', response.data)

      if (response.data?.data) {
        setStats(response.data.data.stats)
        setTopTypes(response.data.data.topTypes || [])
        setActivityData(response.data.data.activityData || [])
      } else {
        throw new Error('Format de réponse invalide')
      }
    } catch (err: any) {
      console.error('❌ Erreur lors du chargement des stats:', err)
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des statistiques')
      
      // Valeurs par défaut en cas d'erreur
      setStats({
        total: 0,
        enRecherche: 0,
        retrouves: 0,
        clotures: 0,
        tauxRetrouve: 0,
        evolutionTotal: "0",
        evolutionEnRecherche: "0",
        evolutionRetrouves: "0",
        evolutionClotures: "0",
        evolutionTauxRetrouve: "0"
      })
      setTopTypes([])
      setActivityData([])
    } finally {
      setLoading(false)
    }
  }, [commissariatId, periode, dateDebut, dateFin, calculateDates])

  // Charger les stats au montage et quand les dépendances changent
  useEffect(() => {
    if (commissariatId) {
      fetchStats()
    }
  }, [commissariatId, periode, dateDebut, dateFin, fetchStats])

  // Fonction pour changer la période
  const changePeriode = useCallback((newPeriode: PeriodeType) => {
    setPeriode(newPeriode)
    // Réinitialiser les dates personnalisées
    setDateDebut('')
    setDateFin('')
  }, [])

  // Fonction pour appliquer des dates personnalisées
  const applyCustomDates = useCallback((debut: string, fin: string) => {
    setDateDebut(debut)
    setDateFin(fin)
  }, [])

  return {
    stats,
    topTypes,
    activityData,
    loading,
    error,
    commissariatId,
    periode,
    changePeriode,
    applyCustomDates,
    refetch: fetchStats
  }
}
