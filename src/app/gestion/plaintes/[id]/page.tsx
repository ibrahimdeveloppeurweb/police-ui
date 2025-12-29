'use client'

import React, { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import {
  ArrowLeft, Printer, Download, Edit, FileText, Calendar, MapPin, User,
  AlertTriangle, CheckCircle, Clock, Phone, Mail, Loader2, Save, X, Users, Eye, Search, Lock, Plus, Activity
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { usePlainteDetail } from '@/hooks/usePlainteDetail'
import { useRouter } from 'next/navigation'
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { PreuvesList, ActesEnqueteList, TimelineInvestigation, HistoriqueActions, SuiviPlainte } from '@/components/plaintes'
import { usePlainteHistorique } from '@/hooks/usePlainteHistorique'
import api from '@/lib/axios'

export default function PlainteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const unwrappedParams = React.use(params)
  const [activeTab, setActiveTab] = useState('informations')
  const [showStatutModal, setShowStatutModal] = useState(false)
  const [showEtapeModal, setShowEtapeModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  
  const [agentSelectionne, setAgentSelectionne] = useState('')
  const [loadingAssign, setLoadingAssign] = useState(false)
  const [agents, setAgents] = useState<any[]>([])
  const [nouveauStatut, setNouveauStatut] = useState('')
  const [nouvelleEtape, setNouvelleEtape] = useState('')
  const [observations, setObservations] = useState('')
  const [nombreConvocations, setNombreConvocations] = useState(0)
  const [loadingAction, setLoadingAction] = useState(false)

  const {
    plainte,
    loading,
    error,
    changerEtape,
    changerStatut,
    assignerAgent,
    refetch
  } = usePlainteDetail(unwrappedParams.id)

  const {
    historique,
    loading: loadingHistorique,
    refetch: refetchHistorique
  } = usePlainteHistorique(unwrappedParams.id)

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'EN_COURS': return 'bg-yellow-500 text-white'
      case 'CONVOCATION': return 'bg-orange-500 text-white'
      case 'RESOLU': return 'bg-green-500 text-white'
      case 'CLASSE': return 'bg-gray-500 text-white'
      case 'TRANSFERE': return 'bg-purple-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'URGENTE': return 'bg-red-500 text-white'
      case 'HAUTE': return 'bg-orange-500 text-white'
      case 'NORMALE': return 'bg-blue-500 text-white'
      case 'BASSE': return 'bg-gray-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getEtapeLabel = (etape: string) => {
    switch (etape) {
      case 'DEPOT': return 'Dépôt'
      case 'ENQUETE': return 'Enquête'
      case 'CONVOCATIONS': return 'Convocations'
      case 'RESOLUTION': return 'Résolution'
      case 'CLOTURE': return 'Clôture'
      default: return etape
    }
  }

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'EN_COURS': return 'En cours'
      case 'CONVOCATION': return 'Convocation'
      case 'RESOLU': return 'Résolu'
      case 'CLASSE': return 'Classé'
      case 'TRANSFERE': return 'Transféré'
      default: return statut
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderProgressSteps = () => {
    if (!plainte) return null
    
    const etapes = [
      { id: 'DEPOT', label: 'Dépôt', icon: FileText, description: 'Plainte enregistrée' },
      { id: 'ENQUETE', label: 'Enquête', icon: Search, description: 'Investigation en cours' },
      { id: 'CONVOCATIONS', label: 'Convocations', icon: Users, description: 'Auditions planifiées' },
      { id: 'RESOLUTION', label: 'Résolution', icon: CheckCircle, description: 'Traitement final' },
      { id: 'CLOTURE', label: 'Clôture', icon: Lock, description: 'Dossier clos' }
    ]
    const currentIndex = etapes.findIndex(e => e.id === plainte.etape_actuelle)

    return (
      <div className="space-y-4">
        <div className="relative">
          <div className="flex items-center justify-between">
            {etapes.map((etape, index) => {
              const Icon = etape.icon
              const isCompleted = index < currentIndex
              const isCurrent = index === currentIndex
              const isPending = index > currentIndex
              
              return (
                <React.Fragment key={index}>
                  <div className="flex flex-col items-center flex-1 relative z-10">
                    <div className={`
                      w-16 h-16 rounded-full flex items-center justify-center font-bold transition-all duration-300 shadow-lg
                      ${isCompleted ? 'bg-gradient-to-br from-green-500 to-green-600 text-white scale-105' : ''}
                      ${isCurrent ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white scale-110 ring-4 ring-orange-200' : ''}
                      ${isPending ? 'bg-gray-200 text-gray-500' : ''}
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="w-8 h-8" />
                      ) : (
                        <Icon className="w-8 h-8" />
                      )}
                    </div>
                    
                    <div className="text-center mt-3">
                      <div className={`font-bold text-sm ${
                        isCompleted || isCurrent ? 'text-slate-900' : 'text-gray-500'
                      }`}>
                        {etape.label}
                      </div>
                      <div className={`text-xs mt-1 ${
                        isCompleted ? 'text-green-600' : isCurrent ? 'text-orange-600' : 'text-gray-400'
                      }`}>
                        {etape.description}
                      </div>
                      {isCurrent && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                            En cours
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {index < etapes.length - 1 && (
                    <div className="flex-1 h-2 mx-2 relative" style={{ top: '-35px' }}>
                      <div className={`h-full rounded-full transition-all duration-500 ${
                        index < currentIndex ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gray-300'
                      }`}></div>
                    </div>
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{currentIndex}</div>
            <div className="text-xs text-green-700 font-medium">Étapes complétées</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-600">1</div>
            <div className="text-xs text-orange-700 font-medium">Étape en cours</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-600">{etapes.length - currentIndex - 1}</div>
            <div className="text-xs text-gray-700 font-medium">Étapes restantes</div>
          </div>
        </div>
      </div>
    )
  }

  const handleChangerStatut = async () => {
    if (!nouveauStatut) {
      alert('Veuillez sélectionner un statut')
      return
    }

    setLoadingAction(true)
    try {
      // Si c'est une convocation, incrémenter le compteur
      if (nouveauStatut === 'CONVOCATION') {
        const newCount = (plainte?.nombre_convocations || 0) + 1
        setNombreConvocations(newCount)
        
        // Envoyer avec le nombre de convocations
        await api.patch(`/plaintes/${unwrappedParams.id}/statut`, {
          statut: nouveauStatut,
          decision_finale: observations,
          nombre_convocations: newCount
        })
      } else {
        await changerStatut(nouveauStatut as any, observations)
      }
      
      await refetch()
      await refetchHistorique()
      setShowStatutModal(false)
      setNouveauStatut('')
      setObservations('')
      alert('✅ Statut modifié avec succès !')
    } catch (err: any) {
      console.error('Erreur changement statut:', err)
      alert(`❌ Erreur: ${err.response?.data?.error || err.message}`)
    } finally {
      setLoadingAction(false)
    }
  }

  const handleChangerEtape = async () => {
    if (!nouvelleEtape) {
      alert('Veuillez sélectionner une étape')
      return
    }

    setLoadingAction(true)
    try {
      await changerEtape(nouvelleEtape as any, observations)
      await refetch()
      await refetchHistorique()
      setShowEtapeModal(false)
      setNouvelleEtape('')
      setObservations('')
      alert('✅ Étape modifiée avec succès !')
    } catch (err: any) {
      console.error('Erreur changement étape:', err)
      alert(`❌ Erreur: ${err.response?.data?.error || err.message}`)
    } finally {
      setLoadingAction(false)
    }
  }

  const handleAssignerAgent = async () => {
    if (!agentSelectionne) {
      alert('Veuillez sélectionner un agent')
      return
    }
    
    setLoadingAssign(true)
    try {
      await assignerAgent(agentSelectionne)
      await refetch()
      await refetchHistorique()
      setShowAssignModal(false)
      setAgentSelectionne('')
      setObservations('')
      alert('✅ Agent assigné avec succès !')
    } catch (err: any) {
      console.error('Erreur assignation agent:', err)
      alert(`❌ Erreur: ${err.response?.data?.error || err.message}`)
    } finally {
      setLoadingAssign(false)
    }
  }

  const handleOpenAssignModal = async () => {
    setShowAssignModal(true)
    setAgents([])
    
    // Récupérer l'ID du commissariat de l'utilisateur connecté
    const commissariatId = typeof window !== 'undefined' 
      ? localStorage.getItem('commissariat_id') || Cookies.get('commissariat_id')
      : null
    
    if (!commissariatId) {
      console.error('Commissariat ID de l\'utilisateur manquant')
      alert('Erreur: Impossible de charger les agents (commissariat non défini pour cet utilisateur)')
      return
    }
    
    try {
      console.log(`🔍 Chargement des agents du commissariat: ${commissariatId}`)
      const response = await api.get(`/commissariat/${commissariatId}/agents`)
      console.log('✅ Réponse API agents:', response.data)
      
      // Vérifier si la réponse est un tableau ou un objet avec une propriété agents
      let agentsList = []
      if (Array.isArray(response.data)) {
        agentsList = response.data
      } else if (response.data?.agents && Array.isArray(response.data.agents)) {
        agentsList = response.data.agents
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        agentsList = response.data.data
      }
      
      console.log('✅ Agents extraits:', agentsList)
      setAgents(agentsList)
    } catch (err: any) {
      console.error('❌ Erreur chargement agents:', err)
      alert(`Erreur lors du chargement des agents: ${err.response?.data?.error || err.message}`)
      setAgents([])
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-600">Chargement des détails...</p>
        </div>
      </div>
    )
  }

  if (error || !plainte) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardBody className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Erreur</h2>
            <p className="text-slate-600 mb-4">{error || 'Plainte introuvable'}</p>
            <Button onClick={() => router.push('/gestion/plaintes/listes')} className="bg-blue-600 hover:bg-blue-700 text-white">
              Retour à la liste
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => router.back()}
            className="!p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
              Plainte {plainte.numero}
            </h1>
            <p className="text-slate-600 mt-1">
              {plainte.type_plainte}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button className="flex items-center gap-2" onClick={() => window.print()}>
            <Printer className="w-5 h-5" />
            Imprimer
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Alertes SLA */}
      {plainte.sla_depasse && (
        <Card className="border-l-4 border-red-500 bg-red-50">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="font-bold text-red-900">Délai SLA Dépassé</h3>
                <p className="text-red-700 text-sm">Cette plainte a dépassé son délai de traitement.</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Barre de progression */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardBody className="p-6">
          {renderProgressSteps()}
        </CardBody>
      </Card>

      {/* Informations principales et Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardBody className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Informations de la Plainte</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-600">Numéro</label>
                <div className="text-lg font-bold text-slate-900">{plainte.numero}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Type</label>
                <div className="text-lg font-bold text-slate-900">{plainte.type_plainte}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Plaignant</label>
                <div className="font-bold text-slate-900">{plainte.plaignant_nom} {plainte.plaignant_prenom}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Date dépôt</label>
                <div className="font-bold text-slate-900">{formatDate(plainte.date_depot)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Agent assigné</label>
                <div className="font-bold text-slate-900">
                  {plainte.agent_assigne 
                    ? `${plainte.agent_assigne.nom} ${plainte.agent_assigne.prenom}`
                    : 'Non assigné'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Convocations</label>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{plainte.nombre_convocations || 0}</span>
                  {(plainte.nombre_convocations || 0) > 0 && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                      {plainte.nombre_convocations} convocation{plainte.nombre_convocations > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium text-slate-600">Statut:</span>
                <span className={`px-4 py-2 text-sm font-bold rounded-full ${getStatutColor(plainte.statut)}`}>
                  {getStatutLabel(plainte.statut)}
                </span>
                <span className="text-sm font-medium text-slate-600">Priorité:</span>
                <span className={`px-4 py-2 text-sm font-bold rounded-full ${getPrioriteColor(plainte.priorite)}`}>
                  {plainte.priorite}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Actions Disponibles</h3>
            <div className="space-y-3">
              <Button 
                onClick={() => setShowEtapeModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Changer Étape
              </Button>
              <Button 
                onClick={() => setShowStatutModal(true)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Modifier Statut
              </Button>
              <Button 
                onClick={handleOpenAssignModal}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                Assigner un Agent
              </Button>
              
              <div className="border-t border-slate-200 my-3"></div>
              
              <p className="text-xs font-medium text-slate-600 uppercase text-center">Accès Rapide Investigation</p>
              
              <Button 
                onClick={() => {
                  setActiveTab('timeline')
                  // Scroll vers le contenu après changement d'onglet
                  setTimeout(() => {
                    const element = document.querySelector('[data-tab-content]')
                    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }, 100)
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Timeline & Événements
              </Button>
              <Button 
                onClick={() => {
                  setActiveTab('preuves')
                  setTimeout(() => {
                    const element = document.querySelector('[data-tab-content]')
                    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }, 100)
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
               Preuves
              </Button>
              <Button 
                onClick={() => {
                  setActiveTab('actes')
                  setTimeout(() => {
                    const element = document.querySelector('[data-tab-content]')
                    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }, 100)
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                 Actes d'Enquête
              </Button>
              <Button 
                onClick={() => {
                  setActiveTab('suivi')
                  setTimeout(() => {
                    const element = document.querySelector('[data-tab-content]')
                    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }, 100)
                }}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-center gap-2"
              >
                <Activity className="w-4 h-4" />
                Historique & Suivi
              </Button>
              
              <div className="border-t border-slate-200 my-3"></div>
              
              <Button 
                onClick={() => router.back()} 
                className="w-full flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>


      {/* Onglets */}
      <div className="mb-6">
        <Card className="!rounded-b-none">
          <CardBody className="!p-0">
            <nav className="flex space-x-4 overflow-x-auto px-4">
              {[
                { id: 'informations', label: 'Informations', icon: FileText },
                { id: 'plaignant', label: 'Plaignant', icon: User },
                { id: 'faits', label: 'Faits', icon: AlertTriangle },
                { id: 'suspects', label: 'Suspects', icon: Users },
                { id: 'temoins', label: 'Témoins', icon: Eye },
                { id: 'timeline', label: 'Timeline', icon: Clock },
                { id: 'preuves', label: 'Preuves', icon: FileText },
                { id: 'actes', label: 'Actes Enquête', icon: CheckCircle },
                { id: 'suivi', label: 'Suivi', icon: Activity },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </CardBody>
        </Card>
      </div>

      {/* Contenu des onglets */}
      <Card className="!rounded-t-none" data-tab-content>
        <CardBody className="p-6">
          {activeTab === 'informations' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Détails de la Plainte</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Description</label>
                  <p className="text-slate-900">{plainte.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Lieu des faits</label>
                  <p className="text-slate-900">{plainte.lieu_faits}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Date des faits</label>
                  <p className="text-slate-900">{formatDate(plainte.date_faits)}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'plaignant' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Informations du Plaignant</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Nom complet</label>
                  <p className="text-slate-900">{plainte.plaignant_nom} {plainte.plaignant_prenom}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Téléphone</label>
                  <p className="text-slate-900">{plainte.plaignant_telephone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Email</label>
                  <p className="text-slate-900">{plainte.plaignant_email || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Adresse</label>
                  <p className="text-slate-900">{plainte.plaignant_adresse}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faits' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Détails des Faits</h3>
              <div className="prose max-w-none">
                <p className="text-slate-900 whitespace-pre-wrap">{plainte.description}</p>
              </div>
            </div>
          )}

          {activeTab === 'suspects' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Liste des Suspects</h3>
              {plainte.suspects && plainte.suspects.length > 0 ? (
                <div className="grid gap-4">
                  {plainte.suspects.map((suspect: any) => (
                    <Card key={suspect.id}>
                      <CardBody className="p-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium text-slate-600">Nom</label>
                            <p className="text-slate-900">{suspect.nom} {suspect.prenom}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-600">Alias</label>
                            <p className="text-slate-900">{suspect.alias || 'Aucun'}</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600">Aucun suspect enregistré</p>
              )}
            </div>
          )}

          {activeTab === 'temoins' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Liste des Témoins</h3>
              {plainte.temoins && plainte.temoins.length > 0 ? (
                <div className="grid gap-4">
                  {plainte.temoins.map((temoin: any) => (
                    <Card key={temoin.id}>
                      <CardBody className="p-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium text-slate-600">Nom</label>
                            <p className="text-slate-900">{temoin.nom} {temoin.prenom}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-600">Téléphone</label>
                            <p className="text-slate-900">{temoin.telephone}</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600">Aucun témoin enregistré</p>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <TimelineInvestigation plainteId={plainte.id} />
          )}

          {activeTab === 'preuves' && (
            <PreuvesList plainteId={plainte.id} />
          )}

          {activeTab === 'actes' && (
            <ActesEnqueteList plainteId={plainte.id} />
          )}

          {activeTab === 'suivi' && (
            <SuiviPlainte 
              plainteId={plainte.id}
              observations={plainte.decision_finale}
            />
          )}
        </CardBody>
      </Card>

      {/* MODALS - Seulement les 3 principaux */}
      {/* Modal Changement Statut */}
      <Modal isOpen={showStatutModal} onClose={() => setShowStatutModal(false)}>
        <ModalHeader>
          <ModalTitle>Modifier le Statut</ModalTitle>
          <ModalClose onClick={() => setShowStatutModal(false)} />
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nouveau Statut
              </label>
              <Select
                value={nouveauStatut}
                onChange={(e) => setNouveauStatut(e.target.value)}
              >
                <option value="">Sélectionner un statut</option>
                <option value="EN_COURS">En cours</option>
                <option value="CONVOCATION">Convocation</option>
                <option value="RESOLU">Résolu</option>
                <option value="CLASSE">Classé</option>
                <option value="TRANSFERE">Transféré</option>
              </Select>
              {nouveauStatut === 'CONVOCATION' && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Ceci incrémentera le compteur de convocations (actuellement : {plainte?.nombre_convocations || 0})</span>
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Observations
              </label>
              <Textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={3}
                placeholder="Motif du changement..."
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setShowStatutModal(false)} disabled={loadingAction}>
            Annuler
          </Button>
          <Button 
            onClick={handleChangerStatut}
            disabled={!nouveauStatut || loadingAction}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loadingAction ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Modification...
              </>
            ) : (
              'Confirmer'
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal Changement Étape */}
      <Modal isOpen={showEtapeModal} onClose={() => setShowEtapeModal(false)}>
        <ModalHeader>
          <ModalTitle>Changer l'Étape</ModalTitle>
          <ModalClose onClick={() => setShowEtapeModal(false)} />
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nouvelle Étape
              </label>
              <Select
                value={nouvelleEtape}
                onChange={(e) => setNouvelleEtape(e.target.value)}
              >
                <option value="">Sélectionner une étape</option>
                <option value="DEPOT">Dépôt</option>
                <option value="ENQUETE">Enquête</option>
                <option value="CONVOCATIONS">Convocations</option>
                <option value="RESOLUTION">Résolution</option>
                <option value="CLOTURE">Clôture</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Observations
              </label>
              <Textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={3}
                placeholder="Motif du changement..."
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setShowEtapeModal(false)} disabled={loadingAction}>
            Annuler
          </Button>
          <Button 
            onClick={handleChangerEtape}
            disabled={!nouvelleEtape || loadingAction}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loadingAction ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Modification...
              </>
            ) : (
              'Confirmer'
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal Assignation Agent */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)}>
        <ModalHeader>
          <ModalTitle>Assigner un Agent</ModalTitle>
          <ModalClose onClick={() => setShowAssignModal(false)} />
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sélectionner un Agent
              </label>
              <Select
                value={agentSelectionne}
                onChange={(e) => setAgentSelectionne(e.target.value)}
              >
                <option value="">Choisir un agent...</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.nom} {agent.prenom} - {agent.grade}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Observations
              </label>
              <Textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={3}
                placeholder="Instructions pour l'agent..."
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setShowAssignModal(false)} disabled={loadingAssign}>
            Annuler
          </Button>
          <Button 
            onClick={handleAssignerAgent}
            disabled={!agentSelectionne || loadingAssign}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loadingAssign ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Assignation...
              </>
            ) : (
              'Assigner'
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
