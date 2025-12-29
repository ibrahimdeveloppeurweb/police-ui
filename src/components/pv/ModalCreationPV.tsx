'use client'

import React, { useState } from 'react'
import { 
  X, Save, Loader2, Plus, Trash2, Clock, User, FileText, 
  CheckCircle, Scale, Shield, Users, Mic
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'

interface ModalCreationPVProps {
  isOpen: boolean
  onClose: () => void
  convocation: any
}

export const ModalCreationPV: React.FC<ModalCreationPVProps> = ({ isOpen, onClose, convocation }) => {
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  
  const [formData, setFormData] = useState({
    dateAudition: new Date().toISOString().split('T')[0],
    heureDebut: '',
    heureFin: '',
    lieu: convocation?.commissariat?.nom || '',
    salle: '',
    auditeur: {
      nom: convocation?.agent?.nom || '',
      prenom: convocation?.agent?.prenom || '',
      matricule: convocation?.agent?.matricule || '',
      fonction: convocation?.agent?.fonction || 'OPJ'
    },
    personne_auditionnee: {
      civilite: '',
      nom: convocation?.convoqueNom || '',
      prenom: convocation?.convoquePrenom || '',
      dateNaissance: '',
      lieuNaissance: '',
      nationalite: '',
      profession: '',
      adresse: convocation?.convoqueAdresse || '',
      telephone: convocation?.convoqueTelephone || '',
      email: convocation?.convoqueEmail || ''
    },
    autresPresents: [] as any[],
    interpretePresent: false,
    interpreteDetails: '',
    avocatPresent: false,
    avocatDetails: '',
    objet: convocation?.motif || '',
    contexte: '',
    qualite: convocation?.qualiteConvoque || 'TEMOIN',
    droitsNotifies: {
      droitGarderSilence: false,
      droitAvocat: false,
      droitInterpretes: false,
      droitExamen: false
    },
    notificationHeure: '',
    deroulement: '',
    questionsReponses: [] as any[],
    declarationsLibres: '',
    observations: '',
    heureFinAudition: '',
    refusSignature: false,
    motifRefus: '',
    observationsFinales: ''
  })
  
  const ajouterQR = () => {
    setFormData(prev => ({
      ...prev,
      questionsReponses: [
        ...prev.questionsReponses,
        { heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), question: '', reponse: '' }
      ]
    }))
  }
  
  const supprimerQR = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questionsReponses: prev.questionsReponses.filter((_, i) => i !== index)
    }))
  }
  
  const updateQR = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      questionsReponses: prev.questionsReponses.map((qr, i) => 
        i === index ? { ...qr, [field]: value } : qr
      )
    }))
  }
  
  const ajouterAutrePresent = () => {
    setFormData(prev => ({
      ...prev,
      autresPresents: [
        ...prev.autresPresents,
        { nom: '', prenom: '', fonction: '', matricule: '' }
      ]
    }))
  }
  
  const supprimerAutrePresent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      autresPresents: prev.autresPresents.filter((_, i) => i !== index)
    }))
  }
  
  const updateAutrePresent = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      autresPresents: prev.autresPresents.map((p, i) => 
        i === index ? { ...p, [field]: value } : p
      )
    }))
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }
  
  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/pv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          convocationId: convocation.id,
          numero: `PV-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        })
      })
      
      if (response.ok) {
        alert('✅ Procès-Verbal créé avec succès !')
        onClose()
        window.location.reload()
      } else {
        throw new Error('Erreur lors de la création')
      }
    } catch (error: any) {
      alert('❌ Erreur : ' + error.message)
    } finally {
      setLoading(false)
    }
  }
  
  if (!isOpen) return null
  
  const steps = [
    { id: 1, label: 'Identification', icon: FileText },
    { id: 2, label: 'Personnes', icon: Users },
    { id: 3, label: 'Objet', icon: Scale },
    { id: 4, label: 'Avertissements', icon: Shield },
    { id: 5, label: 'Audition', icon: Mic },
    { id: 6, label: 'Éléments', icon: FileText },
    { id: 7, label: 'Clôture', icon: CheckCircle }
  ]
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <FileText className="w-7 h-7" />
              Créer un Procès-Verbal d'Audition
            </h2>
            <p className="text-purple-100 mt-1">
              Convocation {convocation?.numero} - {convocation?.convoquePrenom} {convocation?.convoqueNom}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 border-b overflow-x-auto">
          <div className="flex items-center justify-between min-w-max">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className={`flex flex-col items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      currentStep === step.id ? 'bg-purple-100 text-purple-700' : currentStep > step.id ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      currentStep === step.id ? 'bg-purple-600 text-white' : currentStep > step.id ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      {currentStep > step.id ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className="text-xs font-medium whitespace-nowrap">{step.label}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <div className={`h-1 flex-1 mx-2 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'}`} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Informations d'audition
                </h3>
                <p className="text-sm text-blue-700">
                  Renseignez les informations de date, heure et lieu de l'audition.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de l'audition <span className="text-red-500">*</span>
                  </label>
                  <Input type="date" name="dateAudition" value={formData.dateAudition} onChange={handleInputChange} required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heure début <span className="text-red-500">*</span>
                    </label>
                    <Input type="time" name="heureDebut" value={formData.heureDebut} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Heure fin</label>
                    <Input type="time" name="heureFin" value={formData.heureFin} onChange={handleInputChange} />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lieu <span className="text-red-500">*</span>
                  </label>
                  <Input type="text" name="lieu" value={formData.lieu} onChange={handleInputChange} required placeholder="Commissariat..." />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salle / Bureau</label>
                  <Input type="text" name="salle" value={formData.salle} onChange={handleInputChange} placeholder="Bureau n°..." />
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Personnes présentes à l'audition
                </h3>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 bg-purple-50">
                <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Agent auditeur (OPJ)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input type="text" name="auditeur.nom" value={formData.auditeur.nom} onChange={handleInputChange} placeholder="Nom" />
                  <Input type="text" name="auditeur.prenom" value={formData.auditeur.prenom} onChange={handleInputChange} placeholder="Prénom" />
                  <Input type="text" name="auditeur.matricule" value={formData.auditeur.matricule} onChange={handleInputChange} placeholder="Matricule" />
                  <Input type="text" name="auditeur.fonction" value={formData.auditeur.fonction} onChange={handleInputChange} placeholder="Fonction" />
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
                <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personne auditionnée
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <select name="personne_auditionnee.civilite" value={formData.personne_auditionnee.civilite} onChange={handleInputChange} className="px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">Civilité</option>
                    <option value="M">M.</option>
                    <option value="MME">Mme</option>
                    <option value="MLLE">Mlle</option>
                  </select>
                  <Input type="text" name="personne_auditionnee.nom" value={formData.personne_auditionnee.nom} onChange={handleInputChange} placeholder="Nom *" required />
                  <Input type="text" name="personne_auditionnee.prenom" value={formData.personne_auditionnee.prenom} onChange={handleInputChange} placeholder="Prénom *" required />
                  <Input type="date" name="personne_auditionnee.dateNaissance" value={formData.personne_auditionnee.dateNaissance} onChange={handleInputChange} placeholder="Date naissance" />
                  <Input type="text" name="personne_auditionnee.lieuNaissance" value={formData.personne_auditionnee.lieuNaissance} onChange={handleInputChange} placeholder="Lieu naissance" />
                  <Input type="text" name="personne_auditionnee.nationalite" value={formData.personne_auditionnee.nationalite} onChange={handleInputChange} placeholder="Nationalité" />
                  <Input type="text" name="personne_auditionnee.profession" value={formData.personne_auditionnee.profession} onChange={handleInputChange} placeholder="Profession" />
                  <Input type="tel" name="personne_auditionnee.telephone" value={formData.personne_auditionnee.telephone} onChange={handleInputChange} placeholder="Téléphone" />
                  <Input type="email" name="personne_auditionnee.email" value={formData.personne_auditionnee.email} onChange={handleInputChange} placeholder="Email" className="col-span-2" />
                  <Input type="text" name="personne_auditionnee.adresse" value={formData.personne_auditionnee.adresse} onChange={handleInputChange} placeholder="Adresse complète" className="col-span-2" />
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900">Autres personnes présentes</h4>
                  <Button onClick={ajouterAutrePresent} className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm">
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.autresPresents.map((personne, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <input type="text" value={personne.nom} onChange={(e) => updateAutrePresent(index, 'nom', e.target.value)} placeholder="Nom" className="flex-1 px-2 py-1 border rounded" />
                      <input type="text" value={personne.prenom} onChange={(e) => updateAutrePresent(index, 'prenom', e.target.value)} placeholder="Prénom" className="flex-1 px-2 py-1 border rounded" />
                      <input type="text" value={personne.fonction} onChange={(e) => updateAutrePresent(index, 'fonction', e.target.value)} placeholder="Fonction" className="flex-1 px-2 py-1 border rounded" />
                      <button onClick={() => supprimerAutrePresent(index)} className="p-2 text-red-600 hover:bg-red-100 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {formData.autresPresents.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Aucune autre personne ajoutée</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="flex items-center gap-2 mb-2">
                    <input type="checkbox" name="avocatPresent" checked={formData.avocatPresent} onChange={handleInputChange} className="w-4 h-4" />
                    <span className="font-medium">Avocat présent</span>
                  </label>
                  {formData.avocatPresent && (
                    <Input type="text" name="avocatDetails" value={formData.avocatDetails} onChange={handleInputChange} placeholder="Nom de l'avocat et barreau" />
                  )}
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="flex items-center gap-2 mb-2">
                    <input type="checkbox" name="interpretePresent" checked={formData.interpretePresent} onChange={handleInputChange} className="w-4 h-4" />
                    <span className="font-medium">Interprète présent</span>
                  </label>
                  {formData.interpretePresent && (
                    <Input type="text" name="interpreteDetails" value={formData.interpreteDetails} onChange={handleInputChange} placeholder="Nom et langue de l'interprète" />
                  )}
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  Objet de l'audition
                </h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualité de la personne <span className="text-red-500">*</span>
                </label>
                <select name="qualite" value={formData.qualite} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                  <option value="TEMOIN">Témoin</option>
                  <option value="VICTIME">Victime</option>
                  <option value="SUSPECT">Suspect</option>
                  <option value="MIS_EN_CAUSE">Mis en cause</option>
                  <option value="EXPERT">Expert</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objet de l'audition <span className="text-red-500">*</span>
                </label>
                <Textarea name="objet" value={formData.objet} onChange={handleInputChange} required rows={4} placeholder="Décrivez précisément l'objet de l'audition..." />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contexte et circonstances</label>
                <Textarea name="contexte" value={formData.contexte} onChange={handleInputChange} rows={4} placeholder="Contexte de l'affaire, circonstances..." />
              </div>
            </div>
          )}
          
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Avertissements et droits notifiés
                </h3>
                <p className="text-sm text-blue-700">Cochez les droits qui ont été notifiés à la personne auditionnée.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heure de notification des droits</label>
                <Input type="time" name="notificationHeure" value={formData.notificationHeure} onChange={handleInputChange} />
              </div>
              
              <div className="space-y-3 border border-gray-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input type="checkbox" name="droitsNotifies.droitGarderSilence" checked={formData.droitsNotifies.droitGarderSilence} onChange={handleInputChange} className="w-5 h-5 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900">Droit de garder le silence</div>
                    <div className="text-sm text-gray-600">La personne a été informée de son droit de ne pas répondre aux questions.</div>
                  </div>
                </label>
                
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input type="checkbox" name="droitsNotifies.droitAvocat" checked={formData.droitsNotifies.droitAvocat} onChange={handleInputChange} className="w-5 h-5 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900">Droit à un avocat</div>
                    <div className="text-sm text-gray-600">La personne a été informée de son droit de se faire assister par un avocat.</div>
                  </div>
                </label>
                
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input type="checkbox" name="droitsNotifies.droitInterpretes" checked={formData.droitsNotifies.droitInterpretes} onChange={handleInputChange} className="w-5 h-5 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900">Droit à un interprète</div>
                    <div className="text-sm text-gray-600">La personne a été informée de son droit à bénéficier d'un interprète.</div>
                  </div>
                </label>
                
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input type="checkbox" name="droitsNotifies.droitExamen" checked={formData.droitsNotifies.droitExamen} onChange={handleInputChange} className="w-5 h-5 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900">Droit à un examen médical</div>
                    <div className="text-sm text-gray-600">La personne a été informée de son droit à un examen médical.</div>
                  </div>
                </label>
              </div>
            </div>
          )}
          
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Déroulement de l'audition
                </h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description générale du déroulement</label>
                <Textarea name="deroulement" value={formData.deroulement} onChange={handleInputChange} rows={4} placeholder="Décrivez le déroulement général de l'audition..." />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900">Questions / Réponses</h4>
                  <Button onClick={ajouterQR} className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white text-sm">
                    <Plus className="w-4 h-4" />
                    Ajouter Q/R
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {formData.questionsReponses.map((qr, index) => (
                    <div key={index} className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-purple-900">Question {index + 1}</span>
                        <div className="flex items-center gap-2">
                          <input type="time" value={qr.heure} onChange={(e) => updateQR(index, 'heure', e.target.value)} className="px-2 py-1 text-sm border rounded" />
                          <button onClick={() => supprimerQR(index)} className="p-1 text-red-600 hover:bg-red-100 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <textarea value={qr.question} onChange={(e) => updateQR(index, 'question', e.target.value)} placeholder="Question posée..." rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        <textarea value={qr.reponse} onChange={(e) => updateQR(index, 'reponse', e.target.value)} placeholder="Réponse donnée..." rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white" />
                      </div>
                    </div>
                  ))}
                  {formData.questionsReponses.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Mic className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Aucune question ajoutée</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Éléments recueillis
                </h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Déclarations libres de la personne</label>
                <Textarea name="declarationsLibres" value={formData.declarationsLibres} onChange={handleInputChange} rows={5} placeholder="Retranscrivez les déclarations libres..." />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Observations de l'agent</label>
                <Textarea name="observations" value={formData.observations} onChange={handleInputChange} rows={4} placeholder="Vos observations sur le comportement, la cohérence du témoignage..." />
              </div>
            </div>
          )}
          
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Clôture de l'audition
                </h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heure de fin de l'audition</label>
                <Input type="time" name="heureFinAudition" value={formData.heureFinAudition} onChange={handleInputChange} />
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-center gap-2 mb-2">
                  <input type="checkbox" name="refusSignature" checked={formData.refusSignature} onChange={handleInputChange} className="w-4 h-4" />
                  <span className="font-medium">La personne a refusé de signer</span>
                </label>
                {formData.refusSignature && (
                  <Textarea name="motifRefus" value={formData.motifRefus} onChange={handleInputChange} placeholder="Motif du refus de signature..." rows={2} />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Observations finales</label>
                <Textarea name="observationsFinales" value={formData.observationsFinales} onChange={handleInputChange} rows={4} placeholder="Observations finales, remarques particulières..." />
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-bold text-green-900 mb-2">Récapitulatif</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Date :</strong> {formData.dateAudition}</p>
                  <p><strong>Personne :</strong> {formData.personne_auditionnee.prenom} {formData.personne_auditionnee.nom}</p>
                  <p><strong>Qualité :</strong> {formData.qualite}</p>
                  <p><strong>Questions/Réponses :</strong> {formData.questionsReponses.length} enregistrées</p>
                  <p><strong>Droits notifiés :</strong> {Object.values(formData.droitsNotifies).filter(Boolean).length}/4</p>
                </div>
              </div>
            </div>
          )}
          
        </div>
        
        <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button onClick={() => setCurrentStep(currentStep - 1)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700">
                Précédent
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700">
              Annuler
            </Button>
            
            {currentStep < 7 ? (
              <Button onClick={() => setCurrentStep(currentStep + 1)} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white">
                Suivant
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 disabled:opacity-50">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Créer le PV
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
