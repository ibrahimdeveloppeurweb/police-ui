'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Cookies from 'js-cookie';
import { objetsRetrouvesService, adminService, type ObjetRetrouve, type Commissariat } from '@/lib/api/services';

// Types pour la page de liste
export type ObjetRetrouveStatus = 'DISPONIBLE' | 'RESTITUÉ' | 'NON_RÉCLAMÉ';
export type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'personnalise';

export interface ObjetRetrouveListItem {
  id: string;
  numero: string;
  typeObjet: string;
  description: string;
  lieuTrouvaille: string;
  dateTrouvaille: string;
  dateDepot: string;
  deposant: {
    nom: string;
    prenom: string;
    telephone: string;
    email?: string;
  };
  statut: ObjetRetrouveStatus;
  agent?: {
    nom: string;
    prenom: string;
  };
  commissariat?: string;
  valeurEstimee?: string;
  couleur?: string;
}

export interface ObjetRetrouveStats {
  totalObjets: number;
  disponibles: number;
  restitues: number;
  nonReclames: number;
  tauxRestitution: number;
  evolutionTotal?: string;
  evolutionDisponibles?: string;
  evolutionRestitues?: string;
  evolutionNonReclames?: string;
  evolutionTauxRestitution?: string;
}

interface UseObjetsRetrouvesParams {
  periode?: PeriodKey;
  dateDebut?: string;
  dateFin?: string;
  statut?: string;
  typeObjet?: string;
  search?: string;
  page?: number;
  limit?: number;
  searchKey?: number;
}

