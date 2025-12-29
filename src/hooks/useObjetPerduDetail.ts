'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';

// Interface pour un objet dans l'inventaire
export interface InventoryItem {
  id?: number;
  category: string;
  icon?: string;
  name: string;
  color: string;
  brand?: string;
  serial?: string;
  description?: string;
  identityType?: string;
  identityNumber?: string;
  identityName?: string;
  cardType?: string;
  cardBank?: string;
  cardLast4?: string;
}

// Interface pour les détails d'un contenant
export interface ContainerDetails {
  type: string;
  couleur?: string;
  marque?: string;
  taille?: string;
  signesDistinctifs?: string;
  inventory?: InventoryItem[];
}

export interface ObjetPerduDetail {
  id: string;
  numero: string;
  typeObjet: string;
  description: string;
  valeurEstimee?: string;
  couleur?: string;
  detailsSpecifiques?: Record<string, any>;
  
  // Nouveaux champs pour le mode contenant
  isContainer: boolean;
  containerDetails?: ContainerDetails;
  
  declarant: {
    nom: string;
    prenom: string;
    telephone: string;
    email?: string;
    adresse?: string;
    cni?: string;
  };
  lieuPerte: string;
  adresseLieu?: string;
  datePerte: Date | string;
  heurePerte?: string;
  statut: 'EN RECHERCHE' | 'RETROUVÉ' | 'CLÔTURÉ' | 'EN_RECHERCHE' | 'RETROUVE' | 'CLOTURE';
  dateDeclaration: Date | string;
  dateDeclarationFormatee?: string;
  datePerteFormatee?: string;
  dateRetrouve?: Date | string;
  dateRetrouveFormatee?: string;
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

interface UseObjetPerduDetailReturn {
  objet: ObjetPerduDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useObjetPerduDetail(id: string): UseObjetPerduDetailReturn {
  const [objet, setObjet] = useState<ObjetPerduDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchObjetPerdu = useCallback(async () => {
    if (!id) {
      setError('ID manquant');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/objets-perdus/${id}`);
      const apiResponse = response.data;
      const objetData = apiResponse?.data || apiResponse;

      if (objetData) {
        // Parser les champs JSON si nécessaire
        const declarant =
          typeof objetData.declarant === 'string'
            ? JSON.parse(objetData.declarant)
            : objetData.declarant || {};

        const detailsSpecifiques =
          typeof objetData.detailsSpecifiques === 'string'
            ? JSON.parse(objetData.detailsSpecifiques)
            : objetData.detailsSpecifiques || {};

        // Parser containerDetails si c'est une chaîne JSON
        let containerDetails = objetData.containerDetails;
        if (typeof containerDetails === 'string') {
          try {
            containerDetails = JSON.parse(containerDetails);
          } catch (e) {
            console.error('Erreur lors du parsing de containerDetails:', e);
            containerDetails = undefined;
          }
        }

        const transformed: ObjetPerduDetail = {
          ...objetData,
          declarant,
          detailsSpecifiques,
          isContainer: objetData.isContainer || false,
          containerDetails,
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
        setError('Objet perdu non trouvé');
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement des détails:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Erreur lors du chargement des détails de l\'objet perdu'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchObjetPerdu();
  }, [fetchObjetPerdu]);

  const refetch = useCallback(async () => {
    await fetchObjetPerdu();
  }, [fetchObjetPerdu]);

  return {
    objet,
    loading,
    error,
    refetch,
  };
}

export default useObjetPerduDetail;
