'use client'

import React, { useEffect, useState } from 'react'
import { Trophy, TrendingUp, Target, Star, Award } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import api from '@/lib/axios'
import Cookies from 'js-cookie'

interface TopAgent {
  id: string
  nom: string
  prenom: string
  matricule: string
  plaintes_traitees: number
  plaintes_resolues: number
  score: number
  delai_moyen: number
}

interface TopAgentsPerformantsProps {
  agents?: TopAgent[]
  loading?: boolean
}

const getMedalIcon = (position: number) => {
  switch (position) {
    case 1:
      return <Trophy className="w-6 h-6 text-yellow-500" />
    case 2:
      return <Award className="w-6 h-6 text-gray-400" />
    case 3:
      return <Star className="w-6 h-6 text-amber-600" />
    default:
      return <Target className="w-5 h-5 text-blue-500" />
  }
}

const getMedalBg = (position: number) => {
  switch (position) {
    case 1:
      return 'bg-gradient-to-br from-yellow-100 to-yellow-200'
    case 2:
      return 'bg-gradient-to-br from-gray-100 to-gray-200'
    case 3:
      return 'bg-gradient-to-br from-amber-100 to-amber-200'
    default:
      return 'bg-blue-50'
  }
}

const getScoreBadge = (score: number) => {
  if (score >= 9) return { color: 'bg-green-100 text-green-700', label: 'Excellent' }
  if (score >= 8) return { color: 'bg-blue-100 text-blue-700', label: 'Très bon' }
  if (score >= 7) return { color: 'bg-orange-100 text-orange-700', label: 'Bon' }
  return { color: 'bg-gray-100 text-gray-700', label: 'Moyen' }
}

export default function TopAgentsPerformants() {
  const [agents, setAgents] = useState<TopAgent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopAgents = async () => {
      try {
        const commissariatId = Cookies.get('commissariat_id')
        const response = await api.get('/plaintes/top-agents', {
          params: { commissariat_id: commissariatId }
        })
        setAgents(response.data || [])
      } catch (error) {
        console.error('Erreur chargement top agents:', error)
        setAgents([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchTopAgents()
  }, [])
  if (loading) {
    return (
      <Card>
        <CardBody className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Top Agents Performants
          </h3>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-slate-200 rounded"></div>
            ))}
          </div>
        </CardBody>
      </Card>
    )
  }

  if (agents.length === 0) {
    return (
      <Card>
        <CardBody className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Top Agents Performants
          </h3>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-slate-600 font-medium">Aucune donnée disponible</p>
            <p className="text-sm text-slate-500 mt-1">Les performances seront affichées ici</p>
          </div>
        </CardBody>
      </Card>
    )
  }

  const topAgent = agents[0]

  return (
    <Card className="border-l-4 border-l-yellow-500">
      <CardBody className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Top Agents du Mois
          </h3>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
            {agents.length} Agent{agents.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Agent #1 - Mise en avant */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-1 bg-yellow-600 text-white rounded text-xs font-bold">
                  #1
                </span>
                <h4 className="font-bold text-lg text-slate-900">
                  {topAgent.nom} {topAgent.prenom}
                </h4>
              </div>
              <p className="text-sm text-slate-600 mb-2">Matricule: {topAgent.matricule}</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-2">
                  <div className="text-xs text-slate-600">Traitées</div>
                  <div className="font-bold text-slate-900">{topAgent.plaintes_traitees}</div>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <div className="text-xs text-slate-600">Résolues</div>
                  <div className="font-bold text-green-600">{topAgent.plaintes_resolues}</div>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <div className="text-xs text-slate-600">Score</div>
                  <div className="font-bold text-yellow-600">{topAgent.score.toFixed(1)}/10</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agents #2-5 */}
        <div className="space-y-2">
          {agents.slice(1, 5).map((agent, index) => {
            const position = index + 2
            const scoreBadge = getScoreBadge(agent.score)
            const tauxResolution = agent.plaintes_traitees > 0 
              ? Math.round((agent.plaintes_resolues / agent.plaintes_traitees) * 100)
              : 0

            return (
              <div 
                key={agent.id}
                className="border border-slate-200 rounded-lg p-3 hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${getMedalBg(position)} rounded-full flex items-center justify-center flex-shrink-0`}>
                    {position <= 3 ? (
                      getMedalIcon(position)
                    ) : (
                      <span className="font-bold text-slate-700">#{position}</span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-slate-900">
                        {agent.nom} {agent.prenom}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${scoreBadge.color}`}>
                        {scoreBadge.label}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        <span>{agent.plaintes_traitees} traitées</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <span className="font-medium text-green-600">{agent.plaintes_resolues} résolues</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-600" />
                        <span className="font-medium">{agent.score.toFixed(1)}/10</span>
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-600">Taux de résolution</span>
                        <span className="font-bold text-slate-900">{tauxResolution}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-600 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${tauxResolution}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer avec statistiques globales */}
        {agents.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {agents.reduce((sum, a) => sum + a.plaintes_traitees, 0)}
                </div>
                <div className="text-xs text-slate-600">Total traitées</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {agents.reduce((sum, a) => sum + a.plaintes_resolues, 0)}
                </div>
                <div className="text-xs text-slate-600">Total résolues</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {(agents.reduce((sum, a) => sum + a.score, 0) / agents.length).toFixed(1)}
                </div>
                <div className="text-xs text-slate-600">Score moyen</div>
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
