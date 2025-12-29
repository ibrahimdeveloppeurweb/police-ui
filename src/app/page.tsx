'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import Cookies from 'js-cookie'
import api from '@/lib/axios'

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        // Vérifier le token dans les cookies (comme le fait le middleware)
        const token = Cookies.get('auth_token') || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null)
        const userRole = Cookies.get('user_role') || (typeof window !== 'undefined' ? localStorage.getItem('user_role') : null)
        
        if (!token) {
          // Pas de token, rediriger directement vers la page de connexion
          setLoading(false)
          router.push('/auth/login')
          return
        }

        // Vérifier le token avec l'API
        try {
          const response = await api.get('/auth/me')
          if (response.data && response.data.data) {
            // Token valide, rediriger selon le rôle
            const role = userRole || response.data.data.role || 'USER'
            
            setLoading(false)
            switch (role.toUpperCase()) {
              case 'ADMIN':
              case 'ADMIN_PRINCIPAL':
                router.push('/admin/dashboard')
                return
              case 'COMMISSAIRE':
                router.push('/gestion/dashboard')
                return
              case 'AGENT':
                router.push('/gestion/controles/listes')
                return
              default:
                router.push('/gestion/dashboard')
                return
            }
          }
        } catch (error) {
          // Token invalide, rediriger vers la page de connexion
          console.error('Token validation failed:', error)
          // Nettoyer les cookies et localStorage
          Cookies.remove('auth_token')
          Cookies.remove('user_role')
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user_role')
          }
          setLoading(false)
          router.push('/auth/login')
          return
        }
      } catch (error) {
        console.error('Auth check error:', error)
        // En cas d'erreur, rediriger vers la page de connexion
        setLoading(false)
        router.push('/auth/login')
      }
    }

    // Délai minimal pour éviter le flash
    const timer = setTimeout(() => {
      checkAuthAndRedirect()
    }, 500)
    
    return () => clearTimeout(timer)
  }, [router])

  // Afficher le loader pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-police-blue via-admin-accent to-admin-primary flex items-center justify-center">
        <div className="text-center text-white">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white/20 p-8 rounded-3xl backdrop-blur-20 border border-white/30">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-[50px] h-[50px] object-contain"
              />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">Police Nationale CI</h1>
          <p className="text-xl opacity-90 mb-8">Système de Gestion des Contrôles Routiers</p>
          
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-lg">Vérification des autorisations...</span>
          </div>
        </div>
      </div>
    )
  }


  // Par défaut, afficher le loader (ne devrait jamais arriver ici)
  return (
    <div className="min-h-screen bg-gradient-to-br from-police-blue via-admin-accent to-admin-primary flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-white" />
    </div>
  )
}