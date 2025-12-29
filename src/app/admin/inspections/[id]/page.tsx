'use client'

import React, { useState } from 'react'
import {
  ArrowLeft, Printer, Download, Edit, FileText, Calendar, MapPin, User,
  Car, AlertTriangle, CheckCircle, XCircle, Clock, DollarSign, Shield,
  Wrench, Phone, Mail, AlertCircle, Eye, Camera, CheckSquare
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'

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

// Données d'exemple pour l'inspection détaillée
const inspectionDetail: InspectionDetail = {
  id: 'INS-2025-0847',
  date: '25/09/2025',
  heure: '15:30',
  immatriculation: 'CI-2589-AB',
  proprietaire: 'KONE Mamadou',
  inspecteur: 'KOUAME Jean-Baptiste',
  centre: 'Centre Technique Yopougon',
  lieu: 'Yopougon Sideci',
  statut: 'Non-Conforme',
  infractions: ['Éclairage', 'Freinage', 'Assurance'],
  pv: 'PV-INS-1247',
  montant: 85000,
  validiteAssurance: '15/08/2025',
  validiteVisite: '10/07/2025',
  typeVehicule: 'Berline',
  marque: 'Toyota',
  modele: 'Corolla',
  annee: '2018',
  couleur: 'Blanc',
  energie: 'Essence',
  numeroSerie: 'JTD123456789',
  kilometrage: 125000,
  proprietaireDetails: {
    nom: 'KONE',
    prenom: 'Mamadou',
    telephone: '+225 07 12 34 56 78',
    email: 'mamadou.kone@gmail.com',
    adresse: 'Yopougon Sideci, Rue des Palmiers, Lot 247',
    cni: 'CI0012345678'
  },
  inspecteurDetails: {
    nom: 'KOUAME Jean-Baptiste',
    matricule: 'INSP-2024-089',
    telephone: '+225 05 98 76 54 32',
    specialite: 'Inspection Véhicules Légers'
  },
  resultatsInspection: {
    eclairage: { 
      status: 'NOK', 
      details: 'Phare avant gauche défaillant, clignotant arrière droit non fonctionnel' 
    },
    freinage: { 
      status: 'NOK', 
      details: 'Plaquettes avant usées (2mm restant), liquide de frein niveau bas' 
    },
    pneumatiques: { 
      status: 'OK', 
      details: 'Profondeur de sculpture conforme (4.2mm min)' 
    },
    echappement: { 
      status: 'OK', 
      details: 'Système d\'échappement en bon état, émissions conformes' 
    },
    direction: { 
      status: 'OK', 
      details: 'Direction précise, pas de jeu détecté' 
    },
    carrosserie: { 
      status: 'OK', 
      details: 'Carrosserie en bon état général, quelques rayures superficielles' 
    },
    assurance: { 
      status: 'NOK', 
      details: 'Police d\'assurance expirée depuis le 15/08/2025' 
    },
    controle_technique: { 
      status: 'NOK', 
      details: 'Contrôle technique expiré depuis le 10/07/2025' 
    }
  },
  observations: 'Véhicule présentant plusieurs non-conformités majeures. Le propriétaire doit impérativement effectuer les réparations et renouveler ses documents avant remise en circulation.',
  recommendations: [
    'Remplacer le phare avant gauche',
    'Réparer le clignotant arrière droit',
    'Changer les plaquettes de frein avant',
    'Faire l\'appoint de liquide de frein',
    'Renouveler l\'assurance véhicule',
    'Effectuer le contrôle technique obligatoire'
  ],
  photos: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
  dateProchainControle: '25/09/2026'
}

export default function InspectionDetailPage() {
  const [activeTab, setActiveTab] = useState('details')

  // Fonction pour formater les nombres
  const formatNumber = (num: number) => {
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
    const date = new Date(dateStr.split('/').reverse().join('-'))
    return date < new Date()
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
                      PV N° {inspectionDetail.pv} - Montant: {formatNumber(inspectionDetail.montant!)} FCFA
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
                    <div className="text-slate-900 font-medium">{inspectionDetail.annee}</div>
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
                  <div className="text-slate-900 font-medium">{formatNumber(inspectionDetail.kilometrage)} km</div>
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
                  <label className="text-sm font-medium text-slate-600">CNI</label>
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
          </CardBody>
        </Card>
      )}
    </div>
  )
}