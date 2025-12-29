'use client'

import React, { useState, useEffect, useCallback, Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Target, Users, Calendar, MapPin, Clock, Play, Square, XCircle,
  Plus, Search, Eye, Edit, Trash2, UserPlus, UserMinus,
  CheckCircle, AlertTriangle, FileText, Printer, FileDown, X
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import {
  missionService, adminService, equipeService,
  type Mission, type User, type CreateMissionRequest, type Equipe,
  StatutMission, TypeMission
} from '@/lib/api/services'
import { createPortal } from 'react-dom'

type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'

// Constants for pagination
const AGENTS_PER_PAGE = 50

// Mission Form Modal
function MissionFormModal({
  isOpen,
  onClose,
  onSubmit,
  mission,
  agents
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateMissionRequest) => Promise<void>
  mission?: Mission | null
  agents: User[]
}) {
  const [formData, setFormData] = useState<CreateMissionRequest>({
    type: 'PATROUILLE',
    titre: '',
    dateDebut: new Date().toISOString().split('T')[0],
    duree: '4h',
    zone: '',
    agentIds: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [loadingEquipes, setLoadingEquipes] = useState(false)

  // Agent search state
  const [agentSearch, setAgentSearch] = useState('')
  const [visibleAgentsCount, setVisibleAgentsCount] = useState(AGENTS_PER_PAGE)

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
    if (isOpen) {
      loadEquipes()
    }
  }, [isOpen])

  useEffect(() => {
    if (mission) {
      setFormData({
        type: mission.type,
        titre: mission.titre || '',
        dateDebut: mission.dateDebut.split('T')[0],
        dateFin: mission.dateFin?.split('T')[0],
        duree: mission.duree || '4h',
        zone: mission.zone || '',
        agentIds: mission.agents?.map(a => a.id) || [],
        equipeId: mission.equipe?.id || '',
        commissariatId: mission.commissariat?.id,
      })
    } else {
      setFormData({
        type: 'PATROUILLE',
        titre: '',
        dateDebut: new Date().toISOString().split('T')[0],
        duree: '4h',
        zone: '',
        agentIds: [],
        equipeId: '',
      })
    }
    // Reset search when modal opens
    setAgentSearch('')
    setVisibleAgentsCount(AGENTS_PER_PAGE)
  }, [mission, isOpen])

  // Filter agents based on search
  const filteredAgents = useMemo(() => {
    if (!agentSearch.trim()) return agents

    const searchLower = agentSearch.toLowerCase().trim()
    return agents.filter(agent => {
      const fullName = `${agent.prenom} ${agent.nom}`.toLowerCase()
      const reverseName = `${agent.nom} ${agent.prenom}`.toLowerCase()
      const matricule = agent.matricule?.toLowerCase() || ''
      const grade = agent.grade?.toLowerCase() || ''

      return fullName.includes(searchLower) ||
             reverseName.includes(searchLower) ||
             matricule.includes(searchLower) ||
             grade.includes(searchLower)
    })
  }, [agents, agentSearch])

  // Get selected agents
  const selectedAgents = useMemo(() => {
    return agents.filter(a => formData.agentIds?.includes(a.id))
  }, [agents, formData.agentIds])

  // Get visible unselected agents (for pagination)
  const visibleUnselectedAgents = useMemo(() => {
    const unselected = filteredAgents.filter(a => !formData.agentIds?.includes(a.id))
    return unselected.slice(0, visibleAgentsCount)
  }, [filteredAgents, formData.agentIds, visibleAgentsCount])

  // Check if there are more agents to load
  const hasMoreAgents = useMemo(() => {
    const unselected = filteredAgents.filter(a => !formData.agentIds?.includes(a.id))
    return unselected.length > visibleAgentsCount
  }, [filteredAgents, formData.agentIds, visibleAgentsCount])

  const totalUnselectedAgents = useMemo(() => {
    return filteredAgents.filter(a => !formData.agentIds?.includes(a.id)).length
  }, [filteredAgents, formData.agentIds])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      // Convert date strings to ISO 8601 format for the backend
      const dataToSubmit = {
        ...formData,
        dateDebut: formData.dateDebut ? new Date(formData.dateDebut).toISOString() : formData.dateDebut,
        dateFin: formData.dateFin ? new Date(formData.dateFin).toISOString() : undefined,
      }
      await onSubmit(dataToSubmit)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const toggleAgent = (agentId: string) => {
    setFormData(prev => ({
      ...prev,
      agentIds: prev.agentIds?.includes(agentId)
        ? prev.agentIds.filter(id => id !== agentId)
        : [...(prev.agentIds || []), agentId]
    }))
  }

  const removeAgent = (agentId: string) => {
    setFormData(prev => ({
      ...prev,
      agentIds: prev.agentIds?.filter(id => id !== agentId) || []
    }))
  }

  const clearAllAgents = () => {
    setFormData(prev => ({ ...prev, agentIds: [] }))
  }

  const loadMoreAgents = () => {
    setVisibleAgentsCount(prev => prev + AGENTS_PER_PAGE)
  }

  // Reset visible count when search changes
  useEffect(() => {
    setVisibleAgentsCount(AGENTS_PER_PAGE)
  }, [agentSearch])

  if (!isOpen) return null

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-900">
            {mission ? 'Modifier la mission' : 'Nouvelle mission'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Type de mission *
              </label>
              <select
                value={formData.type}
                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {Object.values(TypeMission).map(type => (
                  <option key={type} value={type}>{type.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Titre
              </label>
              <input
                type="text"
                value={formData.titre}
                onChange={e => setFormData(prev => ({ ...prev, titre: e.target.value }))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Titre de la mission"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Equipe
            </label>
            <select
              value={formData.equipeId || ''}
              onChange={e => setFormData(prev => ({ ...prev, equipeId: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loadingEquipes}
            >
              <option value="">Aucune equipe</option>
              {equipes.map(equipe => (
                <option key={equipe.id} value={equipe.id}>
                  {equipe.nom} ({equipe.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date de debut *
              </label>
              <input
                type="date"
                value={formData.dateDebut}
                onChange={e => setFormData(prev => ({ ...prev, dateDebut: e.target.value }))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Duree
              </label>
              <select
                value={formData.duree}
                onChange={e => setFormData(prev => ({ ...prev, duree: e.target.value }))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="2h">2 heures</option>
                <option value="4h">4 heures</option>
                <option value="6h">6 heures</option>
                <option value="8h">8 heures</option>
                <option value="12h">12 heures</option>
                <option value="24h">24 heures</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Zone / Secteur
            </label>
            <input
              type="text"
              value={formData.zone}
              onChange={e => setFormData(prev => ({ ...prev, zone: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Plateau, Cocody, Zone Industrielle..."
            />
          </div>

          {/* Improved Agent Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">
                Agents assignes
              </label>
              <span className="text-sm text-slate-500">
                {selectedAgents.length} selectionne{selectedAgents.length > 1 ? 's' : ''} sur {agents.length}
              </span>
            </div>

            {/* Selected agents tags */}
            {selectedAgents.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-blue-700">Agents selectionnes:</span>
                  <button
                    type="button"
                    onClick={clearAllAgents}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Tout retirer
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedAgents.map(agent => (
                    <span
                      key={agent.id}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-full"
                    >
                      <span>{agent.prenom} {agent.nom}</span>
                      <button
                        type="button"
                        onClick={() => removeAgent(agent.id)}
                        className="hover:bg-blue-700 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={agentSearch}
                onChange={(e) => setAgentSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Rechercher par nom, matricule ou grade..."
              />
              {agentSearch && (
                <button
                  type="button"
                  onClick={() => setAgentSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search results info */}
            {agentSearch && (
              <div className="text-xs text-slate-500">
                {filteredAgents.length} resultat{filteredAgents.length > 1 ? 's' : ''} pour "{agentSearch}"
              </div>
            )}

            {/* Agent list */}
            <div className="border border-slate-300 rounded-lg max-h-64 overflow-y-auto">
              {agents.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  Aucun agent disponible
                </div>
              ) : filteredAgents.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>Aucun agent trouve pour "{agentSearch}"</p>
                  <button
                    type="button"
                    onClick={() => setAgentSearch('')}
                    className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                    Effacer la recherche
                  </button>
                </div>
              ) : (
                <>
                  {visibleUnselectedAgents.map(agent => (
                    <label
                      key={agent.id}
                      className="flex items-center gap-3 p-3 border-b border-slate-100 last:border-0 cursor-pointer hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => toggleAgent(agent.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 truncate">
                          {agent.prenom} {agent.nom}
                        </div>
                        <div className="text-sm text-slate-500 truncate">
                          {agent.matricule} - {agent.grade || 'Agent'}
                        </div>
                      </div>
                    </label>
                  ))}

                  {/* Load more button */}
                  {hasMoreAgents && (
                    <div className="p-3 border-t border-slate-200 bg-slate-50">
                      <button
                        type="button"
                        onClick={loadMoreAgents}
                        className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Afficher plus d'agents ({visibleUnselectedAgents.length} / {totalUnselectedAgents})
                      </button>
                    </div>
                  )}

                  {/* End of list indicator */}
                  {!hasMoreAgents && totalUnselectedAgents > AGENTS_PER_PAGE && (
                    <div className="p-2 text-center text-xs text-slate-400 bg-slate-50 border-t border-slate-200">
                      Tous les agents sont affiches
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Enregistrement...' : (mission ? 'Modifier' : 'Creer')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

// End Mission Modal
function EndMissionModal({
  isOpen,
  onClose,
  onSubmit,
  mission
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (rapport: string) => Promise<void>
  mission: Mission | null
}) {
  const [rapport, setRapport] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rapport.trim()) return
    setLoading(true)
    try {
      await onSubmit(rapport)
      setRapport('')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !mission) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Terminer la mission</h2>
          <p className="text-slate-600 mt-1">{mission.titre || mission.type}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Rapport de mission *
            </label>
            <textarea
              value={rapport}
              onChange={e => setRapport(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-32"
              placeholder="Decrivez le deroulement de la mission, les resultats obtenus..."
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="success" disabled={loading || !rapport.trim()}>
              {loading ? 'Enregistrement...' : 'Terminer la mission'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

// Cancel Mission Modal
function CancelMissionModal({
  isOpen,
  onClose,
  onSubmit,
  mission
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (raison: string) => Promise<void>
  mission: Mission | null
}) {
  const [raison, setRaison] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(raison)
      setRaison('')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !mission) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-red-600">Annuler la mission</h2>
          <p className="text-slate-600 mt-1">{mission.titre || mission.type}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Cette action est irreversible</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Raison de l'annulation (optionnel)
            </label>
            <textarea
              value={raison}
              onChange={e => setRaison(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-24"
              placeholder="Expliquez pourquoi la mission est annulee..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Retour
            </Button>
            <Button type="submit" variant="danger" disabled={loading}>
              {loading ? 'Annulation...' : 'Confirmer l\'annulation'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

// Manage Agents Modal
function ManageAgentsModal({
  isOpen,
  onClose,
  mission,
  allAgents,
  onAddAgent,
  onRemoveAgent
}: {
  isOpen: boolean
  onClose: () => void
  mission: Mission | null
  allAgents: User[]
  onAddAgent: (agentId: string) => Promise<void>
  onRemoveAgent: (agentId: string) => Promise<void>
}) {
  const [loading, setLoading] = useState<string | null>(null)

  if (!isOpen || !mission) return null

  const missionAgentIds = mission.agents?.map(a => a.id) || []
  const availableAgents = allAgents.filter(a => !missionAgentIds.includes(a.id))

  const handleAdd = async (agentId: string) => {
    setLoading(agentId)
    try {
      await onAddAgent(agentId)
    } finally {
      setLoading(null)
    }
  }

  const handleRemove = async (agentId: string) => {
    setLoading(agentId)
    try {
      await onRemoveAgent(agentId)
    } finally {
      setLoading(null)
    }
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Gerer les agents</h2>
          <p className="text-slate-600 mt-1">{mission.titre || mission.type}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Agents assignes */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Agents assignes ({mission.agents?.length || 0})
              </h3>
              <div className="space-y-2">
                {mission.agents?.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-lg">
                    Aucun agent assigne
                  </div>
                ) : (
                  mission.agents?.map(agent => (
                    <div key={agent.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-900">
                          {agent.prenom} {agent.nom}
                        </div>
                        <div className="text-sm text-slate-500">{agent.matricule}</div>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemove(agent.id)}
                        disabled={loading === agent.id}
                      >
                        {loading === agent.id ? '...' : <UserMinus className="w-4 h-4" />}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Agents disponibles */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-green-600" />
                Agents disponibles ({availableAgents.length})
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {availableAgents.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-lg">
                    Tous les agents sont assignes
                  </div>
                ) : (
                  availableAgents.map(agent => (
                    <div key={agent.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-900">
                          {agent.prenom} {agent.nom}
                        </div>
                        <div className="text-sm text-slate-500">{agent.matricule}</div>
                      </div>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleAdd(agent.id)}
                        disabled={loading === agent.id}
                      >
                        {loading === agent.id ? '...' : <UserPlus className="w-4 h-4" />}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200">
          <Button variant="outline" onClick={onClose} className="w-full">
            Fermer
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// Main Page Content Component (uses useSearchParams)
function MissionsListContent() {
  const searchParams = useSearchParams()
  const initialStatut = searchParams.get('statut') || ''

  const [missions, setMissions] = useState<Mission[]>([])
  const [agents, setAgents] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('tout')
  const [filterStatut, setFilterStatut] = useState<string>(initialStatut)
  const [filterType, setFilterType] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)

  // Modals
  const [showFormModal, setShowFormModal] = useState(false)
  const [showEndModal, setShowEndModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showAgentsModal, setShowAgentsModal] = useState(false)
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [missionsRes, agentsRes] = await Promise.all([
        missionService.getAll({
          statut: filterStatut || undefined,
          type: filterType || undefined,
        }),
        adminService.getAgents()
      ])

      if (missionsRes.success && missionsRes.data) {
        setMissions(missionsRes.data)
      }
      if (agentsRes.success && agentsRes.data) {
        setAgents(agentsRes.data)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Erreur lors du chargement des donnees')
    } finally {
      setLoading(false)
    }
  }, [filterStatut, filterType])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreateMission = async (data: CreateMissionRequest) => {
    const response = await missionService.create(data)
    if (!response.success) {
      throw new Error(response.message || 'Erreur lors de la creation')
    }
    await fetchData()
  }

  const handleUpdateMission = async (data: CreateMissionRequest) => {
    if (!selectedMission) return
    const response = await missionService.update(selectedMission.id, data)
    if (!response.success) {
      throw new Error(response.message || 'Erreur lors de la modification')
    }
    await fetchData()
  }

  const handleStartMission = async (mission: Mission) => {
    const response = await missionService.start(mission.id)
    if (response.success) {
      await fetchData()
    }
  }

  const handleEndMission = async (rapport: string) => {
    if (!selectedMission) return
    const response = await missionService.end(selectedMission.id, rapport)
    if (response.success) {
      await fetchData()
    }
  }

  const handleCancelMission = async (raison: string) => {
    if (!selectedMission) return
    const response = await missionService.cancel(selectedMission.id, raison)
    if (response.success) {
      await fetchData()
    }
  }

  const handleDeleteMission = async (mission: Mission) => {
    if (!confirm('Etes-vous sur de vouloir supprimer cette mission ?')) return
    const response = await missionService.delete(mission.id)
    if (response.success) {
      await fetchData()
    }
  }

  const handleAddAgent = async (agentId: string) => {
    if (!selectedMission) return
    const response = await missionService.addAgents(selectedMission.id, [agentId])
    if (response.success && response.data) {
      setSelectedMission(response.data)
      await fetchData()
    }
  }

  const handleRemoveAgent = async (agentId: string) => {
    if (!selectedMission) return
    const response = await missionService.removeAgent(selectedMission.id, agentId)
    if (response.success && response.data) {
      setSelectedMission(response.data)
      await fetchData()
    }
  }

  const handleFilterChange = (filter: PeriodKey) => {
    setGlobalFilter(filter)
    setIsCustomDateRange(false)
    setDateDebut('')
    setDateFin('')
  }

  const handleCustomDateSearch = () => {
    if (dateDebut && dateFin) {
      setIsCustomDateRange(true)
      setGlobalFilter('personnalise')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    alert('Export des donnees en cours...\nFormat: CSV/Excel/PDF')
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case StatutMission.PLANIFIEE:
        return 'bg-blue-100 text-blue-800'
      case StatutMission.EN_COURS:
        return 'bg-green-100 text-green-800'
      case StatutMission.TERMINEE:
        return 'bg-slate-100 text-slate-800'
      case StatutMission.ANNULEE:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case StatutMission.PLANIFIEE:
        return <Calendar className="w-4 h-4" />
      case StatutMission.EN_COURS:
        return <Play className="w-4 h-4" />
      case StatutMission.TERMINEE:
        return <CheckCircle className="w-4 h-4" />
      case StatutMission.ANNULEE:
        return <XCircle className="w-4 h-4" />
      default:
        return <Target className="w-4 h-4" />
    }
  }

  // Filter missions based on search and date range
  const filteredMissions = missions.filter(m => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      const matchTitre = m.titre?.toLowerCase().includes(search)
      const matchZone = m.zone?.toLowerCase().includes(search)
      const matchType = m.type.toLowerCase().includes(search)
      if (!matchTitre && !matchZone && !matchType) return false
    }

    // Date range filter
    if (isCustomDateRange && dateDebut && dateFin) {
      const missionDate = new Date(m.dateDebut)
      const startDate = new Date(dateDebut)
      const endDate = new Date(dateFin)
      if (missionDate < startDate || missionDate > endDate) return false
    }

    // Period filter
    if (globalFilter !== 'tout' && globalFilter !== 'personnalise') {
      const missionDate = new Date(m.dateDebut)
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      switch (globalFilter) {
        case 'jour':
          if (missionDate < startOfDay) return false
          break
        case 'semaine':
          const weekAgo = new Date(startOfDay)
          weekAgo.setDate(weekAgo.getDate() - 7)
          if (missionDate < weekAgo) return false
          break
        case 'mois':
          const monthAgo = new Date(startOfDay)
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          if (missionDate < monthAgo) return false
          break
        case 'annee':
          const yearAgo = new Date(startOfDay)
          yearAgo.setFullYear(yearAgo.getFullYear() - 1)
          if (missionDate < yearAgo) return false
          break
      }
    }

    return true
  })

  // Stats
  const stats = {
    total: filteredMissions.length,
    planifiees: filteredMissions.filter(m => m.statut === StatutMission.PLANIFIEE).length,
    enCours: filteredMissions.filter(m => m.statut === StatutMission.EN_COURS).length,
    terminees: filteredMissions.filter(m => m.statut === StatutMission.TERMINEE).length,
    annulees: filteredMissions.filter(m => m.statut === StatutMission.ANNULEE).length,
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Liste des Missions</h1>
        <p className="text-slate-600 mt-2">Gerez et suivez toutes les missions</p>
      </div>

      {/* Filtre Global de Periode */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 mb-8">
        <CardBody className="p-4 md:p-6">
          <div className="space-y-4">
            {/* Header et boutons de periode */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Periode d'analyse</h2>
                  <p className="text-gray-600 text-xs md:text-sm hidden sm:block">
                    Selectionnez la periode pour filtrer toutes les donnees
                  </p>
                </div>
              </div>

              {/* Boutons de periode */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => handleFilterChange('jour')}
                  className={`${globalFilter === 'jour' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Aujourd'hui
                </Button>
                <Button
                  onClick={() => handleFilterChange('semaine')}
                  className={`${globalFilter === 'semaine' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Semaine
                </Button>
                <Button
                  onClick={() => handleFilterChange('mois')}
                  className={`${globalFilter === 'mois' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Mois
                </Button>
                <Button
                  onClick={() => handleFilterChange('annee')}
                  className={`${globalFilter === 'annee' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Annee
                </Button>
                <Button
                  onClick={() => handleFilterChange('tout')}
                  className={`${globalFilter === 'tout' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Historique
                </Button>
              </div>
            </div>

            {/* Input de recherche + Selects */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-4 border-t border-blue-200">
              {/* Champ Input de recherche */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-[200px]">
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Rechercher:
                </label>
                <input
                  type="text"
                  placeholder="Rechercher par titre, zone, type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>

              {/* Select Statut */}
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                <option value="">Tous les statuts</option>
                {Object.values(StatutMission).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* Select Type */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                <option value="">Tous les types</option>
                {Object.values(TypeMission).map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            {/* Selection de dates personnalisees */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-4 border-t border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Date debut:
                </label>
                <input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Date fin:
                </label>
                <input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                />
              </div>

              <Button
                onClick={handleCustomDateSearch}
                disabled={!dateDebut || !dateFin}
                className={`${!dateDebut || !dateFin ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'} flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2 w-full sm:w-auto`}
              >
                <Search className="w-4 h-4" />
                Rechercher
              </Button>

              {/* Separateur visuel */}
              <div className="hidden sm:block w-px h-8 bg-blue-300"></div>

              {/* Boutons Imprimer et Exporter */}
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  onClick={handlePrint}
                  className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2"
                >
                  <Printer className="w-4 h-4" />
                  Imprimer
                </Button>

                <Button
                  onClick={handleExport}
                  className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2"
                >
                  <FileDown className="w-4 h-4" />
                  Exporter
                </Button>
              </div>
            </div>

            {/* Badge de confirmation */}
            {isCustomDateRange && (
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg w-full sm:w-auto">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs md:text-sm font-medium">
                  Periode personnalisee active: {dateDebut} au {dateFin}
                </span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-t-4 border-slate-500">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                <div className="text-sm text-slate-600">Total Missions</div>
              </div>
              <Target className="w-8 h-8 text-slate-400" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-blue-500">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.planifiees}</div>
                <div className="text-sm text-slate-600">Planifiees</div>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-green-500">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.enCours}</div>
                <div className="text-sm text-slate-600">En cours</div>
              </div>
              <Play className="w-8 h-8 text-green-400" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-slate-400">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-600">{stats.terminees}</div>
                <div className="text-sm text-slate-600">Terminees</div>
              </div>
              <CheckCircle className="w-8 h-8 text-slate-400" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-red-500">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.annulees}</div>
                <div className="text-sm text-slate-600">Annulees</div>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
          <Button onClick={fetchData} className="ml-4" variant="outline" size="sm">
            Reessayer
          </Button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-slate-600">Chargement...</span>
        </div>
      )}

      {/* Missions List Header with Add Button */}
      {!loading && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              {filteredMissions.length} mission(s) trouvee(s)
            </h2>
            <Button
              variant="primary"
              onClick={() => {
                setSelectedMission(null)
                setShowFormModal(true)
              }}
            >
              <Plus className="w-5 h-5" />
              Nouvelle Mission
            </Button>
          </div>

          {/* Missions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMissions.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-500">
                Aucune mission trouvee
              </div>
            ) : (
              filteredMissions.map(mission => (
                <Card key={mission.id} className="hover:shadow-lg transition-shadow">
                  <CardBody className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(mission.statut)}`}>
                          {getStatutIcon(mission.statut)}
                          {mission.statut}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(mission.dateDebut).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    {/* Title & Type */}
                    <h3 className="font-bold text-lg text-slate-900 mb-1">
                      {mission.titre || mission.type.replace('_', ' ')}
                    </h3>
                    {mission.titre && (
                      <p className="text-sm text-slate-500 mb-3">{mission.type.replace('_', ' ')}</p>
                    )}

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      {mission.zone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4" />
                          {mission.zone}
                        </div>
                      )}
                      {mission.duree && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock className="w-4 h-4" />
                          {mission.duree}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="w-4 h-4" />
                        {mission.agents?.length || 0} agent(s) assigne(s)
                      </div>
                    </div>

                    {/* Agents avatars */}
                    {mission.agents && mission.agents.length > 0 && (
                      <div className="flex items-center gap-1 mb-4">
                        {mission.agents.slice(0, 4).map((agent, idx) => (
                          <div
                            key={agent.id}
                            className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 border-2 border-white"
                            style={{ marginLeft: idx > 0 ? '-8px' : 0 }}
                            title={`${agent.prenom} ${agent.nom}`}
                          >
                            {agent.prenom[0]}{agent.nom[0]}
                          </div>
                        ))}
                        {mission.agents.length > 4 && (
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 border-2 border-white" style={{ marginLeft: '-8px' }}>
                            +{mission.agents.length - 4}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Rapport preview for completed missions */}
                    {mission.statut === StatutMission.TERMINEE && mission.rapport && (
                      <div className="p-3 bg-slate-50 rounded-lg mb-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                          <FileText className="w-4 h-4" />
                          Rapport
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">{mission.rapport}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                      {mission.statut === StatutMission.PLANIFIEE && (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleStartMission(mission)}
                          >
                            <Play className="w-4 h-4" />
                            Demarrer
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedMission(mission)
                              setShowFormModal(true)
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedMission(mission)
                              setShowAgentsModal(true)
                            }}
                          >
                            <Users className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteMission(mission)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}

                      {mission.statut === StatutMission.EN_COURS && (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => {
                              setSelectedMission(mission)
                              setShowEndModal(true)
                            }}
                          >
                            <Square className="w-4 h-4" />
                            Terminer
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedMission(mission)
                              setShowAgentsModal(true)
                            }}
                          >
                            <Users className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setSelectedMission(mission)
                              setShowCancelModal(true)
                            }}
                          >
                            <XCircle className="w-4 h-4" />
                            Annuler
                          </Button>
                        </>
                      )}

                      {(mission.statut === StatutMission.TERMINEE || mission.statut === StatutMission.ANNULEE) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMission(mission)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                          Voir details
                        </Button>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {/* Modals */}
      <MissionFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false)
          setSelectedMission(null)
        }}
        onSubmit={selectedMission ? handleUpdateMission : handleCreateMission}
        mission={selectedMission}
        agents={agents}
      />

      <EndMissionModal
        isOpen={showEndModal}
        onClose={() => {
          setShowEndModal(false)
          setSelectedMission(null)
        }}
        onSubmit={handleEndMission}
        mission={selectedMission}
      />

      <CancelMissionModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false)
          setSelectedMission(null)
        }}
        onSubmit={handleCancelMission}
        mission={selectedMission}
      />

      <ManageAgentsModal
        isOpen={showAgentsModal}
        onClose={() => {
          setShowAgentsModal(false)
          setSelectedMission(null)
        }}
        mission={selectedMission}
        allAgents={agents}
        onAddAgent={handleAddAgent}
        onRemoveAgent={handleRemoveAgent}
      />
    </div>
  )
}

// Page wrapper with Suspense boundary
export default function MissionsListPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600">Chargement...</span>
      </div>
    }>
      <MissionsListContent />
    </Suspense>
  )
}
