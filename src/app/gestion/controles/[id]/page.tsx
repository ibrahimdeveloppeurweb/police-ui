'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
  ArrowLeft, Printer, Download, FileText, Calendar, MapPin,
  Car, AlertTriangle, CheckCircle, XCircle, Clock, Shield,
  Phone, Mail, AlertCircle, Camera, ClipboardCheck, Flag, Loader2,
  DollarSign, User, CreditCard, Archive, ArchiveRestore
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { controlesService } from '@/lib/api/services'

// Types basés sur la réponse API
type DocumentStatut = 'OK' | 'NOK' | 'N/A' | 'ATTENTION'

interface DocumentVerifie {
  type: string
  statut: DocumentStatut
  details: string
  validite?: string
  photo?: string  // URL de la photo preuve (depuis CheckOption.evidence_file)
}

interface ElementControle {
  type: string
  statut: DocumentStatut
  details: string
  photo?: string  // URL de la photo preuve (depuis CheckOption.evidence_file)
}

interface Infraction {
  id: string
  numero_pv: string
  date_infraction: string
  type_infraction: string
  montant_amende: number
  points_retires: number
  statut: string
}

interface Agent {
  id: string
  matricule: string
  nom: string
  prenom: string
  role: string
  grade?: string
  telephone?: string
  email?: string
  commissariat?: string
}

interface Commissariat {
  id: string
  nom: string
  code: string
}

interface VehiculeSummary {
  id: string
  immatriculation: string
  marque: string
  modele: string
  type_vehicule: string
  annee?: number
  couleur?: string
  numero_serie?: string
}

interface ConducteurSummary {
  id: string
  nom: string
  prenom: string
  numero_permis?: string
  points_permis: number
  permis_valide: boolean
  validite_permis?: string
  cni?: string
  telephone?: string
  email?: string
  adresse?: string
}

interface PVSummary {
  id: string
  numero: string
  date_emission: string
  infractions: string[]
  gravite: string
}

interface AmendeSummary {
  id: string
  numero: string
  montant: number
  statut: string
}

interface PhotoControle {
  id: string
  filename: string
  url: string
  description?: string
  created_at: string
}

interface ApiControle {
  id: string
  reference: string
  date_controle: string
  lieu_controle: string
  type_controle: string
  statut: string
  observations?: string
  duree?: string
  // Données véhicule embarquées
  vehicule_immatriculation?: string
  vehicule_marque?: string
  vehicule_modele?: string
  vehicule_type?: string
  vehicule_annee?: number
  vehicule_couleur?: string
  vehicule_numero_chassis?: string
  // Données conducteur embarquées
  conducteur_numero_permis?: string
  conducteur_nom?: string
  conducteur_prenom?: string
  conducteur_telephone?: string
  conducteur_adresse?: string
  // Relations
  agent?: Agent
  vehicule?: VehiculeSummary
  conducteur?: ConducteurSummary
  commissariat?: Commissariat
  infractions?: Infraction[]
  nombre_infractions: number
  documents_verifies?: DocumentVerifie[]
  elements_controles?: ElementControle[]
  // PV et amende
  pv?: PVSummary
  amende?: AmendeSummary
  // Recommandations, photos et suivi
  recommandations?: string[]
  photos?: PhotoControle[]
  date_suivi?: string
  montant_total_amendes?: number
  // Archivage
  is_archived: boolean
  archived_at?: string
  created_at: string
  updated_at: string
}

