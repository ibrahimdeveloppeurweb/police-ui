'use client'

import React, { useState } from 'react'
import {
  ArrowLeft, Printer, Download, Edit, FileText, Calendar, MapPin, User,
  Car, AlertTriangle, CheckCircle, XCircle, Clock, DollarSign, Phone,
  MessageSquare, CreditCard, Flag, Badge, Shield, Camera, Mail, Eye
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'

type PaymentStatus = 'Non payé' | 'Payé' | 'En retard'

type PVDetail = {
  id: string
  numero: string
  vehicule: string
  conducteur: string
  agent: string
  commissariat: string
  lieu: string
  montant: number
  penalites?: number
  infractions: number
  dateEmission: string
  datePaiement?: string
  statutPaiement: PaymentStatus
  modePaiement?: string
  telephone?: string
  rappels?: number
  joursRetard?: number
  // Détails supplémentaires
  heureEmission: string
  conducteurDetails: {
    nom: string
    prenom: string
    telephone: string
    email?: string
    adresse: string
    cni: string
    permis: string
  }
  vehiculeDetails: {
    immatriculation: string
    marque: string
    modele: string
    annee: string
    couleur: string
    proprietaire: string
    assurance: string
    validiteAssurance: string
  }
  agentDetails: {
    nom: string
    matricule: string
    grade: string
    commissariat: string
    telephone: string
  }
  infractionDetails: Array<{
    code: string
    libelle: string
    montant: number
    gravite: 'Mineur' | 'Moyen' | 'Grave'
  }>
  coordonneesGPS: {
    latitude: number
    longitude: number
  }
  observations: string
  preuves: string[]
  historiquePaiement: Array<{
    date: string
    action: string
    montant?: number
    mode?: string
    agent?: string
  }>
}

// Données d'exemple pour le PV détaillé
const pvDetail: PVDetail = {
  id: '3',
  numero: 'PV-2025-PV-0850',
  vehicule: 'QR-234-ST',
  conducteur: 'YAO Kouadio',
  agent: 'KOUASSI Jean',
  commissariat: '3ème Arrondissement',
  lieu: 'Adjamé Marché',
  montant: 75000,
  penalites: 7500,
  infractions: 3,
  dateEmission: '20/08/2025',
  statutPaiement: 'En retard',
  telephone: '+225 0701234567',
  rappels: 3,
  joursRetard: 35,
  heureEmission: '14:30',
  conducteurDetails: {
    nom: 'YAO',
    prenom: 'Kouadio',
    telephone: '+225 0701234567',
    email: 'kouadio.yao@gmail.com',
    adresse: 'Adjamé Bracodi, Rue des Commerçants, Lot 156',
    cni: 'CI0087654321',
    permis: 'B-2020-045789'
  },
  vehiculeDetails: {
    immatriculation: 'QR-234-ST',
    marque: 'Nissan',
    modele: 'Almera',
    annee: '2019',
    couleur: 'Gris métallisé',
    proprietaire: 'YAO Kouadio',
    assurance: 'NSIA Assurances',
    validiteAssurance: '15/12/2025'
  },
  agentDetails: {
    nom: 'KOUASSI Jean',
    matricule: 'AG-2023-145',
    grade: 'Brigadier-Chef',
    commissariat: '3ème Arrondissement - Adjamé',
    telephone: '+225 0512345678'
  },
  infractionDetails: [
    {
      code: 'ART-127',
      libelle: 'Excès de vitesse en agglomération (+20 km/h)',
      montant: 35000,
      gravite: 'Moyen'
    },
    {
      code: 'ART-89',
      libelle: 'Non-port de la ceinture de sécurité',
      montant: 15000,
      gravite: 'Mineur'
    },
    {
      code: 'ART-156',
      libelle: 'Usage du téléphone au volant',
      montant: 25000,
      gravite: 'Moyen'
    }
  ],
  coordonneesGPS: {
    latitude: 5.3599517,
    longitude: -4.0179415
  },
  observations: 'Conducteur interpellé lors d\'un contrôle de routine. Vitesse mesurée à 72 km/h dans une zone limitée à 50 km/h. Conducteur au téléphone sans kit mains libres et sans ceinture de sécurité.',
  preuves: ['photo_radar.jpg', 'photo_vehicule.jpg', 'photo_conducteur.jpg'],
  historiquePaiement: [
    {
      date: '20/08/2025',
      action: 'PV émis',
      agent: 'KOUASSI Jean'
    },
    {
      date: '25/08/2025',
      action: '1er rappel SMS envoyé'
    },
    {
      date: '05/09/2025',
      action: '2ème rappel téléphonique'
    },
    {
      date: '15/09/2025',
      action: '3ème rappel courrier recommandé'
    },
    {
      date: '25/09/2025',
      action: 'Application des pénalités de retard',
      montant: 7500
    }
  ]
}

export default function PVDetailPage() {
  const [activeTab, setActiveTab] = useState('details')

  // Fonction pour formater les nombres
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const getStatutColor = (statut: PaymentStatus) => {
    switch (statut) {
      case 'Payé':
        return 'bg-green-500 text-white'
      case 'Non payé':
        return 'bg-yellow-500 text-white'
      case 'En retard':
        return 'bg-red-500 text-white'
    }
  }

  const getStatutIcon = (statut: PaymentStatus) => {
    switch (statut) {
      case 'Payé':
        return <CheckCircle className="w-4 h-4" />
      case 'Non payé':
        return <Clock className="w-4 h-4" />
      case 'En retard':
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getGraviteColor = (gravite: 'Mineur' | 'Moyen' | 'Grave') => {
    switch (gravite) {
      case 'Mineur':
        return 'bg-yellow-100 text-yellow-800'
      case 'Moyen':
        return 'bg-orange-100 text-orange-800'
      case 'Grave':
        return 'bg-red-100 text-red-800'
    }
  }

  const montantTotal = pvDetail.montant + (pvDetail.penalites || 0)

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
              {pvDetail.numero}
            </h1>
            <p className="text-slate-600 mt-1">
              PV émis le {pvDetail.dateEmission} à {pvDetail.heureEmission}
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
                    <label className="text-sm font-medium text-slate-600">Véhicule</label>
                    <div className="text-lg font-bold text-slate-900">{pvDetail.vehicule}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Conducteur</label>
                    <div className="text-lg font-bold text-slate-900">{pvDetail.conducteur}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Lieu</label>
                    <div className="text-slate-900 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {pvDetail.lieu}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Agent</label>
                    <div className="text-slate-900">{pvDetail.agent}</div>
                    <div className="text-sm text-slate-500">{pvDetail.commissariat}</div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full ${getStatutColor(pvDetail.statutPaiement)}`}>
                  {getStatutIcon(pvDetail.statutPaiement)}
                  {pvDetail.statutPaiement}
                </span>
                {pvDetail.statutPaiement === 'En retard' && pvDetail.joursRetard && (
                  <div className="mt-2">
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-lg text-xs font-bold">
                      En retard de {pvDetail.joursRetard} jours
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Montant à payer</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Amendes</span>
                <span className="text-lg font-bold text-slate-900">{formatNumber(pvDetail.montant)} FCFA</span>
              </div>
              {pvDetail.penalites && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Pénalités</span>
                  <span className="text-lg font-bold text-red-600">+{formatNumber(pvDetail.penalites)} FCFA</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium text-slate-900">Total</span>
                  <span className="text-2xl font-bold text-red-600">{formatNumber(montantTotal)} FCFA</span>
                </div>
              </div>
            </div>
            
            {pvDetail.statutPaiement !== 'Payé' && (
              <div className="mt-6 space-y-2">
                <Button variant="primary" className="w-full">
                  <CreditCard className="w-4 h-4" />
                  Enregistrer paiement
                </Button>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="w-4 h-4" />
                  Envoyer rappel
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Onglets */}
      <div className="mb-6">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8">
            {[
              { id: 'details', label: 'Détails', icon: FileText },
              { id: 'infractions', label: 'Infractions', icon: AlertTriangle },
              { id: 'conducteur', label: 'Conducteur', icon: User },
              { id: 'vehicule', label: 'Véhicule', icon: Car },
              { id: 'historique', label: 'Historique', icon: Clock },
              { id: 'preuves', label: 'Preuves', icon: Camera }
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
              <h3 className="text-lg font-bold text-slate-900 mb-4">Détails de l'Agent</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-600">Nom</label>
                  <div className="text-slate-900 font-medium">{pvDetail.agentDetails.nom}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Grade</label>
                  <div className="text-slate-900 font-medium">{pvDetail.agentDetails.grade}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Matricule</label>
                  <div className="text-slate-900 font-medium font-mono">{pvDetail.agentDetails.matricule}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Commissariat</label>
                  <div className="text-slate-900 font-medium">{pvDetail.agentDetails.commissariat}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Téléphone</label>
                  <div className="text-slate-900 font-medium">{pvDetail.agentDetails.telephone}</div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Localisation</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-600">Lieu</label>
                  <div className="text-slate-900 font-medium">{pvDetail.lieu}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Coordonnées GPS</label>
                  <div className="text-slate-900 font-mono text-sm">
                    <div>Lat: {pvDetail.coordonneesGPS.latitude}</div>
                    <div>Lng: {pvDetail.coordonneesGPS.longitude}</div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Observations</label>
                  <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700">
                    {pvDetail.observations}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {activeTab === 'infractions' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Détails des Infractions</h3>
            <div className="space-y-4">
              {pvDetail.infractionDetails.map((infraction, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">
                          {infraction.code}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getGraviteColor(infraction.gravite)}`}>
                          {infraction.gravite}
                        </span>
                      </div>
                      <h4 className="font-medium text-slate-900 mb-1">{infraction.libelle}</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">{formatNumber(infraction.montant)} FCFA</div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-slate-900">Total des amendes</span>
                  <span className="text-2xl font-bold text-red-600">{formatNumber(pvDetail.montant)} FCFA</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === 'conducteur' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Informations du Conducteur</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Nom complet</label>
                  <div className="text-slate-900 font-medium">
                    {pvDetail.conducteurDetails.prenom} {pvDetail.conducteurDetails.nom}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">CNI</label>
                  <div className="text-slate-900 font-medium font-mono">
                    {pvDetail.conducteurDetails.cni}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Permis de conduire</label>
                  <div className="text-slate-900 font-medium font-mono">
                    {pvDetail.conducteurDetails.permis}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Adresse</label>
                  <div className="text-slate-900">{pvDetail.conducteurDetails.adresse}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Téléphone</label>
                  <div className="flex items-center gap-2 text-slate-900">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {pvDetail.conducteurDetails.telephone}
                  </div>
                </div>
                {pvDetail.conducteurDetails.email && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Email</label>
                    <div className="flex items-center gap-2 text-slate-900">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {pvDetail.conducteurDetails.email}
                    </div>
                  </div>
                )}
                {pvDetail.rappels && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Rappels envoyés</label>
                    <div className="text-orange-600 font-medium">{pvDetail.rappels} rappels</div>
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === 'vehicule' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Informations du Véhicule</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Immatriculation</label>
                  <div className="text-lg font-bold text-slate-900">{pvDetail.vehiculeDetails.immatriculation}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Marque</label>
                  <div className="text-slate-900 font-medium">{pvDetail.vehiculeDetails.marque}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Modèle</label>
                  <div className="text-slate-900 font-medium">{pvDetail.vehiculeDetails.modele}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Année</label>
                  <div className="text-slate-900 font-medium">{pvDetail.vehiculeDetails.annee}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Couleur</label>
                  <div className="text-slate-900 font-medium">{pvDetail.vehiculeDetails.couleur}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Propriétaire</label>
                  <div className="text-slate-900 font-medium">{pvDetail.vehiculeDetails.proprietaire}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Assurance</label>
                  <div className="text-slate-900 font-medium">{pvDetail.vehiculeDetails.assurance}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Validité assurance</label>
                  <div className="flex items-center gap-2 text-green-600">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">{pvDetail.vehiculeDetails.validiteAssurance}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === 'historique' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Historique des Actions</h3>
            <div className="space-y-4">
              {pvDetail.historiquePaiement.map((entry, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">{entry.action}</span>
                      <span className="text-sm text-slate-500">{entry.date}</span>
                    </div>
                    {entry.agent && (
                      <div className="text-sm text-slate-600 mt-1">Par: {entry.agent}</div>
                    )}
                    {entry.montant && (
                      <div className="text-sm font-bold text-red-600 mt-1">
                        {formatNumber(entry.montant)} FCFA
                      </div>
                    )}
                    {entry.mode && (
                      <div className="text-sm text-slate-600 mt-1">Mode: {entry.mode}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === 'preuves' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Preuves et Photos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pvDetail.preuves.map((preuve, index) => (
                <div key={index} className="bg-slate-100 rounded-lg aspect-video flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <Camera className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Preuve {index + 1}</p>
                    <p className="text-xs">{preuve}</p>
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