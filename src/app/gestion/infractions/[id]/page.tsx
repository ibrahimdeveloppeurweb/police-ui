'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  ArrowLeft, Printer, Download, FileText, Calendar, MapPin, User,
  Car, AlertTriangle, CheckCircle, XCircle, Clock, DollarSign, Shield,
  Phone, Mail, Eye, Camera, Flag, CreditCard, Receipt, FileDown,
  Activity, MessageSquare, TrendingUp, AlertCircle, Gauge, Wrench,
  Truck, Leaf, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { useParams } from 'next/navigation'
import { infractionsService, APIInfraction } from '@/lib/api/services'

type InfractionStatus = 'En attente' | 'Résolue' | 'En retard' | 'Contestée'

type InfractionDetail = {
  id: string
  numero: string
  dateEmission: string
  heureEmission: string
  dateLimite: string
  dateResolution?: string
  statut: InfractionStatus
  // PV associé
  pv: {
    numero: string
    dateEmission: string
    agent: string
    commissariat: string
  }
  // Informations de l'infraction
  type: string
  categorie: string
  description: string
  lieu: string
  coordonnees: {
    latitude: string
    longitude: string
  }
  conditions: string
  // Contrevenant
  contrevenant: {
    nom: string
    prenom: string
    telephone: string
    email: string
    adresse: string
    cni: string
    dateNaissance: string
  }
  // Véhicule
  vehicule: {
    immatriculation: string
    marque: string
    modele: string
    annee: string
    couleur: string
    typeVehicule: string
  }
  // Conducteur (si différent du contrevenant)
  conducteur?: {
    nom: string
    prenom: string
    telephone: string
    permis: string
    relation: string
  }
  // Agent verbalisateur
  agent: {
    nom: string
    matricule: string
    telephone: string
    commissariat: string
    grade: string
  }
  // Montants et paiement
  montant: {
    principal: number
    penalites: number
    total: number
  }
  paiement?: {
    datePaiement: string
    modePaiement: string
    numeroPaiement: string
    montantPaye: number
  }
  // Contestation
  contestation?: {
    dateContestation: string
    motif: string
    pieceJointe: string[]
    statut: string
  }
  // Détails légaux
  code: string
  article: string
  gravite: string
  points?: number
  sanctionComplementaire?: string
  // Documents et preuves
  photos: string[]
  documents: {
    type: string
    numero?: string
    description: string
  }[]
  // Suivi
  historique: {
    date: string
    heure: string
    action: string
    agent: string
    statut: string
  }[]
  observations: string
  remarques?: string
}

