'use client'

import React, { useEffect, useState } from 'react'
import { AlertTriangle, Clock, FileText, Bell } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import Cookies from 'js-cookie'

interface Alerte {
  id: string
  plainte_numero: string
  plainte_id: string
  type_alerte: 'SLA_DEPASSE' | 'SANS_ACTION' | 'EXPERTISE_REQUISE' | 'CONVOCATION_REQUISE'
  message: string
  niveau: 'INFO' | 'WARNING' | 'CRITICAL'
  jours_retard?: number
}

interface AlertesActivesProps {
  alertes?: Alerte[]
  loading?: boolean
}

const getNiveauIcon = (niveau: string) => {
  switch (niveau) {
    case 'CRITICAL':
      return <AlertTriangle className="w-5 h-5 text-red-600" />
    case 'WARNING':
      return <Clock className="w-5 h-5 text-orange-600" />
    default:
      return <Bell className="w-5 h-5 text-blue-600" />
  }
}

const getNiveauColor = (niveau: string) => {
  switch (niveau) {
    case 'CRITICAL':
      return 'bg-red-50 border-red-200'
    case 'WARNING':
      return 'bg-orange-50 border-orange-200'
    default:
      return 'bg-blue-50 border-blue-200'
  }
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'SLA_DEPASSE':
      return 'SLA Dépassé'
    case 'SANS_ACTION':
      return 'Sans action'
    case 'EXPERTISE_REQUISE':
      return 'Expertise requise'
    case 'CONVOCATION_REQUISE':
      return 'Convocation requise'
    default:
      return type
  }
}

export default function AlertesActives() {
  const router = useRouter()
  const [alertes, setAlertes] = useState<Alerte[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlertes = async () => {
      try {
        const commissariatId = Cookies.get('commissariat_id')
        const response = await api.get('/plaintes/alertes', {
          params: { commissariat_id: commissariatId }
        })
        setAlertes(response.data || [])
      } catch (error) {
        console.error('Erreur chargement alertes:', error)
        setAlertes([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchAlertes()
  }, [])

  // Grouper les alertes par type
  const alertesGroupees = alertes.reduce((acc, alerte) => {
    if (!acc[alerte.type_alerte]) {
      acc[alerte.type_alerte] = []
    }
    acc[alerte.type_alerte].push(alerte)
    return acc
  }, {} as Record<string, Alerte[]>)

  // Compter les alertes critiques
  const alertesCritiques = alertes.filter(a => a.niveau === 'CRITICAL')
  const alertesWarning = alertes.filter(a => a.niveau === 'WARNING')

  const handleVoirPlainte = (plainteId: string) => {
    router.push(`/gestion/plaintes/${plainteId}`)
  }

  if (loading) {
    return (
      <Card>
        <CardBody className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Alertes Actives
          </h3>
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-slate-200 rounded"></div>
            <div className="h-16 bg-slate-200 rounded"></div>
            <div className="h-16 bg-slate-200 rounded"></div>
          </div>
        </CardBody>
      </Card>
    )
  }

  if (alertes.length === 0) {
    return (
      <Card>
        <CardBody className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Alertes Actives
          </h3>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-slate-600 font-medium">Aucune alerte active</p>
            <p className="text-sm text-slate-500 mt-1">Toutes les plaintes sont dans les délais</p>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardBody className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Alertes Actives ({alertes.length})
          </h3>
          {alertesCritiques.length > 0 && (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
              {alertesCritiques.length} Critique{alertesCritiques.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Résumé des alertes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-600">{alertesCritiques.length}</div>
            <div className="text-xs text-red-700">Critiques</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-600">{alertesWarning.length}</div>
            <div className="text-xs text-orange-700">Avertissements</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {alertesGroupees.SLA_DEPASSE?.length || 0}
            </div>
            <div className="text-xs text-blue-700">SLA dépassés</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {alertesGroupees.SANS_ACTION?.length || 0}
            </div>
            <div className="text-xs text-purple-700">Sans action</div>
          </div>
        </div>

        {/* Liste des alertes */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {alertes.slice(0, 10).map((alerte) => (
            <div 
              key={alerte.id}
              className={`border rounded-lg p-3 ${getNiveauColor(alerte.niveau)} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getNiveauIcon(alerte.niveau)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-900">
                      {alerte.plainte_numero}
                    </span>
                    <span className="text-xs px-2 py-1 bg-white rounded-full font-medium">
                      {getTypeLabel(alerte.type_alerte)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{alerte.message}</p>
                  {alerte.jours_retard && (
                    <p className="text-xs text-red-600 font-medium mt-1">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {alerte.jours_retard} jour{alerte.jours_retard > 1 ? 's' : ''} de retard
                    </p>
                  )}
                </div>
                <Button 
                  onClick={() => handleVoirPlainte(alerte.plainte_id)}
                  className="bg-white hover:bg-slate-100 text-slate-700 text-xs px-3 py-1 border border-slate-300"
                >
                  Voir
                </Button>
              </div>
            </div>
          ))}
        </div>

        {alertes.length > 10 && (
          <div className="mt-4 text-center">
            <Button 
              onClick={() => router.push('/gestion/plaintes/listes?alerte=true')}
              className="bg-orange-600 hover:bg-orange-700 text-white text-sm"
            >
              Voir toutes les alertes ({alertes.length})
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
