'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { CheckCircle, XCircle, Loader2, Wifi, WifiOff } from 'lucide-react'

export default function TestAPIConnectionPage() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<{
    backend: { status: string; message: string }
    createTest: { status: string; message: string; data?: any }
  } | null>(null)

  const testConnection = async () => {
    setTesting(true)
    setResults(null)

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
    
    const newResults = {
      backend: { status: 'pending', message: 'Testing...' },
      createTest: { status: 'pending', message: 'Testing...' }
    }

    try {
      // Test 1: Backend Health
      console.log('Testing backend at:', API_URL)
      
      try {
        const healthResponse = await fetch(`${API_URL}/convocations`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (healthResponse.ok || healthResponse.status === 401) {
          newResults.backend = {
            status: 'success',
            message: `Backend accessible (${healthResponse.status})`
          }
        } else {
          newResults.backend = {
            status: 'error',
            message: `Backend répond avec status ${healthResponse.status}`
          }
        }
      } catch (error) {
        newResults.backend = {
          status: 'error',
          message: error instanceof Error ? error.message : 'Connexion impossible'
        }
      }

      setResults({ ...newResults })

      // Test 2: Create Convocation
      if (newResults.backend.status === 'success') {
        try {
          const testData = {
            civilite: 'M',
            nom: 'TEST_FRONTEND',
            prenoms: 'Connection',
            adresse: 'Adresse de test',
            telephone: '+225 07 00 00 00 02',
            type_convocation: 'AUDITION_TEMOIN',
            objet: 'Test de connexion frontend',
            date_convocation: '2024-12-25',
            heure_convocation: '10:00',
            duree_estimee: 60,
            lieu_convocation: 'Commissariat Test',
            canal_notification: ['SMS'],
            envoyer_immediatement: false
          }

          console.log('Sending test data:', testData)

          const createResponse = await fetch(`${API_URL}/convocations`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
          })

          const responseData = await createResponse.json()
          console.log('API Response:', responseData)

          if (createResponse.ok) {
            newResults.createTest = {
              status: 'success',
              message: `Convocation créée avec succès !`,
              data: responseData
            }
          } else {
            newResults.createTest = {
              status: 'error',
              message: `Erreur ${createResponse.status}: ${responseData.error || 'Erreur inconnue'}`,
              data: responseData
            }
          }
        } catch (error) {
          newResults.createTest = {
            status: 'error',
            message: error instanceof Error ? error.message : 'Erreur lors de la création'
          }
        }
      } else {
        newResults.createTest = {
          status: 'skipped',
          message: 'Test ignoré (backend non accessible)'
        }
      }

      setResults({ ...newResults })
    } finally {
      setTesting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case 'error':
        return <XCircle className="w-6 h-6 text-red-600" />
      case 'pending':
        return <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      default:
        return <WifiOff className="w-6 h-6 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-500'
      case 'error':
        return 'bg-red-50 border-red-500'
      case 'pending':
        return 'bg-blue-50 border-blue-500'
      default:
        return 'bg-gray-50 border-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Wifi className="w-10 h-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Test de Connexion API</h1>
          </div>
          <p className="text-gray-600">
            Vérifiez que le frontend peut communiquer avec le backend
          </p>
        </div>

        {/* Configuration */}
        <Card className="border-2 border-blue-200">
          <CardBody className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Configuration</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">API URL:</span>
                <span className="font-mono font-medium text-blue-600">
                  {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frontend URL:</span>
                <span className="font-mono font-medium text-green-600">
                  {typeof window !== 'undefined' ? window.location.origin : 'N/A'}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Test Button */}
        <div className="flex justify-center">
          <Button
            onClick={testConnection}
            disabled={testing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            {testing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Test en cours...
              </>
            ) : (
              <>
                <Wifi className="w-5 h-5 mr-2" />
                Tester la Connexion
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-4 animate-fadeIn">
            {/* Backend Test */}
            <Card className={`border-2 ${getStatusColor(results.backend.status)}`}>
              <CardBody className="p-6">
                <div className="flex items-start gap-4">
                  {getStatusIcon(results.backend.status)}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">
                      1. Connexion Backend
                    </h3>
                    <p className="text-sm text-gray-700">{results.backend.message}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Create Test */}
            <Card className={`border-2 ${getStatusColor(results.createTest.status)}`}>
              <CardBody className="p-6">
                <div className="flex items-start gap-4">
                  {getStatusIcon(results.createTest.status)}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">
                      2. Test de Création
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">{results.createTest.message}</p>
                    
                    {results.createTest.data && (
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-96">
                        <pre className="text-xs">
                          {JSON.stringify(results.createTest.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Summary */}
            <Card className="border-2 border-gray-200">
              <CardBody className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Résumé</h3>
                <div className="space-y-2 text-sm">
                  {results.backend.status === 'success' && results.createTest.status === 'success' ? (
                    <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
                      <p className="text-green-900 font-medium">
                        ✅ Tous les tests sont passés ! Le frontend peut créer des convocations.
                      </p>
                      <p className="text-green-700 mt-2 text-xs">
                        Vous pouvez maintenant utiliser le formulaire de création normalement.
                      </p>
                      <a 
                        href="/gestion/convocations/nouvelle"
                        className="inline-block mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        Aller au formulaire →
                      </a>
                    </div>
                  ) : results.backend.status === 'error' ? (
                    <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
                      <p className="text-red-900 font-medium">
                        ❌ Backend non accessible
                      </p>
                      <p className="text-red-700 mt-2 text-xs">
                        Vérifiez que le backend tourne sur http://localhost:8080
                      </p>
                      <code className="block mt-2 bg-red-900 text-red-100 p-2 rounded text-xs">
                        cd police-trafic-api-frontend-aligned && make run
                      </code>
                    </div>
                  ) : results.createTest.status === 'error' ? (
                    <div className="bg-amber-50 border-2 border-amber-500 rounded-lg p-4">
                      <p className="text-amber-900 font-medium">
                        ⚠️ Backend accessible mais erreur de création
                      </p>
                      <p className="text-amber-700 mt-2 text-xs">
                        Vérifiez les logs du backend pour plus de détails.
                      </p>
                    </div>
                  ) : null}
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Instructions */}
        <Card className="border-2 border-gray-200">
          <CardBody className="p-6">
            <h3 className="font-bold text-gray-900 mb-4">Instructions</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-gray-900 mb-1">1. Démarrer le Backend</p>
                <code className="block bg-gray-900 text-gray-100 p-2 rounded">
                  cd police-trafic-api-frontend-aligned && make run
                </code>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">2. Démarrer le Frontend</p>
                <code className="block bg-gray-900 text-gray-100 p-2 rounded">
                  cd police-trafic-frontend-aligned && npm run dev
                </code>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">3. Cliquer sur "Tester la Connexion"</p>
                <p className="text-gray-600">
                  Le test va vérifier que le frontend peut communiquer avec l'API
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
