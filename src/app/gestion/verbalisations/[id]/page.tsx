'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useParams } from 'next/navigation'
import {
  ArrowLeft, Printer, Download, FileText, Calendar, MapPin, User,
  Car, AlertTriangle, CheckCircle, Clock, DollarSign, Phone,
  MessageSquare, CreditCard, Shield, Camera, Mail, Loader2, Archive, FolderOpen
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { infractionsService, type APIInfraction } from '@/lib/api/services'

// Modal de confirmation d'archivage
function ArchiveConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  pvNumero,
  loading
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  pvNumero: string
  loading: boolean
}) {
  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Archive className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Archiver le PV</h2>
              <p className="text-slate-600">{pvNumero}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-amber-800 block">Attention</span>
                <p className="text-amber-700 text-sm mt-1">
                  Cette action déplacera le PV vers les archives. Il ne sera plus visible dans la liste des verbalisations actives.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-medium text-slate-900 mb-2">Ce qui va se passer :</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-blue-500" />
                Le PV sera archivé et marqué comme traité
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Vous pourrez le retrouver dans la section Archives
              </li>
              <li className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-amber-500" />
                Le désarchivage sera possible depuis les archives
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Archivage...
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
                Confirmer l'archivage
              </>
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// Modal d'enregistrement de paiement
function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  pvNumero,
  montant,
  loading
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: { mode_paiement: string; montant: number; reference?: string; notes?: string }) => void
  pvNumero: string
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
              <p className="text-slate-600">{pvNumero}</p>
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
                <span>Une fois le paiement enregistré, le statut du PV passera automatiquement à "Payé".</span>
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
    circonstances?: string
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
  statutOriginal: string // Pour savoir si on peut archiver (PAYEE/ANNULEE)
}

// Helper function to map API status to display status
const mapStatutToPaymentStatus = (statut: string): PaymentStatus => {
  switch (statut) {
    case 'PAYEE':
      return 'Payé'
    case 'VALIDEE':
    case 'CONSTATEE':
      return 'Non payé'
    case 'ANNULEE':
    case 'CONTESTEE':
      return 'En retard'
    default:
      return 'Non payé'
  }
}

// Helper to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Helper to format time
const formatTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Helper to determine gravity based on amount
const getGravity = (amount: number): 'Mineur' | 'Moyen' | 'Grave' => {
  if (amount < 30000) return 'Mineur'
  if (amount < 75000) return 'Moyen'
  return 'Grave'
}

// Convert API infraction to PVDetail format
const infractionToPVDetail = (infraction: APIInfraction): PVDetail => {
  const conducteur = infraction.conducteur
  const vehicule = infraction.vehicule
  const controle = infraction.controle
  const typeInfraction = infraction.type_infraction

  return {
    id: infraction.id,
    numero: infraction.numero_pv,
    vehicule: vehicule?.immatriculation || 'N/A',
    conducteur: conducteur ? `${conducteur.nom} ${conducteur.prenom}` : 'Inconnu',
    agent: controle?.agent_nom || 'Non assigné',
    commissariat: 'Commissariat Central',
    lieu: infraction.lieu_infraction || controle?.lieu_controle || 'Non spécifié',
    montant: infraction.montant_amende,
    infractions: 1,
    dateEmission: formatDate(infraction.date_infraction),
    statutPaiement: mapStatutToPaymentStatus(infraction.statut),
    heureEmission: formatTime(infraction.date_infraction),
    conducteurDetails: {
      nom: conducteur?.nom || 'Inconnu',
      prenom: conducteur?.prenom || '',
      telephone: 'Non renseigné',
      adresse: 'Non renseigné',
      cni: 'Non renseigné',
      permis: conducteur?.numero_permis || 'Non renseigné'
    },
    vehiculeDetails: {
      immatriculation: vehicule?.immatriculation || 'N/A',
      marque: vehicule?.marque || 'Non renseigné',
      modele: vehicule?.modele || 'Non renseigné',
      annee: 'Non renseigné',
      couleur: 'Non renseigné',
      proprietaire: conducteur ? `${conducteur.prenom} ${conducteur.nom}` : 'Inconnu',
      assurance: 'Non renseigné',
      validiteAssurance: 'Non renseigné'
    },
    agentDetails: {
      nom: controle?.agent_nom || 'Non assigné',
      matricule: 'Non renseigné',
      grade: 'Agent',
      commissariat: 'Commissariat Central',
      telephone: 'Non renseigné'
    },
    infractionDetails: [{
      code: typeInfraction?.code || 'N/A',
      libelle: typeInfraction?.libelle || 'Non spécifié',
      montant: infraction.montant_amende,
      gravite: getGravity(infraction.montant_amende),
      circonstances: infraction.circonstances
    }],
    coordonneesGPS: {
      latitude: 0,
      longitude: 0
    },
    observations: infraction.circonstances || 'Aucune observation',
    preuves: [],
    historiquePaiement: [
      {
        date: formatDate(infraction.date_infraction),
        action: 'PV émis',
        agent: controle?.agent_nom
      }
    ],
    statutOriginal: infraction.statut
  }
}