// Données d'exemple pour l'infraction détaillée
const infractionDetail: InfractionDetail = {
  id: '1',
  numero: 'INF-2025-COC-0892',
  dateEmission: '10/10/2025',
  heureEmission: '14:20',
  dateLimite: '10/11/2025',
  statut: 'En attente',
  pv: {
    numero: 'PV-2025-COC-0892',
    dateEmission: '10/10/2025',
    agent: 'DIALLO Mamadou',
    commissariat: 'Commissariat 3ème Arrondissement - Cocody'
  },
  type: 'Excès de vitesse',
  categorie: 'Comportement',
  description: 'Excès de vitesse constaté sur le Boulevard Latrille. Vitesse relevée: 95 km/h dans une zone limitée à 60 km/h. Dépassement de 35 km/h de la vitesse autorisée.',
  lieu: 'Boulevard Latrille, à hauteur du carrefour Soleil',
  coordonnees: {
    latitude: '5.3599° N',
    longitude: '3.9874° W'
  },
  conditions: 'Circulation fluide, temps sec, visibilité excellente, chaussée en bon état',
  contrevenant: {
    nom: 'TRAORE',
    prenom: 'Moussa',
    telephone: '+225 07 08 76 54 32',
    email: 'moussa.traore@email.com',
    adresse: 'Cocody Riviera Palmeraie, Rue des Jardins, Villa 89',
    cni: 'CI0098765432',
    dateNaissance: '15/03/1985'
  },
  vehicule: {
    immatriculation: 'AB-123-CD',
    marque: 'Toyota',
    modele: 'Corolla',
    annee: '2020',
    couleur: 'Gris métallisé',
    typeVehicule: 'Berline'
  },
  agent: {
    nom: 'DIALLO Mamadou',
    matricule: 'AGT-2023-0789',
    telephone: '+225 05 44 33 22 11',
    commissariat: 'Commissariat 3ème Arrondissement - Cocody',
    grade: 'Brigadier-Chef'
  },
  montant: {
    principal: 45000,
    penalites: 0,
    total: 45000
  },
  code: 'Code de la Route CI - Livre II',
  article: 'Article R413-14',
  gravite: 'Classe 3',
  points: 2,
  sanctionComplementaire: 'Suspension de permis possible en cas de récidive',
  photos: [
    'photo_radar_vitesse.jpg',
    'photo_vehicule_avant.jpg',
    'photo_vehicule_arriere.jpg',
    'photo_plaque_immatriculation.jpg',
    'photo_lieu_infraction.jpg'
  ],
  documents: [
    {
      type: 'Procès-verbal original',
      numero: 'PV-2025-COC-0892',
      description: 'PV de constatation d\'excès de vitesse'
    },
    {
      type: 'Relevé radar',
      description: 'Capture du radar automatique - 95 km/h'
    },
    {
      type: 'Copie carte grise',
      description: 'Carte grise du véhicule AB-123-CD'
    },
    {
      type: 'Notification',
      description: 'Notification envoyée au contrevenant'
    }
  ],
  historique: [
    {
      date: '10/10/2025',
      heure: '14:20',
      action: 'Constatation de l\'infraction',
      agent: 'DIALLO Mamadou',
      statut: 'Créée'
    },
    {
      date: '10/10/2025',
      heure: '14:35',
      action: 'Rédaction du procès-verbal',
      agent: 'DIALLO Mamadou',
      statut: 'PV émis'
    },
    {
      date: '10/10/2025',
      heure: '15:00',
      action: 'Enregistrement dans le système',
      agent: 'DIALLO Mamadou',
      statut: 'Enregistrée'
    },
    {
      date: '11/10/2025',
      heure: '09:30',
      action: 'Notification envoyée par courrier',
      agent: 'Service administratif',
      statut: 'Notifiée'
    },
    {
      date: '13/10/2025',
      heure: '11:45',
      action: 'Notification reçue (accusé de réception)',
      agent: 'Service administratif',
      statut: 'En attente paiement'
    }
  ],
  observations: 'Infraction constatée par radar automatique. Le conducteur a été informé immédiatement. Aucune circonstance atténuante. Conditions de circulation normales. Le contrevenant dispose de 30 jours pour régler l\'amende ou contester l\'infraction.'
}

