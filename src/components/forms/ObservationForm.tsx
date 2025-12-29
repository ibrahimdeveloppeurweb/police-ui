'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import {
  observationService,
  type Observation,
  type CreateObservationRequest,
  type UpdateObservationRequest
} from '@/lib/api/services'

interface ObservationFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  agentId: string
  auteurId?: string
  observation?: Observation
}

const TYPES_OBSERVATION = [
  { value: 'positive', label: 'Positive' },
  { value: 'negative', label: 'Negative' },
  { value: 'neutre', label: 'Neutre' },
  { value: 'disciplinaire', label: 'Disciplinaire' },
  { value: 'encouragement', label: 'Encouragement' },
]

const CATEGORIES = [
  { value: 'performance', label: 'Performance' },
  { value: 'comportement', label: 'Comportement' },
  { value: 'ponctualite', label: 'Ponctualite' },
  { value: 'tenue', label: 'Tenue' },
  { value: 'relation', label: 'Relation collegiale' },
  { value: 'competence', label: 'Competence technique' },
  { value: 'autre', label: 'Autre' },
]

export function ObservationForm({ isOpen, onClose, onSuccess, agentId, auteurId, observation }: ObservationFormProps) {
  const isEditing = !!observation

  const [formData, setFormData] = useState({
    contenu: observation?.contenu || '',
    type: observation?.type || 'neutre',
    categorie: observation?.categorie || '',
    visibleAgent: observation?.visibleAgent ?? true,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Reset form when observation changes
  useEffect(() => {
    setFormData({
      contenu: observation?.contenu || '',
      type: observation?.type || 'neutre',
      categorie: observation?.categorie || '',
      visibleAgent: observation?.visibleAgent ?? true,
    })
    setError('')
  }, [observation])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isEditing && observation) {
        const updateData: UpdateObservationRequest = {
          contenu: formData.contenu,
          type: formData.type,
          categorie: formData.categorie || undefined,
          visibleAgent: formData.visibleAgent,
        }
        const response = await observationService.update(observation.id, updateData)
        if (!response.success) {
          setError(response.message || 'Erreur lors de la modification')
          setLoading(false)
          return
        }
      } else {
        const createData: CreateObservationRequest = {
          contenu: formData.contenu,
          type: formData.type,
          categorie: formData.categorie || undefined,
          visibleAgent: formData.visibleAgent,
          agentId: agentId,
          auteurId: auteurId,
        }
        const response = await observationService.create(createData)
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'positive':
      case 'encouragement':
        return 'text-green-600'
      case 'negative':
      case 'disciplinaire':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>{isEditing ? 'Modifier l\'observation' : 'Nouvelle observation'}</ModalTitle>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                  className={getTypeColor(formData.type)}
                >
                  {TYPES_OBSERVATION.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categorie
                </label>
                <Select
                  value={formData.categorie}
                  onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                >
                  <option value="">Aucune</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenu *
              </label>
              <Textarea
                value={formData.contenu}
                onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
                placeholder="Decrivez l'observation..."
                rows={5}
                required
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Checkbox
                id="visibleAgent"
                checked={formData.visibleAgent}
                onChange={(e) => setFormData({ ...formData, visibleAgent: e.target.checked })}
              />
              <label htmlFor="visibleAgent" className="text-sm text-gray-700 cursor-pointer">
                Visible par l&apos;agent
              </label>
              <span className="text-xs text-gray-500 ml-auto">
                {formData.visibleAgent
                  ? 'L\'agent pourra voir cette observation'
                  : 'Observation confidentielle (hierarchie uniquement)'}
              </span>
            </div>
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
