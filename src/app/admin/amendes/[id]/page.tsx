'use client'

import React, { useState } from 'react'
import {
  ArrowLeft, Printer, Download, Edit, FileText, Calendar, MapPin, User,
  Car, AlertTriangle, CheckCircle, XCircle, Clock, DollarSign, Shield,
  Phone, Mail, AlertCircle, Eye, Camera, CreditCard
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'

type AmendeStatus = 'En attente' | 'Payé' | 'En retard'

type AmendeDetail = {
  id: string
  numero: string
  pv: string
  dateEmission: string
  heureEmission: string
  dateLimite: string
  datePaiement?: string
  heurePaiement?: string
  statut: AmendeStatus
  montant: number
  penalites?: number
  montantTotal: number
  modePaiement?: string
  referenceTransaction?: string
  // Informations contrevenant
  contrevenant: {
    nom: string
    prenom: string
    telephone: string
    email: string
    adresse: string
    cni: string
  }
  // Informations véhicule
  vehicule: {
    immatriculation: string
    marque: string
    modele: string
    annee: string
    couleur: string
    typeVehicule: string
  }
  // Informations infraction
  infraction: {
    type: string
    description: string
    lieu: string
    commissariat: string
    agent: string
    matriculeAgent: string
  }
  // Informations PV associé
  pvDetails: {
    numero: string
    date: string
    heure: string
    agent: string
    gravite: string
  }
  observations: string
  historiquePaiement: {
    date: string
    montant: number
    mode: string
    reference: string
    statut: string
  }[]
  dateProchainRappel?: string
}

// Données d'exemple pour l'amende détaillée
const amendeDetail: AmendeDetail = {
  id: '1',
  numero: 'AMN-2025-0892',
  pv: 'PV-2025-0892',
  dateEmission: '25/09/2025',
  heureEmission: '14:30',
  dateLimite: '25/10/2025',
  statut: 'En attente',
  montant: 45000,
  montantTotal: 45000,
  contrevenant: {
    nom: 'TRAORE',
    prenom: 'Moussa',
    telephone: '+225 0708765432',
    email: 'moussa.traore@email.com',
    adresse: 'Cocody Riviera Palmeraie, Rue des Jardins, Villa 89',
    cni: 'CI0098765432'
  },
  vehicule: {
    immatriculation: 'CI-2589-AB',
    marque: 'Peugeot',
    modele: '508',
    annee: '2020',
    couleur: 'Noir',
    typeVehicule: 'Berline'
  },
  infraction: {
    type: 'Excès de vitesse',
    description: 'Circulation à 95 km/h dans une zone limitée à 50 km/h',
    lieu: 'Boulevard Latrille, Cocody',
    commissariat: '16ème Arrondissement - Cocody',
    agent: 'KOUASSI Yao Pierre',
    matriculeAgent: 'AGT-2023-0456'
  },
  pvDetails: {
    numero: 'PV-2025-0892',
    date: '25/09/2025',
    heure: '14:30',
    agent: 'KOUASSI Yao Pierre',
    gravite: 'Classe 2'
  },
  observations: 'Excès de vitesse constaté par radar mobile. Le contrevenant a été informé de ses droits et des modalités de paiement.',
  historiquePaiement: [],
  dateProchainRappel: '10/10/2025'
}

export default function AmendeDetailPage() {
  const [activeTab, setActiveTab] = useState('details')

  // Fonction pour formater les nombres
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const getStatutColor = (statut: AmendeStatus) => {
    switch (statut) {
      case 'Payé':
        return 'bg-green-500 text-white'
      case 'En attente':
        return 'bg-yellow-500 text-white'
      case 'En retard':
        return 'bg-red-500 text-white'
    }
  }

  const getStatutIcon = (statut: AmendeStatus) => {
    switch (statut) {
      case 'Payé':
        return <CheckCircle className="w-4 h-4" />
      case 'En attente':
        return <Clock className="w-4 h-4" />
      case 'En retard':
        return <AlertTriangle className="w-4 h-4" />
    }
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
              Amende {amendeDetail.numero}
            </h1>
            <p className="text-slate-600 mt-1">
              Détails de l'amende du {amendeDetail.dateEmission}
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
                    <label className="text-sm font-medium text-slate-600">N° Amende</label>
                    <div className="text-lg font-bold text-slate-900">{amendeDetail.numero}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">PV Associé</label>
                    <div className="text-lg font-bold text-blue-600">{amendeDetail.pv}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Date d'émission</label>
                    <div className="text-slate-900 flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {amendeDetail.dateEmission} à {amendeDetail.heureEmission}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Date limite</label>
                    <div className={`flex items-center gap-1 font-medium ${amendeDetail.statut === 'En retard' ? 'text-red-600' : 'text-slate-900'}`}>
                      <Clock className="w-4 h-4" />
                      {amendeDetail.dateLimite}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Lieu de l'infraction</label>
                    <div className="text-slate-900 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {amendeDetail.infraction.lieu}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Commissariat</label>
                    <div className="text-slate-900">{amendeDetail.infraction.commissariat}</div>
                  </div>
                </div>
              </div>
              <span className={`inline-flex px-4 py-2 text-sm font-bold rounded-full ${getStatutColor(amendeDetail.statut)}`}>
                {getStatutIcon(amendeDetail.statut)}
                <span className="ml-2">{amendeDetail.statut}</span>
              </span>
            </div>

            {amendeDetail.statut === 'En retard' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <div>
                    <div className="font-bold text-red-900">Amende en retard</div>
                    <div className="text-sm text-red-700">
                      Des pénalités de {formatNumber(amendeDetail.penalites || 0)} FCFA ont été ajoutées
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Montants</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-sm text-slate-600">Montant de base</span>
                <div className="text-lg font-bold text-slate-900">
                  {formatNumber(amendeDetail.montant)} FCFA
                </div>
              </div>
              {amendeDetail.penalites && (
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-sm text-slate-600">Pénalités</span>
                  <div className="text-lg font-bold text-red-600">
                    +{formatNumber(amendeDetail.penalites)} FCFA
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-bold text-slate-900">Total à payer</span>
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(amendeDetail.montantTotal)} FCFA
                </div>
              </div>
              {amendeDetail.statut === 'En attente' && (
                <Button variant="primary" size="md" className="w-full mt-4">
                  <CreditCard className="w-5 h-5" />
                  Procéder au paiement
                </Button>
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
              { id: 'details', label: 'Détails Infraction', icon: AlertCircle },
              { id: 'vehicule', label: 'Véhicule', icon: Car },
              { id: 'contrevenant', label: 'Contrevenant', icon: User },
              { id: 'paiement', label: 'Paiement', icon: DollarSign }
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
              <h3 className="text-lg font-bold text-slate-900 mb-4">Détails de l'Infraction</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Type d'infraction</label>
                  <div className="text-slate-900 font-medium text-lg">{amendeDetail.infraction.type}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Description</label>
                  <div className="text-slate-900">{amendeDetail.infraction.description}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Lieu</label>
                  <div className="text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {amendeDetail.infraction.lieu}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Agent verbalisateur</label>
                  <div className="text-slate-900 font-medium">{amendeDetail.infraction.agent}</div>
                  <div className="text-sm text-slate-500">
                    Matricule: {amendeDetail.infraction.matriculeAgent}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Procès-Verbal</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Numéro PV</label>
                  <div className="text-slate-900 font-bold text-lg">{amendeDetail.pvDetails.numero}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Date & Heure</label>
                  <div className="text-slate-900">
                    {amendeDetail.pvDetails.date} à {amendeDetail.pvDetails.heure}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Gravité</label>
                  <div className="inline-flex px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                    {amendeDetail.pvDetails.gravite}
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <label className="text-sm font-medium text-slate-600">Observations</label>
                  <div className="text-slate-900 text-sm mt-2 bg-slate-50 p-3 rounded-lg">
                    {amendeDetail.observations}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {activeTab === 'vehicule' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Informations du Véhicule</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Immatriculation</label>
                  <div className="text-2xl font-bold text-slate-900 font-mono">
                    {amendeDetail.vehicule.immatriculation}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Marque</label>
                    <div className="text-slate-900 font-medium">{amendeDetail.vehicule.marque}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Modèle</label>
                    <div className="text-slate-900 font-medium">{amendeDetail.vehicule.modele}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Année</label>
                    <div className="text-slate-900 font-medium">{amendeDetail.vehicule.annee}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Couleur</label>
                    <div className="text-slate-900 font-medium">{amendeDetail.vehicule.couleur}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Type</label>
                    <div className="text-slate-900 font-medium">{amendeDetail.vehicule.typeVehicule}</div>
                  </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Nom complet</label>
                  <div className="text-slate-900 font-medium text-lg">
                    {amendeDetail.contrevenant.prenom} {amendeDetail.contrevenant.nom}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">CNI</label>
                  <div className="text-slate-900 font-medium font-mono">
                    {amendeDetail.contrevenant.cni}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Adresse</label>
                  <div className="text-slate-900">{amendeDetail.contrevenant.adresse}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Téléphone</label>
                  <div className="flex items-center gap-2 text-slate-900">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {amendeDetail.contrevenant.telephone}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Email</label>
                  <div className="flex items-center gap-2 text-slate-900">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {amendeDetail.contrevenant.email}
                  </div>
                </div>
                {amendeDetail.dateProchainRappel && amendeDetail.statut === 'En attente' && (
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-900">
                      <Clock className="w-5 h-5" />
                      <div>
                        <div className="font-medium">Prochain rappel prévu</div>
                        <div className="text-sm">{amendeDetail.dateProchainRappel}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === 'paiement' && (
        <div className="space-y-6">
          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Informations de Paiement</h3>
              {amendeDetail.statut === 'Payé' ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <div className="font-bold text-green-900">Paiement effectué</div>
                        <div className="text-sm text-green-700">
                          Le {amendeDetail.datePaiement} à {amendeDetail.heurePaiement}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Mode de paiement</label>
                      <div className="text-slate-900 font-medium">{amendeDetail.modePaiement}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Référence transaction</label>
                      <div className="text-slate-900 font-mono">{amendeDetail.referenceTransaction}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6 text-yellow-600" />
                      <div>
                        <div className="font-bold text-yellow-900">En attente de paiement</div>
                        <div className="text-sm text-yellow-700">
                          Date limite: {amendeDetail.dateLimite}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3">Modes de paiement acceptés</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="border border-slate-200 rounded-lg p-4 text-center">
                        <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                        <div className="font-medium text-slate-900">Mobile Money</div>
                      </div>
                      <div className="border border-slate-200 rounded-lg p-4 text-center">
                        <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
                        <div className="font-medium text-slate-900">Espèces</div>
                      </div>
                      <div className="border border-slate-200 rounded-lg p-4 text-center">
                        <CreditCard className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                        <div className="font-medium text-slate-900">Carte bancaire</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Historique</h3>
              {amendeDetail.historiquePaiement.length > 0 ? (
                <div className="space-y-3">
                  {amendeDetail.historiquePaiement.map((paiement, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-slate-900">{paiement.mode}</div>
                          <div className="text-sm text-slate-500">{paiement.date}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-900">{formatNumber(paiement.montant)} FCFA</div>
                          <div className="text-sm text-slate-500">Réf: {paiement.reference}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>Aucun paiement enregistré</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}