'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import {
  missionService,
  equipeService,
  type Mission,
  type CreateMissionRequest,
  type UpdateMissionRequest,
  type Equipe
} from '@/lib/api/services'

interface MissionFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  agentId: string
  mission?: Mission // If provided, we're editing
}

const MISSION_TYPES = [
  { value: 'patrouille', label: 'Patrouille' },
  { value: 'controle_routier', label: 'Controle Routier' },
  { value: 'intervention', label: 'Intervention' },
  { value: 'surveillance', label: 'Surveillance' },
  { value: 'escorte', label: 'Escorte' },
  { value: 'formation', label: 'Formation' },
  { value: 'autre', label: 'Autre' },
]

export function MissionForm({ isOpen, onClose, onSuccess, agentId, mission }: MissionFormProps) {
  const isEditing = !!mission

  const [formData, setFormData] = useState<CreateMissionRequest>({
    type: mission?.type || '',
    titre: mission?.titre || '',
    dateDebut: mission?.dateDebut?.split('T')[0] || new Date().toISOString().split('T')[0],
    dateFin: mission?.dateFin?.split('T')[0] || '',
    duree: mission?.duree || '',
    zone: mission?.zone || '',
    agentIds: [agentId],
    equipeId: mission?.equipe?.id || '',
  })

  const [rapport, setRapport] = useState(mission?.rapport || '')
  const [statut, setStatut] = useState(mission?.statut || 'planifiee')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [loadingEquipes, setLoadingEquipes] = useState(false)

  // Load equipes on mount
  useEffect(() => {
    const loadEquipes = async () => {
      setLoadingEquipes(true)
      try {
        const response = await equipeService.getAll()
        if (response.success && response.data) {
          setEquipes(response.data)
        }
      } catch (err) {
        console.error('Failed to load equipes:', err)
      } finally {
        setLoadingEquipes(false)
      }
    }
    loadEquipes()
  }, [])

  // Reset form when mission changes
  useEffect(() => {
    setFormData({
      type: mission?.type || '',
      titre: mission?.titre || '',
      dateDebut: mission?.dateDebut?.split('T')[0] || new Date().toISOString().split('T')[0],
      dateFin: mission?.dateFin?.split('T')[0] || '',
      duree: mission?.duree || '',
      zone: mission?.zone || '',
      agentIds: [agentId],
      equipeId: mission?.equipe?.id || '',
    })
    setRapport(mission?.rapport || '')
    setStatut(mission?.statut || 'planifiee')
    setError('')
  }, [mission, agentId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isEditing && mission) {
        const updateData: UpdateMissionRequest = {
          titre: formData.titre,
          zone: formData.zone,
          duree: formData.duree,
          statut: statut,
          rapport: rapport,
          dateFin: formData.dateFin || undefined,
        }
        const response = await missionService.update(mission.id, updateData)
        if (!response.success) {
          setError(response.message || 'Erreur lors de la modification')
          setLoading(false)
          return
        }
      } else {
        const response = await missionService.create(formData)
        if (!response.success) {
          setError(response.message || 'Erreur lors de la creation')
          setLoading(false)
          return
        }
      }
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>{isEditing ? 'Modifier la mission' : 'Nouvelle mission'}</ModalTitle>
        <ModalClose onClick={onClose} />
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <ModalBody>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de mission *
              </label>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
                disabled={isEditing}
              >
                <option value="">Selectionnez un type</option>
                {MISSION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre
              </label>
              <Input
                type="text"
                value={formData.titre || ''}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                placeholder="Ex: Patrouille secteur nord"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Equipe
              </label>
              <Select
                value={formData.equipeId || ''}
                onChange={(e) => setFormData({ ...formData, equipeId: e.target.value })}
                disabled={loadingEquipes}
              >
                <option value="">Aucune equipe</option>
                {equipes.map((equipe) => (
                  <option key={equipe.id} value={equipe.id}>
                    {equipe.nom} ({equipe.code})
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de debut *
                </label>
                <Input
                  type="date"
                  value={formData.dateDebut}
                  onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin
                </label>
                <Input
                  type="date"
                  value={formData.dateFin || ''}
                  onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duree
                </label>
                <Input
                  type="text"
                  value={formData.duree || ''}
                  onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
                  placeholder="Ex: 4h, 1 jour"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zone
                </label>
                <Input
                  type="text"
                  value={formData.zone || ''}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  placeholder="Ex: Secteur Nord"
                />
              </div>
            </div>

            {isEditing && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <Select
                    value={statut}
                    onChange={(e) => setStatut(e.target.value)}
                  >
                    <option value="planifiee">Planifiee</option>
                    <option value="en_cours">En cours</option>
                    <option value="terminee">Terminee</option>
                    <option value="annulee">Annulee</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rapport
                  </label>
                  <Textarea
                    value={rapport}
                    onChange={(e) => setRapport(e.target.value)}
                    placeholder="Rapport de mission..."
                    rows={4}
                  />
                </div>
              </>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Creer'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
