'use client'

import React, { useState } from 'react'
import {
  ArrowLeft, Printer, Download, Edit, FileText, Calendar, MapPin, User,
  Car, AlertTriangle, CheckCircle, XCircle, Clock, DollarSign, Shield,
  Phone, Mail, AlertCircle, Eye, Camera, ClipboardCheck, Flag
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'


type ControlStatus = 'Conforme' | 'Infraction' | 'Avertissement'

type ControlDetail = {
  id: string
  numero: string
  date: string
  heure: string
  statut: ControlStatus
  lieu: string
  typeControle: string
  duree: string
  // Informations véhicule
  vehicule: {
    immatriculation: string
    marque: string
    modele: string
    annee: string
    couleur: string
    typeVehicule: string
    numeroSerie: string
  }
  // Informations conducteur
  conducteur: {
    nom: string
    prenom: string
    telephone: string
    email: string
    adresse: string
    cni: string
    permis: string
    validitePermis: string
  }
  // Informations agent
  agent: {
    nom: string
    matricule: string
    telephone: string
    commissariat: string
    grade: string
  }
  // Documents vérifiés
  documentsVerifies: {
    carteGrise: { statut: 'OK' | 'NOK' | 'N/A', details: string }
    assurance: { statut: 'OK' | 'NOK' | 'N/A', details: string, validite?: string }
    controletechnique: { statut: 'OK' | 'NOK' | 'N/A', details: string, validite?: string }
    permisConduire: { statut: 'OK' | 'NOK' | 'N/A', details: string, validite?: string }
  }
  // Éléments contrôlés
  elementsControles: {
    eclairage: { statut: 'OK' | 'NOK' | 'N/A', details: string }
    freinage: { statut: 'OK' | 'NOK' | 'N/A', details: string }
    pneumatiques: { statut: 'OK' | 'NOK' | 'N/A', details: string }
    ceintures: { statut: 'OK' | 'NOK' | 'N/A', details: string }
    extincteur: { statut: 'OK' | 'NOK' | 'N/A', details: string }
    triangleSignalisation: { statut: 'OK' | 'NOK' | 'N/A', details: string }
  }
  // PV et amende
  pv?: {
    numero: string
    dateEmission: string
    infractions: string[]
    gravite: string
  }
  amende?: {
    numero: string
    montant: number
    statut: 'En attente' | 'Payé'
  }
  observations: string
  recommandations: string[]
  photos: string[]
  dateSuivi?: string
}

// Données d'exemple pour le contrôle détaillé
const controleDetail: ControlDetail = {
  id: '1',
  numero: 'CTR-2025-0246',
  date: '25/09/2025',
  heure: '14:20',
  statut: 'Infraction',
  lieu: 'Boulevard de Marseille, Cocody',
  typeControle: 'Contrôle de routine',
  duree: '25 minutes',
  vehicule: {
    immatriculation: 'EF-789-GH',
    marque: 'Toyota',
    modele: 'Corolla',
    annee: '2019',
    couleur: 'Blanc',
    typeVehicule: 'Berline',
    numeroSerie: 'JTD987654321'
  },
  conducteur: {
    nom: 'TRAORE',
    prenom: 'Moussa',
    telephone: '+225 0708765432',
    email: 'moussa.traore@email.com',
    adresse: 'Cocody Riviera Palmeraie, Rue des Jardins, Villa 89',
    cni: 'CI0098765432',
    permis: 'CI-PC-2018-045678',
    validitePermis: '15/03/2028'
  },
  agent: {
    nom: 'DIALLO Mamadou',
    matricule: 'AGT-2023-0789',
    telephone: '+225 05 44 33 22 11',
    commissariat: '5ème Arrondissement - Cocody',
    grade: 'Brigadier-Chef'
  },
  documentsVerifies: {
    carteGrise: { 
      statut: 'OK', 
      details: 'Carte grise en cours de validité, immatriculation conforme' 
    },
    assurance: { 
      statut: 'NOK', 
      details: 'Police d\'assurance expirée',
      validite: '15/08/2025'
    },
    controletechnique: { 
      statut: 'OK', 
      details: 'Contrôle technique valide',
      validite: '10/12/2025'
    },
    permisConduire: { 
      statut: 'OK', 
      details: 'Permis de conduire valide, toutes catégories conformes',
      validite: '15/03/2028'
    }
  },
  elementsControles: {
    eclairage: { 
      statut: 'NOK', 
      details: 'Phare avant droit défaillant, feu stop arrière gauche non fonctionnel' 
    },
    freinage: { 
      statut: 'OK', 
      details: 'Système de freinage opérationnel, test de freinage satisfaisant' 
    },
    pneumatiques: { 
      statut: 'OK', 
      details: 'Profondeur de sculpture conforme (4.5mm min), pression correcte' 
    },
    ceintures: { 
      statut: 'OK', 
      details: 'Ceintures de sécurité présentes et fonctionnelles' 
    },
    extincteur: { 
      statut: 'OK', 
      details: 'Extincteur présent et en bon état, date de péremption valide' 
    },
    triangleSignalisation: { 
      statut: 'OK', 
      details: 'Triangle de signalisation présent' 
    }
  },
  pv: {
    numero: 'PV-0892',
    dateEmission: '25/09/2025',
    infractions: ['Défaut d\'éclairage', 'Assurance expirée'],
    gravite: 'Classe 2'
  },
  amende: {
    numero: '#AMN-2025-0892',
    montant: 45000,
    statut: 'En attente'
  },
  observations: 'Véhicule présentant deux non-conformités majeures nécessitant une attention immédiate. Le conducteur a été informé des infractions et des délais pour régulariser sa situation.',
  recommandations: [
    'Réparer immédiatement le phare avant droit',
    'Remplacer le feu stop arrière gauche',
    'Renouveler la police d\'assurance dans les plus brefs délais',
    'Effectuer un nouveau contrôle dans les 30 jours'
  ],
  photos: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg', 'photo4.jpg'],
  dateSuivi: '25/10/2025'
}

export default function ControleDetailPage() {
  const [activeTab, setActiveTab] = useState('details')

  // Fonction pour formater les nombres
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const getStatutColor = (statut: ControlStatus) => {
    switch (statut) {
      case 'Conforme':
        return 'bg-green-500 text-white'
      case 'Infraction':
        return 'bg-red-500 text-white'
      case 'Avertissement':
        return 'bg-yellow-500 text-white'
    }
  }

  const getStatutIcon = (statut: ControlStatus) => {
    switch (statut) {
      case 'Conforme':
        return <CheckCircle className="w-4 h-4" />
      case 'Infraction':
        return <XCircle className="w-4 h-4" />
      case 'Avertissement':
        return <AlertTriangle className="w-4 h-4" />
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
              Contrôle {controleDetail.numero}
            </h1>
            <p className="text-slate-600 mt-1">
              Détails du contrôle routier du {controleDetail.date}
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
                    <label className="text-sm font-medium text-slate-600">N° Contrôle</label>
                    <div className="text-lg font-bold text-slate-900">{controleDetail.numero}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Date & Heure</label>
                    <div className="text-slate-900 flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {controleDetail.date} à {controleDetail.heure}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Lieu</label>
                    <div className="text-slate-900 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {controleDetail.lieu}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Type de contrôle</label>
                    <div className="text-slate-900">{controleDetail.typeControle}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Durée</label>
                    <div className="text-slate-900 flex items-center gap-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {controleDetail.duree}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Agent</label>
                    <div className="text-slate-900">{controleDetail.agent.nom}</div>
                    <div className="text-sm text-slate-500">{controleDetail.agent.commissariat}</div>
                  </div>
                </div>
              </div>
              <span className={`inline-flex px-4 py-2 text-sm font-bold rounded-full ${getStatutColor(controleDetail.statut)}`}>
                {getStatutIcon(controleDetail.statut)}
                <span className="ml-2">{controleDetail.statut}</span>
              </span>
            </div>

            {controleDetail.pv && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-orange-600" />
                  <div className="flex-1">
                    <div className="font-bold text-orange-900">Procès-Verbal émis</div>
                    <div className="text-sm text-orange-700">
                      PV N° {controleDetail.pv.numero} - {controleDetail.pv.infractions.join(', ')}
                    </div>
                  </div>
                  {controleDetail.amende && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-orange-900">
                        {formatNumber(controleDetail.amende.montant)} FCFA
                      </div>
                      <div className="text-xs text-orange-700">Amende {controleDetail.amende.numero}</div>
                    </div>
                  )}
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
                  <div className="text-2xl font-bold text-slate-900">4/4</div>
                  <div className="text-xs text-slate-500">contrôlés</div>
                </div>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-sm text-slate-600">Éléments contrôlés</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">6/6</div>
                  <div className="text-xs text-slate-500">vérifiés</div>
                </div>
              </div>
              {controleDetail.dateSuivi && (
                <div className="pt-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-blue-900">
                      <Flag className="w-4 h-4" />
                      <div>
                        <div className="text-xs font-medium">Suivi prévu</div>
                        <div className="text-sm font-bold">{controleDetail.dateSuivi}</div>
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
              <h3 className="text-lg font-bold text-slate-900 mb-4">Informations du Véhicule</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Immatriculation</label>
                  <div className="text-2xl font-bold text-slate-900 font-mono">
                    {controleDetail.vehicule.immatriculation}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Marque</label>
                    <div className="text-slate-900 font-medium">{controleDetail.vehicule.marque}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Modèle</label>
                    <div className="text-slate-900 font-medium">{controleDetail.vehicule.modele}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Année</label>
                    <div className="text-slate-900 font-medium">{controleDetail.vehicule.annee}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Couleur</label>
                    <div className="text-slate-900 font-medium">{controleDetail.vehicule.couleur}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Type</label>
                    <div className="text-slate-900 font-medium">{controleDetail.vehicule.typeVehicule}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">N° Série</label>
                    <div className="text-slate-900 font-mono text-sm">{controleDetail.vehicule.numeroSerie}</div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Informations du Conducteur</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Nom complet</label>
                  <div className="text-slate-900 font-medium text-lg">
                    {controleDetail.conducteur.prenom} {controleDetail.conducteur.nom}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">CNI</label>
                    <div className="text-slate-900 font-mono text-sm">{controleDetail.conducteur.cni}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Permis</label>
                    <div className="text-slate-900 font-mono text-sm">{controleDetail.conducteur.permis}</div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Téléphone</label>
                  <div className="flex items-center gap-2 text-slate-900">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {controleDetail.conducteur.telephone}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Email</label>
                  <div className="flex items-center gap-2 text-slate-900">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {controleDetail.conducteur.email}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Adresse</label>
                  <div className="text-slate-900 text-sm">{controleDetail.conducteur.adresse}</div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {activeTab === 'documents' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Documents Vérifiés</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(controleDetail.documentsVerifies).map(([key, doc]) => (
                <div key={key} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {getStatusIcon(doc.statut)}
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <span className={`text-sm font-medium ${
                        doc.statut === 'OK' ? 'text-green-600' : 
                        doc.statut === 'NOK' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {doc.statut === 'OK' ? 'Conforme' : 
                         doc.statut === 'NOK' ? 'Non-Conforme' : 'Non Applicable'}
                      </span>
                    </div>
              
                  </div>
                  <p className="text-sm text-slate-600">{doc.details}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === 'verification' && (
        <div className="space-y-6">
          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Éléments Contrôlés</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(controleDetail.elementsControles).map(([key, element]) => (
                  <div key={key} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusIcon(element.statut)}
                      <div>
                        <h4 className="font-medium text-slate-900 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <span className={`text-sm font-medium ${
                          element.statut === 'OK' ? 'text-green-600' : 
                          element.statut === 'NOK' ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {element.statut === 'OK' ? 'Conforme' : 
                           element.statut === 'NOK' ? 'Non-Conforme' : 'Non Applicable'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">{element.details}</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Observations & Recommandations</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Observations</h4>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-slate-700">{controleDetail.observations}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Recommandations</h4>
                  <ul className="space-y-2">
                    {controleDetail.recommandations.map((recommandation, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        {recommandation}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {activeTab === 'photos' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Photos du Contrôle</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {controleDetail.photos.map((photo, index) => (
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