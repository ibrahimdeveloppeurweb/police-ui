'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Cookies from 'js-cookie';
import { objetsPerdusService, adminService, type ObjetPerdu, type Commissariat } from '@/lib/api/services';

// Types pour la page de liste
export type ObjetPerduStatus = 'EN_RECHERCHE' | 'RETROUVÉ' | 'CLÔTURÉ';
export type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'personnalise';

export interface ObjetPerduListItem {
  id: string;
  numero: string;
  typeObjet: string;
  description: string;
  lieuPerte: string;
  datePerte: string;
  dateDeclaration: string;
  declarant: {
    nom: string;
    prenom: string;
    telephone: string;
    email?: string;
  };
  statut: ObjetPerduStatus;
  agent?: {
    nom: string;
    prenom: string;
  };
  commissariat?: string;
  valeurEstimee?: string;
  couleur?: string;
}

export interface ObjetPerduStats {
  totalObjets: number;
  enRecherche: number;
  retrouves: number;
  clotures: number;
  tauxRetrouve: number;
  evolutionTotal?: string;
  evolutionEnRecherche?: string;
  evolutionRetrouves?: string;
  evolutionClotures?: string;
  evolutionTauxRetrouve?: string;
}

interface UseObjetsPerdusParams {
  periode?: PeriodKey;
  dateDebut?: string;
  dateFin?: string;
  statut?: string;
  typeObjet?: string;
  search?: string;
  page?: number;
  limit?: number;
  searchKey?: number; // Clé pour forcer le rechargement
}

interface UseObjetsPerdusReturn {
  objets: ObjetPerduListItem[];
  stats: ObjetPerduStats | null;
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
function convertStatut(statut: string): ObjetPerduStatus {
  const statutUpper = statut.toUpperCase();
  if (statutUpper.includes('RECHERCHE') || statutUpper === 'EN_RECHERCHE') {
    return 'EN_RECHERCHE';
  }
  if (statutUpper.includes('RETROUV') || statutUpper === 'RETROUVE' || statutUpper === 'RETROUVÉ') {
    return 'RETROUVÉ';
  }
  if (statutUpper.includes('CLOTUR') || statutUpper === 'CLOTURE' || statutUpper === 'CLÔTURÉ') {
    return 'CLÔTURÉ';
  }
  return 'EN_RECHERCHE'; // Par défaut
}

// Fonction pour calculer les dates selon la période
function getDateRange(periode: PeriodKey): { dateDebut?: string; dateFin?: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Helper pour formater une date avec heure précise
  const formatDateWithTime = (date: Date, isEndOfDay: boolean = false): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const time = isEndOfDay ? '23:59:59' : '00:00:00';
    return `${year}-${month}-${day}T${time}`;
  };
  