export default function PVDetailPage() {
  const params = useParams()
  const pvId = params.id as string

  const [activeTab, setActiveTab] = useState('details')
  const [pvDetail, setPvDetail] = useState<PVDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [archiving, setArchiving] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)

  const fetchInfraction = useCallback(async () => {
    if (!pvId) return

    setLoading(true)
    setError(null)

    try {
      const response = await infractionsService.getById(pvId)

      if (response.success && response.data) {
        const detail = infractionToPVDetail(response.data)
        setPvDetail(detail)
      } else {
        setError('Verbalisation non trouvée')
      }
    } catch (err) {
      console.error('Error fetching infraction:', err)
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }, [pvId])

  useEffect(() => {
    fetchInfraction()
  }, [fetchInfraction])

  // Fonction pour archiver l'infraction
  const handleArchiveConfirm = async () => {
    if (!pvDetail) return

    setArchiving(true)
    try {
      const response = await infractionsService.archive(pvDetail.id)
      if (response.success && response.data?.success) {
        // Mettre à jour le statut local
        setPvDetail(prev => prev ? { ...prev, statutOriginal: 'ARCHIVEE' } : null)
        setShowArchiveModal(false)
      } else {
        alert(response.data?.message || 'Erreur lors de l\'archivage')
      }
    } catch (err) {
      console.error('Error archiving:', err)
      alert('Erreur lors de l\'archivage du PV')
    } finally {
      setArchiving(false)
    }
  }

  // Fonction pour enregistrer le paiement
  const handlePaymentConfirm = async (data: { mode_paiement: string; montant: number; reference?: string; notes?: string }) => {
    if (!pvDetail) return

    setProcessingPayment(true)
    try {
      const response = await infractionsService.recordPayment(pvDetail.id, data)
      if (response.success && response.data?.success) {
        // Mettre à jour le statut local
        setPvDetail(prev => prev ? {
          ...prev,
          statutOriginal: 'PAYEE',
          statutPaiement: 'Payé',
          modePaiement: data.mode_paiement,
          datePaiement: new Date().toLocaleDateString('fr-FR')
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Chargement de la verbalisation...</span>
      </div>
    )
  }

  if (error || !pvDetail) {
    return (
      <div className="min-h-screen">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="secondary"
            size="md"
            className="!p-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Verbalisation</h1>
        </div>
        <Card className="bg-red-50 border-red-200">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertTriangle className="w-6 h-6" />
              <span>{error || 'Verbalisation non trouvée'}</span>
            </div>
          </CardBody>
        </Card>
      </div>
    )
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
          {/* Bouton Archiver - visible uniquement si statut PAYEE ou ANNULEE */}
          {(pvDetail.statutOriginal === 'PAYEE' || pvDetail.statutOriginal === 'ANNULEE') && (
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowArchiveModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Archive className="w-5 h-5" />
              Archiver
            </Button>
          )}
          {/* Indicateur si déjà archivé */}
          {pvDetail.statutOriginal === 'ARCHIVEE' && (
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
              <CheckCircle className="w-5 h-5" />
              Archivé
            </span>
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
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => setShowPaymentModal(true)}
                >
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
                      {infraction.circonstances && (
                        <p className="text-sm text-slate-600">{infraction.circonstances}</p>
                      )}
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
            {pvDetail.preuves.length > 0 ? (
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
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Camera className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p>Aucune preuve jointe à ce PV</p>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Modal de confirmation d'archivage */}
      <ArchiveConfirmModal
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        onConfirm={handleArchiveConfirm}
        pvNumero={pvDetail.numero}
        loading={archiving}
      />

      {/* Modal d'enregistrement de paiement */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentConfirm}
        pvNumero={pvDetail.numero}
        montant={pvDetail.montant}
        loading={processingPayment}
      />
    </div>
  )
}
