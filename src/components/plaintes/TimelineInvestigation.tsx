'use client'

import React, { useState, useEffect } from 'react'
import { Clock, Plus, CheckCircle, AlertCircle, Calendar, User, FileText } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import api from '@/lib/axios'

interface TimelineEvent {
  id: string
  date: string
  heure?: string
  type: 'DEPOT' | 'AUDITION' | 'PERQUISITION' | 'EXPERTISE' | 'CONVOCATION' | 'DECISION' | 'AUTRE'
  titre: string
  description: string
  acteur?: string
  statut?: 'EN_COURS' | 'TERMINE' | 'ANNULE'
  documents?: string[]
}

interface TimelineInvestigationProps {
  plainteId?: string
  events?: TimelineEvent[]
  onAddEvent?: (event: Omit<TimelineEvent, 'id'>) => void
  readonly?: boolean
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'DEPOT':
      return <FileText className="w-4 h-4" />
    case 'AUDITION':
      return <User className="w-4 h-4" />
    case 'PERQUISITION':
      return <AlertCircle className="w-4 h-4" />
    case 'EXPERTISE':
      return <CheckCircle className="w-4 h-4" />
    case 'CONVOCATION':
      return <Calendar className="w-4 h-4" />
    case 'DECISION':
      return <CheckCircle className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'DEPOT':
      return 'bg-blue-100 text-blue-700 border-blue-300'
    case 'AUDITION':
      return 'bg-purple-100 text-purple-700 border-purple-300'
    case 'PERQUISITION':
      return 'bg-orange-100 text-orange-700 border-orange-300'
    case 'EXPERTISE':
      return 'bg-green-100 text-green-700 border-green-300'
    case 'CONVOCATION':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    case 'DECISION':
      return 'bg-indigo-100 text-indigo-700 border-indigo-300'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300'
  }
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'DEPOT':
      return 'Dépôt'
    case 'AUDITION':
      return 'Audition'
    case 'PERQUISITION':
      return 'Perquisition'
    case 'EXPERTISE':
      return 'Expertise'
    case 'CONVOCATION':
      return 'Convocation'
    case 'DECISION':
      return 'Décision'
    default:
      return 'Autre'
  }
}

const getStatutBadge = (statut?: string) => {
  switch (statut) {
    case 'TERMINE':
      return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Terminé</span>
    case 'EN_COURS':
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">En cours</span>
    case 'ANNULE':
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Annulé</span>
    default:
      return null
  }
}

