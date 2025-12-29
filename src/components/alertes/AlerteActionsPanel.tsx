'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { alertesService, commissariatService } from '@/lib/api/services'
import { apiClient } from '@/lib/api/client'
import {
  Shield, ClipboardCheck, FileText, User, Camera, 
  Activity, Bell, CheckCircle, X, Plus, Trash2, Loader2, Search, UserCheck, EyeOff, Eye, Users, Sparkles
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { toastManager } from '@/lib/toast-manager'

interface AlerteActionsPanelProps {
  alerteId: string
  alerteStatut: string
  hasIntervention: boolean
  hasEvaluation: boolean
  hasRapport: boolean
  isDiffusee?: boolean
  interventionData?: any
  commissariatId?: string
  canAssign?: boolean // Si le commissariat actuel peut assigner l'alerte
  currentUserCommissariatId?: string // ID du commissariat de l'utilisateur connecté
  onActionSuccess?: () => void
}

export default function AlerteActionsPanel({
  alerteId,
  alerteStatut,
  hasIntervention,
  hasEvaluation,
  hasRapport,
  isDiffusee = false,
  interventionData,
  commissariatId,
  canAssign = false,
  currentUserCommissariatId,
  onActionSuccess,
}: AlerteActionsPanelProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  
  // États pour la diffusion
  const [commissariats, setCommissariats] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [selectedCommissariats, setSelectedCommissariats] = useState<string[]>([])
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [diffusionGenerale, setDiffusionGenerale] = useState(false)
  const [loadingCommissariats, setLoadingCommissariats] = useState(false)
  const [loadingAgents, setLoadingAgents] = useState(false)
  const [searchCommissariats, setSearchCommissariats] = useState('')
  const [searchAgents, setSearchAgents] = useState('')

  // États pour l'assignation (commissariats destinataires)
  const [assignAgents, setAssignAgents] = useState<any[]>([])
  const [selectedAssignAgents, setSelectedAssignAgents] = useState<string[]>([])
  const [assigneeGenerale, setAssigneeGenerale] = useState(false)
  const [loadingAssignAgents, setLoadingAssignAgents] = useState(false)
  const [searchAssignAgents, setSearchAssignAgents] = useState('')
  
  // États pour la diffusion interne (commissariat créateur)
  const [diffusionInterneAgents, setDiffusionInterneAgents] = useState<any[]>([])
  const [selectedDiffusionInterneAgents, setSelectedDiffusionInterneAgents] = useState<string[]>([])
  const [diffusionInterneGenerale, setDiffusionInterneGenerale] = useState(false)
  const [loadingDiffusionInterneAgents, setLoadingDiffusionInterneAgents] = useState(false)
  const [searchDiffusionInterneAgents, setSearchDiffusionInterneAgents] = useState('')

  // Normaliser les données d'intervention pour le formulaire
  const normalizeInterventionEquipe = (equipe: any): Array<{ id: string; nom: string; matricule: string; role: string }> => {
    if (!equipe || !Array.isArray(equipe)) return [{ id: '', nom: '', matricule: '', role: '' }]
    return equipe.map((membre: any) => {
      if (typeof membre === 'string') {
        // Si c'est une chaîne, essayer de parser ou créer un objet minimal
        return { id: '', nom: membre, matricule: '', role: '' }
      }
      return {
        id: membre.id || '',
        nom: membre.nom || membre.name || '',
        matricule: membre.matricule || '',
        role: membre.role || ''
      }
    })
  }

  // États pour les modaux
  const [interventionFormData, setInterventionFormData] = useState({
    statut: 'DEPLOYEE',
    equipe: [{ id: '', nom: '', matricule: '', role: '' }],
    moyens: [''],
    heureDepart: '',
    heureArrivee: '',
    heureFin: '',
    tempsReponse: '',
  })
  
  // États pour la sélection d'agents pour l'intervention
  const [agentsIntervention, setAgentsIntervention] = useState<any[]>([])
  const [selectedAgentsIntervention, setSelectedAgentsIntervention] = useState<string[]>([])
  const [loadingAgentsIntervention, setLoadingAgentsIntervention] = useState(false)
  const [searchAgentsIntervention, setSearchAgentsIntervention] = useState('')

  // Initialiser les données d'intervention si disponibles
  useEffect(() => {
    if (interventionData && hasIntervention) {
      setInterventionFormData({
        statut: interventionData.statut || 'DEPLOYEE',
        equipe: normalizeInterventionEquipe(interventionData.equipe),
        moyens: Array.isArray(interventionData.moyens) && interventionData.moyens.length > 0 
          ? interventionData.moyens 
          : [''],
        heureDepart: interventionData.heureDepart || '',
        heureArrivee: interventionData.heureArrivee || '',
        heureFin: interventionData.heureFin || '',
        tempsReponse: interventionData.tempsReponse || '',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interventionData, hasIntervention])
  const [evaluationData, setEvaluationData] = useState({
    situationReelle: '',
    victimes: 0,
    degats: '',
    mesuresPrises: [''],
    renforts: false,
    renfortsDetails: '',
  })
  const [rapportData, setRapportData] = useState({
    resume: '',
    conclusions: [''],
    recommandations: [''],
    suiteADonner: '',
  })
  const [temoinData, setTemoinData] = useState({
    nom: '',
    telephone: '',
    declaration: '',
    anonyme: false,
  })
  const [documentData, setDocumentData] = useState({
    type: '',
    numero: '',
    date: '',
    description: '',
    url: '',
  })
  const [actionsData, setActionsData] = useState({
    immediate: [''],
    preventive: [''],
    suivi: [''],
  })
  
  // États pour la résolution
  const [resolveData, setResolveData] = useState({
    classerSansSuite: false,
    motifClassement: '',
    genererRapportIA: false,
  })
  const [isGeneratingRapport, setIsGeneratingRapport] = useState(false)

  const handleCloseModal = () => {
    // Restaurer le scroll lors de la fermeture
    document.body.style.overflow = ''
    // Réinitialiser les sélections d'agents pour l'intervention
    setSelectedAgentsIntervention([])
    setSearchAgentsIntervention('')
    // Réinitialiser les données du témoin si on ferme la modal témoin
    if (activeModal === 'temoin') {
      setTemoinData({ nom: '', telephone: '', declaration: '', anonyme: false })
    }
    setActiveModal(null)
  }

  const handleAction = async (action: () => Promise<any>) => {
    setLoading(true)
    try {
      const response = await action()
      
      // Vérifier si la réponse est un ApiResponse avec success/message
      if (response && typeof response === 'object' && 'success' in response) {
        // PRIORITÉ : Vérifier le status code HTTP avant tout
        const statusCode = response.statusCode || 200
        
        // Si le status code indique une erreur (>= 400), ne pas fermer la modal ni appeler onActionSuccess
        // Les toasts sont maintenant gérés automatiquement par le client API
        if (statusCode >= 400 || !response.success) {
          // Ne pas fermer la modal ni appeler onActionSuccess en cas d'erreur
          return
        }
        
        // Succès : fermer la modal et appeler le callback
        handleCloseModal()
        onActionSuccess?.()
      } else {
        // Si la réponse n'est pas un ApiResponse, considérer comme succès
        handleCloseModal()
        onActionSuccess?.()
      }
    } catch (error: any) {
      // Gérer les exceptions (erreurs réseau, erreurs non gérées par apiClient, etc.)
      // Les toasts sont maintenant gérés automatiquement par le client API
      console.error('Erreur lors de l\'action:', error)
    } finally {
      setLoading(false)
    }
  }

  // Déployer intervention
  const handleDeployIntervention = async () => {
    await handleAction(async () => {
      // Construire l'équipe à partir des agents sélectionnés
      const equipeToSend = selectedAgentsIntervention.length > 0
        ? selectedAgentsIntervention.map(agentId => {
            const agent = agentsIntervention.find(a => a.id === agentId)
            return agent ? {
              id: agent.id,
              nom: agent.nom,
              matricule: agent.matricule,
              role: agent.role
            } : null
          }).filter(Boolean)
        : []

      if (equipeToSend.length === 0) {
        toastManager.error('Veuillez sélectionner au moins un agent pour l\'équipe d\'intervention')
        return
      }

      await alertesService.deployIntervention(alerteId, {
        statut: interventionFormData.statut,
        equipe: equipeToSend,
        moyens: interventionFormData.moyens.filter(m => m),
        heureDepart: interventionFormData.heureDepart || new Date().toTimeString().substring(0, 5),
      })
      
      // Réinitialiser la sélection
      setSelectedAgentsIntervention([])
    })
  }

  // Mettre à jour intervention
  const handleUpdateIntervention = async () => {
    await handleAction(async () => {
      await alertesService.updateIntervention(alerteId, {
        statut: interventionFormData.statut,
        equipe: interventionFormData.equipe.filter(e => e.id && e.nom),
        moyens: interventionFormData.moyens.filter(m => m),
        heureArrivee: interventionFormData.heureArrivee,
        heureFin: interventionFormData.heureFin,
        tempsReponse: interventionFormData.tempsReponse,
      })
    })
  }

  // Ajouter évaluation
  const handleAddEvaluation = async () => {
    await handleAction(async () => {
      await alertesService.addEvaluation(alerteId, {
        situationReelle: evaluationData.situationReelle,
        victimes: evaluationData.victimes,
        degats: evaluationData.degats,
        mesuresPrises: evaluationData.mesuresPrises.filter(m => m),
        renforts: evaluationData.renforts,
        renfortsDetails: evaluationData.renfortsDetails,
      })
    })
  }

  // Ajouter rapport
  const handleAddRapport = async () => {
    await handleAction(async () => {
      await alertesService.addRapport(alerteId, {
        resume: rapportData.resume,
        conclusions: rapportData.conclusions.filter(c => c),
        recommandations: rapportData.recommandations.filter(r => r),
        suiteADonner: rapportData.suiteADonner,
      })
    })
  }

  // Ajouter témoin
  const handleAddTemoin = async () => {
    await handleAction(async () => {
      await alertesService.addTemoin(alerteId, temoinData)
      setTemoinData({ nom: '', telephone: '', declaration: '', anonyme: false })
    })
  }

  // Ajouter document
  const handleAddDocument = async () => {
    await handleAction(async () => {
      await alertesService.addDocument(alerteId, documentData)
      setDocumentData({ type: '', numero: '', date: '', description: '', url: '' })
    })
  }

  // Mettre à jour actions
  const handleUpdateActions = async () => {
    await handleAction(async () => {
      await alertesService.updateActions(alerteId, {
        actions: {
          immediate: actionsData.immediate.filter(a => a),
          preventive: actionsData.preventive.filter(a => a),
          suivi: actionsData.suivi.filter(a => a),
        },
      })
    })
  }

  // Charger les commissariats et agents pour la diffusion
  useEffect(() => {
    const loadDiffusionData = async () => {
      if (activeModal === 'broadcast') {
        setLoadingCommissariats(true)
        setLoadingAgents(true)
        try {
          // Charger tous les commissariats actifs
          const commissariatsResponse = await apiClient.get('/commissariats', { actif: true, limit: 100, page: 1 })
          if (commissariatsResponse.success && commissariatsResponse.data) {
            // L'API retourne { data: [...], pagination: {...} }
            const responseData = commissariatsResponse.data as any
            const data = responseData?.data || (Array.isArray(responseData) ? responseData : [])
            setCommissariats(Array.isArray(data) ? data : [])
          }

          // Charger les agents du commissariat ayant émis l'alerte
          if (commissariatId) {
            const agentsResponse = await commissariatService.getAgents(commissariatId)
            if (agentsResponse.success && agentsResponse.data) {
              setAgents(agentsResponse.data)
            }
          }
        } catch (error) {
          console.error('Erreur lors du chargement des données de diffusion:', error)
        } finally {
          setLoadingCommissariats(false)
          setLoadingAgents(false)
        }
      }
    }
    loadDiffusionData()
  }, [activeModal, commissariatId])

  // Charger les agents du commissariat pour l'intervention
  useEffect(() => {
    const loadAgentsIntervention = async () => {
      if ((activeModal === 'deploy-intervention' || activeModal === 'update-intervention') && commissariatId) {
        setLoadingAgentsIntervention(true)
        try {
          console.log('🔄 Chargement des agents du commissariat:', commissariatId)
          const agentsResponse = await commissariatService.getAgents(commissariatId)
          console.log('✅ Réponse agents:', agentsResponse)
          if (agentsResponse.success && agentsResponse.data) {
            setAgentsIntervention(agentsResponse.data)
            console.log('✅ Agents chargés:', agentsResponse.data.length)
          }
        } catch (error) {
          console.error('❌ Erreur lors du chargement des agents pour l\'intervention:', error)
        } finally {
          setLoadingAgentsIntervention(false)
        }
      }
    }
    loadAgentsIntervention()
  }, [activeModal, commissariatId])

  // Charger les agents pour l'assignation (commissariats destinataires)
  useEffect(() => {
    const loadAssignData = async () => {
      if (activeModal === 'assign' && commissariatId) {
        setLoadingAssignAgents(true)
        try {
          const agentsResponse = await commissariatService.getAgents(commissariatId)
          if (agentsResponse.success && agentsResponse.data) {
            setAssignAgents(agentsResponse.data)
          }
        } catch (error) {
          console.error('Erreur lors du chargement des agents pour l\'assignation:', error)
        } finally {
          setLoadingAssignAgents(false)
        }
      }
    }
    loadAssignData()
  }, [activeModal, commissariatId])
  
  // Charger les agents pour la diffusion interne (commissariat créateur)
  useEffect(() => {
    const loadDiffusionInterneData = async () => {
      if (activeModal === 'diffusion-interne' && commissariatId) {
        setLoadingDiffusionInterneAgents(true)
        try {
          const agentsResponse = await commissariatService.getAgents(commissariatId)
          if (agentsResponse.success && agentsResponse.data) {
            setDiffusionInterneAgents(agentsResponse.data)
          }
        } catch (error) {
          console.error('Erreur lors du chargement des agents pour la diffusion interne:', error)
        } finally {
          setLoadingDiffusionInterneAgents(false)
        }
      }
    }
    loadDiffusionInterneData()
  }, [activeModal, commissariatId])

  // Diffuser
  const handleBroadcast = () => {
    setActiveModal('broadcast')
  }

  const handleConfirmBroadcast = async () => {
    // Si diffusion générale, on ignore les sélections
    if (!diffusionGenerale) {
      if (selectedCommissariats.length === 0 && selectedAgents.length === 0) {
        toastManager.warning('Veuillez sélectionner au moins un commissariat ou un agent, ou choisir la diffusion générale')
        return
      }
    }

    await handleAction(async () => {
      await alertesService.broadcast(alerteId, {
        diffusionGenerale: diffusionGenerale,
        commissariatsIds: diffusionGenerale ? undefined : (selectedCommissariats.length > 0 ? selectedCommissariats : undefined),
        agentsIds: diffusionGenerale ? undefined : (selectedAgents.length > 0 ? selectedAgents : undefined),
      })
      setSelectedCommissariats([])
      setSelectedAgents([])
      setDiffusionGenerale(false)
      setActiveModal(null)
    })
  }

  const handleCloseBroadcastModal = () => {
    setSelectedCommissariats([])
    setSelectedAgents([])
    setDiffusionGenerale(false)
    setActiveModal(null)
    setSearchCommissariats('')
    setSearchAgents('')
  }

  // Assigner
  const handleAssign = () => {
    setActiveModal('assign')
  }
  
  const handleDiffusionInterne = () => {
    setActiveModal('diffusion-interne')
  }
  
  const handleConfirmDiffusionInterne = async () => {
    if (!diffusionInterneGenerale) {
      if (selectedDiffusionInterneAgents.length === 0) {
        toastManager.warning('Veuillez sélectionner au moins un agent, ou choisir la diffusion à tous les agents')
        return
      }
    }

    await handleAction(async () => {
      await alertesService.diffusionInterne(alerteId, {
        assigneeGenerale: diffusionInterneGenerale,
        agentsIds: diffusionInterneGenerale ? undefined : selectedDiffusionInterneAgents,
      })
      toastManager.success('Diffusion interne effectuée avec succès')
      setSelectedDiffusionInterneAgents([])
      setDiffusionInterneGenerale(false)
      setActiveModal(null)
    })
  }

  const handleConfirmAssign = async () => {
    // Si assignation générale, on ignore les sélections
    if (!assigneeGenerale) {
      if (selectedAssignAgents.length === 0) {
        toastManager.warning('Veuillez sélectionner au moins un agent, ou choisir l\'assignation à tous les agents')
        return
      }
    }

    await handleAction(async () => {
      await alertesService.assign(alerteId, {
        assigneeGenerale: assigneeGenerale,
        agentsIds: assigneeGenerale ? undefined : (selectedAssignAgents.length > 0 ? selectedAssignAgents : undefined),
      })
      toastManager.success('Assignation effectuée avec succès')
      setSelectedAssignAgents([])
      setAssigneeGenerale(false)
      setActiveModal(null)
    })
  }
  
  const handleCloseDiffusionInterneModal = () => {
    setActiveModal(null)
    setSelectedDiffusionInterneAgents([])
    setDiffusionInterneGenerale(false)
  }

  const handleCloseAssignModal = () => {
    setSelectedAssignAgents([])
    setAssigneeGenerale(false)
    setActiveModal(null)
    setSearchAssignAgents('')
  }

  // Filtrer les commissariats selon la recherche (nom, ville, région, code)
  const filteredCommissariats = commissariats.filter(commissariat => {
    if (!searchCommissariats.trim()) return true
    
    const search = searchCommissariats.toLowerCase().trim()
    const nom = commissariat.nom?.toLowerCase() || ''
    const ville = commissariat.ville?.toLowerCase() || ''
    const region = commissariat.region?.toLowerCase() || ''
    const code = commissariat.code?.toLowerCase() || ''
    
    return (
      nom.includes(search) ||
      ville.includes(search) ||
      region.includes(search) ||
      code.includes(search)
    )
  })

  // Filtrer les agents selon la recherche (nom, prénom, matricule, rôle)
  const filteredAgents = agents.filter(agent => {
    if (!searchAgents.trim()) return true
    
    const search = searchAgents.toLowerCase().trim()
    const nom = agent.nom?.toLowerCase() || ''
    const prenom = agent.prenom?.toLowerCase() || ''
    const matricule = agent.matricule?.toLowerCase() || ''
    const role = agent.role?.toLowerCase() || ''
    const nomComplet = `${prenom} ${nom}`.toLowerCase()
    
    return (
      nom.includes(search) ||
      prenom.includes(search) ||
      nomComplet.includes(search) ||
      matricule.includes(search) ||
      role.includes(search)
    )
  })

  // Filtrer les agents pour l'assignation selon la recherche
  const filteredAssignAgents = assignAgents.filter(agent => {
    if (!searchAssignAgents.trim()) return true
    
    const search = searchAssignAgents.toLowerCase().trim()
    const nom = agent.nom?.toLowerCase() || ''
    const prenom = agent.prenom?.toLowerCase() || ''
    const matricule = agent.matricule?.toLowerCase() || ''
    const role = agent.role?.toLowerCase() || ''
    const nomComplet = `${prenom} ${nom}`.toLowerCase()
    
    return (
      nom.includes(search) ||
      prenom.includes(search) ||
      nomComplet.includes(search) ||
      matricule.includes(search) ||
      role.includes(search)
    )
  })

  // Filtrer les agents pour l'intervention selon la recherche
  const filteredAgentsIntervention = agentsIntervention.filter(agent => {
    if (!searchAgentsIntervention.trim()) return true
    
    const search = searchAgentsIntervention.toLowerCase().trim()
    const nom = agent.nom?.toLowerCase() || ''
    const prenom = agent.prenom?.toLowerCase() || ''
    const matricule = agent.matricule?.toLowerCase() || ''
    const role = agent.role?.toLowerCase() || ''
    const nomComplet = `${prenom} ${nom}`.toLowerCase()
    
    return (
      nom.includes(search) ||
      prenom.includes(search) ||
      nomComplet.includes(search) ||
      matricule.includes(search) ||
      role.includes(search)
    )
  })

  // Ouvrir la modal de résolution
  const handleResolve = () => {
    setActiveModal('resolve')
  }
  
  // Confirmer la résolution
  const handleConfirmResolve = async () => {
    await handleAction(async () => {
      // Si classé sans suite, créer un rapport et archiver (pas résoudre)
      if (resolveData.classerSansSuite) {
        if (!resolveData.motifClassement || resolveData.motifClassement.trim() === '') {
          toastManager.error('Veuillez indiquer le motif du classement sans suite')
          return
        }
        
        // Créer un rapport avec le motif du classement
        await alertesService.addRapport(alerteId, {
          resume: `ALERTE CLASSÉE SANS SUITE\n\nMotif : ${resolveData.motifClassement}`,
          conclusions: [
            'Alerte classée sans suite après analyse',
            `Motif du classement : ${resolveData.motifClassement}`
          ],
          recommandations: [],
          suiteADonner: 'Aucune suite à donner - Dossier clos',
        })
        
        // Archiver l'alerte (statut ARCHIVEE, pas RESOLUE)
        await alertesService.archive(alerteId)
        toastManager.success('Alerte classée sans suite et archivée')
      } else {
        // Si pas de rapport existant, le rapport est obligatoire
        if (!hasRapport) {
          toastManager.error('Veuillez d\'abord ajouter un rapport final avant de résoudre l\'alerte')
          return
        }
        // Résoudre normalement (statut RESOLUE)
      await alertesService.resolve(alerteId)
        toastManager.success('Alerte résolue avec succès')
      }
    })
  }
  
  // Générer le rapport par IA
  const handleGenerateRapportIA = async () => {
    setIsGeneratingRapport(true)
    try {
      const response = await apiClient.post(`/alertes/${alerteId}/generer-rapport`, {})
      if (response.success && response.data) {
        // Le backend retourne { success, resume, conclusions, recommandations, mode, message }
        const rapportGenere = response.data
        setRapportData({
          resume: rapportGenere.resume || '',
          conclusions: rapportGenere.conclusions && rapportGenere.conclusions.length > 0 
            ? rapportGenere.conclusions 
            : [''],
          recommandations: rapportGenere.recommandations && rapportGenere.recommandations.length > 0 
            ? rapportGenere.recommandations 
            : [''],
          suiteADonner: '',
        })
        toastManager.success(rapportGenere.message || 'Rapport généré par IA avec succès')
      } else {
        toastManager.error(response.message || 'Erreur lors de la génération du rapport')
      }
    } catch (error: any) {
      console.error('Erreur génération rapport IA:', error)
      toastManager.error(error.response?.data?.message || 'Erreur lors de la génération du rapport par IA')
    } finally {
      setIsGeneratingRapport(false)
    }
  }

  // Clôturer
  const handleCloturer = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir clôturer cette alerte ?')) return
    await handleAction(async () => {
      await alertesService.cloturer(alerteId)
    })
  }

  // Récupérer l'utilisateur connecté pour les suivis
  const getCurrentUser = () => {
    try {
      const user = Cookies.get('user') || localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    } catch {
      return null
    }
  }

  // Ajouter suivi
  const handleAddSuivi = async (action: string, statut: string) => {
    const user = getCurrentUser()
    await handleAction(async () => {
      await alertesService.addSuivi(alerteId, {
        date: new Date().toISOString().split('T')[0],
        heure: new Date().toTimeString().substring(0, 5),
        action,
        statut,
        agentId: user?.id,
      })
    })
  }

  const canPerformActions = alerteStatut !== 'Archivée'

  return (
    <>
      {/* Panel d'actions */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Actions de traitement</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* Déployer/Mettre à jour intervention */}
          {canPerformActions && (
            <Button
              onClick={() => setActiveModal(hasIntervention ? 'update-intervention' : 'deploy-intervention')}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Shield className="w-4 h-4" />
              <span className="text-xs md:text-sm">{hasIntervention ? 'Mettre à jour Intervention' : 'Déployer Intervention'}</span>
            </Button>
          )}

          {/* Ajouter évaluation */}
          {hasIntervention && !hasEvaluation && canPerformActions && (
            <Button
              onClick={() => setActiveModal('evaluation')}
              className="bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center gap-2"
              disabled={loading}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span className="text-xs md:text-sm">Évaluer</span>
            </Button>
          )}

          {/* Ajouter rapport */}
          {hasEvaluation && !hasRapport && canPerformActions && (
            <Button
              onClick={() => setActiveModal('rapport')}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2"
              disabled={loading}
            >
              <FileText className="w-4 h-4" />
              <span className="text-xs md:text-sm">Rapport Final</span>
            </Button>
          )}

          {/* Ajouter témoin */}
          {canPerformActions && (
            <Button
              onClick={() => setActiveModal('temoin')}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
              disabled={loading}
            >
              <User className="w-4 h-4" />
              <span className="text-xs md:text-sm">Ajouter Témoin</span>
            </Button>
          )}

          {/* Ajouter document */}
          {canPerformActions && (
            <Button
              onClick={() => setActiveModal('document')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
              disabled={loading}
            >
              <FileText className="w-4 h-4" />
              <span className="text-xs md:text-sm">Ajouter Document</span>
            </Button>
          )}

          {/* Mettre à jour actions */}
          {canPerformActions && (
            <Button
              onClick={() => setActiveModal('actions')}
              className="bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Activity className="w-4 h-4" />
              <span className="text-xs md:text-sm">Actions Menées</span>
            </Button>
          )}

          {/* Diffuser */}
          {canPerformActions && !isDiffusee && (
            <Button
              onClick={handleBroadcast}
              className="bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Bell className="w-4 h-4" />
              <span className="text-xs md:text-sm">Diffuser</span>
            </Button>
          )}

          {/* Diffusion interne (agents du commissariat) */}
          {canPerformActions && (
            <Button
              onClick={handleDiffusionInterne}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Users className="w-4 h-4" />
              <span className="text-xs md:text-sm">Diffusion interne</span>
            </Button>
          )}

          {/* Assigner - Visible pour les commissariats destinataires */}
          {canPerformActions && canAssign && (
            <Button
              onClick={handleAssign}
              className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center gap-2"
              disabled={loading}
            >
              <UserCheck className="w-4 h-4" />
              <span className="text-xs md:text-sm">Assigner</span>
            </Button>
          )}
        

          {/* Résoudre */}
          {alerteStatut === 'En cours' && (
            <Button
              onClick={handleResolve}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
              disabled={loading}
            >
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs md:text-sm">Résoudre</span>
            </Button>
          )}

          {/* Clôturer */}
          {alerteStatut === 'Résolue' && (
            <Button
              onClick={handleCloturer}
              className="bg-gray-600 hover:bg-gray-700 text-white flex items-center justify-center gap-2"
              disabled={loading}
            >
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs md:text-sm">Clôturer</span>
            </Button>
          )}
        </div>
      </div>

      {/* Modal Déployer Intervention */}
      {activeModal === 'deploy-intervention' && (
        <Modal isOpen={true} onClose={handleCloseModal}>
          <ModalHeader>
            <ModalTitle>Déployer une Intervention</ModalTitle>
            <ModalClose />
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {/* Tooltip d'aide */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Activity className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-green-900 mb-2">
                      Déploiement d'une équipe d'intervention
                    </h4>
                    <ul className="text-xs text-green-800 space-y-1">
                      <li>• <strong>Équipe</strong> : Sélectionnez les agents qui vont intervenir</li>
                      <li>• <strong>Moyens</strong> : Précisez les véhicules et équipements déployés</li>
                      <li>• <strong>Heure de départ</strong> : Indiquez quand l'équipe part du commissariat</li>
                      <li>• Cette action marque le début de la réponse opérationnelle</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Équipe d'intervention</label>
                
                {/* Champ de recherche */}
                <div className="mb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Rechercher un agent (nom, prénom, matricule, rôle)..."
                      value={searchAgentsIntervention}
                      onChange={(e) => setSearchAgentsIntervention(e.target.value)}
                      className="pl-10"
                      inputSize="md"
                      variant="default"
                    />
                  </div>
                </div>

                {/* Liste des agents avec checkboxes */}
                {loadingAgentsIntervention ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-sm text-slate-600">Chargement des agents...</span>
                  </div>
                ) : agentsIntervention.length === 0 ? (
                  <div className="text-center py-8 text-sm text-slate-500">
                    Aucun agent disponible
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-2">
                    {agentsIntervention
                      .filter((agent) => {
                        if (!searchAgentsIntervention) return true
                        const search = searchAgentsIntervention.toLowerCase()
                        return (
                          agent.nom?.toLowerCase().includes(search) ||
                          agent.prenom?.toLowerCase().includes(search) ||
                          agent.matricule?.toLowerCase().includes(search) ||
                          agent.role?.toLowerCase().includes(search)
                        )
                      })
                      .map((agent) => (
                        <label
                          key={agent.id}
                          className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded cursor-pointer border border-transparent hover:border-blue-200 transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={selectedAgentsIntervention.includes(agent.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAgentsIntervention([...selectedAgentsIntervention, agent.id])
                              } else {
                                setSelectedAgentsIntervention(selectedAgentsIntervention.filter(id => id !== agent.id))
                              }
                            }}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-900">
                              {agent.prenom} {agent.nom}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-2">
                              <span>{agent.matricule}</span>
                              <span>•</span>
                              <span className="text-blue-600 font-medium">{agent.role}</span>
                            </div>
                          </div>
                        </label>
                      ))}
                  </div>
                )}
                
                {/* Afficher le nombre d'agents sélectionnés */}
                {selectedAgentsIntervention.length > 0 && (
                  <div className="mt-2 text-sm text-blue-600 font-medium">
                    {selectedAgentsIntervention.length} agent{selectedAgentsIntervention.length > 1 ? 's' : ''} sélectionné{selectedAgentsIntervention.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Moyens déployés</label>
                {interventionFormData.moyens.map((moyen, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={moyen}
                      onChange={(e) => {
                        const newMoyens = [...interventionFormData.moyens]
                        newMoyens[index] = e.target.value
                        setInterventionFormData({ ...interventionFormData, moyens: newMoyens })
                      }}
                    />
                    {interventionFormData.moyens.length > 1 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setInterventionFormData({
                          ...interventionFormData,
                          moyens: interventionFormData.moyens.filter((_, i) => i !== index)
                        })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setInterventionFormData({
                    ...interventionFormData,
                    moyens: [...interventionFormData.moyens, '']
                  })}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter moyen
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Heure de départ</label>
                  <Input
                    type="time"
                    value={interventionFormData.heureDepart}
                    onChange={(e) => setInterventionFormData({ ...interventionFormData, heureDepart: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Heure d'arrivée</label>
                  <Input
                    type="time"
                    value={interventionFormData.heureArrivee}
                    onChange={(e) => setInterventionFormData({ ...interventionFormData, heureArrivee: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Heure de fin</label>
                  <Input
                    type="time"
                    value={interventionFormData.heureFin}
                    onChange={(e) => setInterventionFormData({ ...interventionFormData, heureFin: e.target.value })}
                  />
                </div>
              </div>

              {hasIntervention && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Statut de l'intervention</label>
                  <Select
                    value={interventionFormData.statut}
                    onChange={(e) => setInterventionFormData({ ...interventionFormData, statut: e.target.value })}
                  >
                    <option value="DEPLOYEE">Déployée</option>
                    <option value="EN_ROUTE">En route</option>
                    <option value="SUR_PLACE">Sur place</option>
                    <option value="TERMINEE">Terminée</option>
                  </Select>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
              Annuler
            </Button>
            <Button onClick={hasIntervention ? handleUpdateIntervention : handleDeployIntervention} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : hasIntervention ? 'Mettre à jour' : 'Déployer'}
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Modal Mettre à jour Intervention */}
      {activeModal === 'update-intervention' && (
        <Modal isOpen={true} onClose={handleCloseModal}>
          <ModalHeader>
            <ModalTitle>Mettre à jour l'Intervention</ModalTitle>
            <ModalClose />
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {/* Tooltip d'aide */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">
                      Guide de mise à jour de l'intervention
                    </h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• <strong>Statut</strong> : Mettez à jour l'état d'avancement (En route → Sur place → Terminée)</li>
                      <li>• <strong>Équipe</strong> : Sélectionnez les agents déployés sur le terrain</li>
                      <li>• <strong>Moyens</strong> : Indiquez les ressources utilisées (véhicules, matériel...)</li>
                      <li>• <strong>Horaires</strong> : Renseignez les heures de départ, arrivée et fin</li>
                      <li>• Le temps de réponse sera calculé automatiquement</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Statut de l'intervention</label>
                <Select
                  value={interventionFormData.statut}
                  onChange={(e) => setInterventionFormData({ ...interventionFormData, statut: e.target.value })}
                >
                  <option value="DEPLOYEE">Déployée</option>
                  <option value="EN_ROUTE">En route</option>
                  <option value="SUR_PLACE">Sur place</option>
                  <option value="TERMINEE">Terminée</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Sélectionner les agents de l'équipe
                </label>
                {loadingAgentsIntervention ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span className="ml-2 text-sm text-slate-500">Chargement des agents...</span>
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                          type="text"
                          placeholder="Rechercher un agent..."
                          value={searchAgentsIntervention}
                          onChange={(e) => setSearchAgentsIntervention(e.target.value)}
                          className="pl-10 w-full"
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-2">
                      {agentsIntervention.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">Aucun agent disponible</p>
                      ) : filteredAgentsIntervention.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">Aucun résultat trouvé</p>
                      ) : (
                        filteredAgentsIntervention.map((agent) => {
                          const isSelected = interventionFormData.equipe.some((m: any) => 
                            typeof m === 'object' && m.id === agent.id
                          )
                          return (
                            <label
                              key={agent.id}
                              className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                      onChange={(e) => {
                                  if (e.target.checked) {
                                    setInterventionFormData({
                                      ...interventionFormData,
                                      equipe: [...interventionFormData.equipe, {
                                        id: agent.id,
                                        nom: `${agent.prenom} ${agent.nom}`,
                                        matricule: agent.matricule,
                                        role: agent.role || 'Agent'
                                      }]
                                    })
                                  } else {
                                    setInterventionFormData({
                                      ...interventionFormData,
                                      equipe: interventionFormData.equipe.filter((m: any) => 
                                        !(typeof m === 'object' && m.id === agent.id)
                                      )
                                    })
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-slate-900">
                                  {agent.prenom} {agent.nom}
                  </div>
                                <div className="text-xs text-slate-500">{agent.matricule} - {agent.role}</div>
                              </div>
                            </label>
                          )
                        })
                      )}
                    </div>
                    {interventionFormData.equipe.length > 0 && (
                      <p className="text-sm text-slate-600 mt-2">
                        {interventionFormData.equipe.length} agent(s) sélectionné(s)
                      </p>
                    )}
                  </>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Moyens déployés</label>
                {interventionFormData.moyens.map((moyen, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={moyen}
                      onChange={(e) => {
                        const newMoyens = [...interventionFormData.moyens]
                        newMoyens[index] = e.target.value
                        setInterventionFormData({ ...interventionFormData, moyens: newMoyens })
                      }}
                    />
                    {interventionFormData.moyens.length > 1 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setInterventionFormData({
                          ...interventionFormData,
                          moyens: interventionFormData.moyens.filter((_, i) => i !== index)
                        })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setInterventionFormData({
                    ...interventionFormData,
                    moyens: [...interventionFormData.moyens, '']
                  })}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter moyen
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Heure de départ</label>
                  <Input
                    type="time"
                    value={interventionFormData.heureDepart}
                    onChange={(e) => setInterventionFormData({ ...interventionFormData, heureDepart: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Heure d'arrivée</label>
                  <Input
                    type="time"
                    value={interventionFormData.heureArrivee}
                    onChange={(e) => setInterventionFormData({ ...interventionFormData, heureArrivee: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Heure de fin</label>
                  <Input
                    type="time"
                    value={interventionFormData.heureFin}
                    onChange={(e) => setInterventionFormData({ ...interventionFormData, heureFin: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Temps de réponse</label>
                <Input
                  value={interventionFormData.tempsReponse}
                  onChange={(e) => setInterventionFormData({ ...interventionFormData, tempsReponse: e.target.value })}
                  placeholder="Ex: 15 min"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
              Annuler
            </Button>
            <Button onClick={handleUpdateIntervention} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mettre à jour'}
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Modal Évaluation */}
      {activeModal === 'evaluation' && (
        <Modal isOpen={true} onClose={handleCloseModal}>
          <ModalHeader>
            <ModalTitle>Ajouter une Évaluation</ModalTitle>
            <ModalClose />
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {/* Tooltip d'aide */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <ClipboardCheck className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-purple-900 mb-2">
                      Évaluation de la situation sur place
                    </h4>
                    <ul className="text-xs text-purple-800 space-y-1">
                      <li>• <strong>Situation réelle</strong> : Décrivez ce qui a été constaté sur les lieux</li>
                      <li>• <strong>Victimes</strong> : Nombre de personnes affectées</li>
                      <li>• <strong>Dégâts</strong> : Nature et étendue des dommages</li>
                      <li>• <strong>Mesures prises</strong> : Actions immédiates effectuées sur place</li>
                      <li>• <strong>Renforts</strong> : Indiquez si des renforts supplémentaires sont nécessaires</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Situation réelle sur place</label>
                <Textarea
                  value={evaluationData.situationReelle}
                  onChange={(e) => setEvaluationData({ ...evaluationData, situationReelle: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nombre de victimes</label>
                  <Input
                    type="number"
                    min="0"
                    value={evaluationData.victimes}
                    onChange={(e) => setEvaluationData({ ...evaluationData, victimes: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Renforts nécessaires</label>
                  <Select
                    value={evaluationData.renforts ? 'oui' : 'non'}
                    onChange={(e) => setEvaluationData({ ...evaluationData, renforts: e.target.value === 'oui' })}
                  >
                    <option value="non">Non</option>
                    <option value="oui">Oui</option>
                  </Select>
                </div>
              </div>
              {evaluationData.renforts && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Détails des renforts</label>
                  <Textarea
                    value={evaluationData.renfortsDetails}
                    onChange={(e) => setEvaluationData({ ...evaluationData, renfortsDetails: e.target.value })}
                    rows={2}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Dégâts matériels</label>
                <Textarea
                  value={evaluationData.degats}
                  onChange={(e) => setEvaluationData({ ...evaluationData, degats: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Mesures prises</label>
                {evaluationData.mesuresPrises.map((mesure, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Textarea
                      value={mesure}
                      onChange={(e) => {
                        const newMesures = [...evaluationData.mesuresPrises]
                        newMesures[index] = e.target.value
                        setEvaluationData({ ...evaluationData, mesuresPrises: newMesures })
                      }}
                      rows={2}
                    />
                    {evaluationData.mesuresPrises.length > 1 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEvaluationData({
                          ...evaluationData,
                          mesuresPrises: evaluationData.mesuresPrises.filter((_, i) => i !== index)
                        })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setEvaluationData({
                    ...evaluationData,
                    mesuresPrises: [...evaluationData.mesuresPrises, '']
                  })}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter mesure
                </Button>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
              Annuler
            </Button>
            <Button onClick={handleAddEvaluation} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Modal Rapport */}
      {activeModal === 'rapport' && (
        <Modal isOpen={true} onClose={handleCloseModal}>
          <ModalHeader>
            <ModalTitle>Ajouter un Rapport Final</ModalTitle>
            <ModalClose />
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {/* Tooltip d'aide */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-indigo-900 mb-2">
                      Rédaction du rapport d'intervention
                    </h4>
                    <ul className="text-xs text-indigo-800 space-y-1">
                      <li>• <strong>Résumé</strong> : Synthèse complète de l'intervention effectuée</li>
                      <li>• <strong>Conclusions</strong> : Analyses et constats officiels</li>
                      <li>• <strong>Recommandations</strong> : Actions préventives pour éviter récurrence</li>
                      <li>• <strong>Suite à donner</strong> : Démarches ou procédures à engager</li>
                      <li>• Ce rapport servira de référence officielle pour l'affaire</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">Résumé</label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGenerateRapportIA}
                    disabled={isGeneratingRapport}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
                  >
                    {isGeneratingRapport ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Générer par IA
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  value={rapportData.resume}
                  onChange={(e) => setRapportData({ ...rapportData, resume: e.target.value })}
                  rows={4}
                  placeholder="Synthèse complète de l'intervention (ou cliquez sur 'Générer par IA')"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Conclusions</label>
                {rapportData.conclusions.map((conclusion, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Textarea
                      value={conclusion}
                      onChange={(e) => {
                        const newConclusions = [...rapportData.conclusions]
                        newConclusions[index] = e.target.value
                        setRapportData({ ...rapportData, conclusions: newConclusions })
                      }}
                      rows={2}
                    />
                    {rapportData.conclusions.length > 1 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setRapportData({
                          ...rapportData,
                          conclusions: rapportData.conclusions.filter((_, i) => i !== index)
                        })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setRapportData({
                    ...rapportData,
                    conclusions: [...rapportData.conclusions, '']
                  })}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter conclusion
                </Button>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Recommandations</label>
                {rapportData.recommandations.map((recommandation, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Textarea
                      value={recommandation}
                      onChange={(e) => {
                        const newRecommandations = [...rapportData.recommandations]
                        newRecommandations[index] = e.target.value
                        setRapportData({ ...rapportData, recommandations: newRecommandations })
                      }}
                      rows={2}
                    />
                    {rapportData.recommandations.length > 1 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setRapportData({
                          ...rapportData,
                          recommandations: rapportData.recommandations.filter((_, i) => i !== index)
                        })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setRapportData({
                    ...rapportData,
                    recommandations: [...rapportData.recommandations, '']
                  })}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter recommandation
                </Button>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Suite à donner</label>
                <Textarea
                  value={rapportData.suiteADonner}
                  onChange={(e) => setRapportData({ ...rapportData, suiteADonner: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
              Annuler
            </Button>
            <Button onClick={handleAddRapport} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Modal Témoin */}
      {activeModal === 'temoin' && (
        <Modal isOpen={true} onClose={handleCloseModal}>
          <ModalHeader>
            <ModalTitle>Ajouter un Témoin</ModalTitle>
            <ModalClose />
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {/* Tooltip d'aide */}
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <UserCheck className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-teal-900 mb-2">
                      Enregistrement d'un témoignage
                    </h4>
                    <ul className="text-xs text-teal-800 space-y-1">
                      <li>• <strong>Nom</strong> : Identité complète du témoin (peut rester anonyme)</li>
                      <li>• <strong>Téléphone</strong> : Contact pour recontact éventuel</li>
                      <li>• <strong>Déclaration</strong> : Retranscrivez fidèlement les propos du témoin</li>
                      <li>• <strong>Anonyme</strong> : Cochez pour protéger l'identité du témoin</li>
                      <li>• Les témoignages sont essentiels pour l'enquête</li>
                    </ul>
                  </div>
                </div>
              </div>
              {/* Option anonyme */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={temoinData.anonyme}
                    onChange={(e) => setTemoinData({ ...temoinData, anonyme: e.target.checked, nom: e.target.checked ? '' : temoinData.nom, telephone: e.target.checked ? '' : temoinData.telephone })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    {temoinData.anonyme ? (
                      <EyeOff className="w-5 h-5 text-slate-600" />
                    ) : (
                      <Eye className="w-5 h-5 text-slate-600" />
                    )}
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        Témoin anonyme
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {temoinData.anonyme 
                          ? 'Les informations personnelles ne seront pas enregistrées'
                          : 'Les informations personnelles seront enregistrées'}
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {/* Nom complet - masqué si anonyme */}
              {!temoinData.anonyme && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nom complet</label>
                  <Input
                    value={temoinData.nom}
                    onChange={(e) => setTemoinData({ ...temoinData, nom: e.target.value })}
                    placeholder="Nom et prénom du témoin"
                  />
                </div>
              )}

              {/* Téléphone - masqué si anonyme */}
              {!temoinData.anonyme && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone (optionnel)</label>
                  <Input
                    value={temoinData.telephone}
                    onChange={(e) => setTemoinData({ ...temoinData, telephone: e.target.value })}
                    placeholder="Numéro de téléphone"
                  />
                </div>
              )}

              {/* Déclaration */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Déclaration <span className="text-red-600">*</span>
                </label>
                <Textarea
                  value={temoinData.declaration}
                  onChange={(e) => setTemoinData({ ...temoinData, declaration: e.target.value })}
                  rows={5}
                  placeholder="Déclaration du témoin..."
                />
              </div>

              {/* Message informatif si anonyme */}
              {temoinData.anonyme && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <EyeOff className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-800">
                      <strong>Témoin anonyme :</strong> Seule la déclaration sera enregistrée. Aucune information personnelle ne sera stockée.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
              Annuler
            </Button>
            <Button 
              onClick={handleAddTemoin} 
              disabled={loading || !temoinData.declaration || (!temoinData.anonyme && !temoinData.nom)}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ajouter'}
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Modal Document */}
      {activeModal === 'document' && (
        <Modal isOpen={true} onClose={handleCloseModal}>
          <ModalHeader>
            <ModalTitle>Ajouter un Document</ModalTitle>
            <ModalClose />
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {/* Tooltip d'aide */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-amber-900 mb-2">
                      Attachement de documents officiels
                    </h4>
                    <ul className="text-xs text-amber-800 space-y-1">
                      <li>• <strong>Type</strong> : Nature du document (PV, rapport, constat, attestation...)</li>
                      <li>• <strong>Numéro</strong> : Référence officielle du document</li>
                      <li>• <strong>Date</strong> : Date d'établissement du document</li>
                      <li>• <strong>Description</strong> : Contenu ou objet du document</li>
                      <li>• <strong>URL</strong> : Lien vers le document numérisé si disponible</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Type de document</label>
                <Select
                  value={documentData.type}
                  onChange={(e) => setDocumentData({ ...documentData, type: e.target.value })}
                >
                  <option value="">Sélectionner...</option>
                  <option value="PV">Procès-verbal</option>
                  <option value="Photo">Photo</option>
                  <option value="Vidéo">Vidéo</option>
                  <option value="Rapport">Rapport</option>
                  <option value="Autre">Autre</option>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Numéro (optionnel)</label>
                  <Input
                    value={documentData.numero}
                    onChange={(e) => setDocumentData({ ...documentData, numero: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                  <Input
                    type="date"
                    value={documentData.date}
                    onChange={(e) => setDocumentData({ ...documentData, date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <Textarea
                  value={documentData.description}
                  onChange={(e) => setDocumentData({ ...documentData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">URL (optionnel)</label>
                <Input
                  value={documentData.url}
                  onChange={(e) => setDocumentData({ ...documentData, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
              Annuler
            </Button>
            <Button onClick={handleAddDocument} disabled={loading || !documentData.type || !documentData.description}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ajouter'}
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Modal Actions */}
      {activeModal === 'actions' && (
        <Modal isOpen={true} onClose={handleCloseModal}>
          <ModalHeader>
            <ModalTitle>Mettre à jour les Actions</ModalTitle>
            <ModalClose />
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              {/* Tooltip d'aide */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Activity className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-orange-900 mb-2">
                      Définition du plan d'action
                    </h4>
                    <ul className="text-xs text-orange-800 space-y-1">
                      <li>• <strong>Actions immédiates</strong> : Mesures urgentes à prendre (sécurisation, évacuation...)</li>
                      <li>• <strong>Actions préventives</strong> : Prévention de situations similaires</li>
                      <li>• <strong>Actions de suivi</strong> : Démarches à long terme (enquête, rapport...)</li>
                      <li>• Soyez précis et concret dans vos actions</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Actions immédiates</label>
                {actionsData.immediate.map((action, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={action}
                      onChange={(e) => {
                        const newActions = [...actionsData.immediate]
                        newActions[index] = e.target.value
                        setActionsData({ ...actionsData, immediate: newActions })
                      }}
                    />
                    {actionsData.immediate.length > 1 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setActionsData({
                          ...actionsData,
                          immediate: actionsData.immediate.filter((_, i) => i !== index)
                        })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setActionsData({
                    ...actionsData,
                    immediate: [...actionsData.immediate, '']
                  })}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Actions préventives</label>
                {actionsData.preventive.map((action, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={action}
                      onChange={(e) => {
                        const newActions = [...actionsData.preventive]
                        newActions[index] = e.target.value
                        setActionsData({ ...actionsData, preventive: newActions })
                      }}
                    />
                    {actionsData.preventive.length > 1 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setActionsData({
                          ...actionsData,
                          preventive: actionsData.preventive.filter((_, i) => i !== index)
                        })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setActionsData({
                    ...actionsData,
                    preventive: [...actionsData.preventive, '']
                  })}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Actions de suivi</label>
                {actionsData.suivi.map((action, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={action}
                      onChange={(e) => {
                        const newActions = [...actionsData.suivi]
                        newActions[index] = e.target.value
                        setActionsData({ ...actionsData, suivi: newActions })
                      }}
                    />
                    {actionsData.suivi.length > 1 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setActionsData({
                          ...actionsData,
                          suivi: actionsData.suivi.filter((_, i) => i !== index)
                        })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setActionsData({
                    ...actionsData,
                    suivi: [...actionsData.suivi, '']
                  })}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
              Annuler
            </Button>
            <Button onClick={handleUpdateActions} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Modal de diffusion */}
      {activeModal === 'broadcast' && (
        <Modal isOpen={true} onClose={handleCloseBroadcastModal}>
          <ModalHeader>
            <ModalTitle>Diffuser l'alerte</ModalTitle>
            <ModalClose />
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              {/* Tooltip d'aide */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">
                      Diffusion de l'alerte aux commissariats
                    </h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• <strong>Diffusion générale</strong> : Tous les commissariats recevront l'alerte</li>
                      <li>• <strong>Diffusion sélective</strong> : Choisissez les destinataires spécifiques</li>
                      <li>• Les commissariats notifiés pourront assigner l'alerte à leurs agents</li>
                      <li>• Une fois diffusée, l'alerte apparaît dans le dashboard des destinataires</li>
                    </ul>
                  </div>
                </div>
              </div>
              {/* Option Diffusion générale */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="diffusionType"
                    checked={diffusionGenerale}
                    onChange={() => {
                      setDiffusionGenerale(true)
                      setSelectedCommissariats([])
                      setSelectedAgents([])
                    }}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-blue-900">
                      Diffusion générale
                    </div>
                    <div className="text-xs text-blue-700 mt-1">
                      L'alerte sera visible par tous les commissariats
                    </div>
                  </div>
                </label>
              </div>

              {/* Option Diffusion sélective */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="diffusionType"
                    checked={!diffusionGenerale}
                    onChange={() => setDiffusionGenerale(false)}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-900">
                      Diffusion sélective
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      Choisir des commissariats et/ou agents spécifiques qui verront cette alerte
                    </div>
                  </div>
                </label>
              </div>

              {/* Sélection des commissariats (désactivée si diffusion générale) */}
              {!diffusionGenerale && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Commissariats destinataires
                  </label>
                  {loadingCommissariats ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="ml-2 text-sm text-slate-500">Chargement...</span>
                    </div>
                  ) : (
                    <>
                      {/* Champ de recherche pour les commissariats */}
                      <div className="mb-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            type="text"
                            placeholder="Rechercher par nom de commissariat, ville ou région..."
                            value={searchCommissariats}
                            onChange={(e) => setSearchCommissariats(e.target.value)}
                            className="pl-10 w-full"
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-2">
                        {commissariats.length === 0 ? (
                          <p className="text-sm text-slate-500 text-center py-4">Aucun commissariat disponible</p>
                        ) : filteredCommissariats.length === 0 ? (
                          <p className="text-sm text-slate-500 text-center py-4">Aucun résultat trouvé</p>
                        ) : (
                          filteredCommissariats.map((commissariat) => (
                            <label
                              key={commissariat.id}
                              className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedCommissariats.includes(commissariat.id)}
                                disabled={diffusionGenerale}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCommissariats([...selectedCommissariats, commissariat.id])
                                  } else {
                                    setSelectedCommissariats(selectedCommissariats.filter(id => id !== commissariat.id))
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-slate-900">{commissariat.nom}</div>
                                <div className="text-xs text-slate-500">{commissariat.ville} - {commissariat.region}</div>
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Sélection des agents (désactivée si diffusion générale) */}
              {!diffusionGenerale && commissariatId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Agents du commissariat ayant émis l'alerte
                  </label>
                  {loadingAgents ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="ml-2 text-sm text-slate-500">Chargement...</span>
                    </div>
                  ) : (
                    <>
                      {/* Champ de recherche pour les agents */}
                      <div className="mb-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            type="text"
                            placeholder="Rechercher un agent (nom, prénom, matricule, rôle)..."
                            value={searchAgents}
                            onChange={(e) => setSearchAgents(e.target.value)}
                            className="pl-10 w-full"
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-2">
                        {agents.length === 0 ? (
                          <p className="text-sm text-slate-500 text-center py-4">Aucun agent disponible</p>
                        ) : filteredAgents.length === 0 ? (
                          <p className="text-sm text-slate-500 text-center py-4">Aucun résultat trouvé</p>
                        ) : (
                          filteredAgents.map((agent) => (
                            <label
                              key={agent.id}
                              className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedAgents.includes(agent.id)}
                                disabled={diffusionGenerale}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedAgents([...selectedAgents, agent.id])
                                  } else {
                                    setSelectedAgents(selectedAgents.filter(id => id !== agent.id))
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-slate-900">
                                  {agent.prenom} {agent.nom}
                                </div>
                                <div className="text-xs text-slate-500">{agent.matricule} - {agent.role}</div>
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Résumé de la sélection */}
              {(diffusionGenerale || selectedCommissariats.length > 0 || selectedAgents.length > 0) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-blue-900 mb-1">Résumé de la diffusion :</div>
                  <div className="text-xs text-blue-700 space-y-1">
                    {diffusionGenerale ? (
                      <div className="font-semibold">Diffusion générale : tous les commissariats</div>
                    ) : (
                      <>
                        {selectedCommissariats.length > 0 && (
                          <div>{selectedCommissariats.length} commissariat(s) sélectionné(s)</div>
                        )}
                        {selectedAgents.length > 0 && (
                          <div>{selectedAgents.length} agent(s) sélectionné(s)</div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={handleCloseBroadcastModal} disabled={loading}>
              Annuler
            </Button>
            <Button 
              onClick={handleConfirmBroadcast} 
              disabled={loading || (!diffusionGenerale && selectedCommissariats.length === 0 && selectedAgents.length === 0)}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Diffusion...
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Diffuser
                </>
              )}
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Modal d'assignation */}
      {activeModal === 'assign' && (
        <Modal isOpen={true} onClose={handleCloseAssignModal}>
          <ModalHeader>
            <ModalTitle>Assigner l'alerte aux agents</ModalTitle>
            <ModalClose />
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              {/* Tooltip d'aide */}
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-cyan-900 mb-2">
                      Assignation de l'alerte aux agents
                    </h4>
                    <ul className="text-xs text-cyan-800 space-y-1">
                      <li>• <strong>Agents</strong> : Sélectionnez les agents qui traiteront cette alerte</li>
                      <li>• Les agents assignés recevront une notification immédiate</li>
                      <li>• Ils auront accès complet aux détails et pourront intervenir</li>
                      <li>• Choisissez des agents compétents pour le type d'alerte</li>
                      <li>• L'assignation engage la responsabilité des agents sélectionnés</li>
                    </ul>
                  </div>
                </div>
              </div>
              {/* Option Assignation générale */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="assignType"
                    checked={assigneeGenerale}
                    onChange={() => {
                      setAssigneeGenerale(true)
                      setSelectedAssignAgents([])
                    }}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-blue-900">
                      Assigner à tous les agents
                    </div>
                    <div className="text-xs text-blue-700 mt-1">
                      L'alerte sera visible par tous les agents de votre commissariat
                    </div>
                  </div>
                </label>
              </div>

              {/* Option Assignation sélective */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="assignType"
                    checked={!assigneeGenerale}
                    onChange={() => setAssigneeGenerale(false)}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-900">
                      Assignation sélective
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      Choisir des agents spécifiques qui verront cette alerte
                    </div>
                  </div>
                </label>
              </div>

              {/* Sélection des agents (désactivée si assignation générale) */}
              {!assigneeGenerale && currentUserCommissariatId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Agents du commissariat
                  </label>
                  {loadingAssignAgents ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="ml-2 text-sm text-slate-500">Chargement...</span>
                    </div>
                  ) : (
                    <>
                      {/* Champ de recherche pour les agents */}
                      <div className="mb-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            type="text"
                            placeholder="Rechercher un agent (nom, prénom, matricule, rôle)..."
                            value={searchAssignAgents}
                            onChange={(e) => setSearchAssignAgents(e.target.value)}
                            className="pl-10 w-full"
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-2">
                        {assignAgents.length === 0 ? (
                          <p className="text-sm text-slate-500 text-center py-4">Aucun agent disponible</p>
                        ) : filteredAssignAgents.length === 0 ? (
                          <p className="text-sm text-slate-500 text-center py-4">Aucun résultat trouvé</p>
                        ) : (
                          filteredAssignAgents.map((agent) => (
                            <label
                              key={agent.id}
                              className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedAssignAgents.includes(agent.id)}
                                disabled={assigneeGenerale}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedAssignAgents([...selectedAssignAgents, agent.id])
                                  } else {
                                    setSelectedAssignAgents(selectedAssignAgents.filter(id => id !== agent.id))
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-slate-900">
                                  {agent.prenom} {agent.nom}
                                </div>
                                <div className="text-xs text-slate-500">{agent.matricule} - {agent.role}</div>
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Résumé de la sélection */}
              {(assigneeGenerale || selectedAssignAgents.length > 0) && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-purple-900 mb-1">Résumé de l'assignation :</div>
                  <div className="text-xs text-purple-700 space-y-1">
                    {assigneeGenerale ? (
                      <div className="font-semibold">Assignation générale : tous les agents du commissariat</div>
                    ) : (
                      <div>{selectedAssignAgents.length} agent(s) sélectionné(s)</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={handleCloseAssignModal} disabled={loading}>
              Annuler
            </Button>
            <Button 
              onClick={handleConfirmAssign} 
              disabled={loading || (!assigneeGenerale && selectedAssignAgents.length === 0)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Assignation...
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Assigner
                </>
              )}
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Modal de diffusion interne */}
      {activeModal === 'diffusion-interne' && (
        <Modal isOpen={true} onClose={handleCloseDiffusionInterneModal}>
          <ModalHeader>
            <ModalTitle>Diffusion interne aux agents</ModalTitle>
            <ModalClose />
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              {/* Tooltip d'aide */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-purple-900 mb-2">
                      Diffusion interne au commissariat
                    </h4>
                    <ul className="text-xs text-purple-800 space-y-1">
                      <li>• <strong>Diffusion interne</strong> : Partagez cette alerte avec vos agents</li>
                      <li>• Les agents recevront une notification</li>
                      <li>• Utile pour mobiliser l'équipe sur une alerte</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Option diffusion générale */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="diffusionInterneType"
                    checked={diffusionInterneGenerale}
                    onChange={() => {
                      setDiffusionInterneGenerale(true)
                      setSelectedDiffusionInterneAgents([])
                    }}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-blue-900">
                      Diffuser à tous les agents
                    </div>
                    <div className="text-xs text-blue-700 mt-1">
                      Tous les agents du commissariat seront informés
                    </div>
                  </div>
                </label>
              </div>

              {/* Option diffusion sélective */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="diffusionInterneType"
                    checked={!diffusionInterneGenerale}
                    onChange={() => setDiffusionInterneGenerale(false)}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-900">
                      Diffusion sélective
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      Choisir des agents spécifiques
                    </div>
                  </div>
                </label>
              </div>

              {/* Sélection des agents */}
              {!diffusionInterneGenerale && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Sélectionner les agents
                  </label>
                  {loadingDiffusionInterneAgents ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                      <span className="ml-2 text-sm text-slate-500">Chargement...</span>
                    </div>
                  ) : (
                    <>
                      <div className="mb-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            type="text"
                            placeholder="Rechercher un agent..."
                            value={searchDiffusionInterneAgents}
                            onChange={(e) => setSearchDiffusionInterneAgents(e.target.value)}
                            className="pl-10 w-full"
                          />
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-2">
                        {diffusionInterneAgents.length === 0 ? (
                          <p className="text-sm text-slate-500 text-center py-4">Aucun agent disponible</p>
                        ) : (
                          diffusionInterneAgents
                            .filter(agent => {
                              if (!searchDiffusionInterneAgents.trim()) return true
                              const search = searchDiffusionInterneAgents.toLowerCase()
                              const nom = agent.nom?.toLowerCase() || ''
                              const prenom = agent.prenom?.toLowerCase() || ''
                              const matricule = agent.matricule?.toLowerCase() || ''
                              return nom.includes(search) || prenom.includes(search) || matricule.includes(search)
                            })
                            .map((agent) => (
                              <label
                                key={agent.id}
                                className="flex items-center gap-3 p-3 hover:bg-purple-50 rounded-lg cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedDiffusionInterneAgents.includes(agent.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedDiffusionInterneAgents([...selectedDiffusionInterneAgents, agent.id])
                                    } else {
                                      setSelectedDiffusionInterneAgents(selectedDiffusionInterneAgents.filter(id => id !== agent.id))
                                    }
                                  }}
                                  className="w-5 h-5 text-purple-600 focus:ring-purple-500 rounded"
                                />
                                <div className="flex-1">
                                  <div className="text-sm font-semibold text-slate-900">
                                    {agent.prenom} {agent.nom}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {agent.matricule} • {agent.role}
                                  </div>
                                </div>
                              </label>
                            ))
                        )}
                      </div>
                      {selectedDiffusionInterneAgents.length > 0 && (
                        <div className="mt-2 text-sm text-purple-600 font-medium">
                          {selectedDiffusionInterneAgents.length} agent(s) sélectionné(s)
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={handleCloseDiffusionInterneModal} disabled={loading}>
              Annuler
            </Button>
            <Button 
              onClick={handleConfirmDiffusionInterne}
              disabled={loading || (!diffusionInterneGenerale && selectedDiffusionInterneAgents.length === 0)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Diffusion...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Diffuser
                </>
              )}
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Modal de résolution */}
      {activeModal === 'resolve' && (
        <Modal isOpen={true} onClose={handleCloseModal}>
          <ModalHeader>
            <ModalTitle>Résoudre l'alerte</ModalTitle>
            <ModalClose />
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {/* Tooltip d'aide */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-green-900 mb-2">
                      Résolution de l'alerte
                    </h4>
                    <ul className="text-xs text-green-800 space-y-1">
                      <li>• <strong>Classer sans suite</strong> : Si l'alerte ne nécessite pas d'action supplémentaire</li>
                      <li>• <strong>Rapport obligatoire</strong> : Si résolue normalement, un rapport final est requis</li>
                      <li>• Une alerte résolue passe au statut "RESOLUE"</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Option Classer sans suite */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={resolveData.classerSansSuite}
                    onChange={(e) => setResolveData({ ...resolveData, classerSansSuite: e.target.checked })}
                    className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500 mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-amber-900">
                      Classer sans suite
                    </div>
                    <p className="text-xs text-amber-700 mt-1">
                      Cette alerte ne nécessite pas de rapport final ni d'action supplémentaire
                    </p>
                  </div>
                </label>
              </div>

              {/* Motif du classement si sans suite */}
              {resolveData.classerSansSuite && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Motif du classement sans suite
                  </label>
                  <Textarea
                    value={resolveData.motifClassement}
                    onChange={(e) => setResolveData({ ...resolveData, motifClassement: e.target.value })}
                    rows={3}
                    placeholder="Expliquez pourquoi cette alerte est classée sans suite..."
                  />
                </div>
              )}

              {/* Message si rapport requis */}
              {!resolveData.classerSansSuite && !hasRapport && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-red-900 mb-1">
                        Rapport final requis
                      </div>
                      <p className="text-xs text-red-700 mb-3">
                        Pour résoudre cette alerte normalement, vous devez d'abord ajouter un rapport final.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveModal('rapport')
                        }}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Ajouter un rapport
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Message si rapport existe */}
              {!resolveData.classerSansSuite && hasRapport && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-green-800">
                      ✓ Rapport final disponible. L'alerte peut être résolue.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
              Annuler
            </Button>
            <Button 
              onClick={handleConfirmResolve} 
              disabled={loading || (!resolveData.classerSansSuite && !hasRapport)}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Résolution...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {resolveData.classerSansSuite ? 'Classer sans suite' : 'Résoudre l\'alerte'}
                </>
              )}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  )
}

