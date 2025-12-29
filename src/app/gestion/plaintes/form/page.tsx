'use client'

import React, { useState } from 'react'
import {
  Save, X, User, AlertTriangle, Phone, MapPin, CheckCircle, Loader2, 
  UserPlus, Trash2, Plus, Users, Eye
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardBody } from '@/components/ui/Card'
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from '@/components/ui/Modal'
import api from '@/lib/axios'
import Cookies from 'js-cookie'

interface Suspect {
  id: string
  nom: string
  prenom: string
  description?: string
  adresse?: string
}

interface Temoin {
  id: string
  nom: string
  prenom: string
  telephone?: string
  adresse?: string
}

interface FormulaireCreationPlainteProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (data: any) => void
}

export default function FormulaireCreationPlainte({ isOpen, onClose, onSuccess }: FormulaireCreationPlainteProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  
  const [formData, setFormData] = useState({
    // Informations plaignant
    plaignant_nom: '',
    plaignant_prenom: '',
    plaignant_telephone: '',
    plaignant_email: '',
    plaignant_adresse: '',
    
    // Informations plainte
    type_plainte: '',
    description: '',
    lieu_faits: '',
    date_faits: '',
    priorite: 'NORMALE' as 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE',
    observations: ''
  })

  // États pour les suspects
  const [suspects, setSuspects] = useState<Suspect[]>([])
  const [suspectForm, setSuspectForm] = useState({
    nom: '',
    prenom: '',
    description: '',
    adresse: ''
  })

  // États pour les témoins
  const [temoins, setTemoins] = useState<Temoin[]>([])
  const [temoinForm, setTemoinForm] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    adresse: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Gestion des suspects
  const handleAddSuspect = () => {
    if (!suspectForm.nom.trim() || !suspectForm.prenom.trim()) {
      alert('Le nom et prénom du suspect sont requis')
      return
    }

    const newSuspect: Suspect = {
      id: Date.now().toString(),
      nom: suspectForm.nom.trim(),
      prenom: suspectForm.prenom.trim(),
      description: suspectForm.description.trim(),
      adresse: suspectForm.adresse.trim()
    }

    setSuspects(prev => [...prev, newSuspect])
    setSuspectForm({ nom: '', prenom: '', description: '', adresse: '' })
  }

  const handleRemoveSuspect = (id: string) => {
    setSuspects(prev => prev.filter(s => s.id !== id))
  }

  // Gestion des témoins
  const handleAddTemoin = () => {
    if (!temoinForm.nom.trim() || !temoinForm.prenom.trim()) {
      alert('Le nom et prénom du témoin sont requis')
      return
    }

    const newTemoin: Temoin = {
      id: Date.now().toString(),
      nom: temoinForm.nom.trim(),
      prenom: temoinForm.prenom.trim(),
      telephone: temoinForm.telephone.trim(),
      adresse: temoinForm.adresse.trim()
    }

    setTemoins(prev => [...prev, newTemoin])
    setTemoinForm({ nom: '', prenom: '', telephone: '', adresse: '' })
  }

  const handleRemoveTemoin = (id: string) => {
    setTemoins(prev => prev.filter(t => t.id !== id))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.plaignant_nom.trim()) {
      newErrors.plaignant_nom = 'Le nom est requis'
    }
    if (!formData.plaignant_prenom.trim()) {
      newErrors.plaignant_prenom = 'Le prénom est requis'
    }
    if (!formData.plaignant_telephone.trim()) {
      newErrors.plaignant_telephone = 'Le téléphone est requis'
    }
    if (!formData.type_plainte) {
      newErrors.type_plainte = 'Le type de plainte est requis'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise'
    }
    if (!formData.lieu_faits.trim()) {
      newErrors.lieu_faits = 'Le lieu des faits est requis'
    }

    if (formData.plaignant_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.plaignant_email)) {
      newErrors.plaignant_email = 'Email invalide'
    }

    if (formData.plaignant_telephone && !/^[\d\s\+\-\(\)]+$/.test(formData.plaignant_telephone)) {
      newErrors.plaignant_telephone = 'Numéro de téléphone invalide'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError('Veuillez remplir tous les champs obligatoires correctement')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const commissariat_id = Cookies.get('commissariat_id')
      console.log('🔍 FormulaireCreationPlainte - commissariat_id:', commissariat_id)
      
      if (!commissariat_id) {
        setError('Impossible de déterminer votre commissariat. Veuillez vous reconnecter.')
        setLoading(false)
        return
      }

      const requestData: any = {
        plaignant_nom: formData.plaignant_nom.trim(),
        plaignant_prenom: formData.plaignant_prenom.trim(),
        plaignant_telephone: formData.plaignant_telephone.trim(),
        type_plainte: formData.type_plainte,
        description: formData.description.trim(),
        lieu_faits: formData.lieu_faits.trim(),
        priorite: formData.priorite,
        commissariat_id: commissariat_id
      }

      if (formData.plaignant_email.trim()) {
        requestData.plaignant_email = formData.plaignant_email.trim()
      }
      if (formData.plaignant_adresse.trim()) {
        requestData.plaignant_adresse = formData.plaignant_adresse.trim()
      }
      if (formData.date_faits) {
        requestData.date_faits = new Date(formData.date_faits).toISOString()
      }
      if (formData.observations.trim()) {
        requestData.observations = formData.observations.trim()
      }

      // Ajouter les suspects et témoins
      if (suspects.length > 0) {
        requestData.suspects = suspects.map(s => ({
          nom: s.nom,
          prenom: s.prenom,
          description: s.description || '',
          adresse: s.adresse || ''
        }))
      }

      if (temoins.length > 0) {
        requestData.temoins = temoins.map(t => ({
          nom: t.nom,
          prenom: t.prenom,
          telephone: t.telephone || '',
          adresse: t.adresse || ''
        }))
      }

      console.log('📤 Envoi de la plainte:', requestData)

      const response = await api.post('/plaintes', requestData)

      console.log('✅ Plainte créée avec succès:', response.data)

      resetForm()
      setShowSuccessModal(true)

      setTimeout(() => {
        setShowSuccessModal(false)
        onSuccess(response.data)
      }, 2000)

    } catch (err: any) {
      console.error('❌ Erreur création plainte:', err)
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Erreur lors de la création de la plainte'
      )
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      plaignant_nom: '',
      plaignant_prenom: '',
      plaignant_telephone: '',
      plaignant_email: '',
      plaignant_adresse: '',
      type_plainte: '',
      description: '',
      lieu_faits: '',
      date_faits: '',
      priorite: 'NORMALE',
      observations: ''
    })
    setSuspects([])
    setTemoins([])
    setSuspectForm({ nom: '', prenom: '', description: '', adresse: '' })
    setTemoinForm({ nom: '', prenom: '', telephone: '', adresse: '' })
    setErrors({})
    setError(null)
  }

  const handleClose = () => {
    if (!loading) {
      resetForm()
      onClose()
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[60vw] w-full">
        <ModalHeader>
          <ModalTitle>Nouvelle Plainte</ModalTitle>
          <ModalClose onClick={handleClose} disabled={loading} />
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Section Plaignant */}
            <Card>
              <CardBody className="p-4">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Informations du Plaignant
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      value={formData.plaignant_nom}
                      onChange={(e) => handleInputChange('plaignant_nom', e.target.value)}
                      placeholder="Nom de famille"
                      disabled={loading}
                      className={errors.plaignant_nom ? 'border-red-500' : ''}
                    />
                    {errors.plaignant_nom && (
                      <p className="text-xs text-red-600 mt-1">{errors.plaignant_nom}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      value={formData.plaignant_prenom}
                      onChange={(e) => handleInputChange('plaignant_prenom', e.target.value)}
                      placeholder="Prénom"
                      disabled={loading}
                      className={errors.plaignant_prenom ? 'border-red-500' : ''}
                    />
                    {errors.plaignant_prenom && (
                      <p className="text-xs text-red-600 mt-1">{errors.plaignant_prenom}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Téléphone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        value={formData.plaignant_telephone}
                        onChange={(e) => handleInputChange('plaignant_telephone', e.target.value)}
                        placeholder="+225 07 XX XX XX XX"
                        className={`pl-10 ${errors.plaignant_telephone ? 'border-red-500' : ''}`}
                        disabled={loading}
                      />
                    </div>
                    {errors.plaignant_telephone && (
                      <p className="text-xs text-red-600 mt-1">{errors.plaignant_telephone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email
                    </label>
                    <Input 
                      type="email"
                      value={formData.plaignant_email}
                      onChange={(e) => handleInputChange('plaignant_email', e.target.value)}
                      placeholder="email@exemple.com"
                      disabled={loading}
                      className={errors.plaignant_email ? 'border-red-500' : ''}
                    />
                    {errors.plaignant_email && (
                      <p className="text-xs text-red-600 mt-1">{errors.plaignant_email}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Adresse
                    </label>
                    <Input 
                      value={formData.plaignant_adresse}
                      onChange={(e) => handleInputChange('plaignant_adresse', e.target.value)}
                      placeholder="Adresse complète"
                      disabled={loading}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Section Plainte */}
            <Card>
              <CardBody className="p-4">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Informations de la Plainte
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Type de plainte <span className="text-red-500">*</span>
                    </label>
                    <Select 
                      value={formData.type_plainte}
                      onChange={(e) => handleInputChange('type_plainte', e.target.value)}
                      disabled={loading}
                      className={errors.type_plainte ? 'border-red-500' : ''}
                    >
                      <option value="">Sélectionner le type</option>
                      <option value="Vol avec violence">Vol avec violence</option>
                      <option value="Vol simple">Vol simple</option>
                      <option value="Cambriolage">Cambriolage</option>
                      <option value="Agression">Agression</option>
                      <option value="Escroquerie">Escroquerie</option>
                      <option value="Harcèlement">Harcèlement</option>
                      <option value="Menace">Menace</option>
                      <option value="Fraude">Fraude</option>
                      <option value="Autre">Autre</option>
                    </Select>
                    {errors.type_plainte && (
                      <p className="text-xs text-red-600 mt-1">{errors.type_plainte}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Priorité
                    </label>
                    <Select 
                      value={formData.priorite}
                      onChange={(e) => handleInputChange('priorite', e.target.value)}
                      disabled={loading}
                    >
                      <option value="BASSE">Basse</option>
                      <option value="NORMALE">Normale</option>
                      <option value="HAUTE">Haute</option>
                      <option value="URGENTE">Urgente</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Description détaillée <span className="text-red-500">*</span>
                    </label>
                    <Textarea 
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Décrivez les faits avec le maximum de détails..."
                      rows={4}
                      disabled={loading}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && (
                      <p className="text-xs text-red-600 mt-1">{errors.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Lieu des faits <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          value={formData.lieu_faits}
                          onChange={(e) => handleInputChange('lieu_faits', e.target.value)}
                          placeholder="Adresse précise des faits"
                          className={`pl-10 ${errors.lieu_faits ? 'border-red-500' : ''}`}
                          disabled={loading}
                        />
                      </div>
                      {errors.lieu_faits && (
                        <p className="text-xs text-red-600 mt-1">{errors.lieu_faits}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Date des faits
                      </label>
                      <Input 
                        type="date"
                        value={formData.date_faits}
                        onChange={(e) => handleInputChange('date_faits', e.target.value)}
                        disabled={loading}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Observations complémentaires
                    </label>
                    <Textarea 
                      value={formData.observations}
                      onChange={(e) => handleInputChange('observations', e.target.value)}
                      placeholder="Informations complémentaires..."
                      rows={3}
                      disabled={loading}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Section Suspects */}
            <Card>
              <CardBody className="p-4">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-600" />
                  Suspects ({suspects.length})
                </h3>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <Input 
                        value={suspectForm.nom}
                        onChange={(e) => setSuspectForm(prev => ({ ...prev, nom: e.target.value }))}
                        placeholder="Nom *"
                      />
                      <Input 
                        value={suspectForm.prenom}
                        onChange={(e) => setSuspectForm(prev => ({ ...prev, prenom: e.target.value }))}
                        placeholder="Prénom *"
                      />
                      <Input 
                        value={suspectForm.adresse}
                        onChange={(e) => setSuspectForm(prev => ({ ...prev, adresse: e.target.value }))}
                        placeholder="Adresse"
                      />
                      <Textarea 
                        value={suspectForm.description}
                        onChange={(e) => setSuspectForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description physique, signes distinctifs..."
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleAddSuspect}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Ajouter
                      </Button>
                    </div>
                  </div>

                {suspects.length > 0 ? (
                  <div className="space-y-2">
                    {suspects.map((suspect) => (
                      <div key={suspect.id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">
                            {suspect.nom} {suspect.prenom}
                          </p>
                          {suspect.adresse && (
                            <p className="text-sm text-slate-600">
                              <MapPin className="w-3 h-3 inline mr-1" />
                              {suspect.adresse}
                            </p>
                          )}
                          {suspect.description && (
                            <p className="text-sm text-slate-600 mt-1">{suspect.description}</p>
                          )}
                        </div>
                        <Button 
                          onClick={() => handleRemoveSuspect(suspect.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 p-2 ml-2"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Aucun suspect ajouté
                  </p>
                )}
              </CardBody>
            </Card>

            {/* Section Témoins */}
            <Card>
              <CardBody className="p-4">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-green-600" />
                  Témoins ({temoins.length})
                </h3>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <Input 
                        value={temoinForm.nom}
                        onChange={(e) => setTemoinForm(prev => ({ ...prev, nom: e.target.value }))}
                        placeholder="Nom *"
                      />
                      <Input 
                        value={temoinForm.prenom}
                        onChange={(e) => setTemoinForm(prev => ({ ...prev, prenom: e.target.value }))}
                        placeholder="Prénom *"
                      />
                      <Input 
                        value={temoinForm.telephone}
                        onChange={(e) => setTemoinForm(prev => ({ ...prev, telephone: e.target.value }))}
                        placeholder="Téléphone"
                      />
                      <Input 
                        value={temoinForm.adresse}
                        onChange={(e) => setTemoinForm(prev => ({ ...prev, adresse: e.target.value }))}
                        placeholder="Adresse"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleAddTemoin}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Ajouter
                      </Button>
                    </div>
                  </div>

                {temoins.length > 0 ? (
                  <div className="space-y-2">
                    {temoins.map((temoin) => (
                      <div key={temoin.id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">
                            {temoin.nom} {temoin.prenom}
                          </p>
                          {temoin.telephone && (
                            <p className="text-sm text-slate-600">
                              <Phone className="w-3 h-3 inline mr-1" />
                              {temoin.telephone}
                            </p>
                          )}
                          {temoin.adresse && (
                            <p className="text-sm text-slate-600">
                              <MapPin className="w-3 h-3 inline mr-1" />
                              {temoin.adresse}
                            </p>
                          )}
                        </div>
                        <Button 
                          onClick={() => handleRemoveTemoin(temoin.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 p-2 ml-2"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Aucun témoin ajouté
                  </p>
                )}
              </CardBody>
            </Card>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button 
            onClick={handleClose}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Enregistrer
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal de succès */}
      <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} size="sm">
        <ModalBody>
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Plainte créée avec succès !</h3>
            <p className="text-slate-600">
              La plainte a été enregistrée et sera traitée dans les plus brefs délais.
            </p>
          </div>
        </ModalBody>
      </Modal>
    </>
  )
}
