"use client"

import React, { useState, useEffect } from 'react'
import { AlertTriangle, MapPin, User, Tag, Plus, X, Loader2, Car, UserX, Ambulance, Flame, Shield, Users, Bell, Wrench, Radio, Sparkles, Search, Building2, Info, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { alertesService, commissariatService } from '@/lib/api/services'
import { apiClient } from '@/lib/api/client'
import { TypeAlerte, NiveauAlerte } from '@/lib/api/services'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { toastManager } from '@/lib/toast-manager'

type AlertFormData = {
  titre: string
  description: string
  type: TypeAlerte | ''
  niveau: NiveauAlerte
  lieu: string
  latitude: string
  longitude: string
  contexte?: string
  risques: string[]
  personneConcernee?: {
    nom: string
    telephone?: string
    relation?: string
    description?: string
  }
  vehicule?: {
    immatriculation: string
    marque?: string
    modele?: string
    couleur?: string
    annee?: string
  }
  suspect?: {
    nom: string
    description: string
    age?: string
    adresse?: string
    motif?: string
  }
}

const alertTypes = [
  { value: TypeAlerte.URGENCE_SECURITE, label: 'Urgence sécurité - Braquage, prise d\'otage, menace', priority: 'high' },
  { value: TypeAlerte.ACCIDENT, label: 'Accident - Collision, carambolage, accident corporel', priority: 'high' },
  { value: TypeAlerte.AGGRESSION, label: 'Aggression - Agression physique, violence', priority: 'high' },
  { value: TypeAlerte.INCENDIE, label: 'Incendie - Feu, explosion, fumée suspecte', priority: 'high' },
  { value: TypeAlerte.VEHICULE_VOLE, label: 'Véhicule volé - Vol de voiture, moto, camion', priority: 'medium' },
  { value: TypeAlerte.SUSPECT_RECHERCHE, label: 'Suspect recherché - Personne recherchée, fugitif', priority: 'medium' },
  { value: TypeAlerte.ALERTE_GENERALE, label: 'Alerte générale - Disparition, enlèvement, témoin', priority: 'medium' },
  { value: TypeAlerte.AMBER, label: 'Alerte Amber - Enlèvement d\'enfant, disparition mineur', priority: 'high' },
  { value: TypeAlerte.MAINTENANCE_SYSTEME, label: 'Maintenance système - Arrêt planifié, mise à jour', priority: 'low' },
  { value: TypeAlerte.AUTRE, label: 'Autre - Autre type d\'alerte non listée', priority: 'low' }
]

const priorityLevels = [
  { value: NiveauAlerte.FAIBLE, label: 'Faible', color: 'bg-green-50 border-green-300 text-green-700' },
  { value: NiveauAlerte.MOYEN, label: 'Moyenne', color: 'bg-yellow-50 border-yellow-300 text-yellow-700' },
  { value: NiveauAlerte.ELEVE, label: 'Élevée', color: 'bg-orange-50 border-orange-300 text-orange-700' },
  { value: NiveauAlerte.CRITIQUE, label: 'Critique', color: 'bg-red-50 border-red-300 text-red-700' }
]

interface AlertFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: any) => void
  onSuccess?: () => void
}

