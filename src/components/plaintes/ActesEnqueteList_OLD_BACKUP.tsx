'use client'

import React, { useState, useEffect } from 'react'
import { FileText, Users, Search, Gavel, UserCheck, MapPin, Calendar, Clock, Download, Eye, Plus } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import api from '@/lib/axios'

interface ActeEnquete {
  id: string
  type: 'AUDITION' | 'PERQUISITION' | 'EXPERTISE' | 'GARDE_A_VUE' | 'CONFRONTATION' | 'RECONSTITUTION'
  date: string
  heure?: string
  duree?: string
  lieu?: string
  officier_charge: string
  description: string
  pv_numero?: string
  mandat_numero?: string
  personnes_presentes?: string[]
  objets_saisis?: string[]
  conclusions?: string
  documents_joints?: string[]
}

interface ActesEnqueteListProps {
  plainteId?: string
  actes?: ActeEnquete[]
  loading?: boolean
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'AUDITION':
      return <Users className="w-5 h-5" />
    case 'PERQUISITION':
      return <Search className="w-5 h-5" />
    case 'EXPERTISE':
      return <FileText className="w-5 h-5" />
    case 'GARDE_A_VUE':
      return <Gavel className="w-5 h-5" />
    case 'CONFRONTATION':
      return <UserCheck className="w-5 h-5" />
    case 'RECONSTITUTION':
      return <MapPin className="w-5 h-5" />
    default:
      return <FileText className="w-5 h-5" />
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'AUDITION':
      return 'bg-blue-100 text-blue-700 border-blue-300'
    case 'PERQUISITION':
      return 'bg-orange-100 text-orange-700 border-orange-300'
    case 'EXPERTISE':
      return 'bg-green-100 text-green-700 border-green-300'
    case 'GARDE_A_VUE':
      return 'bg-red-100 text-red-700 border-red-300'
    case 'CONFRONTATION':
      return 'bg-purple-100 text-purple-700 border-purple-300'
    case 'RECONSTITUTION':
      return 'bg-indigo-100 text-indigo-700 border-indigo-300'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300'
  }
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'AUDITION':
      return 'Audition'
    case 'PERQUISITION':
      return 'Perquisition'
    case 'EXPERTISE':
      return 'Expertise'
    case 'GARDE_A_VUE':
      return 'Garde à vue'
    case 'CONFRONTATION':
      return 'Confrontation'
    case 'RECONSTITUTION':
      return 'Reconstitution'
    default:
      return type
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export default function ActesEnqueteList({ plainteId }: { plainteId?: string }) {
  const [actes, setActes] = useState<ActeEnquete[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newActe, setNewActe] = useState({
    type: 'AUDITION' as ActeEnquete['type'],
    date: new Date().toISOString().split('T')[0],
    heure: new Date().toTimeString().slice(0, 5),
    duree: '',
    lieu: '',
    officier_charge: '',
    description: '',
    pv_numero: '',
    mandat_numero: '',
    conclusions: ''
  })

  useEffect(() => {
    if (plainteId) {
      fetchActes()
    }
  }, [plainteId])

  const fetchActes = async () => {
    if (!plainteId) return
    
    setLoading(true)
    try {
      const response = await api.get(`/plaintes/${plainteId}/actes-enquete`)
      setActes(response.data || [])
    } catch (error) {
      console.error('Erreur chargement actes:', error)
      setActes([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddActe = async () => {
    if (!plainteId) {
      alert('ID de plainte manquant')
      return
    }

    if (!newActe.officier_charge.trim() || !newActe.description.trim()) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }
    
    try {
      const acteData = {
        type: newActe.type,
        date: new Date(`${newActe.date}T${newActe.heure || '00:00'}:00Z`).toISOString(),
        heure: newActe.heure || undefined,
        duree: newActe.duree || undefined,
        lieu: newActe.lieu || undefined,
        officier_charge: newActe.officier_charge,
        description: newActe.description,
        pv_numero: newActe.pv_numero || undefined,
        mandat_numero: newActe.mandat_numero || undefined,
        conclusions: newActe.conclusions || undefined
      }

      await api.post(`/plaintes/${plainteId}/actes-enquete`, acteData)
      await fetchActes() // Rafraîchir
      
      // Réinitialiser le formulaire
      setNewActe({
        type: 'AUDITION',
        date: new Date().toISOString().split('T')[0],
        heure: new Date().toTimeString().slice(0, 5),
        duree: '',
        lieu: '',
        officier_charge: '',
        description: '',
        pv_numero: '',
        mandat_numero: '',
        conclusions: ''
      })
      setShowModal(false)
    } catch (error) {
      console.error('Erreur ajout acte:', error)
      alert('Erreur lors de l\'ajout de l\'acte')
    }
  }

  // Grouper par type
  const actesParType = actes.reduce((acc, acte) => {
    if (!acc[acte.type]) {
      acc[acte.type] = []
    }
    acc[acte.type].push(acte)
    return acc
  }, {} as Record<string, ActeEnquete[]>)

  // Statistiques
  const stats = {
    total: actes.length,
    auditions: actes.filter(a => a.type === 'AUDITION').length,
    perquisitions: actes.filter(a => a.type === 'PERQUISITION').length,
    expertises: actes.filter(a => a.type === 'EXPERTISE').length,
    gardesAVue: actes.filter(a => a.type === 'GARDE_A_VUE').length,
    avecPV: actes.filter(a => a.pv_numero).length,
    avecMandat: actes.filter(a => a.mandat_numero).length
  }

  if (loading) {
    return (
      <Card>
        <CardBody className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Actes d'Enquête</h3>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded"></div>
            ))}
          </div>
        </CardBody>
      </Card>
    )
  }

  if (actes.length === 0) {
    return (
      <Card>
        <CardBody className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Gavel className="w-5 h-5 text-blue-600" />
            Actes d'Enquête
          </h3>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gavel className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-slate-600 font-medium">Aucun acte d'enquête enregistré</p>
            <p className="text-sm text-slate-500 mt-1">Les actes d'enquête apparaîtront ici</p>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardBody className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Gavel className="w-5 h-5 text-blue-600" />
            Actes d'Enquête ({actes.length})
          </h3>
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter un acte
          </Button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.auditions}</div>
            <div className="text-xs text-blue-700">Auditions</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.perquisitions}</div>
            <div className="text-xs text-orange-700">Perquisitions</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.gardesAVue}</div>
            <div className="text-xs text-red-700">Gardes à vue</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.expertises}</div>
            <div className="text-xs text-green-700">Expertises</div>
          </div>
        </div>

        {/* Liste des actes */}
        <div className="space-y-4">
          {actes.map((acte, index) => (
            <div 
              key={acte.id}
              className="bg-white border-2 border-slate-200 rounded-lg p-4 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Badge numéro + icône */}
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${getTypeColor(acte.type)}`}>
                    {getTypeIcon(acte.type)}
                  </div>
                  <span className="text-xs font-bold text-slate-500">#{index + 1}</span>
                </div>

                <div className="flex-1">
                  {/* En-tête */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-lg text-slate-900 mb-1">
                        {getTypeLabel(acte.type)}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(acte.date)}</span>
                        </div>
                        {acte.heure && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{acte.heure}</span>
                          </div>
                        )}
                        {acte.duree && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                            Durée: {acte.duree}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getTypeColor(acte.type)}`}>
                      {getTypeLabel(acte.type)}
                    </div>
                  </div>

                  {/* Informations officielles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {acte.officier_charge && (
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="text-xs text-slate-500">Officier chargé</div>
                        <div className="font-medium text-slate-900">{acte.officier_charge}</div>
                      </div>
                    )}
                    {acte.lieu && (
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="text-xs text-slate-500">Lieu</div>
                        <div className="font-medium text-slate-900">{acte.lieu}</div>
                      </div>
                    )}
                    {acte.pv_numero && (
                      <div className="bg-blue-50 rounded-lg p-2">
                        <div className="text-xs text-blue-600">N° PV</div>
                        <div className="font-bold text-blue-900">{acte.pv_numero}</div>
                      </div>
                    )}
                    {acte.mandat_numero && (
                      <div className="bg-red-50 rounded-lg p-2">
                        <div className="text-xs text-red-600">N° Mandat</div>
                        <div className="font-bold text-red-900">{acte.mandat_numero}</div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="bg-slate-50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-slate-700">{acte.description}</p>
                  </div>

                  {/* Personnes présentes */}
                  {acte.personnes_presentes && acte.personnes_presentes.length > 0 && (
                    <div className="bg-purple-50 border-l-4 border-purple-500 rounded p-3 mb-3">
                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium text-purple-900 text-sm mb-1">
                            Personnes présentes ({acte.personnes_presentes.length})
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {acte.personnes_presentes.map((personne, i) => (
                              <span key={i} className="px-2 py-1 bg-white rounded text-xs text-purple-800">
                                {personne}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Objets saisis */}
                  {acte.objets_saisis && acte.objets_saisis.length > 0 && (
                    <div className="bg-orange-50 border-l-4 border-orange-500 rounded p-3 mb-3">
                      <div className="flex items-start gap-2">
                        <Search className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium text-orange-900 text-sm mb-1">
                            Objets saisis ({acte.objets_saisis.length})
                          </div>
                          <ul className="list-disc list-inside text-sm text-orange-800 space-y-1">
                            {acte.objets_saisis.map((objet, i) => (
                              <li key={i}>{objet}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Conclusions */}
                  {acte.conclusions && (
                    <div className="bg-green-50 border-l-4 border-green-500 rounded p-3 mb-3">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium text-green-900 text-sm mb-1">Conclusions</div>
                          <p className="text-sm text-green-800">{acte.conclusions}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Documents joints */}
                  {acte.documents_joints && acte.documents_joints.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                      <FileText className="w-4 h-4" />
                      <span>{acte.documents_joints.length} document(s) joint(s)</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-slate-200">
                    <Button className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs px-3 py-1">
                      <Eye className="w-3 h-3 mr-1" />
                      Détails complets
                    </Button>
                    {acte.pv_numero && (
                      <Button className="bg-green-100 hover:bg-green-200 text-green-700 text-xs px-3 py-1">
                        <Download className="w-3 h-3 mr-1" />
                        Télécharger PV
                      </Button>
                    )}
                    {acte.documents_joints && acte.documents_joints.length > 0 && (
                      <Button className="bg-orange-100 hover:bg-orange-200 text-orange-700 text-xs px-3 py-1">
                        <FileText className="w-3 h-3 mr-1" />
                        Documents ({acte.documents_joints.length})
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Résumé global */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
              <div className="text-sm text-slate-600">Total actes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.avecPV}</div>
              <div className="text-sm text-slate-600">Avec PV</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.avecMandat}</div>
              <div className="text-sm text-slate-600">Avec mandat</div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )

  return (
    <>
      <Card className="border-l-4 border-l-blue-500">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Gavel className="w-5 h-5 text-blue-600" />
              Actes d'Enquête ({actes.length})
            </h3>
            <Button 
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter un acte
            </Button>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.auditions}</div>
              <div className="text-xs text-blue-700">Auditions</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.perquisitions}</div>
              <div className="text-xs text-orange-700">Perquisitions</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.gardesAVue}</div>
              <div className="text-xs text-red-700">Gardes à vue</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.expertises}</div>
              <div className="text-xs text-green-700">Expertises</div>
            </div>
          </div>

          {/* Liste des actes */}
          <div className="space-y-4">
            {actes.map((acte, index) => (
              <div 
                key={acte.id}
                className="bg-white border-2 border-slate-200 rounded-lg p-4 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${getTypeColor(acte.type)}`}>
                      {getTypeIcon(acte.type)}
                    </div>
                    <span className="text-xs font-bold text-slate-500">#{index + 1}</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-lg text-slate-900 mb-1">
                          {getTypeLabel(acte.type)}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(acte.date)}</span>
                          </div>
                          {acte.heure && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{acte.heure}</span>
                            </div>
                          )}
                          {acte.duree && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                              Durée: {acte.duree}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getTypeColor(acte.type)}`}>
                        {getTypeLabel(acte.type)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      {acte.officier_charge && (
                        <div className="bg-gray-50 rounded-lg p-2">
                          <div className="text-xs text-slate-500">Officier chargé</div>
                          <div className="font-medium text-slate-900">{acte.officier_charge}</div>
                        </div>
                      )}
                      {acte.lieu && (
                        <div className="bg-gray-50 rounded-lg p-2">
                          <div className="text-xs text-slate-500">Lieu</div>
                          <div className="font-medium text-slate-900">{acte.lieu}</div>
                        </div>
                      )}
                      {acte.pv_numero && (
                        <div className="bg-blue-50 rounded-lg p-2">
                          <div className="text-xs text-blue-600">N° PV</div>
                          <div className="font-bold text-blue-900">{acte.pv_numero}</div>
                        </div>
                      )}
                      {acte.mandat_numero && (
                        <div className="bg-red-50 rounded-lg p-2">
                          <div className="text-xs text-red-600">N° Mandat</div>
                          <div className="font-bold text-red-900">{acte.mandat_numero}</div>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-slate-700">{acte.description}</p>
                    </div>

                    {acte.personnes_presentes && acte.personnes_presentes.length > 0 && (
                      <div className="bg-purple-50 border-l-4 border-purple-500 rounded p-3 mb-3">
                        <div className="flex items-start gap-2">
                          <Users className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-medium text-purple-900 text-sm mb-1">
                              Personnes présentes ({acte.personnes_presentes.length})
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {acte.personnes_presentes.map((personne, i) => (
                                <span key={i} className="px-2 py-1 bg-white rounded text-xs text-purple-800">
                                  {personne}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {acte.objets_saisis && acte.objets_saisis.length > 0 && (
                      <div className="bg-orange-50 border-l-4 border-orange-500 rounded p-3 mb-3">
                        <div className="flex items-start gap-2">
                          <Search className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-medium text-orange-900 text-sm mb-1">
                              Objets saisis ({acte.objets_saisis.length})
                            </div>
                            <ul className="list-disc list-inside text-sm text-orange-800 space-y-1">
                              {acte.objets_saisis.map((objet, i) => (
                                <li key={i}>{objet}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {acte.conclusions && (
                      <div className="bg-green-50 border-l-4 border-green-500 rounded p-3 mb-3">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-medium text-green-900 text-sm mb-1">Conclusions</div>
                            <p className="text-sm text-green-800">{acte.conclusions}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {acte.documents_joints && acte.documents_joints.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                        <FileText className="w-4 h-4" />
                        <span>{acte.documents_joints.length} document(s) joint(s)</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-3 border-t border-slate-200">
                      <Button className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs px-3 py-1">
                        <Eye className="w-3 h-3 mr-1" />
                        Détails complets
                      </Button>
                      {acte.pv_numero && (
                        <Button className="bg-green-100 hover:bg-green-200 text-green-700 text-xs px-3 py-1">
                          <Download className="w-3 h-3 mr-1" />
                          Télécharger PV
                        </Button>
                      )}
                      {acte.documents_joints && acte.documents_joints.length > 0 && (
                        <Button className="bg-orange-100 hover:bg-orange-200 text-orange-700 text-xs px-3 py-1">
                          <FileText className="w-3 h-3 mr-1" />
                          Documents ({acte.documents_joints.length})
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Résumé global */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
                <div className="text-sm text-slate-600">Total actes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.avecPV}</div>
                <div className="text-sm text-slate-600">Avec PV</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{stats.avecMandat}</div>
                <div className="text-sm text-slate-600">Avec mandat</div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Modal d'ajout d'acte */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="lg">
        <ModalHeader>
          <ModalTitle>Ajouter un acte d'enquête</ModalTitle>
          <ModalClose onClick={() => setShowModal(false)} />
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Type d'acte <span className="text-red-500">*</span>
                </label>
                <select 
                  value={newActe.type}
                  onChange={(e) => setNewActe({ ...newActe, type: e.target.value as ActeEnquete['type'] })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="AUDITION">Audition</option>
                  <option value="PERQUISITION">Perquisition</option>
                  <option value="EXPERTISE">Expertise</option>
                  <option value="GARDE_A_VUE">Garde à vue</option>
                  <option value="CONFRONTATION">Confrontation</option>
                  <option value="RECONSTITUTION">Reconstitution</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Officier chargé <span className="text-red-500">*</span>
                </label>
                <Input 
                  value={newActe.officier_charge}
                  onChange={(e) => setNewActe({ ...newActe, officier_charge: e.target.value })}
                  placeholder="Ex: Inspecteur Dubois"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <Input 
                  type="date"
                  value={newActe.date}
                  onChange={(e) => setNewActe({ ...newActe, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Heure
                </label>
                <Input 
                  type="time"
                  value={newActe.heure}
                  onChange={(e) => setNewActe({ ...newActe, heure: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Durée
                </label>
                <Input 
                  value={newActe.duree}
                  onChange={(e) => setNewActe({ ...newActe, duree: e.target.value })}
                  placeholder="Ex: 2h30"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Lieu
              </label>
              <Input 
                value={newActe.lieu}
                onChange={(e) => setNewActe({ ...newActe, lieu: e.target.value })}
                placeholder="Ex: Commissariat central, Bureau 12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea 
                value={newActe.description}
                onChange={(e) => setNewActe({ ...newActe, description: e.target.value })}
                placeholder="Décrivez l'acte d'enquête en détail..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  N° de PV
                </label>
                <Input 
                  value={newActe.pv_numero}
                  onChange={(e) => setNewActe({ ...newActe, pv_numero: e.target.value })}
                  placeholder="Ex: PV-2024-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  N° de Mandat
                </label>
                <Input 
                  value={newActe.mandat_numero}
                  onChange={(e) => setNewActe({ ...newActe, mandat_numero: e.target.value })}
                  placeholder="Ex: MAN-2024-042"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Conclusions
              </label>
              <Textarea 
                value={newActe.conclusions}
                onChange={(e) => setNewActe({ ...newActe, conclusions: e.target.value })}
                placeholder="Conclusions de l'acte d'enquête..."
                rows={3}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setShowModal(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleAddActe}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter l'acte
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}
