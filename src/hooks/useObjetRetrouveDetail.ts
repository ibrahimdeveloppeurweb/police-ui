'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';

export interface ObjetRetrouveDetail {
  id: string;
  numero: string;
  typeObjet: string;
  description: string;
  valeurEstimee?: string;
  couleur?: string;
  detailsSpecifiques?: Record<string, any>;
  deposant: {
    nom: string;
    prenom: string;
    telephone: string;
    email?: string;
    adresse?: string;
    cni?: string;
  };
  lieuTrouvaille: string;
  adresseLieu?: string;
  dateTrouvaille: Date | string;
  heureTrouvaille?: string;
  statut: 'EN ATTENTE' | 'RESTITUÉ' | 'NON RÉCLAMÉ' | 'EN_ATTENTE' | 'RESTITUE' | 'NON_RECLAME';
  dateDepot: Date | string;
  dateDepotFormatee?: string;
  dateTrouvailleFormatee?: string;
  dateRestitution?: Date | string;
  dateRestitutionFormatee?: string;
  proprietaire?: {
    nom: string;
    prenom: string;
    telephone: string;
    email?: string;
    adresse?: string;
    cni?: string;
  };
  observations?: string;
  agent?: {
    id: string;
    nom: string;
    prenom: string;
    matricule: string;
  };
  commissariat?: {
    id: string;
    nom: string;
    code: string;
    telephone?: string;
    email?: string;
    adresse?: string;
  };
  historique?: Array<{
    date: string;
    dateISO?: string;
    action: string;
    agent: string;
    details?: string;
  }>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

interface UseObjetRetrouveDetailReturn {
  objet: ObjetRetrouveDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useObjetRetrouveDetail(id: string): UseObjetRetrouveDetailReturn {
  const [objet, setObjet] = useState<ObjetRetrouveDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchObjetRetrouve = useCallback(async () => {
    if (!id) {
      setError('ID manquant');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/objets-retrouves/${id}`);
      const apiResponse = response.data;
      const objetData = apiResponse?.data || apiResponse;

      if (objetData) {
        // Parser les champs JSON si nécessaire
        const deposant =
          typeof objetData.deposant === 'string'
            ? JSON.parse(objetData.deposant)
            : objetData.deposant || {};

        const detailsSpecifiques =
          typeof objetData.detailsSpecifiques === 'string'
            ? JSON.parse(objetData.detailsSpecifiques)
            : objetData.detailsSpecifiques || {};

        const proprietaire = objetData.proprietaire
          ? typeof objetData.proprietaire === 'string'
            ? JSON.parse(objetData.proprietaire)
            : objetData.proprietaire
          : undefined;

        const transformed: ObjetRetrouveDetail = {
          ...objetData,
          deposant,
          detailsSpecifiques,
          proprietaire,
          agent: objetData.agent
            ? {
                id: objetData.agent.id,
                nom: objetData.agent.nom || '',
                prenom: objetData.agent.prenom || '',
                matricule: objetData.agent.matricule || '',
              }
            : undefined,
        };

        setObjet(transformed);
      } else {
        setError('Objet retrouvé non trouvé');
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement des détails:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Erreur lors du chargement des détails de l\'objet retrouvé'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchObjetRetrouve();
  }, [fetchObjetRetrouve]);

  const refetch = useCallback(async () => {
    await fetchObjetRetrouve();
  }, [fetchObjetRetrouve]);

  return {
    objet,
    loading,
    error,
    refetch,
  };
}

export default useObjetRetrouveDetail;

