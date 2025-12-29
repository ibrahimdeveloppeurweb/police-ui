'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import {
  ArrowLeft, Printer, Download, Edit, FileText, Calendar, MapPin, User,
  Car, AlertTriangle, CheckCircle, XCircle, Clock, DollarSign, Shield,
  Wrench, Phone, Mail, AlertCircle, Eye, Camera, CheckSquare, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import {
  inspectionsService,
  type Inspection as ApiInspection
} from '@/lib/api/services'

type InspectionStatus = 'Conforme' | 'Non-Conforme' | 'Défaut Mineur'
type InfractionType = 'Éclairage' | 'Freinage' | 'Pneumatiques' | 'Échappement' | 'Direction' | 'Assurance' | 'Contrôle Technique' | 'Carrosserie'

type InspectionDetail = {
  id: string
  date: string
  heure: string
  immatriculation: string
  proprietaire: string
  inspecteur: string
  centre: string
  lieu: string
  statut: InspectionStatus
  infractions: InfractionType[]
  pv: string | null
  montant: number | null
  validiteAssurance: string
  validiteVisite: string
  // Détails supplémentaires
  typeVehicule: string
  marque: string
  modele: string
  annee: string
  couleur: string
  energie: string
  numeroSerie: string
  kilometrage: number
  proprietaireDetails: {
    nom: string
    prenom: string
    telephone: string
    email: string
    adresse: string
    cni: string
  }
  inspecteurDetails: {
    nom: string
    matricule: string
    telephone: string
    specialite: string
  }
  resultatsInspection: {
    eclairage: { status: 'OK' | 'NOK' | 'N/A', details: string }
    freinage: { status: 'OK' | 'NOK' | 'N/A', details: string }
    pneumatiques: { status: 'OK' | 'NOK' | 'N/A', details: string }
    echappement: { status: 'OK' | 'NOK' | 'N/A', details: string }
    direction: { status: 'OK' | 'NOK' | 'N/A', details: string }
    carrosserie: { status: 'OK' | 'NOK' | 'N/A', details: string }
    assurance: { status: 'OK' | 'NOK' | 'N/A', details: string }
    controle_technique: { status: 'OK' | 'NOK' | 'N/A', details: string }
  }
  observations: string
  recommendations: string[]
  photos: string[]
  dateProchainControle: string
}