interface UseObjetsRetrouvesReturn {
  objets: ObjetRetrouveListItem[];
  stats: ObjetRetrouveStats | null;
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

// Fonction pour convertir les statuts backend vers les formats frontend
function convertStatut(statut: string): ObjetRetrouveStatus {
  const statutUpper = statut.toUpperCase();
  if (statutUpper.includes('DISPONIBLE') || statutUpper === 'DISPONIBLE') {
    return 'DISPONIBLE';
  }
  if (statutUpper.includes('RESTITU') || statutUpper === 'RESTITUE' || statutUpper === 'RESTITUÉ') {
    return 'RESTITUÉ';
  }
  if (statutUpper.includes('NON_RECLAM') || statutUpper === 'NON_RECLAME' || statutUpper === 'NON_RÉCLAMÉ') {
    return 'NON_RÉCLAMÉ';
  }
  return 'DISPONIBLE'; // Par défaut
}

// Fonction pour calculer les dates selon la période
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

// Fonction de formatage de date déterministe
function formatDateDeterministic(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatDateTimeDeterministic(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Transformer un objet retrouvé de l'API en format liste
function transformObjetRetrouve(objet: any): ObjetRetrouveListItem {
  let dateTrouvaille: Date;
  let dateDepot: Date;
  
  if (objet.dateTrouvaille) {
    dateTrouvaille = new Date(objet.dateTrouvaille);
  } else {
    dateTrouvaille = new Date('2000-01-01');
  }
  
  if (objet.dateDepot) {
    dateDepot = new Date(objet.dateDepot);
  } else {
    dateDepot = new Date('2000-01-01');
  }
  
  return {
    id: objet.id,
    numero: objet.numero || objet.id,
    typeObjet: objet.typeObjet || '',
    description: objet.description || '',
    lieuTrouvaille: objet.lieuTrouvaille || '',
    dateTrouvaille: dateTrouvaille.toISOString().split('T')[0],
    dateDepot: formatDateTimeDeterministic(dateDepot),
    deposant: {
      nom: objet.deposant?.nom || '',
      prenom: objet.deposant?.prenom || '',
      telephone: objet.deposant?.telephone || '',
      email: objet.deposant?.email,
    },
    statut: convertStatut(objet.statut || 'DISPONIBLE'),
    agent: objet.agent ? {
      nom: objet.agent.nom || '',
      prenom: objet.agent.prenom || '',
    } : undefined,
    commissariat: objet.commissariat?.nom || '',
    valeurEstimee: objet.valeurEstimee,
    couleur: objet.couleur,
  };
}

// Calculer les statistiques à partir des objets retrouvés
function calculateStats(objets: any[], totalFromPagination?: number): ObjetRetrouveStats {
  const total = totalFromPagination !== undefined ? totalFromPagination : objets.length;
  const disponibles = objets.filter(o => {
    const statut = (o.statut || '').toUpperCase();
    return statut.includes('DISPONIBLE') || statut === 'DISPONIBLE';
  }).length;
  const restitues = objets.filter(o => {
    const statut = (o.statut || '').toUpperCase();
    return statut.includes('RESTITU') || statut === 'RESTITUE' || statut === 'RESTITUÉ';
  }).length;
  const nonReclames = objets.filter(o => {
    const statut = (o.statut || '').toUpperCase();
    return statut.includes('NON_RECLAM') || statut === 'NON_RECLAME' || statut === 'NON_RÉCLAMÉ';
  }).length;
  const tauxRestitution = total > 0 ? Math.round((restitues / total) * 100 * 10) / 10 : 0;

  return {
    totalObjets: total,
    disponibles,
    restitues,
    nonReclames,
    tauxRestitution,
    evolutionTotal: "0",
    evolutionDisponibles: "0",
    evolutionRestitues: "0",
    evolutionNonReclames: "0",
    evolutionTauxRestitution: "0",
  };
}

export function useObjetsRetrouves(params: UseObjetsRetrouvesParams = {}): UseObjetsRetrouvesReturn {
  const [objets, setObjets] = useState<ObjetRetrouveListItem[]>([]);
  const [stats, setStats] = useState<ObjetRetrouveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseObjetsRetrouvesReturn['pagination']>(null);
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
        } catch (e) {
          // Continuer pour récupérer depuis l'API
        }
      }

      const response = await adminService.getCommissariat(commId);
      if (response.data) {
        const commData = (response.data as any)?.data || response.data;
        setCommissariat(commData as Commissariat);
      }
    } catch (err: any) {
      console.error('Erreur lors de la récupération des informations du commissariat:', err);
    }
  }, []);

  const fetchObjetsRetrouves = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTimeRef.current;
    
    if (pendingRequestRef.current || (timeSinceLastRequest < MIN_REQUEST_DELAY && lastRequestTimeRef.current > 0)) {
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
      
      const delay = MIN_REQUEST_DELAY - timeSinceLastRequest;
      requestTimeoutRef.current = setTimeout(() => {
        fetchObjetsRetrouves();
      }, Math.max(0, delay));
      
      return;
    }
    
    pendingRequestRef.current = true;
    lastRequestTimeRef.current = Date.now();
    setLoading(true);
    setError(null);

    try {
      const commId = getCommissariatId();
      setCommissariatId(commId);
      
      if (commId) {
        const commissariatData = Cookies.get('user_commissariat') || localStorage.getItem('user_commissariat');
        if (!commissariatData || !commissariat) {
          fetchCommissariatInfo(commId);
        }
      }
      
      let dateDebutFilter: string | undefined;
      let dateFinFilter: string | undefined;
      
      if (params.periode === 'personnalise') {
        dateDebutFilter = params.dateDebut;
        dateFinFilter = params.dateFin;
      } else if (params.periode) {
        const dateRange = getDateRange(params.periode);
        dateDebutFilter = dateRange.dateDebut;
        dateFinFilter = dateRange.dateFin;
      }

      const filters: {
        commissariatId?: string;
        statut?: string;
        typeObjet?: string;
        dateDebut?: string;
        dateFin?: string;
        search?: string;
        page?: number;
        limit?: number;
      } = {};
      
      if (commId) {
        filters.commissariatId = commId;
      }
      
      if (params.statut && params.statut !== 'Tous les statuts') {
        filters.statut = params.statut;
      }
      
      if (params.typeObjet && params.typeObjet !== 'Tous les types') {
        filters.typeObjet = params.typeObjet;
      }
      
      if (dateDebutFilter) {
        filters.dateDebut = dateDebutFilter;
      }
      
      if (dateFinFilter) {
        filters.dateFin = dateFinFilter;
      }
      
      if (params.search && params.search.trim()) {
        filters.search = params.search.trim();
      }

      const page = params.page || 1;
      const limit = params.limit || 20;
      filters.page = page;
      filters.limit = limit;

      const statsFilters: {
        commissariatId?: string;
        dateDebut?: string;
        dateFin?: string;
        periode?: string;
      } = {};
      
      if (commId) {
        statsFilters.commissariatId = commId;
      }
      
      if (dateDebutFilter) {
        statsFilters.dateDebut = dateDebutFilter;
      }
      if (dateFinFilter) {
        statsFilters.dateFin = dateFinFilter;
      }
      
      if (params.periode && params.periode !== 'personnalise') {
        statsFilters.periode = params.periode;
      }
      
      console.log('📊 Filtres envoyés à l\'API statistiques:', {
        statsFilters,
        commissariatId: commId,
      });

      const [response, statsResponse] = await Promise.all([
        objetsRetrouvesService.list(filters),
        objetsRetrouvesService.getStatistiques(statsFilters).catch((statsErr: any) => {
          console.warn('⚠️ Erreur lors de la récupération des statistiques:', {
            status: statsErr.response?.status,
            message: statsErr.response?.data?.message || statsErr.message,
            error: statsErr.response?.data?.error,
          });
          return null;
        }),
      ]);
      
      const apiResponseData: any = (response.data as any)?.data || response.data;
      const responsePagination: any = (response.data as any)?.pagination || (response.data as any)?.data?.pagination;
      
      console.log('📦 Réponse API objets retrouvés:', {
        responseData: response.data,
        responsePagination,
        apiResponseData,
      });
      
      if (apiResponseData) {
        let objetsList: any[] = [];
        let paginationData: any = responsePagination;
        
        if (apiResponseData.objets && Array.isArray(apiResponseData.objets)) {
          objetsList = apiResponseData.objets;
        } else if (apiResponseData.data && Array.isArray(apiResponseData.data)) {
          objetsList = apiResponseData.data;
        } else if (Array.isArray(apiResponseData)) {
          objetsList = apiResponseData;
        }
        
        if (!paginationData && apiResponseData.pagination) {
          paginationData = apiResponseData.pagination;
        }
        
        if (!paginationData && apiResponseData.total !== undefined) {
          paginationData = {
            total: apiResponseData.total,
            page: apiResponseData.page || page,
            limit: apiResponseData.limit || limit,
            totalPages: Math.ceil(apiResponseData.total / (apiResponseData.limit || limit))
          };
        }
        
        const transformedObjets = objetsList.map(transformObjetRetrouve);
        setObjets(transformedObjets);

        try {
          const statsData = statsResponse?.data as any;
          
          console.log('📊 Statistiques reçues:', {
            statsResponse,
            statsData,
            hasData: !!statsData,
            dataKeys: statsData ? Object.keys(statsData) : [],
          });
          
          if (statsData && typeof statsData === 'object' && (statsData.total !== undefined || statsData.disponibles !== undefined)) {
            const newStats: ObjetRetrouveStats = {
              totalObjets: Number(statsData.total) || 0,
              disponibles: Number(statsData.disponibles) || 0,
              restitues: Number(statsData.restitues) || 0,
              nonReclames: Number(statsData.nonReclames) || 0,
              tauxRestitution: statsData.tauxRestitution !== undefined && statsData.tauxRestitution !== null
                ? Number(statsData.tauxRestitution)
                : (statsData.total > 0
                    ? Math.round((Number(statsData.restitues) || 0) / Number(statsData.total) * 100 * 10) / 10
                    : 0),
              evolutionTotal: statsData.evolutionTotal !== undefined && statsData.evolutionTotal !== null ? String(statsData.evolutionTotal) : "0",
              evolutionDisponibles: statsData.evolutionDisponibles !== undefined && statsData.evolutionDisponibles !== null ? String(statsData.evolutionDisponibles) : "0",
              evolutionRestitues: statsData.evolutionRestitues !== undefined && statsData.evolutionRestitues !== null ? String(statsData.evolutionRestitues) : "0",
              evolutionNonReclames: statsData.evolutionNonReclames !== undefined && statsData.evolutionNonReclames !== null ? String(statsData.evolutionNonReclames) : "0",
              evolutionTauxRestitution: statsData.evolutionTauxRestitution !== undefined && statsData.evolutionTauxRestitution !== null ? String(statsData.evolutionTauxRestitution) : "0",
            };
            
            console.log('✅ Statistiques mappées et appliquées:', newStats);
            setStats(newStats);
          } else {
            console.warn('⚠️ Aucune donnée de statistiques valide, utilisation du fallback');
            const calculatedStats = calculateStats(objetsList, paginationData?.total);
            setStats(calculatedStats);
          }
        } catch (statsError: any) {
          console.warn('⚠️ Erreur lors du traitement des statistiques, utilisation du fallback:', statsError);
          const calculatedStats = calculateStats(objetsList, paginationData?.total);
          setStats(calculatedStats);
        }

        if (paginationData && typeof paginationData === 'object' && paginationData.page != null) {
          const finalPagination = {
            page: paginationData.page != null ? Number(paginationData.page) : page,
            limit: paginationData.limit != null ? Number(paginationData.limit) : limit,
            total: paginationData.total != null ? Number(paginationData.total) : objetsList.length,
            totalPages: paginationData.totalPages != null ? Number(paginationData.totalPages) : Math.ceil((paginationData.total != null ? Number(paginationData.total) : objetsList.length) / (paginationData.limit != null ? Number(paginationData.limit) : limit)),
          };
          
          setPagination(finalPagination);
        } else {
          const total = objetsList.length;
          const calculatedTotalPages = Math.ceil(total / limit);
          
          setPagination({
            page: 1,
            limit: limit,
            total: total,
            totalPages: calculatedTotalPages,
          });
        }
      }
    } catch (err: any) {
      console.error('❌ Erreur lors du chargement des objets retrouvés:', err);
      console.error('❌ Détails de l\'erreur:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
      });
      
      if (err.response?.status === 429) {
        const retryAfter = err.response?.headers?.['retry-after'] || 5;
        setError(`Trop de requêtes. Veuillez attendre ${retryAfter} secondes avant de réessayer.`);
        
        requestTimeoutRef.current = setTimeout(() => {
          fetchObjetsRetrouves();
        }, retryAfter * 1000);
      } else if (err.response?.status >= 500) {
        const errorMessage = err.response?.data?.message 
          || err.response?.data?.error 
          || `Erreur serveur (${err.response?.status || '500'}). Veuillez réessayer plus tard.`;
        setError(errorMessage);
      } else if (err.response?.status === 404) {
        setError('Ressource non trouvée. Veuillez vérifier vos paramètres.');
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Erreur d\'authentification. Veuillez vous reconnecter.');
      } else {
        const errorMessage = err.response?.data?.message 
          || err.response?.data?.error 
          || err.message 
          || 'Erreur lors du chargement des objets retrouvés';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
      pendingRequestRef.current = false;
    }
  }, [
    params.periode,
    params.dateDebut,
    params.dateFin,
    params.statut,
    params.typeObjet,
    params.search,
    params.page,
    params.limit,
    params.searchKey,
    getCommissariatId,
    fetchCommissariatInfo,
    // commissariat retiré pour éviter la boucle infinie (il est modifié par fetchCommissariatInfo)
  ]);
  
  useEffect(() => {
    return () => {
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchObjetsRetrouves();
  }, [fetchObjetsRetrouves]);

  return {
    objets,
    stats,
    loading,
    error,
    pagination,
    commissariat,
    commissariatId,
    refetch: fetchObjetsRetrouves,
  };
}

