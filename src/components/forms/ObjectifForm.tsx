'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import {
  objectifService,
  type Objectif,
  type CreateObjectifRequest,
  type UpdateObjectifRequest
} from '@/lib/api/services'

interface ObjectifFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  agentId: string
  objectif?: Objectif
}

const PERIODES = [
  { value: 'journalier', label: 'Journalier' },
  { value: 'hebdomadaire', label: 'Hebdomadaire' },
  { value: 'mensuel', label: 'Mensuel' },
  { value: 'trimestriel', label: 'Trimestriel' },
  { value: 'annuel', label: 'Annuel' },
]

const STATUTS = [
  { value: 'en_cours', label: 'En cours' },
  { value: 'atteint', label: 'Atteint' },
  { value: 'non_atteint', label: 'Non atteint' },
  { value: 'abandonne', label: 'Abandonne' },
]

export function ObjectifForm({ isOpen, onClose, onSuccess, agentId, objectif }: ObjectifFormProps) {
  const isEditing = !!objectif

  const [formData, setFormData] = useState({
    titre: objectif?.titre || '',
    description: objectif?.description || '',
    periode: objectif?.periode || 'mensuel',
    dateDebut: objectif?.dateDebut?.split('T')[0] || new Date().toISOString().split('T')[0],
    dateFin: objectif?.dateFin?.split('T')[0] || '',
    valeurCible: objectif?.valeurCible || undefined,
    valeurActuelle: objectif?.valeurActuelle || 0,
    statut: objectif?.statut || 'en_cours',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Reset form when objectif changes
  useEffect(() => {
    setFormData({
      titre: objectif?.titre || '',
      description: objectif?.description || '',
      periode: objectif?.periode || 'mensuel',
      dateDebut: objectif?.dateDebut?.split('T')[0] || new Date().toISOString().split('T')[0],
      dateFin: objectif?.dateFin?.split('T')[0] || '',
      valeurCible: objectif?.valeurCible || undefined,
      valeurActuelle: objectif?.valeurActuelle || 0,
      statut: objectif?.statut || 'en_cours',
    })
    setError('')
  }, [objectif])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isEditing && objectif) {
        const updateData: UpdateObjectifRequest = {
          titre: formData.titre,
          description: formData.description,
          statut: formData.statut,
          valeurCible: formData.valeurCible,
          valeurActuelle: formData.valeurActuelle,
          dateFin: formData.dateFin || undefined,
        }
        const response = await objectifService.update(objectif.id, updateData)
        if (!response.success) {
          setError(response.message || 'Erreur lors de la modification')
          setLoading(false)
          return
        }
      } else {
        const createData: CreateObjectifRequest = {
          titre: formData.titre,
          description: formData.description,
          periode: formData.periode,
          dateDebut: formData.dateDebut,
          dateFin: formData.dateFin,
          valeurCible: formData.valeurCible,
          agentId: agentId,
        }
        const response = await objectifService.create(createData)
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
        <ModalTitle>{isEditing ? 'Modifier l\'objectif' : 'Nouvel objectif'}</ModalTitle>
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
                Titre *
              </label>
              <Input
                type="text"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                placeholder="Ex: Controles routiers mensuels"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de l'objectif..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Periode *
                </label>
                <Select
                  value={formData.periode}
                  onChange={(e) => setFormData({ ...formData, periode: e.target.value })}
                  required
                  disabled={isEditing}
                >
                  {PERIODES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </Select>
              </div>
              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <Select
                    value={formData.statut}
                    onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                  >
                    {STATUTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
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
                  disabled={isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin *
                </label>
                <Input
                  type="date"
                  value={formData.dateFin}
                  onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valeur cible
                </label>
                <Input
                  type="number"
                  value={formData.valeurCible || ''}
                  onChange={(e) => setFormData({ ...formData, valeurCible: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Ex: 50"
                  min={0}
                />
              </div>
              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valeur actuelle
                  </label>
                  <Input
                    type="number"
                    value={formData.valeurActuelle}
                    onChange={(e) => setFormData({ ...formData, valeurActuelle: parseInt(e.target.value) || 0 })}
                    min={0}
                  />
                </div>
              )}
            </div>

            {isEditing && formData.valeurCible && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Progression
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min((formData.valeurActuelle / formData.valeurCible) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {Math.round((formData.valeurActuelle / formData.valeurCible) * 100)}%
                  </span>
                </div>
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