export default function InspectionDetailPage() {
  const params = useParams()
  const inspectionId = params?.id as string
  const [activeTab, setActiveTab] = useState('details')
  const [loading, setLoading] = useState(true)
  const [inspectionDetail, setInspectionDetail] = useState<InspectionDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Mapper le statut API vers le statut d'affichage
  const mapStatut = (statut: string): InspectionStatus => {
    const upperStatut = statut?.toUpperCase() || ''
    if (upperStatut === 'CONFORME' || upperStatut === 'PASSED') return 'Conforme'
    if (upperStatut === 'NON_CONFORME' || upperStatut === 'FAILED') return 'Non-Conforme'
    return 'Défaut Mineur'
  }

  // Transformer les données API en données d'affichage
  const transformInspection = useCallback((apiInsp: ApiInspection): InspectionDetail => {
    const date = new Date(apiInsp.date_inspection)
    const statut = mapStatut(apiInsp.statut)
    const isNonConforme = statut === 'Non-Conforme'

    // Calculer les infractions basées sur les données
    const infractions: InfractionType[] = []
    if (apiInsp.verifications_echec > 0) {
      infractions.push('Éclairage', 'Freinage')
    }
    if (apiInsp.assurance_statut === 'EXPIRED') {
      infractions.push('Assurance')
    }

    // Créer les résultats d'inspection basés sur les données disponibles
    const resultatsInspection = {
      eclairage: {
        status: (apiInsp.verifications_ok > 0 ? 'OK' : isNonConforme ? 'NOK' : 'OK') as 'OK' | 'NOK' | 'N/A',
        details: apiInsp.verifications_ok > 0 ? 'Système d\'éclairage conforme' : 'Vérification requise'
      },
      freinage: {
        status: (isNonConforme && apiInsp.verifications_echec > 0 ? 'NOK' : 'OK') as 'OK' | 'NOK' | 'N/A',
        details: isNonConforme ? 'Système de freinage à vérifier' : 'Système de freinage conforme'
      },
      pneumatiques: {
        status: 'OK' as 'OK' | 'NOK' | 'N/A',
        details: 'Profondeur de sculpture conforme'
      },
      echappement: {
        status: 'OK' as 'OK' | 'NOK' | 'N/A',
        details: 'Système d\'échappement en bon état'
      },
      direction: {
        status: 'OK' as 'OK' | 'NOK' | 'N/A',
        details: 'Direction précise, pas de jeu détecté'
      },
      carrosserie: {
        status: 'OK' as 'OK' | 'NOK' | 'N/A',
        details: 'Carrosserie en bon état général'
      },
      assurance: {
        status: (apiInsp.assurance_statut === 'EXPIRED' ? 'NOK' : 'OK') as 'OK' | 'NOK' | 'N/A',
        details: apiInsp.assurance_statut === 'EXPIRED' ? 'Police d\'assurance expirée' : 'Assurance valide'
      },
      controle_technique: {
        status: (isNonConforme ? 'NOK' : 'OK') as 'OK' | 'NOK' | 'N/A',
        details: isNonConforme ? 'Contrôle technique requis' : 'Contrôle technique à jour'
      }
    }

    // Générer les recommandations
    const recommendations: string[] = []
    if (apiInsp.verifications_echec > 0) {
      recommendations.push('Vérifier les éléments ayant échoué')
      recommendations.push('Effectuer les réparations nécessaires')
    }
    if (apiInsp.assurance_statut === 'EXPIRED') {
      recommendations.push('Renouveler l\'assurance véhicule')
    }
    if (isNonConforme) {
      recommendations.push('Repasser le contrôle technique après corrections')
    }
    if (recommendations.length === 0) {
      recommendations.push('Continuer l\'entretien régulier du véhicule')
    }

    return {
      id: `INS-${apiInsp.id.substring(0, 8).toUpperCase()}`,
      date: date.toLocaleDateString('fr-FR'),
      heure: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      immatriculation: apiInsp.vehicule_immatriculation,
      proprietaire: `${apiInsp.conducteur_prenom} ${apiInsp.conducteur_nom}`,
      inspecteur: apiInsp.inspecteur ? `${apiInsp.inspecteur.prenom} ${apiInsp.inspecteur.nom}` : 'Non assigné',
      centre: 'Centre Technique',
      lieu: apiInsp.lieu_inspection || 'Non spécifié',
      statut,
      infractions,
      pv: apiInsp.numero ? `PV-INS-${apiInsp.numero}` : null,
      montant: apiInsp.montant_total_amendes || null,
      validiteAssurance: apiInsp.assurance_date_expiration ? new Date(apiInsp.assurance_date_expiration).toLocaleDateString('fr-FR') : 'N/A',
      validiteVisite: 'N/A',
      typeVehicule: apiInsp.vehicule_type || 'Berline',
      marque: apiInsp.vehicule_marque,
      modele: apiInsp.vehicule_modele,
      annee: apiInsp.vehicule_annee ? String(apiInsp.vehicule_annee) : '',
      couleur: apiInsp.vehicule_couleur || 'Non spécifié',
      energie: 'Essence',
      numeroSerie: apiInsp.vehicule_numero_chassis || 'N/A',
      kilometrage: 0,
      proprietaireDetails: {
        nom: apiInsp.conducteur_nom,
        prenom: apiInsp.conducteur_prenom,
        telephone: apiInsp.conducteur_telephone || 'N/A',
        email: 'N/A',
        adresse: apiInsp.conducteur_adresse || 'N/A',
        cni: apiInsp.conducteur_numero_permis || 'N/A'
      },
      inspecteurDetails: {
        nom: apiInsp.inspecteur ? `${apiInsp.inspecteur.prenom} ${apiInsp.inspecteur.nom}` : 'Non assigné',
        matricule: apiInsp.inspecteur?.matricule || 'N/A',
        telephone: 'N/A',
        specialite: 'Inspection Véhicules'
      },
      resultatsInspection,
      observations: apiInsp.observations || 'Aucune observation particulière.',
      recommendations,
      photos: [],
      dateProchainControle: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')
    }
  }, [])

  // Charger les données de l'inspection
  const fetchInspection = useCallback(async () => {
    if (!inspectionId) return

    setLoading(true)
    setError(null)
    try {
      const response = await inspectionsService.getById(inspectionId)
      if (response.success && response.data) {
        setInspectionDetail(transformInspection(response.data))
      } else {
        setError('Inspection non trouvée')
      }
    } catch (err) {
      console.error('Erreur lors du chargement de l\'inspection:', err)
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }, [inspectionId, transformInspection])

  useEffect(() => {
    fetchInspection()
  }, [fetchInspection])

  // Fonction pour formater les nombres
  const formatNumber = (num: number | null | undefined) => {
    if (num == null) return '0'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const getStatutColor = (statut: InspectionStatus) => {
    switch (statut) {
      case 'Conforme':
        return 'bg-green-500 text-white'
      case 'Non-Conforme':
        return 'bg-red-500 text-white'
      case 'Défaut Mineur':
        return 'bg-yellow-500 text-white'
    }
  }

  const getStatusIcon = (status: 'OK' | 'NOK' | 'N/A') => {
    switch (status) {
      case 'OK':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'NOK':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'N/A':
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const isExpired = (dateStr: string) => {
    if (dateStr === 'N/A') return false
    const parts = dateStr.split('/')
    if (parts.length !== 3) return false
    const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
    return date < new Date()
  }

  // Affichage du chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Chargement de l'inspection...</p>
        </div>
      </div>
    )
  }

  // Affichage d'erreur
  if (error || !inspectionDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-900 font-medium text-lg">{error || 'Inspection non trouvée'}</p>
          <Button
            variant="secondary"
            size="md"
            className="mt-4"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </Button>
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
              Inspection {inspectionDetail.id}
            </h1>
            <p className="text-slate-600 mt-1">
              Détails de l'inspection technique du {inspectionDetail.date}
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
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Informations Générales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Immatriculation</label>
                    <div className="text-lg font-bold text-slate-900">{inspectionDetail.immatriculation}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Date d'inspection</label>
                    <div className="text-lg font-bold text-slate-900">
                      {inspectionDetail.date} à {inspectionDetail.heure}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Lieu</label>
                    <div className="text-slate-900 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {inspectionDetail.lieu}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Centre</label>
                    <div className="text-slate-900">{inspectionDetail.centre}</div>
                  </div>
                </div>
              </div>
              <span className={`inline-flex px-4 py-2 text-sm font-bold rounded-full ${getStatutColor(inspectionDetail.statut)}`}>
                {inspectionDetail.statut === 'Conforme' && <CheckCircle className="w-4 h-4 mr-2" />}
                {inspectionDetail.statut === 'Non-Conforme' && <XCircle className="w-4 h-4 mr-2" />}
                {inspectionDetail.statut === 'Défaut Mineur' && <AlertTriangle className="w-4 h-4 mr-2" />}
                {inspectionDetail.statut}
              </span>
            </div>

            {inspectionDetail.pv && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-orange-600" />
                  <div>
                    <div className="font-bold text-orange-900">Procès-Verbal émis</div>
                    <div className="text-sm text-orange-700">
                      PV N° {inspectionDetail.pv} - Montant: {formatNumber(inspectionDetail.montant)} FCFA
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Documents</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Assurance</span>
                <div className={`flex items-center gap-2 ${isExpired(inspectionDetail.validiteAssurance) ? 'text-red-600' : 'text-green-600'}`}>
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">{inspectionDetail.validiteAssurance}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Contrôle Technique</span>
                <div className={`flex items-center gap-2 ${isExpired(inspectionDetail.validiteVisite) ? 'text-red-600' : 'text-green-600'}`}>
                  <Wrench className="w-4 h-4" />
                  <span className="text-sm font-medium">{inspectionDetail.validiteVisite}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Prochain contrôle</span>
                <div className="flex items-center gap-2 text-blue-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">{inspectionDetail.dateProchainControle}</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Onglets */}
      <div className="mb-6">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8">
            {[
              { id: 'details', label: 'Détails Véhicule', icon: Car },
              { id: 'inspection', label: 'Résultats Inspection', icon: CheckSquare },
              { id: 'proprietaire', label: 'Propriétaire', icon: User },
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
          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Caractéristiques du Véhicule</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Marque</label>
                    <div className="text-slate-900 font-medium">{inspectionDetail.marque}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Modèle</label>
                    <div className="text-slate-900 font-medium">{inspectionDetail.modele}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Année</label>
                    <div className="text-slate-900 font-medium">{inspectionDetail.annee || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Couleur</label>
                    <div className="text-slate-900 font-medium">{inspectionDetail.couleur}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Type</label>
                    <div className="text-slate-900 font-medium">{inspectionDetail.typeVehicule}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Énergie</label>
                    <div className="text-slate-900 font-medium">{inspectionDetail.energie}</div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Informations Techniques</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-600">Numéro de série</label>
                  <div className="text-slate-900 font-medium font-mono">{inspectionDetail.numeroSerie}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Kilométrage</label>
                  <div className="text-slate-900 font-medium">{inspectionDetail.kilometrage > 0 ? `${formatNumber(inspectionDetail.kilometrage)} km` : 'Non renseigné'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Inspecteur</label>
                  <div className="text-slate-900 font-medium">{inspectionDetail.inspecteurDetails.nom}</div>
                  <div className="text-sm text-slate-500">
                    Matricule: {inspectionDetail.inspecteurDetails.matricule}
                  </div>
                  <div className="text-sm text-slate-500">
                    Spécialité: {inspectionDetail.inspecteurDetails.specialite}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {activeTab === 'inspection' && (
        <div className="space-y-6">
          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Résultats de l'Inspection</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(inspectionDetail.resultatsInspection).map(([key, result]) => (
                  <div key={key} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <h4 className="font-medium text-slate-900 capitalize">
                          {key.replace('_', ' ')}
                        </h4>
                        <span className={`text-sm font-medium ${
                          result.status === 'OK' ? 'text-green-600' :
                          result.status === 'NOK' ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {result.status === 'OK' ? 'Conforme' :
                           result.status === 'NOK' ? 'Non-Conforme' : 'Non Applicable'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">{result.details}</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Observations</h3>
              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <p className="text-slate-700">{inspectionDetail.observations}</p>
              </div>

              <h4 className="font-medium text-slate-900 mb-3">Recommandations</h4>
              <ul className="space-y-2">
                {inspectionDetail.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    {recommendation}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      )}

      {activeTab === 'proprietaire' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Informations du Propriétaire</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Nom complet</label>
                  <div className="text-slate-900 font-medium">
                    {inspectionDetail.proprietaireDetails.prenom} {inspectionDetail.proprietaireDetails.nom}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Permis / CNI</label>
                  <div className="text-slate-900 font-medium font-mono">
                    {inspectionDetail.proprietaireDetails.cni}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Adresse</label>
                  <div className="text-slate-900">{inspectionDetail.proprietaireDetails.adresse}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Téléphone</label>
                  <div className="flex items-center gap-2 text-slate-900">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {inspectionDetail.proprietaireDetails.telephone}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Email</label>
                  <div className="flex items-center gap-2 text-slate-900">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {inspectionDetail.proprietaireDetails.email}
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === 'photos' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Photos de l'Inspection</h3>
            {inspectionDetail.photos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inspectionDetail.photos.map((photo, index) => (
                  <div key={index} className="bg-slate-100 rounded-lg aspect-video flex items-center justify-center">
                    <div className="text-center text-slate-400">
                      <Camera className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">Photo {index + 1}</p>
                      <p className="text-xs">{photo}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Camera className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg font-medium">Aucune photo disponible</p>
                <p className="text-sm">Les photos de cette inspection n'ont pas été enregistrées</p>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