export default function InfractionDetailPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState('details')
  const [loading, setLoading] = useState(true)
  const [apiData, setApiData] = useState<APIInfraction | null>(null)

  // Convert API status to display status
  const mapApiStatusToDisplay = (status: string): InfractionStatus => {
    switch (status) {
      case 'PAYEE':
      case 'ARCHIVEE':
        return 'Résolue'
      case 'CONSTATEE':
      case 'VALIDEE':
        return 'En attente'
      case 'CONTESTEE':
        return 'Contestée'
      case 'ANNULEE':
        return 'En retard'
      default:
        return 'En attente'
    }
  }

  // Map API category to display category
  const mapCategoryToDisplay = (category: string): string => {
    const categoryMap: Record<string, string> = {
      'Documents': 'Documents',
      'DOCUMENTS': 'Documents',
      'Sécurité': 'Sécurité',
      'SECURITE': 'Sécurité',
      'Vitesse': 'Comportement',
      'VITESSE': 'Comportement',
      'Comportement': 'Comportement',
      'COMPORTEMENT': 'Comportement',
      'Technique': 'État technique',
      'TECHNIQUE': 'État technique',
      'Chargement': 'Chargement',
      'CHARGEMENT': 'Chargement',
      'Environnement': 'Environnement',
      'ENVIRONNEMENT': 'Environnement',
      'Stationnement': 'Comportement',
      'STATIONNEMENT': 'Comportement',
    }
    return categoryMap[category] || 'Documents'
  }

  // Fetch data from API
  const fetchData = useCallback(async () => {
    const id = params?.id as string
    if (!id) return

    setLoading(true)
    try {
      const response = await infractionsService.getById(id)
      if (response.data) {
        setApiData(response.data)
      }
    } catch (error) {
      console.error('Error fetching infraction:', error)
    } finally {
      setLoading(false)
    }
  }, [params?.id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Merge API data with static fallback
  const currentData: InfractionDetail = apiData ? {
    ...infractionDetail,
    id: apiData.id,
    numero: apiData.numero_pv?.replace('PV-', 'INF-') || infractionDetail.numero,
    dateEmission: new Date(apiData.date_infraction).toLocaleDateString('fr-FR'),
    heureEmission: new Date(apiData.date_infraction).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    dateLimite: new Date(new Date(apiData.date_infraction).setMonth(new Date(apiData.date_infraction).getMonth() + 1)).toLocaleDateString('fr-FR'),
    statut: mapApiStatusToDisplay(apiData.statut),
    pv: {
      numero: apiData.numero_pv || infractionDetail.pv.numero,
      dateEmission: new Date(apiData.date_infraction).toLocaleDateString('fr-FR'),
      agent: apiData.controle?.agent_nom || infractionDetail.pv.agent,
      commissariat: infractionDetail.pv.commissariat
    },
    type: apiData.type_infraction?.libelle || infractionDetail.type,
    categorie: mapCategoryToDisplay(apiData.type_infraction?.categorie || ''),
    description: apiData.circonstances || apiData.type_infraction?.description || infractionDetail.description,
    lieu: apiData.lieu_infraction || infractionDetail.lieu,
    contrevenant: apiData.conducteur ? {
      nom: apiData.conducteur.nom,
      prenom: apiData.conducteur.prenom,
      telephone: infractionDetail.contrevenant.telephone,
      email: infractionDetail.contrevenant.email,
      adresse: infractionDetail.contrevenant.adresse,
      cni: infractionDetail.contrevenant.cni,
      dateNaissance: infractionDetail.contrevenant.dateNaissance
    } : infractionDetail.contrevenant,
    vehicule: apiData.vehicule ? {
      immatriculation: apiData.vehicule.immatriculation,
      marque: apiData.vehicule.marque,
      modele: apiData.vehicule.modele,
      annee: infractionDetail.vehicule.annee,
      couleur: infractionDetail.vehicule.couleur,
      typeVehicule: apiData.vehicule.type_vehicule
    } : infractionDetail.vehicule,
    agent: apiData.controle ? {
      ...infractionDetail.agent,
      nom: apiData.controle.agent_nom
    } : infractionDetail.agent,
    montant: {
      principal: apiData.montant_amende,
      penalites: 0,
      total: apiData.montant_amende
    },
    points: apiData.points_retires || infractionDetail.points,
    code: apiData.type_infraction?.code || infractionDetail.code
  } : infractionDetail

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const getStatutColor = (statut: InfractionStatus) => {
    switch (statut) {
      case 'Résolue':
        return 'bg-green-500 text-white'
      case 'En attente':
        return 'bg-yellow-500 text-white'
      case 'En retard':
        return 'bg-red-500 text-white'
      case 'Contestée':
        return 'bg-orange-500 text-white'
    }
  }

  const getStatutIcon = (statut: InfractionStatus) => {
    switch (statut) {
      case 'Résolue':
        return <CheckCircle className="w-4 h-4" />
      case 'En attente':
        return <Clock className="w-4 h-4" />
      case 'En retard':
        return <AlertTriangle className="w-4 h-4" />
      case 'Contestée':
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getCategorieIcon = (categorie: string) => {
    switch (categorie) {
      case 'Documents':
        return <FileText className="w-5 h-5 text-blue-600" />
      case 'Sécurité':
        return <Shield className="w-5 h-5 text-green-600" />
      case 'Comportement':
        return <Gauge className="w-5 h-5 text-red-600" />
      case 'État technique':
        return <Wrench className="w-5 h-5 text-orange-600" />
      case 'Chargement':
        return <Truck className="w-5 h-5 text-purple-600" />
      case 'Environnement':
        return <Leaf className="w-5 h-5 text-green-600" />
      default:
        return <FileText className="w-5 h-5 text-blue-600" />
    }
  }

  const joursRestants = () => {
    const dateL = new Date(currentData.dateLimite.split('/').reverse().join('-'))
    const today = new Date()
    const diff = Math.ceil((dateL.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 bg-white p-4 rounded-lg shadow-lg">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-slate-700">Chargement de l'infraction...</span>
        </div>
      </div>
    )
  }

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
              Infraction {currentData.numero}
            </h1>
            <p className="text-slate-600 mt-1">
              Détails de l'infraction du {currentData.dateEmission}
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
                    <label className="text-sm font-medium text-slate-600">N° Infraction</label>
                    <div className="text-lg font-bold text-slate-900">#{currentData.numero}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">PV Associé</label>
                    <div className="text-lg font-bold text-blue-600">{currentData.pv.numero}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Date & Heure</label>
                    <div className="text-slate-900 flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {currentData.dateEmission} à {currentData.heureEmission}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Date limite paiement</label>
                    <div className={`font-medium flex items-center gap-1 ${joursRestants() < 7 ? 'text-red-600' : 'text-slate-900'}`}>
                      <Clock className="w-4 h-4" />
                      {currentData.dateLimite} ({joursRestants()} jours restants)
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Type d'infraction</label>
                    <div className="flex items-center gap-2">
                      {getCategorieIcon(currentData.categorie)}
                      <div>
                        <div className="text-slate-900 font-medium">{currentData.type}</div>
                        <div className="text-sm text-slate-500">{currentData.categorie}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Gravité</label>
                    <div className="text-slate-900 font-medium">{currentData.gravite}</div>
                    {currentData.points && (
                      <div className="text-sm text-red-600">{currentData.points} points de permis</div>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-slate-600">Lieu</label>
                    <div className="text-slate-900 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {currentData.lieu}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Agent verbalisateur</label>
                    <div className="text-slate-900">{currentData.agent.nom}</div>
                    <div className="text-sm text-slate-500">{currentData.agent.grade}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Commissariat</label>
                    <div className="text-slate-900 text-sm">{currentData.agent.commissariat}</div>
                  </div>
                </div>
              </div>
              <span className={`inline-flex px-4 py-2 text-sm font-bold rounded-full ${getStatutColor(currentData.statut)}`}>
                {getStatutIcon(currentData.statut)}
                <span className="ml-2">{currentData.statut}</span>
              </span>
            </div>

            {/* Montant à payer */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-orange-600" />
                <div className="flex-1">
                  <div className="font-bold text-orange-900">Montant à régler</div>
                  <div className="text-sm text-orange-700">
                    Amende principale: {formatNumber(currentData.montant.principal)} FCFA
                    {currentData.montant.penalites > 0 && (
                      <> + Pénalités: {formatNumber(currentData.montant.penalites)} FCFA</>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-900">
                    {formatNumber(currentData.montant.total)} FCFA
                  </div>
                  <div className="text-xs text-orange-700">Montant total</div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Résumé</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-sm text-slate-600">Documents</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">{currentData.documents.length}</div>
                  <div className="text-xs text-slate-500">pièces</div>
                </div>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-sm text-slate-600">Photos</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">{currentData.photos.length}</div>
                  <div className="text-xs text-slate-500">clichés</div>
                </div>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-sm text-slate-600">Suivi</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">{currentData.historique.length}</div>
                  <div className="text-xs text-slate-500">actions</div>
                </div>
              </div>

              {currentData.statut === 'En attente' && (
                <div className="pt-2">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payer l'amende
                  </Button>
                </div>
              )}

              {currentData.statut === 'En attente' && (
                <div>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Contester l'infraction
                  </Button>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Onglets */}
      <div className="mb-6">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'details', label: 'Description', icon: FileText },
              { id: 'contrevenant', label: 'Contrevenant', icon: User },
              { id: 'vehicule', label: 'Véhicule', icon: Car },
              { id: 'legal', label: 'Aspects Légaux', icon: Shield },
              { id: 'paiement', label: 'Paiement', icon: CreditCard },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'photos', label: 'Photos', icon: Camera },
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
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Description de l'infraction</h3>
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <p className="text-slate-700">{currentData.description}</p>
            </div>

            <h4 className="font-medium text-slate-900 mb-3">Conditions de circulation</h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-900">{currentData.conditions}</p>
            </div>

            <h4 className="font-medium text-slate-900 mb-3">Localisation</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <label className="text-sm font-medium text-slate-600">Coordonnées GPS</label>
                <div className="text-slate-900 font-mono text-sm mt-1">
                  {currentData.coordonnees.latitude}<br />
                  {currentData.coordonnees.longitude}
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <label className="text-sm font-medium text-slate-600">Adresse complète</label>
                <div className="text-slate-900 text-sm mt-1">
                  {currentData.lieu}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === 'contrevenant' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Informations du Contrevenant</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-600">Nom complet</label>
                <div className="text-slate-900 font-medium text-lg">
                  {currentData.contrevenant.prenom} {currentData.contrevenant.nom}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Date de naissance</label>
                <div className="text-slate-900">{currentData.contrevenant.dateNaissance}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">CNI</label>
                <div className="text-slate-900 font-mono">{currentData.contrevenant.cni}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Téléphone</label>
                <div className="flex items-center gap-2 text-slate-900">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {currentData.contrevenant.telephone}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Email</label>
                <div className="flex items-center gap-2 text-slate-900">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {currentData.contrevenant.email}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Adresse</label>
                <div className="text-slate-900 text-sm">{currentData.contrevenant.adresse}</div>
              </div>
            </div>

            {currentData.conducteur && (
              <>
                <div className="border-t border-slate-200 my-6"></div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Conducteur au moment des faits</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-900 text-sm mb-3">
                    Le conducteur au moment de l'infraction était différent du propriétaire du véhicule
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-yellow-900">Nom</label>
                      <div className="text-yellow-900 font-medium">{currentData.conducteur.nom} {currentData.conducteur.prenom}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-yellow-900">Téléphone</label>
                      <div className="text-yellow-900">{currentData.conducteur.telephone}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-yellow-900">Permis</label>
                      <div className="text-yellow-900 font-mono text-sm">{currentData.conducteur.permis}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-yellow-900">Relation</label>
                      <div className="text-yellow-900">{currentData.conducteur.relation}</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      )}

      {activeTab === 'vehicule' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Informations du Véhicule</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Immatriculation</label>
                <div className="text-3xl font-bold text-slate-900 font-mono">
                  {currentData.vehicule.immatriculation}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Marque</label>
                  <div className="text-slate-900 font-medium">{currentData.vehicule.marque}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Modèle</label>
                  <div className="text-slate-900 font-medium">{currentData.vehicule.modele}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Année</label>
                  <div className="text-slate-900 font-medium">{currentData.vehicule.annee}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Couleur</label>
                  <div className="text-slate-900 font-medium">{currentData.vehicule.couleur}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Type</label>
                  <div className="text-slate-900 font-medium">{currentData.vehicule.typeVehicule}</div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === 'legal' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Aspects Légaux</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-slate-600">Code de référence</label>
                  <div className="text-slate-900 font-medium mt-1">{currentData.code}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-slate-600">Article</label>
                  <div className="text-slate-900 font-medium mt-1">{currentData.article}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-slate-600">Gravité</label>
                  <div className="text-slate-900 font-medium mt-1">{currentData.gravite}</div>
                </div>
                {currentData.points && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <label className="text-sm font-medium text-red-900">Points de permis</label>
                    <div className="text-red-600 font-bold text-lg mt-1">-{currentData.points} points</div>
                  </div>
                )}
              </div>

              {currentData.sanctionComplementaire && (
                <>
                  <h4 className="font-medium text-slate-900 mb-3">Sanction complémentaire</h4>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-orange-900">{currentData.sanctionComplementaire}</p>
                  </div>
                </>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === 'paiement' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Informations de Paiement</h3>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-sm text-slate-600">Montant total à payer</div>
                  <div className="text-3xl font-bold text-slate-900">
                    {formatNumber(currentData.montant.total)} FCFA
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Amende principale:</span>
                  <span className="font-medium text-slate-900 ml-2">{formatNumber(currentData.montant.principal)} FCFA</span>
                </div>
                {currentData.montant.penalites > 0 && (
                  <div>
                    <span className="text-slate-600">Pénalités de retard:</span>
                    <span className="font-medium text-red-600 ml-2">{formatNumber(currentData.montant.penalites)} FCFA</span>
                  </div>
                )}
              </div>
            </div>

            {currentData.paiement ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-green-900">Paiement effectué</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">Date de paiement:</span>
                    <div className="font-medium text-green-900">{currentData.paiement.datePaiement}</div>
                  </div>
                  <div>
                    <span className="text-green-700">Mode de paiement:</span>
                    <div className="font-medium text-green-900">{currentData.paiement.modePaiement}</div>
                  </div>
                  <div>
                    <span className="text-green-700">N° de transaction:</span>
                    <div className="font-medium text-green-900 font-mono">{currentData.paiement.numeroPaiement}</div>
                  </div>
                  <div>
                    <span className="text-green-700">Montant payé:</span>
                    <div className="font-medium text-green-900">{formatNumber(currentData.paiement.montantPaye)} FCFA</div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h4 className="font-medium text-slate-900 mb-3">Modes de paiement disponibles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                      <div>
                        <div className="font-medium text-slate-900">Paiement en ligne</div>
                        <div className="text-sm text-slate-600">Mobile Money, Carte bancaire</div>
                      </div>
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <Receipt className="w-6 h-6 text-green-600" />
                      <div>
                        <div className="font-medium text-slate-900">Guichet du commissariat</div>
                        <div className="text-sm text-slate-600">Paiement en espèces</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-900">
                      <p className="font-medium mb-1">Attention aux pénalités</p>
                      <p>En cas de non-paiement avant le {currentData.dateLimite}, des pénalités de 10% par mois seront appliquées.</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      )}

      {activeTab === 'documents' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Documents et pièces jointes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentData.documents.map((doc, index) => (
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
              {currentData.photos.map((photo, index) => (
                <div key={index} className="bg-slate-100 rounded-lg aspect-video flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer">
                  <div className="text-center text-slate-400">
                    <Camera className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm font-medium">Photo {index + 1}</p>
                    <p className="text-xs">{photo}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === 'suivi' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Historique et suivi</h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
              <div className="space-y-6">
                {currentData.historique.map((suivi, index) => (
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
                      <div className="flex items-center gap-4 text-sm text-slate-600">
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
                          {suivi.agent}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 mb-2">Observations</h4>
              <p className="text-slate-700 text-sm">{currentData.observations}</p>
            </div>

            {currentData.remarques && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Remarques</h4>
                <p className="text-blue-800 text-sm">{currentData.remarques}</p>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}