export default function ControleDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [controle, setControle] = useState<ApiControle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('details')
  const [archiving, setArchiving] = useState(false)

  useEffect(() => {
    const fetchControle = async () => {
      if (!id) return

      try {
        setLoading(true)
        setError(null)
        const response = await controlesService.getById(id)

        if (response.success && response.data) {
          // L'API peut retourner data directement ou dans data.data
          const data = (response.data as any).data || response.data
          setControle(data as ApiControle)
        } else {
          setError(response.message || 'Erreur lors du chargement du contrôle')
        }
      } catch (err) {
        console.error('Error fetching controle:', err)
        setError('Erreur lors du chargement du contrôle')
      } finally {
        setLoading(false)
      }
    }

    fetchControle()
  }, [id])

  // Fonction pour archiver/desarchiver
  const handleArchiveToggle = async () => {
    if (!controle) return

    setArchiving(true)
    try {
      const response = controle.is_archived
        ? await controlesService.unarchive(controle.id)
        : await controlesService.archive(controle.id)

      if (response.success && response.data) {
        const data = (response.data as any).data || response.data
        setControle(data as ApiControle)
      }
    } catch (err) {
      console.error('Error toggling archive:', err)
    } finally {
      setArchiving(false)
    }
  }

  // Fonction pour formater les nombres
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  // Fonction pour formater la date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Fonction pour formater l'heure
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'CONFORME':
        return 'bg-green-500 text-white'
      case 'TERMINE':
        return 'bg-blue-500 text-white'
      case 'EN_COURS':
        return 'bg-yellow-500 text-white'
      case 'NON_CONFORME':
        return 'bg-red-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'CONFORME':
        return 'Conforme'
      case 'TERMINE':
        return 'Terminé'
      case 'EN_COURS':
        return 'En cours'
      case 'NON_CONFORME':
        return 'Non conforme'
      default:
        return statut
    }
  }

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'CONFORME':
        return <CheckCircle className="w-4 h-4" />
      case 'TERMINE':
        return <CheckCircle className="w-4 h-4" />
      case 'EN_COURS':
        return <Clock className="w-4 h-4" />
      case 'NON_CONFORME':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getStatusIcon = (status: DocumentStatut) => {
    switch (status) {
      case 'OK':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'NOK':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'ATTENTION':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />
      case 'N/A':
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const formatDocumentType = (type: string) => {
    const typeMap: Record<string, string> = {
      // Documents (anciens codes)
      'CARTE_GRISE': 'Carte Grise',
      'ASSURANCE': 'Assurance',
      'CONTROLE_TECHNIQUE': 'Contrôle Technique',
      'PERMIS_CONDUIRE': 'Permis de Conduire',
      // Documents (nouveaux codes CheckItem)
      'DOC_PERMIS': 'Permis de Conduire',
      'DOC_CARTE_GRISE': 'Carte Grise',
      'DOC_ASSURANCE': 'Assurance',
      'DOC_CONTROLE_TECH': 'Contrôle Technique',
      'DOC_TAXE': 'Taxe de Circulation',
      // Éléments de sécurité (nouveaux codes CheckItem)
      'SAFETY_CEINTURES': 'Ceintures de Sécurité',
      'SAFETY_EXTINCTEUR': 'Extincteur',
      'SAFETY_FREINAGE': 'Système de Freinage',
      // Éclairage (nouveaux codes CheckItem)
      'LIGHT_PHARES': 'Phares',
      'LIGHT_CLIGNOTANTS': 'Clignotants',
      'LIGHT_STOPS': 'Feux Stop',
      'LIGHT_RECUL': 'Feux de Recul',
      // État du véhicule (nouveaux codes CheckItem)
      'STATE_PNEUS': 'Pneumatiques',
      'STATE_VITRES': 'Vitres',
      'STATE_RETROVISEURS': 'Rétroviseurs',
      // Équipements (nouveaux codes CheckItem)
      'EQUIP_TRIANGLE': 'Triangle de Signalisation',
      'EQUIP_GILET': 'Gilet de Sécurité',
      'EQUIP_ROUE_SECOURS': 'Roue de Secours',
      'EQUIP_TROUSSE': 'Trousse de Secours',
      // Anciens codes
      'ECLAIRAGE': 'Éclairage',
      'FREINAGE': 'Freinage',
      'PNEUMATIQUES': 'Pneumatiques',
      'CEINTURES': 'Ceintures',
      'EXTINCTEUR': 'Extincteur',
      'TRIANGLE': 'Triangle de Signalisation',
      'GILET': 'Gilet de Sécurité'
    }
    return typeMap[type] || type.replace(/_/g, ' ')
  }

  const formatTypeControle = (type: string) => {
    const typeMap: Record<string, string> = {
      'GENERAL': 'Contrôle Général',
      'DOCUMENT': 'Contrôle Documents',
      'SECURITE': 'Contrôle Sécurité',
      'MIXTE': 'Contrôle Mixte'
    }
    return typeMap[type] || type
  }

  // Calcul du montant total des amendes
  const getMontantTotal = () => {
    if (controle?.amende?.montant) {
      return controle.amende.montant
    }
    if (!controle?.infractions || controle.infractions.length === 0) return 0
    return controle.infractions.reduce((sum, inf) => sum + (inf.montant_amende || 0), 0)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Chargement du contrôle...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !controle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-900 font-medium mb-2">Erreur</p>
          <p className="text-slate-600">{error || 'Contrôle non trouvé'}</p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    )
  }

  const documentsCount = controle.documents_verifies?.length || 0
  const elementsCount = controle.elements_controles?.length || 0

  return (
    <div className="min-h-screen">
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
              Contrôle {controle.reference}
            </h1>
            <p className="text-slate-600 mt-1">
              Détails du contrôle routier du {formatDate(controle.date_controle)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" size="md">
            <Printer className="w-5 h-5" />
            Imprimer
          </Button>
          <Button variant="primary" size="md">
            <Download className="w-5 h-5" />
            Exporter PDF
          </Button>
          <Button
            variant={controle.is_archived ? "secondary" : "danger"}
            size="md"
            onClick={handleArchiveToggle}
            disabled={archiving}
          >
            {archiving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : controle.is_archived ? (
              <ArchiveRestore className="w-5 h-5" />
            ) : (
              <Archive className="w-5 h-5" />
            )}
            {controle.is_archived ? 'Desarchiver' : 'Archiver'}
          </Button>
        </div>
      </div>

      {/* Statut et informations principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardBody className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Informations Générales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">N° Contrôle</label>
                    <div className="text-lg font-bold text-slate-900">{controle.reference}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Date & Heure</label>
                    <div className="text-slate-900 flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {formatDate(controle.date_controle)} à {formatTime(controle.date_controle)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Lieu</label>
                    <div className="text-slate-900 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {controle.lieu_controle}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Type de contrôle</label>
                    <div className="text-slate-900">{formatTypeControle(controle.type_controle)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Durée</label>
                    <div className="text-slate-900 flex items-center gap-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {controle.duree || 'Non spécifié'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Agent</label>
                    <div className="text-slate-900">
                      {controle.agent ? `${controle.agent.prenom} ${controle.agent.nom}` : 'Non assigné'}
                    </div>
                    {controle.commissariat && (
                      <div className="text-sm text-slate-500">{controle.commissariat.nom}</div>
                    )}
                  </div>
                </div>
              </div>
              <span className={`inline-flex px-4 py-2 text-sm font-bold rounded-full ${getStatutColor(controle.statut)}`}>
                {getStatutIcon(controle.statut)}
                <span className="ml-2">{getStatutLabel(controle.statut)}</span>
              </span>
            </div>

            {/* Section PV et Amende */}
            {(controle.pv || (controle.infractions && controle.infractions.length > 0)) && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-orange-600" />
                  <div className="flex-1">
                    {controle.pv ? (
                      <>
                        <div className="font-bold text-orange-900">
                          Procès-Verbal N° {controle.pv.numero}
                        </div>
                        <div className="text-sm text-orange-700">
                          {controle.pv.infractions?.join(', ') || 'Infractions non spécifiées'}
                          {controle.pv.gravite && ` - ${controle.pv.gravite.replace('_', ' ')}`}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="font-bold text-orange-900">
                          {controle.infractions?.length || 0} Infraction(s) constatée(s)
                        </div>
                        <div className="text-sm text-orange-700">
                          {controle.infractions?.map(inf => inf.numero_pv).join(', ')}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-900">
                      {formatNumber(getMontantTotal())} FCFA
                    </div>
                    {controle.amende && (
                      <>
                        <div className="text-xs text-orange-700">Amende {controle.amende.numero}</div>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                          controle.amende.statut === 'PAYE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {controle.amende.statut === 'PAYE' ? 'Payé' : 'En attente'}
                        </span>
                      </>
                    )}
                  </div>
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
                <span className="text-sm text-slate-600">Documents vérifiés</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">{documentsCount}</div>
                  <div className="text-xs text-slate-500">contrôlés</div>
                </div>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-sm text-slate-600">Éléments contrôlés</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">{elementsCount}</div>
                  <div className="text-xs text-slate-500">vérifiés</div>
                </div>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-sm text-slate-600">Infractions</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">{controle.nombre_infractions || 0}</div>
                  <div className="text-xs text-slate-500">constatées</div>
                </div>
              </div>
              {controle.date_suivi && (
                <div className="pt-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-blue-900">
                      <Flag className="w-4 h-4" />
                      <div>
                        <div className="text-xs font-medium">Suivi prévu</div>
                        <div className="text-sm font-bold">{formatDate(controle.date_suivi)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {controle.agent?.grade && (
                <div className="pt-2">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-slate-900">
                      <Shield className="w-4 h-4" />
                      <div>
                        <div className="text-xs font-medium">Agent responsable</div>
                        <div className="text-sm font-bold">{controle.agent.grade} {controle.agent.nom}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Onglets */}
      <div className="mb-6">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8">
            {[
              { id: 'details', label: 'Véhicule & Conducteur', icon: Car },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'verification', label: 'Vérification', icon: ClipboardCheck },
              { id: 'infractions', label: 'Infractions', icon: AlertTriangle },
              { id: 'photos', label: 'Photos', icon: Camera }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations du Véhicule */}
          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Informations du Véhicule</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Immatriculation</label>
                  <div className="text-2xl font-bold text-slate-900 font-mono">
                    {controle.vehicule?.immatriculation || controle.vehicule_immatriculation || 'Non renseigné'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Marque</label>
                    <div className="text-slate-900 font-medium">
                      {controle.vehicule?.marque || controle.vehicule_marque || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Modèle</label>
                    <div className="text-slate-900 font-medium">
                      {controle.vehicule?.modele || controle.vehicule_modele || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Année</label>
                    <div className="text-slate-900 font-medium">
                      {controle.vehicule?.annee || controle.vehicule_annee || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Couleur</label>
                    <div className="text-slate-900 font-medium">
                      {controle.vehicule?.couleur || controle.vehicule_couleur || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Type</label>
                    <div className="text-slate-900 font-medium">
                      {controle.vehicule?.type_vehicule || controle.vehicule_type || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">N° Châssis</label>
                    <div className="text-slate-900 font-mono text-sm">
                      {controle.vehicule?.numero_serie || controle.vehicule_numero_chassis || '-'}
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Informations du Conducteur */}
          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Informations du Conducteur</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Nom complet</label>
                  <div className="text-slate-900 font-medium text-lg">
                    {controle.conducteur
                      ? `${controle.conducteur.prenom} ${controle.conducteur.nom}`
                      : controle.conducteur_prenom && controle.conducteur_nom
                        ? `${controle.conducteur_prenom} ${controle.conducteur_nom}`
                        : 'Non renseigné'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">N° Permis</label>
                    <div className="text-slate-900 font-mono text-sm">
                      {controle.conducteur?.numero_permis || controle.conducteur_numero_permis || '-'}
                    </div>
                  </div>
                  {controle.conducteur?.validite_permis && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Validité Permis</label>
                      <div className="text-slate-900 text-sm">
                        {controle.conducteur.validite_permis}
                        {!controle.conducteur.permis_valide && (
                          <span className="ml-2 text-red-600 text-xs">(Expiré)</span>
                        )}
                      </div>
                    </div>
                  )}
                  {controle.conducteur?.cni && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">CNI</label>
                      <div className="text-slate-900 font-mono text-sm">{controle.conducteur.cni}</div>
                    </div>
                  )}
                  {controle.conducteur?.points_permis !== undefined && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Points Permis</label>
                      <div className={`text-sm font-bold ${
                        controle.conducteur.points_permis <= 6 ? 'text-red-600' : 'text-slate-900'
                      }`}>
                        {controle.conducteur.points_permis} points
                      </div>
                    </div>
                  )}
                </div>
                {(controle.conducteur?.telephone || controle.conducteur_telephone) && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Téléphone</label>
                    <div className="flex items-center gap-2 text-slate-900">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {controle.conducteur?.telephone || controle.conducteur_telephone}
                    </div>
                  </div>
                )}
                {controle.conducteur?.email && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Email</label>
                    <div className="flex items-center gap-2 text-slate-900">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {controle.conducteur.email}
                    </div>
                  </div>
                )}
                {(controle.conducteur?.adresse || controle.conducteur_adresse) && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Adresse</label>
                    <div className="text-slate-900 text-sm">
                      {controle.conducteur?.adresse || controle.conducteur_adresse}
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Informations de l'agent */}
          {controle.agent && (
            <Card className="lg:col-span-2">
              <CardBody className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Agent Contrôleur</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Nom</label>
                    <div className="text-slate-900 font-medium">
                      {controle.agent.prenom} {controle.agent.nom}
                    </div>
                    {controle.agent.grade && (
                      <div className="text-sm text-slate-500">{controle.agent.grade}</div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Matricule</label>
                    <div className="text-slate-900 font-mono">{controle.agent.matricule}</div>
                  </div>
                  {controle.agent.telephone && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Téléphone</label>
                      <div className="flex items-center gap-2 text-slate-900">
                        <Phone className="w-4 h-4 text-slate-400" />
                        {controle.agent.telephone}
                      </div>
                    </div>
                  )}
                  {controle.agent.email && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Email</label>
                      <div className="flex items-center gap-2 text-slate-900">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {controle.agent.email}
                      </div>
                    </div>
                  )}
                  {(controle.commissariat || controle.agent.commissariat) && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Commissariat</label>
                      <div className="text-slate-900">
                        {controle.commissariat?.nom || controle.agent.commissariat}
                      </div>
                      {controle.commissariat?.code && (
                        <div className="text-sm text-slate-500">{controle.commissariat.code}</div>
                      )}
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Documents Vérifiés</h3>
            {controle.documents_verifies && controle.documents_verifies.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {controle.documents_verifies.map((doc, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusIcon(doc.statut as DocumentStatut)}
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">
                          {formatDocumentType(doc.type)}
                        </h4>
                        <span className={`text-sm font-medium ${
                          doc.statut === 'OK' ? 'text-green-600' :
                          doc.statut === 'NOK' ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {doc.statut === 'OK' ? 'Conforme' :
                           doc.statut === 'NOK' ? 'Non-Conforme' : 'Non Applicable'}
                        </span>
                      </div>
                      {doc.photo && (
                        <a
                          href={doc.photo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Photo</span>
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{doc.details}</p>
                    {doc.validite && (
                      <p className="text-xs text-slate-500 mt-2">Validité: {doc.validite}</p>
                    )}
                    {doc.photo && (
                      <div className="mt-3">
                        <img
                          src={doc.photo}
                          alt={`Preuve - ${formatDocumentType(doc.type)}`}
                          className="w-full h-32 object-cover rounded-lg border border-slate-200"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucun document vérifié</p>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {activeTab === 'verification' && (
        <div className="space-y-6">
          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Éléments Contrôlés</h3>
              {controle.elements_controles && controle.elements_controles.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {controle.elements_controles.map((element, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        {getStatusIcon(element.statut as DocumentStatut)}
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">
                            {formatDocumentType(element.type)}
                          </h4>
                          <span className={`text-sm font-medium ${
                            element.statut === 'OK' ? 'text-green-600' :
                            element.statut === 'NOK' ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {element.statut === 'OK' ? 'Conforme' :
                             element.statut === 'NOK' ? 'Non-Conforme' : 'Non Applicable'}
                          </span>
                        </div>
                        {element.photo && (
                          <a
                            href={element.photo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Photo</span>
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{element.details}</p>
                      {element.photo && (
                        <div className="mt-3">
                          <img
                            src={element.photo}
                            alt={`Preuve - ${formatDocumentType(element.type)}`}
                            className="w-full h-32 object-cover rounded-lg border border-slate-200"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <ClipboardCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun élément contrôlé</p>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Observations & Recommandations</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Observations</h4>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-slate-700">
                      {controle.observations || 'Aucune observation'}
                    </p>
                  </div>
                </div>

                {controle.recommandations && controle.recommandations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3">Recommandations</h4>
                    <ul className="space-y-2">
                      {controle.recommandations.map((recommandation, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          {recommandation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {activeTab === 'infractions' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Infractions Constatées</h3>
            {controle.infractions && controle.infractions.length > 0 ? (
              <div className="space-y-4">
                {controle.infractions.map((infraction, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-5 h-5 text-orange-500" />
                          <h4 className="font-medium text-slate-900">
                            PV N° {infraction.numero_pv}
                          </h4>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">
                          Type: {infraction.type_infraction}
                        </p>
                        <p className="text-xs text-slate-500">
                          Date: {formatDate(infraction.date_infraction)}
                        </p>
                        {infraction.points_retires > 0 && (
                          <p className="text-xs text-red-600 mt-1">
                            Points retirés: {infraction.points_retires}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-slate-900">
                          {formatNumber(infraction.montant_amende)} FCFA
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          infraction.statut === 'PAYEE' ? 'bg-green-100 text-green-800' :
                          infraction.statut === 'VALIDEE' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {infraction.statut}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Total des amendes */}
                <div className="border-t border-slate-200 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-slate-900">Total des amendes</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {formatNumber(getMontantTotal())} FCFA
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
                <p className="text-green-600 font-medium">Aucune infraction constatée</p>
                <p className="text-sm mt-1">Ce contrôle n'a révélé aucune infraction</p>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {activeTab === 'photos' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Photos du Contrôle</h3>
            {controle.photos && controle.photos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {controle.photos.map((photo, index) => (
                  <div key={index} className="relative bg-slate-100 rounded-lg aspect-video overflow-hidden">
                    {photo.url ? (
                      <img
                        src={photo.url}
                        alt={photo.description || `Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-slate-400">
                          <Camera className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-sm">Photo {index + 1}</p>
                          <p className="text-xs">{photo.filename}</p>
                        </div>
                      </div>
                    )}
                    {photo.description && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">
                        {photo.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune photo disponible</p>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
