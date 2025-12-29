'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Cookies from 'js-cookie';
import { alertesService, TypeAlerte, StatutAlerte, NiveauAlerte } from '@/lib/api/services';

export type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout';

interface AlertDashboardStats {
  vehiculesVoles: { total: number; evolution: string; critiques: number };
  avisRecherche: { total: number; status: string; hautePriorite: number };
  urgencesSecurite: { total: number };
  resolues: { total: number; evolution: string };
  tempsReponse: { moyen: string; evolution: string };
  tauxResolution: { pourcentage: string; evolution: string };
  commissariatsActifs: { nombre: string; total: string };
  montantRecupere: { total: string; evolution: string };
}

interface ActivityData {
  period: string;
  alertes: number;
  critiques: number;
  resolues: number;
}

interface PieData {
  name: string;
  value: number;
  color: string;
}

export interface VehicleAlert {
  id: string;
  plaque: string;
  vehicule: string;
  couleur: string;
  proprietaire: string;
  status: StatutAlerte;
  signalement: string;
  zone: string;
  temps: string;
  description: string;
  priorite: NiveauAlerte;
  type: TypeAlerte;
}

interface AlertDashboardData {
  stats: AlertDashboardStats;
  activityData: ActivityData[];
  pieData: PieData[];
  alerts: VehicleAlert[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseAlertesDashboardReturn {
  data: AlertDashboardData | null;
  loading: boolean;
  error: string | null;
  commissariatId: string | null;
  commissariat: any;
  refetch: () => Promise<void>;
  changePage: (page: number) => Promise<void>;
}

// Calculer les dates selon la période
function getDateRange(periode: PeriodKey): { dateDebut?: string; dateFin?: string } {
  const maintenant = new Date();
  
  switch (periode) {
    case 'jour': {
      const aujourdhui = new Date(maintenant);
      aujourdhui.setHours(0, 0, 0, 0);
      const finJour = new Date(maintenant);
      finJour.setHours(23, 59, 59, 999);
      return {
        dateDebut: aujourdhui.toISOString().split('T')[0],
        dateFin: finJour.toISOString().split('T')[0],
      };
    }
    
    case 'semaine': {
      const debutSemaine = new Date(maintenant);
      debutSemaine.setDate(maintenant.getDate() - maintenant.getDay()); // Dimanche
      debutSemaine.setHours(0, 0, 0, 0);
      const finSemaine = new Date(maintenant);
      finSemaine.setHours(23, 59, 59, 999);
      return {
        dateDebut: debutSemaine.toISOString().split('T')[0],
        dateFin: finSemaine.toISOString().split('T')[0],
      };
    }
    
    case 'mois': {
      const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
      const finMois = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0, 23, 59, 59, 999);
      return {
        dateDebut: debutMois.toISOString().split('T')[0],
        dateFin: finMois.toISOString().split('T')[0],
      };
    }
    
    case 'annee': {
      const debutAnnee = new Date(maintenant.getFullYear(), 0, 1);
      const finAnnee = new Date(maintenant.getFullYear(), 11, 31, 23, 59, 59, 999);
      return {
        dateDebut: debutAnnee.toISOString().split('T')[0],
        dateFin: finAnnee.toISOString().split('T')[0],
      };
    }
    
    case 'tout':
      return {};
    
    default:
      return {};
  }
}

// Transformer les statistiques de l'API en format dashboard
function transformStats(apiStats: any, previousStats?: any): AlertDashboardStats {
  // Vérifier que apiStats existe et initialiser les valeurs par défaut
  if (!apiStats || typeof apiStats !== 'object') {
    apiStats = {
      parNiveau: {},
      parType: {},
      total: 0,
      actives: 0,
      resolues: 0,
      archivees: 0,
      tempsMoyenResolution: 0,
    };
  }
  
  // S'assurer que parNiveau et parType existent
  if (!apiStats.parNiveau || typeof apiStats.parNiveau !== 'object') {
    apiStats.parNiveau = {};
  }
  if (!apiStats.parType || typeof apiStats.parType !== 'object') {
    apiStats.parType = {};
  }
  
  const totalCritiques = apiStats.parNiveau?.CRITIQUE || 0;
  const totalResolues = apiStats.resolues || 0;
  const totalActives = apiStats.actives || 0;
  const totalArchivees = apiStats.archivees || 0;
  
  // Calculer l'évolution (simplifié - on pourrait améliorer avec les stats précédentes)
  const evolutionResolues = previousStats 
    ? `+${Math.max(0, totalResolues - (previousStats.resolues || 0))}`
    : '+0';
  
  const tempsMoyen = apiStats.tempsMoyenResolution 
    ? `${Math.round(apiStats.tempsMoyenResolution * 60)} min`
    : 'N/A';
  
  const tauxResolution = apiStats.total > 0 
    ? ((totalResolues / apiStats.total) * 100).toFixed(1)
    : '0.0';
  
  return {
    vehiculesVoles: {
      total: apiStats.parType?.VEHICULE_VOLE || 0,
      evolution: '+0',
      critiques: totalCritiques,
    },
    avisRecherche: {
      total: apiStats.parType?.SUSPECT_RECHERCHE || 0,
      status: totalActives > 0 ? 'Actif' : 'Aucun',
      hautePriorite: totalCritiques,
    },
    urgencesSecurite: {
      total: apiStats.parType?.URGENCE_SECURITE || 0,
    },
    resolues: {
      total: totalResolues,
      evolution: evolutionResolues,
    },
    tempsReponse: {
      moyen: tempsMoyen,
      evolution: '-0 min',
    },
    tauxResolution: {
      pourcentage: `${tauxResolution}%`,
      evolution: '+0.0%',
    },
    commissariatsActifs: {
      nombre: '1', // Le commissariat connecté
      total: '18',
    },
    montantRecupere: {
      total: '0',
      evolution: '+0',
    },
  };
}

// Générer les données d'activité pour les graphiques (à partir des alertes)
function generateActivityData(alertes: any[], periode: PeriodKey): ActivityData[] {
  const data: ActivityData[] = [];
  
  if (periode === 'jour') {
    const heures = ['00h-04h', '04h-08h', '08h-12h', '12h-16h', '16h-20h', '20h-24h'];
    heures.forEach((h, index) => {
      const heureDebut = index * 4;
      const heureFin = (index + 1) * 4;
      const alertesPeriode = alertes.filter(a => {
        const date = new Date(a.dateAlerte || a.date);
        const heure = date.getHours();
        return heure >= heureDebut && heure < heureFin;
      });
      
      data.push({
        period: h,
        alertes: alertesPeriode.length,
        critiques: alertesPeriode.filter(a => a.niveau === 'CRITIQUE').length,
        resolues: alertesPeriode.filter(a => a.statut === 'RESOLUE').length,
      });
    });
  } else if (periode === 'semaine') {
    const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    jours.forEach((jour, index) => {
      const date = new Date();
      const jourSemaine = date.getDay() === 0 ? 7 : date.getDay(); // Dimanche = 7
      const diff = index - (jourSemaine - 1);
      const dateJour = new Date(date);
      dateJour.setDate(date.getDate() + diff);
      dateJour.setHours(0, 0, 0, 0);
      const dateJourFin = new Date(dateJour);
      dateJourFin.setHours(23, 59, 59, 999);
      
      const alertesJour = alertes.filter(a => {
        const dateAlerte = new Date(a.dateAlerte || a.date);
        return dateAlerte >= dateJour && dateAlerte <= dateJourFin;
      });
      
      data.push({
        period: jour,
        alertes: alertesJour.length,
        critiques: alertesJour.filter(a => a.niveau === 'CRITIQUE').length,
        resolues: alertesJour.filter(a => a.statut === 'RESOLUE').length,
      });
    });
  } else if (periode === 'mois') {
    const semaines = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
    semaines.forEach((sem, index) => {
      const dateDebut = new Date();
      dateDebut.setDate(1 + (index * 7));
      dateDebut.setHours(0, 0, 0, 0);
      const dateFin = new Date(dateDebut);
      dateFin.setDate(dateFin.getDate() + 6);
      dateFin.setHours(23, 59, 59, 999);
      
      const alertesSem = alertes.filter(a => {
        const dateAlerte = new Date(a.dateAlerte || a.date);
        return dateAlerte >= dateDebut && dateAlerte <= dateFin;
      });
      
      data.push({
        period: sem,
        alertes: alertesSem.length,
        critiques: alertesSem.filter(a => a.niveau === 'CRITIQUE').length,
        resolues: alertesSem.filter(a => a.statut === 'RESOLUE').length,
      });
    });
  } else {
    // Pour année et tout, on fait des groupes mensuels ou annuels
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    mois.forEach((moisNom, index) => {
      const dateDebut = new Date();
      dateDebut.setMonth(index);
      dateDebut.setDate(1);
      dateDebut.setHours(0, 0, 0, 0);
      const dateFin = new Date(dateDebut);
      dateFin.setMonth(dateFin.getMonth() + 1);
      dateFin.setDate(0);
      dateFin.setHours(23, 59, 59, 999);
      
      const alertesMois = alertes.filter(a => {
        const dateAlerte = new Date(a.dateAlerte || a.date);
        return dateAlerte >= dateDebut && dateAlerte <= dateFin;
      });
      
      data.push({
        period: moisNom,
        alertes: alertesMois.length,
        critiques: alertesMois.filter(a => a.niveau === 'CRITIQUE').length,
        resolues: alertesMois.filter(a => a.statut === 'RESOLUE').length,
      });
    });
  }
  
  return data;
}

// Générer les données pour le graphique en cercle
function generatePieData(apiStats: any): PieData[] {
  // Vérifier que apiStats existe
  if (!apiStats) {
    apiStats = {
      actives: 0,
      resolues: 0,
      archivees: 0,
    };
  }
  
  const actives = apiStats.actives || 0;
  const resolues = apiStats.resolues || 0;
  const archivees = apiStats.archivees || 0;
  
  return [
    { name: 'Détectés', value: actives, color: '#ef4444' },
    { name: 'Recherchés', value: archivees, color: '#f59e0b' },
    { name: 'Résolus', value: resolues, color: '#10b981' },
  ];
}

// Transformer les alertes en format VehicleAlert
function transformAlerts(alertes: any[]): VehicleAlert[] {
  if (!alertes || !Array.isArray(alertes)) {
    console.warn('⚠️ transformAlerts: alertes n\'est pas un tableau', alertes);
    return [];
  }
  
  return alertes.map(alerte => {
    if (!alerte) {
      console.warn('⚠️ transformAlerts: alerte est null ou undefined');
      return null;
    }
    
    // Déterminer la plaque d'immatriculation
    const plaque = alerte.vehicule?.immatriculation 
      || alerte.numero 
      || alerte.suspect?.nom 
      || `ALR-${alerte.id?.substring(0, 8) || 'N/A'}`;
    
    // Déterminer le véhicule
    let vehicule = 'Non spécifié';
    if (alerte.vehicule) {
      const marque = alerte.vehicule.marque || '';
      const modele = alerte.vehicule.modele || '';
      vehicule = `${marque} ${modele}`.trim() || 'Véhicule non spécifié';
    } else if (alerte.suspect) {
      vehicule = `Suspect: ${alerte.suspect.nom || 'Non spécifié'}`;
    } else if (alerte.type === 'URGENCE_SECURITE') {
      vehicule = 'Urgence sécurité';
    }
    
    return {
      id: alerte.id || '',
      plaque: plaque,
      vehicule: vehicule,
      couleur: alerte.vehicule?.couleur || 'N/A',
      proprietaire: alerte.personneConcernee?.nom || alerte.suspect?.nom || 'Non spécifié',
      status: alerte.statut as StatutAlerte || StatutAlerte.ACTIVE,
      signalement: alerte.dateAlerte ? new Date(alerte.dateAlerte).toLocaleDateString('fr-FR') : 'N/A',
      zone: alerte.lieu || alerte.localisation || 'Non spécifié',
      temps: 'N/A',
      description: alerte.titre || alerte.description || 'Sans description',
      priorite: alerte.niveau as NiveauAlerte || NiveauAlerte.MOYEN,
      type: alerte.type as TypeAlerte || TypeAlerte.AUTRE,
    };
  }).filter((alert): alert is VehicleAlert => alert !== null);
}

export function useAlertesDashboard(
  periode: PeriodKey = 'jour',
  customDateDebut?: string,
  customDateFin?: string,
  searchKey: number = 0
): UseAlertesDashboardReturn {
  const [data, setData] = useState<AlertDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commissariatId, setCommissariatId] = useState<string | null>(null);
  const [commissariat, setCommissariat] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20, // 20 alertes par page
    total: 0,
    totalPages: 0,
  });
  
  // Refs pour stocker les dates personnalisées actives (utilisées pour la recherche)
  // Ces refs sont mises à jour uniquement quand les props changent (quand on clique sur Rechercher)
  const activeCustomDateDebutRef = useRef<string | undefined>(customDateDebut);
  const activeCustomDateFinRef = useRef<string | undefined>(customDateFin);
  
  // Mettre à jour les refs quand les dates personnalisées changent via les props
  // (seulement quand on passe de nouvelles valeurs, pas lors de la saisie dans les champs)
  // Utiliser un useEffect avec une condition pour éviter les mises à jour inutiles
  useEffect(() => {
    if (customDateDebut !== undefined) {
      activeCustomDateDebutRef.current = customDateDebut;
    }
    if (customDateFin !== undefined) {
      activeCustomDateFinRef.current = customDateFin;
    }
  }, [customDateDebut, customDateFin]);
  
  // Refs pour gérer le throttling et éviter les requêtes trop fréquentes
  const lastRequestTimeRef = useRef<number>(0);
  const requestTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingRequestRef = useRef<boolean>(false);
  
  // Délai minimum entre les requêtes (1000ms pour éviter le rate limiting)
  const MIN_REQUEST_DELAY = 1000;
  
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
      console.error('Erreur getCommissariatId:', e);
      return null;
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
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
        fetchDashboard();
      }, Math.max(0, delay));
      
      return;
    }
    
    // Marquer qu'une requête est en cours
    pendingRequestRef.current = true;
    lastRequestTimeRef.current = Date.now();
    
    const commId = getCommissariatId();
    setCommissariatId(commId);

    if (!commId) {
      setError('Aucun commissariat associé à cet utilisateur');
      setLoading(false);
      pendingRequestRef.current = false;
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calculer les dates selon la période OU utiliser les dates personnalisées actives
      let dateRange: { dateDebut?: string; dateFin?: string };
      
      // Si des dates personnalisées actives sont disponibles, les utiliser
      if (activeCustomDateDebutRef.current && activeCustomDateFinRef.current) {
        dateRange = {
          dateDebut: activeCustomDateDebutRef.current,
          dateFin: activeCustomDateFinRef.current,
        };
      } else {
        // Sinon, calculer selon la période
        dateRange = getDateRange(periode);
      }
      
      // Récupérer les statistiques
      let apiStats: any = null;
      try {
        const statsResponse = await alertesService.getStatistiques({
          commissariatId: commId,
          dateDebut: dateRange.dateDebut,
          dateFin: dateRange.dateFin,
        });
        
        apiStats = (statsResponse?.data as any)?.data || statsResponse?.data;
      } catch (err: any) {
        console.error('Erreur lors de la récupération des statistiques:', err);
        // Ne pas bloquer le chargement du dashboard si les stats échouent
        // Utiliser des valeurs par défaut
        apiStats = null;
      }
      
      // Vérifier que apiStats existe et a les propriétés nécessaires
      if (!apiStats || typeof apiStats !== 'object' || Array.isArray(apiStats)) {
        console.warn('Les statistiques de l\'API sont invalides ou manquantes, utilisation des valeurs par défaut');
        apiStats = {
          parNiveau: {},
          parType: {},
          total: 0,
          actives: 0,
          resolues: 0,
          archivees: 0,
          tempsMoyenResolution: 0,
        };
      }
      
      // S'assurer que parNiveau et parType existent
      if (!apiStats.parNiveau || typeof apiStats.parNiveau !== 'object' || Array.isArray(apiStats.parNiveau)) {
        apiStats.parNiveau = {};
      }
      if (!apiStats.parType || typeof apiStats.parType !== 'object' || Array.isArray(apiStats.parType)) {
        apiStats.parType = {};
      }
      
      // Récupérer les alertes actives avec pagination (20 alertes par page)
      // CET APPEL EST UTILISÉ UNIQUEMENT POUR LA PAGINATION DES ALERTES
      const alertsResponse = await alertesService.getAll({
        commissariatId: commId,
        dateDebut: dateRange.dateDebut,
        dateFin: dateRange.dateFin,
      }, currentPage, 20); // TOUJOURS 20 alertes par page
      
      // Extraire la pagination directement depuis response.data.pagination ou response.data.data.pagination
      // responsePagination contient DÉJÀ directement l'objet pagination (page, limit, total, totalPages)
      const responsePagination: any = (alertsResponse.data as any)?.pagination || (alertsResponse.data as any)?.data?.pagination;
      const responseData = alertsResponse.data?.data || alertsResponse.data;
      
      console.log('🔍 Extraction pagination Dashboard - Structure API:', {
        responseData: alertsResponse.data,
        responsePagination,
        hasPaginationInResponseData: !!(alertsResponse.data as any)?.pagination,
        hasPaginationInResponseDataData: !!(alertsResponse.data as any)?.data?.pagination,
      });
      
      let alertsData: any[] = [];
      // responsePagination contient DÉJÀ directement l'objet pagination (page, limit, total, totalPages)
      // PAS besoin de faire responsePagination.pagination, on utilise directement responsePagination
      let paginationData: any = responsePagination || {
        page: currentPage,
        limit: 20, // TOUJOURS 20 alertes par page
        total: 0,
        totalPages: 0,
      };
      
      if (responseData) {
        if (Array.isArray(responseData)) {
          alertsData = responseData;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          alertsData = responseData.data;
        }
      }
      
      // Si responsePagination existe, l'utiliser directement (sans chercher .pagination)
      if (responsePagination && typeof responsePagination === 'object' && responsePagination.page != null) {
        const total = responsePagination.total || 0;
        // S'assurer que limit est bien 20 (peu importe ce que le backend retourne)
        const calculatedTotalPages = Math.ceil(total / 20);
        paginationData = {
          page: responsePagination.page || currentPage,
          limit: 20, // TOUJOURS 20 pour la pagination des alertes
          total: total,
          totalPages: calculatedTotalPages, // Recalculer avec limit = 20
        };
        
        console.log('✅ Utilisation DIRECTE de responsePagination pour la pagination Dashboard (sans .pagination):', {
          responsePagination,
          paginationData,
          total,
          calculatedTotalPages,
        });
        
        // Log pour debug si le backend retourne un limit différent
        if (responsePagination.limit && responsePagination.limit !== 20) {
          console.warn(`⚠️ Backend a retourné limit: ${responsePagination.limit}, on force à 20 pour la pagination`);
        }
      }
      
      // Si on n'a pas de pagination du backend mais qu'on a des données
      if (paginationData.total === 0 && alertsData.length > 0) {
        paginationData.total = alertsData.length;
        paginationData.totalPages = Math.ceil(paginationData.total / 20);
      }
      
      // Transformer les alertes pour l'affichage
      const stats = transformStats(apiStats);
      const alerts = transformAlerts(alertsData);
      
      // Pour les graphiques, on récupère toutes les alertes seulement à la première page
      // CET APPEL EST SÉPARÉ ET N'AFFECTE PAS LA PAGINATION
      let activityData: ActivityData[] = [];
      let pieData: PieData[] = [];
      
      if (currentPage === 1) {
        // Récupérer toutes les alertes pour les graphiques (séparé de la pagination)
        // Ceci est fait EN PARALLÈLE ou APRÈS pour ne pas affecter la pagination
        const allAlertsResponse = await alertesService.getAll({
          commissariatId: commId,
          dateDebut: dateRange.dateDebut,
          dateFin: dateRange.dateFin,
        }, 1, 1000); // Récupérer beaucoup pour les graphiques uniquement
        
        // Extraire UNIQUEMENT les données pour les graphiques (pas la pagination)
        // Pour les graphiques, on ne s'intéresse pas à la pagination, seulement aux données
        const allResponseData = allAlertsResponse.data?.data || allAlertsResponse.data;
        let allAlertsData: any[] = [];
        
        if (allResponseData) {
          if (Array.isArray(allResponseData)) {
            allAlertsData = allResponseData;
          } else if (allResponseData.data && Array.isArray(allResponseData.data)) {
            allAlertsData = allResponseData.data;
          } else if (allResponseData.data) {
            allAlertsData = Array.isArray(allResponseData.data) ? allResponseData.data : [];
          }
        }
        
        console.log('📊 Données pour graphiques extraites (pagination ignorée):', {
          totalAlertsForCharts: allAlertsData.length,
        });
        
        // Générer les données pour les graphiques
        activityData = generateActivityData(allAlertsData, periode);
        pieData = generatePieData(apiStats);
      } else {
        // Conserver les données de graphiques existantes si on change juste de page
        // Utiliser setData dans un callback pour accéder à l'état précédent
        const previousData = data;
        activityData = previousData?.activityData || [];
        pieData = previousData?.pieData || [];
      }
      
      // IMPORTANT: La pagination vient UNIQUEMENT de la première requête (limit: 20)
      // Elle n'est JAMAIS modifiée par la deuxième requête (limit: 1000 pour graphiques)
      // paginationData = responsePagination (qui vient de response.data.pagination ou response.data.data.pagination)
      
      // S'assurer que la pagination a toujours limit: 20 et totalPages correct
      // Utiliser directement paginationData (qui est responsePagination) sans chercher .pagination
      const finalTotalPages = Math.ceil((paginationData.total || 0) / 20);
      const finalPagination = {
        page: paginationData.page != null ? Number(paginationData.page) : currentPage,
        limit: 20, // GARANTIR que c'est toujours 20
        total: paginationData.total != null ? Number(paginationData.total) : 0,
        totalPages: paginationData.totalPages != null ? Number(paginationData.totalPages) : finalTotalPages,
      };
      
      console.log('✅ Pagination finale Dashboard depuis responsePagination (sans .pagination):', {
        responsePaginationOriginal: responsePagination,
        paginationDataUtilisé: paginationData,
        finalPagination,
        pageFromAPI: paginationData.page,
        limitFromAPI: paginationData.limit,
        totalFromAPI: paginationData.total,
        totalPagesFromAPI: paginationData.totalPages,
      });
      
      setPagination(finalPagination);
      
      setData({
        stats,
        activityData,
        pieData,
        alerts,
        pagination: finalPagination, // Utiliser la pagination garantie avec limit: 20
      });
      
      // Récupérer les infos du commissariat
      try {
        const commData = Cookies.get('user_commissariat') || localStorage.getItem('user_commissariat');
        if (commData) {
          setCommissariat(JSON.parse(commData));
        }
      } catch (e) {
        console.error('Erreur parsing commissariat:', e);
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement du dashboard:', err);
      
      // Gérer spécifiquement l'erreur 429 (Too Many Requests)
      if (err.response?.status === 429 || err.message?.includes('Trop de requêtes')) {
        const retryAfter = err.response?.headers?.['retry-after'] || 5;
        setError(`Trop de requêtes. Veuillez attendre ${retryAfter} secondes avant de réessayer.`);
        
        // Programmer une nouvelle tentative après le délai
        requestTimeoutRef.current = setTimeout(() => {
          fetchDashboard();
        }, retryAfter * 1000);
      } else {
        setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des données');
      }
    } finally {
      setLoading(false);
      pendingRequestRef.current = false;
    }
  }, [periode, getCommissariatId, currentPage]);

  // Réinitialiser la page quand la période change
  useEffect(() => {
    setCurrentPage(1);
  }, [periode]);

  // Déclencher le rechargement quand les dates personnalisées changent OU quand searchKey change
  // searchKey est incrémenté à chaque clic sur "Rechercher" pour forcer le rechargement
  useEffect(() => {
    // Si des dates personnalisées sont définies, recharger les données
    if (customDateDebut && customDateFin) {
      fetchDashboard();
    } else if (!customDateDebut && !customDateFin && searchKey > 0) {
      // Si les dates sont vidées mais qu'on vient de faire une recherche, recharger aussi
      fetchDashboard();
    }
  }, [customDateDebut, customDateFin, searchKey, fetchDashboard]);

  // Nettoyer le timeout à la destruction du composant
  useEffect(() => {
    return () => {
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const changePage = useCallback(async (page: number) => {
    setCurrentPage(page);
    // La requête sera déclenchée automatiquement par le useEffect qui dépend de currentPage
  }, []);

  return {
    data,
    loading,
    error,
    commissariatId,
    commissariat,
    refetch: fetchDashboard,
    changePage,
  };
}