  switch (periode) {
    case 'jour':
      // Aujourd'hui de 00:00:00 à 23:59:59
      return {
        dateDebut: formatDateWithTime(today, false),
        dateFin: formatDateWithTime(today, true),
      };
    case 'semaine':
      // Du lundi de cette semaine à aujourd'hui
      const weekStart = new Date(today);
      const dayOfWeek = today.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      weekStart.setDate(today.getDate() - daysToMonday);
      return {
        dateDebut: formatDateWithTime(weekStart, false),
        dateFin: formatDateWithTime(today, true),
      };
    case 'mois':
      // Du 1er jour du mois en cours à aujourd'hui
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        dateDebut: formatDateWithTime(monthStart, false),
        dateFin: formatDateWithTime(today, true),
      };
    case 'annee':
      // Du 1er janvier de l'année en cours à aujourd'hui
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

// Fonction de formatage de date déterministe pour éviter les problèmes d'hydratation
function formatDateDeterministic(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

function formatDateTimeDeterministic(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

// Transformer un objet perdu de l'API en format liste
function transformObjetPerdu(objet: any): ObjetPerduListItem {
  // Utiliser une date par défaut seulement si nécessaire, mais éviter new Date() pour l'hydratation
  let datePerte: Date
  let dateDeclaration: Date
  
  if (objet.datePerte) {
    datePerte = new Date(objet.datePerte)
  } else {
    // Utiliser une date fixe par défaut pour éviter les problèmes d'hydratation
    datePerte = new Date('2000-01-01')
  }
  
  if (objet.dateDeclaration) {
    dateDeclaration = new Date(objet.dateDeclaration)
  } else {
    // Utiliser une date fixe par défaut pour éviter les problèmes d'hydratation
    dateDeclaration = new Date('2000-01-01')
  }
  
  return {
    id: objet.id,
    numero: objet.numero || objet.id,
    typeObjet: objet.typeObjet || '',
    description: objet.description || '',
    lieuPerte: objet.lieuPerte || '',
    datePerte: datePerte.toISOString().split('T')[0],
    dateDeclaration: formatDateTimeDeterministic(dateDeclaration),
    declarant: {
      nom: objet.declarant?.nom || '',
      prenom: objet.declarant?.prenom || '',
      telephone: objet.declarant?.telephone || '',
      email: objet.declarant?.email,
    },
    statut: convertStatut(objet.statut || 'EN_RECHERCHE'),
    agent: objet.agent ? {
      nom: objet.agent.nom || '',
      prenom: objet.agent.prenom || '',
    } : undefined,
    commissariat: objet.commissariat?.nom || '',
    valeurEstimee: objet.valeurEstimee,
    couleur: objet.couleur,
  };
}

// Calculer les statistiques à partir des objets perdus
function calculateStats(objets: any[], totalFromPagination?: number): ObjetPerduStats {
  const total = totalFromPagination !== undefined ? totalFromPagination : objets.length;
  const enRecherche = objets.filter(o => {
    const statut = (o.statut || '').toUpperCase();
    return statut.includes('RECHERCHE') || statut === 'EN_RECHERCHE';
  }).length;
  const retrouves = objets.filter(o => {
    const statut = (o.statut || '').toUpperCase();
    return statut.includes('RETROUV') || statut === 'RETROUVE' || statut === 'RETROUVÉ';
  }).length;
  const clotures = objets.filter(o => {
    const statut = (o.statut || '').toUpperCase();
    return statut.includes('CLOTUR') || statut === 'CLOTURE' || statut === 'CLÔTURÉ';
  }).length;
  const tauxRetrouve = total > 0 ? Math.round((retrouves / total) * 100 * 10) / 10 : 0;

  return {
    totalObjets: total,
    enRecherche,
    retrouves,
    clotures,
    tauxRetrouve,
    evolutionTotal: "0",
    evolutionEnRecherche: "0",
    evolutionRetrouves: "0",
    evolutionClotures: "0",
    evolutionTauxRetrouve: "0",
  };
}

export function useObjetsPerdus(params: UseObjetsPerdusParams = {}): UseObjetsPerdusReturn {
  const [objets, setObjets] = useState<ObjetPerduListItem[]>([]);
  const [stats, setStats] = useState<ObjetPerduStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseObjetsPerdusReturn['pagination']>(null);
  const [commissariat, setCommissariat] = useState<Commissariat | null>(null);
  const [commissariatId, setCommissariatId] = useState<string | null>(null);
  
  // Refs pour gérer le throttling
  const lastRequestTimeRef = useRef<number>(0);
  const requestTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingRequestRef = useRef<boolean>(false);
  
  const MIN_REQUEST_DELAY = 500;

  const getCommissariatId = useCallback((): string | null => {
    try {
      // Essayer d'abord commissariat_id (le bon nom stocké lors du login)
      const directId = Cookies.get('commissariat_id') || localStorage.getItem('commissariat_id');
      if (directId) return directId;

      // Fallback sur l'ancien nom pour compatibilité
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

  // Récupérer les informations du commissariat
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

  const fetchObjetsPerdus = useCallback(async () => {
    // Gérer le throttling
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTimeRef.current;
    
    if (pendingRequestRef.current || (timeSinceLastRequest < MIN_REQUEST_DELAY && lastRequestTimeRef.current > 0)) {
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
      
      const delay = MIN_REQUEST_DELAY - timeSinceLastRequest;
      requestTimeoutRef.current = setTimeout(() => {
        fetchObjetsPerdus();
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
      
      // Préparer les filtres de dates selon la période
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

      // Construire les filtres
      const filters: {
        page?: number;
        limit?: number;
        statut?: string;
        typeObjet?: string;
        dateDebut?: string;
        dateFin?: string;
        search?: string;
        commissariatId?: string;
      } = {};
      
      // Toujours inclure le commissariat si disponible
      if (commId) {
        filters.commissariatId = commId;
      }
      
      if (dateDebutFilter) {
        filters.dateDebut = dateDebutFilter;
      }
      
      if (dateFinFilter) {
        filters.dateFin = dateFinFilter;
      }
      
      // Filtre par statut
      if (params.statut && params.statut !== 'Tous les statuts') {
        // Mapper les statuts de l'interface vers l'API
        const statutMap: Record<string, string> = {
          'EN RECHERCHE': 'EN_RECHERCHE',
          'RETROUVÉ': 'RETROUVÉ',
          'CLÔTURÉ': 'CLÔTURÉ',
        };
        filters.statut = statutMap[params.statut] || params.statut;
      }
      
      // Filtre par type d'objet
      if (params.typeObjet && params.typeObjet !== 'Tous les types') {
        filters.typeObjet = params.typeObjet;
      }
      
      // Filtre de recherche textuelle
      if (params.search && params.search.trim()) {
        filters.search = params.search.trim();
      }

      const page = params.page || 1;
      const limit = params.limit || 20;
      filters.page = page;
      filters.limit = limit;

      console.log('📦 Filtres envoyés à l\'API objets perdus:', {
        filters,
        commissariatId: commId,
      });

      // Préparer les filtres pour les statistiques
      const statsFilters: {
        commissariatId?: string;
        dateDebut?: string;
        dateFin?: string;
        periode?: string;
      } = {};
      
      // Ajouter le commissariatId aux filtres de statistiques
      if (commId) {
        statsFilters.commissariatId = commId;
      }
      
      if (dateDebutFilter) {
        statsFilters.dateDebut = dateDebutFilter;
      }
      if (dateFinFilter) {
        statsFilters.dateFin = dateFinFilter;
      }
      // Ajouter le type de période pour le calcul d'évolution
      if (params.periode && params.periode !== 'personnalise') {
        statsFilters.periode = params.periode;
      }
      
      console.log('📊 Filtres envoyés à l\'API statistiques:', {
        statsFilters,
        commissariatId: commId,
      });

      // Récupérer les objets perdus et les statistiques en parallèle
      const [response, statsResponse] = await Promise.all([
        objetsPerdusService.list(filters),
        objetsPerdusService.getStatistiques(statsFilters).catch((statsErr: any) => {
          // Logger l'erreur mais ne pas bloquer le chargement des objets
          console.warn('⚠️ Erreur lors de la récupération des statistiques:', {
            status: statsErr.response?.status,
            message: statsErr.response?.data?.message || statsErr.message,
            error: statsErr.response?.data?.error,
          });
          // Retourner null pour indiquer que les stats ont échoué
          return null;
        }),
      ]);
      
      // Traiter la réponse
      const apiResponseData: any = (response.data as any)?.data || response.data;
      const responsePagination: any = (response.data as any)?.pagination || (response.data as any)?.data?.pagination;
      
      console.log('📦 Réponse API objets perdus:', {
        responseData: response.data,
        responsePagination,
        apiResponseData,
      });
      
      if (apiResponseData) {
        let objetsList: any[] = [];
        let paginationData: any = responsePagination;
        
        // Extraire les objets
        if (apiResponseData.objets && Array.isArray(apiResponseData.objets)) {
          objetsList = apiResponseData.objets;
        } else if (apiResponseData.data && Array.isArray(apiResponseData.data)) {
          objetsList = apiResponseData.data;
        } else if (Array.isArray(apiResponseData)) {
          objetsList = apiResponseData;
        }
        
        // Si pas de pagination dans responsePagination, essayer depuis apiResponseData
        if (!paginationData && apiResponseData.pagination) {
          paginationData = apiResponseData.pagination;
        }
        
        // Si toujours pas de pagination, calculer depuis les données
        if (!paginationData && apiResponseData.total !== undefined) {
          paginationData = {
            total: apiResponseData.total,
            page: apiResponseData.page || page,
            limit: apiResponseData.limit || limit,
            totalPages: Math.ceil(apiResponseData.total / (apiResponseData.limit || limit))
          };
        }
        
        // Transformer les objets
        const transformedObjets = objetsList.map(transformObjetPerdu);
        setObjets(transformedObjets);

        // Traiter les statistiques
        // Si les statistiques échouent, utiliser le fallback sans bloquer le chargement des objets
        try {
          // L'ApiClient retourne { success: true, data: T }
          // Le backend retourne { data: { total, enRecherche, retrouves, clotures, tauxRetrouve } }
          // Donc statsResponse.data contient directement les statistiques
          const statsData = statsResponse?.data as any;
          
          console.log('📊 Statistiques reçues:', {
            statsResponse,
            statsData,
            hasData: !!statsData,
            dataKeys: statsData ? Object.keys(statsData) : [],
          });
          
          if (statsData && typeof statsData === 'object' && (statsData.total !== undefined || statsData.enRecherche !== undefined)) {
            const newStats: ObjetPerduStats = {
              totalObjets: Number(statsData.total) || 0,
              enRecherche: Number(statsData.enRecherche) || 0,
              retrouves: Number(statsData.retrouves) || 0,
              clotures: Number(statsData.clotures) || 0,
              tauxRetrouve: statsData.tauxRetrouve !== undefined && statsData.tauxRetrouve !== null
                ? Number(statsData.tauxRetrouve)
                : (statsData.total > 0
                    ? Math.round((Number(statsData.retrouves) || 0) / Number(statsData.total) * 100 * 10) / 10
                    : 0),
              evolutionTotal: statsData.evolutionTotal !== undefined && statsData.evolutionTotal !== null ? String(statsData.evolutionTotal) : "0",
              evolutionEnRecherche: statsData.evolutionEnRecherche !== undefined && statsData.evolutionEnRecherche !== null ? String(statsData.evolutionEnRecherche) : "0",
              evolutionRetrouves: statsData.evolutionRetrouves !== undefined && statsData.evolutionRetrouves !== null ? String(statsData.evolutionRetrouves) : "0",
              evolutionClotures: statsData.evolutionClotures !== undefined && statsData.evolutionClotures !== null ? String(statsData.evolutionClotures) : "0",
              evolutionTauxRetrouve: statsData.evolutionTauxRetrouve !== undefined && statsData.evolutionTauxRetrouve !== null ? String(statsData.evolutionTauxRetrouve) : "0",
            };
            
            console.log('✅ Statistiques mappées et appliquées:', newStats);
            setStats(newStats);
          } else {
            console.warn('⚠️ Aucune donnée de statistiques valide, utilisation du fallback');
            // Fallback: calculer depuis les objets récupérés
            const calculatedStats = calculateStats(objetsList, paginationData?.total);
            setStats(calculatedStats);
          }
        } catch (statsError: any) {
          console.warn('⚠️ Erreur lors du traitement des statistiques, utilisation du fallback:', statsError);
          // Fallback: calculer depuis les objets récupérés
          const calculatedStats = calculateStats(objetsList, paginationData?.total);
          setStats(calculatedStats);
        }

        // Gérer la pagination
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
      console.error('❌ Erreur lors du chargement des objets perdus:', err);
      console.error('❌ Détails de l\'erreur:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
      });
      
      // Gérer spécifiquement l'erreur 429 (Too Many Requests)
      if (err.response?.status === 429) {
        const retryAfter = err.response?.headers?.['retry-after'] || 5;
        setError(`Trop de requêtes. Veuillez attendre ${retryAfter} secondes avant de réessayer.`);
        
        requestTimeoutRef.current = setTimeout(() => {
          fetchObjetsPerdus();
        }, retryAfter * 1000);
      } else if (err.response?.status >= 500) {
        // Erreur serveur (500, 502, 503, etc.)
        const errorMessage = err.response?.data?.message 
          || err.response?.data?.error 
          || `Erreur serveur (${err.response?.status || '500'}). Veuillez réessayer plus tard.`;
        setError(errorMessage);
        console.error('🚨 Erreur serveur détectée:', errorMessage);
      } else if (err.response?.status === 404) {
        // Ressource non trouvée
        setError('Ressource non trouvée. Veuillez vérifier vos paramètres.');
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        // Erreur d'authentification/autorisation
        setError('Erreur d\'authentification. Veuillez vous reconnecter.');
      } else {
        // Autres erreurs
        const errorMessage = err.response?.data?.message 
          || err.response?.data?.error 
          || err.message 
          || 'Erreur lors du chargement des objets perdus';
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
  ]);
  
  // Nettoyer le timeout à la destruction du composant
  useEffect(() => {
    return () => {
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchObjetsPerdus();
  }, [fetchObjetsPerdus]);

  return {
    objets,
    stats,
    loading,
    error,
    pagination,
    commissariat,
    commissariatId,
    refetch: fetchObjetsPerdus,
  };
}

export default useObjetsPerdus;

// Hook simplifié pour utilisation avec les filtres de période
export function useObjetsPerdusWithFilters() {
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
  
  const objetsPerdus = useObjetsPerdus({
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
    ...objetsPerdus,
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

