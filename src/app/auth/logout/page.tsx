'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Shield, LogOut, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';

export default function LogoutPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [userName, setUserName] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Récupérer le nom d'utilisateur depuis les cookies avant nettoyage
    const storedUserName = Cookies.get('user_name') || 'Agent';
    setUserName(storedUserName);

    // Simulation du processus de déconnexion sécurisée
    const logoutProcess = async () => {
      try {
        setStatus('processing');
        
        // Simulation d'appel API pour invalider la session côté serveur
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Option: Appel réel à l'API de déconnexion
        const token = Cookies.get('auth_token');
        if (token) {
          try {
            await api.post('/auth/logout', {}, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch (err) {
            console.error('Erreur lors de la déconnexion API:', err);
          }
        }
        
        // Nettoyer TOUS les cookies d'authentification
        Cookies.remove('auth_token', { path: '/' });
        Cookies.remove('refresh_token', { path: '/' });
        Cookies.remove('user_role', { path: '/' });
        Cookies.remove('user_name', { path: '/' });
        Cookies.remove('user_id', { path: '/' });
        Cookies.remove('user_email', { path: '/' });
        Cookies.remove('user_permissions', { path: '/' });
        Cookies.remove('user_commissariat_id', { path: '/' });
        
        // Nettoyer le stockage local (backup)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_role');
          localStorage.removeItem('user_name');
          localStorage.removeItem('user_id');
          localStorage.removeItem('user_email');
          localStorage.removeItem('user_permissions');
          localStorage.removeItem('user_commissariat_id');
          localStorage.removeItem('auth_data');
          sessionStorage.clear();
          
          // Forcer la suppression de tous les cookies
          document.cookie.split(";").forEach((c) => {
            const eqPos = c.indexOf("=");
            const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
            if (name.startsWith('auth_') || name.startsWith('user_')) {
              Cookies.remove(name, { path: '/' });
              Cookies.remove(name, { path: '/', domain: window.location.hostname });
            }
          });
        }

        setStatus('success');
        
      } catch (error) {
        setStatus('error');
      }
    };

    logoutProcess();
  }, []);

  // Effet séparé pour la redirection
  useEffect(() => {
    if (!mounted || status !== 'success') return;

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          // Redirection après le dernier tick
          setTimeout(() => {
            router.push('/auth/login');
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [status, mounted, router]);

  // Effet séparé pour gérer l'erreur
  useEffect(() => {
    if (status === 'error') {
      const timeout = setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [status, router]);

  // Ne rien afficher pendant l'hydratation
  if (!mounted) {
    return null;
  }

  const statusConfig = {
    processing: {
      icon: <LogOut className="w-10 h-10 text-controle-blue animate-pulse" />,
      title: "Déconnexion en cours...",
      message: "Sécurisation de votre session",
      bgColor: "from-blue-500/10 to-blue-400/10",
      borderColor: "border-controle-blue"
    },
    success: {
      icon: <CheckCircle className="w-10 h-10 text-green-600" />,
      title: "Déconnexion réussie",
      message: `Au revoir ${userName}`,
      bgColor: "from-green-500/10 to-emerald-500/10",
      borderColor: "border-green-200"
    },
    error: {
      icon: <AlertCircle className="w-10 h-10 text-red-600" />,
      title: "Erreur de déconnexion",
      message: "Redirection automatique...",
      bgColor: "from-red-500/10 to-red-400/10",
      borderColor: "border-red-200"
    }
  };

  const currentStatus = statusConfig[status];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Éléments décoratifs de fond */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-controle-blue/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-controle-blue/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Logo en-tête */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="bg-controle-blue p-6 rounded-3xl shadow-xl">
                  <img
                  src="/logo.png"
                  alt="Logo"
                  className="w-[50px] h-[50px] object-contain"
                />
              </div>
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-400 rounded-full border-4 border-white animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Police Nationale CI</h1>
          <p className="text-gray-600">Système de Sécurité</p>
        </div>

        <div className={`shadow-2xl border-2 ${currentStatus.borderColor} bg-white/95 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-500`}>
          {/* Barre de statut */}
          <div className={`h-2 bg-gradient-to-r ${status === 'success' ? 'from-green-400 to-emerald-500' : status === 'error' ? 'from-red-400 to-red-500' : 'bg-controle-blue'}`}></div>
          
          <div className="p-12 text-center">
            {/* Icône de statut */}
            <div className={`mb-8 p-6 bg-gradient-to-br ${currentStatus.bgColor} rounded-3xl w-fit mx-auto border-2 ${currentStatus.borderColor}`}>
              {currentStatus.icon}
            </div>

            {/* Messages de statut */}
            <div className="mb-8 space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {currentStatus.title}
              </h2>
              <p className="text-gray-600 text-lg">
                {currentStatus.message}
              </p>
              
              {status === 'processing' && (
                <div className="flex items-center justify-center mt-6 space-x-2 text-controle-blue">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-controle-blue rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-controle-blue rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-controle-blue rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              )}
              
              {status === 'success' && countdown > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center justify-center space-x-3 text-green-700">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold">
                      Redirection dans {countdown} seconde{countdown !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="mt-3 w-full bg-green-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Informations de sécurité */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-gray-100">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-gray-600 font-medium">Session fermée</p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  </div>
                  <p className="text-gray-600 font-medium">Données sécurisées</p>
                </div>
              </div>
            </div>

            {/* Actions d'urgence */}
            {status === 'error' && (
              <div className="mt-6">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="text-controle-blue hover:text-controle-blue font-semibold underline transition-colors"
                >
                  Retourner à la connexion maintenant
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-2">
          <div className="flex items-center justify-center space-x-4 text-gray-400 text-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <span>Déconnexion Sécurisée</span>
            </div>
            <div className="w-1 h-4 bg-gray-300"></div>
            <span>Session Terminée</span>
          </div>
          <p className="text-gray-500 text-sm">
            &copy; 2025 Police Nationale de Côte d'Ivoire
          </p>
        </div>
      </div>
    </div>
  );
}