/**
 * Fonction utilitaire pour déconnecter l'utilisateur
 * Supprime tous les cookies et données de session
 */
import Cookies from 'js-cookie'

export function logout() {
  // Supprimer tous les cookies d'authentification
  const cookiesToRemove = [
    'auth_token',
    'refresh_token',
    'user_role',
    'user_name',
    'user_id',
    'user_email',
    'user_permissions',
    'user_commissariat_id'
  ]

  cookiesToRemove.forEach(cookieName => {
    // Supprimer avec différents chemins pour être sûr
    Cookies.remove(cookieName, { path: '/' })
    Cookies.remove(cookieName, { path: '/', domain: window.location.hostname })
  })

  // Nettoyer le localStorage
  if (typeof window !== 'undefined') {
    const keysToRemove = [
      'auth_token',
      'refresh_token',
      'user_role',
      'user_name',
      'user_id',
      'user_email',
      'user_permissions',
      'user_commissariat_id',
      'auth_data'
    ]

    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })

    // Nettoyer sessionStorage
    sessionStorage.clear()

    // Supprimer tous les cookies manuellement (au cas où)
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=")
      const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim()
      if (name.startsWith('auth_') || name.startsWith('user_')) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=${window.location.hostname};`
      }
    })
  }

  // Rediriger vers la page de login
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/login'
  }
}

