// Service pour gérer les convocations avec l'API backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

export interface ConvocationStatistics {
  total_convocations: number
  convocations_evolution: string
  convocations_comparison: string
  envoyees: number
  envoyees_evolution: string
  envoyees_comparison: string
  honorees: number
  honorees_evolution: string
  honorees_comparison: string
  en_attente: number
  en_attente_evolution: string
  en_attente_comparison: string
  delai_moyen: string
  delai_evolution: string
  delai_comparison: string
  taux_honneur: string
  taux_evolution: string
  taux_comparison: string
  agents_actifs: string
  agents_evolution: string
  nouvelles: string
  nouvelles_evolution: string
}

export interface ActivityDataPoint {
  period: string
  convocations: number
  envoyees: number
  honorees: number
}

export interface ActivityData {
  activity_data: ActivityDataPoint[]
}

export interface PieDataItem {
  name: string
  value: number
  color: string
}

export interface TypeConvocationCount {
  type: string
  nombre: number
}

export interface TopTypesData {
  pie_data: PieDataItem[]
  type_convocations: TypeConvocationCount[]
}

export type PeriodType = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'

export interface PeriodRequest {
  period: PeriodType
  date_debut?: string
  date_fin?: string
  commissariat_id?: string
}

class ConvocationService {
  /**
   * Récupère les statistiques pour une période donnée
   */
  async getStatisticsByPeriod(params: PeriodRequest): Promise<ConvocationStatistics> {
    const queryParams = new URLSearchParams({
      period: params.period,
    })

    if (params.date_debut) {
      queryParams.append('date_debut', params.date_debut)
    }
    if (params.date_fin) {
      queryParams.append('date_fin', params.date_fin)
    }
    if (params.commissariat_id) {
      queryParams.append('commissariat_id', params.commissariat_id)
    }

    const response = await fetch(
      `${API_BASE_URL}/convocations/statistics/period?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch statistics')
    }

    return response.json()
  }

  /**
   * Récupère les données d'activité pour les graphiques
   */
  async getActivityByPeriod(params: PeriodRequest): Promise<ActivityData> {
    const queryParams = new URLSearchParams({
      period: params.period,
    })

    if (params.date_debut) {
      queryParams.append('date_debut', params.date_debut)
    }
    if (params.date_fin) {
      queryParams.append('date_fin', params.date_fin)
    }

    const response = await fetch(
      `${API_BASE_URL}/convocations/activity/period?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch activity data')
    }

    return response.json()
  }

  /**
   * Récupère le top 5 des types de convocations et les données du pie chart
   */
  async getTopTypesByPeriod(params: PeriodRequest): Promise<TopTypesData> {
    const queryParams = new URLSearchParams({
      period: params.period,
    })

    if (params.date_debut) {
      queryParams.append('date_debut', params.date_debut)
    }
    if (params.date_fin) {
      queryParams.append('date_fin', params.date_fin)
    }

    const response = await fetch(
      `${API_BASE_URL}/convocations/top-types/period?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch top types')
    }

    return response.json()
  }

  /**
   * Récupère toutes les données du dashboard en un seul appel
   */
  async getDashboardData(params: PeriodRequest): Promise<{
    statistics: ConvocationStatistics
    activity: ActivityData
    topTypes: TopTypesData
  }> {
    try {
      const [statistics, activity, topTypes] = await Promise.all([
        this.getStatisticsByPeriod(params),
        this.getActivityByPeriod(params),
        this.getTopTypesByPeriod(params),
      ])

      return {
        statistics,
        activity,
        topTypes,
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      throw error
    }
  }
}

export const convocationService = new ConvocationService()
export default convocationService
