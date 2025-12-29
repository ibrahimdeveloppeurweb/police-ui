'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Cookies from 'js-cookie';
import { alertesService, adminService, type AlerteSecuritaire, type FilterAlertes, type Commissariat } from '@/lib/api/services';
import { StatutAlerte, NiveauAlerte } from '@/lib/api/services';

// Types pour la page de liste
export type AlertStatus = 'En cours' | 'Résolue' | 'Archivée';
export type AlertSeverity = 'Critique' | 'Élevée' | 'Moyenne' | 'Faible';
export type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise';

export interface AlertListItem {
  id: string;
  date: string;
  heure: string;
  type: string;
  lieu: string;
  severite: AlertSeverity;
  agent: string;
  statut: AlertStatus;
  description: string;
  titre?: string;
  numero?: string;
  dateCloture?: string;
  dateResolution?: string;
  diffusee?: boolean;
  dateDiffusion?: string;
  typeDiffusion?: string;
  villeDiffusion?: string;
  commissariatNom?: string;
}

export interface AlertStats {
  totalAlertes: number;
  enCours: number;
  resolues: number;
  archivees: number;
  tauxResolution: number;
  evolutionAlertes: string;
  evolutionResolution: string;
  tempsReponse: string;
}

interface UseAlertesParams {
  periode?: PeriodKey;
  dateDebut?: string;
  dateFin?: string;
  statut?: string;
  niveau?: string;
  search?: string;
  page?: number;
  limit?: number;
  searchKey?: number; // Clé pour forcer le rechargement
}

interface UseAlertesReturn {
  alerts: AlertListItem[];
  stats: AlertStats | null;
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

// Fonction pour convertir les enums backend vers les formats frontend
function convertStatut(statut: StatutAlerte): AlertStatus {
  const mapping: Record<StatutAlerte, AlertStatus> = {
    [StatutAlerte.ACTIVE]: 'En cours',
    [StatutAlerte.RESOLUE]: 'Résolue',
    [StatutAlerte.ARCHIVEE]: 'Archivée',
  };
  return mapping[statut] || 'En cours';
}

function convertSeverite(niveau: NiveauAlerte): AlertSeverity {
  const mapping: Record<NiveauAlerte, AlertSeverity> = {
    [NiveauAlerte.CRITIQUE]: 'Critique',
    [NiveauAlerte.ELEVE]: 'Élevée',
    [NiveauAlerte.MOYEN]: 'Moyenne',
    [NiveauAlerte.FAIBLE]: 'Faible',
  };
  return mapping[niveau] || 'Moyenne';
}

function formatTypeAlerte(type: string): string {
  const typeMap: Record<string, string> = {
    VEHICULE_VOLE: 'Vol signalé',
    SUSPECT_RECHERCHE: 'Suspect recherché',
    URGENCE_SECURITE: 'Urgence sécurité',
    ALERTE_GENERALE: 'Alerte générale',
    MAINTENANCE_SYSTEME: 'Maintenance système',
    ACCIDENT: 'Accident de circulation',
    INCENDIE: 'Incendie',
    AGGRESSION: 'Agression',
    AUTRE: 'Autre',
  };
  return typeMap[type] || type;
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
      // En France, la semaine commence le lundi (jour 1)
      const dayOfWeek = today.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Si dimanche (0), reculer de 6 jours, sinon (dayOfWeek - 1)
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
    case 'tout':
    case 'personnalise':
      return {};
    default:
      return {};
  }
}

