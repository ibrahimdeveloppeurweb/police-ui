'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Cookies from 'js-cookie';
import {
  convocationsService,
  adminService,
  type Commissariat,
} from '@/lib/api/services';

export type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'custom';

export interface ConvocationStats {
  totalConvocations: number;
  envoyees: number;
  honorees: number;
  enAttente: number;
  delaiMoyenJours: number;
  tauxHonore: number;
  agentsActifsCount: number;
  totalAgents: number;
  nouvelles: number;
  evolutionConvocations: string;      // ex: "+12.4%"
  evolutionEnvoyees: string;          // ex: "+8.9%"
  evolutionHonorees: string;          // ex: "+15.2%"
  evolutionEnAttente: string;         // ex: "-5.0%"
  evolutionDelai: string;             // ex: "-0.5 jour"
  evolutionTauxHonore: string;        // ex: "+2.4%"
  evolutionNouvelles: string;         // ex: "+20"
}

export interface ConvocationActivityData {
  period: string;
  convocations: number;
  envoyees: number;
  honorees: number;
}

export interface ConvocationType {
  type: string;
  count: number;
}

interface UseConvocationsStatsReturn {
  stats: ConvocationStats | null;
  topTypes: ConvocationType[] | null;
  activityData: ConvocationActivityData[] | null;
  loading: boolean;
  error: string | null;
  periode: PeriodKey;
  changePeriode: (period: PeriodKey) => void;
  applyCustomDates: (dateDebut: string, dateFin: string) => void;
  refetch: () => Promise<void>;
}

