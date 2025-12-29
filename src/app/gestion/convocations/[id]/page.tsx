'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Printer, Download, FileText, Calendar, MapPin, User,
  CheckCircle, Clock, Phone, MessageSquare, Bell,
  Mail, Shield, Flag, Loader2,
  XCircle, Repeat, StickyNote, Ban, Send, AlertCircle,
  Briefcase, Home, Users, Scale, FileCheck, AlertTriangle,
  Building2, UserCheck, Languages, Gavel, ClipboardList
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Checkbox } from '@/components/ui/Checkbox'
import { useConvocationDetail } from '@/hooks/convocations/useConvocationDetail'
import pvService from '@/services/pv.service'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ModalCreationPV } from '@/components/pv/ModalCreationPV'

// Composant Helper pour afficher conditionnellement un champ
const InfoField = ({ label, value, icon: Icon }: { label: string; value: any; icon?: any }) => {
  if (!value) return null
  
  return (
    <div>
      <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </label>
      <div className="text-slate-900 font-medium mt-1">{value}</div>
    </div>
  )
}

// MODALS (identiques à avant mais avec les bons noms de propriétés)

const ModalAnnuler = ({
  isOpen,
  onClose,
  onAnnuler
}: {
  isOpen: boolean;
  onClose: () => void;
  onAnnuler: (motif: string) => Promise<void>;
}) => {
  const [motif, setMotif] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!motif.trim()) return
    setLoading(true)
    try {
      await onAnnuler(motif)
      onClose()
      setMotif('')
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle className="flex items-center gap-2">
          <Ban className="w-5 h-5 text-red-600" />
          Annuler la convocation
        </ModalTitle>
        <ModalClose />
      </ModalHeader>
      <ModalBody>
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
          <p className="text-sm text-red-800">
            <strong>Attention :</strong> Cette action est irréversible. La convocation sera définitivement annulée.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-slate-700">
            Motif d'annulation <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Expliquez la raison de l'annulation..."
            rows={4}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          onClick={onClose}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800"
        >
          Fermer
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || !motif.trim()}
          className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
          Annuler définitivement
        </Button>
      </ModalFooter>
    </Modal>
  )
}

const ModalReporter = ({
  isOpen,
  onClose,
  onReporter,
  convocation
}: {
  isOpen: boolean;
  onClose: () => void;
  onReporter: (nouvelleDate: string, nouvelleHeure: string, motif: string) => Promise<void>;
  convocation: any;
}) => {
  const [nouvelleDate, setNouvelleDate] = useState('')
  const [nouvelleHeure, setNouvelleHeure] = useState('')
  const [motif, setMotif] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!nouvelleDate || !nouvelleHeure || !motif.trim()) return
    setLoading(true)
    try {
      await onReporter(nouvelleDate, nouvelleHeure, motif)
      onClose()
      setNouvelleDate('')
      setNouvelleHeure('')
      setMotif('')
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle className="flex items-center gap-2">
          <Repeat className="w-5 h-5 text-orange-600" />
          Reporter le rendez-vous
        </ModalTitle>
        <ModalClose />
      </ModalHeader>
      <ModalBody>
        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
          <p className="text-sm text-blue-800">
            <strong>RDV actuel :</strong> {convocation?.dateRdv ? format(new Date(convocation.dateRdv), 'dd/MM/yyyy', { locale: fr }) : '—'} à {convocation?.heureRdv || '—'}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">
              Nouvelle date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={nouvelleDate}
              onChange={(e) => setNouvelleDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">
              Nouvelle heure <span className="text-red-500">*</span>
            </label>
            <Input
              type="time"
              value={nouvelleHeure}
              onChange={(e) => setNouvelleHeure(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">
              Motif du report <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Expliquez la raison du report..."
              rows={3}
            />
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          onClick={onClose}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800"
        >
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || !nouvelleDate || !nouvelleHeure || !motif.trim()}
          className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Repeat className="w-4 h-4" />}
          Reporter
        </Button>
      </ModalFooter>
    </Modal>
  )
}