// Transformer une alerte de l'API en format liste
function transformAlerte(alerte: any): AlertListItem {
  const dateAlerte = new Date(alerte.dateAlerte);
  
  // Extraire les informations de diffusion
  let typeDiffusion = 'Non diffusée';
  let villeDiffusion = '';
  let commissariatNom = '';
  
  if (alerte.diffusee && alerte.diffusionDestinataires) {
    if (alerte.diffusionDestinataires.diffusionGenerale) {
      typeDiffusion = 'Générale';
      villeDiffusion = 'Toutes les villes';
    } else if (alerte.diffusionDestinataires.commissariatsIds && alerte.diffusionDestinataires.commissariatsIds.length > 0) {
      typeDiffusion = 'Ciblée';
      villeDiffusion = `${alerte.diffusionDestinataires.commissariatsIds.length} commissariat(s)`;
    }
  }
  
  // Nom et ville du commissariat
  if (alerte.commissariat) {
    commissariatNom = alerte.commissariat.nom || '';
    villeDiffusion = villeDiffusion || alerte.commissariat.ville || '';
  }
  
  return {
    id: alerte.id,
    numero: alerte.numero || alerte.id,
    date: dateAlerte.toLocaleDateString('fr-FR'),
    heure: dateAlerte.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    type: formatTypeAlerte(alerte.type),
    lieu: alerte.localisation || alerte.lieu || 'Non spécifié',
    severite: convertSeverite(alerte.niveau),
    agent: alerte.agent ? `${alerte.agent.prenom || ''} ${alerte.agent.nom || ''}`.trim() : 'Non assigné',
    statut: convertStatut(alerte.statut),
    description: alerte.description || '',
    titre: alerte.titre || '',
    dateCloture: alerte.dateCloture ? new Date(alerte.dateCloture).toISOString() : undefined,
    dateResolution: alerte.dateResolution ? new Date(alerte.dateResolution).toISOString() : undefined,
    diffusee: alerte.diffusee || false,
    dateDiffusion: alerte.dateDiffusion ? new Date(alerte.dateDiffusion).toLocaleDateString('fr-FR') + ' ' + new Date(alerte.dateDiffusion).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '',
    typeDiffusion,
    villeDiffusion,
    commissariatNom,
  };
}

// Calculer les statistiques à partir des alertes
function calculateStats(alertes: any[], totalFromPagination?: number): AlertStats {
  const total = totalFromPagination !== undefined ? totalFromPagination : alertes.length;
  const enCours = alertes.filter(a => a.statut === StatutAlerte.ACTIVE).length;
  const resolues = alertes.filter(a => a.statut === StatutAlerte.RESOLUE).length;
  const archivees = alertes.filter(a => a.statut === StatutAlerte.ARCHIVEE).length;
  const tauxResolution = total > 0 ? Math.round((resolues / total) * 100 * 10) / 10 : 0;

  // Calculer le temps de réponse moyen (simplifié)
  const alertesResolues = alertes.filter(a => a.statut === StatutAlerte.RESOLUE && a.dateResolution);
  let tempsReponse = 'N/A';
  if (alertesResolues.length > 0) {
    const tempsMoyen = alertesResolues.reduce((sum, a) => {
      if (a.dateResolution) {
        const diff = new Date(a.dateResolution).getTime() - new Date(a.dateAlerte).getTime();
        return sum + diff / (1000 * 60); // en minutes
      }
      return sum;
    }, 0) / alertesResolues.length;
    tempsReponse = `${Math.round(tempsMoyen)} min`;
  }

  return {
    totalAlertes: total,
    enCours,
    resolues,
    archivees,
    tauxResolution,
    evolutionAlertes: '+0%', // À calculer si on a les données de période précédente
    evolutionResolution: '+0%', // À calculer si on a les données de période précédente
    tempsReponse,
  };
}