export function useConvocationsStats(): UseConvocationsStatsReturn {
  const [stats, setStats] = useState<ConvocationStats | null>(null);
  const [topTypes, setTopTypes] = useState<ConvocationType[] | null>(null);
  const [activityData, setActivityData] = useState<ConvocationActivityData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periode, setPeriode] = useState<PeriodKey>('jour');
  const [customDateDebut, setCustomDateDebut] = useState<string>('');
  const [customDateFin, setCustomDateFin] = useState<string>('');

  const lastRequestTimeRef = useRef<number>(0);
  const requestTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingRequestRef = useRef<boolean>(false);
  const MIN_REQUEST_DELAY = 500;

  const getCommissariatId = useCallback((): string | null => {
    try {
      const directId = Cookies.get('commissariat_id') || localStorage.getItem('commissariat_id');
      if (directId) return directId;
      const oldId = Cookies.get('user_commissariat_id') || localStorage.getItem('user_commissariat_id');
      if (oldId) return oldId;
      const commissariatData = Cookies.get('user_commissariat') || localStorage.getItem('user_commissariat');
      if (commissariatData) {
        const commissariat = JSON.parse(commissariatData);
        return commissariat?.id || null;
      }
      return null;
    } catch (e) {
      console.error('Erreur lors de la récupération du commissariat:', e);
      return null;
    }
  }, []);

  const fetchStats = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTimeRef.current;
    
    if (pendingRequestRef.current || (timeSinceLastRequest < MIN_REQUEST_DELAY && lastRequestTimeRef.current > 0)) {
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
      const delay = MIN_REQUEST_DELAY - timeSinceLastRequest;
      requestTimeoutRef.current = setTimeout(() => fetchStats(), Math.max(0, delay));
      return;
    }
    
    pendingRequestRef.current = true;
    lastRequestTimeRef.current = Date.now();
    setLoading(true);
    setError(null);

    try {
      const commId = getCommissariatId();
      
      // Préparer les dates
      let dateDebutFilter = '';
      let dateFinFilter = '';
      
      if (periode === 'custom') {
        dateDebutFilter = customDateDebut;
        dateFinFilter = customDateFin;
      } else {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const formatDateWithTime = (date: Date, isEndOfDay: boolean = false): string => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const time = isEndOfDay ? '23:59:59' : '00:00:00';
          return `${year}-${month}-${day}T${time}`;
        };

        switch (periode) {
          case 'jour':
            dateDebutFilter = formatDateWithTime(today, false);
            dateFinFilter = formatDateWithTime(today, true);
            break;
          case 'semaine':
            const weekStart = new Date(today);
            const dayOfWeek = today.getDay();
            const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            weekStart.setDate(today.getDate() - daysToMonday);
            dateDebutFilter = formatDateWithTime(weekStart, false);
            dateFinFilter = formatDateWithTime(today, true);
            break;
          case 'mois':
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            dateDebutFilter = formatDateWithTime(monthStart, false);
            dateFinFilter = formatDateWithTime(today, true);
            break;
          case 'annee':
            const yearStart = new Date(today.getFullYear(), 0, 1);
            dateDebutFilter = formatDateWithTime(yearStart, false);
            dateFinFilter = formatDateWithTime(today, true);
            break;
          case 'tout':
            // Pas de filtre de date
            break;
        }
      }

      const filters: Record<string, string> = {};
      if (commId) filters.commissariatId = commId;
      if (dateDebutFilter) filters.dateDebut = dateDebutFilter;
      if (dateFinFilter) filters.dateFin = dateFinFilter;
      if (periode && periode !== 'custom') {
        filters.periode = periode;
      }

      console.log('📊 Filtres dashboard convocations:', filters);

      // Récupérer les stats principales
      const statsResponse = await convocationsService.getDashboard(filters);

      if (statsResponse.data) {
        const data = statsResponse.data;
        
        // Mapper les données
        setStats({
          totalConvocations: Number(data.stats.totalConvocations || 0),
          envoyees: Number(data.stats.envoyees || 0),
          honorees: Number(data.stats.honorees || 0),
          enAttente: Number(data.stats.enAttente || 0),
          delaiMoyenJours: Number(data.stats.delaiMoyenJours || 0),
          tauxHonore: Number(data.stats.tauxHonore || 0),
          agentsActifsCount: Number(data.stats.agentsActifsCount || 0),
          totalAgents: Number(data.stats.totalAgents || 0),
          nouvelles: Number(data.stats.nouvelles || 0),
          evolutionConvocations: String(data.stats.evolutionConvocations || '+0%'),
          evolutionEnvoyees: String(data.stats.evolutionEnvoyees || '+0%'),
          evolutionHonorees: String(data.stats.evolutionHonorees || '+0%'),
          evolutionEnAttente: String(data.stats.evolutionEnAttente || '-0%'),
          evolutionDelai: String(data.stats.evolutionDelai || '0 jour'),
          evolutionTauxHonore: String(data.stats.evolutionTauxHonore || '+0%'),
          evolutionNouvelles: String(data.stats.evolutionNouvelles || '+0'),
        });

        setTopTypes(data.topTypes?.map((t: any) => ({
          type: t.type,
          count: Number(t.count),
        })) || []);

        setActivityData(data.activityData?.map((a: any) => ({
          period: a.period,
          convocations: Number(a.convocations),
          envoyees: Number(a.envoyees),
          honorees: Number(a.honorees),
        })) || []);
      }
    } catch (err: any) {
      console.error('❌ Erreur chargement stats convocations:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
      pendingRequestRef.current = false;
    }
  }, [periode, customDateDebut, customDateFin, getCommissariatId]);

  const changePeriode = useCallback((period: PeriodKey) => {
    setPeriode(period);
    setCustomDateDebut('');
    setCustomDateFin('');
  }, []);

  const applyCustomDates = useCallback((dateDebut: string, dateFin: string) => {
    setPeriode('custom');
    setCustomDateDebut(dateDebut);
    setCustomDateFin(dateFin);
  }, []);

  useEffect(() => {
    return () => {
      if (requestTimeoutRef.current) clearTimeout(requestTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    topTypes,
    activityData,
    loading,
    error,
    periode,
    changePeriode,
    applyCustomDates,
    refetch: fetchStats,
  };
}

export default useConvocationsStats;