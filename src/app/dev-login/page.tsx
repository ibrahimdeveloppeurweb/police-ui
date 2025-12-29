'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { Shield, Building2, User, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { authService } from '@/lib/api/services'
import { apiClient } from '@/lib/api/client'

export default function DevLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Utilisateurs de test correspondant au seed de l'API
  // Mot de passe: password123 pour tous
  const devUsers = [
    {
      name: 'Marie Martin',
      role: 'admin',
      matricule: '67890',
      email: 'm.martin@police.ci',
      description: 'Accès complet au module Administration',
      icon: Shield,
      color: 'bg-blue-600',
      redirect: '/admin/dashboard'
    },
    {
      name: 'Fatou Diallo',
      role: 'supervisor',
      matricule: '22222',
      email: 'f.diallo@police.ci',
      description: 'Accès Superviseur (Commissariat)',
      icon: Building2,
      color: 'bg-green-600',
      redirect: '/gestion/dashboard'
    },
    {
      name: 'Jean Dupont',
      role: 'agent',
      matricule: '12345',
      email: 'j.dupont@police.ci',
      description: 'Accès Agent de terrain',
      icon: User,
      color: 'bg-orange-600',
      redirect: '/gestion/dashboard'
    },
    {
      name: 'Amadou Koné',
      role: 'agent',
      matricule: '11111',
      email: 'a.kone@police.ci',
      description: 'Accès Agent de terrain',
      icon: User,
      color: 'bg-teal-600',
      redirect: '/gestion/dashboard'
    }
  ]

  const handleQuickLogin = async (user: typeof devUsers[0]) => {
    setLoading(user.matricule)
    setError(null)

    try {
      // Appel à l'API réelle
      const response = await authService.login({
        matricule: user.matricule,
        password: 'password123'
      })

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erreur de connexion')
      }

      const { token, user: userData } = response.data

      // Stocker le token dans le client API
      apiClient.setToken(token)

      // Mapper le rôle API vers le rôle frontend
      const roleMapping: Record<string, string> = {
        'admin': 'ADMIN',
        'supervisor': 'COMMISSAIRE',
        'agent': 'AGENT'
      }
      const frontendRole = roleMapping[userData.role] || 'AGENT'

      // Définir les cookies
      Cookies.set('auth_token', token, {
        expires: 7,
        secure: false,
        sameSite: 'lax'
      })
      Cookies.set('user_role', frontendRole, { expires: 7 })
      Cookies.set('user_name', `${userData.prenom} ${userData.nom}`, { expires: 7 })
      Cookies.set('user_id', userData.id, { expires: 7 })
      Cookies.set('user_email', userData.email, { expires: 7 })
      Cookies.set('user_matricule', userData.matricule, { expires: 7 })

      // Stocker le commissariat si présent
      if (userData.commissariat_id) {
        Cookies.set('user_commissariat_id', userData.commissariat_id, { expires: 7 })
        Cookies.set('commissariat_id', userData.commissariat_id, { expires: 7 }) // Legacy
      }
      if (userData.commissariat) {
        Cookies.set('commissariat_nom', userData.commissariat, { expires: 7 })
      }
      if (userData.grade) {
        Cookies.set('user_grade', userData.grade, { expires: 7 })
      }

      // Stocker aussi dans localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user_role', frontendRole)
        localStorage.setItem('user_name', `${userData.prenom} ${userData.nom}`)
        localStorage.setItem('user_id', userData.id)
        localStorage.setItem('user_email', userData.email)
        localStorage.setItem('user_matricule', userData.matricule)
        localStorage.setItem('auth_data', JSON.stringify(userData))
        if (userData.commissariat_id) {
          localStorage.setItem('user_commissariat_id', userData.commissariat_id)
          localStorage.setItem('commissariat_id', userData.commissariat_id) // Legacy
        }
        if (userData.commissariat) {
          localStorage.setItem('commissariat_nom', userData.commissariat)
        }
        if (userData.grade) {
          localStorage.setItem('user_grade', userData.grade)
        }
      }

      // Rediriger selon le rôle
     // const redirectPath = frontendRole === 'ADMIN' ? '/admin/dashboard' : '/gestion/dashboard'
    //  window.location.href = redirectPath
    //  566f69ab-8146-44ed-bea2-2fb251523a24

    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8 text-white">
          <h1 className="text-4xl font-bold mb-2">Connexion Développement</h1>
          <p className="text-gray-300">Connexion avec les utilisateurs de test (API réelle)</p>
          <p className="text-gray-400 text-sm mt-1">Mot de passe: password123</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg text-red-800 text-sm">
            <strong>Erreur:</strong> {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devUsers.map((user, index) => {
            const Icon = user.icon
            const isLoading = loading === user.matricule
            return (
              <Card key={index} className="hover:shadow-xl transition-all cursor-pointer">
                <CardBody className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`${user.color} p-3 rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{user.description}</p>
                      <p className="text-xs text-gray-500">Matricule: {user.matricule} | Rôle: {user.role}</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleQuickLogin(user)}
                    disabled={loading !== null}
                    className={`w-full ${user.color} hover:opacity-90 text-white`}
                  >
                    {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                  </Button>
                </CardBody>
              </Card>
            )
          })}
        </div>

        <div className="mt-6 text-center">
          <Button
            onClick={() => router.push('/auth/login')}
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-gray-900"
          >
            Connexion normale
          </Button>
        </div>

        <div className="mt-8 p-4 bg-green-100 border border-green-400 rounded-lg text-green-800 text-sm">
          <strong>API Connectée:</strong> Cette page utilise l&apos;API réelle sur http://localhost:8080.
          Les utilisateurs ci-dessus sont créés via le seed de l&apos;API.
        </div>
      </div>
    </div>
  )
}