export default useObjetsRetrouves;

// Hook simplifié pour utilisation avec les filtres de période
export function useObjetsRetrouvesWithFilters() {
  const [periode, setPeriode] = useState<PeriodKey>('jour');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [activeCustomDateDebut, setActiveCustomDateDebut] = useState<string | undefined>(undefined);
  const [activeCustomDateFin, setActiveCustomDateFin] = useState<string | undefined>(undefined);
  const [searchKey, setSearchKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState('Tous les statuts');
  const [typeFilter, setTypeFilter] = useState('Tous les types');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);
  
  const isCustomDateRange = !!(activeCustomDateDebut && activeCustomDateFin);
  
  const objetsRetrouves = useObjetsRetrouves({
    periode: isCustomDateRange ? 'personnalise' : periode,
    dateDebut: isCustomDateRange ? activeCustomDateDebut : undefined,
    dateFin: isCustomDateRange ? activeCustomDateFin : undefined,
    statut: statusFilter !== 'Tous les statuts' ? statusFilter : undefined,
    typeObjet: typeFilter !== 'Tous les types' ? typeFilter : undefined,
    search: activeSearchTerm || undefined,
    page: currentPage,
    limit: limit,
    searchKey: searchKey,
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
      const dateDebutWithTime = `${dateDebut}T00:00:00`;
      const dateFinWithTime = `${dateFin}T23:59:59`;
      
      setActiveCustomDateDebut(dateDebutWithTime);
      setActiveCustomDateFin(dateFinWithTime);
      setSearchKey(prev => prev + 1);
      setCurrentPage(1);
    } else {
      setActiveCustomDateDebut(undefined);
      setActiveCustomDateFin(undefined);
      setSearchKey(prev => prev + 1);
      setCurrentPage(1);
    }
  };

  const handleSearchSubmit = () => {
    const trimmedSearch = searchTerm.trim();
    setActiveSearchTerm(trimmedSearch || undefined);
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
    ...objetsRetrouves,
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

