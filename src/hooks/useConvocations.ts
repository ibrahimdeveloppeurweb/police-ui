'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Cookies from 'js-cookie';
import {
  convocationsService,
  adminService,
  type Convocation,
  type Commissariat,
} from '@/lib/api/services';

// Types
export type StatutConvocation = 'ENVOYÉ' | 'HONORÉ' | 'EN ATTENTE';
export type EtapeConvocation =| 'CREATION'| 'NOTIFICATION'| 'CONFIRMATION'| 'AUDITION_REALISEE';
export type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'personnalise';

export interface ConvocationListItem {
  id: string;
  numero: string;
  type: string;
  temoin: string; // "Prénom Nom"
  dateCreation: string; // format DD/MM/YYYY HH:mm
  rdvProgramme?: string; // format DD/MM/YYYY HH:mm
  heureRdv?: string; // format HH:mm
  affaireLiee: string;
  agent: string; // "Prénom Nom"
  statutConvocation: StatutConvocation;
  etapeProgression: number;
  etapeTotal: number;
  etapeActuelle: EtapeConvocation;
  tempsEcoule: string;
  // Informations du convoqué
  convoqueNom: string;
  convoquePrenom: string;
  convoqueTelephone?: string;
  convoqueAdresse?: string;
  convoqueEmail?: string;
  qualiteConvoque?: string;
  motif?: string;
}

export interface ConvocationStats {
  totalConvocations: number;
  convocationsJour: number;
  envoyes: number;
  honores: number;
  pourcentageHonores: number;
  enAttente: number;
  evolutionConvocations: string; // ex: "+12.4%"
  evolutionEnvoyes: string; // ex: "+8.2%"
  evolutionHonores: string; // ex: "+15.3%"
}

interface UseConvocationsParams {
  periode?: PeriodKey;
  dateDebut?: string;
  dateFin?: string;
  statut?: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
  searchKey?: number;
}

interface UseConvocationsReturn {
  convocations: ConvocationListItem[];
  stats: ConvocationStats | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  commissariat: Commissariat | null;
  commissariatId: string | null;
  refetch: () => Promise<void>;
}

// Helper: calcul des plages de dates
function getDateRange(periode: PeriodKey): { dateDebut?: string; dateFin?: string } {
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
      return {
        dateDebut: formatDateWithTime(today, false),
        dateFin: formatDateWithTime(today, true),
      };
    case 'semaine':
      const weekStart = new Date(today);
      const dayOfWeek = today.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      weekStart.setDate(today.getDate() - daysToMonday);
      return {
        dateDebut: formatDateWithTime(weekStart, false),
        dateFin: formatDateWithTime(today, true),
      };
    case 'mois':
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        dateDebut: formatDateWithTime(monthStart, false),
        dateFin: formatDateWithTime(today, true),
      };
    case 'annee':
      const yearStart = new Date(today.getFullYear(), 0, 1);
      return {
        dateDebut: formatDateWithTime(yearStart, false),
        dateFin: formatDateWithTime(today, true),
      };
    case 'personnalise':
      return {};
    default:
      return {};
  }
}

