'use client'

import React, { useState, useEffect } from 'react'
import { FileText, Camera, Fingerprint, Link, CheckCircle, Clock, Shield, Download, Eye, Plus } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import api from '@/lib/axios'

interface Preuve {
  id: string
  numero_piece: string
  type: 'MATERIELLE' | 'NUMERIQUE' | 'TESTIMONIALE' | 'DOCUMENTAIRE'
  description: string
  lieu_conservation?: string
  date_collecte: string
  collecte_par?: string
  photos?: string[]
  hash_verification?: string
  expertise_demandee: boolean
  expertise_type?: string
  expertise_resultat?: string
  statut: 'COLLECTEE' | 'EN_ANALYSE' | 'ANALYSEE' | 'RETOURNEE'
}

interface PreuvesListProps {
  plainteId?: string
  preuves?: Preuve[]
  loading?: boolean
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'MATERIELLE':
      return <Fingerprint className="w-5 h-5" />
    case 'NUMERIQUE':
      return <Link className="w-5 h-5" />
    case 'TESTIMONIALE':
      return <FileText className="w-5 h-5" />
    case 'DOCUMENTAIRE':
      return <FileText className="w-5 h-5" />
    default:
      return <FileText className="w-5 h-5" />
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'MATERIELLE':
      return 'bg-purple-100 text-purple-700 border-purple-300'
    case 'NUMERIQUE':
      return 'bg-blue-100 text-blue-700 border-blue-300'
    case 'TESTIMONIALE':
      return 'bg-green-100 text-green-700 border-green-300'
    case 'DOCUMENTAIRE':
      return 'bg-orange-100 text-orange-700 border-orange-300'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300'
  }
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'MATERIELLE':
      return 'Matérielle'
    case 'NUMERIQUE':
      return 'Numérique'
    case 'TESTIMONIALE':
      return 'Testimoniale'
    case 'DOCUMENTAIRE':
      return 'Documentaire'
    default:
      return type
  }
}