export default function TimelineInvestigation({ plainteId, events: initialEvents = [], onAddEvent, readonly = false }: TimelineInvestigationProps) {
  const [showModal, setShowModal] = useState(false)
  const [events, setEvents] = useState<TimelineEvent[]>(initialEvents)
  const [loading, setLoading] = useState(false)
  const [newEvent, setNewEvent] = useState({
    date: new Date().toISOString().split('T')[0],
    heure: new Date().toTimeString().slice(0, 5),
    type: 'AUTRE' as TimelineEvent['type'],
    titre: '',
    description: '',
    acteur: '',
    statut: 'EN_COURS' as TimelineEvent['statut']
  })

  useEffect(() => {
    if (plainteId) {
      fetchTimeline()
    }
  }, [plainteId])

  const fetchTimeline = async () => {
    if (!plainteId) return
    
    setLoading(true)
    try {
      const response = await api.get(`/plaintes/${plainteId}/timeline`)
      setEvents(response.data || [])
    } catch (error) {
      console.error('Erreur chargement timeline:', error)
      setEvents([])
    } finally {
      setLoading(false)
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

  const handleAddEvent = async () => {
    if (!newEvent.titre.trim() || !newEvent.description.trim()) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (!plainteId) {
      alert('ID de plainte manquant')
      return
    }

    try {
      const eventData = {
        date: new Date(`${newEvent.date}T${newEvent.heure || '00:00'}:00Z`).toISOString(),
        heure: newEvent.heure || undefined,
        type: newEvent.type,
        titre: newEvent.titre,
        description: newEvent.description,
        acteur: newEvent.acteur || undefined,
        statut: newEvent.statut || undefined
      }

      await api.post(`/plaintes/${plainteId}/timeline`, eventData)
      
      // Rafraîchir la timeline
      await fetchTimeline()
      
      // Réinitialiser le formulaire
      setNewEvent({
        date: new Date().toISOString().split('T')[0],
        heure: new Date().toTimeString().slice(0, 5),
        type: 'AUTRE',
        titre: '',
        description: '',
        acteur: '',
        statut: 'EN_COURS'
      })
      setShowModal(false)

      // Appeler le callback si fourni
      if (onAddEvent) {
        onAddEvent(eventData as any)
      }
    } catch (error) {
      console.error('Erreur ajout événement:', error)
      alert('Erreur lors de l\'ajout de l\'événement')
    }
  }

  // Trier les événements par date décroissante
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(a.date + (a.heure ? ` ${a.heure}` : ''))
    const dateB = new Date(b.date + (b.heure ? ` ${b.heure}` : ''))
    return dateB.getTime() - dateA.getTime()
  })

  return (
    <>
      <Card>
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Timeline de l'Investigation ({events.length} événements)
            </h3>
            {!readonly && plainteId && (
              <Button 
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </Button>
            )}
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-slate-600 font-medium">Aucun événement enregistré</p>
              <p className="text-sm text-slate-500 mt-1">Les événements de l'enquête apparaîtront ici</p>
            </div>
          ) : (
            <div className="relative">
              {/* Ligne verticale */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-blue-300 to-blue-200"></div>

              <div className="space-y-6">
                {sortedEvents.map((event, index) => (
                  <div key={event.id} className="relative pl-20">
                    {/* Point sur la timeline */}
                    <div className={`absolute left-0 w-16 h-16 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${getTypeColor(event.type)}`}>
                      {getTypeIcon(event.type)}
                    </div>

                    {/* Badge de type */}
                    <div className="absolute left-20 -top-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${getTypeColor(event.type)}`}>
                        {getTypeLabel(event.type)}
                      </span>
                    </div>

                    {/* Contenu de l'événement */}
                    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 mb-1">{event.titre}</h4>
                          <div className="flex items-center gap-3 text-sm text-slate-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(event.date)}</span>
                            </div>
                            {event.heure && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{event.heure}</span>
                              </div>
                            )}
                            {event.acteur && (
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <span>{event.acteur}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {getStatutBadge(event.statut)}
                      </div>

                      <p className="text-sm text-slate-700 bg-slate-50 rounded p-3">
                        {event.description}
                      </p>

                      {event.documents && event.documents.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <FileText className="w-4 h-4" />
                            <span className="font-medium">{event.documents.length} document(s) joint(s)</span>
                          </div>
                        </div>
                      )}

                      {/* Ligne de connexion au prochain événement */}
                      {index < sortedEvents.length - 1 && (
                        <div className="absolute left-8 top-20 bottom-0 w-px bg-gradient-to-b from-blue-300 to-transparent"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modal d'ajout d'événement */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="lg">
        <ModalHeader>
          <ModalTitle>Ajouter un événement</ModalTitle>
          <ModalClose onClick={() => setShowModal(false)} />
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <Input 
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Heure
                </label>
                <Input 
                  type="time"
                  value={newEvent.heure}
                  onChange={(e) => setNewEvent({ ...newEvent, heure: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Type d'événement <span className="text-red-500">*</span>
                </label>
                <select 
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as TimelineEvent['type'] })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DEPOT">Dépôt</option>
                  <option value="AUDITION">Audition</option>
                  <option value="PERQUISITION">Perquisition</option>
                  <option value="EXPERTISE">Expertise</option>
                  <option value="CONVOCATION">Convocation</option>
                  <option value="DECISION">Décision</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Statut
                </label>
                <select 
                  value={newEvent.statut}
                  onChange={(e) => setNewEvent({ ...newEvent, statut: e.target.value as TimelineEvent['statut'] })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EN_COURS">En cours</option>
                  <option value="TERMINE">Terminé</option>
                  <option value="ANNULE">Annulé</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Titre <span className="text-red-500">*</span>
              </label>
              <Input 
                value={newEvent.titre}
                onChange={(e) => setNewEvent({ ...newEvent, titre: e.target.value })}
                placeholder="Ex: Audition du témoin principal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Acteur / Responsable
              </label>
              <Input 
                value={newEvent.acteur}
                onChange={(e) => setNewEvent({ ...newEvent, acteur: e.target.value })}
                placeholder="Ex: Inspecteur Martin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea 
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Décrivez l'événement en détail..."
                rows={4}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setShowModal(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleAddEvent}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter l'événement
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}