const ModalNonHonore = ({
  isOpen,
  onClose,
  onMarquer,
  convocation
}: {
  isOpen: boolean;
  onClose: () => void;
  onMarquer: (motif: string, commentaire?: string) => Promise<void>;
  convocation: any;
}) => {
  const [motif, setMotif] = useState('')
  const [commentaire, setCommentaire] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!motif) return
    setLoading(true)
    try {
      await onMarquer(motif, commentaire)
      onClose()
      setMotif('')
      setCommentaire('')
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle className="flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-600" />
          Marquer comme "Non honoré"
        </ModalTitle>
        <ModalClose />
      </ModalHeader>
      <ModalBody>
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
          <p className="text-sm text-red-800">
            Le convoqué <strong>{convocation?.convoquePrenom} {convocation?.convoqueNom}</strong> ne s'est pas présenté au rendez-vous.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">
              Motif <span className="text-red-500">*</span>
            </label>
            <select
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Sélectionner un motif</option>
              <option value="absence_injustifiee">Absence injustifiée</option>
              <option value="absence_justifiee">Absence justifiée</option>
              <option value="retard_excessif">Retard excessif</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">
              Commentaire additionnel (optionnel)
            </label>
            <Textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Détails supplémentaires..."
              rows={3}
            />
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          onClick={onClose}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800"
        >
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || !motif}
          className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
          Confirmer
        </Button>
      </ModalFooter>
    </Modal>
  )
}

const ModalAjouterNote = ({
  isOpen,
  onClose,
  onAjouter
}: {
  isOpen: boolean;
  onClose: () => void;
  onAjouter: (note: string) => Promise<void>;
}) => {
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!note.trim()) return
    setLoading(true)
    try {
      await onAjouter(note)
      onClose()
      setNote('')
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle className="flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-blue-600" />
          Ajouter une note
        </ModalTitle>
        <ModalClose />
      </ModalHeader>
      <ModalBody>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-slate-700">
            Note / Observation <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ajoutez une note ou observation sur cette convocation..."
            rows={5}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          onClick={onClose}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800"
        >
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || !note.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <StickyNote className="w-4 h-4" />}
          Ajouter
        </Button>
      </ModalFooter>
    </Modal>
  )
}

const ModalNotifier = ({
  isOpen,
  onClose,
  onNotifier
}: {
  isOpen: boolean;
  onClose: () => void;
  onNotifier: (moyens: string[], message?: string) => Promise<void>;
}) => {
  const [moyensSelectionnes, setMoyensSelectionnes] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleMoyen = (moyen: string) => {
    setMoyensSelectionnes(prev =>
      prev.includes(moyen)
        ? prev.filter(m => m !== moyen)
        : [...prev, moyen]
    )
  }

  const handleSubmit = async () => {
    if (moyensSelectionnes.length === 0) return
    setLoading(true)
    try {
      await onNotifier(moyensSelectionnes, message)
      onClose()
      setMoyensSelectionnes([])
      setMessage('')
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setLoading(false)
    }
  }

  const options = [
    { id: 'SMS', label: 'SMS', icon: MessageSquare },
    { id: 'Email', label: 'Email', icon: Mail },
    { id: 'Appel', label: 'Appel téléphonique', icon: Phone },
    { id: 'Courrier', label: 'Courrier', icon: FileText }
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          Notifier le convoqué
        </ModalTitle>
        <ModalClose />
      </ModalHeader>
      <ModalBody>
        <div className="mb-4">
          <p className="text-sm text-slate-600 mb-4">Sélectionnez un ou plusieurs moyens :</p>
          <div className="space-y-3">
            {options.map(({ id, label, icon: Icon }) => (
              <label key={id} className="flex items-center space-x-3 cursor-pointer">
                <Checkbox
                  checked={moyensSelectionnes.includes(id)}
                  onCheckedChange={() => toggleMoyen(id)}
                />
                <Icon className="w-5 h-5 text-slate-600" />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Message personnalisé (optionnel)</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ajoutez un message personnalisé..."
            rows={3}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          onClick={onClose}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800"
        >
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || moyensSelectionnes.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Envoyer
        </Button>
      </ModalFooter>
    </Modal>
  )
}

const ModalConfirmer = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  convocation 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => Promise<void>; 
  convocation: any;
}) => {
  const [loading, setLoading] = useState(false)
  
  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Confirmer la présence
        </ModalTitle>
        <ModalClose />
      </ModalHeader>
      <ModalBody>
        <p className="text-slate-600">
          Confirmer que <strong>{convocation?.convoquePrenom} {convocation?.convoqueNom}</strong> honorera la convocation ?
        </p>
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800">
          Annuler
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          Confirmer
        </Button>
      </ModalFooter>
    </Modal>
  )
}