// Formatage déterministe
function formatDateTimeDeterministic(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function formatDateOnlyDeterministic(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Transformer une convocation API → format liste


  function transformConvocation(conv: Convocation): ConvocationListItem {
    const dateCreation = (conv as any).createdAt || conv.dateCreation
      ? new Date((conv as any).createdAt || conv.dateCreation)
      : new Date('2000-01-01');
  
    const rdvProgramme = conv.dateRdv ? new Date(conv.dateRdv) : null;
  
    let etapeProgression = 1;
    let etapeActuelle: EtapeConvocation = 'CREATION';
    let tempsEcoule = 'Étape 1/4 - Création';
  
    const statut = (conv.statut || '').toUpperCase();
  
    switch (statut) {
      case 'ENVOYÉ':
        etapeProgression = 2;
        etapeActuelle = 'NOTIFICATION';
        tempsEcoule = 'Étape 2/4 - Notification envoyée';
        break;
  
      case 'EN ATTENTE':
        etapeProgression = 3;
        etapeActuelle = 'CONFIRMATION';
  
        if (rdvProgramme) {
          const diffTime = rdvProgramme.getTime() - Date.now();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
          tempsEcoule =
            diffDays > 0
              ? `Étape 3/4 - RDV dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`
              : `Étape 3/4 - RDV aujourd’hui`;
        } else {
          tempsEcoule = 'Étape 3/4 - En attente de confirmation';
        }
        break;
  
      case 'HONORÉ':
        etapeProgression = 4;
        etapeActuelle = 'AUDITION_REALISEE';
        tempsEcoule = 'Étape 4/4 - Audition réalisée';
        break;
  
      default:
        etapeProgression = 1;
        etapeActuelle = 'CREATION';
        tempsEcoule = 'Étape 1/4 - Création';
    }
  
    return {
    id: conv.id,
    numero: conv.numero || conv.id,
    type: conv.typeConvocation || '',
    temoin: `${conv.temoin?.prenom || ''} ${conv.temoin?.nom || ''}`.trim() || 'N/A',
    dateCreation: formatDateTimeDeterministic(dateCreation),
    rdvProgramme: rdvProgramme
    ? formatDateOnlyDeterministic(rdvProgramme)
    : undefined,
    heureRdv: conv.heureRdv || (rdvProgramme
    ? `${String(rdvProgramme.getHours()).padStart(2, '0')}:${String(
    rdvProgramme.getMinutes()
    ).padStart(2, '0')}`
    : undefined),
    affaireLiee: conv.affaireLiee || '',
    agent: `${conv.agent?.prenom || ''} ${conv.agent?.nom || ''}`.trim() || 'N/A',

    statutConvocation: statut as StatutConvocation,
    etapeProgression,
    etapeTotal: 4,
    etapeActuelle,
    tempsEcoule,
      
    // Informations du convoqué
    convoqueNom: conv.convoqueNom || '',
    convoquePrenom: conv.convoquePrenom || '',
    convoqueTelephone: conv.convoqueTelephone,
    convoqueAdresse: conv.convoqueAdresse,
    convoqueEmail: conv.convoqueEmail,
    qualiteConvoque: conv.qualiteConvoque,
    motif: conv.motif,
  };
  }
  

export function useConvocations(params: UseConvocationsParams = {}): UseConvocationsReturn {
  const [convocations, setConvocations] = useState<ConvocationListItem[]>([]);
  const [stats, setStats] = useState<ConvocationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseConvocationsReturn['pagination']>(null);
  const [commissariat, setCommissariat] = useState<Commissariat | null>(null);
  const [commissariatId, setCommissariatId] = useState<string | null>(null);

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

  const fetchCommissariatInfo = useCallback(async (commId: string) => {
    try {
      const commissariatData = Cookies.get('user_commissariat') || localStorage.getItem('user_commissariat');
      if (commissariatData) {
        try {
          const parsed = JSON.parse(commissariatData);
          if (parsed.id === commId) {
            setCommissariat(parsed as Commissariat);
            return;
          }
        } catch {}
      }
      const response = await adminService.getCommissariat(commId);
      if (response.data) {
        const commData = (response.data as any)?.data || response.data;
        setCommissariat(commData as Commissariat);
      }
    } catch (err: any) {
      console.error('Erreur lors de la récupération des infos commissariat:', err);
    }
  }, []);

  const fetchConvocations = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTimeRef.current;
    
    if (pendingRequestRef.current || (timeSinceLastRequest < MIN_REQUEST_DELAY && lastRequestTimeRef.current > 0)) {
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
      const delay = MIN_REQUEST_DELAY - timeSinceLastRequest;
      requestTimeoutRef.current = setTimeout(() => fetchConvocations(), Math.max(0, delay));
      return;
    }
    
    pendingRequestRef.current = true;
    lastRequestTimeRef.current = Date.now();
    setLoading(true);
    setError(null);

    try {
      const commId = getCommissariatId();
      setCommissariatId(commId);
      
      if (commId && (!commissariat || commissariat.id !== commId)) {
        fetchCommissariatInfo(commId);
      }

      // Préparer les dates
      let dateDebutFilter: string | undefined;
      let dateFinFilter: string | undefined;
      
      if (params.periode === 'personnalise') {
        dateDebutFilter = params.dateDebut;
        dateFinFilter = params.dateFin;
      } else if (params.periode) {
        const range = getDateRange(params.periode);
        dateDebutFilter = range.dateDebut;
        dateFinFilter = range.dateFin;
      }

      // Filtres API
      const filters: Record<string, any> = {};
      if (commId) filters.commissariatId = commId;
      if (dateDebutFilter) filters.dateDebut = dateDebutFilter;
      if (dateFinFilter) filters.dateFin = dateFinFilter;
      if (params.statut && params.statut !== 'Statut convocation') filters.statut = params.statut;
      if (params.type && params.type !== "Type d'audition") filters.type = params.type;
      if (params.search?.trim()) filters.search = params.search.trim();

      const page = params.page || 1;
      const limit = params.limit || 5;
      filters.page = page;
      filters.limit = limit;

      // Filtres stats
      const statsFilters: Record<string, any> = {};
      if (commId) statsFilters.commissariatId = commId;
      if (dateDebutFilter) statsFilters.dateDebut = dateDebutFilter;
      if (dateFinFilter) statsFilters.dateFin = dateFinFilter;
      if (params.periode && params.periode !== 'personnalise') {
        statsFilters.periode = params.periode;
      }

      const [response, statsResponse] = await Promise.all([
        convocationsService.list(filters),
        convocationsService.getStatistiques(statsFilters).catch((err) => {
          console.warn('⚠️ Erreur stats convocations:', err);
          return null;
        })
      ]);

      const apiData = (response.data as any)?.data || response.data;
      const paginationData = (response.data as any)?.pagination || (apiData?.pagination);

      let convList: any[] = [];
      if (apiData?.convocations) convList = apiData.convocations;
      else if (Array.isArray(apiData)) convList = apiData;
      else if (apiData?.data) convList = apiData.data;

      const transformed = convList.map(transformConvocation);
      setConvocations(transformed);

      // Stats
      if (statsResponse?.data) {
        const s = statsResponse.data;
        setStats({
          totalConvocations: Number(s.totalConvocations) || 0,
          convocationsJour: Number(s.convocationsJour) || 0,
          envoyes: Number(s.envoyes) || 0,
          honores: Number(s.honores) || 0,
          pourcentageHonores: typeof s.pourcentageHonores === 'number' ? s.pourcentageHonores : (s.honores / s.totalConvocations * 100) || 0,
          enAttente: Number(s.enAttente) || 0,
          evolutionConvocations: String(s.evolutionConvocations || '+0%'),
          evolutionEnvoyes: String(s.evolutionEnvoyes || '+0%'),
          evolutionHonores: String(s.evolutionHonores || '+0%'),
        });
      } else {
        setStats({
          totalConvocations: paginationData?.total || transformed.length,
          convocationsJour: 0,
          envoyes: transformed.filter(c => c.statutConvocation === 'ENVOYÉ').length,
          honores: transformed.filter(c => c.statutConvocation === 'HONORÉ').length,
          pourcentageHonores: transformed.length ? (transformed.filter(c => c.statutConvocation === 'HONORÉ').length / transformed.length * 100) : 0,
          enAttente: transformed.filter(c => c.statutConvocation === 'EN ATTENTE').length,
          evolutionConvocations: '+0%',
          evolutionEnvoyes: '+0%',
          evolutionHonores: '+0%',
        });
      }

      // Pagination
      const total = paginationData?.total != null ? Number(paginationData.total) : transformed.length;
      const totalPages = Math.ceil(total / limit);
      setPagination({
        page: Number(paginationData?.page || page),
        limit: Number(paginationData?.limit || limit),
        total,
        totalPages,
      });

    } catch (err: any) {
      console.error('❌ Erreur chargement convocations:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des convocations');
    } finally {
      setLoading(false);
      pendingRequestRef.current = false;
    }
  }, [
    params.periode,
    params.dateDebut,
    params.dateFin,
    params.statut,
    params.type,
    params.search,
    params.page,
    params.limit,
    params.searchKey,
    getCommissariatId,
    fetchCommissariatInfo,
  ]);

  useEffect(() => {
    return () => {
      if (requestTimeoutRef.current) clearTimeout(requestTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    fetchConvocations();
  }, [fetchConvocations]);

  return {
    convocations,
    stats,
    loading,
    error,
    pagination,
    commissariat,
    commissariatId,
    refetch: fetchConvocations,
  };
}

// Hook avec gestion des filtres
export function useConvocationsWithFilters() {
  const [periode, setPeriode] = useState<PeriodKey>('jour');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [activeCustomDateDebut, setActiveCustomDateDebut] = useState<string | undefined>(undefined);
  const [activeCustomDateFin, setActiveCustomDateFin] = useState<string | undefined>(undefined);
  const [searchKey, setSearchKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState('Statut convocation');
  const [typeFilter, setTypeFilter] = useState("Type d'audition");
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(5);

  const isCustomDateRange = !!(activeCustomDateDebut && activeCustomDateFin);

  const convocationsData = useConvocations({
    periode: isCustomDateRange ? 'personnalise' : periode,
    dateDebut: isCustomDateRange ? activeCustomDateDebut : undefined,
    dateFin: isCustomDateRange ? activeCustomDateFin : undefined,
    statut: statusFilter !== 'Statut convocation' ? statusFilter : undefined,
    type: typeFilter !== "Type d'audition" ? typeFilter : undefined,
    search: activeSearchTerm || undefined,
    page: currentPage,
    limit,
    searchKey,
  });

  const handleFilterChange = (newPeriode: PeriodKey) => {
    setPeriode(newPeriode);
    setActiveCustomDateDebut(undefined);
    setActiveCustomDateFin(undefined);
    setDateDebut('');
    setDateFin('');
    setActiveSearchTerm(undefined);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleCustomDateSearch = () => {
    if (dateDebut && dateFin) {
      const start = `${dateDebut}T00:00:00`;
      const end = `${dateFin}T23:59:59`;
      setActiveCustomDateDebut(start);
      setActiveCustomDateFin(end);
      setSearchKey(prev => prev + 1);
      setCurrentPage(1);
    }
  };

  const handleSearchSubmit = () => {
    const trimmed = searchTerm.trim();
    setActiveSearchTerm(trimmed || undefined);
    setSearchKey(prev => prev + 1);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return {
    ...convocationsData,
    periode,
    dateDebut,
    dateFin,
    isCustomDateRange,
    statusFilter,
    typeFilter,
    searchTerm,
    currentPage,
    limit,
    setPeriode: handleFilterChange,
    setDateDebut,
    setDateFin,
    applyCustomDateRange: handleCustomDateSearch,
    setStatusFilter: handleStatusFilterChange,
    setTypeFilter: handleTypeFilterChange,
    setSearchTerm: handleSearchChange,
    applySearch: handleSearchSubmit,
    setCurrentPage: handlePageChange,
  };
}

export default useConvocations;