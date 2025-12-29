'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter, useParams, usePathname } from 'next/navigation'
import Cookies from 'js-cookie'
import {
  ArrowLeft, Printer, Download, Edit, FileText, Calendar, MapPin, User,
  AlertTriangle, CheckCircle, XCircle, Clock, Shield, Phone, Mail,
  AlertCircle, Eye, EyeOff, Camera, ClipboardCheck, Flag, Navigation, Users,
  Activity, MessageSquare, TrendingUp, Archive, Loader2, Building2, Bell,
  PackageSearch, PackageCheck, ExternalLink, Car, UserX, Ambulance, Flame, Wrench, Radio, UserCheck
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { useGestionLayout } from '@/contexts/GestionLayoutContext'
import { useAuth } from '@/hooks/useAuth'
import { useAlerteDetail, type AlerteDetail } from '@/hooks/useAlerteDetail'
import AlerteActionsPanel from '@/components/alertes/AlerteActionsPanel'
import api from '@/lib/axios'

type AlertStatus = 'En cours' | 'Résolue' | 'Archivée'
type AlertSeverity = 'Critique' | 'Élevée' | 'Moyenne' | 'Faible'
type InterventionStatus = 'Déployée' | 'En route' | 'Sur place' | 'Terminée'

export default function AlerteDetailPage() {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const { setTitle, setSubtitle } = useGestionLayout()
  const { user } = useAuth()
  const alerteId = params?.id as string
  
  const { alerte, loading, error, refetch } = useAlerteDetail(alerteId)
  
  const [activeTab, setActiveTab] = useState('details')
  const [currentUserCommissariatId, setCurrentUserCommissariatId] = useState<string | null>(null)
  const [showActionsModal, setShowActionsModal] = useState(true)
  
  // États pour les objets trouvés dans l'alerte
  const [objetsPerdus, setObjetsPerdus] = useState<Array<{numero: string, id: string, isCreated?: boolean}>>([])
  const [objetsRetrouves, setObjetsRetrouves] = useState<Array<{numero: string, id: string, isCreated?: boolean}>>([])
  const [loadingObjets, setLoadingObjets] = useState(false)

  // Forcer le déblocage du scroll au chargement de la page
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      document.documentElement.style.overflow = ''
    }
  }, [])

  // Mettre à jour le titre et sous-titre quand l'alerte ou le commissariat change
  useEffect(() => {
    const commissariatName = user?.commissariat?.nom || ''
    
    // Formater le nom du commissariat avec "Commissariat du/de" si nécessaire
    const formatCommissariatName = (name: string): string => {
      if (!name) return ''
      // Si le nom contient déjà "Commissariat", on le retourne tel quel
      if (name.toLowerCase().includes('commissariat')) {
        return name
      }
      // Sinon, on ajoute "Commissariat du"
      return `Commissariat du ${name}`
    }
    
    const formattedCommissariat = commissariatName ? formatCommissariatName(commissariatName) : ''
    
    if (alerte) {
      setTitle(`Alerte - ${alerte.numero || alerte.titre || alerteId}`)
      if (formattedCommissariat) {
        setSubtitle(`${formattedCommissariat} - ${alerte.type || 'Détails de l\'alerte'}`)
      } else {
        setSubtitle(alerte.type || 'Détails de l\'alerte')
      }
    } else {
      setTitle(`Alerte - ${alerteId}`)
      if (formattedCommissariat) {
        setSubtitle(`${formattedCommissariat} - Détails de l'alerte`)
      } else {
        setSubtitle("Détails de l'alerte")
      }
    }
  }, [setTitle, setSubtitle, alerteId, alerte, user?.commissariat?.nom, pathname])

  // Récupérer le commissariat de l'utilisateur connecté
  useEffect(() => {
    const getCommissariatId = (): string | null => {
      try {
        const directId = Cookies.get('user_commissariat_id') || localStorage.getItem('user_commissariat_id')
        if (directId) return directId

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
    setCurrentUserCommissariatId(getCommissariatId())
  }, [])


  // Vérifier si l'utilisateur connecté appartient au commissariat qui a créé l'alerte
  // IMPORTANT: Ce hook doit être appelé avant tout return conditionnel pour respecter les règles des hooks React
  const canViewDiffusion = useMemo(() => {
    return alerte?.diffusee && alerte?.commissariatId === currentUserCommissariatId
  }, [alerte?.diffusee, alerte?.commissariatId, currentUserCommissariatId])

  // Vérifier si le commissariat actuel est un destinataire de la diffusion (différent du créateur)
  // IMPORTANT: Ce hook doit être appelé avant tout return conditionnel pour respecter les règles des hooks React
  const canAssign = useMemo(() => {
    if (!alerte?.diffusee || !alerte?.diffusionDestinataires || !currentUserCommissariatId) {
      return false
    }
    
    // Le commissariat créateur ne peut pas assigner, seulement les destinataires
    if (alerte.commissariatId === currentUserCommissariatId) {
      return false
    }
    
    const { diffusionDestinataires } = alerte
    
    // Si diffusion générale, tous les commissariats (sauf le créateur) peuvent assigner
    if (diffusionDestinataires.diffusionGenerale) {
      return true
    }
    
    // Si diffusion sélective, vérifier que le commissariat actuel est dans la liste
    if (diffusionDestinataires.commissariatsIds && diffusionDestinataires.commissariatsIds.length > 0) {
      return diffusionDestinataires.commissariatsIds.includes(currentUserCommissariatId)
    }
    
    return false
  }, [alerte, currentUserCommissariatId])

  // Extraire les numéros d'objets de la description de l'alerte
  const extractObjectNumbers = useCallback((description: string) => {
    const objetsPerdusNumeros: Array<{numero: string, isCreated: boolean}> = []
    const objetsRetrouvesNumeros: Array<{numero: string, isCreated: boolean}> = []
    
    if (!description) return { objetsPerdusNumeros, objetsRetrouvesNumeros }
    
    // Patterns pour détecter les objets perdus créés (déclarations créées)
    // Format: CODE-OP-YYYY-NNNNN ou simplement dans parenthèses
    const objetPerduCreePatterns = [
      /Une déclaration d'objet perdu a été créée \(([A-Z0-9-]+-OP-[A-Z0-9-]+)\)/gi,
      /déclaration d'objet perdu a été créée \(([A-Z0-9-]+-OP-[A-Z0-9-]+)\)/gi,
      /déclaration.*?objet perdu.*?créée.*?\(([A-Z0-9-]+-OP-[A-Z0-9-]+)\)/gi,
      /créé.*?déclaration.*?objet perdu.*?\(([A-Z0-9-]+-OP-[A-Z0-9-]+)\)/gi,
      /Vous avez créé.*?déclaration.*?objet perdu.*?\(([A-Z0-9-]+-OP-[A-Z0-9-]+)\)/gi,
      /déclaration d'objet perdu.*?\(([A-Z0-9-]+-OP-[A-Z0-9-]+)\)/gi,
    ]
    
    // Patterns pour détecter les objets perdus mentionnés (correspondants)
    // Plus générique pour capturer tous les formats
    const objetPerduMentionnePatterns = [
      /Numéro objet perdu\s*:\s*([A-Z0-9-]+-OP-[A-Z0-9-]+)/gi,
      /Numéro objet perdu\s*:\s*([A-Z0-9-]+OP[A-Z0-9-]+)/gi,
      /- Numéro objet perdu\s*:\s*([A-Z0-9-]+-OP-[A-Z0-9-]+)/gi,
      /Numéro objet perdu[^\w]*:\s*([A-Z0-9-]+-OP-[A-Z0-9-]+)/gi,
      // Pattern très générique pour capturer tout numéro contenant -OP-
      /([A-Z0-9-]+-OP-[0-9]{4}-[0-9]{5})/gi,
    ]
    
    // Patterns pour détecter les objets retrouvés créés (dépôts créés)
    // Format: CODE-OR-YYYY-NNNNN ou simplement dans parenthèses
    const objetRetrouveCreePatterns = [
      /Un dépôt d'objet retrouvé a été créé \(([A-Z0-9-]+-OR-[A-Z0-9-]+)\)/gi,
      /dépôt d'objet retrouvé a été créé \(([A-Z0-9-]+-OR-[A-Z0-9-]+)\)/gi,
      /dépôt.*?objet retrouvé.*?créé.*?\(([A-Z0-9-]+-OR-[A-Z0-9-]+)\)/gi,
      /créé.*?dépôt.*?objet retrouvé.*?\(([A-Z0-9-]+-OR-[A-Z0-9-]+)\)/gi,
      /Vous avez créé.*?dépôt.*?objet retrouvé.*?\(([A-Z0-9-]+-OR-[A-Z0-9-]+)\)/gi,
      /dépôt d'objet retrouvé.*?\(([A-Z0-9-]+-OR-[A-Z0-9-]+)\)/gi,
    ]
    
    // Patterns pour détecter les objets retrouvés mentionnés (correspondants)
    // Plus générique pour capturer tous les formats
    const objetRetrouveMentionnePatterns = [
      /Numéro objet retrouvé\s*:\s*([A-Z0-9-]+-OR-[A-Z0-9-]+)/gi,
      /Numéro objet retrouvé\s*:\s*([A-Z0-9-]+OR[A-Z0-9-]+)/gi,
      /- Numéro objet retrouvé\s*:\s*([A-Z0-9-]+-OR-[A-Z0-9-]+)/gi,
      /Numéro objet retrouvé[^\w]*:\s*([A-Z0-9-]+-OR-[A-Z0-9-]+)/gi,
      // Pattern très générique pour capturer tout numéro contenant -OR-
      /([A-Z0-9-]+-OR-[0-9]{4}-[0-9]{5})/gi,
    ]
    
    // Extraire les objets perdus créés EN PREMIER (priorité)
    objetPerduCreePatterns.forEach(pattern => {
      const matches = description.matchAll(pattern)
      for (const match of matches) {
        if (match[1] && match[1].includes('-OP-')) {
          if (!objetsPerdusNumeros.find(o => o.numero === match[1])) {
            objetsPerdusNumeros.push({ numero: match[1], isCreated: true })
            console.log('✅ Objet perdu créé détecté:', match[1])
          }
        }
      }
    })
    
    // Extraire les objets retrouvés créés EN PREMIER (priorité)
    objetRetrouveCreePatterns.forEach(pattern => {
      const matches = description.matchAll(pattern)
      for (const match of matches) {
        if (match[1] && match[1].includes('-OR-')) {
          if (!objetsRetrouvesNumeros.find(o => o.numero === match[1])) {
            objetsRetrouvesNumeros.push({ numero: match[1], isCreated: true })
            console.log('✅ Objet retrouvé créé détecté:', match[1])
          }
        }
      }
    })
    
    // Extraire les objets perdus mentionnés (correspondants) - mais seulement s'ils ne sont pas déjà créés
    objetPerduMentionnePatterns.forEach(pattern => {
      const matches = description.matchAll(pattern)
      for (const match of matches) {
        if (match[1] && (match[1].includes('-OP-') || match[1].includes('OP'))) {
          // Normaliser le format si nécessaire
          const numero = match[1].includes('-OP-') ? match[1] : match[1].replace(/([A-Z0-9]+)OP([A-Z0-9]+)/, '$1-OP-$2')
          if (!objetsPerdusNumeros.find(o => o.numero === numero)) {
            objetsPerdusNumeros.push({ numero, isCreated: false })
            console.log('📝 Objet perdu mentionné détecté:', numero)
          }
        }
      }
    })
    
    // Extraire les objets retrouvés mentionnés (correspondants) - mais seulement s'ils ne sont pas déjà créés
    objetRetrouveMentionnePatterns.forEach(pattern => {
      const matches = description.matchAll(pattern)
      for (const match of matches) {
        if (match[1] && (match[1].includes('-OR-') || match[1].includes('OR'))) {
          // Normaliser le format si nécessaire
          const numero = match[1].includes('-OR-') ? match[1] : match[1].replace(/([A-Z0-9]+)OR([A-Z0-9]+)/, '$1-OR-$2')
          if (!objetsRetrouvesNumeros.find(o => o.numero === numero)) {
            objetsRetrouvesNumeros.push({ numero, isCreated: false })
            console.log('📝 Objet retrouvé mentionné détecté:', numero)
          }
        }
      }
    })
    
    console.log('🔍 Objets détectés:', { objetsPerdusNumeros, objetsRetrouvesNumeros })
    return { objetsPerdusNumeros, objetsRetrouvesNumeros }
  }, [])
  
  // Charger les IDs des objets mentionnés dans l'alerte
  useEffect(() => {
    if (!alerte?.description) {
      console.log('⚠️ Pas de description d\'alerte disponible')
      return
    }
    
    console.log('🔍 Description de l\'alerte:', alerte.description)
    const { objetsPerdusNumeros, objetsRetrouvesNumeros } = extractObjectNumbers(alerte.description)
    
    if (objetsPerdusNumeros.length === 0 && objetsRetrouvesNumeros.length === 0) {
      console.log('⚠️ Aucun objet détecté dans la description')
      return
    }
    
    console.log('📦 Chargement des objets détectés...', { objetsPerdusNumeros, objetsRetrouvesNumeros })
    setLoadingObjets(true)
    
    const loadObjets = async () => {
      const perdusPromises = objetsPerdusNumeros.map(async (objetInfo) => {
        try {
          console.log(`🔄 Chargement objet perdu: ${objetInfo.numero}`)
          const response = await api.get(`/objets-perdus/numero/${objetInfo.numero}`)
          const objetData = { 
            numero: objetInfo.numero, 
            id: response.data?.data?.id || response.data?.id,
            isCreated: objetInfo.isCreated
          }
          console.log(`✅ Objet perdu chargé:`, objetData)
          return objetData
        } catch (error) {
          console.error(`❌ Erreur lors de la récupération de l'objet perdu ${objetInfo.numero}:`, error)
          return null
        }
      })
      
      const retrouvesPromises = objetsRetrouvesNumeros.map(async (objetInfo) => {
        try {
          console.log(`🔄 Chargement objet retrouvé: ${objetInfo.numero}`)
          const response = await api.get(`/objets-retrouves/numero/${objetInfo.numero}`)
          const objetData = { 
            numero: objetInfo.numero, 
            id: response.data?.data?.id || response.data?.id,
            isCreated: objetInfo.isCreated
          }
          console.log(`✅ Objet retrouvé chargé:`, objetData)
          return objetData
        } catch (error) {
          console.error(`❌ Erreur lors de la récupération de l'objet retrouvé ${objetInfo.numero}:`, error)
          return null
        }
      })
      
      const [perdusResults, retrouvesResults] = await Promise.all([
        Promise.all(perdusPromises),
        Promise.all(retrouvesPromises)
      ])
      
      const perdusFiltered: Array<{numero: string, id: string, isCreated?: boolean}> = perdusResults
        .filter((o): o is Exclude<typeof o, null> => o !== null && !!o.id)
        .map(o => ({ numero: o.numero, id: o.id, isCreated: o.isCreated }))
      const retrouvesFiltered: Array<{numero: string, id: string, isCreated?: boolean}> = retrouvesResults
        .filter((o): o is Exclude<typeof o, null> => o !== null && !!o.id)
        .map(o => ({ numero: o.numero, id: o.id, isCreated: o.isCreated }))
      
      console.log('✅ Objets chargés:', { perdus: perdusFiltered, retrouves: retrouvesFiltered })
      setObjetsPerdus(perdusFiltered)
      setObjetsRetrouves(retrouvesFiltered)
      setLoadingObjets(false)
    }
    
    loadObjets()
  }, [alerte?.description, extractObjectNumbers])
  
  // Fonctions utilitaires
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const getStatutColor = (statut: AlertStatus) => {
    switch (statut) {
      case 'En cours':
        return 'bg-orange-500 text-white'
      case 'Résolue':
        return 'bg-green-500 text-white'
      case 'Archivée':
        return 'bg-gray-500 text-white'
    }
  }

  const getSeveriteColor = (severite: AlertSeverity) => {
    switch (severite) {
      case 'Critique':
        return 'bg-red-500 text-white'
      case 'Élevée':
        return 'bg-orange-500 text-white'
      case 'Moyenne':
        return 'bg-yellow-500 text-white'
      case 'Faible':
        return 'bg-blue-500 text-white'
    }
  }

  const getInterventionColor = (statut: InterventionStatus) => {
    switch (statut) {
      case 'Déployée':
        return 'bg-blue-500 text-white'
      case 'En route':
        return 'bg-yellow-500 text-white'
      case 'Sur place':
        return 'bg-orange-500 text-white'
      case 'Terminée':
        return 'bg-green-500 text-white'
    }
  }

  const getStatutIcon = (statut: AlertStatus) => {
    switch (statut) {
      case 'En cours':
        return <Clock className="w-4 h-4" />
      case 'Résolue':
        return <CheckCircle className="w-4 h-4" />
      case 'Archivée':
        return <Archive className="w-4 h-4" />
    }
  }

  // Gérer le cas où l'alerte n'est pas chargée
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Chargement de l'alerte...</p>
        </div>
      </div>
    )
  }

  if (error || !alerte) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardBody className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Erreur</h2>
            <p className="text-slate-600 mb-4">{error || 'Alerte non trouvée'}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => router.back()} variant="secondary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <Button onClick={() => refetch()} variant="primary">
                Réessayer
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header avec navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="secondary" 
            size="md" 
            className="!p-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
              {alerte.titre}
            </h1>
            <p className="text-slate-600 mt-1">
              {alerte.numero}
            </p>
            <p className="text-slate-500 text-sm mt-0.5">
              {alerte.date}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap items-center">
          {/* Bouton pour accéder aux objets créés lors de l'alerte (prioritaire) */}
          {(loadingObjets || objetsPerdus.filter(o => o.isCreated && o.id).length > 0 || objetsRetrouves.filter(o => o.isCreated && o.id).length > 0) && (
            <div className="flex gap-2 flex-wrap">
              {loadingObjets && (
                <Button
                  variant="secondary"
                  size="md"
                  disabled
                  className="flex items-center gap-2"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Chargement...</span>
                </Button>
              )}
              {objetsPerdus.filter(o => o.isCreated && o.id).map((objet) => (
                <Button
                  key={objet.id}
                  variant="primary"
                  size="md"
                  onClick={() => router.push(`/gestion/objets-perdus/${objet.id}`)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                >
                  <PackageSearch className="w-5 h-5" />
                  <span>Voir Déclaration {objet.numero}</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              ))}
              {objetsRetrouves.filter(o => o.isCreated && o.id).map((objet) => (
                <Button
                  key={objet.id}
                  variant="primary"
                  size="md"
                  onClick={() => router.push(`/gestion/objets-retrouves/${objet.id}`)}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                >
                  <PackageCheck className="w-5 h-5" />
                  <span>Voir Dépôt {objet.numero}</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              ))}
            </div>
          )}
          <Button variant="secondary" size="md">
            <Printer className="w-5 h-5" />
            Imprimer
          </Button>
          <Button variant="primary" size="md">
            <Download className="w-5 h-5" />
            Exporter PDF
          </Button>
        </div>
      </div>

      {/* Statut et informations principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardBody className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 mb-4">{alerte.titre}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">N° Alerte</label>
                    <div className="text-lg font-bold text-slate-900">#{alerte.numero}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Date & Heure</label>
                    <div className="text-slate-900 flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {alerte.date} à {alerte.heure}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Type d'alerte</label>
                    <div className="text-slate-900 font-medium">{alerte.type}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Sévérité</label>
                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getSeveriteColor(alerte.severite)}`}>
                      {alerte.severite}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-slate-600">Lieu</label>
                    <div className="text-slate-900 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {alerte.lieu}
                    </div>
                    {(alerte.coordonnees.latitude || alerte.coordonnees.longitude) && (
                      <div className="text-xs text-slate-500 ml-5 mt-1">
                        {alerte.coordonnees.latitude}, {alerte.coordonnees.longitude} {alerte.coordonnees.precision && `(${alerte.coordonnees.precision})`}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Agent récepteur</label>
                    <div className="text-slate-900">{alerte.agentRecepteur.nom}</div>
                    <div className="text-sm text-slate-500">{alerte.agentRecepteur.commissariat}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Heure réception</label>
                    <div className="text-slate-900 flex items-center gap-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {alerte.agentRecepteur.heureReception || alerte.heure}
                    </div>
                  </div>
                </div>
              </div>
              <span className={`inline-flex px-4 py-2 text-sm font-bold rounded-full ${getStatutColor(alerte.statut)}`}>
                {getStatutIcon(alerte.statut)}
                <span className="ml-2">{alerte.statut}</span>
              </span>
            </div>

            {/* Affichage de la diffusion si l'alerte est diffusée */}
            {alerte.diffusee && alerte.dateDiffusion && (
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Bell className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-bold text-amber-900 mb-2">Alerte diffusée</div>
                    <div className="text-sm text-amber-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Type de diffusion :</span>
                        <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded text-xs font-bold">
                          {alerte.diffusionDestinataires?.diffusionGenerale 
                            ? 'Diffusion générale - Tous les commissariats'
                            : ' Diffusion sélective'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">Date :</span>
                        <span>{new Date(alerte.dateDiffusion).toLocaleDateString('fr-FR', { 
                          day: '2-digit', 
                          month: 'long', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                      {(() => {
                        // Chercher dans les suivis qui a diffusé l'alerte
                        const suiviDiffusion = alerte.suivis?.find(s => 
                          s.action?.toLowerCase().includes('diffusée') || 
                          s.action?.toLowerCase().includes('diffusion') ||
                          s.statut === 'ACTIVE'
                        )
                        return suiviDiffusion && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="font-medium">Diffusée par :</span>
                            <span className="text-amber-900 font-semibold">{suiviDiffusion.agent}</span>
                            {suiviDiffusion.agentCommissariat && (
                              <span className="text-xs text-amber-700">({suiviDiffusion.agentCommissariat})</span>
                            )}
                          </div>
                        )
                      })()}
                      {!alerte.diffusionDestinataires?.diffusionGenerale && (
                        <div className="flex items-center gap-2 pt-2 border-t border-amber-200">
                          <Building2 className="w-4 h-4" />
                          <span className="font-medium">Destinataires :</span>
                          <span>
                            {alerte.diffusionDestinataires?.commissariats?.length || 0} commissariat(s), 
                            {alerte.diffusionDestinataires?.agents?.length || 0} agent(s)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {alerte.intervention && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-blue-600" />
                  <div className="flex-1">
                    <div className="font-bold text-blue-900">Intervention en cours</div>
                    <div className="text-sm text-blue-700">
                      Équipe de {alerte.intervention.equipe.length} agent{alerte.intervention.equipe.length > 1 ? 's' : ''}{alerte.intervention.tempsReponse ? ` • Temps de réponse: ${alerte.intervention.tempsReponse}` : ''}
                    </div>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getInterventionColor(alerte.intervention.statut)}`}>
                    {alerte.intervention.statut}
                  </span>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Résumé</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-sm text-slate-600">Témoins</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">{alerte.temoins.length}</div>
                  <div className="text-xs text-slate-500">déclarations</div>
                </div>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-sm text-slate-600">Documents</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">{alerte.documents.length}</div>
                  <div className="text-xs text-slate-500">pièces</div>
                </div>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-sm text-slate-600">Photos</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">{alerte.photos.length}</div>
                  <div className="text-xs text-slate-500">clichés</div>
                </div>
              </div>
              {alerte.evaluation && (
                <div className="pt-2">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-orange-900">
                      <AlertTriangle className="w-4 h-4" />
                      <div>
                        <div className="text-xs font-medium">Victimes</div>
                        <div className="text-sm font-bold">{alerte.evaluation.victimes} personne(s)</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Panel d'actions de traitement - Masqué si alerte archivée ou résolue */}
      {(() => {
        const statut = (alerte.statut || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const isArchivee = statut === 'ARCHIVEE' || statut === 'ARCHIVE';
        const isResolue = statut === 'RESOLUE' || statut === 'RESOLVE';
        const isTerminee = isArchivee || isResolue;
        const shouldShow = !isTerminee;
        
        // Vérifier si diffusion interne ou affectation a été faite pour CE commissariat
        const currentCommId = currentUserCommissariatId || '';
        const assignationCourante = currentCommId ? alerte.assignationDestinataires?.[currentCommId] : undefined;
        const hasDiffusionInterne = !!(assignationCourante && 
          ((assignationCourante as any).agents?.length > 0 ||
           (assignationCourante as any).assigneeGenerale === true));
        const hasAffectation = !!(assignationCourante && (assignationCourante as any).agentResponsable);
        
        console.log('🔍 Debug Actions:', { 
          original: alerte.statut, 
          normalized: statut,
          currentCommId,
          assignationDestinataires: alerte.assignationDestinataires,
          assignationPourCeCommissariat: alerte.assignationDestinataires?.[currentCommId || ''],
          hasDiffusionInterne,
          hasAffectation,
          shouldShowPanel: shouldShow
        });
        return shouldShow;
      })() && (
        <div className="mb-6">
          <AlerteActionsPanel
            alerteId={alerteId}
            alerteStatut={alerte.statut}
            hasIntervention={!!alerte.intervention}
            hasEvaluation={!!alerte.evaluation}
            hasRapport={!!alerte.rapport}
            isDiffusee={alerte.diffusee || false}
            hasDiffusionInterne={(() => {
              const commId = currentUserCommissariatId || '';
              const assignation = commId && alerte.assignationDestinataires?.[commId];
              return !!(assignation && 
                ((assignation as any).agents?.length > 0 ||
                 (assignation as any).assigneeGenerale === true));
            })()}
            hasAffectation={(() => {
              const commId = currentUserCommissariatId || '';
              const assignation = commId && alerte.assignationDestinataires?.[commId];
              return !!(assignation && (assignation as any).agentResponsable);
            })()}
            interventionData={alerte.intervention}
            commissariatId={alerte.commissariatId}
            canAssign={canAssign}
            currentUserCommissariatId={currentUserCommissariatId || undefined}
            onActionSuccess={() => {
              refetch()
            }}
          />
        </div>
      )}

      {/* Onglets */}
      <div className="mb-6">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'details', label: 'Description', icon: FileText },
              { id: 'intervention', label: 'Intervention', icon: Shield },
              { id: 'evaluation', label: 'Évaluation', icon: ClipboardCheck },
              { id: 'temoins', label: 'Témoins', icon: Users },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'photos', label: 'Photos', icon: Camera },
              ...(canViewDiffusion ? [{ id: 'diffusion', label: 'Diffusion', icon: Bell }] : []),
              { id: 'suivi', label: 'Suivi', icon: Activity }
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
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'details' && (
        <div className="space-y-6">
          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Description de l'alerte</h3>
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <p className="text-slate-700 whitespace-pre-line">{alerte.description}</p>
              </div>
              
              {/* Liens vers les objets mentionnés */}
              {(objetsPerdus.length > 0 || objetsRetrouves.length > 0) && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-emerald-50 border-2 border-blue-200 rounded-lg">
                  <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <PackageSearch className="w-5 h-5 text-blue-600" />
                    Objets mentionnés dans l'alerte
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Objets perdus créés lors de l'alerte */}
                    {objetsPerdus.filter(o => o.isCreated).length > 0 && (
                      <div className="space-y-2 p-3 bg-blue-100 border-2 border-blue-400 rounded-lg">
                        <p className="text-sm font-bold text-blue-900 flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded font-bold">DÉCLARATION CRÉÉE</span>
                          Déclaration d'objet perdu créée lors de cette alerte :
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {objetsPerdus.filter(o => o.isCreated).map((objet) => (
                            <Button
                              key={objet.id}
                              variant="primary"
                              size="md"
                              onClick={() => router.push(`/gestion/objets-perdus/${objet.id}`)}
                              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg font-bold"
                            >
                              <PackageSearch className="w-5 h-5" />
                              <span>Voir Objet Perdu {objet.numero}</span>
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Objets perdus correspondants mentionnés */}
                    {objetsPerdus.filter(o => !o.isCreated).length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-slate-700">Objets perdus correspondants mentionnés :</p>
                        <div className="flex flex-wrap gap-3">
                          {objetsPerdus.filter(o => !o.isCreated).map((objet) => (
                            <Button
                              key={objet.id}
                              variant="primary"
                              size="md"
                              onClick={() => router.push(`/gestion/objets-perdus/${objet.id}`)}
                              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white shadow-md"
                            >
                              <PackageSearch className="w-5 h-5" />
                              <span className="font-semibold">Objet Perdu {objet.numero}</span>
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Objets retrouvés créés lors de l'alerte */}
                    {objetsRetrouves.filter(o => o.isCreated).length > 0 && (
                      <div className="space-y-2 p-3 bg-emerald-100 border-2 border-emerald-400 rounded-lg">
                        <p className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                          <span className="px-2 py-1 bg-emerald-600 text-white text-xs rounded font-bold">DÉPÔT CRÉÉ</span>
                          Dépôt d'objet retrouvé créé lors de cette alerte :
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {objetsRetrouves.filter(o => o.isCreated).map((objet) => (
                            <Button
                              key={objet.id}
                              variant="primary"
                              size="md"
                              onClick={() => router.push(`/gestion/objets-retrouves/${objet.id}`)}
                              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg font-bold"
                            >
                              <PackageCheck className="w-5 h-5" />
                              <span>Voir Objet Retrouvé {objet.numero}</span>
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Objets retrouvés correspondants mentionnés */}
                    {objetsRetrouves.filter(o => !o.isCreated).length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-slate-700">Objets retrouvés correspondants mentionnés :</p>
                        <div className="flex flex-wrap gap-3">
                          {objetsRetrouves.filter(o => !o.isCreated).map((objet) => (
                            <Button
                              key={objet.id}
                              variant="primary"
                              size="md"
                              onClick={() => router.push(`/gestion/objets-retrouves/${objet.id}`)}
                              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-md"
                            >
                              <PackageCheck className="w-5 h-5" />
                              <span className="font-semibold">Objet Retrouvé {objet.numero}</span>
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {loadingObjets && (
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Chargement des objets mentionnés...</span>
                </div>
              )}
              
              {alerte.contexte && (
                <>
                  <h4 className="font-medium text-slate-900 mb-3 mt-6">Contexte</h4>
                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <p className="text-slate-700">{alerte.contexte}</p>
                  </div>
                </>
              )}

              {alerte.risques && alerte.risques.length > 0 && (
                <>
                </>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {alerte.risques && Array.isArray(alerte.risques) && alerte.risques.map((risque, index) => (
                  <div key={index} className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-red-900">{risque}</span>
                  </div>
                ))}
              </div>

              {/* Informations spécifiques selon le type d'alerte */}
              
              {/* Accident - Informations sur l'accident */}
              {alerte.typeRaw === 'ACCIDENT' && alerte.personneConcernee && 
               (alerte.personneConcernee.nom || alerte.personneConcernee.telephone || alerte.personneConcernee.relation || (alerte.personneConcernee as any).description) && (
                <>
                  <h4 className="font-medium text-slate-900 mb-3 mt-6 flex items-center gap-2">
                    <Ambulance className="w-5 h-5 text-purple-600" />
                    Informations sur l'accident
                  </h4>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {alerte.personneConcernee.nom && alerte.personneConcernee.nom !== '0' && parseInt(alerte.personneConcernee.nom) > 0 && (
                        <div>
                          <label className="text-xs font-medium text-purple-900">Personnes impliquées</label>
                          <div className="text-purple-900 font-bold text-2xl">{alerte.personneConcernee.nom}</div>
                          <div className="text-xs text-purple-700 mt-1">personne{parseInt(alerte.personneConcernee.nom) > 1 ? 's' : ''}</div>
                        </div>
                      )}
                      {alerte.personneConcernee.telephone && alerte.personneConcernee.telephone !== '0' && parseInt(alerte.personneConcernee.telephone) >= 0 && (
                        <div>
                          <label className="text-xs font-medium text-purple-900">Blessés</label>
                          <div className="text-purple-900 font-bold text-2xl">{alerte.personneConcernee.telephone}</div>
                          <div className="text-xs text-purple-700 mt-1">personne{parseInt(alerte.personneConcernee.telephone) > 1 ? 's' : ''}</div>
                        </div>
                      )}
                      {alerte.personneConcernee.relation && (
                        <div className="md:col-span-2">
                          <label className="text-xs font-medium text-purple-900">Services d'urgence contactés</label>
                          <div className="text-purple-900 font-medium">{alerte.personneConcernee.relation}</div>
                        </div>
                      )}
                      {(alerte.personneConcernee as any).description && (
                        <div className="md:col-span-2">
                          <label className="text-xs font-medium text-purple-900">Gravité et détails</label>
                          <div className="text-purple-900">{(alerte.personneConcernee as any).description}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Aggression - Informations sur la victime */}
              {alerte.typeRaw === 'AGGRESSION' && alerte.personneConcernee && (
                <>
                  <h4 className="font-medium text-slate-900 mb-3 mt-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-red-600" />
                    Informations sur la victime
                  </h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {alerte.personneConcernee.nom && (
                        <div>
                          <label className="text-xs font-medium text-red-900">Nom de la victime</label>
                          <div className="text-red-900 font-bold">{alerte.personneConcernee.nom}</div>
                        </div>
                      )}
                      {alerte.personneConcernee.telephone && (
                        <div>
                          <label className="text-xs font-medium text-red-900">Téléphone</label>
                          <div className="text-red-900">{alerte.personneConcernee.telephone}</div>
                        </div>
                      )}
                      {(alerte.personneConcernee as any).description && (
                        <div className="md:col-span-2">
                          <label className="text-xs font-medium text-red-900">État de la victime</label>
                          <div className="text-red-900">{(alerte.personneConcernee as any).description}</div>
                        </div>
                      )}
                      {alerte.suspect?.description && (
                        <div className="md:col-span-2">
                          <label className="text-xs font-medium text-red-900">Description de l'agresseur</label>
                          <div className="text-red-900">{alerte.suspect.description}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Incendie - Informations sur l'incendie */}
              {alerte.typeRaw === 'INCENDIE' && alerte.personneConcernee && (
                <>
                  <h4 className="font-medium text-slate-900 mb-3 mt-6 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-600" />
                    Informations sur l'incendie
                  </h4>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {alerte.personneConcernee.relation && (
                        <div>
                          <label className="text-xs font-medium text-amber-900">Type de bâtiment/lieu</label>
                          <div className="text-amber-900 font-medium">{alerte.personneConcernee.relation}</div>
                        </div>
                      )}
                      {alerte.personneConcernee.nom && (
                        <div>
                          <label className="text-xs font-medium text-amber-900">Ampleur</label>
                          <div className="text-amber-900 font-bold">{alerte.personneConcernee.nom}</div>
                        </div>
                      )}
                      {alerte.personneConcernee.telephone && (
                        <div className="md:col-span-2">
                          <label className="text-xs font-medium text-amber-900">Pompiers contactés</label>
                          <div className="text-amber-900">{alerte.personneConcernee.telephone}</div>
                        </div>
                      )}
                      {(alerte.personneConcernee as any).description && (
                        <div className="md:col-span-2">
                          <label className="text-xs font-medium text-amber-900">Risques et évacuations</label>
                          <div className="text-amber-900">{(alerte.personneConcernee as any).description}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Urgence sécurité - Détails de l'urgence */}
              {alerte.typeRaw === 'URGENCE_SECURITE' && alerte.personneConcernee && (
                <>
                  <h4 className="font-medium text-slate-900 mb-3 mt-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    Détails de l'urgence sécurité
                  </h4>
                  <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {alerte.personneConcernee.relation && (
                        <div className="md:col-span-2">
                          <label className="text-xs font-medium text-red-900">Nature de l'urgence</label>
                          <div className="text-red-900 font-bold">{alerte.personneConcernee.relation}</div>
                        </div>
                      )}
                      {alerte.personneConcernee.nom && (
                        <div>
                          <label className="text-xs font-medium text-red-900">Personnes en danger</label>
                          <div className="text-red-900 font-bold text-2xl">{alerte.personneConcernee.nom}</div>
                        </div>
                      )}
                      {alerte.personneConcernee.telephone && (
                        <div>
                          <label className="text-xs font-medium text-red-900">Suspects/Agresseurs</label>
                          <div className="text-red-900 font-bold text-2xl">{alerte.personneConcernee.telephone}</div>
                        </div>
                      )}
                      {alerte.suspect?.description && (
                        <div className="md:col-span-2">
                          <label className="text-xs font-medium text-red-900">Armes utilisées</label>
                          <div className="text-red-900">{alerte.suspect.description}</div>
                        </div>
                      )}
                      {(alerte.personneConcernee as any).description && (
                        <div className="md:col-span-2">
                          <label className="text-xs font-medium text-red-900">Renforts nécessaires</label>
                          <div className="text-red-900">{(alerte.personneConcernee as any).description}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Alerte générale - Détails */}
              {alerte.typeRaw === 'ALERTE_GENERALE' && alerte.personneConcernee && (
                <>
                  <h4 className="font-medium text-slate-900 mb-3 mt-6 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-indigo-600" />
                    Détails de l'alerte générale
                  </h4>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {alerte.personneConcernee.relation && (
                        <div className="md:col-span-2">
                          <label className="text-xs font-medium text-indigo-900">Type d'alerte</label>
                          <div className="text-indigo-900 font-bold">{alerte.personneConcernee.relation}</div>
                        </div>
                      )}
                      {alerte.personneConcernee.nom && (
                        <div>
                          <label className="text-xs font-medium text-indigo-900">Zones/Commissariats concernés</label>
                          <div className="text-indigo-900">{alerte.personneConcernee.nom}</div>
                        </div>
                      )}
                      {alerte.personneConcernee.telephone && (
                        <div>
                          <label className="text-xs font-medium text-indigo-900">Durée estimée</label>
                          <div className="text-indigo-900">{alerte.personneConcernee.telephone}</div>
                        </div>
                      )}
                      {(alerte.personneConcernee as any).description && (
                        <div className="md:col-span-2">
                          <label className="text-xs font-medium text-indigo-900">Consignes au public</label>
                          <div className="text-indigo-900">{(alerte.personneConcernee as any).description}</div>
                        </div>
                      )}
                      {alerte.suspect?.nom && (
                        <div className="md:col-span-2">
                          <label className="text-xs font-medium text-indigo-900">Contact d'urgence</label>
                          <div className="text-indigo-900 font-medium">{alerte.suspect.nom}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Maintenance système - Détails */}
              {alerte.typeRaw === 'MAINTENANCE_SYSTEME' && alerte.personneConcernee && (
                <>
                  <h4 className="font-medium text-slate-900 mb-3 mt-6 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-gray-600" />
                    Détails de la maintenance
                  </h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {alerte.personneConcernee.relation && (
                        <div className="md:col-span-2">
                          <label className="text-xs font-medium text-gray-900">Type de maintenance</label>
                          <div className="text-gray-900 font-bold">{alerte.personneConcernee.relation}</div>
                        </div>
                      )}
                      {alerte.personneConcernee.nom && (
                        <div>
                          <label className="text-xs font-medium text-gray-900">Système/Module concerné</label>
                          <div className="text-gray-900 font-medium">{alerte.personneConcernee.nom}</div>
                        </div>
                      )}
                      {alerte.personneConcernee.telephone && (
                        <div>
                          <label className="text-xs font-medium text-gray-900">Début</label>
                          <div className="text-gray-900">{alerte.personneConcernee.telephone}</div>
                        </div>
                      )}
                      {alerte.suspect?.nom && (
                        <div>
                          <label className="text-xs font-medium text-gray-900">Fin estimée</label>
                          <div className="text-gray-900">{alerte.suspect.nom}</div>
                        </div>
                      )}
                      {(alerte.personneConcernee as any).description && (
                        <div className="md:col-span-2">
                          <label className="text-xs font-medium text-gray-900">Impact sur les services</label>
                          <div className="text-gray-900">{(alerte.personneConcernee as any).description}</div>
                        </div>
                      )}
                      {alerte.suspect?.description && (
                        <div className="md:col-span-2">
                          <label className="text-xs font-medium text-gray-900">Actions utilisateurs</label>
                          <div className="text-gray-900">{alerte.suspect.description}</div>
                        </div>
                      )}
                      {alerte.suspect?.adresse && (
                        <div className="md:col-span-2">
                          <label className="text-xs font-medium text-gray-900">Responsable</label>
                          <div className="text-gray-900 font-medium">{alerte.suspect.adresse}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Autre - Informations complémentaires */}
              {alerte.typeRaw === 'AUTRE' && alerte.personneConcernee && (
                <>
                  <h4 className="font-medium text-slate-900 mb-3 mt-6 flex items-center gap-2">
                    <Radio className="w-5 h-5 text-slate-600" />
                    Informations complémentaires
                  </h4>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {alerte.personneConcernee.relation && (
                        <div>
                          <label className="text-xs font-medium text-slate-900">Catégorie</label>
                          <div className="text-slate-900 font-medium">{alerte.personneConcernee.relation}</div>
                        </div>
                      )}
                      {alerte.personneConcernee.nom && (
                        <div>
                          <label className="text-xs font-medium text-slate-900">Services à contacter</label>
                          <div className="text-slate-900">{alerte.personneConcernee.nom}</div>
                        </div>
                      )}
                      {alerte.personneConcernee.telephone && (
                        <div>
                          <label className="text-xs font-medium text-slate-900">Numéro d'urgence</label>
                          <div className="text-slate-900 font-medium">{alerte.personneConcernee.telephone}</div>
                        </div>
                      )}
                      {(alerte.personneConcernee as any).description && (
                        <div className="md:col-span-2">
                          <label className="text-xs font-medium text-slate-900">Détails supplémentaires</label>
                          <div className="text-slate-900">{(alerte.personneConcernee as any).description}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Véhicule concerné */}
              {alerte.vehicule && (
                <>
                  <h4 className="font-medium text-slate-900 mb-3 mt-6 flex items-center gap-2">
                    <Car className="w-5 h-5 text-blue-600" />
                    Véhicule concerné
                  </h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-medium text-blue-900">Immatriculation</label>
                        <div className="text-blue-900 font-bold text-lg">{alerte.vehicule.immatriculation}</div>
                      </div>
                      {alerte.vehicule.marque && (
                        <div>
                          <label className="text-xs font-medium text-blue-900">Marque</label>
                          <div className="text-blue-900 font-medium">{alerte.vehicule.marque}</div>
                        </div>
                      )}
                      {alerte.vehicule.modele && (
                        <div>
                          <label className="text-xs font-medium text-blue-900">Modèle</label>
                          <div className="text-blue-900 font-medium">{alerte.vehicule.modele}</div>
                        </div>
                      )}
                      {alerte.vehicule.couleur && (
                        <div>
                          <label className="text-xs font-medium text-blue-900">Couleur</label>
                          <div className="text-blue-900 font-medium">{alerte.vehicule.couleur}</div>
                        </div>
                      )}
                      {(alerte.vehicule as any).annee && (
                        <div>
                          <label className="text-xs font-medium text-blue-900">Année</label>
                          <div className="text-blue-900 font-medium">{(alerte.vehicule as any).annee}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Suspect recherché */}
              {alerte.suspect && (
                <>
                  <h4 className="font-medium text-slate-900 mb-3 mt-6 flex items-center gap-2">
                    <UserX className="w-5 h-5 text-orange-600" />
                    Suspect recherché
                  </h4>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-xs font-medium text-orange-900">Nom</label>
                        <div className="text-orange-900 font-bold text-lg">{alerte.suspect.nom}</div>
                      </div>
                      {alerte.suspect.description && (
                        <div>
                          <label className="text-xs font-medium text-orange-900">Description physique</label>
                          <div className="text-orange-900">{alerte.suspect.description}</div>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {alerte.suspect.age && (
                          <div>
                            <label className="text-xs font-medium text-orange-900">Âge</label>
                            <div className="text-orange-900 font-medium">{alerte.suspect.age}</div>
                          </div>
                        )}
                        {alerte.suspect.adresse && (
                          <div>
                            <label className="text-xs font-medium text-orange-900">Dernière adresse connue</label>
                            <div className="text-orange-900">{alerte.suspect.adresse}</div>
                          </div>
                        )}
                      </div>
                      {alerte.suspect.motif && (
                        <div>
                          <label className="text-xs font-medium text-orange-900">Motif de la recherche</label>
                          <div className="text-orange-900">{alerte.suspect.motif}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* Nouvel onglet Affectation & Diffusion */}
      {activeTab === 'affectation' && (
        <div className="space-y-6">
          {alerte.assignationDestinataires && Object.keys(alerte.assignationDestinataires).length > 0 ? (
            <Card>
              <CardBody className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6 text-purple-600" />
                  Affectation & Diffusion interne
                </h3>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <pre className="text-xs text-slate-700 overflow-auto">
                    {JSON.stringify(alerte.assignationDestinataires, null, 2)}
                  </pre>
                </div>

                <div className="space-y-4">
                  {Object.entries(alerte.assignationDestinataires).map(([commissariatId, data]: [string, any]) => {
                    console.log('🔍 Data pour commissariat:', commissariatId, data);
                    return (
                    <div key={commissariatId} className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-purple-600" />
                          <span className="font-semibold text-purple-900">Commissariat: {commissariatId.substring(0, 8)}...</span>
                        </div>
                        {data.dateAssignation && (
                          <span className="text-xs text-purple-700">
                            {new Date(data.dateAssignation).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>
                      
                      {/* Affectation générale */}
                      {data.assigneeGenerale && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-green-800 font-semibold">
                              Diffusion générale - Tous les agents
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Affectation à un agent responsable */}
                      {data.agentResponsable && (
                        <div className="bg-white border border-purple-300 rounded-lg p-4 mb-3">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                              <UserCheck className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-purple-900">Agent responsable</h4>
                              <p className="text-xs text-purple-700">Chargé du traitement</p>
                            </div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3">
                            <div className="flex items-center gap-3">
                              <User className="w-5 h-5 text-purple-600" />
                              <div>
                                <div className="font-semibold text-slate-900">
                                  {data.agentResponsable.prenom} {data.agentResponsable.nom}
                                </div>
                                <div className="text-sm text-slate-600">
                                  {data.agentResponsable.matricule} • {data.agentResponsable.role || 'Agent'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Agents diffusés */}
                      {data.agents && Array.isArray(data.agents) && data.agents.length > 0 && (
                        <div className="bg-white border border-amber-300 rounded-lg p-4 mb-3">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
                              <Bell className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-purple-900">Agents informés</h4>
                              <p className="text-xs text-purple-700">{data.agents.length} agent(s)</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {data.agents.map((agent: any, idx: number) => (
                              <div key={idx} className="bg-amber-50 rounded-lg p-3 flex items-center gap-3">
                                <User className="w-5 h-5 text-amber-700" />
                                <div>
                                  <div className="font-medium text-slate-900">
                                    {agent.prenom} {agent.nom}
                                  </div>
                                  <div className="text-sm text-slate-600">
                                    {agent.matricule} • {agent.role || 'Agent'}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {data.agentAssignateur && (
                        <div className="mt-3 pt-3 border-t border-purple-200 text-xs text-purple-700 flex items-center gap-2">
                          <User className="w-3 h-3" />
                          <span>
                            Assigné par: <span className="font-semibold">{data.agentAssignateur.prenom} {data.agentAssignateur.nom}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                  })}
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardBody className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucune affectation ou diffusion</h3>
                    <p className="text-sm text-slate-600">
                      Cette alerte n'a pas encore été affectée à un agent ou diffusée en interne.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'intervention' && (
        <div className="space-y-6">
          {alerte.intervention && (
            <>
              <Card>
                <CardBody className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Détails de l'intervention</h3>
                    {((alerte.intervention as any)?.dateDeploiementFormat || (alerte.intervention as any)?.agentDeploiement) && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        {(alerte.intervention as any).dateDeploiementFormat && (
                          <>
                            <Calendar className="w-4 h-4" />
                            Déployée le {(alerte.intervention as any).dateDeploiementFormat}
                            {(alerte.intervention as any).heureDeploiement && ` à ${(alerte.intervention as any).heureDeploiement}`}
                          </>
                        )}
                        {(alerte.intervention as any).agentDeploiement && (
                          <>
                            <span className="mx-1">•</span>
                            <User className="w-4 h-4" />
                            {(alerte.intervention as any).agentDeploiement}
                          </>
                        )}
                        {(alerte.intervention as any).commissariatAgent && (
                          <>
                            <span className="mx-1">•</span>
                            <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                              <Building2 className="w-3 h-3" />
                              <span className="text-xs font-medium">{(alerte.intervention as any).commissariatAgent}</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Statut</label>
                      <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full mt-1 ${getInterventionColor(alerte.intervention.statut)}`}>
                        {alerte.intervention.statut}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Temps de réponse</label>
                      <div className="text-slate-900 font-bold">{alerte.intervention.tempsReponse}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Membres de l'équipe</label>
                      <div className="text-slate-900 font-bold">{alerte.intervention.equipe.length} agents</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Heure de départ</label>
                      <div className="text-slate-900">{alerte.intervention.heureDepart}</div>
                    </div>
                    {alerte.intervention.heureArrivee && (
                      <div>
                        <label className="text-sm font-medium text-slate-600">Heure d'arrivée</label>
                        <div className="text-slate-900">{alerte.intervention.heureArrivee}</div>
                      </div>
                    )}
                    {alerte.intervention.heureFin && (
                      <div>
                        <label className="text-sm font-medium text-slate-600">Heure de fin</label>
                        <div className="text-slate-900">{alerte.intervention.heureFin}</div>
                      </div>
                    )}
                  </div>

                  <h4 className="font-medium text-slate-900 mb-3">Équipe d'intervention</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {alerte.intervention?.equipe && Array.isArray(alerte.intervention.equipe) && alerte.intervention.equipe.map((agent, index) => (
                      <div key={index} className="flex items-center gap-2 bg-slate-50 rounded-lg p-3">
                        <User className="w-5 h-5 text-slate-400" />
                        <div className="flex-1">
                          <span className="text-slate-900 font-medium">{typeof agent === 'string' ? agent : agent.nom}</span>
                          {typeof agent === 'object' && agent.role && (
                            <span className="text-xs text-slate-500 ml-2">({agent.role})</span>
                          )}
                          {typeof agent === 'object' && agent.matricule && (
                            <div className="text-xs text-slate-500">{agent.matricule}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <h4 className="font-medium text-slate-900 mb-3">Moyens déployés</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {alerte.intervention?.moyens && Array.isArray(alerte.intervention.moyens) && alerte.intervention.moyens.map((moyen, index) => (
                      <div key={index} className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                        <span className="text-blue-900">{moyen}</span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Actions menées</h3>
                    {(alerte.actions as any)?.dateDerniereMAJFormat && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="w-4 h-4" />
                        Mise à jour le {(alerte.actions as any).dateDerniereMAJFormat}
                        {(alerte.actions as any).heureDerniereMAJ && ` à ${(alerte.actions as any).heureDerniereMAJ}`}
                        {(alerte.actions as any).agentDerniereMAJ && (
                          <>
                            <span className="mx-1">•</span>
                            <User className="w-4 h-4" />
                            {(alerte.actions as any).agentDerniereMAJ}
                          </>
                        )}
                        {(alerte.actions as any).commissariatAgent && (
                          <>
                            <span className="mx-1">•</span>
                            <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                              <Building2 className="w-3 h-3" />
                              <span className="text-xs font-medium">{(alerte.actions as any).commissariatAgent}</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Actions immédiates
                      </h4>
                      <ul className="space-y-2">
                        {alerte.actions?.immediate && Array.isArray(alerte.actions.immediate) && alerte.actions.immediate.length > 0 ? (
                          alerte.actions.immediate.map((action, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-slate-600 ml-4">
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              {action}
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-slate-400 ml-4">Aucune action immédiate définie</li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        Actions préventives
                      </h4>
                      <ul className="space-y-2">
                        {alerte.actions?.preventive && Array.isArray(alerte.actions.preventive) && alerte.actions.preventive.length > 0 ? (
                          alerte.actions.preventive.map((action, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-slate-600 ml-4">
                              <CheckCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                              {action}
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-slate-400 ml-4">Aucune action préventive définie</li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Actions de suivi
                      </h4>
                      <ul className="space-y-2">
                        {alerte.actions?.suivi && Array.isArray(alerte.actions.suivi) && alerte.actions.suivi.length > 0 ? (
                          alerte.actions.suivi.map((action, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-slate-600 ml-4">
                              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                              {action}
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-slate-400 ml-4">Aucune action de suivi définie</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </>
          )}
        </div>
      )}

      {activeTab === 'evaluation' && (
        <div className="space-y-6">
          {alerte.evaluation && (
            <>
              <Card>
                <CardBody className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Évaluation sur place</h3>
                    {(alerte.evaluation as any)?.dateEvaluationFormat && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="w-4 h-4" />
                        {(alerte.evaluation as any).dateEvaluationFormat}
                        {(alerte.evaluation as any).heureEvaluation && ` à ${(alerte.evaluation as any).heureEvaluation}`}
                        {(alerte.evaluation as any).agentEvaluation && (
                          <>
                            <span className="mx-1">•</span>
                            <User className="w-4 h-4" />
                            {(alerte.evaluation as any).agentEvaluation}
                          </>
                        )}
                        {(alerte.evaluation as any).commissariatAgent && (
                          <>
                            <span className="mx-1">•</span>
                            <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                              <Building2 className="w-3 h-3" />
                              <span className="text-xs font-medium">{(alerte.evaluation as any).commissariatAgent}</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <label className="text-sm font-medium text-red-900">Victimes</label>
                      <div className="text-3xl font-bold text-red-900">{alerte.evaluation.victimes}</div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <label className="text-sm font-medium text-orange-900">Renforts</label>
                      <div className="text-lg font-bold text-orange-900">
                        {alerte.evaluation.renforts ? 'Oui' : 'Non'}
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <label className="text-sm font-medium text-blue-900">Mesures prises</label>
                      <div className="text-3xl font-bold text-blue-900">{alerte.evaluation.mesuresPrises.length}</div>
                    </div>
                  </div>

                  <h4 className="font-medium text-slate-900 mb-3">Situation réelle constatée</h4>
                  <div className="bg-slate-50 rounded-lg p-4 mb-6">
                    <p className="text-slate-700">{alerte.evaluation.situationReelle}</p>
                  </div>

                  <h4 className="font-medium text-slate-900 mb-3">Dégâts observés</h4>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <p className="text-orange-900">{alerte.evaluation.degats}</p>
                  </div>

                  {alerte.evaluation.renfortsDetails && (
                    <>
                      <h4 className="font-medium text-slate-900 mb-3">Détails des renforts</h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-blue-900">{alerte.evaluation.renfortsDetails}</p>
                      </div>
                    </>
                  )}

                  <h4 className="font-medium text-slate-900 mb-3">Mesures prises sur place</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {alerte.evaluation?.mesuresPrises && Array.isArray(alerte.evaluation.mesuresPrises) && alerte.evaluation.mesuresPrises.map((mesure, index) => (
                      <div key={index} className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-green-900">{mesure}</span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

            </>
          )}

          {/* Rapport final - Toujours visible s'il existe (indépendamment de l'évaluation) */}
          {alerte.rapport && (
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Rapport final</h3>
                      {(alerte.rapport as any)?.dateRapportFormat && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Calendar className="w-4 h-4" />
                          {(alerte.rapport as any).dateRapportFormat}
                          {(alerte.rapport as any).heureRapport && ` à ${(alerte.rapport as any).heureRapport}`}
                          {(alerte.rapport as any).agentRapport && (
                            <>
                              <span className="mx-1">•</span>
                              <User className="w-4 h-4" />
                              {(alerte.rapport as any).agentRapport}
                            </>
                          )}
                          {(alerte.rapport as any).commissariatAgent && (
                            <>
                              <span className="mx-1">•</span>
                              <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                <Building2 className="w-3 h-3" />
                                <span className="text-xs font-medium">{(alerte.rapport as any).commissariatAgent}</span>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <h4 className="font-medium text-slate-900 mb-3">Résumé</h4>
                    <div className="bg-slate-50 rounded-lg p-4 mb-6">
                      <p className="text-slate-700">{alerte.rapport.resume}</p>
                    </div>

                    <h4 className="font-medium text-slate-900 mb-3">Conclusions</h4>
                    <ul className="space-y-2 mb-6">
                      {alerte.rapport?.conclusions && Array.isArray(alerte.rapport.conclusions) && alerte.rapport.conclusions.map((conclusion, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          {conclusion}
                        </li>
                      ))}
                    </ul>

                    {alerte.rapport.recommandations && alerte.rapport.recommandations.length > 0 && (
                      <>
                        <h4 className="font-medium text-slate-900 mb-3">Recommandations</h4>
                        <div className="grid grid-cols-1 gap-3 mb-6">
                          {alerte.rapport?.recommandations && Array.isArray(alerte.rapport.recommandations) && alerte.rapport.recommandations.map((recommandation, index) => (
                            <div key={index} className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <TrendingUp className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-yellow-900">{recommandation}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {alerte.rapport.suiteADonner && (
                      <>
                        <h4 className="font-medium text-slate-900 mb-3">Suite à donner</h4>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-blue-900">{alerte.rapport.suiteADonner}</p>
                        </div>
                      </>
                    )}
                  </CardBody>
                </Card>
              )}
        </div>
      )}

      {activeTab === 'temoins' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Témoignages recueillis</h3>
            <div className="space-y-4">
              {alerte.temoins && Array.isArray(alerte.temoins) && alerte.temoins.map((temoin: any, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 ${temoin.anonyme ? 'bg-slate-100' : 'bg-blue-100'} rounded-full flex items-center justify-center flex-shrink-0`}>
                      {temoin.anonyme ? (
                        <EyeOff className="w-5 h-5 text-slate-600" />
                      ) : (
                        <User className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      {temoin.anonyme ? (
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-slate-900">Témoin anonyme</h4>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                            Anonyme
                          </span>
                        </div>
                      ) : (
                        <>
                          <h4 className="font-medium text-slate-900">{temoin.nom || 'Sans nom'}</h4>
                          {temoin.telephone && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Phone className="w-4 h-4" />
                              {temoin.telephone}
                            </div>
                          )}
                        </>
                      )}
                      {(temoin.date || temoin.dateComplete || temoin.dateAjout) && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <Calendar className="w-3 h-3" />
                          {temoin.date || temoin.dateComplete?.split('T')[0] || temoin.dateAjout?.split('T')[0]}
                          {temoin.heure && (
                            <>
                              <Clock className="w-3 h-3 ml-1" />
                              {temoin.heure}
                            </>
                          )}
                        </div>
                      )}
                      {temoin.agentAjout && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <User className="w-3 h-3" />
                          <span>Ajouté par: {temoin.agentAjout}</span>
                        </div>
                      )}
                      {temoin.commissariatAgent && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md mt-1 w-fit">
                          <Building2 className="w-3 h-3" />
                          <span className="font-medium">{temoin.commissariatAgent}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium text-slate-500">Témoin #{index + 1}</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <p className="text-slate-700 text-sm italic">"{temoin.declaration}"</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === 'documents' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Documents et pièces jointes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerte.documents && Array.isArray(alerte.documents) && alerte.documents.map((doc: any, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{doc.type}</h4>
                      {doc.numero && (
                        <div className="text-sm text-slate-600 font-mono">{doc.numero}</div>
                      )}
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        {doc.date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Date doc: {doc.date}
                          </div>
                        )}
                        {(doc.dateAjout || doc.dateAjoutFormat) && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Ajouté le: {doc.dateAjoutFormat || doc.dateAjout?.split('T')[0]}
                            {doc.heureAjout && ` à ${doc.heureAjout}`}
                          </div>
                        )}
                      </div>
                      {doc.agentAjout && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          <User className="w-3 h-3" />
                          <span>Par: {doc.agentAjout}</span>
                        </div>
                      )}
                      {doc.commissariatAgent && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md mt-1 w-fit">
                          <Building2 className="w-3 h-3" />
                          <span className="font-medium">{doc.commissariatAgent}</span>
                        </div>
                      )}
                      <p className="text-sm text-slate-600 mt-2">{doc.description}</p>
                    </div>
                    <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors">
                      <Download className="w-4 h-4 text-blue-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === 'photos' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Photos et preuves visuelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alerte.photos && Array.isArray(alerte.photos) && alerte.photos.map((photo: any, index) => {
                const photoUrl = typeof photo === 'string' ? photo : photo.url;
                const photoObj = typeof photo === 'object' ? photo : null;
                return (
                  <div key={index} className="bg-slate-100 rounded-lg aspect-video flex flex-col items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer relative">
                    <div className="text-center text-slate-400">
                      <Camera className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm font-medium">Photo {index + 1}</p>
                      <p className="text-xs break-all px-2">{photoUrl}</p>
                    </div>
                    {(photoObj?.dateAjout || photoObj?.dateAjoutFormat || photoObj?.agentAjout) && (
                      <div className="absolute bottom-2 left-2 right-2 space-y-1">
                        <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {photoObj.dateAjoutFormat || photoObj.dateAjout?.split('T')[0]}
                              {photoObj.heureAjout && ` ${photoObj.heureAjout}`}
                            </div>
                            {photoObj.agentAjout && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {photoObj.agentAjout}
                              </div>
                            )}
                          </div>
                        </div>
                        {photoObj.commissariatAgent && (
                          <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md w-fit">
                            <Building2 className="w-3 h-3" />
                            <span className="text-xs font-medium">{photoObj.commissariatAgent}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === 'diffusion' && canViewDiffusion && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Destinataires de la diffusion</h3>
            
            {alerte.diffusionDestinataires && (
              <div className="space-y-6">
                {/* Type de diffusion */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Type de diffusion</h4>
                  </div>
                  <p className="text-sm text-blue-700">
                    {alerte.diffusionDestinataires.diffusionGenerale 
                      ? 'Diffusion générale - Tous les commissariats'
                      : 'Diffusion sélective - Commissariats et agents spécifiques'
                    }
                  </p>
                  {alerte.dateDiffusion && (
                    <p className="text-xs text-blue-600 mt-2">
                      Diffusée le {new Date(alerte.dateDiffusion).toLocaleDateString('fr-FR', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>

                {/* Commissariats destinataires */}
                {alerte.diffusionDestinataires.diffusionGenerale || 
                 (alerte.diffusionDestinataires.commissariats && alerte.diffusionDestinataires.commissariats.length > 0) ? (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Building2 className="w-5 h-5 text-slate-600" />
                      <h4 className="font-semibold text-slate-900">
                        Commissariats destinataires
                        {alerte.diffusionDestinataires.commissariats && (
                          <span className="ml-2 text-sm font-normal text-slate-500">
                            ({alerte.diffusionDestinataires.commissariats.length})
                          </span>
                        )}
                      </h4>
                    </div>
                    {alerte.diffusionDestinataires.diffusionGenerale && !alerte.diffusionDestinataires.commissariats ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <p className="text-sm text-slate-600">Tous les commissariats actifs</p>
                      </div>
                    ) : alerte.diffusionDestinataires.commissariats && alerte.diffusionDestinataires.commissariats.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {alerte.diffusionDestinataires?.commissariats && Array.isArray(alerte.diffusionDestinataires.commissariats) && alerte.diffusionDestinataires.commissariats.map((commissariat: any) => (
                          <div
                            key={commissariat.id}
                            className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-semibold text-slate-900 truncate">{commissariat.nom}</h5>
                                <p className="text-xs text-slate-500 mt-1">{commissariat.ville}</p>
                                <p className="text-xs text-slate-500">{commissariat.region}</p>
                                <p className="text-xs text-blue-600 mt-1 font-medium">{commissariat.code}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <p className="text-sm text-slate-500">Aucun commissariat spécifique</p>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Agents destinataires */}
                {!alerte.diffusionDestinataires.diffusionGenerale && 
                 alerte.diffusionDestinataires.agents && 
                 alerte.diffusionDestinataires.agents.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5 text-slate-600" />
                      <h4 className="font-semibold text-slate-900">
                        Agents destinataires
                        <span className="ml-2 text-sm font-normal text-slate-500">
                          ({alerte.diffusionDestinataires.agents.length})
                        </span>
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {alerte.diffusionDestinataires?.agents && Array.isArray(alerte.diffusionDestinataires.agents) && alerte.diffusionDestinataires.agents.map((agent: any) => (
                        <div
                          key={agent.id}
                          className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-slate-900">
                                {agent.prenom} {agent.nom}
                              </h5>
                              <p className="text-xs text-slate-500 mt-1">{agent.matricule}</p>
                              <p className="text-xs text-slate-500">{agent.role}</p>
                              {agent.email && (
                                <p className="text-xs text-blue-600 mt-1">{agent.email}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!alerte.diffusionDestinataires && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                <p className="text-sm text-slate-500">Informations de diffusion non disponibles</p>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {activeTab === 'suivi' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Chronologie et suivi</h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
              <div className="space-y-6">
                {alerte.suivis && Array.isArray(alerte.suivis) && alerte.suivis.map((suivi, index) => (
                  <div key={index} className="relative pl-12">
                    <div className="absolute left-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center border-4 border-white">
                      <Activity className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-900">{suivi.action}</span>
                        <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-900 rounded">
                          {suivi.statut}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {suivi.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {suivi.heure}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{suivi.agent}</span>
                        </div>
                        {suivi.agentCommissariat && (
                          <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                            <Building2 className="w-4 h-4" />
                            <span className="font-medium">{suivi.agentCommissariat}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {alerte.observations && (
              <div className="mt-8 bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-900 mb-2">Observations générales</h4>
                <p className="text-slate-700 text-sm">{alerte.observations}</p>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Modal de bienvenue et guide des actions */}
      {/* Modal d'accueil des actions - Masquée si alerte archivée ou résolue */}
      {showActionsModal && alerte && (() => {
        const statut = (alerte.statut || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const isArchivee = statut === 'ARCHIVEE' || statut === 'ARCHIVE';
        const isResolue = statut === 'RESOLUE' || statut === 'RESOLVE';
        return !isArchivee && !isResolue;
      })() && (
        <Modal isOpen={true} onClose={() => setShowActionsModal(false)}>
          <ModalHeader>
            <ModalTitle>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Actions de traitement disponibles</h3>
                  <p className="text-sm text-slate-600 font-normal">Alerte #{alerte.numero}</p>
                </div>
              </div>
            </ModalTitle>
            <ModalClose />
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              {/* Statut de l'alerte */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Statut actuel</h4>
                    <p className="text-sm text-slate-600">{alerte.titre}</p>
                  </div>
                  <span className={`px-4 py-2 text-sm font-bold rounded-full ${getStatutColor(alerte.statut)}`}>
                    {getStatutIcon(alerte.statut)}
                    <span className="ml-2">{alerte.statut}</span>
                  </span>
                </div>
              </div>

              {/* Guide des actions */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-blue-600" />
                  Actions recommandées
                </h4>
                <div className="space-y-3">
                  {/* Déployer intervention */}
                  {!alerte.intervention && alerte.statut !== 'Archivée' && (
                    <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-blue-900">Déployer une intervention</h5>
                        <p className="text-sm text-blue-700 mt-1">
                          Constituez une équipe et déployez les agents sur le terrain pour traiter cette alerte.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Ajouter évaluation */}
                  {alerte.intervention && !alerte.evaluation && alerte.statut !== 'Archivée' && (
                    <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <ClipboardCheck className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-orange-900">Ajouter une évaluation</h5>
                        <p className="text-sm text-orange-700 mt-1">
                          Évaluez la situation sur place : victimes, dégâts, mesures prises, renforts nécessaires.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Diffuser l'alerte */}
                  {!alerte.diffusee && alerte.statut !== 'Archivée' && (
                    <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-300 rounded-lg">
                      <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bell className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-amber-900">Diffuser l'alerte</h5>
                        <p className="text-sm text-amber-800 mt-1">
                          Partagez cette alerte avec d'autres commissariats ou agents pour une coordination élargie.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Ajouter témoin */}
                  {alerte.statut !== 'Archivée' && (
                    <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-green-900">Ajouter un témoin</h5>
                        <p className="text-sm text-green-700 mt-1">
                          Recueillez les témoignages des personnes présentes sur les lieux.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Résoudre */}
                  {alerte.statut === 'En cours' && (
                    <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-emerald-900">Résoudre l'alerte</h5>
                        <p className="text-sm text-emerald-700 mt-1">
                          Marquez cette alerte comme résolue une fois la situation maîtrisée.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Message informatif */}
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1"> Conseil</p>
                    <p>
                      Toutes les actions sont accessibles via le panneau "Actions de traitement" ci-dessous. 
                      Vous pouvez aussi consulter les différents onglets pour voir les détails de l'alerte.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="primary" 
              size="md"
              onClick={() => setShowActionsModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Commencer le traitement
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  )
}