const ModalMarquerHonore = ({
  isOpen,
  onClose,
  onMarquer,
  convocation
}: {
  isOpen: boolean;
  onClose: () => void;
  onMarquer: (commentaire?: string) => Promise<void>;
  convocation: any;
}) => {
  const [commentaire, setCommentaire] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await onMarquer(commentaire)
      onClose()
      setCommentaire('')
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Marquer comme "Honoré" - Audition réalisée
        </ModalTitle>
        <ModalClose />
      </ModalHeader>
      <ModalBody>
        <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
          <p className="text-sm text-green-800">
            Le convoqué <strong>{convocation?.convoquePrenom} {convocation?.convoqueNom}</strong> s'est présenté et l'audition a été réalisée.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-slate-700">
            Commentaire / Observations (optionnel)
          </label>
          <Textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Ajoutez des observations sur l'audition..."
            rows={4}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          onClick={onClose}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800"
        >
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          Valider l'audition
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default function ConvocationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  // Hook personnalisé pour gérer l'état et les actions
  const {
    convocation,
    loading,
    error,
    confirmerPresence,
    marquerHonore,
    marquerNonHonore,
    annuler,
    reporter,
    notifier,
    ajouterNote,
    downloadPDF,
    print,
  } = useConvocationDetail(id)

  const [activeTab, setActiveTab] = useState('informations')
  const [pvExistant, setPVExistant] = useState<any>(null)
  const [loadingPV, setLoadingPV] = useState(false)
  
  const [modalConfirmer, setModalConfirmer] = useState(false)
  const [modalMarquerHonore, setModalMarquerHonore] = useState(false)
  const [modalNotifier, setModalNotifier] = useState(false)
  const [modalAnnuler, setModalAnnuler] = useState(false)
  const [modalReporter, setModalReporter] = useState(false)
  const [modalNonHonore, setModalNonHonore] = useState(false)
  const [modalAjouterNote, setModalAjouterNote] = useState(false)
  const [modalCreerPV, setModalCreerPV] = useState(false)

  // Vérifier si un PV existe pour cette convocation
  useEffect(() => {
    const checkPVExistant = async () => {
      if (convocation && isHonore) {
        setLoadingPV(true)
        try {
          const pv = await pvService.getByConvocation(id)
          setPVExistant(pv)
        } catch (error) {
          // Pas de PV trouvé, c'est normal
          setPVExistant(null)
        } finally {
          setLoadingPV(false)
        }
      }
    }
    checkPVExistant()
  }, [convocation, id, isHonore])

  // Handler pour créer le PV
  const handleCreerPV = () => {
    setModalCreerPV(true)
  }

  // Handlers pour les modals
  const handleConfirmPresence = async () => {
    await confirmerPresence()
  }

  const handleNotifier = async (moyens: string[], message?: string) => {
    await notifier(moyens, message)
  }

  const handleAnnuler = async (motif: string) => {
    await annuler(motif)
  }

  const handleReporter = async (nouvelleDate: string, nouvelleHeure: string, motif: string) => {
    await reporter({ nouvelleDate, nouvelleHeure, motif })
  }

  const handleMarquerHonore = async (commentaire?: string) => {
    await marquerHonore(commentaire)
  }

  const handleNonHonore = async (motif: string, commentaire?: string) => {
    await marquerNonHonore(motif, commentaire)
  }

  const handleAjouterNote = async (note: string) => {
    await ajouterNote(note)
  }

  const handlePrint = async () => {
    await print()
  }

  const handleDownloadPDF = async () => {
    await downloadPDF()
  }

  const getStatutColor = (statut: string) => {
    const s = statut?.toUpperCase()
    switch (s) {
      case 'CRÉATION':
      case 'ENVOYÉ': 
      case 'ENVOYÉE': return 'bg-blue-500 text-white'
      case 'HONORÉ':
      case 'HONORÉE': return 'bg-green-500 text-white'
      case 'EN ATTENTE': return 'bg-orange-500 text-white'
      case 'CONFIRMÉ':
      case 'CONFIRMÉE': return 'bg-cyan-500 text-white'
      case 'NON HONORÉ': 
      case 'NON HONORÉE':
      case 'NON_HONORÉ': 
      case 'NON_HONORÉE': return 'bg-red-500 text-white'
      case 'ANNULÉ':
      case 'ANNULÉE': return 'bg-gray-500 text-white'
      default: return 'bg-gray-400 text-white'
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr })
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: fr })
    } catch {
      return dateString
    }
  }

  const renderProgressSteps = () => {
    // Logique identique au hook useConvocations
    let etapeProgression = 1;
    let etapeActuelle: 'CREATION' | 'NOTIFICATION' | 'CONFIRMATION' | 'AUDITION_REALISEE' = 'CREATION';
    let tempsEcoule = 'Étape 1/4 - Création';
    
    const statut = (convocation.statut || '').toUpperCase();
    const rdvProgramme = convocation.dateRdv ? new Date(convocation.dateRdv) : null;
    const dateCreation = convocation.createdAt ? new Date(convocation.createdAt) : null;
    const dateEnvoi = convocation.dateEnvoi ? new Date(convocation.dateEnvoi) : null;
    
    // Fonction pour calculer le temps écoulé
    const calculateTimeElapsed = (date: Date | null) => {
      if (!date) return null;
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
      } else if (diffHours > 0) {
        return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
      } else if (diffMins > 0) {
        return `il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
      } else {
        return "il y a quelques secondes";
      }
    };
    
    switch (statut) {
      case 'ENVOYÉ':
      case 'ENVOYEE':
        etapeProgression = 2;
        etapeActuelle = 'NOTIFICATION';
        tempsEcoule = 'Étape 2/4 - Notification envoyée';
        break;
      
      case 'EN ATTENTE':
      case 'CONFIRMÉ':
      case 'CONFIRMEE':
        etapeProgression = 3;
        etapeActuelle = 'CONFIRMATION';
        
        if (rdvProgramme) {
          const diffTime = rdvProgramme.getTime() - Date.now();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          tempsEcoule = diffDays > 0
            ? `Étape 3/4 - RDV dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`
            : `Étape 3/4 - RDV aujourd'hui`;
        } else {
          tempsEcoule = 'Étape 3/4 - En attente de confirmation';
        }
        break;
      
      case 'HONORÉ':
      case 'HONOREE':
        etapeProgression = 4;
        etapeActuelle = 'AUDITION_REALISEE';
        tempsEcoule = 'Étape 4/4 - Audition réalisée';
        break;
      
      default:
        etapeProgression = 1;
        etapeActuelle = 'CREATION';
        tempsEcoule = 'Étape 1/4 - Création';
    }

    const steps = [
      { 
        id: 1, 
        label: 'Création', 
        key: 'CREATION',
        completed: etapeProgression > 1,
        current: etapeActuelle === 'CREATION',
        timeElapsed: dateCreation ? calculateTimeElapsed(dateCreation) : null
      },
      { 
        id: 2, 
        label: 'Notification', 
        key: 'NOTIFICATION',
        completed: etapeProgression > 2,
        current: etapeActuelle === 'NOTIFICATION',
        timeElapsed: dateEnvoi ? calculateTimeElapsed(dateEnvoi) : null
      },
      { 
        id: 3, 
        label: 'Confirmation', 
        key: 'CONFIRMATION',
        completed: etapeProgression > 3,
        current: etapeActuelle === 'CONFIRMATION',
        timeElapsed: rdvProgramme && etapeProgression >= 3 ? (() => {
          const diffTime = rdvProgramme.getTime() - Date.now();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays > 0 ? `dans ${diffDays} jour${diffDays > 1 ? 's' : ''}` : "aujourd'hui";
        })() : null
      },
      { 
        id: 4, 
        label: 'Audition', 
        key: 'AUDITION_REALISEE',
        completed: etapeActuelle === 'AUDITION_REALISEE',
        current: etapeActuelle === 'AUDITION_REALISEE',
        timeElapsed: convocation.dateHonoration ? calculateTimeElapsed(new Date(convocation.dateHonoration)) : null
      },
    ]

    return (
      <div>
        {/* Badge temps écoulé */}
        <div className="mb-4 flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            <Clock className="w-4 h-4" />
            {tempsEcoule}
          </div>
        </div>
        
        {/* Barre de progression */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg mb-2 ${
                  step.completed 
                    ? 'bg-green-500 text-white' 
                    : step.current
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {step.completed ? <CheckCircle className="w-8 h-8" /> : step.id}
                </div>
                <div className="text-center">
                  <div className="font-semibold text-sm">{step.label}</div>
                  <div className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                    step.completed
                      ? 'bg-green-100 text-green-800'
                      : step.current
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.completed ? 'TERMINÉ' : step.current ? 'EN COURS' : 'À VENIR'}
                  </div>
                  {/* Affichage du temps écoulé pour chaque étape */}
                  {step.timeElapsed && (step.completed || step.current) && (
                    <div className="text-xs text-slate-500 mt-1 font-medium">
                      {step.timeElapsed}
                    </div>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-1 flex-1 ${
                  step.completed ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Chargement de la convocation...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !convocation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardBody className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Erreur</h2>
            <p className="text-slate-600 mb-4">
              {error || 'Impossible de charger la convocation'}
            </p>
            <Button 
              onClick={() => router.push('/gestion/convocations')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Retour à la liste
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  // Désactiver certaines actions selon le statut
  const isAnnule = convocation.statut?.toUpperCase().includes('ANNUL')
  const isHonore = convocation.statut?.toUpperCase().includes('HONOR')

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            className="p-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg flex items-center justify-center cursor-pointer"
            onClick={() => router.push('/gestion/convocations')}
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
              Convocation {convocation.numero}
            </h1>
            <p className="text-slate-600 mt-1">
              {convocation.typeConvocation} - {convocation.convoquePrenom} {convocation.convoqueNom}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handlePrint}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 flex items-center gap-2"
          >
            <Printer className="w-5 h-5" />
            <span className="hidden sm:inline">Imprimer</span>
          </Button>
          <Button 
            onClick={handleDownloadPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Exporter PDF</span>
          </Button>
        </div>
      </div>

      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardBody className="p-6">
          {renderProgressSteps()}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardBody className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Informations de la Convocation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-600">Numéro de convocation</label>
                <div className="text-lg font-bold text-slate-900">{convocation.numero}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Type</label>
                <div className="text-lg font-bold text-slate-900">{convocation.typeConvocation}</div>
              </div>
              
              {/* NOUVEAUX CHAMPS CONDITIONNELS */}
              {convocation.sousType && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Sous-type</label>
                  <div className="text-slate-900 font-medium">{convocation.sousType}</div>
                </div>
              )}
              
              {convocation.urgence && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Urgence</label>
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${
                    convocation.urgence === 'TRES_URGENT' ? 'bg-red-100 text-red-800' :
                    convocation.urgence === 'URGENT' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {convocation.urgence.replace('_', ' ')}
                  </div>
                </div>
              )}
              
              {convocation.priorite && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Priorité</label>
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${
                    convocation.priorite === 'CRITIQUE' ? 'bg-red-100 text-red-800' :
                    convocation.priorite === 'HAUTE' ? 'bg-orange-100 text-orange-800' :
                    convocation.priorite === 'MOYENNE' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {convocation.priorite}
                  </div>
                </div>
              )}
              
              {convocation.confidentialite && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Confidentialité</label>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-bold">
                    <Shield className="w-4 h-4" />
                    {convocation.confidentialite.replace('_', ' ')}
                  </div>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-slate-600">Convoqué</label>
                <div className="font-bold text-slate-900">{convocation.convoquePrenom} {convocation.convoqueNom}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Agent assigné</label>
                <div className="font-bold text-slate-900">{convocation.agent?.prenom} {convocation.agent?.nom}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Commissariat</label>
                <div className="font-bold text-blue-600">{convocation.commissariat?.nom}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">RDV programmé</label>
                <div className="font-bold text-slate-900">{formatDate(convocation.dateRdv)} à {convocation.heureRdv}</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600">Statut:</span>
                <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full ${getStatutColor(convocation.statut)}`}>
                  {convocation.statut}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Actions Disponibles</h3>
            <div className="space-y-3">
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setModalConfirmer(true)}
                disabled={isAnnule || isHonore}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirmer la présence</span>
              </Button>
              
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setModalMarquerHonore(true)}
                disabled={isAnnule || isHonore}
              >
                <UserCheck className="w-4 h-4" />
                <span>Marquer "Honoré" - Audition réalisée</span>
              </Button>
              
              <Button 
                className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setModalNonHonore(true)}
                disabled={isAnnule || isHonore}
              >
                <XCircle className="w-4 h-4" />
                <span>Marquer "Non honoré"</span>
              </Button>
              
              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setModalReporter(true)}
                disabled={isAnnule || isHonore}
              >
                <Repeat className="w-4 h-4" />
                <span>Reporter le RDV</span>
              </Button>
              
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setModalNotifier(true)}
                disabled={isAnnule}
              >
                <Bell className="w-4 h-4" />
                <span>Notifier</span>
              </Button>
              
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2"
                onClick={() => setModalAjouterNote(true)}
              >
                <StickyNote className="w-4 h-4" />
                <span>Ajouter une note</span>
              </Button>
              
              <Button 
                className="w-full bg-gray-800 hover:bg-gray-900 text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setModalAnnuler(true)}
                disabled={isAnnule || isHonore}
              >
                <Ban className="w-4 h-4" />
                <span>Annuler la convocation</span>
              </Button>
              
              <div className="pt-3 border-t border-slate-200">
                <Button 
                  onClick={() => router.push('/gestion/convocations')} 
                  className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Retour à la Liste</span>
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mb-6">
        <div className="border-b border-slate-200 bg-white rounded-t-lg">
          <nav className="flex space-x-2 overflow-x-auto px-4">
            {[
              { id: 'informations', label: 'Motif & Objet', icon: FileText },
              { id: 'affaire', label: 'Affaire Liée', icon: Gavel },
              { id: 'convoque', label: 'Personne Convoquée', icon: User },
              { id: 'rdv', label: 'Rendez-vous', icon: Calendar },
              { id: 'personnes', label: 'Personnes Présentes', icon: Users },
              { id: 'pv', label: 'Procès-Verbal', icon: ClipboardList, visible: isHonore },
              { id: 'historique', label: 'Historique', icon: Clock }
            ].filter(tab => tab.visible !== false).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
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

      {activeTab === 'informations' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Motif et Objet
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Motif de la convocation</label>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-slate-700 leading-relaxed mt-2">
                  {convocation.motif || 'Aucun motif spécifié'}
                </div>
              </div>
              
              {convocation.objetPrecis && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Objet précis</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700 leading-relaxed mt-2">
                    {convocation.objetPrecis}
                  </div>
                </div>
              )}
              
              {convocation.questionsPreparatoires && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Questions préparatoires</label>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm text-slate-700 leading-relaxed mt-2">
                    {convocation.questionsPreparatoires}
                  </div>
                </div>
              )}
              
              {convocation.piecesAApporter && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Pièces à apporter</label>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-slate-700 leading-relaxed mt-2">
                    {convocation.piecesAApporter}
                  </div>
                </div>
              )}
              
              {convocation.documentsDemandes && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Documents demandés</label>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-slate-700 leading-relaxed mt-2">
                    {convocation.documentsDemandes}
                  </div>
                </div>
              )}
              
              {convocation.observations && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Observations</label>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-slate-700 leading-relaxed mt-2">
                    {convocation.observations}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                <Card className="shadow-sm">
                  <CardBody className="p-4">
                    <h4 className="text-md font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      Agent Responsable
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-medium text-slate-600">Nom</label>
                        <div className="text-slate-900 font-medium">{convocation.agent?.prenom} {convocation.agent?.nom}</div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600">Matricule</label>
                        <div className="text-slate-900 font-medium font-mono">{convocation.agent?.matricule || '—'}</div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card className="shadow-sm">
                  <CardBody className="p-4">
                    <h4 className="text-md font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <Flag className="w-4 h-4 text-blue-600" />
                      Commissariat
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-medium text-slate-600">Nom</label>
                        <div className="text-slate-900 font-medium">{convocation.commissariat?.nom || '—'}</div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600">Code</label>
                        <div className="text-slate-900 font-medium font-mono">{convocation.commissariat?.code || '—'}</div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === 'affaire' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Gavel className="w-5 h-5 text-blue-600" />
              Affaire Liée
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InfoField label="Numéro d'affaire" value={convocation.affaireNumero} icon={FileCheck} />
              <InfoField label="Type d'affaire" value={convocation.affaireType} />
              <InfoField label="Titre de l'affaire" value={convocation.affaireTitre} />
              <InfoField label="Section judiciaire" value={convocation.sectionJudiciaire} icon={Scale} />
              <InfoField label="Infraction" value={convocation.infraction} icon={AlertTriangle} />
              <InfoField label="Qualification légale" value={convocation.qualificationLegale} />
            </div>
            
            {!convocation.affaireNumero && !convocation.affaireType && (
              <p className="text-center text-slate-500 py-8">Aucune affaire liée</p>
            )}
          </CardBody>
        </Card>
      )}

      {activeTab === 'convoque' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Informations du Convoqué
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Nom complet</label>
                  <div className="text-slate-900 font-medium text-lg">
                    {convocation.convoquePrenom} {convocation.convoqueNom}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Qualité</label>
                  <div className="inline-flex px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                    {convocation.qualiteConvoque}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Adresse</label>
                  <div className="text-slate-900">{convocation.convoqueAdresse || '—'}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Téléphone</label>
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {convocation.convoqueTelephone || '—'}
                  </div>
                </div>
                {convocation.convoqueEmail && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Email</label>
                    <div className="flex items-center gap-2 text-slate-900 font-medium">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {convocation.convoqueEmail}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === 'rdv' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Détails du Rendez-vous
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Date du RDV</label>
                  <div className="text-slate-900 font-medium text-lg">{formatDate(convocation.dateRdv)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Heure</label>
                  <div className="text-slate-900 font-medium text-lg">{convocation.heureRdv || '—'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Mode d'envoi</label>
                  <div className="text-slate-900 font-medium">{convocation.modeEnvoi || '—'}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Lieu</label>
                  <div className="text-slate-900 font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {convocation.lieuRdv || '—'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Date de création</label>
                  <div className="text-slate-900 font-medium">{formatDateTime(convocation.dateCreation)}</div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === 'pv' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-purple-600" />
              Procès-Verbal d'Audition
            </h3>
            
            {loadingPV ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
                  <p className="text-slate-600">Chargement du procès-verbal...</p>
                </div>
              </div>
            ) : pvExistant ? (
              <div className="space-y-6">
                {/* En-tête du PV */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-purple-900">{pvExistant.numero}</h4>
                      <p className="text-sm text-purple-700">Procès-Verbal d'Audition</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                      pvExistant.statut === 'CLOTURE' ? 'bg-green-100 text-green-800' :
                      pvExistant.statut === 'VALIDE' ? 'bg-blue-100 text-blue-800' :
                      pvExistant.statut === 'EN_RELECTURE' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {pvExistant.statut}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-purple-700 font-medium">Date audition:</span>
                      <span className="ml-2 text-purple-900">{formatDate(pvExistant.dateAudition)}</span>
                    </div>
                    <div>
                      <span className="text-purple-700 font-medium">Durée:</span>
                      <span className="ml-2 text-purple-900">{pvExistant.heureDebut} - {pvExistant.heureFin}</span>
                    </div>
                  </div>
                </div>

                {/* Contenu du PV */}
                <div className="space-y-6">
                  {/* Objet */}
                  <div>
                    <h5 className="text-md font-bold text-slate-900 mb-2">Objet de l'audition</h5>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <p className="text-slate-700 whitespace-pre-wrap">{pvExistant.objet}</p>
                    </div>
                  </div>

                  {/* Déroulement */}
                  {pvExistant.deroulement && (
                    <div>
                      <h5 className="text-md font-bold text-slate-900 mb-2">Déroulement de l'audition</h5>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <p className="text-slate-700 whitespace-pre-wrap">{pvExistant.deroulement}</p>
                      </div>
                    </div>
                  )}

                  {/* Questions/Réponses */}
                  {pvExistant.questionsReponses && pvExistant.questionsReponses.length > 0 && (
                    <div>
                      <h5 className="text-md font-bold text-slate-900 mb-2">Questions et Réponses</h5>
                      <div className="space-y-3">
                        {pvExistant.questionsReponses.map((qr: any, index: number) => (
                          <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <span className="text-xs font-bold text-blue-600 mt-1">{qr.heure}</span>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900 mb-1">
                                  Q: {qr.question}
                                </p>
                                <p className="text-sm text-slate-700">
                                  R: {qr.reponse}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Synthèse */}
                  {pvExistant.synthese && (
                    <div>
                      <h5 className="text-md font-bold text-slate-900 mb-2">Synthèse</h5>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-slate-700 whitespace-pre-wrap">{pvExistant.synthese}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions sur le PV */}
                <div className="flex gap-3 pt-6 border-t">
                  <Button 
                    onClick={() => {/* Télécharger PDF */}}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger PDF
                  </Button>
                  <Button 
                    onClick={() => {/* Imprimer */}}
                    className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimer
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <ClipboardList className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-slate-900 mb-2">Aucun procès-verbal</h4>
                <p className="text-slate-600 mb-6">
                  L'audition a été réalisée mais aucun procès-verbal n'a encore été rédigé.
                </p>
                <Button 
                  onClick={handleCreerPV}
                  className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 mx-auto"
                >
                  <ClipboardList className="w-4 h-4" />
                  Créer le Procès-Verbal
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {activeTab === 'historique' && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Historique des Actions
            </h3>
            <div className="space-y-4">
              {convocation.historique && convocation.historique.length > 0 ? (
                [...convocation.historique].reverse().map((entry: any, index: number) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">{entry.action}</span>
                        <span className="text-sm text-slate-500">{entry.date}</span>
                      </div>
                      {entry.agent && (
                        <div className="text-sm text-slate-600 mb-1">
                          <span className="font-medium">Agent:</span> {entry.agent}
                        </div>
                      )}
                      {entry.details && (
                        <div className="text-sm text-slate-600 mt-2 bg-white p-2 rounded border border-blue-100">
                          {entry.details}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500">Aucun historique disponible</p>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Modals */}
      <ModalConfirmer
        isOpen={modalConfirmer}
        onClose={() => setModalConfirmer(false)}
        onConfirm={handleConfirmPresence}
        convocation={convocation}
      />
      <ModalMarquerHonore
        isOpen={modalMarquerHonore}
        onClose={() => setModalMarquerHonore(false)}
        onMarquer={handleMarquerHonore}
        convocation={convocation}
      />
      <ModalNotifier
        isOpen={modalNotifier}
        onClose={() => setModalNotifier(false)}
        onNotifier={handleNotifier}
      />
      <ModalAnnuler
        isOpen={modalAnnuler}
        onClose={() => setModalAnnuler(false)}
        onAnnuler={handleAnnuler}
      />
      <ModalReporter
        isOpen={modalReporter}
        onClose={() => setModalReporter(false)}
        onReporter={handleReporter}
        convocation={convocation}
      />
      <ModalNonHonore
        isOpen={modalNonHonore}
        onClose={() => setModalNonHonore(false)}
        onMarquer={handleNonHonore}
        convocation={convocation}
      />
      <ModalAjouterNote
        isOpen={modalAjouterNote}
        onClose={() => setModalAjouterNote(false)}
        onAjouter={handleAjouterNote}
      />
      <ModalCreationPV
        isOpen={modalCreerPV}
        onClose={() => setModalCreerPV(false)}
        convocation={convocation}
      />
    </div>
  )
}
