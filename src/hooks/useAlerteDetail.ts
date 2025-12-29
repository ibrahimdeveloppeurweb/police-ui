'use client';

import { useState, useEffect, useCallback } from 'react';
import { alertesService } from '@/lib/api/services';
import { StatutAlerte, NiveauAlerte } from '@/lib/api/services';

// Types pour la page de détail
export type AlertStatus = 'En cours' | 'Résolue' | 'Archivée';
export type AlertSeverity = 'Critique' | 'Élevée' | 'Moyenne' | 'Faible';
export type InterventionStatus = 'Déployée' | 'En route' | 'Sur place' | 'Terminée';

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

function convertStatutIntervention(statut: string): InterventionStatus {
  const mapping: Record<string, InterventionStatus> = {
    'DEPLOYEE': 'Déployée',
    'EN_ROUTE': 'En route',
    'SUR_PLACE': 'Sur place',
    'TERMINEE': 'Terminée',
  };
  return mapping[statut] || 'Déployée';
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

export interface AlerteDetail {
  id: string;
  numero: string;
  titre: string;
  date: string;
  heure: string;
  statut: AlertStatus;
  severite: AlertSeverity;
  type: string;
  typeRaw?: string; // Type brut de l'API pour la logique conditionnelle
  lieu: string;
  coordonnees: {
    latitude: number | string;
    longitude: number | string;
    precision?: string;
  };
  description: string;
  contexte?: string;
  risques: string[];
  personneConcernee?: {
    nom: string;
    telephone?: string;
    relation?: string;
  };
  vehicule?: {
    immatriculation: string;
    marque?: string;
    modele?: string;
    couleur?: string;
  };
  suspect?: {
    nom: string;
    description?: string;
    age?: string;
    adresse?: string;
    motif?: string;
  };
  agentRecepteur: {
    nom: string;
    prenom?: string;
    matricule: string;
    telephone?: string;
    commissariat?: string;
    grade?: string;
    heureReception?: string;
  };
  intervention?: {
    statut: InterventionStatus;
    equipe: Array<{
      id: string;
      nom: string;
      matricule: string;
      role?: string;
    }>;
    heureDepart?: string;
    heureArrivee?: string;
    heureFin?: string;
    moyens: string[];
    tempsReponse?: string;
  };
  evaluation?: {
    situationReelle: string;
    victimes?: number;
    degats?: string;
    mesuresPrises: string[];
    renforts: boolean;
    renfortsDetails?: string;
  };
  actions: {
    immediate: string[];
    preventive: string[];
    suivi: string[];
  };
  rapport?: {
    resume: string;
    conclusions: string[];
    recommandations?: string[];
    suiteADonner?: string;
  };
  temoins: Array<{
    nom: string;
    telephone?: string;
    declaration: string;
  }>;
  documents: Array<{
    type: string;
    numero?: string;
    date?: string;
    description: string;
    url?: string;
  }>;
  photos: string[];
  suivis: Array<{
    date: string;
    heure: string;
    agent: string;
    agentId?: string;
    agentCommissariat?: string;
    action: string;
    statut: string;
  }>;
  diffusee: boolean;
  dateDiffusion?: string;
  diffusionDestinataires?: {
    diffusionGenerale?: boolean;
    commissariatsIds?: string[];
    agentsIds?: string[];
    commissariats?: Array<{
      id: string;
      nom: string;
      ville: string;
      region: string;
      code: string;
    }>;
    agents?: Array<{
      id: string;
      nom: string;
      prenom: string;
      matricule: string;
      role: string;
      email?: string;
    }>;
  };
  dateResolution?: string;
  dateCloture?: string;
  observations?: string;
  commissariatId?: string;
}

interface UseAlerteDetailReturn {
  alerte: AlerteDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateAlerte: (data: Partial<AlerteDetail>) => Promise<void>;
  addSuivi: (suivi: { action: string; statut?: string }) => Promise<void>;
  broadcast: () => Promise<void>;
  resolve: () => Promise<void>;
  archive: () => Promise<void>;
}

// Transformer une alerte de l'API en format détail
function transformAlerteDetail(alerte: any): AlerteDetail {
  const dateAlerte = new Date(alerte.dateAlerte);
  
  return {
    id: alerte.id,
    numero: alerte.numero || alerte.id,
    titre: alerte.titre || 'Sans titre',
    date: dateAlerte.toLocaleDateString('fr-FR'),
    heure: dateAlerte.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    statut: convertStatut(alerte.statut),
    severite: convertSeverite(alerte.niveau),
    type: formatTypeAlerte(alerte.type),
    typeRaw: alerte.type, // Garder le type brut pour la logique conditionnelle
    lieu: alerte.lieu || alerte.localisation || 'Non spécifié',
    coordonnees: {
      latitude: alerte.latitude || '',
      longitude: alerte.longitude || '',
      precision: alerte.precisionLocalisation || '',
    },
    description: alerte.description || '',
    contexte: alerte.contexte || undefined,
    risques: Array.isArray(alerte.risques) ? alerte.risques : [],
    personneConcernee: alerte.personneConcernee || undefined,
    vehicule: alerte.vehicule || undefined,
    suspect: alerte.suspect || undefined,
    agentRecepteur: {
      nom: alerte.agent ? `${alerte.agent.prenom || ''} ${alerte.agent.nom || ''}`.trim() || alerte.agent.nom || 'Non assigné' : 'Non assigné',
      prenom: alerte.agent?.prenom,
      matricule: alerte.agent?.matricule || '',
      telephone: alerte.agent?.telephone,
      commissariat: alerte.commissariat?.nom,
      grade: alerte.agent?.role,
      heureReception: alerte.dateAlerte ? new Date(alerte.dateAlerte).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : undefined,
    },
    intervention: alerte.intervention ? {
      statut: convertStatutIntervention(alerte.intervention.statut),
      equipe: Array.isArray(alerte.intervention.equipe) 
        ? alerte.intervention.equipe.map((m: any) => 
            typeof m === 'string' 
              ? { id: '', nom: m, matricule: '', role: '' }
              : { id: m.id || '', nom: m.nom || '', matricule: m.matricule || '', role: m.role || '' }
          )
        : [],
      heureDepart: alerte.intervention.heureDepart,
      heureArrivee: alerte.intervention.heureArrivee,
      heureFin: alerte.intervention.heureFin,
      moyens: Array.isArray(alerte.intervention.moyens) ? alerte.intervention.moyens : [],
      tempsReponse: alerte.intervention.tempsReponse,
    } : undefined,
    evaluation: alerte.evaluation || undefined,
    actions: alerte.actions || {
      immediate: [],
      preventive: [],
      suivi: [],
    },
    rapport: alerte.rapport || undefined,
    temoins: Array.isArray(alerte.temoins) ? alerte.temoins : [],
    documents: Array.isArray(alerte.documents) ? alerte.documents : [],
    photos: Array.isArray(alerte.photos) ? alerte.photos : [],
    suivis: Array.isArray(alerte.suivis) ? alerte.suivis : [],
    diffusee: alerte.diffusee || false,
    dateDiffusion: alerte.dateDiffusion ? new Date(alerte.dateDiffusion).toISOString() : undefined,
    diffusionDestinataires: alerte.diffusionDestinataires || undefined,
    dateResolution: alerte.dateResolution ? new Date(alerte.dateResolution).toISOString() : undefined,
    dateCloture: alerte.dateCloture ? new Date(alerte.dateCloture).toISOString() : undefined,
    observations: alerte.observations || undefined,
    commissariatId: alerte.commissariatId || alerte.commissariat?.id,
  };
}

export function useAlerteDetail(id: string): UseAlerteDetailReturn {
  const [alerte, setAlerte] = useState<AlerteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerte = useCallback(async () => {
    if (!id) {
      setError('ID d\'alerte manquant');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await alertesService.getById(id);
      const alerteData = (response.data as any)?.data || response.data;
      
      if (alerteData) {
        const transformed = transformAlerteDetail(alerteData);
        setAlerte(transformed);
      } else {
        setError('Alerte non trouvée');
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement de l\'alerte:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement de l\'alerte');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const updateAlerte = useCallback(async (data: Partial<AlerteDetail>) => {
    if (!id) return;

    try {
      // Convertir les données frontend vers le format backend
      const updateData: any = {};
      
      if (data.statut) {
        const statutMap: Record<AlertStatus, StatutAlerte> = {
          'En cours': StatutAlerte.ACTIVE,
          'Résolue': StatutAlerte.RESOLUE,
          'Archivée': StatutAlerte.ARCHIVEE,
        };
        updateData.statut = statutMap[data.statut];
      }

      if (data.intervention) {
        updateData.intervention = {
          ...data.intervention,
          statut: data.intervention.statut?.replace(' ', '_').toUpperCase(),
        };
      }

      if (data.evaluation) {
        updateData.evaluation = data.evaluation;
      }

      if (data.actions) {
        updateData.actions = data.actions;
      }

      if (data.rapport) {
        updateData.rapport = data.rapport;
      }

      if (data.temoins !== undefined) {
        updateData.temoins = data.temoins;
      }

      if (data.documents !== undefined) {
        updateData.documents = data.documents;
      }

      if (data.photos !== undefined) {
        updateData.photos = data.photos;
      }

      await alertesService.update(id, updateData);
      await fetchAlerte(); // Recharger les données
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour de l\'alerte:', err);
      throw err;
    }
  }, [id, fetchAlerte]);

  const addSuivi = useCallback(async (suivi: { action: string; statut?: string }) => {
    if (!id) return;

    try {
      // Cette méthode doit être ajoutée au service
      // await alertesService.addSuivi(id, { ...suivi });
      // Pour l'instant, on utilise update
      await fetchAlerte();
    } catch (err: any) {
      console.error('Erreur lors de l\'ajout du suivi:', err);
      throw err;
    }
  }, [id, fetchAlerte]);

  const broadcast = useCallback(async () => {
    if (!id) return;

    try {
      await alertesService.broadcast(id);
      await fetchAlerte();
    } catch (err: any) {
      console.error('Erreur lors de la diffusion:', err);
      throw err;
    }
  }, [id, fetchAlerte]);

  const resolve = useCallback(async () => {
    if (!id) return;

    try {
      await alertesService.resolve(id);
      await fetchAlerte();
    } catch (err: any) {
      console.error('Erreur lors de la résolution:', err);
      throw err;
    }
  }, [id, fetchAlerte]);

  const archive = useCallback(async () => {
    if (!id) return;

    try {
      // Cette méthode doit être ajoutée au service
      // await alertesService.archive(id);
      await fetchAlerte();
    } catch (err: any) {
      console.error('Erreur lors de l\'archivage:', err);
      throw err;
    }
  }, [id, fetchAlerte]);

  useEffect(() => {
    fetchAlerte();
  }, [fetchAlerte]);

  return {
    alerte,
    loading,
    error,
    refetch: fetchAlerte,
    updateAlerte,
    addSuivi,
    broadcast,
    resolve,
    archive,
  };
}

export default useAlerteDetail;

