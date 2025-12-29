// hooks/useAuth.ts
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface Commissariat {
  id: string;
  nom: string;
  code?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  user_type: string;
  active: boolean;
  email_verified: boolean;
  two_factor_enabled: boolean;
  commissariatId?: string;
  commissariat?: Commissariat;
  matricule?: string;
  grade?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      //  Récupérer depuis les cookies
      const token = Cookies.get('auth_token');
      const userRole = Cookies.get('user_role');
      const userName = Cookies.get('user_name');
      const userId = Cookies.get('user_id');
      const userEmail = Cookies.get('user_email');
      const commissariatId = Cookies.get('commissariat_id');
      const commissariatNom = Cookies.get('commissariat_nom');
      const userMatricule = Cookies.get('user_matricule');
      const userGrade = Cookies.get('user_grade');

      if (token && userRole) {
        //  Reconstituer l'objet user
        const userObj: User = {
          id: userId || '',
          email: userEmail || '',
          name: userName || '',
          user_type: userRole,
          active: true,
          email_verified: false,
          two_factor_enabled: false,
          commissariatId: commissariatId || undefined,
          commissariat: commissariatId ? {
            id: commissariatId,
            nom: commissariatNom || ''
          } : undefined,
          matricule: userMatricule || undefined,
          grade: userGrade || undefined,
        };

        setUser(userObj);
        
          //  Vérifier les permissions selon la route actuelle
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            
            if (currentPath.startsWith('/admin') && 
                !['ADMIN', 'ADMIN_PRINCIPAL'].includes(userRole)) {
              router.push('/unauthorized');
              return;
            }
            
            if (currentPath.startsWith('/gestion') && 
                !['COMMISSAIRE', 'AGENT', 'ADMIN_PRINCIPAL'].includes(userRole)) {
              router.push('/unauthorized');
              return;
            }
          }
      } else {
        //  Si on est sur une route protégée et pas connecté, rediriger
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          if (currentPath.startsWith('/admin') || currentPath.startsWith('/gestion')) {
            router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
          }
        }
      }
    } catch (error) {
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/admin') || currentPath.startsWith('/gestion')) {
          router.push('/auth/login');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const login = (token: string, userData: User, refreshToken?: string) => {
    const cookieOptions = {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const
    };

    // Stocker dans les cookies
    Cookies.set('auth_token', token, cookieOptions);

    if (refreshToken) {
      Cookies.set('refresh_token', refreshToken, cookieOptions);
    }

    Cookies.set('user_role', userData.user_type, cookieOptions);
    Cookies.set('user_name', userData.name, cookieOptions);
    Cookies.set('user_id', userData.id, cookieOptions);
    Cookies.set('user_email', userData.email, cookieOptions);

    // Stocker commissariat si disponible
    if (userData.commissariatId) {
      Cookies.set('commissariat_id', userData.commissariatId, cookieOptions);
    }
    if (userData.commissariat?.nom) {
      Cookies.set('commissariat_nom', userData.commissariat.nom, cookieOptions);
    }
    if (userData.matricule) {
      Cookies.set('user_matricule', userData.matricule, cookieOptions);
    }
    if (userData.grade) {
      Cookies.set('user_grade', userData.grade, cookieOptions);
    }

    // Stocker aussi dans localStorage pour usage client
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
      localStorage.setItem('user_role', userData.user_type);
      localStorage.setItem('user_name', userData.name);
      localStorage.setItem('user_id', userData.id);
      localStorage.setItem('user_email', userData.email);
      if (userData.commissariatId) {
        localStorage.setItem('commissariat_id', userData.commissariatId);
      }
      if (userData.commissariat?.nom) {
        localStorage.setItem('commissariat_nom', userData.commissariat.nom);
      }
      if (userData.matricule) {
        localStorage.setItem('user_matricule', userData.matricule);
      }
      if (userData.grade) {
        localStorage.setItem('user_grade', userData.grade);
      }
      localStorage.setItem('auth_data', JSON.stringify(userData));
    }

    setUser(userData);
    
    // ✅ Récupérer le redirect depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    
    let redirectPath = redirect || '/';
    
    if (!redirect) {
      // Redirection par défaut selon le user_type
      switch (userData.user_type) {
        case 'ADMIN':
          redirectPath = '/admin/dashboard';
          break;
        case 'COMMISSAIRE':
          redirectPath = '/gestion/dashboard';
          break;
        case 'AGENT':
          redirectPath = '/admin/dashboard';
          break;
        default:
          redirectPath = '/';
      }
    }
    
    router.push(redirectPath);
  };

  const logout = () => {
    // Supprimer les cookies
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

    // Supprimer localStorage
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }

    setUser(null);
    router.push('/auth/login');
  };

  const isAuthenticated = (): boolean => {
    const token = Cookies.get('auth_token');
    return !!token;
  };

  const hasRole = (role: string): boolean => {
    return user?.user_type === role;
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // ADMIN_PRINCIPAL a accès à tout
    if (user.user_type === 'ADMIN_PRINCIPAL') {
      return true;
    }
    
    // Récupérer les permissions depuis localStorage ou cookies
    const userPermissionsStr = localStorage.getItem('user_permissions') || Cookies.get('user_permissions') || '[]';
    let userPermissions: string[] = [];
    
    try {
      userPermissions = JSON.parse(userPermissionsStr);
    } catch (e) {
      // Si erreur de parsing, utiliser les permissions par défaut du rôle
      const rolePermissions: Record<string, string[]> = {
        'COMMISSAIRE': [
          'view_controles', 'create_controle', 'edit_controle',
          'view_verbalisations', 'create_verbalisation', 'edit_verbalisation',
          'view_amendes', 'create_amende', 'edit_amende', 'process_payment',
          'view_infractions', 'manage_infractions',
          'view_reports', 'create_report', 'export_reports',
          'view_agents', 'manage_agents', 'manage_permissions',
        ],
        'AGENT': [
          'view_controles', 'create_controle',
          'view_verbalisations', 'create_verbalisation',
          'view_amendes',
          'view_infractions',
          'view_reports', 'create_report',
        ],
      };
      userPermissions = rolePermissions[user.user_type] || [];
    }
    
    // Vérifier si l'utilisateur a la permission
    return userPermissions.includes('*') || userPermissions.includes(permission);
  };

  const refreshAuth = () => {
    checkAuth();
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole,
    hasPermission,
    refreshAuth,
  };
}