'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Award, Users, Calendar, Plus, Search, Filter, Eye, Edit, Trash2,
  UserPlus, UserMinus, CheckCircle, AlertTriangle, Clock, Shield, GraduationCap
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import {
  competenceService, adminService,
  type Competence, type User
} from '@/lib/api/services'
import { createPortal } from 'react-dom'

// Competence types
const COMPETENCE_TYPES = ['SPECIALITE', 'CERTIFICATION', 'FORMATION'] as const

// Assign Competence to Agent Modal
function AssignAgentModal({
  isOpen,
  onClose,
  competence,
  allAgents,
  onAssign,
  onRemove
}: {
  isOpen: boolean
  onClose: () => void
  competence: Competence | null
  allAgents: User[]
  onAssign: (agentId: string) => Promise<void>
  onRemove: (agentId: string) => Promise<void>
}) {
  const [loading, setLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  if (!isOpen || !competence) return null

  const assignedAgentIds = competence.agents?.map(a => a.id) || []
  const availableAgents = allAgents.filter(a =>
    !assignedAgentIds.includes(a.id) &&
    (searchTerm === '' ||
      a.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.matricule.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleAssign = async (agentId: string) => {
    setLoading(agentId)
    try {
      await onAssign(agentId)
    } finally {
      setLoading(null)
    }
  }

  const handleRemove = async (agentId: string) => {
    setLoading(agentId)
    try {
      await onRemove(agentId)
    } finally {
      setLoading(null)
    }
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${
              competence.type === 'SPECIALITE' ? 'bg-blue-100' :
              competence.type === 'CERTIFICATION' ? 'bg-green-100' : 'bg-purple-100'
            }`}>
              <Award className={`w-5 h-5 ${
                competence.type === 'SPECIALITE' ? 'text-blue-600' :
                competence.type === 'CERTIFICATION' ? 'text-green-600' : 'text-purple-600'
              }`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{competence.nom}</h2>
              <p className="text-sm text-slate-500">{competence.type}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Agents ayant cette competence */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Agents certifies ({competence.agents?.length || 0})
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {competence.agents?.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-lg">
                    Aucun agent n'a cette competence
                  </div>
                ) : (
                  competence.agents?.map(agent => (
                    <div key={agent.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
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
                <UserPlus className="w-5 h-5 text-blue-600" />
                Assigner a un agent
              </h3>
              <div className="mb-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un agent..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableAgents.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-lg">
                    {searchTerm ? 'Aucun agent trouve' : 'Tous les agents ont cette competence'}
                  </div>
                ) : (
                  availableAgents.slice(0, 20).map(agent => (
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
                        onClick={() => handleAssign(agent.id)}
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

// View Competence Detail Modal
function CompetenceDetailModal({
  isOpen,
  onClose,
  competence
}: {
  isOpen: boolean
  onClose: () => void
  competence: Competence | null
}) {
  if (!isOpen || !competence) return null

  const typeColor = competence.type === 'SPECIALITE' ? 'blue' :
    competence.type === 'CERTIFICATION' ? 'green' : 'purple'

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className={`p-6 bg-${typeColor}-50 rounded-t-xl`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-${typeColor}-100`}>
              <Award className={`w-8 h-8 text-${typeColor}-600`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{competence.nom}</h2>
              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full bg-${typeColor}-100 text-${typeColor}-700 mt-1`}>
                {competence.type}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {competence.description && (
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-1">Description</h4>
              <p className="text-slate-900">{competence.description}</p>
            </div>
          )}

          {competence.organisme && (
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-1">Organisme</h4>
              <p className="text-slate-900">{competence.organisme}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-1">Agents certifies</h4>
              <p className="text-2xl font-bold text-slate-900">{competence.nombreAgents}</p>
            </div>
            {competence.dateExpiration && (
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-1">Expiration</h4>
                <p className="text-slate-900">
                  {new Date(competence.dateExpiration).toLocaleDateString('fr-FR')}
                </p>
              </div>
            )}
          </div>

          {/* Liste des agents */}
          {competence.agents && competence.agents.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-2">Agents ({competence.agents.length})</h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {competence.agents.map(agent => (
                  <div key={agent.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                      {agent.prenom[0]}{agent.nom[0]}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{agent.prenom} {agent.nom}</div>
                      <div className="text-xs text-slate-500">{agent.matricule}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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

// Main Page Component
export default function CompetencesPage() {
  const [competences, setCompetences] = useState<Competence[]>([])
  const [agents, setAgents] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [filterType, setFilterType] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedCompetence, setSelectedCompetence] = useState<Competence | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [competencesRes, agentsRes] = await Promise.all([
        competenceService.getAll({
          type: filterType || undefined,
          search: searchTerm || undefined,
        }),
        adminService.getAgents()
      ])

      if (competencesRes.success && competencesRes.data) {
        setCompetences(competencesRes.data)
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
  }, [filterType, searchTerm])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAssignAgent = async (agentId: string) => {
    if (!selectedCompetence) return
    const response = await competenceService.assignToAgent(selectedCompetence.id, agentId)
    if (response.success) {
      // Refresh competence data
      const updated = await competenceService.getById(selectedCompetence.id)
      if (updated.success && updated.data) {
        setSelectedCompetence(updated.data)
        await fetchData()
      }
    }
  }

  const handleRemoveAgent = async (agentId: string) => {
    if (!selectedCompetence) return
    const response = await competenceService.removeFromAgent(selectedCompetence.id, agentId)
    if (response.success) {
      // Refresh competence data
      const updated = await competenceService.getById(selectedCompetence.id)
      if (updated.success && updated.data) {
        setSelectedCompetence(updated.data)
        await fetchData()
      }
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SPECIALITE':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'CERTIFICATION':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'FORMATION':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SPECIALITE':
        return <Shield className="w-5 h-5" />
      case 'CERTIFICATION':
        return <CheckCircle className="w-5 h-5" />
      case 'FORMATION':
        return <GraduationCap className="w-5 h-5" />
      default:
        return <Award className="w-5 h-5" />
    }
  }

  // Group by type
  const competencesByType = competences.reduce((acc, comp) => {
    if (!acc[comp.type]) acc[comp.type] = []
    acc[comp.type].push(comp)
    return acc
  }, {} as Record<string, Competence[]>)

  // Stats
  const stats = {
    total: competences.length,
    specialites: competences.filter(c => c.type === 'SPECIALITE').length,
    certifications: competences.filter(c => c.type === 'CERTIFICATION').length,
    formations: competences.filter(c => c.type === 'FORMATION').length,
    totalAssignments: competences.reduce((sum, c) => sum + c.nombreAgents, 0),
  }

  const filteredCompetences = competences.filter(c => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      if (!c.nom.toLowerCase().includes(search) &&
          !c.description?.toLowerCase().includes(search)) {
        return false
      }
    }
    if (filterType && c.type !== filterType) return false
    return true
  })

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Referentiel des Competences</h1>
          <p className="text-slate-600 mt-1">Gerez les competences et certifications des agents</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-t-4 border-slate-500">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                <div className="text-sm text-slate-600">Total</div>
              </div>
              <Award className="w-8 h-8 text-slate-400" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-blue-500">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.specialites}</div>
                <div className="text-sm text-slate-600">Specialites</div>
              </div>
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-green-500">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.certifications}</div>
                <div className="text-sm text-slate-600">Certifications</div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-purple-500">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">{stats.formations}</div>
                <div className="text-sm text-slate-600">Formations</div>
              </div>
              <GraduationCap className="w-8 h-8 text-purple-400" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-orange-500">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.totalAssignments}</div>
                <div className="text-sm text-slate-600">Affectations</div>
              </div>
              <Users className="w-8 h-8 text-orange-400" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-64">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Rechercher une competence..."
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tous les types</option>
                {COMPETENCE_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

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

      {/* Competences grouped by type */}
      {!loading && (
        <div className="space-y-8">
          {filteredCompetences.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Aucune competence trouvee
            </div>
          ) : (
            COMPETENCE_TYPES.map(type => {
              const typeCompetences = filteredCompetences.filter(c => c.type === type)
              if (typeCompetences.length === 0) return null

              return (
                <div key={type}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${
                      type === 'SPECIALITE' ? 'bg-blue-100' :
                      type === 'CERTIFICATION' ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      {getTypeIcon(type)}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">{type}S</h2>
                    <span className="text-sm text-slate-500">({typeCompetences.length})</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {typeCompetences.map(competence => (
                      <Card key={competence.id} className={`hover:shadow-lg transition-shadow border-l-4 ${getTypeColor(competence.type)}`}>
                        <CardBody className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-bold text-slate-900 line-clamp-2">{competence.nom}</h3>
                          </div>

                          {competence.description && (
                            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                              {competence.description}
                            </p>
                          )}

                          {competence.organisme && (
                            <div className="text-xs text-slate-500 mb-3">
                              {competence.organisme}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Users className="w-4 h-4" />
                              <span>{competence.nombreAgents} agent(s)</span>
                            </div>

                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedCompetence(competence)
                                  setShowDetailModal(true)
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  setSelectedCompetence(competence)
                                  setShowAssignModal(true)
                                }}
                              >
                                <UserPlus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Modals */}
      <AssignAgentModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false)
          setSelectedCompetence(null)
        }}
        competence={selectedCompetence}
        allAgents={agents}
        onAssign={handleAssignAgent}
        onRemove={handleRemoveAgent}
      />

      <CompetenceDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedCompetence(null)
        }}
        competence={selectedCompetence}
      />
    </div>
  )
}