export default function AlertForm({ isOpen, onClose, onSubmit, onSuccess }: AlertFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<AlertFormData>({
    titre: '',
    description: '',
    type: '',
    niveau: NiveauAlerte.MOYEN,
    lieu: '',
    latitude: '',
    longitude: '',
    contexte: '',
    risques: [],
  })

  const [currentTag, setCurrentTag] = useState('')
  const [useGPS, setUseGPS] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [commissariatId, setCommissariatId] = useState<string | null>(null)
  
  // État pour les steps
  const [currentStep, setCurrentStep] = useState(1)
  
  // États pour la diffusion
  const [showDiffusionModal, setShowDiffusionModal] = useState(false)
  const [commissariats, setCommissariats] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [selectedCommissariats, setSelectedCommissariats] = useState<string[]>([])
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [diffusionGenerale, setDiffusionGenerale] = useState(false)
  const [loadingCommissariats, setLoadingCommissariats] = useState(false)
  const [loadingAgents, setLoadingAgents] = useState(false)
  const [searchCommissariats, setSearchCommissariats] = useState('')
  const [searchAgents, setSearchAgents] = useState('')
  const [isDiffusing, setIsDiffusing] = useState(false)

  // Récupérer le commissariatId de l'utilisateur connecté
  useEffect(() => {
    const getCommissariatId = (): string | null => {
      try {
        // Essayer d'abord commissariat_id (le bon nom stocké lors du login)
        const directId = Cookies.get('commissariat_id') || localStorage.getItem('commissariat_id')
        if (directId) return directId

        // Fallback sur l'ancien nom pour compatibilité
        const oldId = Cookies.get('user_commissariat_id') || localStorage.getItem('user_commissariat_id')
        if (oldId) return oldId

        const commissariatData = Cookies.get('user_commissariat') || localStorage.getItem('user_commissariat')
        if (commissariatData) {
          const commissariat = JSON.parse(commissariatData)
          return commissariat?.id || null
        }
        return null
      } catch (e) {
        console.error('Erreur lors de la récupération du commissariat:', e)
        return null
      }
    }

    setCommissariatId(getCommissariatId())
  }, [])

  useEffect(() => {
    if (useGPS && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }))
        },
        (error) => {
          alert('Impossible d\'obtenir la position GPS')
          setUseGPS(false)
        }
      )
    }
  }, [useGPS])

  const handleChange = (name: keyof AlertFormData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const addTag = () => {
    if (currentTag.trim() && !formData.risques.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        risques: [...prev.risques, currentTag.trim()]
      }))
      setCurrentTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      risques: prev.risques.filter(t => t !== tag)
    }))
  }

  const genererAvecIA = async () => {
    // Vérifier que les champs requis sont remplis
    if (!formData.type || !formData.titre || !formData.lieu) {
      setError('Veuillez remplir au minimum le type, le titre et le lieu avant de générer avec IA')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const token = Cookies.get('auth_token') || localStorage.getItem('auth_token')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/alertes/generer-description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: formData.type,
          titre: formData.titre,
          lieu: formData.lieu,
          risques: formData.risques,
          informationsComplementaires: {
            vehicule: formData.vehicule,
            personneConcernee: formData.personneConcernee,
            suspect: formData.suspect,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.message || 'Erreur lors de la génération avec IA'
        
        // Afficher une notification d'erreur
        const errorMsg = document.createElement('div')
        errorMsg.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 max-w-md'
        errorMsg.innerHTML = `
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span class="text-sm">${errorMessage}</span>
        `
        document.body.appendChild(errorMsg)
        setTimeout(() => errorMsg.remove(), 6000)
        
        throw new Error(errorMessage)
      }

      const result = await response.json()

      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          description: result.data.description,
          contexte: result.data.contexte,
        }))

        // Afficher un message de succès
        const successMsg = document.createElement('div')
        successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2'
        successMsg.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>✨ Contenu généré avec succès par l'IA OpenAI !</span>
        `
        document.body.appendChild(successMsg)
        setTimeout(() => successMsg.remove(), 4000)
      } else {
        // Erreur dans la réponse
        const errorMsg = document.createElement('div')
        errorMsg.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2'
        errorMsg.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span>Erreur lors de la génération du contenu</span>
        `
        document.body.appendChild(errorMsg)
        setTimeout(() => errorMsg.remove(), 5000)
        
        setError('Erreur lors de la génération du contenu')
      }
    } catch (err: any) {
      console.error('Erreur génération IA:', err)
      
      // Afficher une notification d'erreur si ce n'est pas déjà fait
      if (!document.querySelector('.fixed.top-4.right-4.bg-red-500')) {
        const errorMsg = document.createElement('div')
        errorMsg.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 max-w-md'
        errorMsg.innerHTML = `
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="text-sm">${err.message || 'Erreur lors de la génération avec IA'}</span>
        `
        document.body.appendChild(errorMsg)
        setTimeout(() => errorMsg.remove(), 6000)
      }
      
      setError(err.message || 'Erreur lors de la génération avec IA')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.titre || !formData.description || !formData.type || !formData.lieu) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (!commissariatId) {
      setError('Commissariat non trouvé. Veuillez vous reconnecter.')
      return
    }

    // Passer au step 2 (diffusion)
    setError(null)
    setCurrentStep(2)
    setShowDiffusionModal(true)
    loadDiffusionData()
  }

  // Charger les commissariats et agents pour la diffusion
  const loadDiffusionData = async () => {
    setLoadingCommissariats(true)
    setLoadingAgents(true)
    try {
      // Charger tous les commissariats actifs
      const commissariatsResponse = await apiClient.get('/commissariats', { actif: true, limit: 100, page: 1 })
      if (commissariatsResponse.success && commissariatsResponse.data) {
        const responseData = commissariatsResponse.data as any
        const data = responseData?.data || (Array.isArray(responseData) ? responseData : [])
        setCommissariats(Array.isArray(data) ? data : [])
      }

      // Charger les agents du commissariat ayant créé l'alerte
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

  // Créer l'alerte dans la base de données
  const createAlerte = async () => {
    if (!commissariatId) {
      setError('Commissariat non trouvé. Veuillez vous reconnecter.')
      return null
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const apiData = {
        titre: formData.titre,
        description: formData.description,
        type: formData.type as TypeAlerte,
        niveau: formData.niveau,
        lieu: formData.lieu,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        contexte: formData.contexte || undefined,
        risques: formData.risques.length > 0 ? formData.risques : undefined,
        personneConcernee: formData.personneConcernee,
        vehicule: formData.vehicule,
        suspect: formData.suspect,
        commissariatId: commissariatId,
        dateAlerte: new Date().toISOString(),
      }

      const response = await alertesService.create(apiData)
      
      if (response.success && response.data) {
        return response.data.id
      } else {
        setError(response.message || 'Erreur lors de la création de l\'alerte')
        return null
      }
    } catch (err: any) {
      console.error('Erreur lors de la création de l\'alerte:', err)
      setError(err.response?.data?.message || err.message || 'Erreur lors de la création de l\'alerte')
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  // Confirmer la diffusion et créer l'alerte
  const handleConfirmDiffusion = async () => {
    // Si diffusion générale, on ignore les sélections
    if (!diffusionGenerale) {
      if (selectedCommissariats.length === 0 && selectedAgents.length === 0) {
        toastManager.warning('Veuillez sélectionner au moins un commissariat ou un agent, ou choisir la diffusion générale')
        return
      }
    }

    setIsDiffusing(true)
    try {
      // Créer l'alerte d'abord
      const alerteId = await createAlerte()
      
      if (!alerteId) {
        setIsDiffusing(false)
        return
      }

      // Ensuite diffuser l'alerte
      await alertesService.broadcast(alerteId, {
        diffusionGenerale: diffusionGenerale,
        commissariatsIds: diffusionGenerale ? undefined : (selectedCommissariats.length > 0 ? selectedCommissariats : undefined),
        agentsIds: diffusionGenerale ? undefined : (selectedAgents.length > 0 ? selectedAgents : undefined),
      })
      
      // Réinitialiser le formulaire
      setFormData({
        titre: '',
        description: '',
        type: '',
        niveau: NiveauAlerte.MOYEN,
        lieu: '',
        latitude: '',
        longitude: '',
        contexte: '',
        risques: [],
      })
      setUseGPS(false)
      setError(null)
      
      // Réinitialiser les sélections de diffusion
      setSelectedCommissariats([])
      setSelectedAgents([])
      setDiffusionGenerale(false)
      setShowDiffusionModal(false)
      setCurrentStep(1) // Retour au step 1
      
      // Appeler les callbacks si fournis
      if (onSubmit) {
        onSubmit({ id: alerteId })
      }
      if (onSuccess) {
        onSuccess()
      }
      
      // Fermer le formulaire
      onClose()
      
      // Réactiver le scroll du body avant la redirection
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'unset'
        document.body.style.paddingRight = '0px'
      }
      
      // Petit délai pour s'assurer que la modal se ferme complètement
      setTimeout(() => {
        router.push(`/gestion/alertes/${alerteId}`)
      }, 100)
    } catch (error) {
      console.error('Erreur lors de la diffusion:', error)
    } finally {
      setIsDiffusing(false)
    }
  }

  // Ne pas diffuser maintenant, créer l'alerte sans diffusion
  const handleSkipDiffusion = async () => {
    setIsDiffusing(true)
    try {
      // Créer l'alerte sans diffusion
      const alerteId = await createAlerte()
      
      if (!alerteId) {
        setIsDiffusing(false)
        return
      }

      // Réinitialiser le formulaire
      setFormData({
        titre: '',
        description: '',
        type: '',
        niveau: NiveauAlerte.MOYEN,
        lieu: '',
        latitude: '',
        longitude: '',
        contexte: '',
        risques: [],
      })
      setUseGPS(false)
      setError(null)
      
      // Réinitialiser les sélections de diffusion
      setSelectedCommissariats([])
      setSelectedAgents([])
      setDiffusionGenerale(false)
      setShowDiffusionModal(false)
      setCurrentStep(1) // Retour au step 1
      
      // Appeler les callbacks si fournis
      if (onSubmit) {
        onSubmit({ id: alerteId })
      }
      if (onSuccess) {
        onSuccess()
      }
      
      // Fermer le formulaire
      onClose()
      
      // Réactiver le scroll du body avant la redirection
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'unset'
        document.body.style.paddingRight = '0px'
      }
      
      // Petit délai pour s'assurer que la modal se ferme complètement
      setTimeout(() => {
        router.push(`/gestion/alertes/${alerteId}`)
      }, 100)
    } catch (error) {
      console.error('Erreur lors de la création de l\'alerte:', error)
    } finally {
      setIsDiffusing(false)
    }
  }

  // Filtrer les commissariats selon la recherche
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

  // Filtrer les agents selon la recherche
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

  // Navigation entre les steps
  const handleNextStep = () => {
    // Valider les champs obligatoires avant de passer au step 2
    if (!formData.titre || !formData.description || !formData.type) {
      setError('Veuillez remplir tous les champs obligatoires (titre, description, type)')
      return
    }

    if (!commissariatId) {
      setError('Commissariat non trouvé. Veuillez vous reconnecter.')
      return
    }

    setError(null)
    setCurrentStep(2)
    loadDiffusionData()
  }

  const handlePreviousStep = () => {
    setCurrentStep(1)
    setError(null)
  }

  const handleCloseModal = () => {
    setCurrentStep(1)
    setShowDiffusionModal(false)
    setError(null)
    
    // Forcer le déblocage du scroll
    if (typeof document !== 'undefined') {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      document.documentElement.style.overflow = ''
    }
    
    onClose()
  }

  return (
    <>
    <Modal isOpen={isOpen} onClose={handleCloseModal}>
      <ModalHeader>
        <ModalTitle>
          <div className="flex items-center justify-between w-full pr-8">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <span>Nouvelle Alerte</span>
            </div>
            {/* Indicateur de progression */}
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-3 py-1 rounded-full font-medium transition-colors ${currentStep === 1 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                1. Informations
              </span>
              <span className="text-gray-400">→</span>
              <span className={`px-3 py-1 rounded-full font-medium transition-colors ${currentStep === 2 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2. Diffusion
              </span>
            </div>
          </div>
        </ModalTitle>
        <ModalClose onClick={handleCloseModal} />
      </ModalHeader>

      <ModalBody>
        <div className="space-y-5">
          {/* Tooltip d'aide contextuel selon le step */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                {currentStep === 1 ? (
                  <>
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">
                      Étape 1/2 : Renseignez les informations de l'alerte
                    </h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• <strong>Titre</strong> : Décrivez brièvement la situation (Ex: "Accident sur autoroute A1")</li>
                      <li>• <strong>Type</strong> : Choisissez le type d'alerte correspondant</li>
                      <li>• <strong>Description</strong> : Détaillez les faits observés</li>
                      <li>• <strong>Lieu</strong> : Indiquez la localisation précise</li>
                      <li>• <strong>Risques</strong> : Identifiez les dangers potentiels</li>
                      <li>• <strong>IA</strong> : Utilisez le bouton ✨ pour générer une description automatique</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">
                      Étape 2/2 : Configurez la diffusion de l'alerte
                    </h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• <strong>Diffusion générale</strong> : L'alerte sera visible par tous les commissariats</li>
                      <li>• <strong>Diffusion sélective</strong> : Choisissez les commissariats et/ou agents destinataires</li>
                      <li>• <strong>Recherche</strong> : Utilisez la barre de recherche pour trouver rapidement</li>
                      <li>• <strong>Options</strong> : "Créer sans diffuser" ou "Créer et diffuser"</li>
                      <li>• Vous pourrez diffuser l'alerte plus tard depuis sa page de détail</li>
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* STEP 1: Formulaire d'informations */}
          {currentStep === 1 && (
          <div className="space-y-5">{/* Tout le formulaire actuel ici */}

          {/* Titre */}
          <div>
            <label htmlFor="titre" className="block text-sm font-semibold text-slate-700 mb-2">
              Titre de l'alerte <span className="text-red-600">*</span>
            </label>
            <Input
              id="titre"
              name="titre"
              value={formData.titre}
              onChange={(e) => handleChange('titre', e.target.value)}
              placeholder="Ex: Accident sur l'autoroute A1"
              inputSize="md"
              variant="default"
              maxLength={255}
            />
            <p className="text-xs text-slate-500 mt-1">{formData.titre.length}/255 caractères</p>
          </div>

          {/* Type et Priorité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-semibold text-slate-700 mb-2">
                Type d'alerte <span className="text-red-600">*</span>
              </label>
              <Select
                id="type"
                name="type"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                selectSize="md"
                variant="default"
              >
                <option value="">Sélectionner un type</option>
                {alertTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Niveau de priorité <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {priorityLevels.map(level => (
                  <label
                    key={level.value}
                    className={`cursor-pointer border-2 rounded-lg p-2 text-center text-xs font-semibold transition-all ${
                      formData.niveau === level.value
                        ? level.color
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="niveau"
                      value={level.value}
                      checked={formData.niveau === level.value}
                      onChange={(e) => handleChange('niveau', e.target.value as NiveauAlerte)}
                      className="sr-only"
                    />
                    {level.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Localisation */}
          <div>
            <label htmlFor="lieu" className="block text-sm font-semibold text-slate-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Lieu de l'incident <span className="text-red-600">*</span>
            </label>
            <Input
              id="lieu"
              name="lieu"
              value={formData.lieu}
              onChange={(e) => handleChange('lieu', e.target.value)}
              placeholder="Ex: Autoroute A1, sortie 15, direction Paris"
              inputSize="md"
              variant="default"
              maxLength={255}
            />
          </div>

          {/* Coordonnées GPS */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-700">Coordonnées GPS (optionnel)</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useGPS}
                  onChange={(e) => setUseGPS(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <span className="text-sm text-slate-600">Utiliser ma position</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                step="0.000001"
                value={formData.latitude}
                onChange={(e) => handleChange('latitude', e.target.value)}
                placeholder="Latitude (-90 à 90)"
                inputSize="sm"
                variant="default"
              />
              <Input
                type="number"
                step="0.000001"
                value={formData.longitude}
                onChange={(e) => handleChange('longitude', e.target.value)}
                placeholder="Longitude (-180 à 180)"
                inputSize="sm"
                variant="default"
              />
            </div>
          </div>

          {/* Risques identifiés */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Risques identifiés (optionnel)
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Ajouter un risque identifié..."
                inputSize="md"
                variant="default"
              />
              <Button
                variant="outline"
                size="md"
                onClick={addTag}
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.risques.map((risque) => (
                <span
                  key={risque}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                >
                  {risque}
                  <button
                    type="button"
                    onClick={() => removeTag(risque)}
                    className="hover:text-red-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Formulaires conditionnels selon le type d'alerte */}
          
          {/* Véhicule volé */}
          {formData.type === TypeAlerte.VEHICULE_VOLE && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Car className="w-5 h-5" />
                Informations sur le véhicule
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Immatriculation *"
                  value={formData.vehicule?.immatriculation || ''}
                  onChange={(e) => handleChange('vehicule', { ...formData.vehicule, immatriculation: e.target.value })}
                  inputSize="md"
                  variant="default"
                />
                <Input
                  placeholder="Marque"
                  value={formData.vehicule?.marque || ''}
                  onChange={(e) => handleChange('vehicule', { ...formData.vehicule, marque: e.target.value })}
                  inputSize="md"
                  variant="default"
                />
                <Input
                  placeholder="Modèle"
                  value={formData.vehicule?.modele || ''}
                  onChange={(e) => handleChange('vehicule', { ...formData.vehicule, modele: e.target.value })}
                  inputSize="md"
                  variant="default"
                />
                <Input
                  placeholder="Couleur"
                  value={formData.vehicule?.couleur || ''}
                  onChange={(e) => handleChange('vehicule', { ...formData.vehicule, couleur: e.target.value })}
                  inputSize="md"
                  variant="default"
                />
                <Input
                  placeholder="Année"
                  value={formData.vehicule?.annee || ''}
                  onChange={(e) => handleChange('vehicule', { ...formData.vehicule, annee: e.target.value })}
                  inputSize="md"
                  variant="default"
                />
              </div>
            </div>
          )}

          {/* Suspect recherché */}
          {formData.type === TypeAlerte.SUSPECT_RECHERCHE && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-orange-900 mb-3 flex items-center gap-2">
                <UserX className="w-5 h-5" />
                Informations sur le suspect
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <Input
                  placeholder="Nom complet *"
                  value={formData.suspect?.nom || ''}
                  onChange={(e) => handleChange('suspect', { ...formData.suspect, nom: e.target.value })}
                  inputSize="md"
                  variant="default"
                />
                <Textarea
                  placeholder="Description physique détaillée *"
                  rows={3}
                  value={formData.suspect?.description || ''}
                  onChange={(e) => handleChange('suspect', { ...formData.suspect, description: e.target.value })}
                  textareaSize="md"
                  variant="default"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Âge approximatif"
                    value={formData.suspect?.age || ''}
                    onChange={(e) => handleChange('suspect', { ...formData.suspect, age: e.target.value })}
                    inputSize="md"
                    variant="default"
                  />
                  <Input
                    placeholder="Dernière adresse connue"
                    value={formData.suspect?.adresse || ''}
                    onChange={(e) => handleChange('suspect', { ...formData.suspect, adresse: e.target.value })}
                    inputSize="md"
                    variant="default"
                  />
                </div>
                <Textarea
                  placeholder="Motif de la recherche"
                  rows={2}
                  value={formData.suspect?.motif || ''}
                  onChange={(e) => handleChange('suspect', { ...formData.suspect, motif: e.target.value })}
                  textareaSize="md"
                  variant="default"
                />
              </div>
            </div>
          )}

          {/* Accident */}
          {formData.type === TypeAlerte.ACCIDENT && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <Ambulance className="w-5 h-5" />
                Informations sur l'accident
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <Input
                  placeholder="Nombre de personnes impliquées"
                  type="number"
                  min="0"
                  value={formData.personneConcernee?.nom || ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) >= 0 ? e.target.value : '0'
                    handleChange('personneConcernee', { ...formData.personneConcernee, nom: value })
                  }}
                  inputSize="md"
                  variant="default"
                />
                <Input
                  placeholder="Nombre de blessés"
                  type="number"
                  min="0"
                  value={formData.personneConcernee?.telephone || ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) >= 0 ? e.target.value : '0'
                    handleChange('personneConcernee', { ...formData.personneConcernee, telephone: value })
                  }}
                  inputSize="md"
                  variant="default"
                />
                <Input
                  placeholder="Services d'urgence contactés (SAMU, Pompiers, etc.)"
                  value={formData.personneConcernee?.relation || ''}
                  onChange={(e) => handleChange('personneConcernee', { ...formData.personneConcernee, relation: e.target.value })}
                  inputSize="md"
                  variant="default"
                />
                <Textarea
                  placeholder="Gravité et détails de l'accident"
                  rows={3}
                  value={formData.personneConcernee?.description || ''}
                  onChange={(e) => handleChange('personneConcernee', { ...formData.personneConcernee, description: e.target.value })}
                  textareaSize="md"
                  variant="default"
                />
              </div>
            </div>
          )}

          {/* Aggression */}
          {formData.type === TypeAlerte.AGGRESSION && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-red-900 mb-3 flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations sur la victime
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <Input
                  placeholder="Nom de la victime *"
                  value={formData.personneConcernee?.nom || ''}
                  onChange={(e) => handleChange('personneConcernee', { ...formData.personneConcernee, nom: e.target.value })}
                  inputSize="md"
                  variant="default"
                />
                <Input
                  placeholder="Téléphone de la victime"
                  value={formData.personneConcernee?.telephone || ''}
                  onChange={(e) => handleChange('personneConcernee', { ...formData.personneConcernee, telephone: e.target.value })}
                  inputSize="md"
                  variant="default"
                />
                <Textarea
                  placeholder="Description de l'agresseur (taille, signes distinctifs, vêtements, etc.)"
                  rows={3}
                  value={formData.suspect?.description || ''}
                  onChange={(e) => handleChange('suspect', { ...formData.suspect, description: e.target.value })}
                  textareaSize="md"
                  variant="default"
                />
                <Textarea
                  placeholder="État de la victime et soins prodigués"
                  rows={2}
                  value={formData.personneConcernee?.description || ''}
                  onChange={(e) => handleChange('personneConcernee', { ...formData.personneConcernee, description: e.target.value })}
                  textareaSize="md"
                  variant="default"
                />
              </div>
            </div>
          )}

          {/* Incendie */}
          {formData.type === TypeAlerte.INCENDIE && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
                <Flame className="w-5 h-5" />
                Informations sur l'incendie
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <Input
                  placeholder="Type de bâtiment/lieu (maison, entrepôt, forêt, etc.)"
                  value={formData.personneConcernee?.relation || ''}
                  onChange={(e) => handleChange('personneConcernee', { ...formData.personneConcernee, relation: e.target.value })}
                  inputSize="md"
                  variant="default"
                />
                <Select
                  value={formData.personneConcernee?.nom || ''}
                  onChange={(e) => handleChange('personneConcernee', { ...formData.personneConcernee, nom: e.target.value })}
                  selectSize="md"
                  variant="default"
                >
                  <option value="">Ampleur de l'incendie</option>
                  <option value="mineur">Mineur - Feu localisé</option>
                  <option value="moyen">Moyen - En propagation</option>
                  <option value="majeur">Majeur - Hors de contrôle</option>
                </Select>
                <Input
                  placeholder="Pompiers contactés ? (Oui/Non - Heure)"
                  value={formData.personneConcernee?.telephone || ''}
                  onChange={(e) => handleChange('personneConcernee', { ...formData.personneConcernee, telephone: e.target.value })}
                  inputSize="md"
                  variant="default"
                />
                <Textarea
                  placeholder="Personnes à évacuer, risques particuliers (gaz, produits chimiques, etc.)"
                  rows={3}
                  value={formData.personneConcernee?.description || ''}
                  onChange={(e) => handleChange('personneConcernee', { ...formData.personneConcernee, description: e.target.value })}
                  textareaSize="md"
                  variant="default"
                />
              </div>
            </div>
          )}

          {/* Urgence sécurité */}
          {formData.type === TypeAlerte.URGENCE_SECURITE && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-red-900 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Détails de l'urgence sécurité
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <Select
                  value={formData.personneConcernee?.relation || ''}
                  onChange={(e) => handleChange('personneConcernee', { ...formData.personneConcernee, relation: e.target.value })}
                  selectSize="md"
                  variant="default"
                >
                  <option value="">Nature de l'urgence</option>
                  <option value="braquage">Braquage en cours</option>
                  <option value="prise_otage">Prise d'otage</option>
                  <option value="menace_attentat">Menace d'attentat</option>
                  <option value="trouble_ordre_public">Trouble à l'ordre public</option>
                  <option value="manifestation">Manifestation violente</option>
                  <option value="autre">Autre urgence</option>
                </Select>
                <Input
                  placeholder="Nombre de personnes en danger"
                  type="number"
                  min="0"
                  value={formData.personneConcernee?.nom || ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) >= 0 ? e.target.value : '0'
                    handleChange('personneConcernee', { ...formData.personneConcernee, nom: value })
                  }}
                  inputSize="md"
                  variant="default"
                />
                <Input
                  placeholder="Nombre de suspects/agresseurs"
                  type="number"
                  min="0"
                  value={formData.personneConcernee?.telephone || ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) >= 0 ? e.target.value : '0'
                    handleChange('personneConcernee', { ...formData.personneConcernee, telephone: value })
                  }}
                  inputSize="md"
                  variant="default"
                />
                <Textarea
                  placeholder="Armes ou moyens utilisés"
                  rows={2}
                  value={formData.suspect?.description || ''}
                  onChange={(e) => handleChange('suspect', { ...formData.suspect, description: e.target.value })}
                  textareaSize="md"
                  variant="default"
                />
                <Textarea
                  placeholder="Renforts nécessaires (RAID, GIGN, équipes spéciales, etc.)"
                  rows={2}
                  value={formData.personneConcernee?.description || ''}
                  onChange={(e) => handleChange('personneConcernee', { ...formData.personneConcernee, description: e.target.value })}
                  textareaSize="md"
                  variant="default"
                />
              </div>
            </div>
          )}

          {/* Alerte générale */}
          {formData.type === TypeAlerte.ALERTE_GENERALE && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Détails de l'alerte générale
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <Select
                  value={formData.personneConcernee?.relation || ''}
                  onChange={(e) => handleChange('personneConcernee', { ...formData.personneConcernee, relation: e.target.value })}
                  selectSize="md"
                  variant="default"
                >
                  <option value="">Type d'alerte générale</option>
                  <option value="disparition">Disparition de personne</option>
                  <option value="alerte_enlevement">Alerte enlèvement</option>
                  <option value="recherche_temoin">Recherche de témoins</option>
                  <option value="zone_interdite">Zone interdite/Bouclage</option>
                  <option value="catastrophe_naturelle">Catastrophe naturelle</option>
                  <option value="alerte_sanitaire">Alerte sanitaire</option>
                  <option value="autre">Autre</option>
                </Select>
                <Input
                  placeholder="Zones/Commissariats concernés"
                  value={formData.personneConcernee?.nom || ''}
                  onChange={(e) => handleChange('personneConcernee', { ...formData.personneConcernee, nom: e.target.value })}
                  inputSize="md"
                  variant="default"
                />
                <Input
                  placeholder="Durée estimée de l'alerte"
                  value={formData.personneConcernee?.telephone || ''}
                  onChange={(e) => handleChange('personneConcernee', { ...formData.personneConcernee, telephone: e.target.value })}
                  inputSize="md"
                  variant="default"
                />
                <Textarea
                  placeholder="Consignes à diffuser au public"
                  rows={3}
                  value={formData.personneConcernee?.description || ''}
                  onChange={(e) => handleChange('personneConcernee', { ...formData.personneConcernee, description: e.target.value })}
                  textareaSize="md"
                  variant="default"
                />
                <Input
                  placeholder="Numéro de contact d'urgence"
                  value={formData.suspect?.nom || ''}
                  onChange={(e) => handleChange('suspect', { ...formData.suspect, nom: e.target.value })}
                  inputSize="md"
                  variant="default"
                />
              </div>
            </div>
          )}

          {/* Alerte Amber */}
          {formData.type === TypeAlerte.AMBER && (
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Détails de l'alerte Amber
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <Input
                  placeholder="Nom de l'enfant disparu *"
                  value={formData.personneConcernee?.nom || ''}
                  onChange={(e) => handleChange('personneConcernee', { ...formData.personneConcernee, nom: e.target.value })}
                  inputSize="md"
                  variant="default"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Âge de l'enfant *"
                    type="number"
                    min="0"
                    max="18"
                    value={formData.personneConcernee?.telephone || ''}
                    onChange={(e) => handleChange('personneConcernee', { ...formData.personneConcernee, telephone: e.target.value })}
                    inputSize="md"
                    variant="default"
                  />
                  <Input
                    placeholder="Date de disparition *"
                    type="date"
                    value={formData.suspect?.age || ''}
                    onChange={(e) => handleChange('suspect', { ...formData.suspect, age: e.target.value })}
                    inputSize="md"
                    variant="default"
                  />
                </div>
                <Textarea
                  placeholder="Description physique de l'enfant (taille, poids, couleur des cheveux, yeux, vêtements, signes distinctifs) *"
                  rows={3}
                  value={formData.personneConcernee?.description || ''}
                  onChange={(e) => handleChange('personneConcernee', { ...formData.personneConcernee, description: e.target.value })}
                  textareaSize="md"
                  variant="default"
                />
                <Textarea
                  placeholder="Circonstances de la disparition (dernière fois vu, avec qui, dans quelles conditions) *"
                  rows={3}
                  value={formData.suspect?.description || ''}
                  onChange={(e) => handleChange('suspect', { ...formData.suspect, description: e.target.value })}
                  textareaSize="md"
                  variant="default"
                />
                <Input
                  placeholder="Véhicule suspect (immatriculation, marque, modèle, couleur)"
                  value={formData.vehicule?.immatriculation || ''}
                  onChange={(e) => handleChange('vehicule', { ...formData.vehicule, immatriculation: e.target.value })}
                  inputSize="md"
                  variant="default"
                />
                <Input
                  placeholder="Personne suspecte (nom, description physique, relation avec l'enfant)"
                  value={formData.suspect?.nom || ''}
                  onChange={(e) => handleChange('suspect', { ...formData.suspect, nom: e.target.value })}
                  inputSize="md"
                  variant="default"
                />
                <Input
                  placeholder="Contact d'urgence (téléphone, nom du responsable)"
                  value={formData.personneConcernee?.relation || ''}
                  onChange={(e) => handleChange('personneConcernee', { ...formData.personneConcernee, relation: e.target.value })}
                  inputSize="md"
                  variant="default"
                />
              </div>
            </div>
          )}

          {/* Maintenance système */}
          {formData.type === TypeAlerte.MAINTENANCE_SYSTEME && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Détails de la maintenance
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <Select
                  value={formData.personneConcernee?.relation || ''}
                  onChange={(e) => handleChange('personneConcernee', { ...formData.personneConcernee, relation: e.target.value })}
                  selectSize="md"
                  variant="default"
                >
                  <option value="">Type de maintenance</option>
                  <option value="maintenance_preventive">Maintenance préventive</option>
                  <option value="mise_a_jour">Mise à jour système</option>
                  <option value="reparation_urgente">Réparation urgente</option>
                  <option value="test_systeme">Test du système</option>
                  <option value="arret_planifie">Arrêt planifié</option>
                </Select>
                <Input
                  placeholder="Système/Module concerné"
                  value={formData.personneConcernee?.nom || ''}
                  onChange={(e) => handleChange('personneConcernee', { ...formData.personneConcernee, nom: e.target.value })}
                  inputSize="md"
                  variant="default"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="datetime-local"
                    placeholder="Date/Heure de début"
                    value={formData.personneConcernee?.telephone || ''}
                    onChange={(e) => handleChange('personneConcernee', { ...formData.personneConcernee, telephone: e.target.value })}
                    inputSize="md"
                    variant="default"
                  />
                  <Input
                    type="datetime-local"
                    placeholder="Date/Heure de fin estimée"
                    value={formData.suspect?.nom || ''}
                    onChange={(e) => handleChange('suspect', { ...formData.suspect, nom: e.target.value })}
                    inputSize="md"
                    variant="default"
                  />
                </div>
                <Textarea
                  placeholder="Impact sur les services (quels services seront indisponibles)"
                  rows={2}
                  value={formData.personneConcernee?.description || ''}
                  onChange={(e) => handleChange('personneConcernee', { ...formData.personneConcernee, description: e.target.value })}
                  textareaSize="md"
                  variant="default"
                />
                <Textarea
                  placeholder="Actions à entreprendre par les utilisateurs"
                  rows={2}
                  value={formData.suspect?.description || ''}
                  onChange={(e) => handleChange('suspect', { ...formData.suspect, description: e.target.value })}
                  textareaSize="md"
                  variant="default"
                />
                <Input
                  placeholder="Personne responsable de la maintenance"
                  value={formData.suspect?.adresse || ''}
                  onChange={(e) => handleChange('suspect', { ...formData.suspect, adresse: e.target.value })}
                  inputSize="md"
                  variant="default"
                />
              </div>
            </div>
          )}

          {/* Autre */}
          {formData.type === TypeAlerte.AUTRE && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Radio className="w-5 h-5" />
                Informations complémentaires
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <Input
                  placeholder="Catégorie spécifique"
                  value={formData.personneConcernee?.relation || ''}
                  onChange={(e) => handleChange('personneConcernee', { ...formData.personneConcernee, relation: e.target.value })}
                  inputSize="md"
                  variant="default"
                />
                <Input
                  placeholder="Personnes ou services à contacter"
                  value={formData.personneConcernee?.nom || ''}
                  onChange={(e) => handleChange('personneConcernee', { ...formData.personneConcernee, nom: e.target.value })}
                  inputSize="md"
                  variant="default"
                />
                <Input
                  placeholder="Numéros d'urgence spécifiques"
                  value={formData.personneConcernee?.telephone || ''}
                  onChange={(e) => handleChange('personneConcernee', { ...formData.personneConcernee, telephone: e.target.value })}
                  inputSize="md"
                  variant="default"
                />
                <Textarea
                  placeholder="Détails supplémentaires pertinents"
                  rows={3}
                  value={formData.personneConcernee?.description || ''}
                  onChange={(e) => handleChange('personneConcernee', { ...formData.personneConcernee, description: e.target.value })}
                  textareaSize="md"
                  variant="default"
                />
              </div>
            </div>
          )}

          {/* Bouton de génération IA */}
          {formData.type && formData.titre && formData.lieu && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-purple-900 mb-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Génération automatique avec IA
                  </h4>
                  <p className="text-xs text-purple-700">
                    Générez automatiquement une description détaillée et le contexte basés sur les informations saisies
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={genererAvecIA}
                  disabled={isGenerating}
                  className="ml-4 bg-purple-600 hover:bg-purple-700 border-purple-600"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Générer avec IA
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
              Description détaillée <span className="text-red-600">*</span>
            </label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Décrivez la situation en détail..."
              textareaSize="md"
              variant="default"
            />
          </div>

          {/* Contexte */}
          <div>
            <label htmlFor="contexte" className="block text-sm font-semibold text-slate-700 mb-2">
              Contexte (optionnel)
            </label>
            <Textarea
              id="contexte"
              name="contexte"
              rows={3}
              value={formData.contexte || ''}
              onChange={(e) => handleChange('contexte', e.target.value)}
              placeholder="Informations contextuelles supplémentaires..."
              textareaSize="md"
              variant="default"
            />
          </div>
          </div>
          )}

          {/* STEP 2: Options de diffusion */}
          {currentStep === 2 && (
          <div className="space-y-6">
            <p className="text-sm text-slate-600">
              Souhaitez-vous diffuser cette alerte maintenant ? Vous pourrez également le faire plus tard depuis la page de détail de l'alerte.
            </p>

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
          )}

        </div>
      </ModalBody>

      <ModalFooter>
        {currentStep === 1 ? (
          <>
            <Button 
              variant="outline" 
              size="md"
              onClick={handleCloseModal}
            >
              Annuler
            </Button>
            <Button 
              variant="primary" 
              size="md" 
              onClick={handleNextStep}
              className="bg-red-600 hover:bg-red-700 border-red-600"
              disabled={!formData.titre || !formData.description || !formData.type || !commissariatId}
            >
              Suivant: Diffusion
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="outline" 
              size="md"
              onClick={handlePreviousStep}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Précédent
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleSkipDiffusion} 
              disabled={isDiffusing || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Création...
                </>
              ) : (
                'Créer sans diffuser'
              )}
            </Button>
            <Button 
              onClick={handleConfirmDiffusion} 
              disabled={isDiffusing || isSubmitting || (!diffusionGenerale && selectedCommissariats.length === 0 && selectedAgents.length === 0)}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isDiffusing || isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {isSubmitting ? 'Création...' : 'Diffusion...'}
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Créer et diffuser
                </>
              )}
            </Button>
          </>
        )}
      </ModalFooter>
    </Modal>
    </>
  )
}