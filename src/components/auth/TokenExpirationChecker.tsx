"use client";

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

/**
 * Composant qui vérifie périodiquement la validité du token
 * et redirige automatiquement vers la page de connexion si expiré
 */
export default function TokenExpirationChecker() {
  const router = useRouter();
  const pathname = usePathname();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Pages publiques qui ne nécessitent pas de vérification
    const publicPages = ['/auth/login', '/auth/register', '/unauthorized'];
    const isPublicPage = publicPages.some(page => pathname.startsWith(page));

    if (isPublicPage) {
      return;
    }

    // Fonction de vérification du token
    const checkTokenValidity = async () => {
      const token = Cookies.get('auth_token');
      
      // Si pas de token, rediriger immédiatement
      if (!token) {
        console.warn('⚠️ Aucun token trouvé - Redirection vers login');
        clearInterval(intervalRef.current!);
        
        // Nettoyer tous les cookies et localStorage
        Cookies.remove('auth_token');
        Cookies.remove('refresh_token');
        Cookies.remove('user_role');
        Cookies.remove('user_name');
        Cookies.remove('user_id');
        Cookies.remove('user_email');
        Cookies.remove('commissariat_id');
        Cookies.remove('commissariat_nom');
        Cookies.remove('user_matricule');
        Cookies.remove('user_grade');
        
        if (typeof window !== 'undefined') {
          localStorage.clear();
        }
        
        router.push('/auth/login?session=expired');
        return;
      }

      // Vérifier si le token est expiré (JWT decode)
      try {
        const tokenPayload = parseJWT(token);
        
        if (tokenPayload && tokenPayload.exp) {
          const currentTime = Math.floor(Date.now() / 1000);
          const timeUntilExpiry = tokenPayload.exp - currentTime;
          
          // Si le token expire dans moins de 30 secondes ou est déjà expiré
          if (timeUntilExpiry <= 30) {
            console.warn('⚠️ Token expiré ou sur le point d\'expirer - Redirection vers login');
            clearInterval(intervalRef.current!);
            
            // Nettoyer tous les cookies et localStorage
            Cookies.remove('auth_token');
            Cookies.remove('refresh_token');
            Cookies.remove('user_role');
            Cookies.remove('user_name');
            Cookies.remove('user_id');
            Cookies.remove('user_email');
            Cookies.remove('commissariat_id');
            Cookies.remove('commissariat_nom');
            Cookies.remove('user_matricule');
            Cookies.remove('user_grade');
            
            if (typeof window !== 'undefined') {
              localStorage.clear();
            }
            
            router.push('/auth/login?session=expired');
          } else {
            console.log(`✅ Token valide - Expire dans ${Math.floor(timeUntilExpiry / 60)} minutes`);
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors de la vérification du token:', error);
        // Si on ne peut pas décoder le token, le considérer comme invalide
        clearInterval(intervalRef.current!);
        
        Cookies.remove('auth_token');
        Cookies.remove('refresh_token');
        Cookies.remove('user_role');
        Cookies.remove('user_name');
        Cookies.remove('user_id');
        Cookies.remove('user_email');
        Cookies.remove('commissariat_id');
        Cookies.remove('commissariat_nom');
        Cookies.remove('user_matricule');
        Cookies.remove('user_grade');
        
        if (typeof window !== 'undefined') {
          localStorage.clear();
        }
        
        router.push('/auth/login?session=expired');
      }
    };

    // Vérifier immédiatement au chargement
    checkTokenValidity();

    // Vérifier toutes les 30 secondes
    intervalRef.current = setInterval(checkTokenValidity, 30000);

    // Nettoyer l'intervalle au démontage du composant
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pathname, router]);

  // Ce composant ne rend rien visuellement
  return null;
}

/**
 * Parse un JWT token pour extraire le payload
 */
function parseJWT(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erreur lors du parsing du JWT:', error);
    return null;
  }
}
