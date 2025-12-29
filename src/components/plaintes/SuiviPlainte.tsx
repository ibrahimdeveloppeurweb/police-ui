'use client'

import React from 'react'
import { 
  Activity, Calendar, Clock, User, Building2, FileText, 
  CheckCircle, AlertCircle, UserCheck, ArrowRight, Loader2
} from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { usePlainteHistorique } from '@/hooks/usePlainteHistorique'

interface SuiviPlainteProps {
  plainteId: string
  observations?: string
}

export default function SuiviPlainte({ plainteId, observations }: SuiviPlainteProps) {
  const { historique, loading, error } = usePlainteHistorique(plainteId)

  const getActionIcon = (typeAction: string) => {
    switch (typeAction) {
      case 'CHANGEMENT_ETAPE':
        return <ArrowRight className="w-4 h-4" />
      case 'CHANGEMENT_STATUT':
        return <CheckCircle className="w-4 h-4" />
      case 'ASSIGNATION_AGENT':
        return <UserCheck className="w-4 h-4" />
      case 'CONVOCATION':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getActionLabel = (typeAction: string) => {
    switch (typeAction) {
      case 'CHANGEMENT_ETAPE':
        return 'Changement d\'étape'
      case 'CHANGEMENT_STATUT':
        return 'Changement de statut'
      case 'ASSIGNATION_AGENT':
        return 'Assignation d\'agent'
      case 'CONVOCATION':
        return 'Convocation'
      default:
        return typeAction
    }
  }

  const getEtapeLabel = (etape: string) => {
    switch (etape) {
      case 'DEPOT':
        return 'Dépôt'
      case 'ENQUETE':
        return 'Enquête'
      case 'CONVOCATIONS':
        return 'Convocations'
      case 'RESOLUTION':
        return 'Résolution'
      case 'CLOTURE':
        return 'Clôture'
      default:
        return etape
    }
  }

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'EN_COURS':
        return 'En cours'
      case 'CONVOCATION':
        return 'Convocation'
      case 'RESOLU':
        return 'Résolu'
      case 'CLASSE':
        return 'Classé'
      case 'TRANSFERE':
        return 'Transféré'
      default:
        return statut
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActionDetails = (action: any) => {
    switch (action.type_action) {
      case 'CHANGEMENT_ETAPE':
        return {
          description: `Étape changée de "${getEtapeLabel(action.ancienne_valeur || '')}" à "${getEtapeLabel(action.nouvelle_valeur)}"`,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-600',
          badgeColor: 'bg-blue-100 text-blue-900'
        }
      case 'CHANGEMENT_STATUT':
        return {
          description: `Statut changé de "${getStatutLabel(action.ancienne_valeur || '')}" à "${getStatutLabel(action.nouvelle_valeur)}"`,
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-600',
          badgeColor: 'bg-orange-100 text-orange-900'
        }
      case 'ASSIGNATION_AGENT':
        return {
          description: `Agent assigné: ${action.nouvelle_valeur}`,
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-600',
          badgeColor: 'bg-purple-100 text-purple-900'
        }
      case 'CONVOCATION':
        return {
          description: `Convocation ajoutée`,
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-600',
          badgeColor: 'bg-yellow-100 text-yellow-900'
        }
      default:
        return {
          description: action.nouvelle_valeur,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600',
          badgeColor: 'bg-gray-100 text-gray-900'
        }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Chargement de l'historique...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-800">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Erreur de chargement</span>
        </div>
        <p className="text-red-600 text-sm mt-2">{error}</p>
      </div>
    )
  }

  if (!historique || historique.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center">
        <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun historique</h3>
        <p className="text-slate-600">
          Aucune action n'a encore été effectuée sur cette plainte.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Chronologie et suivi
        </h3>
        <span className="text-sm text-slate-600">
          {historique.length} action{historique.length > 1 ? 's' : ''} enregistrée{historique.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
        <div className="space-y-6">
          {historique.map((action, index) => {
            const details = getActionDetails(action)
            return (
              <div key={action.id} className="relative pl-12">
                <div className={`absolute left-0 w-8 h-8 ${details.bgColor} rounded-full flex items-center justify-center border-4 border-white`}>
                  <div className={details.textColor}>
                    {getActionIcon(action.type_action)}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <span className="font-medium text-slate-900">
                        {getActionLabel(action.type_action)}
                      </span>
                      <p className="text-sm text-slate-600 mt-1">
                        {details.description}
                      </p>
                      {action.observations && (
                        <div className="mt-2 p-2 bg-white rounded border border-slate-200">
                          <p className="text-xs text-slate-700">
                            <span className="font-medium">Observations:</span> {action.observations}
                          </p>
                        </div>
                      )}
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 ${details.badgeColor} rounded`}>
                      {getActionLabel(action.type_action)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(action.created_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(action.created_at)}
                    </div>
                    {action.effectue_par_nom && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{action.effectue_par_nom}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Observations générales */}
      {observations && (
        <div className="mt-8 bg-slate-50 rounded-lg p-4 border border-slate-200">
          <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" />
            Observations générales
          </h4>
          <p className="text-slate-700 text-sm">{observations}</p>
        </div>
      )}
    </div>
  )
}
