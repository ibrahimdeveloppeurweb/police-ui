'use client'

import React from 'react'
import { Clock, Search, AlertTriangle, Calendar, User, FileText, CheckCircle, Loader2 } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { HistoriqueAction } from '@/hooks/usePlainteHistorique'

interface HistoriqueActionsProps {
  historique: HistoriqueAction[]
  loading: boolean
  plainte: any
  formatDate: (date: string) => string
  getEtapeLabel: (etape: string) => string
  getStatutLabel: (statut: string) => string
}

export default function HistoriqueActions({
  historique,
  loading,
  plainte,
  formatDate,
  getEtapeLabel,
  getStatutLabel
}: HistoriqueActionsProps) {
  return (
    <Card>
      <CardBody className="p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Historique des Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Étape actuelle */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-blue-900">Étape actuelle</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600">{getEtapeLabel(plainte.etape_actuelle)}</p>
            <p className="text-xs text-blue-700 mt-1">Depuis le {formatDate(plainte.updated_at || plainte.created_at)}</p>
          </div>

          {/* Statut actuel */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <h3 className="font-bold text-orange-900">Statut actuel</h3>
            </div>
            <p className="text-2xl font-bold text-orange-600">{getStatutLabel(plainte.statut)}</p>
            <p className="text-xs text-orange-700 mt-1">Modifié le {formatDate(plainte.updated_at || plainte.created_at)}</p>
          </div>

          {/* Convocations */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-yellow-600" />
              <h3 className="font-bold text-yellow-900">Convocations</h3>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{plainte.nombre_convocations || 0}</p>
            <p className="text-xs text-yellow-700 mt-1">
              {(plainte.nombre_convocations || 0) === 0 && 'Aucune convocation'}
              {(plainte.nombre_convocations || 0) === 1 && '1 convocation effectuée'}
              {(plainte.nombre_convocations || 0) > 1 && `${plainte.nombre_convocations} convocations effectuées`}
            </p>
          </div>

          {/* Agent assigné */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-purple-900">Agent assigné</h3>
            </div>
            {plainte.agent_assigne ? (
              <>
                <p className="text-lg font-bold text-purple-600">
                  {plainte.agent_assigne.nom} {plainte.agent_assigne.prenom}
                </p>
                <p className="text-xs text-purple-700 mt-1">{plainte.agent_assigne.grade || 'Agent'}</p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-purple-400">Non assigné</p>
                <p className="text-xs text-purple-600 mt-1">En attente d'assignation</p>
              </>
            )}
          </div>
        </div>

        {/* Timeline détaillée des actions */}
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            Détail des actions effectuées
          </h3>
          
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
              <p className="text-slate-600 mt-2">Chargement de l'historique...</p>
            </div>
          ) : historique.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-lg">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600">Aucune action enregistrée pour le moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historique.map((action) => (
                <div key={action.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-slate-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {action.type_action === 'CHANGEMENT_ETAPE' && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1">
                            <Search className="w-3 h-3" />
                            Changement d'étape
                          </span>
                        )}
                        {action.type_action === 'CHANGEMENT_STATUT' && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Changement de statut
                          </span>
                        )}
                        {action.type_action === 'ASSIGNATION_AGENT' && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Assignation agent
                          </span>
                        )}
                        {action.type_action === 'CONVOCATION' && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Convocation
                          </span>
                        )}
                        <span className="text-xs text-slate-500">{formatDate(action.created_at)}</span>
                      </div>
                      
                      <div className="text-sm text-slate-700 mb-2">
                        {action.ancienne_valeur && (
                          <span className="inline-flex items-center gap-2">
                            <span className="line-through text-slate-400">{action.ancienne_valeur}</span>
                            <span className="text-slate-400">→</span>
                          </span>
                        )}
                        <span className="font-bold text-slate-900 ml-1">{action.nouvelle_valeur}</span>
                      </div>
                      
                      {action.observations && (
                        <div className="mt-2 p-3 bg-white border border-slate-200 rounded">
                          <p className="text-xs font-medium text-slate-600 mb-1">📝 Observations :</p>
                          <p className="text-sm text-slate-800">{action.observations}</p>
                        </div>
                      )}
                      
                      {action.effectue_par_nom && (
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Effectué par : <span className="font-medium">{action.effectue_par_nom}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {plainte.decision_finale && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Décision finale
            </h3>
            <p className="text-green-800">{plainte.decision_finale}</p>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
