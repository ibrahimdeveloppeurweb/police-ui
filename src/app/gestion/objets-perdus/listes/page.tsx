'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  PackageSearch, Search, Calendar, Eye, Printer, AlertTriangle,
  CheckCircle, Clock, TrendingUp, TrendingDown, FileDown, MapPin,
  User, Archive, Phone, Mail, Plus, X, PackageCheck, FileText, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { useRouter, usePathname } from 'next/navigation'
import { useGestionLayout } from '@/contexts/GestionLayoutContext'
import { useAuth } from '@/hooks/useAuth'
import ObjetPerduFormPage from '../form/page'
import { useObjetsPerdusWithFilters, type ObjetPerduListItem, type ObjetPerduStats } from '@/hooks/useObjetsPerdus'

// Fonction de formatage de date déterministe pour éviter les problèmes d'hydratation
const formatDateOnly = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'N/A'
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return 'N/A'
  }
}

export default function ObjetsPerdusGestionListePage() {
  const router = useRouter()
  const pathname = usePathname()
  const { setTitle, setSubtitle } = useGestionLayout()
  const { user } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'cartes' | 'tableau'>('cartes')
  
  // Formater le nom du commissariat avec "Commissariat du/de" si nécessaire
  const formatCommissariatName = (name: string): string => {
    if (!name) return ''
    // Si le nom contient déjà "Commissariat", on le retourne tel quel
    if (name.toLowerCase().includes('commissariat')) {
      return name
    }
    // Sinon, on ajoute "Commissariat du"
    return `Commissariat du ${name}`
  }
  
  // Mettre à jour le titre et sous-titre quand la page change
  useEffect(() => {
    const commissariatName = user?.commissariat?.nom || ''
    const formattedCommissariat = commissariatName ? formatCommissariatName(commissariatName) : ''
    
    setTitle("Liste des Objets Perdus")
    if (formattedCommissariat) {
      setSubtitle(`${formattedCommissariat} - Gestion des déclarations d'objets perdus`)
    } else {
      setSubtitle("Gestion des déclarations d'objets perdus")
    }
  }, [setTitle, setSubtitle, user?.commissariat?.nom, pathname])
  
  // Utiliser le hook avec gestion automatique des filtres (comme pour les alertes)
  const {
    objets,
    stats,
    loading,
    error,
    pagination,
    commissariat,
    commissariatId,
    refetch,
    periode: globalFilter,
    dateDebut,
    dateFin,
    isCustomDateRange,
    statusFilter,
    typeFilter,
    searchTerm,
    currentPage,
    limit,
    setPeriode: setGlobalFilter,
    setDateDebut,
    setDateFin,
    applyCustomDateRange,
    setStatusFilter,
    setTypeFilter,
    setSearchTerm,
    applySearch,
    setCurrentPage,
  } = useObjetsPerdusWithFilters()

  // Filtrer les objets localement selon les critères de recherche (si nécessaire)
  const filteredObjets = useMemo(() => {
    // La recherche est déjà gérée par l'API, mais on peut ajouter un filtre local supplémentaire si besoin
    return objets;
  }, [objets])

  // Utiliser les données du hook au lieu des données statiques
  const currentData = {
    objets: filteredObjets,
    stats: stats || {
      totalObjets: 0,
      enRecherche: 0,
      retrouves: 0,
      clotures: 0,
      tauxRetrouve: 0,
      evolutionTotal: "0",
      evolutionEnRecherche: "0",
      evolutionRetrouves: "0",
      evolutionClotures: "0",
      evolutionTauxRetrouve: "0",
    }
  }

  const formatNumber = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  const handlePrint = () => window.print()
  const handleExport = () => alert('Export en cours...')

  const handleFilterChange = (filter: 'jour' | 'semaine' | 'mois' | 'annee') => {
    setGlobalFilter(filter)
  }

  // Fonction pour obtenir le label de période
  const getPeriodeLabel = () => {
    switch (globalFilter) {
      case 'jour': return "aujourd'hui"
      case 'semaine': return 'cette semaine'
      case 'mois': return 'ce mois'
      case 'annee': return 'cette année'
      default: return ''
    }
  }

  const handleSearch = () => {
    applySearch();
    if (dateDebut && dateFin) {
      setCurrentPage(1);
      applyCustomDateRange();
    }
  }

  const handlePageChange = (newPage: number) => {
    console.log(`🔄 handlePageChange objets perdus: page actuelle = ${currentPage}, nouvelle page = ${newPage}`);
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const handleObjetPerduSubmit = (data: any) => {
    console.log('Nouvel objet perdu créé:', data)
    refetch()
    setIsModalOpen(false)
  }

  // Liste complète de tous les types d'objets (pour le filtre uniquement)
  const typesObjets = [
    // Documents et papiers
    { value: "Documents d'identité", category: "Documents et papiers" },
    { value: 'Permis de conduire', category: "Documents et papiers" },
    { value: 'Passeport', category: "Documents et papiers" },
    { value: 'Carte grise', category: "Documents et papiers" },
    { value: 'Carte d\'assurance', category: "Documents et papiers" },
    { value: 'Carte bancaire', category: "Documents et papiers" },
    { value: 'Carte d\'étudiant', category: "Documents et papiers" },
    { value: 'Carte de sécurité sociale', category: "Documents et papiers" },
    { value: 'Livres et documents', category: "Documents et papiers" },
    { value: 'Carnets et agendas', category: "Documents et papiers" },
    { value: 'Cahiers et blocs-notes', category: "Documents et papiers" },
    { value: 'Carnet de santé', category: "Documents et papiers" },
    { value: 'Carnet de vaccination', category: "Documents et papiers" },
    { value: 'Diplômes et certificats', category: "Documents et papiers" },
    { value: 'Contrats et factures', category: "Documents et papiers" },
    
    // Électronique et technologie
    { value: 'Téléphone portable', category: 'Électronique et technologie' },
    { value: 'Tablette', category: 'Électronique et technologie' },
    { value: 'Ordinateur portable', category: 'Électronique et technologie' },
    { value: 'Ordinateur de bureau', category: 'Électronique et technologie' },
    { value: 'Souris d\'ordinateur', category: 'Électronique et technologie' },
    { value: 'Clavier d\'ordinateur', category: 'Électronique et technologie' },
    { value: 'Casque audio', category: 'Électronique et technologie' },
    { value: 'Écouteurs', category: 'Électronique et technologie' },
    { value: 'Enceinte Bluetooth', category: 'Électronique et technologie' },
    { value: 'Appareil photo', category: 'Électronique et technologie' },
    { value: 'Caméra', category: 'Électronique et technologie' },
    { value: 'Caméscope', category: 'Électronique et technologie' },
    { value: 'Montre connectée', category: 'Électronique et technologie' },
    { value: 'Bracelet connecté', category: 'Électronique et technologie' },
    { value: 'Chargeur téléphone', category: 'Électronique et technologie' },
    { value: 'Chargeur ordinateur', category: 'Électronique et technologie' },
    { value: 'Batterie externe', category: 'Électronique et technologie' },
    { value: 'Câble USB', category: 'Électronique et technologie' },
    { value: 'Adaptateur secteur', category: 'Électronique et technologie' },
    { value: 'Disque dur externe', category: 'Électronique et technologie' },
    { value: 'Clé USB', category: 'Électronique et technologie' },
    { value: 'Carte mémoire', category: 'Électronique et technologie' },
    { value: 'Lecteur MP3/MP4', category: 'Électronique et technologie' },
    { value: 'Console de jeu portable', category: 'Électronique et technologie' },
    { value: 'Manette de jeu', category: 'Électronique et technologie' },
    { value: 'Télécommande', category: 'Électronique et technologie' },
    { value: 'Calculatrice', category: 'Électronique et technologie' },
    
    // Accessoires personnels
    { value: 'Montre', category: 'Accessoires personnels' },
    { value: 'Lunettes de vue', category: 'Accessoires personnels' },
    { value: 'Lunettes de soleil', category: 'Accessoires personnels' },
    { value: 'Portefeuille', category: 'Accessoires personnels' },
    { value: 'Porte-monnaie', category: 'Accessoires personnels' },
    { value: 'Clés', category: 'Accessoires personnels' },
    { value: 'Porte-clés', category: 'Accessoires personnels' },
    { value: 'Bijoux', category: 'Accessoires personnels' },
    { value: 'Bague', category: 'Accessoires personnels' },
    { value: 'Collier', category: 'Accessoires personnels' },
    { value: 'Bracelet', category: 'Accessoires personnels' },
    { value: 'Boucles d\'oreilles', category: 'Accessoires personnels' },
    { value: 'Broche', category: 'Accessoires personnels' },
    { value: 'Pendentif', category: 'Accessoires personnels' },
    { value: 'Chaîne', category: 'Accessoires personnels' },
    { value: 'Sac à main', category: 'Accessoires personnels' },
    { value: 'Sac à dos', category: 'Accessoires personnels' },
    { value: 'Sac de voyage', category: 'Accessoires personnels' },
    { value: 'Sac de sport', category: 'Accessoires personnels' },
    { value: 'Porte-documents', category: 'Accessoires personnels' },
    { value: 'Trousses et étuis', category: 'Accessoires personnels' },
    { value: 'Parapluie', category: 'Accessoires personnels' },
    { value: 'Chapeau', category: 'Accessoires personnels' },
    { value: 'Casquette', category: 'Accessoires personnels' },
    { value: 'Bonnet', category: 'Accessoires personnels' },
    { value: 'Écharpe', category: 'Accessoires personnels' },
    { value: 'Gants', category: 'Accessoires personnels' },
    { value: 'Ceinture', category: 'Accessoires personnels' },
    { value: 'Cravate', category: 'Accessoires personnels' },
    { value: 'Foulard', category: 'Accessoires personnels' },
    
    // Vêtements et chaussures
    { value: 'Vêtements', category: 'Vêtements et chaussures' },
    { value: 'T-shirt', category: 'Vêtements et chaussures' },
    { value: 'Chemise', category: 'Vêtements et chaussures' },
    { value: 'Pantalon', category: 'Vêtements et chaussures' },
    { value: 'Jean', category: 'Vêtements et chaussures' },
    { value: 'Robe', category: 'Vêtements et chaussures' },
    { value: 'Jupe', category: 'Vêtements et chaussures' },
    { value: 'Veste', category: 'Vêtements et chaussures' },
    { value: 'Manteau', category: 'Vêtements et chaussures' },
    { value: 'Blouson', category: 'Vêtements et chaussures' },
    { value: 'Pull', category: 'Vêtements et chaussures' },
    { value: 'Sweat-shirt', category: 'Vêtements et chaussures' },
    { value: 'Short', category: 'Vêtements et chaussures' },
    { value: 'Maillot de bain', category: 'Vêtements et chaussures' },
    { value: 'Sous-vêtements', category: 'Vêtements et chaussures' },
    { value: 'Chaussures', category: 'Vêtements et chaussures' },
    { value: 'Baskets', category: 'Vêtements et chaussures' },
    { value: 'Chaussures de ville', category: 'Vêtements et chaussures' },
    { value: 'Sandales', category: 'Vêtements et chaussures' },
    { value: 'Bottes', category: 'Vêtements et chaussures' },
    { value: 'Chaussures de sport', category: 'Vêtements et chaussures' },
    { value: 'Tongs', category: 'Vêtements et chaussures' },
    { value: 'Chaussures de sécurité', category: 'Vêtements et chaussures' },
    
    // Véhicules
    { value: 'Vélo', category: 'Véhicules' },
    { value: 'Vélo électrique', category: 'Véhicules' },
    { value: 'Scooter', category: 'Véhicules' },
    { value: 'Trottinette', category: 'Véhicules' },
    { value: 'Trottinette électrique', category: 'Véhicules' },
    { value: 'Casque moto', category: 'Véhicules' },
    { value: 'Casque vélo', category: 'Véhicules' },
    { value: 'Antivol', category: 'Véhicules' },
    { value: 'Rétroviseur', category: 'Véhicules' },
    { value: 'Plaque d\'immatriculation', category: 'Véhicules' },
    { value: 'Accessoires véhicule', category: 'Véhicules' },
    
    // Animaux
    { value: 'Animal de compagnie', category: 'Animaux' },
    { value: 'Chien', category: 'Animaux' },
    { value: 'Chat', category: 'Animaux' },
    { value: 'Oiseau', category: 'Animaux' },
    { value: 'Cage d\'animal', category: 'Animaux' },
    { value: 'Laisse et collier', category: 'Animaux' },
    
    // Articles de sport
    { value: 'Articles sportifs', category: 'Articles de sport' },
    { value: 'Ballon', category: 'Articles de sport' },
    { value: 'Raquette de tennis', category: 'Articles de sport' },
    { value: 'Raquette de badminton', category: 'Articles de sport' },
    { value: 'Club de golf', category: 'Articles de sport' },
    { value: 'Équipement de fitness', category: 'Articles de sport' },
    { value: 'Tapis de sport', category: 'Articles de sport' },
    { value: 'Haltères', category: 'Articles de sport' },
    { value: 'Corde à sauter', category: 'Articles de sport' },
    { value: 'Planche de surf', category: 'Articles de sport' },
    { value: 'Planche à voile', category: 'Articles de sport' },
    { value: 'Équipement de plongée', category: 'Articles de sport' },
    { value: 'Skateboard', category: 'Articles de sport' },
    { value: 'Rollers', category: 'Articles de sport' },
    { value: 'Patins à glace', category: 'Articles de sport' },
    
    // Outils et équipements
    { value: 'Outils', category: 'Outils et équipements' },
    { value: 'Boîte à outils', category: 'Outils et équipements' },
    { value: 'Tournevis', category: 'Outils et équipements' },
    { value: 'Marteau', category: 'Outils et équipements' },
    { value: 'Clé', category: 'Outils et équipements' },
    { value: 'Perceuse', category: 'Outils et équipements' },
    { value: 'Multimètre', category: 'Outils et équipements' },
    { value: 'Équipement de jardinage', category: 'Outils et équipements' },
    
    // Médicaments et santé
    { value: 'Médicaments', category: 'Médicaments et santé' },
    { value: 'Trousse de secours', category: 'Médicaments et santé' },
    { value: 'Lunettes médicales', category: 'Médicaments et santé' },
    { value: 'Appareil auditif', category: 'Médicaments et santé' },
    { value: 'Dentier', category: 'Médicaments et santé' },
    { value: 'Béquilles', category: 'Médicaments et santé' },
    { value: 'Fauteuil roulant', category: 'Médicaments et santé' },
    
    // Jouets et jeux
    { value: 'Jouets', category: 'Jouets et jeux' },
    { value: 'Poupée', category: 'Jouets et jeux' },
    { value: 'Peluche', category: 'Jouets et jeux' },
    { value: 'Jeu de société', category: 'Jouets et jeux' },
    { value: 'Console de jeu', category: 'Jouets et jeux' },
    { value: 'Jeu vidéo', category: 'Jouets et jeux' },
    { value: 'Puzzle', category: 'Jouets et jeux' },
    
    // Instruments de musique
    { value: 'Instrument de musique', category: 'Instruments de musique' },
    { value: 'Guitare', category: 'Instruments de musique' },
    { value: 'Violon', category: 'Instruments de musique' },
    { value: 'Piano portable', category: 'Instruments de musique' },
    { value: 'Flûte', category: 'Instruments de musique' },
    { value: 'Trompette', category: 'Instruments de musique' },
    { value: 'Tambour', category: 'Instruments de musique' },
    { value: 'Microphone', category: 'Instruments de musique' },
    { value: 'Amplificateur', category: 'Instruments de musique' },
    
    // Articles de cuisine
    { value: 'Articles de cuisine', category: 'Articles de cuisine' },
    { value: 'Thermos', category: 'Articles de cuisine' },
    { value: 'Gourde', category: 'Articles de cuisine' },
    { value: 'Bouteille', category: 'Articles de cuisine' },
    { value: 'Tupperware', category: 'Articles de cuisine' },
    { value: 'Lunch box', category: 'Articles de cuisine' },
    
    // Autres
    { value: 'Cigarettes', category: 'Autres' },
    { value: 'Briquet', category: 'Autres' },
    { value: 'Allumettes', category: 'Autres' },
    { value: 'Stylo', category: 'Autres' },
    { value: 'Crayon', category: 'Autres' },
    { value: 'Trousse de stylos', category: 'Autres' },
    { value: 'Règle', category: 'Autres' },
    { value: 'Compas', category: 'Autres' },
    { value: 'Équerre', category: 'Autres' },
    { value: 'Trousse scolaire', category: 'Autres' },
    { value: 'Cartable', category: 'Autres' },
    { value: 'Serviette', category: 'Autres' },
    { value: 'Peigne', category: 'Autres' },
    { value: 'Brosse à cheveux', category: 'Autres' },
    { value: 'Rasoir', category: 'Autres' },
    { value: 'Tondeuse', category: 'Autres' },
    { value: 'Sèche-cheveux', category: 'Autres' },
    { value: 'Fer à repasser', category: 'Autres' },
    { value: 'Lampe de poche', category: 'Autres' },
    { value: 'Boussole', category: 'Autres' },
    { value: 'Jumelles', category: 'Autres' },
    { value: 'Téléscope', category: 'Autres' },
    { value: 'Lunettes d\'observation', category: 'Autres' },
    { value: 'Coffret à bijoux', category: 'Autres' },
    { value: 'Valise', category: 'Autres' },
    { value: 'Bagage', category: 'Autres' },
    { value: 'Autre', category: 'Autres' },
  ]


  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(currentData.objets.map(o => o.typeObjet))).sort()
  }, [currentData.objets])

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'EN_RECHERCHE': return 'bg-blue-500 text-white'
      case 'RETROUVE': return 'bg-green-500 text-white'
      case 'CLOTURE': return 'bg-gray-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'EN_RECHERCHE': return 'EN RECHERCHE'
      case 'RETROUVÉ': return 'RETROUVÉ'
      case 'CLÔTURÉ': return 'CLÔTURÉ'
      default: return statut
    }
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <PackageSearch className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Liste des Objets Perdus</h1>
            <p className="text-slate-600 text-sm">
              {commissariat ? (
                `${formatCommissariatName(commissariat.nom)} • ${commissariat.code || ''}`
              ) : (
                <span className="text-slate-400">Chargement du commissariat...</span>
              )}
            </p>
          </div>
        </div>
        <p className="text-slate-600">Gestion des déclarations d'objets perdus</p>
      </div>

      {/* Filtre Global */}
      <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 mb-8">
        <CardBody className="p-4 md:p-6">
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Période d'analyse</h2>
                  <p className="text-gray-600 text-xs md:text-sm hidden sm:block">Sélectionnez la période</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                  <Button 
                  onClick={() => handleFilterChange('jour')}
                  className={`${globalFilter === 'jour' && !isCustomDateRange ? 'bg-orange-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-orange-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                  >
                  Aujourd'hui
                  </Button>
                <Button 
                  onClick={() => handleFilterChange('semaine')}
                  className={`${globalFilter === 'semaine' && !isCustomDateRange ? 'bg-orange-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-orange-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Semaine
                </Button>
                <Button 
                  onClick={() => handleFilterChange('mois')}
                  className={`${globalFilter === 'mois' && !isCustomDateRange ? 'bg-orange-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-orange-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Mois
                </Button>
                <Button 
                  onClick={() => handleFilterChange('annee')}
                  className={`${globalFilter === 'annee' && !isCustomDateRange ? 'bg-orange-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-orange-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Année
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-4 border-t border-orange-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-[200px]">
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">Rechercher:</label>
                <div className="flex items-center gap-2 w-full">
                  <input 
                    type="text"
                    placeholder="Rechercher par numéro, description, lieu, déclarant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 flex-1"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 text-sm bg-white"
              >
                <option>Tous les statuts</option>
                <option>EN RECHERCHE</option>
                <option>RETROUVÉ</option>
                <option>CLÔTURÉ</option>
              </select>

              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 text-sm bg-white"
              >
                <option>Tous les types</option>
                {uniqueTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-4 border-t border-orange-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">Date début:</label>
                <input 
                  type="date" 
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">Date fin:</label>
                <input 
                  type="date" 
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto"
                />
              </div>
              
              <Button 
                onClick={handleSearch}
                disabled={loading}
                className={`${loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 text-white'} flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                Rechercher
                  </>
                )}
              </Button>

              <div className="hidden sm:block w-px h-8 bg-orange-300"></div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm px-4 py-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
                
                <Button 
                  onClick={handlePrint}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs md:text-sm px-4 py-2"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimer
                </Button>
                
                <Button 
                  onClick={handleExport}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs md:text-sm px-4 py-2"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border border-gray-200 border-t-4 border-t-orange-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Total</h3>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <PackageSearch className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">{formatNumber(currentData.stats.totalObjets)}</div>
            <div className={`flex items-center gap-2 text-sm font-medium ${
              currentData.stats.evolutionTotal 
                ? (currentData.stats.evolutionTotal.startsWith('-') 
                    ? 'text-red-600' 
                    : currentData.stats.evolutionTotal.startsWith('+') && currentData.stats.evolutionTotal !== '+0'
                      ? 'text-green-600'
                      : 'text-gray-600')
                : 'text-gray-600'
            }`}>
              {currentData.stats.evolutionTotal && currentData.stats.evolutionTotal !== '+0' && currentData.stats.evolutionTotal !== '0' ? (
                currentData.stats.evolutionTotal.startsWith('-') 
                  ? <TrendingDown className="w-4 h-4" />
                  : <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4 opacity-50" />
              )}
              {currentData.stats.evolutionTotal || '0'} {getPeriodeLabel()}
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">En Recherche</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">{formatNumber(currentData.stats.enRecherche)}</div>
            <div className={`flex items-center gap-2 text-sm font-medium ${
              currentData.stats.evolutionEnRecherche 
                ? (currentData.stats.evolutionEnRecherche.startsWith('-') 
                    ? 'text-red-600' 
                    : currentData.stats.evolutionEnRecherche.startsWith('+') && currentData.stats.evolutionEnRecherche !== '+0'
                      ? 'text-green-600'
                      : 'text-gray-600')
                : 'text-gray-600'
            }`}>
              {currentData.stats.evolutionEnRecherche && currentData.stats.evolutionEnRecherche !== '+0' && currentData.stats.evolutionEnRecherche !== '0' ? (
                currentData.stats.evolutionEnRecherche.startsWith('-') 
                  ? <TrendingDown className="w-4 h-4" />
                  : <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4 opacity-50" />
              )}
              {currentData.stats.evolutionEnRecherche || '0'} {getPeriodeLabel()}
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Retrouvés</h3>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">{formatNumber(currentData.stats.retrouves)}</div>
            <div className={`flex items-center gap-2 text-sm font-medium ${
              currentData.stats.evolutionRetrouves 
                ? (currentData.stats.evolutionRetrouves.startsWith('-') 
                    ? 'text-red-600' 
                    : currentData.stats.evolutionRetrouves.startsWith('+') && currentData.stats.evolutionRetrouves !== '+0'
                      ? 'text-green-600'
                      : 'text-gray-600')
                : 'text-gray-600'
            }`}>
              {currentData.stats.evolutionRetrouves && currentData.stats.evolutionRetrouves !== '+0' && currentData.stats.evolutionRetrouves !== '0' ? (
                currentData.stats.evolutionRetrouves.startsWith('-') 
                  ? <TrendingDown className="w-4 h-4" />
                  : <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4 opacity-50" />
              )}
              {currentData.stats.evolutionRetrouves || '0'} {getPeriodeLabel()}
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-gray-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Clôturés</h3>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Archive className="w-6 h-6 text-gray-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">{formatNumber(currentData.stats.clotures)}</div>
            <div className={`flex items-center gap-2 text-sm font-medium ${
              currentData.stats.evolutionClotures 
                ? (currentData.stats.evolutionClotures.startsWith('-') 
                    ? 'text-red-600' 
                    : currentData.stats.evolutionClotures.startsWith('+') && currentData.stats.evolutionClotures !== '+0'
                      ? 'text-green-600'
                      : 'text-gray-600')
                : 'text-gray-600'
            }`}>
              {currentData.stats.evolutionClotures && currentData.stats.evolutionClotures !== '+0' && currentData.stats.evolutionClotures !== '0' ? (
                currentData.stats.evolutionClotures.startsWith('-') 
                  ? <TrendingDown className="w-4 h-4" />
                  : <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4 opacity-50" />
              )}
              {currentData.stats.evolutionClotures || '0'} {getPeriodeLabel()}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Onglets d'affichage */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setActiveTab('cartes')}
          className={`px-6 py-3 font-semibold text-sm transition-all rounded-lg ${
            activeTab === 'cartes'
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-300 hover:border-orange-400'
          }`}
        >
          Affichage Cartes
        </button>
        <button
          onClick={() => setActiveTab('tableau')}
          className={`px-6 py-3 font-semibold text-sm transition-all rounded-lg ${
            activeTab === 'tableau'
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-300 hover:border-orange-400'
          }`}
        >
          Affichage Tableau
        </button>
      </div>

      {/* Message d'erreur */}
      {error && (
        <Card className="mb-8 border-red-300 bg-red-50">
          <CardBody className="p-4">
            <div className="flex items-center gap-3 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm font-medium">{error}</span>
              <Button 
                onClick={() => refetch()}
                className="ml-auto bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1"
              >
                Réessayer
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Liste des objets - Affichage selon l'onglet */}
      {activeTab === 'cartes' ? (
        <div className="space-y-4 mb-8">
        {loading && currentData.objets.length === 0 ? (
          <Card>
            <CardBody className="p-6">
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto" />
                <p className="mt-4 text-slate-600">Chargement des objets perdus...</p>
              </div>
            </CardBody>
          </Card>
        ) : currentData.objets.length === 0 ? (
          <Card>
            <CardBody className="p-6">
              <div className="text-center py-8">
                <PackageSearch className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">Aucun objet perdu trouvé</p>
                <p className="text-slate-500 text-sm mt-2">Essayez de modifier vos filtres de recherche</p>
              </div>
            </CardBody>
          </Card>
        ) : (
          currentData.objets.map((objet) => (
            <Card key={objet.id} className="bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/gestion/objets-perdus/${objet.id}`)}>
              <CardBody className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{objet.numero}</h3>
                    <p className="text-slate-600 mb-3">{objet.typeObjet} - {objet.description}</p>
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${getStatutColor(objet.statut)}`}>
                      {getStatutLabel(objet.statut)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-500 mb-1">Déclaré le</div>
                    <div className="text-lg font-bold text-orange-600">{objet.dateDeclaration}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Déclarant</p>
                    <p className="font-bold text-slate-900">{objet.declarant.prenom} {objet.declarant.nom}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Téléphone</p>
                    <p className="font-bold text-slate-900">{objet.declarant.telephone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Lieu de perte</p>
                    <p className="font-bold text-slate-900">{objet.lieuPerte}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Agent</p>
                    <p className="font-bold text-slate-900">
                      {objet.agent ? `${objet.agent.prenom} ${objet.agent.nom}` : 'N/A'}
                    </p>
                  </div>
                  {objet.commissariat && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Commissariat</p>
                      <p className="font-bold text-slate-900">{objet.commissariat}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 flex-wrap">
                  <Button 
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/gestion/objets-perdus/${objet.id}`)
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Voir détails
                  </Button>
                  <Button 
                    className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePrint()
                    }}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimer
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))
        )}
        </div>
      ) : (
        /* Affichage en tableau */
        <Card className="bg-white border border-gray-200 mb-8">
          <CardBody className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-bold text-gray-700 uppercase text-sm">Numéro</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700 uppercase text-sm">Type</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700 uppercase text-sm">Déclarant</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700 uppercase text-sm">Lieu</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700 uppercase text-sm">Date</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700 uppercase text-sm">Statut</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700 uppercase text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && currentData.objets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto" />
                        <p className="mt-4 text-slate-600">Chargement des objets perdus...</p>
                      </td>
                    </tr>
                  ) : currentData.objets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-600">
                        <PackageSearch className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="font-medium">Aucun objet perdu trouvé</p>
                        <p className="text-sm text-slate-500 mt-2">Essayez de modifier vos filtres de recherche</p>
                      </td>
                    </tr>
                  ) : (
                    currentData.objets.map((objet) => (
                      <tr 
                        key={objet.id} 
                        className="border-b hover:bg-orange-50 cursor-pointer transition-colors"
                        onClick={() => router.push(`/gestion/objets-perdus/${objet.id}`)}
                      >
                        <td className="py-4 px-4 font-semibold text-orange-600">{objet.numero}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <PackageSearch className="w-4 h-4 text-orange-600" />
                            <span className="font-medium">{objet.typeObjet}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{objet.declarant.prenom} {objet.declarant.nom}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm max-w-[200px] truncate">{objet.lieuPerte}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{formatDateOnly(objet.datePerte)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatutColor(objet.statut)}`}>
                            {getStatutLabel(objet.statut)}
                          </span>
                        </td>
                        <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2">
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => router.push(`/gestion/objets-perdus/${objet.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={handlePrint}
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.total > 0 && (() => {
        const total = Number(pagination.total) || 0;
        const limit = Number(pagination.limit) || 20;
        let totalPages = Number(pagination.totalPages);
        
        if (!totalPages || isNaN(totalPages) || totalPages < 1) {
          totalPages = Math.ceil(total / limit);
        }
        
        totalPages = Math.max(1, Math.floor(totalPages));
        const activePage = Number(currentPage) || Number(pagination.page) || 1;
        
        return (
        <Card className="mb-8">
          <CardBody className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-600">
                  Affichage de <span className="font-medium">
                    {total > 0 ? ((activePage - 1) * limit) + 1 : 0}
                  </span> à{' '}
                  <span className="font-medium">
                    {Math.min(activePage * limit, total)}
                  </span>{' '}
                  sur <span className="font-medium">{formatNumber(total)}</span> objets perdus
              </p>
              
              <div className="flex items-center gap-2">
                <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePageChange(activePage - 1);
                    }}
                    disabled={activePage === 1 || loading}
                    className={`px-3 py-2 border rounded-lg transition-colors ${
                      activePage === 1 
                        ? 'border-slate-200 text-slate-400 cursor-not-allowed' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <span className="text-sm">←</span>
                </button>
                
                  {totalPages <= 5 && totalPages > 0 ? (
                    Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={`page-${pageNum}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handlePageChange(pageNum);
                        }}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          activePage === pageNum 
                            ? 'bg-orange-600 text-white hover:bg-orange-700' 
                            : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))
                  ) : (
                    <>
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium">
                        {activePage}
                </button>
                    </>
                  )}
                
                <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePageChange(activePage + 1);
                    }}
                    disabled={activePage === totalPages || loading}
                    className={`px-3 py-2 border rounded-lg transition-colors ${
                      activePage === totalPages 
                        ? 'border-slate-200 text-slate-400 cursor-not-allowed' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <span className="text-sm">→</span>
                </button>
              </div>
            </div>
          </CardBody>
        </Card>
        );
      })()}

      {/* Modal Formulaire */}
      <ObjetPerduFormPage 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleObjetPerduSubmit}
      />
      
      {/* Badge de confirmation pour période personnalisée */}
      {isCustomDateRange && (
        <Card className="mb-8 bg-green-50 border-green-200">
          <CardBody className="p-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">
                Période personnalisée active: {dateDebut} au {dateFin}
              </span>
            </div>
          </CardBody>
        </Card>
      )}

    </div>
  )
}
