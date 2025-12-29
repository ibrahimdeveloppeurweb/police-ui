'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import {
  competenceService,
  type Competence,
  type CreateCompetenceRequest,
  type UpdateCompetenceRequest
} from '@/lib/api/services'

interface CompetenceFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  agentId: string
  competence?: Competence
}

const TYPES_COMPETENCE = [
  { value: 'permis', label: 'Permis de conduire' },
  { value: 'habilitation', label: 'Habilitation' },
  { value: 'certification', label: 'Certification' },
  { value: 'formation', label: 'Formation' },
  { value: 'aptitude', label: 'Aptitude physique' },
  { value: 'arme', label: 'Port d\'arme' },
  { value: 'secourisme', label: 'Secourisme' },
  { value: 'autre', label: 'Autre' },
]

export function CompetenceForm({ isOpen, onClose, onSuccess, agentId, competence }: CompetenceFormProps) {
  const isEditing = !!competence

  const [formData, setFormData] = useState({
    nom: competence?.nom || '',
    type: competence?.type || '',
    description: competence?.description || '',
    organisme: competence?.organisme || '',
    dateObtention: competence?.dateObtention?.split('T')[0] || '',
    dateExpiration: competence?.dateExpiration?.split('T')[0] || '',
    active: competence?.active ?? true,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Reset form when competence changes
  useEffect(() => {
    setFormData({
      nom: competence?.nom || '',
      type: competence?.type || '',
      description: competence?.description || '',
      organisme: competence?.organisme || '',
      dateObtention: competence?.dateObtention?.split('T')[0] || '',
      dateExpiration: competence?.dateExpiration?.split('T')[0] || '',
      active: competence?.active ?? true,
    })
    setError('')
  }, [competence])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isEditing && competence) {
        const updateData: UpdateCompetenceRequest = {
          nom: formData.nom,
          description: formData.description || undefined,
          organisme: formData.organisme || undefined,
          dateExpiration: formData.dateExpiration || undefined,
          active: formData.active,
        }
        const response = await competenceService.update(competence.id, updateData)
        if (!response.success) {
          setError(response.message || 'Erreur lors de la modification')
          setLoading(false)
          return
        }
      } else {
        // Creer la competence puis l'assigner a l'agent
        const createData: CreateCompetenceRequest = {
          nom: formData.nom,
          type: formData.type,
          description: formData.description || undefined,
          organisme: formData.organisme || undefined,
          dateObtention: formData.dateObtention || undefined,
          dateExpiration: formData.dateExpiration || undefined,
        }
        const response = await competenceService.create(createData)
        if (!response.success) {
          setError(response.message || 'Erreur lors de la creation')
          setLoading(false)
          return
        }
        if (response.data) {
          const assignResponse = await competenceService.assignToAgent(response.data.id, agentId)
          if (!assignResponse.success) {
            setError(assignResponse.message || 'Erreur lors de l\'assignation')
            setLoading(false)
            return
          }
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

  const calculateDaysRemaining = () => {
    if (!formData.dateExpiration) return null
    const expDate = new Date(formData.dateExpiration)
    const today = new Date()
    const diffTime = expDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysRemaining = calculateDaysRemaining()

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>{isEditing ? 'Modifier la competence' : 'Nouvelle competence'}</ModalTitle>
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
                Nom de la competence *
              </label>
              <Input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ex: Permis B, PSC1, Habilitation electrique..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                  disabled={isEditing}
                >
                  <option value="">Selectionnez un type</option>
                  {TYPES_COMPETENCE.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organisme
                </label>
                <Input
                  type="text"
                  value={formData.organisme}
                  onChange={(e) => setFormData({ ...formData, organisme: e.target.value })}
                  placeholder="Ex: Prefecture, CNFPT..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Details supplementaires..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d&apos;obtention
                </label>
                <Input
                  type="date"
                  value={formData.dateObtention}
                  onChange={(e) => setFormData({ ...formData, dateObtention: e.target.value })}
                  disabled={isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d&apos;expiration
                </label>
                <Input
                  type="date"
                  value={formData.dateExpiration}
                  onChange={(e) => setFormData({ ...formData, dateExpiration: e.target.value })}
                />
              </div>
            </div>

            {daysRemaining !== null && (
              <div className={`p-3 rounded-lg ${
                daysRemaining <= 0
                  ? 'bg-red-50 border border-red-200'
                  : daysRemaining <= 30
                  ? 'bg-orange-50 border border-orange-200'
                  : daysRemaining <= 90
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'bg-green-50 border border-green-200'
              }`}>
                <div className={`text-sm font-medium ${
                  daysRemaining <= 0
                    ? 'text-red-700'
                    : daysRemaining <= 30
                    ? 'text-orange-700'
                    : daysRemaining <= 90
                    ? 'text-yellow-700'
                    : 'text-green-700'
                }`}>
                  {daysRemaining <= 0
                    ? `Expiree depuis ${Math.abs(daysRemaining)} jour(s)`
                    : `${daysRemaining} jour(s) restant(s)`}
                </div>
              </div>
            )}

            {isEditing && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="activeCompetence"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <label htmlFor="activeCompetence" className="text-sm text-gray-700 cursor-pointer">
                  Competence active
                </label>
              </div>
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