const getStatutBadge = (statut: string) => {
  switch (statut) {
    case 'COLLECTEE':
      return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Collectée</span>
    case 'EN_ANALYSE':
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">En analyse</span>
    case 'ANALYSEE':
      return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Analysée</span>
    case 'RETOURNEE':
      return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">Retournée</span>
    default:
      return null
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

export default function PreuvesList({ plainteId }: { plainteId?: string }) {
  const [preuves, setPreuves] = useState<Preuve[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPreuve, setSelectedPreuve] = useState<Preuve | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [newPreuve, setNewPreuve] = useState({
    numero_piece: '',
    type: 'MATERIELLE' as Preuve['type'],
    description: '',
    lieu_conservation: '',
    date_collecte: new Date().toISOString().split('T')[0],
    collecte_par: '',
    expertise_demandee: false,
    expertise_type: '',
    statut: 'COLLECTEE' as Preuve['statut']
  })

  useEffect(() => {
    if (plainteId) {
      fetchPreuves()
    }
  }, [plainteId])

  const fetchPreuves = async () => {
    if (!plainteId) return
    
    setLoading(true)
    try {
      const response = await api.get(`/plaintes/${plainteId}/preuves`)
      setPreuves(response.data || [])
    } catch (error) {
      console.error('Erreur chargement preuves:', error)
      setPreuves([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddPreuve = async () => {
    if (!plainteId) {
      alert('ID de plainte manquant')
      return
    }

    if (!newPreuve.numero_piece.trim() || !newPreuve.description.trim()) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }
    
    try {
      const preuveData = {
        numero_piece: newPreuve.numero_piece,
        type: newPreuve.type,
        description: newPreuve.description,
        lieu_conservation: newPreuve.lieu_conservation || undefined,
        date_collecte: new Date(newPreuve.date_collecte).toISOString(),
        collecte_par: newPreuve.collecte_par || undefined,
        expertise_demandee: newPreuve.expertise_demandee,
        expertise_type: newPreuve.expertise_demandee ? newPreuve.expertise_type : undefined,
        statut: newPreuve.statut
      }

      await api.post(`/plaintes/${plainteId}/preuves`, preuveData)
      await fetchPreuves() // Rafraîchir
      
      // Réinitialiser le formulaire
      setNewPreuve({
        numero_piece: '',
        type: 'MATERIELLE',
        description: '',
        lieu_conservation: '',
        date_collecte: new Date().toISOString().split('T')[0],
        collecte_par: '',
        expertise_demandee: false,
        expertise_type: '',
        statut: 'COLLECTEE'
      })
      setShowModal(false)
    } catch (error) {
      console.error('Erreur ajout preuve:', error)
      alert('Erreur lors de l\'ajout de la preuve')
    }
  }

  // Grouper par type
  const preuvesParType = preuves.reduce((acc, preuve) => {
    if (!acc[preuve.type]) {
      acc[preuve.type] = []
    }
    acc[preuve.type].push(preuve)
    return acc
  }, {} as Record<string, Preuve[]>)

  // Statistiques
  const stats = {
    total: preuves.length,
    materielles: preuves.filter(p => p.type === 'MATERIELLE').length,
    numeriques: preuves.filter(p => p.type === 'NUMERIQUE').length,
    testimoniales: preuves.filter(p => p.type === 'TESTIMONIALE').length,
    documentaires: preuves.filter(p => p.type === 'DOCUMENTAIRE').length,
    enAnalyse: preuves.filter(p => p.statut === 'EN_ANALYSE').length,
    avecExpertise: preuves.filter(p => p.expertise_demandee).length
  }

  if (loading) {
    return (
      <Card>
        <CardBody className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Preuves et Pièces à Conviction</h3>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-slate-200 rounded"></div>
            ))}
          </div>
        </CardBody>
      </Card>
    )
  }

  if (preuves.length === 0) {
    return (
      <Card>
        <CardBody className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Preuves et Pièces à Conviction
          </h3>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-slate-600 font-medium">Aucune preuve enregistrée</p>
            <p className="text-sm text-slate-500 mt-1">Les preuves collectées apparaîtront ici</p>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardBody className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Preuves et Pièces à Conviction ({preuves.length})
          </h3>
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter une preuve
          </Button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.materielles}</div>
            <div className="text-xs text-purple-700">Matérielles</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.numeriques}</div>
            <div className="text-xs text-blue-700">Numériques</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.enAnalyse}</div>
            <div className="text-xs text-yellow-700">En analyse</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.avecExpertise}</div>
            <div className="text-xs text-green-700">Expertisées</div>
          </div>
        </div>

        {/* Liste des preuves par type */}
        <div className="space-y-6">
          {Object.entries(preuvesParType).map(([type, preuvesType]) => (
            <div key={type}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-2 rounded-lg ${getTypeColor(type)}`}>
                  {getTypeIcon(type)}
                </div>
                <h4 className="font-bold text-slate-900">
                  {getTypeLabel(type)} ({preuvesType.length})
                </h4>
              </div>

              <div className="space-y-3 ml-0 md:ml-10">
                {preuvesType.map((preuve) => (
                  <div 
                    key={preuve.id}
                    className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(type)}`}>
                        {getTypeIcon(type)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h5 className="font-bold text-slate-900 mb-1">
                              Pièce #{preuve.numero_piece}
                            </h5>
                            <p className="text-sm text-slate-700">{preuve.description}</p>
                          </div>
                          {getStatutBadge(preuve.statut)}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-slate-600 mb-3">
                          <div>
                            <div className="text-xs text-slate-500">Date collecte</div>
                            <div className="font-medium">{formatDate(preuve.date_collecte)}</div>
                          </div>
                          {preuve.collecte_par && (
                            <div>
                              <div className="text-xs text-slate-500">Collectée par</div>
                              <div className="font-medium">{preuve.collecte_par}</div>
                            </div>
                          )}
                          {preuve.lieu_conservation && (
                            <div>
                              <div className="text-xs text-slate-500">Conservation</div>
                              <div className="font-medium">{preuve.lieu_conservation}</div>
                            </div>
                          )}
                        </div>

                        {/* Chaîne de traçabilité */}
                        {preuve.hash_verification && (
                          <div className="bg-gray-50 rounded p-2 mb-3">
                            <div className="flex items-center gap-2 text-xs">
                              <Shield className="w-4 h-4 text-green-600" />
                              <span className="font-medium text-slate-700">Chaîne de traçabilité:</span>
                              <code className="text-xs bg-white px-2 py-1 rounded font-mono">
                                {preuve.hash_verification.substring(0, 16)}...
                              </code>
                            </div>
                          </div>
                        )}

                        {/* Expertise */}
                        {preuve.expertise_demandee && (
                          <div className="bg-blue-50 border-l-4 border-blue-500 rounded p-3 mb-3">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-medium text-blue-900 text-sm mb-1">
                                  Expertise: {preuve.expertise_type || 'En cours'}
                                </div>
                                {preuve.expertise_resultat && (
                                  <p className="text-sm text-blue-800">{preuve.expertise_resultat}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Photos */}
                        {preuve.photos && preuve.photos.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4 text-slate-500" />
                            <span className="text-sm text-slate-600">
                              {preuve.photos.length} photo(s) disponible(s)
                            </span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                          <Button 
                            onClick={() => setSelectedPreuve(preuve)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs px-3 py-1"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Détails
                          </Button>
                          {preuve.photos && preuve.photos.length > 0 && (
                            <Button className="bg-green-100 hover:bg-green-200 text-green-700 text-xs px-3 py-1">
                              <Camera className="w-3 h-3 mr-1" />
                              Photos
                            </Button>
                          )}
                          <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1">
                            <Download className="w-3 h-3 mr-1" />
                            Exporter
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Légende des statuts */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h5 className="text-sm font-bold text-slate-700 mb-3">Légende des statuts :</h5>
          <div className="flex flex-wrap gap-3">
            {getStatutBadge('COLLECTEE')}
            {getStatutBadge('EN_ANALYSE')}
            {getStatutBadge('ANALYSEE')}
            {getStatutBadge('RETOURNEE')}
          </div>
        </div>
      </CardBody>
    </Card>
  )

  return (
    <>
      {/* Contenu principal */}
      <Card className="border-l-4 border-l-purple-500">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Preuves et Pièces à Conviction ({preuves.length})
            </h3>
            <Button 
              onClick={() => setShowModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter une preuve
            </Button>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.materielles}</div>
              <div className="text-xs text-purple-700">Matérielles</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.numeriques}</div>
              <div className="text-xs text-blue-700">Numériques</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.enAnalyse}</div>
              <div className="text-xs text-yellow-700">En analyse</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.avecExpertise}</div>
              <div className="text-xs text-green-700">Expertisées</div>
            </div>
          </div>

          {/* Liste des preuves - même code qu'avant */}
          <div className="space-y-6">
            {Object.entries(preuvesParType).map(([type, preuvesType]) => (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-2 rounded-lg ${getTypeColor(type)}`}>
                    {getTypeIcon(type)}
                  </div>
                  <h4 className="font-bold text-slate-900">
                    {getTypeLabel(type)} ({preuvesType.length})
                  </h4>
                </div>

                <div className="space-y-3 ml-0 md:ml-10">
                  {preuvesType.map((preuve) => (
                    <div 
                      key={preuve.id}
                      className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(type)}`}>
                          {getTypeIcon(type)}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h5 className="font-bold text-slate-900 mb-1">
                                Pièce #{preuve.numero_piece}
                              </h5>
                              <p className="text-sm text-slate-700">{preuve.description}</p>
                            </div>
                            {getStatutBadge(preuve.statut)}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-slate-600 mb-3">
                            <div>
                              <div className="text-xs text-slate-500">Date collecte</div>
                              <div className="font-medium">{formatDate(preuve.date_collecte)}</div>
                            </div>
                            {preuve.collecte_par && (
                              <div>
                                <div className="text-xs text-slate-500">Collectée par</div>
                                <div className="font-medium">{preuve.collecte_par}</div>
                              </div>
                            )}
                            {preuve.lieu_conservation && (
                              <div>
                                <div className="text-xs text-slate-500">Conservation</div>
                                <div className="font-medium">{preuve.lieu_conservation}</div>
                              </div>
                            )}
                          </div>

                          {preuve.hash_verification && (
                            <div className="bg-gray-50 rounded p-2 mb-3">
                              <div className="flex items-center gap-2 text-xs">
                                <Shield className="w-4 h-4 text-green-600" />
                                <span className="font-medium text-slate-700">Chaîne de traçabilité:</span>
                                <code className="text-xs bg-white px-2 py-1 rounded font-mono">
                                  {preuve.hash_verification.substring(0, 16)}...
                                </code>
                              </div>
                            </div>
                          )}

                          {preuve.expertise_demandee && (
                            <div className="bg-blue-50 border-l-4 border-blue-500 rounded p-3 mb-3">
                              <div className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <div className="font-medium text-blue-900 text-sm mb-1">
                                    Expertise: {preuve.expertise_type || 'En cours'}
                                  </div>
                                  {preuve.expertise_resultat && (
                                    <p className="text-sm text-blue-800">{preuve.expertise_resultat}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {preuve.photos && preuve.photos.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Camera className="w-4 h-4 text-slate-500" />
                              <span className="text-sm text-slate-600">
                                {preuve.photos.length} photo(s) disponible(s)
                              </span>
                            </div>
                          )}

                          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                            <Button 
                              onClick={() => setSelectedPreuve(preuve)}
                              className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs px-3 py-1"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Détails
                            </Button>
                            {preuve.photos && preuve.photos.length > 0 && (
                              <Button className="bg-green-100 hover:bg-green-200 text-green-700 text-xs px-3 py-1">
                                <Camera className="w-3 h-3 mr-1" />
                                Photos
                              </Button>
                            )}
                            <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1">
                              <Download className="w-3 h-3 mr-1" />
                              Exporter
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Légende des statuts */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h5 className="text-sm font-bold text-slate-700 mb-3">Légende des statuts :</h5>
            <div className="flex flex-wrap gap-3">
              {getStatutBadge('COLLECTEE')}
              {getStatutBadge('EN_ANALYSE')}
              {getStatutBadge('ANALYSEE')}
              {getStatutBadge('RETOURNEE')}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Modal d'ajout de preuve */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="lg">
        <ModalHeader>
          <ModalTitle>Ajouter une preuve / pièce à conviction</ModalTitle>
          <ModalClose onClick={() => setShowModal(false)} />
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  N° Pièce <span className="text-red-500">*</span>
                </label>
                <Input 
                  value={newPreuve.numero_piece}
                  onChange={(e) => setNewPreuve({ ...newPreuve, numero_piece: e.target.value })}
                  placeholder="Ex: P-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Type de preuve <span className="text-red-500">*</span>
                </label>
                <select 
                  value={newPreuve.type}
                  onChange={(e) => setNewPreuve({ ...newPreuve, type: e.target.value as Preuve['type'] })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="MATERIELLE">Matérielle</option>
                  <option value="NUMERIQUE">Numérique</option>
                  <option value="TESTIMONIALE">Testimoniale</option>
                  <option value="DOCUMENTAIRE">Documentaire</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea 
                value={newPreuve.description}
                onChange={(e) => setNewPreuve({ ...newPreuve, description: e.target.value })}
                placeholder="Décrivez la preuve en détail..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date de collecte <span className="text-red-500">*</span>
                </label>
                <Input 
                  type="date"
                  value={newPreuve.date_collecte}
                  onChange={(e) => setNewPreuve({ ...newPreuve, date_collecte: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Statut
                </label>
                <select 
                  value={newPreuve.statut}
                  onChange={(e) => setNewPreuve({ ...newPreuve, statut: e.target.value as Preuve['statut'] })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="COLLECTEE">Collectée</option>
                  <option value="EN_ANALYSE">En analyse</option>
                  <option value="ANALYSEE">Analysée</option>
                  <option value="RETOURNEE">Retournée</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Collectée par
                </label>
                <Input 
                  value={newPreuve.collecte_par}
                  onChange={(e) => setNewPreuve({ ...newPreuve, collecte_par: e.target.value })}
                  placeholder="Ex: Inspecteur Martin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Lieu de conservation
                </label>
                <Input 
                  value={newPreuve.lieu_conservation}
                  onChange={(e) => setNewPreuve({ ...newPreuve, lieu_conservation: e.target.value })}
                  placeholder="Ex: Scellé 12B"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <input 
                  type="checkbox"
                  id="expertise"
                  checked={newPreuve.expertise_demandee}
                  onChange={(e) => setNewPreuve({ ...newPreuve, expertise_demandee: e.target.checked })}
                  className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="expertise" className="text-sm font-medium text-slate-700">
                  Expertise demandée
                </label>
              </div>
              {newPreuve.expertise_demandee && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Type d'expertise
                  </label>
                  <Input 
                    value={newPreuve.expertise_type}
                    onChange={(e) => setNewPreuve({ ...newPreuve, expertise_type: e.target.value })}
                    placeholder="Ex: Analyse ADN, Balistique..."
                  />
                </div>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setShowModal(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleAddPreuve}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter la preuve
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}
