'use client'

import React, { useState, useEffect, use } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowLeft, Printer, Download, FileText, Calendar, MapPin, User,
  Car, AlertTriangle, CheckCircle, Clock, DollarSign,
  Phone, Mail, AlertCircle, CreditCard, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'
import { infractionsService, type APIInfraction } from '@/lib/api/services'

// Modal d'enregistrement de paiement
function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  amendeNumero,
  montant,
  loading
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: { mode_paiement: string; montant: number; reference?: string; notes?: string }) => void
  amendeNumero: string
  montant: number
  loading: boolean
}) {
  const [modePaiement, setModePaiement] = useState('ESPECES')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm({
      mode_paiement: modePaiement,
      montant: montant,
      reference: reference || undefined,
      notes: notes || undefined
    })
  }

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Enregistrer le paiement</h2>
              <p className="text-slate-600">{amendeNumero}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Montant à payer */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-green-800">Montant à payer</span>
                <span className="text-2xl font-bold text-green-700">{formatNumber(montant)} FCFA</span>
              </div>
            </div>

            {/* Mode de paiement */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mode de paiement <span className="text-red-500">*</span>
              </label>
              <select
                value={modePaiement}
                onChange={(e) => setModePaiement(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="ESPECES">Espèces</option>
                <option value="CARTE_BANCAIRE">Carte bancaire</option>
                <option value="VIREMENT">Virement bancaire</option>
                <option value="CHEQUE">Chèque</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
              </select>
            </div>

            {/* Référence de paiement */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Référence de paiement
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ex: Numéro de transaction, reçu..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Informations complémentaires..."
                rows={2}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              />
            </div>

            {/* Info */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2 text-sm text-blue-700">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Une fois le paiement enregistré, le statut de l'amende passera automatiquement à "Payé".</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50 rounded-b-xl">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Confirmer le paiement
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

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

// Helper to map API status to display status
const mapStatutToAmendeStatus = (statut: string, dateInfraction: string): AmendeStatus => {
  if (statut === 'PAYEE') return 'Payé'

  // Check if the fine is overdue (more than 30 days since infraction)
  const dateEmission = new Date(dateInfraction)
  const now = new Date()
  const daysDiff = Math.floor((now.getTime() - dateEmission.getTime()) / (1000 * 60 * 60 * 24))

  if (daysDiff > 30 && statut !== 'PAYEE') return 'En retard'

  return 'En attente'
}

// Helper to format date
const formatDateFr = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatTimeFr = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Calculate date limite (30 days after emission)
const getDateLimite = (dateEmission: string): string => {
  const date = new Date(dateEmission)
  date.setDate(date.getDate() + 30)
  return formatDateFr(date.toISOString())
}

// Convert API infraction to AmendeDetail
const infractionToAmendeDetail = (infraction: APIInfraction): AmendeDetail => {
  const statut = mapStatutToAmendeStatus(infraction.statut, infraction.date_infraction)

  return {
    id: infraction.id,
    numero: `AMN-${infraction.numero_pv}`,
    pv: infraction.numero_pv,
    dateEmission: formatDateFr(infraction.date_infraction),
    heureEmission: formatTimeFr(infraction.date_infraction),
    dateLimite: getDateLimite(infraction.date_infraction),
    datePaiement: infraction.statut === 'PAYEE' ? formatDateFr(infraction.updated_at) : undefined,
    heurePaiement: infraction.statut === 'PAYEE' ? formatTimeFr(infraction.updated_at) : undefined,
    statut,
    montant: infraction.montant_amende,
    montantTotal: infraction.montant_amende,
    contrevenant: {
      nom: infraction.conducteur?.nom || 'Inconnu',
      prenom: infraction.conducteur?.prenom || '',
      telephone: 'N/A',
      email: 'N/A',
      adresse: 'N/A',
      cni: infraction.conducteur?.numero_permis || 'N/A'
    },
    vehicule: {
      immatriculation: infraction.vehicule?.immatriculation || 'N/A',
      marque: infraction.vehicule?.marque || 'N/A',
      modele: infraction.vehicule?.modele || 'N/A',
      annee: 'N/A',
      couleur: 'N/A',
      typeVehicule: infraction.vehicule?.type_vehicule || 'N/A'
    },
    infraction: {
      type: infraction.type_infraction?.libelle || 'Non spécifié',
      description: infraction.circonstances || infraction.type_infraction?.description || 'Infraction constatée',
      lieu: infraction.lieu_infraction || 'Non spécifié',
      commissariat: infraction.controle?.agent_nom || 'Non spécifié',
      agent: infraction.controle?.agent_nom || 'N/A',
      matriculeAgent: 'N/A'
    },
    pvDetails: {
      numero: infraction.numero_pv,
      date: formatDateFr(infraction.date_infraction),
      heure: formatTimeFr(infraction.date_infraction),
      agent: infraction.controle?.agent_nom || 'N/A',
      gravite: infraction.type_infraction?.categorie || 'Classe 1'
    },
    observations: infraction.circonstances || 'Aucune observation',
    historiquePaiement: [],
    dateProchainRappel: statut === 'En attente' ? getDateLimite(infraction.date_infraction) : undefined
  }
}

export default function AmendeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [activeTab, setActiveTab] = useState('details')
  const [amendeDetail, setAmendeDetail] = useState<AmendeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)

  // Fetch the infraction data
  useEffect(() => {
    const fetchAmende = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await infractionsService.getById(resolvedParams.id)
        if (response.success && response.data) {
          setAmendeDetail(infractionToAmendeDetail(response.data))
        } else {
          setError('Amende non trouvée')
        }
      } catch (err) {
        console.error('Error fetching amende:', err)
        setError('Erreur lors du chargement de l\'amende')
      } finally {
        setLoading(false)
      }
    }

    fetchAmende()
  }, [resolvedParams.id])

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

  // Handle payment
  const handlePaymentConfirm = async (data: { mode_paiement: string; montant: number; reference?: string; notes?: string }) => {
    if (!amendeDetail) return

    setProcessingPayment(true)
    try {
      const response = await infractionsService.recordPayment(amendeDetail.id, data)
      if (response.success && response.data?.success) {
        // Update the local state
        setAmendeDetail(prev => prev ? {
          ...prev,
          statut: 'Payé' as const,
          datePaiement: formatDateFr(new Date().toISOString()),
          heurePaiement: formatTimeFr(new Date().toISOString()),
          modePaiement: data.mode_paiement,
          referenceTransaction: data.reference
        } : null)
        setShowPaymentModal(false)
      } else {
        alert(response.data?.message || 'Erreur lors de l\'enregistrement du paiement')
      }
    } catch (err) {
      console.error('Error recording payment:', err)
      alert('Erreur lors de l\'enregistrement du paiement')
    } finally {
      setProcessingPayment(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-gray-600">Chargement de l'amende...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !amendeDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="bg-red-50 border-red-200">
          <CardBody className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-700 mb-2">{error || 'Amende non trouvée'}</h2>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </CardBody>
        </Card>
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
            onClick={() => router.back()}
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
                    <label className="text-sm font-medium text-slate-600">Agent</label>
                    <div className="text-slate-900">{amendeDetail.infraction.agent}</div>
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
              {amendeDetail.statut !== 'Payé' && (
                <Button
                  variant="primary"
                  size="md"
                  className="w-full mt-4 bg-green-600 hover:bg-green-700"
                  onClick={() => setShowPaymentModal(true)}
                >
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
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
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
                  <label className="text-sm font-medium text-slate-600">CNI / Permis</label>
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
                      <div className="text-slate-900 font-medium">{amendeDetail.modePaiement || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Référence transaction</label>
                      <div className="text-slate-900 font-mono">{amendeDetail.referenceTransaction || 'N/A'}</div>
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
                  <Button
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setShowPaymentModal(true)}
                  >
                    <CreditCard className="w-5 h-5" />
                    Procéder au paiement
                  </Button>
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

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentConfirm}
        amendeNumero={amendeDetail.numero}
        montant={amendeDetail.montantTotal}
        loading={processingPayment}
      />
    </div>
  )
}