export function useAlertes(params: UseAlertesParams = {}): UseAlertesReturn {
  const [alerts, setAlerts] = useState<AlertListItem[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseAlertesReturn['pagination']>(null);
  const [commissariat, setCommissariat] = useState<Commissariat | null>(null);
  const [commissariatId, setCommissariatId] = useState<string | null>(null);
  
  // Refs pour gérer le throttling et éviter les requêtes trop fréquentes
  const lastRequestTimeRef = useRef<number>(0);
  const requestTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingRequestRef = useRef<boolean>(false);
  
  // Délai minimum entre les requêtes (500ms pour éviter le rate limiting)
  const MIN_REQUEST_DELAY = 500;

  const getCommissariatId = useCallback((): string | null => {
    try {
      const directId = Cookies.get('user_commissariat_id') || localStorage.getItem('user_commissariat_id');
      if (directId) return directId;

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
      // Essayer d'abord depuis les cookies/localStorage
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

      // Récupérer depuis l'API si pas dans le cache
      const response = await adminService.getCommissariat(commId);
      if (response.data) {
        const commData = (response.data as any)?.data || response.data;
        setCommissariat(commData as Commissariat);
      }
    } catch (err: any) {
      console.error('Erreur lors de la récupération des informations du commissariat:', err);
      // Ne pas bloquer l'affichage si on ne peut pas récupérer les infos du commissariat
    }
  }, []);

  const fetchAlertes = useCallback(async () => {
    // Gérer le throttling pour éviter le rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTimeRef.current;
    
    // Si une requête est en attente ou si on est trop proche de la dernière requête, on la diffère
    if (pendingRequestRef.current || (timeSinceLastRequest < MIN_REQUEST_DELAY && lastRequestTimeRef.current > 0)) {
      // Annuler le timeout précédent s'il existe
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
      
      // Programmer la requête après le délai minimum
      const delay = MIN_REQUEST_DELAY - timeSinceLastRequest;
      requestTimeoutRef.current = setTimeout(() => {
        fetchAlertes();
      }, Math.max(0, delay));
      
      return;
    }
    
    // Marquer qu'une requête est en cours
    pendingRequestRef.current = true;
    lastRequestTimeRef.current = Date.now();
    setLoading(true);
    setError(null);

    try {
      const commId = getCommissariatId();
      setCommissariatId(commId);
      
      // Récupérer les informations du commissariat en parallèle (mais seulement si pas déjà chargé)
      if (commId) {
        // Vérifier si on a déjà les infos du commissariat en cache
        const commissariatData = Cookies.get('user_commissariat') || localStorage.getItem('user_commissariat');
        if (!commissariatData || !commissariat) {
          fetchCommissariatInfo(commId);
        }
      }
      
      // Préparer les filtres de dates selon la période
      let dateDebutFilter: string | undefined;
      let dateFinFilter: string | undefined;
      
      if (params.periode === 'tout') {
        // Pour "tout", ne pas envoyer de filtres de dates
        dateDebutFilter = undefined;
        dateFinFilter = undefined;
      } else if (params.periode === 'personnalise') {
        // Pour période personnalisée, utiliser les dates fournies
        dateDebutFilter = params.dateDebut;
        dateFinFilter = params.dateFin;
      } else if (params.periode) {
        // Pour les autres périodes (jour, semaine, mois, annee), calculer les dates
        const dateRange = getDateRange(params.periode);
        dateDebutFilter = dateRange.dateDebut;
        dateFinFilter = dateRange.dateFin;
      }

      // Construire les filtres en nettoyant les valeurs undefined
      const filters: FilterAlertes = {};
      
      // Toujours inclure le commissariat si disponible
      if (commId) {
        filters.commissariatId = commId;
      }
      
      // Filtre par statut
      if (params.statut && Object.values(StatutAlerte).includes(params.statut as StatutAlerte)) {
        filters.statut = params.statut as StatutAlerte;
      }
      
      // Filtre par niveau/sévérité
      if (params.niveau && Object.values(NiveauAlerte).includes(params.niveau as NiveauAlerte)) {
        filters.niveau = params.niveau as NiveauAlerte;
      }
      
      // Filtres de dates (seulement si définis)
      if (dateDebutFilter) {
        filters.dateDebut = dateDebutFilter;
      }
      
      if (dateFinFilter) {
        filters.dateFin = dateFinFilter;
      }
      
      // Filtre de recherche textuelle
      if (params.search && params.search.trim()) {
        filters.search = params.search.trim();
      }

      const page = params.page || 1;
      const limit = params.limit || 20;

      // Préparer les filtres pour les statistiques (inclure aussi statut et niveau si filtrés)
      const statsFilters: { commissariatId?: string; dateDebut?: string; dateFin?: string; periode?: string } = {};
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
      if (params.periode && params.periode !== 'tout' && params.periode !== 'personnalise') {
        statsFilters.periode = params.periode;
      }

      // Récupérer les alertes et les statistiques en parallèle
      const [response, statsResponse] = await Promise.all([
        alertesService.getAll(filters, page, limit),
        alertesService.getStatistiques(statsFilters).catch(() => null), // En cas d'erreur, continuer sans stats
      ]);
      
      // Traiter la réponse des alertes
      // Structure API: { success: true, data: { data: [...], pagination: {...} } }
      // La pagination peut être dans response.data.pagination OU response.data.data.pagination
      const responsePagination: any = (response.data as any)?.pagination || (response.data as any)?.data?.pagination;
      const apiResponseData: any = (response.data as any)?.data || response.data;
      
      console.log('🔍 Extraction pagination - Structure API:', {
        responseData: response.data,
        responsePagination,
        apiResponseData,
        hasPaginationInResponseData: !!(response.data as any)?.pagination,
        hasPaginationInResponseDataData: !!(response.data as any)?.data?.pagination,
        'responsePagination utilisé pour pagination': responsePagination,
      });
      
      if (apiResponseData) {
        // Extraire les alertes et la pagination
        let alertesList: any[] = [];
        // La pagination peut être dans un objet séparé ou directement dans apiResponseData
        let paginationData: any = responsePagination;
        
        // Si responsePagination n'existe pas, essayer depuis apiResponseData
        if (!paginationData && apiResponseData.pagination) {
          paginationData = apiResponseData.pagination;
        }
        
        // Si toujours pas de pagination, vérifier si total/page/limit sont directement dans apiResponseData
        if (!paginationData && apiResponseData.total !== undefined) {
          paginationData = {
            total: apiResponseData.total,
            page: apiResponseData.page,
            limit: apiResponseData.limit,
            totalPages: Math.ceil(apiResponseData.total / (apiResponseData.limit || 20))
          };
        }
        
        console.log('✅ Utilisation DIRECTE de responsePagination pour la pagination (sans .pagination):', {
          responsePagination,
          paginationData,
        });
        
        // Extraire les alertes
        if (apiResponseData.alertes && Array.isArray(apiResponseData.alertes)) {
          // Structure du backend: { alertes: [...], total: X, page: X, limit: X }
          alertesList = apiResponseData.alertes;
        } else if (apiResponseData.data && Array.isArray(apiResponseData.data)) {
          // Structure alternative: { data: [...], pagination: {...} }
          alertesList = apiResponseData.data;
        } else if (Array.isArray(apiResponseData)) {
          // Si c'est directement un tableau
          alertesList = apiResponseData;
        }
        
        console.log('🔍 Extraction pagination depuis API:', {
          responseDataStructure: {
            hasResponseData: !!response.data,
            hasResponseDataData: !!(response.data as any)?.data,
            apiResponseDataKeys: Object.keys(apiResponseData || {}),
            apiResponseDataType: Array.isArray(apiResponseData) ? 'array' : 'object',
            hasDataProperty: !!apiResponseData?.data,
            hasPagination: !!apiResponseData?.pagination,
          },
          paginationDataExtracted: paginationData,
          paginationDataKeys: paginationData ? Object.keys(paginationData) : [],
          fullResponse: response.data
        });
        
        // Debug: Vérifier la structure de la réponse et la pagination
        console.log('🔍 Structure réponse API:', {
          hasDataArray: Array.isArray(apiResponseData),
          hasDataProperty: !!apiResponseData?.data,
          hasPagination: !!apiResponseData?.pagination,
          paginationDataRaw: paginationData,
          paginationDataKeys: paginationData ? Object.keys(paginationData) : [],
          responseStructure: apiResponseData ? Object.keys(apiResponseData) : [],
          fullResponseData: apiResponseData
        });

        // Transformer les alertes
        const transformedAlerts = alertesList.map(transformAlerte);
        setAlerts(transformedAlerts);

        // Traiter les statistiques
        const statsData = (statsResponse?.data as any)?.data || statsResponse?.data;
        if (statsData) {
          const tempsMoyen = statsData.tempsMoyenResolution 
            ? `${Math.round(statsData.tempsMoyenResolution * 60)} min`
            : 'N/A';
          
          setStats({
            totalAlertes: statsData.total || 0,
            enCours: statsData.actives || 0,
            resolues: statsData.resolues || 0,
            archivees: statsData.archivees || 0,
            tauxResolution: statsData.total > 0 
              ? Math.round((statsData.resolues / statsData.total) * 100 * 10) / 10 
              : 0,
            evolutionAlertes: statsData.evolutionAlertes || '+0%',
            evolutionResolution: statsData.evolutionResolution || '+0%',
            tempsReponse: tempsMoyen,
          });
        } else {
          // Fallback: calculer depuis les alertes récupérées
          const calculatedStats = calculateStats(alertesList, paginationData?.total);
          setStats(calculatedStats);
        }

        // Gérer la pagination - UTILISER DIRECTEMENT responsePagination (qui vient de response.data.pagination ou response.data.data.pagination)
        // paginationData = responsePagination, donc on utilise directement les valeurs sans chercher .pagination
        if (paginationData && typeof paginationData === 'object' && paginationData.page != null) {
          // UTILISER DIRECTEMENT l'objet pagination (responsePagination) - juste convertir en nombres si nécessaire
          const finalPagination = {
            page: paginationData.page != null ? Number(paginationData.page) : (page || 1),
            limit: paginationData.limit != null ? Number(paginationData.limit) : 20,
            total: paginationData.total != null ? Number(paginationData.total) : alertesList.length,
            totalPages: paginationData.totalPages != null ? Number(paginationData.totalPages) : Math.ceil((paginationData.total != null ? Number(paginationData.total) : alertesList.length) / (paginationData.limit != null ? Number(paginationData.limit) : 20)),
          };
          
          console.log('✅ Pagination UTILISÉE DIRECTEMENT depuis responsePagination (sans .pagination):', {
            responsePaginationOriginal: responsePagination,
            paginationDataUtilisé: paginationData,
            finalPagination,
            pageFromAPI: paginationData.page,
            limitFromAPI: paginationData.limit,
            totalFromAPI: paginationData.total,
            totalPagesFromAPI: paginationData.totalPages,
          });
          
          setPagination(finalPagination);
        } else {
          const total = alertesList.length;
          const calculatedTotalPages = Math.ceil(total / 20);
          
          const fallbackPagination = {
            page: 1,
            limit: 20, // Toujours 20
            total: total,
            totalPages: calculatedTotalPages,
          };
          
          console.log('✅ Pagination fallback dans useAlertes:', fallbackPagination);
          
          setPagination(fallbackPagination);
        }
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement des alertes:', err);
      
      // Gérer spécifiquement l'erreur 429 (Too Many Requests)
      if (err.response?.status === 429) {
        const retryAfter = err.response?.headers?.['retry-after'] || 5;
        setError(`Trop de requêtes. Veuillez attendre ${retryAfter} secondes avant de réessayer.`);
        
        // Programmer une nouvelle tentative après le délai
        requestTimeoutRef.current = setTimeout(() => {
          fetchAlertes();
        }, retryAfter * 1000);
      } else {
        setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des alertes');
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
    params.niveau,
    params.search,
    params.page,
    params.limit,
    params.searchKey, // Ajouter searchKey pour forcer le rechargement
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
    fetchAlertes();
  }, [fetchAlertes]);

  return {
    alerts,
    stats,
    loading,
    error,
    pagination,
    commissariat,
    commissariatId,
    refetch: fetchAlertes,
  };
}

export default useAlertes;

// Hook simplifié pour utilisation avec les filtres de période (similaire à useDashboardWithFilters)
export function useAlertesWithFilters() {
  const [periode, setPeriode] = useState<PeriodKey>('jour');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  // Dates actives utilisées pour la recherche (seulement après clic sur "Rechercher")
  const [activeCustomDateDebut, setActiveCustomDateDebut] = useState<string | undefined>(undefined);
  const [activeCustomDateFin, setActiveCustomDateFin] = useState<string | undefined>(undefined);
  // Compteur pour forcer le rechargement même si les dates sont identiques
  const [searchKey, setSearchKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState('Tous les statuts');
  const [severityFilter, setSeverityFilter] = useState('Toutes les sévérités');
  const [searchTerm, setSearchTerm] = useState('');
  // Terme de recherche actif utilisé pour l'API (seulement après clic sur "Rechercher")
  const [activeSearchTerm, setActiveSearchTerm] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);
  
  // Ne pas réinitialiser automatiquement les dates actives quand les champs sont vidés
  // Les dates actives ne doivent être mises à jour que lors du clic sur "Rechercher"
  // Cela évite les requêtes automatiques lors de la saisie

  // Utiliser les dates actives (seulement après clic sur "Rechercher"), pas les dates de saisie
  const isCustomDateRange = !!(activeCustomDateDebut && activeCustomDateFin);
  
  const alertes = useAlertes({
    periode: isCustomDateRange ? 'personnalise' : periode,
    dateDebut: isCustomDateRange ? activeCustomDateDebut : undefined,
    dateFin: isCustomDateRange ? activeCustomDateFin : undefined,
    statut: statusFilter !== 'Tous les statuts' ? mapStatutToAPI(statusFilter) : undefined,
    niveau: severityFilter !== 'Toutes les sévérités' ? mapSeveriteToAPI(severityFilter) : undefined,
    search: activeSearchTerm || undefined, // Utiliser le terme de recherche actif (seulement après clic sur "Rechercher")
    page: currentPage,
    limit: limit,
    searchKey: searchKey, // Passer searchKey pour forcer le rechargement
  });

  const handleFilterChange = (newPeriode: PeriodKey) => {
    setPeriode(newPeriode);
    setActiveCustomDateDebut(undefined);
    setActiveCustomDateFin(undefined);
    setDateDebut('');
    setDateFin('');
    setActiveSearchTerm(undefined); // Réinitialiser aussi la recherche
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleCustomDateSearch = () => {
    if (dateDebut && dateFin) {
      // Ajouter les heures aux dates personnalisées
      // dateDebut à 00:00:00 et dateFin à 23:59:59
      const dateDebutWithTime = `${dateDebut}T00:00:00`;
      const dateFinWithTime = `${dateFin}T23:59:59`;
      
      // Activer les dates actives avec les heures
      setActiveCustomDateDebut(dateDebutWithTime);
      setActiveCustomDateFin(dateFinWithTime);
      // Incrémenter searchKey pour forcer le rechargement
      setSearchKey(prev => prev + 1);
      setCurrentPage(1); // Réinitialiser à la page 1 quand les dates personnalisées changent
    } else {
      // Si les champs sont vides, réinitialiser les dates actives
      setActiveCustomDateDebut(undefined);
      setActiveCustomDateFin(undefined);
      // Incrémenter searchKey pour forcer le rechargement
      setSearchKey(prev => prev + 1);
      setCurrentPage(1);
    }
  };

  const handleSearchSubmit = () => {
    // Activer le terme de recherche actif
    const trimmedSearch = searchTerm.trim();
    setActiveSearchTerm(trimmedSearch || undefined);
    // Incrémenter searchKey pour forcer le rechargement
    setSearchKey(prev => prev + 1);
    setCurrentPage(1); // Réinitialiser à la page 1 lors de la recherche
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSeverityFilterChange = (value: string) => {
    setSeverityFilter(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Ne pas réinitialiser la page automatiquement lors de la saisie
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return {
    ...alertes,
    periode,
    dateDebut,
    dateFin,
    isCustomDateRange,
    statusFilter,
    severityFilter,
    searchTerm,
    currentPage,
    limit,
    setPeriode: handleFilterChange,
    setDateDebut,
    setDateFin,
    applyCustomDateRange: handleCustomDateSearch,
    setStatusFilter: handleStatusFilterChange,
    setSeverityFilter: handleSeverityFilterChange,
    setSearchTerm: handleSearchChange,
    applySearch: handleSearchSubmit, // Fonction pour déclencher la recherche
    setCurrentPage: handlePageChange,
  };
}

// Fonction helper pour mapper les statuts vers l'API
function mapStatutToAPI(statut: string): StatutAlerte | undefined {
  const mapping: Record<string, StatutAlerte> = {
    'En cours': StatutAlerte.ACTIVE,
    'Résolue': StatutAlerte.RESOLUE,
    'Archivée': StatutAlerte.ARCHIVEE,
  };
  return mapping[statut];
}

// Fonction helper pour mapper les sévérités vers l'API
function mapSeveriteToAPI(severite: string): NiveauAlerte | undefined {
  const mapping: Record<string, NiveauAlerte> = {
    'Critique': NiveauAlerte.CRITIQUE,
    'Élevée': NiveauAlerte.ELEVE,
    'Moyenne': NiveauAlerte.MOYEN,
    'Faible': NiveauAlerte.FAIBLE,
  };
  return mapping[severite];
}

