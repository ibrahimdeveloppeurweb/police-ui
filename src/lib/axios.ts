import axios from "axios";
import Cookies from 'js-cookie';
import { useGlobalLoader } from "@/hooks/useGlobalLoader";

// Création d'une instance Axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Compteur pour gérer plusieurs requêtes simultanées
let requestCount = 0;

// Fonction helper pour afficher/masquer le loader
function toggleLoader(show: boolean) {
  const { setLoading } = useGlobalLoader.getState();
  setLoading(show);
}

//  Intercepteur — avant chaque requête
api.interceptors.request.use(
  (config) => {
    // Incrémenter le compteur et afficher le loader
    requestCount++;
    toggleLoader(true);
    
    // Ajouter le token Bearer si disponible
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    requestCount--;
    if (requestCount <= 0) toggleLoader(false);
    return Promise.reject(error);
  }
);

//  Intercepteur — après chaque réponse
api.interceptors.response.use(
  (response) => {
    // Décrémenter le compteur et masquer le loader si nécessaire
    requestCount--;
    if (requestCount <= 0) toggleLoader(false);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Décrémenter le compteur
    requestCount--;
    if (requestCount <= 0) toggleLoader(false);

    // Si erreur 401 (token expiré) et on n'a pas déjà tenté de rafraîchir
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = Cookies.get('refresh_token');
      
      // Si pas de refresh token, déconnecter immédiatement
      if (!refreshToken) {
        console.warn('⚠️ Token expiré et aucun refresh token disponible');
        
        // Nettoyer tout
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
          window.location.href = '/auth/login?session=expired';
        }
        
        return Promise.reject(error);
      }

      // Tenter de rafraîchir le token
      try {
        console.log('🔄 Tentative de rafraîchissement du token...');
        
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/auth/refresh`,
          { refresh_token: refreshToken },
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );

        const { access_token, refresh_token: newRefreshToken } = response.data;

        // Mettre à jour les tokens dans les cookies
        Cookies.set('auth_token', access_token, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });

        if (newRefreshToken) {
          Cookies.set('refresh_token', newRefreshToken, {
            expires: 7,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
          });
        }

        // Mettre à jour localStorage aussi
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', access_token);
          if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken);
          }
        }

        console.log('✅ Token rafraîchi avec succès');
        
        // Réessayer la requête originale avec le nouveau token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error('❌ Échec du rafraîchissement du token:', refreshError);
        
        // Si le refresh échoue, déconnecter l'utilisateur
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
          window.location.href = '/auth/login?session=expired';
        }
        
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;