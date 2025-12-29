'use client'

import React, { useState } from 'react'
import {
  User, Calendar, Bell, CheckCircle, ArrowRight, ArrowLeft,
  FileText, Phone, Mail, Save, Send, Search, UserX, Scale
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from '@/components/ui/Modal'
import type { ConvocationFormData, TypeConvocation, CanalNotification } from '@/types/convocation'

const TYPES_CONVOCATION = [
  { value: 'AUDITION_TEMOIN', label: 'Audition Témoin', icon: User, color: 'blue' },
  { value: 'AUDITION_SUSPECT', label: 'Audition Suspect', icon: Search, color: 'orange' },
  { value: 'AUDITION_VICTIME', label: 'Audition Victime', icon: UserX, color: 'red' },
  { value: 'CONFRONTATION', label: 'Confrontation', icon: Scale, color: 'purple' }
]

const CANAUX_NOTIFICATION = [
  { value: 'SMS', label: 'SMS', icon: Phone },
  { value: 'EMAIL', label: 'Email', icon: Mail },
  { value: 'COURRIER', label: 'Courrier', icon: Mail },
  { value: 'TELEPHONIQUE', label: 'Téléphone', icon: Phone },
  { value: 'MAIN_PROPRE', label: 'Main propre', icon: User }
]

interface ModalNouvelleConvocationProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function ModalNouvelleConvocation({ isOpen, onClose, onSuccess }: ModalNouvelleConvocationProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  
  const [formData, setFormData] = useState<ConvocationFormData>({
    civilite: 'M',
    nom: '',
    prenoms: '',
    dateNaissance: '',
    lieuNaissance: '',
    profession: '',
    adresse: '',
    telephone: '',
    email: '',
    typeConvocation: 'AUDITION_TEMOIN',
    objet: '',
    description: '',
    affaireLiee: '',
    dateConvocation: '',
    heureConvocation: '',
    dureeEstimee: 60,
    lieuConvocation: '',
    salle: '',
    canalNotification: ['SMS'],
    documentsAFournir: [],
    envoyerImmediatement: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newDocument, setNewDocument] = useState('')

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis'
      if (!formData.prenoms.trim()) newErrors.prenoms = 'Le(s) prénom(s) sont requis'
      if (!formData.adresse.trim()) newErrors.adresse = 'L\'adresse est requise'
      if (!formData.telephone.trim()) newErrors.telephone = 'Le téléphone est requis'
      else if (!/^[\d\s+\-()]+$/.test(formData.telephone)) {
        newErrors.telephone = 'Numéro invalide'
      }
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email invalide'
      }
    }

    if (step === 2) {
      if (!formData.objet.trim()) newErrors.objet = 'L\'objet est requis'
    }

    if (step === 3) {
      if (!formData.dateConvocation) newErrors.dateConvocation = 'Date requise'
      if (!formData.heureConvocation) newErrors.heureConvocation = 'Heure requise'
      if (!formData.lieuConvocation.trim()) newErrors.lieuConvocation = 'Lieu requis'
      
      if (formData.dateConvocation) {
        const selectedDate = new Date(formData.dateConvocation)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        if (selectedDate < today) {
          newErrors.dateConvocation = 'Date passée invalide'
        }
      }
    }

    if (step === 4) {
      if (formData.canalNotification.length === 0) {
        newErrors.canalNotification = 'Sélectionnez 1 canal minimum'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (isDraft: boolean) => {
    if (!isDraft && !validateStep(currentStep)) return

    setIsSaving(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      console.log('Convocation créée:', { ...formData, statut: isDraft ? 'BROUILLON' : 'ENVOYEE' })
      
      onSuccess?.()
      onClose()
      
      // Reset
      setCurrentStep(1)
      setFormData({
        civilite: 'M', nom: '', prenoms: '', dateNaissance: '', lieuNaissance: '',
        profession: '', adresse: '', telephone: '', email: '',
        typeConvocation: 'AUDITION_TEMOIN', objet: '', description: '', affaireLiee: '',
        dateConvocation: '', heureConvocation: '', dureeEstimee: 60,
        lieuConvocation: '', salle: '', canalNotification: ['SMS'],
        documentsAFournir: [], envoyerImmediatement: false
      })
      setErrors({})
    } catch (error) {
      alert('Erreur lors de la création')
    } finally {
      setIsSaving(false)
    }
  }

  const addDocument = () => {
    if (newDocument.trim()) {
      updateFormData('documentsAFournir', [...(formData.documentsAFournir || []), newDocument])
      setNewDocument('')
    }
  }

  const removeDocument = (index: number) => {
    const docs = [...(formData.documentsAFournir || [])]
    docs.splice(index, 1)
    updateFormData('documentsAFournir', docs)
  }

  const toggleCanal = (canal: CanalNotification) => {
    const canaux = formData.canalNotification.includes(canal)
      ? formData.canalNotification.filter(c => c !== canal)
      : [...formData.canalNotification, canal]
    updateFormData('canalNotification', canaux)
  }

  const steps = [
    { number: 1, title: 'Personne', icon: User },
    { number: 2, title: 'Type', icon: FileText },
    { number: 3, title: 'Date/Lieu', icon: Calendar },
    { number: 4, title: 'Notification', icon: Bell },
    { number: 5, title: 'Validation', icon: CheckCircle }
  ]

  const getIconBgColor = (color: string, isSelected: boolean) => {
    if (!isSelected) return 'bg-gray-100'
    
    switch(color) {
      case 'blue': return 'bg-blue-100'
      case 'orange': return 'bg-orange-100'
      case 'red': return 'bg-red-100'
      case 'purple': return 'bg-purple-100'
      default: return 'bg-gray-100'
    }
  }

  const getIconColor = (color: string, isSelected: boolean) => {
    if (!isSelected) return 'text-gray-600'
    
    switch(color) {
      case 'blue': return 'text-blue-600'
      case 'orange': return 'text-orange-600'
      case 'red': return 'text-red-600'
      case 'purple': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
      <ModalHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <ModalTitle className="text-white">
          <div>
            <h2 className="text-2xl font-bold">Nouvelle Convocation</h2>
            <p className="text-blue-100 text-sm mt-1">Étape {currentStep} sur 5</p>
          </div>
        </ModalTitle>
        <ModalClose onClick={onClose} />
      </ModalHeader>

      {/* Progress */}
      <div className="bg-gray-50 px-6 py-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  currentStep >= step.number ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step.number ? <CheckCircle className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                </div>
                <p className={`text-xs mt-1 ${currentStep >= step.number ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-2">
                  <div className={`h-full rounded ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'}`} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <ModalBody>
        {/* Étape 1 */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Civilité *</label>
                <Select value={formData.civilite} onChange={(e) => updateFormData('civilite', e.target.value)}>
                  <option value="M">M.</option>
                  <option value="Mme">Mme</option>
                  <option value="Mlle">Mlle</option>
                </Select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Nom *</label>
                <Input 
                  type="text" 
                  value={formData.nom}
                  onChange={(e) => updateFormData('nom', e.target.value.toUpperCase())}
                  placeholder="NOM"
                />
                {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Prénom(s) *</label>
              <Input 
                type="text" 
                value={formData.prenoms} 
                onChange={(e) => updateFormData('prenoms', e.target.value)}
                placeholder="Prénom(s)"
              />
              {errors.prenoms && <p className="text-red-500 text-xs mt-1">{errors.prenoms}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Adresse *</label>
              <Textarea 
                value={formData.adresse} 
                onChange={(e) => updateFormData('adresse', e.target.value)} 
                rows={2}
                placeholder="Adresse complète"
              />
              {errors.adresse && <p className="text-red-500 text-xs mt-1">{errors.adresse}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Téléphone *</label>
                <Input 
                  type="tel" 
                  value={formData.telephone} 
                  onChange={(e) => updateFormData('telephone', e.target.value)}
                  placeholder="+225 XX XX XX XX"
                />
                {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="email@exemple.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Étape 2 */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type *</label>
              <div className="grid grid-cols-2 gap-3">
                {TYPES_CONVOCATION.map((type) => {
                  const Icon = type.icon
                  const isSelected = formData.typeConvocation === type.value
                  
                  return (
                    <button 
                      key={type.value} 
                      type="button"
                      onClick={() => updateFormData('typeConvocation', type.value)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          getIconBgColor(type.color, isSelected)
                        }`}>
                          <Icon className={`w-6 h-6 ${getIconColor(type.color, isSelected)}`} />
                        </div>
                        <span className="font-semibold text-base">{type.label}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Objet *</label>
              <Input 
                type="text" 
                value={formData.objet} 
                onChange={(e) => updateFormData('objet', e.target.value)}
                placeholder="Ex: Audition dans le cadre de..."
              />
              {errors.objet && <p className="text-red-500 text-xs mt-1">{errors.objet}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea 
                value={formData.description} 
                onChange={(e) => updateFormData('description', e.target.value)} 
                rows={3}
                placeholder="Informations complémentaires..."
              />
            </div>
          </div>
        )}

        {/* Étape 3 */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Date *</label>
                <Input 
                  type="date" 
                  value={formData.dateConvocation}
                  onChange={(e) => updateFormData('dateConvocation', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.dateConvocation && <p className="text-red-500 text-xs mt-1">{errors.dateConvocation}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Heure *</label>
                <Input 
                  type="time" 
                  value={formData.heureConvocation}
                  onChange={(e) => updateFormData('heureConvocation', e.target.value)}
                />
                {errors.heureConvocation && <p className="text-red-500 text-xs mt-1">{errors.heureConvocation}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Lieu *</label>
              <Input 
                type="text" 
                value={formData.lieuConvocation}
                onChange={(e) => updateFormData('lieuConvocation', e.target.value)}
                placeholder="Ex: Commissariat Central"
              />
              {errors.lieuConvocation && <p className="text-red-500 text-xs mt-1">{errors.lieuConvocation}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Salle/Bureau</label>
              <Input 
                type="text" 
                value={formData.salle} 
                onChange={(e) => updateFormData('salle', e.target.value)}
                placeholder="Ex: Bureau 205"
              />
            </div>
          </div>
        )}

        {/* Étape 4 */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Canaux *</label>
              <div className="grid grid-cols-2 gap-3">
                {CANAUX_NOTIFICATION.map((canal) => {
                  const Icon = canal.icon
                  const isSelected = formData.canalNotification.includes(canal.value as CanalNotification)
                  
                  return (
                    <button 
                      key={canal.value} 
                      type="button"
                      onClick={() => toggleCanal(canal.value as CanalNotification)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                        <span className="font-medium text-sm">{canal.label}</span>
                        {isSelected && <CheckCircle className="w-4 h-4 text-blue-600 ml-auto" />}
                      </div>
                    </button>
                  )
                })}
              </div>
              {errors.canalNotification && <p className="text-red-500 text-xs mt-1">{errors.canalNotification}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Documents à fournir</label>
              <div className="flex gap-2 mb-2">
                <Input 
                  type="text" 
                  value={newDocument} 
                  onChange={(e) => setNewDocument(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDocument())}
                  placeholder="Ex: Carte d'identité"
                  className="flex-1"
                />
                <Button onClick={addDocument}>Ajouter</Button>
              </div>
              {formData.documentsAFournir && formData.documentsAFournir.length > 0 && (
                <div className="space-y-1">
                  {formData.documentsAFournir.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                      <span className="text-sm">{doc}</span>
                      <button onClick={() => removeDocument(index)} className="text-red-600 text-sm hover:text-red-800">
                        Retirer
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Étape 5 */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Récapitulatif
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Personne:</span>
                  <span className="font-medium">{formData.civilite} {formData.nom} {formData.prenoms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{TYPES_CONVOCATION.find(t => t.value === formData.typeConvocation)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {formData.dateConvocation && new Date(formData.dateConvocation).toLocaleDateString('fr-FR')} à {formData.heureConvocation}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lieu:</span>
                  <span className="font-medium">{formData.lieuConvocation}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="envoyerImmediatement"
                checked={formData.envoyerImmediatement}
                onChange={(e) => updateFormData('envoyerImmediatement', e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="envoyerImmediatement" className="text-sm">Envoyer immédiatement</label>
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter className="flex items-center justify-between">
        <Button 
          onClick={prevStep} 
          disabled={currentStep === 1}
          variant={currentStep === 1 ? 'ghost' : 'outline'}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Précédent
        </Button>

        <div className="flex gap-2">
          {currentStep === 5 && (
            <Button 
              onClick={() => handleSubmit(true)} 
              disabled={isSaving}
              variant="outline"
            >
              <Save className="w-4 h-4 mr-2" />
              Brouillon
            </Button>
          )}

          {currentStep < 5 ? (
            <Button onClick={nextStep}>
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={() => handleSubmit(false)} 
              disabled={isSaving}
            >
              <Send className="w-4 h-4 mr-2" />
              {isSaving ? 'Envoi...' : 'Créer et Envoyer'}
            </Button>
          )}
        </div>
      </ModalFooter>
    </Modal>
  )
}
