'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { ShieldX, Home, ArrowLeft, LogIn, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Cookies from 'js-cookie'

function UnauthorizedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentRole, setCurrentRole] = useState<string | null>(null)
  const [requiredRole, setRequiredRole] = useState<string | null>(null)

  useEffect(() => {
    // Récupérer le rôle actuel depuis les cookies
    const role = Cookies.get('user_role')
    setCurrentRole(role || null)

    // Déterminer le rôle requis selon la page précédente
    const referrer = document.referrer
    if (referrer) {
      if (referrer.includes('/admin')) {
        setRequiredRole('ADMIN ou ADMIN_PRINCIPAL')
      } else if (referrer.includes('/gestion')) {
        setRequiredRole('COMMISSAIRE, AGENT ou ADMIN_PRINCIPAL')
      }
    }
  }, [])

  const handleQuickLogin = () => {
    router.push('/dev-login')
  }

  const handleLogout = () => {
    // Supprimer tous les cookies
    Cookies.remove('auth_token', { path: '/' })
    Cookies.remove('user_role', { path: '/' })
    Cookies.remove('user_name', { path: '/' })
    Cookies.remove('user_id', { path: '/' })
    Cookies.remove('user_email', { path: '/' })
    
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
    }
    
    router.push('/dev-login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-100 p-4">
            <ShieldX className="h-16 w-16 text-red-600" />
          </div>
        </div>
        
        <h1 className="mb-4 text-3xl font-bold text-gray-900 text-center">
          Accès Refusé
        </h1>
        
        <p className="mb-4 text-lg text-gray-600 text-center">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>

        {/* Informations sur les rôles */}
        <div className="mb-6 space-y-3 p-4 bg-gray-50 rounded-lg">
          {currentRole && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Rôle actuel :</span>
              <span className="text-sm font-semibold text-red-600">{currentRole}</span>
            </div>
          )}
          {requiredRole && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Rôle requis :</span>
              <span className="text-sm font-semibold text-blue-600">{requiredRole}</span>
            </div>
          )}
        </div>
        
        <p className="mb-8 text-sm text-gray-500 text-center">
          Si vous pensez que c'est une erreur, veuillez contacter votre administrateur.
        </p>
        
        <div className="space-y-3">
          {/* Bouton de connexion rapide (mode développement) */}
          {process.env.NODE_ENV === 'development' && (
            <Button
              onClick={handleQuickLogin}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              <Zap className="mr-2 h-4 w-4" />
              Connexion Rapide (Mode Dev)
            </Button>
          )}

          {/* Bouton de déconnexion si connecté */}
          {currentRole && (
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Se déconnecter et se reconnecter
            </Button>
          )}

          {/* Boutons d'action */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center pt-2">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            
            <Button
              onClick={() => router.push('/auth/login')}
              className="w-full sm:w-auto"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Se connecter
            </Button>
            
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Home className="mr-2 h-4 w-4" />
              Accueil
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <ShieldX className="mx-auto h-16 w-16 text-red-500 mb-6 animate-pulse" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <UnauthorizedContent />
    </Suspense>
  )
}

