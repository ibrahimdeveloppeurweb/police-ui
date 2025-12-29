"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';
import { 
  Shield, 
  User,
  Lock, 
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  Users,
  BarChart3,
  ShieldCheck,
  Building2
} from "lucide-react";
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { loginInfo, mockUsers } from "@/data/mock-users";
import api from "@/lib/axios";
import { authService } from "@/lib/api/services";
import { apiClient } from "@/lib/api/client";

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur arrive avec le paramètre session=expired
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('session') === 'expired') {
      setSessionExpired(true);
      // Nettoyer l'URL après 5 secondes
      setTimeout(() => {
        window.history.replaceState({}, '', '/auth/login');
      }, 5000);
    }

    const token = Cookies.get('auth_token');
    const userRole = Cookies.get('user_role');
    
    if (token && userRole) {
      switch (userRole.toUpperCase()) {
        case "ADMIN":
        case "ADMIN_PRINCIPAL":
          router.push("/admin/dashboard");
          break;
        case "COMMISSAIRE":
          router.push("/gestion/dashboard");
          break;
        case "AGENT":
          router.push("/gestion/dashboard");
          break;
        default:
          router.push("/");
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validation côté client
      if (!formData.username || formData.username.trim() === '') {
        setError('Veuillez entrer votre matricule ou email');
        setLoading(false);
        return;
      }
      
      if (!formData.password || formData.password.trim() === '') {
        setError('Veuillez entrer votre mot de passe');
        setLoading(false);
        return;
      }
      
      // L'API attend 'matricule' et 'password'
      const loginData = {
        matricule: formData.username.trim(), // Le champ username contient le matricule
        password: formData.password
      };
      
      console.log('Login request sent:', { matricule: loginData.matricule, password: '***' });
      
      // Utiliser authService qui retourne la bonne structure
      const response = await authService.login(loginData);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erreur de connexion');
      }

      const { token, user } = response.data;
      
      // Stocker le token dans le client API
      apiClient.setToken(token);
      
      console.log('Login response:', { user, token: '***' });

      if (!token || !user) {
        throw new Error("Données d'authentification manquantes");
      }

      Cookies.set('auth_token', token, { 
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      // Mapper le rôle API vers le rôle frontend
      const roleMapping: Record<string, string> = {
        'admin': 'ADMIN',
        'supervisor': 'COMMISSAIRE',
        'agent': 'AGENT'
      };
      const userRole = roleMapping[user.role] || 'AGENT';
      const userName = `${user.prenom} ${user.nom}`;
      
      Cookies.set('user_role', userRole, { expires: 7 });
      Cookies.set('user_name', userName, { expires: 7 });
      Cookies.set('user_id', user.id, { expires: 7 });
      Cookies.set('user_email', user.email, { expires: 7 });
      Cookies.set('user_matricule', user.matricule, { expires: 7 });

      // Stocker le commissariat si présent
      if (user.commissariat_id) {
        Cookies.set('user_commissariat_id', user.commissariat_id, { expires: 7 });
        Cookies.set('commissariat_id', user.commissariat_id, { expires: 7 }); // Legacy
      }
      if (user.commissariat) {
        Cookies.set('commissariat_nom', user.commissariat, { expires: 7 });
      }
      if (user.grade) {
        Cookies.set('user_grade', user.grade, { expires: 7 });
      }

      // Stocker aussi dans localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_role', userRole);
        localStorage.setItem('user_name', userName);
        localStorage.setItem('user_id', user.id);
        localStorage.setItem('user_email', user.email);
        localStorage.setItem('user_matricule', user.matricule);
        localStorage.setItem('auth_data', JSON.stringify(user));
        if (user.commissariat_id) {
          localStorage.setItem('user_commissariat_id', user.commissariat_id);
          localStorage.setItem('commissariat_id', user.commissariat_id); // Legacy
        }
        if (user.commissariat) {
          localStorage.setItem('commissariat_nom', user.commissariat);
        }
        if (user.grade) {
          localStorage.setItem('user_grade', user.grade);
        }
      }

      // Rediriger selon le rôle
      const redirectPath = userRole === 'ADMIN' ? '/admin/dashboard' : '/gestion/dashboard';
      console.log('🔐 Connexion réussie - Rôle:', userRole, '-> Redirection:', redirectPath);
      
      // Utiliser window.location.href pour forcer un rechargement complet
      window.location.href = redirectPath;
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        err.message ||
        "Email ou mot de passe incorrect."
      );
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (type: keyof typeof loginInfo) => {
    setFormData({
      username: loginInfo[type].matricule,
      password: loginInfo[type].password,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const features = [
    {
      icon: <Shield className="w-6 h-6 text-white" />,
      title: "Sécurité Renforcée",
      description: "Authentification sécurisée avec chiffrement AES-256 et protection contre les accès non autorisés.",
    },
    {
      icon: <Users className="w-6 h-6 text-white" />,
      title: "Gestion Multi-Niveaux",
      description: "Accès différenciés selon les rôles : Administrateurs nationaux, Chefs de commissariat et Agents.",
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-white" />,
      title: "Tableaux de Bord Temps Réel",
      description: "Visualisation instantanée des données, statistiques nationales et rapports d'activité.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Colonne gauche - Bleu Contrôle */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-controle-blue bg-controle-blue relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 border-2 border-white rounded-full animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-20 left-20 w-28 h-28 border-2 border-white rounded-full animate-pulse animation-delay-4000"></div>
          <div className="absolute bottom-40 right-40 w-36 h-36 border-2 border-white rounded-full animate-pulse"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-white p-4 rounded-2xl backdrop-blur-20 border border-white/30">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="w-[50px] h-[50px] object-contain"
                />
              </div>
              <div className="ml-4 h-12 w-1 bg-gradient-to-b from-controle-blue via-white to-green-500 rounded"></div>
            </div>
            <h1 className="text-5xl font-bold mb-4">Police Nationale</h1>
            <p className="text-2xl text-white/90 mb-2">République de Côte d'Ivoire</p>
            <p className="text-lg text-white/80 leading-relaxed">
              Système Intégré de Gestion des Opérations Policières et de Contrôle Routier
            </p>
          </div>

          <div className="space-y-8">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start space-x-4 group">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-10 border border-white/30 flex-shrink-0 group-hover:bg-white/30 transition-all">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-white/80 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Colonne droite - Formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className=" p-6 rounded-3xl">
                 <div className="bg-white p-4 rounded-2xl backdrop-blur-20 border border-white/30">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="w-[50px] h-[50px] object-contain"
                />
              </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Police Nationale CI</h1>
            <p className="text-gray-600">Connexion Sécurisée</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="p-8 pb-6 border-b border-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-controle-blue mr-2" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Authentification</h2>
                <p className="text-gray-500 text-sm mt-2">
                  Connectez-vous avec votre matricule officiel
                </p>
              </div>
            </div>

            <div className="p-8 pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {sessionExpired && (
                  <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Session expirée</p>
                      <p className="text-xs mt-1">Votre session a expiré. Veuillez vous reconnecter.</p>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-3">
                    Matricule
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="pl-12"
                      placeholder="Ex: 12345"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-12 pr-12"
                      placeholder="••••••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-controle-blue bg-gray-100 border-gray-300 rounded focus:ring-controle-blue"
                    />
                    <span className="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
                  </label>
                  <a href="#" className="text-sm text-controle-blue hover:text-controle-blue font-medium">
                    Mot de passe oublié ?
                  </a>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-controle-blue hover:bg-controle-blue text-white py-4 text-base font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Vérification en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-3" />
                      Se connecter
                    </>
                  )}
                </Button>
              </form>

              {/* Comptes de démonstration */}
              <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-controle-blue border">
                <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-controle-blue" />
                  Comptes de connexion
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg group hover:bg-blue-50 transition-colors cursor-pointer"
                       onClick={() => quickLogin('admin')}>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-controle-blue" />
                      <span className="font-medium text-controle-blue">Admin Principal</span>
                    </div>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">admin@police.ci</code>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg group hover:bg-blue-50 transition-colors cursor-pointer"
                       onClick={() => quickLogin('chef')}>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-controle-blue" />
                      <span className="font-medium text-controle-blue">Commissaire</span>
                    </div>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">commissaire@police.ci</code>
                  </div>
            
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg group hover:bg-blue-50 transition-colors cursor-pointer"
                       onClick={() => quickLogin('agent1')}>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-controle-blue" />
                      <span className="font-medium text-controle-blue">Agent 1</span>
                    </div>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">agent1@police.ci</code>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg group hover:bg-blue-50 transition-colors cursor-pointer"
                       onClick={() => quickLogin('agent2')}>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-controle-blue" />
                      <span className="font-medium text-controle-blue">Agent 2</span>
                    </div>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">agent2@police.ci</code>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="text-center mt-8 text-gray-500 text-sm space-y-1">
            <p>&copy; 2025 Police Nationale de Côte d'Ivoire</p>
            <p>Ministère de l'Intérieur et de la Sécurité</p>
            <p className="text-xs">Conçue par: <b>PRODESTIC</b></p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
        .animate-pulse { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}