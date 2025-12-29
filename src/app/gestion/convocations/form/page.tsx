'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Save, User, Calendar, FileText, Bell, Phone, Mail, Loader2, 
  CheckCircle, AlertCircle, MapPin, Briefcase, Shield, Clock, Building,
  FileWarning, Users, Hash, AlertTriangle, Globe, ClipboardList,
  MessageSquare, Award, Eye, Ear, Fingerprint, Camera, Car, Banknote,
  Home, PhoneCall, Mailbox, Smartphone, UserCheck, ShieldAlert,
  Scale, Gavel, BookOpen, CalendarDays, Users2, Target, Search,
  Mic, Video, Lock, Unlock, ShieldCheck, FileCheck, Download,
  Printer, Send, UserPlus, UserMinus, Clock3, CalendarClock,
  IdCard // <-- AJOUTÉ ICI
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Checkbox } from '@/components/ui/Checkbox'
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/axios'
import Swal from 'sweetalert2'

interface ConvocationPFormProps {
  isOpen?: boolean
  onClose?: () => void
  onSubmit?: (data: any) => void
  existingData?: any // Pour l'édition
}

export default function FomConvocationPage({ 
  isOpen, 
  onClose, 
  onSubmit, 
  existingData 
}: ConvocationPFormProps = {}) {
  const router = useRouter()
  const { user } = useAuth()
  const isModalMode = isOpen !== undefined
  const isEditMode = !!existingData
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    // SECTION 1: INFORMATIONS GÉNÉRALES
    reference: "",
    type: '',
    sousType: '',
    urgence: 'NORMALE',
    priorite: 'MOYENNE',
    confidentialite: 'STANDARD',
    
    // SECTION 2: AFFAIRE LIÉE
    affaireId: '',
    affaireType: '',
    affaireNumero: '',
    affaireTitre: '',
    sectionJudiciaire: '',
    infraction: '',
    qualificationLegale: '',
    
    // SECTION 3: PERSONNE CONVOQUÉE
    statutPersonne: 'TEMOIN',
    nom: '',
    prenom: '',
    dateNaissance: '',
    lieuNaissance: '',
    nationalite: '',
    profession: '',
    situationFamiliale: '',
    nombreEnfants: '',
    
    // Documents d'identité
    typePiece: 'CNI',
    numeroPiece: '',
    dateDelivrancePiece: '',
    lieuDelivrancePiece: '',
    dateExpirationPiece: '',
    
    // Contact
    telephone1: '',
    telephone2: '',
    email: '',
    adresseResidence: '',
    adresseProfessionnelle: '',
    dernierLieuConnu: '',
    
    // Caractéristiques physiques
    sexe: '',
    taille: '',
    poids: '',
    signesParticuliers: '',
    photoIdentite: false,
    empreintes: false,
    
    // SECTION 4: RENDEZ-VOUS
    dateConvocation: '',
    heureConvocation: '',
    dateRdv: '',
    heureRdv: '',
    dureeEstimee: 60, // en minutes
    typeAudience: 'STANDARD',
    
    // Lieu
    lieuConvocation: user?.commissariat?.nom || '',
    bureau: '',
    salleAudience: '',
    pointRencontre: '',
    accesSpecifique: '',
    
    // SECTION 5: PERSONNES PRÉSENTES
    convocateurNom: user?.name || '',
    convocateurPrenom: user?.name || '',
    convocateurMatricule: user?.matricule || '',
    convocateurFonction: user?.fonction || '',
    
    // Autres agents présents
    agentsPresents: '',
    representantParquet: false,
    nomParquetier: '',
    expertPresent: false,
    typeExpert: '',
    interpreteNecessaire: false,
    langueInterpretation: '',
    avocatPresent: false,
    nomAvocat: '',
    barreauAvocat: '',
    
    // SECTION 6: MOTIF ET OBJET
    motif: '',
    objetPrecis: '',
    questionsPreparatoires: '',
    piecesAApporter: '',
    documentsDemandes: '',
    
    // SECTION 9: OBSERVATIONS
    observationsGenerales: '',
    
    // SECTION 10: ÉTAT ET TRAÇABILITÉ
    statut: '',
    createdBy: user?.id || '',
    updatedBy: user?.id || '',
  })

  // Initialisation pour le mode édition
  useEffect(() => {
    if (existingData && isEditMode) {
      setFormData(prev => ({
        ...prev,
        ...existingData,
        // Assurer la compatibilité des champs
        nom: existingData.convoque_nom || existingData.nom,
        prenom: existingData.convoque_prenom || existingData.prenom,
        telephone1: existingData.convoque_telephone || existingData.telephone1,
        email: existingData.convoque_email || existingData.email,
        dateRdv: existingData.date_rdv || existingData.dateRdv,
        heureRdv: existingData.heure_rdv || existingData.heureRdv,
        lieuConvocation: existingData.lieu_rdv || existingData.lieuConvocation,
        motif: existingData.motif || existingData.motif,
      }))
    } else {
      // Générer une référence pour nouvelle convocation
      const generateReference = () => {
        const date = new Date()
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const random = Math.floor(1000 + Math.random() * 9000)
        return `CONV-${year}${month}${day}-${random}`
      }
      
      setFormData(prev => ({
        ...prev,
        convocateurNom: user?.name || '',
        convocateurPrenom: user?.name || '',
        convocateurMatricule: user?.matricule || '',
        convocateurFonction: user?.fonction || '',
        lieuConvocation: user?.commissariat?.nom || '',
        dateConvocation: new Date().toISOString().split('T')[0],
        heureConvocation: new Date().toLocaleTimeString('fr-FR', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      }))
    }
  }, [existingData, isEditMode, user])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      // Convertir les champs numériques
      let processedValue: any = value;
      if (name === 'dureeEstimee') {
        processedValue = parseInt(value) || 60; // Valeur par défaut de 60 si conversion échoue
      }

      setFormData(prev => ({ ...prev, [name]: processedValue }));
    }
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const validateForm = (): boolean => {
    const errors = []
    
    // Validations essentielles
    if (!formData.type) errors.push('Le type de convocation est obligatoire')
    if (!formData.statutPersonne) errors.push('Le statut de la personne est obligatoire')
    if (!formData.nom) errors.push('Le nom est obligatoire')
    if (!formData.prenom) errors.push('Le prénom est obligatoire')
    if (!formData.telephone1) errors.push('Le téléphone principal est obligatoire')
    if (!formData.typePiece) errors.push('Le type de pièce d\'identité est obligatoire')
    if (!formData.numeroPiece) errors.push('Le numéro de pièce d\'identité est obligatoire')
    if (!formData.dateRdv) errors.push('La date du rendez-vous est obligatoire')
    if (!formData.heureRdv) errors.push('L\'heure du rendez-vous est obligatoire')
    if (!formData.lieuConvocation) errors.push('Le lieu de convocation est obligatoire')
    if (!formData.motif) errors.push('Le motif est obligatoire')
    
    if (errors.length > 0) {
      setError(errors.join(', '))
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault()
    setError(null)
    setSuccess(false)

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const dataToSend = {
        // Informations générales
        reference: formData.reference,
        typeConvocation: formData.type,
        sousType: formData.sousType || undefined,
        urgence: formData.urgence,
        priorite: formData.priorite,
        confidentialite: formData.confidentialite,
        
        // Affaire liée
        affaireId: formData.affaireId || undefined,
        affaireType: formData.affaireType || undefined,
        affaireNumero: formData.affaireNumero || undefined,
        affaireTitre: formData.affaireTitre || undefined,
        sectionJudiciaire: formData.sectionJudiciaire || undefined,
        infraction: formData.infraction || undefined,
        qualificationLegale: formData.qualificationLegale || undefined,
        
        // Personne convoquée
        statutPersonne: formData.statutPersonne,
        nom: formData.nom,
        prenom: formData.prenom,
        dateNaissance: formData.dateNaissance || undefined,
        lieuNaissance: formData.lieuNaissance || undefined,
        nationalite: formData.nationalite || undefined,
        profession: formData.profession || undefined,
        situationFamiliale: formData.situationFamiliale || undefined,
        nombreEnfants: formData.nombreEnfants || undefined,

        // Pièce d'identité
        typePiece: formData.typePiece,
        numeroPiece: formData.numeroPiece,
        dateDelivrancePiece: formData.dateDelivrancePiece || undefined,
        lieuDelivrancePiece: formData.lieuDelivrancePiece || undefined,
        dateExpirationPiece: formData.dateExpirationPiece || undefined,

        // Contact
        telephone1: formData.telephone1,
        telephone2: formData.telephone2 || undefined,
        email: formData.email || undefined,
        adresseResidence: formData.adresseResidence || undefined,
        adresseProfessionnelle: formData.adresseProfessionnelle || undefined,
        dernierLieuConnu: formData.dernierLieuConnu || undefined,
        
        // Caractéristiques
        sexe: formData.sexe || undefined,
        taille: formData.taille || undefined,
        poids: formData.poids || undefined,
        signesParticuliers: formData.signesParticuliers || undefined,
        photoIdentite: formData.photoIdentite,
        empreintes: formData.empreintes,
        
        // Rendez-vous
        dateCreation: formData.dateConvocation || new Date().toISOString().split('T')[0],
        heureConvocation: formData.heureConvocation || new Date().toLocaleTimeString('fr-FR', { hour12: false }),
        dateRdv: formData.dateRdv,
        heureRdv: formData.heureRdv,
        dureeEstimee: formData.dureeEstimee ? parseInt(String(formData.dureeEstimee)) : undefined,
        typeAudience: formData.typeAudience || undefined,
        
        // Lieu
        lieuRdv: formData.lieuConvocation,
        bureau: formData.bureau || undefined,
        salleAudience: formData.salleAudience || undefined,
        pointRencontre: formData.pointRencontre || undefined,
        accesSpecifique: formData.accesSpecifique || undefined,
        
        // Personnes présentes
        convocateurNom: formData.convocateurNom,
        convocateurPrenom: formData.convocateurPrenom,
        convocateurMatricule: formData.convocateurMatricule || undefined,
        convocateurFonction: formData.convocateurFonction || undefined,
        agentsPresents: formData.agentsPresents || undefined,
        representantParquet: formData.representantParquet,
        nomParquetier: formData.nomParquetier || undefined,
        expertPresent: formData.expertPresent,
        typeExpert: formData.typeExpert || undefined,
        interpreteNecessaire: formData.interpreteNecessaire,
        langueInterpretation: formData.langueInterpretation || undefined,
        avocatPresent: formData.avocatPresent,
        nomAvocat: formData.nomAvocat || undefined,
        barreauAvocat: formData.barreauAvocat || undefined,
        
        // Motif et objet
        motif: formData.motif,
        objetPrecis: formData.objetPrecis || undefined,
        questionsPreparatoires: formData.questionsPreparatoires || undefined,
        piecesAApporter: formData.piecesAApporter || undefined,
        documentsDemandes: formData.documentsDemandes || undefined,
        
        // Observations
        observations: formData.observationsGenerales || undefined,

        
        // État et traçabilité
        statut: formData.statut,
        modeEnvoi: 'MANUEL',
        createdBy: formData.createdBy,
        updatedBy: user?.id,
        commissariatId: user?.commissariat?.id,
        agentId: user?.id,
      }

      console.log('📤 Envoi de la convocation:', dataToSend)

      let response
      if (isEditMode && existingData?.id) {
        response = await api.put(`/convocations/${existingData.id}`, dataToSend)
      } else {
        response = await api.post('/convocations', dataToSend)
      }

      console.log('📥 Réponse complète du backend:', response)

      if (response.data?.success !== false) {
        // Succès
        const convocationData = response.data?.data || response.data
        console.log('✅ Convocation enregistrée avec succès:', convocationData)
        
        const convocationId = convocationData?.id || (typeof convocationData === 'string' ? convocationData : null)
        
        if (!convocationId && !isEditMode) {
          console.error('❌ ID de la convocation non trouvé dans la réponse:', convocationData)
          setError('ID de la convocation créée non trouvé dans la réponse')
          await Swal.fire({
            title: 'Erreur',
            text: 'ID de la convocation créée non trouvé dans la réponse',
            icon: 'error',
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'OK'
          })
          return
        }

        setSuccess(true)

        // Afficher SweetAlert pour succès
        await Swal.fire({
          title: isEditMode ? 'Modification réussie' : 'Création réussie',
          text: `La convocation a été ${isEditMode ? 'modifiée' : 'créée'} avec succès.`,
          icon: 'success',
          confirmButtonColor: '#3b82f6',
          confirmButtonText: 'OK'
        })
      } else {
        // Erreur retournée par l'API
        const errorMsg = response.data?.message || response.data?.errors?.join(', ') || 'Erreur lors de l\'enregistrement de la convocation'
        console.error('❌ Erreur dans la réponse:', response.data)
        setError(errorMsg)
        await Swal.fire({
          title: 'Erreur',
          text: errorMsg,
          icon: 'error',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'OK'
        })
        return
      }

      // Réinitialiser le formulaire si nouvelle convocation
      if (!isEditMode) {
        setFormData({
          reference: '',
          type: '',
          sousType: '',
          urgence: 'NORMALE',
          priorite: 'MOYENNE',
          confidentialite: 'STANDARD',
          affaireId: '',
          affaireType: '',
          affaireNumero: '',
          affaireTitre: '',
          sectionJudiciaire: '',
          infraction: '',
          qualificationLegale: '',
          statutPersonne: 'TEMOIN',
          nom: '',
          prenom: '',
          dateNaissance: '',
          lieuNaissance: '',
          nationalite: '',
          profession: '',
          situationFamiliale: '',
          nombreEnfants: '',
          typePiece: 'CNI',
          numeroPiece: '',
          dateDelivrancePiece: '',
          lieuDelivrancePiece: '',
          dateExpirationPiece: '',
          telephone1: '',
          telephone2: '',
          email: '',
          adresseResidence: '',
          adresseProfessionnelle: '',
          dernierLieuConnu: '',
          sexe: '',
          taille: '',
          poids: '',
          signesParticuliers: '',
          photoIdentite: false,
          empreintes: false,
          dateConvocation: '',
          heureConvocation: '',
          dateRdv: '',
          heureRdv: '',
          dureeEstimee: 60,
          typeAudience: 'STANDARD',
          lieuConvocation: user?.commissariat?.nom || '',
          bureau: '',
          salleAudience: '',
          pointRencontre: '',
          accesSpecifique: '',
          convocateurNom: user?.nom || '',
          convocateurPrenom: user?.prenom || '',
          convocateurMatricule: user?.matricule || '',
          convocateurFonction: user?.fonction || '',
          agentsPresents: '',
          representantParquet: false,
          nomParquetier: '',
          expertPresent: false,
          typeExpert: '',
          interpreteNecessaire: false,
          langueInterpretation: '',
          avocatPresent: false,
          nomAvocat: '',
          barreauAvocat: '',
          motif: '',
          objetPrecis: '',
          questionsPreparatoires: '',
          piecesAApporter: '',
          documentsDemandes: '',
          observationsGenerales: '',
          statut: 'EN_ATTENTE',
          createdBy: user?.id || '',
          updatedBy: user?.id || '',
        })
      }

      // Appeler onSubmit si fourni
      if (onSubmit) {
        onSubmit(response.data)
      }

      // Fermer le modal immédiatement après succès
      if (isModalMode && onClose) {
        onClose()
      } else if (!isModalMode) {
        // Rediriger seulement si en mode standalone
        setTimeout(() => {
          router.push('/gestion/convocations/listes')
        }, 1500)
      }

    } catch (err: any) {
      console.error('❌ Erreur lors de l\'enregistrement:', err)
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Erreur lors de l\'enregistrement de la convocation'
      setError(errorMessage)
      
      // Afficher SweetAlert pour erreur
      await Swal.fire({
        title: 'Erreur',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK'
      })
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour afficher une section
  const renderSection = (title: string, icon: React.ReactNode, children: React.ReactNode, collapsible = false) => (
    <Card className="mb-6">
      <CardBody className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            {icon}
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        {children}
      </CardBody>
    </Card>
  )

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Messages d'erreur/succès */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-700">
            {isEditMode ? 'Convocation modifiée' : 'Convocation créée'} avec succès !
          </p>
        </div>
      )}

      {/* SECTION 1: INFORMATIONS GÉNÉRALES */}
      {renderSection(
        "Informations générales de la convocation",
        <Hash className="w-5 h-5 text-blue-600" />,
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
       
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de convocation <span className="text-red-500">*</span>
            </label>
            <Select
              name="type"
              value={formData.type}
              onChange={handleFormChange}
              required
            >
              <option value="">Sélectionner</option>
              <option value="AUDITION_TEMOIN">Audition témoin</option>
              <option value="AUDITION_SUSPECT">Audition suspect</option>
              <option value="AUDITION_VICTIME">Audition victime</option>
              <option value="CONFRONTATION">Confrontation</option>
              <option value="RECONSTITUTION">Reconstitution</option>
              <option value="EXPERTISE">Expertise</option>
              <option value="MEDIATION">Médiation</option>
              <option value="COMPARUTION">Comparution</option>
              <option value="AUTRE">Autre</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sous-type
            </label>
            <Select
              name="sousType"
              value={formData.sousType}
              onChange={handleFormChange}
            >
              <option value="">Sélectionner</option>
              <option value="AUDITION_SIMPLE">Audition simple</option>
              <option value="AUDITION_CONFRONTATION">Audition avec confrontation</option>
              <option value="AUDITION_TECHNIQUE">Audition technique</option>
              <option value="AUDITION_PROTEGEE">Audition protégée</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Niveau d'urgence
            </label>
            <Select
              name="urgence"
              value={formData.urgence}
              onChange={handleFormChange}
            >
              <option value="NORMALE">Normale</option>
              <option value="URGENT">Urgent</option>
              <option value="TRES_URGENT">Très urgent</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priorité
            </label>
            <Select
              name="priorite"
              value={formData.priorite}
              onChange={handleFormChange}
            >
              <option value="BASSE">Basse</option>
              <option value="MOYENNE">Moyenne</option>
              <option value="HAUTE">Haute</option>
              <option value="CRITIQUE">Critique</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confidentialité
            </label>
            <Select
              name="confidentialite"
              value={formData.confidentialite}
              onChange={handleFormChange}
            >
              <option value="STANDARD">Standard</option>
              <option value="CONFIDENTIEL">Confidentiel</option>
              <option value="TRES_CONFIDENTIEL">Très confidentiel</option>
              <option value="SECRET_DEFENSE">Secret défense</option>
            </Select>
          </div>
        </div>
      )}

      {/* SECTION 2: AFFAIRE LIÉE */}
      {renderSection(
        "Affaire liée",
        <FileWarning className="w-5 h-5 text-blue-600" />,
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro d'affaire
            </label>
            <Input
              type="text"
              name="affaireNumero"
              value={formData.affaireNumero}
              onChange={handleFormChange}
              placeholder="Ex: PL-2024-1548"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d'affaire
            </label>
            <Select
              name="affaireType"
              value={formData.affaireType}
              onChange={handleFormChange}
            >
              <option value="">Sélectionner</option>
              <option value="CRIMINELLE">Criminelle</option>
              <option value="CORRECTIONNELLE">Correctionnelle</option>
              <option value="POLICE_JUDICIAIRE">Police judiciaire</option>
              <option value="ENQUETE_PRELIMINAIRE">Enquête préliminaire</option>
              <option value="INSTRUCTION">Instruction</option>
              <option value="CIVILE">Civile</option>
              <option value="ADMINISTRATIVE">Administrative</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section judiciaire
            </label>
            <Select
              name="sectionJudiciaire"
              value={formData.sectionJudiciaire}
              onChange={handleFormChange}
            >
              <option value="">Sélectionner</option>
              <option value="SECTION_1">Section 1</option>
              <option value="SECTION_2">Section 2</option>
              <option value="SECTION_3">Section 3</option>
              <option value="SECTION_SPECIALE">Section spéciale</option>
            </Select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Infraction principale
            </label>
            <Input
              type="text"
              name="infraction"
              value={formData.infraction}
              onChange={handleFormChange}
              placeholder="Ex: Vol avec violence, Escroquerie..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qualification légale
            </label>
            <Input
              type="text"
              name="qualificationLegale"
              value={formData.qualificationLegale}
              onChange={handleFormChange}
              placeholder="Article de loi applicable"
            />
          </div>
        </div>
      )}

      {/* SECTION 3: PERSONNE CONVOQUÉE */}
      {renderSection(
        "Personne convoquée",
        <User className="w-5 h-5 text-blue-600" />,
        <div className="space-y-6">
          {/* Sous-section: Identité */}
          <div className="border-b pb-4">
            <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <UserCheck className="w-4 h-4" /> Identité
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut <span className="text-red-500">*</span>
                </label>
                <Select
                  name="statutPersonne"
                  value={formData.statutPersonne}
                  onChange={handleFormChange}
                  required
                >
                  <option value="TEMOIN">Témoin</option>
                  <option value="SUSPECT">Suspect</option>
                  <option value="VICTIME">Victime</option>
                  <option value="TECHNICIEN">Technicien</option>
                  <option value="EXPERT">Expert</option>
                  <option value="TEMOIN_ASSISTE">Témoin assisté</option>
                  <option value="PARTIE_CIVILE">Partie civile</option>
                  <option value="TEMOIN_DE_DEFENSE">Témoin de défense</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleFormChange}
                  required
                  placeholder="Nom de famille"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom(s) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleFormChange}
                  required
                  placeholder="Prénom(s)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de naissance
                </label>
                <Input
                  type="date"
                  name="dateNaissance"
                  value={formData.dateNaissance}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu de naissance
                </label>
                <Input
                  type="text"
                  name="lieuNaissance"
                  value={formData.lieuNaissance}
                  onChange={handleFormChange}
                  placeholder="Ville, Pays"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nationalité
                </label>
                <Input
                  type="text"
                  name="nationalite"
                  value={formData.nationalite}
                  onChange={handleFormChange}
                  placeholder="Nationalité"
                />
              </div>
            </div>
          </div>

          {/* Sous-section: Pièce d'identité */}
          <div className="border-b pb-4">
            <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <IdCard className="w-4 h-4 text-blue-600" /> Pièce d'identité {/* ICI CORRIGÉ */}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de pièce <span className="text-red-500">*</span>
                </label>
                <Select
                  name="typePiece"
                  value={formData.typePiece}
                  onChange={handleFormChange}
                  required
                >
                  <option value="CNI">CNI</option>
                  <option value="PASSEPORT">Passeport</option>
                  <option value="PERMIS_CONDUITE">Permis de conduire</option>
                  <option value="CARTE_SEJOUR">Carte de séjour</option>
                  <option value="CARTE_CONSULAIRE">Carte consulaire</option>
                  <option value="ACTE_NAISSANCE">Acte de naissance</option>
                  <option value="AUTRE">Autre</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="numeroPiece"
                  value={formData.numeroPiece}
                  onChange={handleFormChange}
                  required
                  placeholder="Numéro de la pièce"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de délivrance
                </label>
                <Input
                  type="date"
                  name="dateDelivrancePiece"
                  value={formData.dateDelivrancePiece}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu de délivrance
                </label>
                <Input
                  type="text"
                  name="lieuDelivrancePiece"
                  value={formData.lieuDelivrancePiece}
                  onChange={handleFormChange}
                  placeholder="Lieu de délivrance"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'expiration
                </label>
                <Input
                  type="date"
                  name="dateExpirationPiece"
                  value={formData.dateExpirationPiece}
                  onChange={handleFormChange}
                />
              </div>
            </div>
          </div>

          {/* Sous-section: Contact */}
          <div className="border-b pb-4">
            <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4" /> Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone principal <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="tel"
                    name="telephone1"
                    value={formData.telephone1}
                    onChange={handleFormChange}
                    required
                    className="pl-10"
                    placeholder="+225 XX XX XX XX XX"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone secondaire
                </label>
                <div className="relative">
                  <PhoneCall className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="tel"
                    name="telephone2"
                    value={formData.telephone2}
                    onChange={handleFormChange}
                    className="pl-10"
                    placeholder="Autre numéro"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="pl-10"
                    placeholder="email@exemple.com"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse de résidence
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    name="adresseResidence"
                    value={formData.adresseResidence}
                    onChange={handleFormChange}
                    className="pl-10"
                    placeholder="Adresse complète"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse professionnelle
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    name="adresseProfessionnelle"
                    value={formData.adresseProfessionnelle}
                    onChange={handleFormChange}
                    className="pl-10"
                    placeholder="Lieu de travail"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sous-section: Informations complémentaires */}
          <div>
            <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ClipboardList className="w-4 h-4" /> Informations complémentaires
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profession
                </label>
                <Input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleFormChange}
                  placeholder="Profession"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Situation familiale
                </label>
                <Select
                  name="situationFamiliale"
                  value={formData.situationFamiliale}
                  onChange={handleFormChange}
                >
                  <option value="">Sélectionner</option>
                  <option value="CELIBATAIRE">Célibataire</option>
                  <option value="MARIE">Marié(e)</option>
                  <option value="DIVORCE">Divorcé(e)</option>
                  <option value="VEUF">Veuf/Veuve</option>
                  <option value="CONCUBINAGE">Concubinage</option>
                  <option value="PACS">PACS</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre d'enfants
                </label>
                <Input
                  type="number"
                  name="nombreEnfants"
                  value={formData.nombreEnfants}
                  onChange={handleFormChange}
                  min="0"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sexe
                </label>
                <Select
                  name="sexe"
                  value={formData.sexe}
                  onChange={handleFormChange}
                >
                  <option value="">Sélectionner</option>
                  <option value="MASCULIN">Masculin</option>
                  <option value="FEMININ">Féminin</option>
                  <option value="AUTRE">Autre</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taille (cm)
                </label>
                <Input
                  type="number"
                  name="taille"
                  value={formData.taille}
                  onChange={handleFormChange}
                  placeholder="Ex: 175"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poids (kg)
                </label>
                <Input
                  type="number"
                  name="poids"
                  value={formData.poids}
                  onChange={handleFormChange}
                  placeholder="Ex: 70"
                  min="0"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Signes particuliers
                </label>
                <Textarea
                  name="signesParticuliers"
                  value={formData.signesParticuliers}
                  onChange={handleFormChange}
                  placeholder="Tatouages, cicatrices, particularités physiques..."
                  rows={2}
                />
              </div>
              
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: RENDEZ-VOUS */}
      {renderSection(
        "Rendez-vous",
        <Calendar className="w-5 h-5 text-blue-600" />,
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de convocation
            </label>
            <Input
              type="date"
              name="dateConvocation"
              value={formData.dateConvocation}
              onChange={handleFormChange}
              readOnly
              className="bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heure de convocation
            </label>
            <Input
              type="time"
              name="heureConvocation"
              value={formData.heureConvocation}
              onChange={handleFormChange}
              readOnly
              className="bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date du RDV <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              name="dateRdv"
              value={formData.dateRdv}
              onChange={handleFormChange}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heure du RDV <span className="text-red-500">*</span>
            </label>
            <Input
              type="time"
              name="heureRdv"
              value={formData.heureRdv}
              onChange={handleFormChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durée estimée (minutes)
            </label>
            <Select
              name="dureeEstimee"
              value={formData.dureeEstimee}
              onChange={handleFormChange}
            >
              <option value="30">30 min</option>
              <option value="60">1 heure</option>
              <option value="90">1h30</option>
              <option value="120">2 heures</option>
              <option value="180">3 heures</option>
              <option value="240">4 heures</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d'audience
            </label>
            <Select
              name="typeAudience"
              value={formData.typeAudience}
              onChange={handleFormChange}
            >
              <option value="STANDARD">Standard</option>
              <option value="URGENTE">Urgente</option>
              <option value="PROTEGEE">Protégée</option>
              <option value="AUDIOVISUELLE">Audiovisuelle</option>
              <option value="A_DISTANCE">À distance</option>
            </Select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lieu de convocation <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="lieuConvocation"
              value={formData.lieuConvocation}
              onChange={handleFormChange}
              required
              placeholder="Commissariat, tribunal..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bureau/Salle
            </label>
            <Input
              type="text"
              name="bureau"
              value={formData.bureau}
              onChange={handleFormChange}
              placeholder="Ex: Bureau 204"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salle d'audience
            </label>
            <Input
              type="text"
              name="salleAudience"
              value={formData.salleAudience}
              onChange={handleFormChange}
              placeholder="Ex: Salle A"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Point de rencontre
            </label>
            <Input
              type="text"
              name="pointRencontre"
              value={formData.pointRencontre}
              onChange={handleFormChange}
              placeholder="Ex: Accueil principal"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accès spécifique
            </label>
            <Textarea
              name="accesSpecifique"
              value={formData.accesSpecifique}
              onChange={handleFormChange}
              placeholder="Instructions d'accès spéciales, code porte, etc."
              rows={2}
            />
          </div>
        </div>
      )}

      {/* SECTION 5: PERSONNES PRÉSENTES */}
    
      {renderSection(
        "Personnes présentes",
        <Users className="w-5 h-5 text-blue-600" />,
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Convocateur (Nom)
              </label>
              <Input
                type="text"
                name="convocateurNom"
                value={formData.convocateurNom}
                onChange={handleFormChange}  // ✅ AJOUTÉ ICI
                placeholder="Nom du convocateur"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Convocateur (Prénom)
              </label>
              <Input
                type="text"
                name="convocateurPrenom"
                value={formData.convocateurPrenom}
                onChange={handleFormChange}  // ✅ AJOUTÉ ICI
                placeholder="Prénom du convocateur"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matricule
              </label>
              <Input
                type="text"
                name="convocateurMatricule"
                value={formData.convocateurMatricule}
                onChange={handleFormChange}
                placeholder="Matricule"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fonction
              </label>
              <Input
                type="text"
                name="convocateurFonction"
                value={formData.convocateurFonction}
                onChange={handleFormChange}
                placeholder="Fonction"
              />
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Autres agents présents
            </label>
            <Textarea
              name="agentsPresents"
              value={formData.agentsPresents}
              onChange={handleFormChange}
              placeholder="Noms et matricules des autres agents présents"
              rows={2}
            />
          </div>
          
          <div className="space-y-6">
            {/* Représentant du parquet */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="representantParquet"
                  name="representantParquet"
                  checked={formData.representantParquet || false}
                  onChange={handleFormChange}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="representantParquet" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                  Représentant du parquet présent
                </label>
              </div>
              {formData.representantParquet && (
                <div className="md:col-span-2">
                  <Input
                    type="text"
                    name="nomParquetier"
                    value={formData.nomParquetier}
                    onChange={handleFormChange}
                    placeholder="Nom du représentant du parquet"
                  />
                </div>
              )}
            </div>
            
            {/* Expert présent */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="expertPresent"
                  name="expertPresent"
                  checked={formData.expertPresent || false}
                  onChange={handleFormChange}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="expertPresent" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                  Expert présent
                </label>
              </div>
              {formData.expertPresent && (
                <div className="md:col-span-2">
                  <Input
                    type="text"
                    name="typeExpert"
                    value={formData.typeExpert}
                    onChange={handleFormChange}
                    placeholder="Type d'expert (médical, technique, etc.)"
                  />
                </div>
              )}
            </div>
            
            {/* Interprète nécessaire */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="interpreteNecessaire"
                  name="interpreteNecessaire"
                  checked={formData.interpreteNecessaire || false}
                  onChange={handleFormChange}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="interpreteNecessaire" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                  Interprète nécessaire
                </label>
              </div>
              {formData.interpreteNecessaire && (
                <div className="md:col-span-2">
                  <Input
                    type="text"
                    name="langueInterpretation"
                    value={formData.langueInterpretation}
                    onChange={handleFormChange}
                    placeholder="Langue d'interprétation"
                  />
                </div>
              )}
            </div>
            
            {/* Avocat présent */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="avocatPresent"
                  name="avocatPresent"
                  checked={formData.avocatPresent || false}
                  onChange={handleFormChange}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="avocatPresent" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                  Avocat présent
                </label>
              </div>
              {formData.avocatPresent && (
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="text"
                      name="nomAvocat"
                      value={formData.nomAvocat}
                      onChange={handleFormChange}
                      placeholder="Nom de l'avocat"
                    />
                  </div>
                  <div>
                    <Input
                      type="text"
                      name="barreauAvocat"
                      value={formData.barreauAvocat}
                      onChange={handleFormChange}
                      placeholder="Barreau"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: MOTIF ET OBJET */}
      {renderSection(
        "Motif et objet de la convocation",
        <FileText className="w-5 h-5 text-blue-600" />,
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motif <span className="text-red-500">*</span>
            </label>
            <Textarea
              name="motif"
              value={formData.motif}
              onChange={handleFormChange}
              required
              placeholder="Précisez le motif de la convocation..."
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objet précis
            </label>
            <Textarea
              name="objetPrecis"
              value={formData.objetPrecis}
              onChange={handleFormChange}
              placeholder="Objet précis de l'audition, points à aborder..."
              rows={2}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Questions préparatoires
            </label>
            <Textarea
              name="questionsPreparatoires"
              value={formData.questionsPreparatoires}
              onChange={handleFormChange}
              placeholder="Liste des questions à poser..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pièces à apporter
              </label>
              <Textarea
                name="piecesAApporter"
                value={formData.piecesAApporter}
                onChange={handleFormChange}
                placeholder="Liste des pièces que la personne doit apporter..."
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documents demandés
              </label>
              <Textarea
                name="documentsDemandes"
                value={formData.documentsDemandes}
                onChange={handleFormChange}
                placeholder="Liste des documents officiels demandés..."
                rows={3}
              />
            </div>
          </div>
        </div>
      )}

     

      {/* SECTION 9: OBSERVATIONS */}
      {renderSection(
        "Observations",
        <MessageSquare className="w-5 h-5 text-blue-600" />,
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observations générales
            </label>
            <Textarea
              name="observationsGenerales"
              value={formData.observationsGenerales}
              onChange={handleFormChange}
              placeholder="Observations générales sur la convocation..."
              rows={3}
            />
          </div>
        
     
        </div>
      )}


    </form>
  )

  // Mode modal
  if (isModalMode) {
    return (
      <Modal isOpen={isOpen || false} onClose={onClose || (() => {})}  className="max-w-[60vw] w-full">
        <ModalHeader>
          <ModalTitle>
            {isEditMode ? 'Modifier la convocation' : 'Nouvelle convocation'}
          </ModalTitle>
          <ModalClose onClick={onClose} />
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4 mb-4">
            <p className="text-sm text-gray-600">
              {isEditMode 
                ? `Modification de la convocation ${formData.reference}`
                : 'Remplissez les informations complètes de la convocation policière'
              }
            </p>
          </div>
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            {formContent}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button 
            onClick={onClose} 
            variant="secondary"
            disabled={loading || success}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            disabled={loading || success}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isEditMode ? 'Modification...' : 'Création...'}
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-4 h-4" />
                {isEditMode ? 'Modifié !' : 'Créé !'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditMode ? 'Modifier la convocation' : 'Créer la convocation'}
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    )
  }

  // Mode standalone (page complète)
  return (
    <div className="min-h-screen space-y-6 pb-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="secondary"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Bell className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Modifier la convocation' : 'Nouvelle convocation'}
            </h1>
            <p className="text-slate-600 text-sm">
              {isEditMode 
                ? `Modification de la convocation ${formData.reference}`
                : 'Formulaire complet de convocation policière'
              }
            </p>
          </div>
        </div>
      </div>

      <Card className="bg-white border border-gray-200">
        <CardBody className="p-6">
          {formContent}
          
          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700"
              disabled={loading || success}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEditMode ? 'Modification...' : 'Création...'}
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {isEditMode ? 'Modifié !' : 'Créé !'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditMode ? 'Modifier la convocation' : 'Créer la convocation'}
                </>
              )}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}