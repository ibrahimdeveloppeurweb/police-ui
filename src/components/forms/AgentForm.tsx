'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import {
  adminService,
  type User,
  type CreateAgentRequest,
  type Commissariat
} from '@/lib/api/services'

interface AgentFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  agent?: User // If provided, we're editing
}

const ROLES = [
  { value: 'AGENT', label: 'Agent' },
  { value: 'COMMISSAIRE', label: 'Commissaire' },
  { value: 'ADMIN', label: 'Administrateur' },
]

const GRADES = [
  { value: '', label: 'Aucun grade' },
  { value: 'Gardien de la Paix', label: 'Gardien de la Paix' },
  { value: 'Brigadier', label: 'Brigadier' },
  { value: 'Brigadier-Chef', label: 'Brigadier-Chef' },
  { value: 'Major', label: 'Major' },
  { value: 'Sous-Lieutenant', label: 'Sous-Lieutenant' },
  { value: 'Lieutenant', label: 'Lieutenant' },
  { value: 'Capitaine', label: 'Capitaine' },
  { value: 'Commandant', label: 'Commandant' },
  { value: 'Commissaire', label: 'Commissaire' },
  { value: 'Commissaire Principal', label: 'Commissaire Principal' },
  { value: 'Commissaire Divisionnaire', label: 'Commissaire Divisionnaire' },
  { value: 'Controleur General', label: 'Controleur General' },
  { value: 'Inspecteur General', label: 'Inspecteur General' },
]

export function AgentForm({ isOpen, onClose, onSuccess, agent }: AgentFormProps) {
  const isEditing = !!agent

  const [formData, setFormData] = useState<CreateAgentRequest>({
    matricule: agent?.matricule || '',
    nom: agent?.nom || '',
    prenom: agent?.prenom || '',
    email: agent?.email || '',
    password: '',
    role: agent?.role || 'AGENT',
    grade: agent?.grade || '',
    telephone: agent?.telephone || '',
    commissariatId: agent?.commissariatId || '',
  })

  const [commissariats, setCommissariats] = useState<Commissariat[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCommissariats, setLoadingCommissariats] = useState(true)
  const [error, setError] = useState('')

  // Load commissariats on mount
  useEffect(() => {
    const fetchCommissariats = async () => {
      try {
        const response = await adminService.getCommissariats()
        if (response.success && response.data) {
          setCommissariats(response.data)
        }
      } catch (err) {
        console.error('Failed to load commissariats:', err)
      } finally {
        setLoadingCommissariats(false)
      }
    }
    fetchCommissariats()
  }, [])

  // Reset form when agent changes
  useEffect(() => {
    if (agent) {
      setFormData({
        matricule: agent.matricule,
        nom: agent.nom,
        prenom: agent.prenom,
        email: agent.email,
        password: '',
        role: agent.role,
        grade: agent.grade || '',
        telephone: agent.telephone || '',
        commissariatId: agent.commissariatId || '',
      })
    } else {
      setFormData({
        matricule: '',
        nom: '',
        prenom: '',
        email: '',
        password: '',
        role: 'AGENT',
        grade: '',
        telephone: '',
        commissariatId: '',
      })
    }
  }, [agent])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isEditing && agent) {
        // Update - password not required
        const updateData: Partial<User> = {
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          role: formData.role,
          grade: formData.grade || undefined,
          telephone: formData.telephone || undefined,
          commissariatId: formData.commissariatId || undefined,
        }
        const response = await adminService.updateAgent(agent.id, updateData)
        if (!response.success) {
          setError(response.message || 'Erreur lors de la modification')
          setLoading(false)
          return
        }
      } else {
        // Create - password required
        if (!formData.password) {
          setError('Le mot de passe est requis')
          setLoading(false)
          return
        }
        const response = await adminService.createAgent(formData)
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
        <ModalTitle>{isEditing ? 'Modifier l\'agent' : 'Nouvel agent'}</ModalTitle>
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
            {/* Matricule */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Matricule *
              </label>
              <Input
                type="text"
                value={formData.matricule}
                onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                placeholder="Ex: PN-12345"
                required
                disabled={isEditing}
              />
            </div>

            {/* Nom & Prenom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <Input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="KOUASSI"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prenom *
                </label>
                <Input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  placeholder="Jean"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jean.kouassi@police.ci"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe {!isEditing && '*'}
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={isEditing ? 'Laisser vide pour ne pas modifier' : 'Mot de passe'}
                required={!isEditing}
              />
              {isEditing && (
                <p className="text-xs text-gray-500 mt-1">
                  Laisser vide pour conserver le mot de passe actuel
                </p>
              )}
            </div>

            {/* Telephone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telephone
              </label>
              <Input
                type="tel"
                value={formData.telephone || ''}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                placeholder="+225 07 12 34 56 78"
              />
            </div>

            {/* Role & Grade */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade
                </label>
                <Select
                  value={formData.grade || ''}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                >
                  {GRADES.map((grade) => (
                    <option key={grade.value} value={grade.value}>
                      {grade.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Commissariat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commissariat
              </label>
              <Select
                value={formData.commissariatId || ''}
                onChange={(e) => setFormData({ ...formData, commissariatId: e.target.value })}
                disabled={loadingCommissariats}
              >
                <option value="">Aucun commissariat</option>
                {commissariats.map((comm) => (
                  <option key={comm.id} value={comm.id}>
                    {comm.nom} ({comm.code})
                  </option>
                ))}
              </Select>
              {loadingCommissariats && (
                <p className="text-xs text-gray-500 mt-1">Chargement des commissariats...</p>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Creer l\'agent'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
