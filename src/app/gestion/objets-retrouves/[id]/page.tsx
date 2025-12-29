'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter, usePathname } from 'next/navigation'
import {
  PackageCheck, ArrowLeft, Calendar, MapPin, User, Phone, Mail,
  Clock, CheckCircle, AlertTriangle, Printer, Edit, FileText, Archive,
  Loader2, Bell, PackageSearch, Eye, Layers, Box, ShoppingBag, Briefcase,
  Wallet, Backpack, Smartphone, CreditCard, Key, ScrollText, IdCard,
  DollarSign, Watch, Glasses, Laptop, Shirt
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useGestionLayout } from '@/contexts/GestionLayoutContext'
import { useAuth } from '@/hooks/useAuth'
import { useObjetRetrouveDetail } from '@/hooks/useObjetRetrouveDetail'
import api from '@/lib/axios'

// Fonctions de formatage de dates cohérentes pour éviter les problèmes d'hydratation
const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return 'N/A'
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    if (isNaN(date.getTime())) return 'N/A'
    
    // Formatage déterministe : DD/MM/YYYY
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return 'N/A'
  }
}

const formatDateTime = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return 'N/A'
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    if (isNaN(date.getTime())) return 'N/A'
    
    // Formatage déterministe : DD/MM/YYYY HH:MM:SS
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  } catch {
    return 'N/A'
  }
}

// Mapping des icônes pour les catégories d'objets dans l'inventaire
const categoryIcons: { [key: string]: any } = {
  telephone: Smartphone,
  portefeuille: Wallet,
  papiers: ScrollText,
  identite: IdCard,
  carte: CreditCard,
  cles: Key,
  argent: DollarSign,
  bijoux: Watch,
  lunettes: Glasses,
  ordinateur: Laptop,
  montre: Watch,
  vetements: Shirt,
  autre: Box
}

// Mapping des icônes pour les types de contenants
const containerTypeIcons: { [key: string]: any } = {
  sac: ShoppingBag,
  valise: Briefcase,
  portefeuille: Wallet,
  mallette: Briefcase,
  sac_dos: Backpack
}

// Labels pour les types de contenants
const containerTypeLabels: { [key: string]: string } = {
  sac: 'Sac / Sacoche',
  valise: 'Valise / Bagage',
  portefeuille: 'Portefeuille',
  mallette: 'Mallette professionnelle',
  sac_dos: 'Sac à dos'
}

// Labels pour les catégories d'objets
const categoryLabels: { [key: string]: string } = {
  telephone: 'Téléphone',
  portefeuille: 'Portefeuille',
  papiers: 'Papiers',
  identite: 'Identité',
  carte: 'Carte',
  cles: 'Clés',
  argent: 'Argent',
  bijoux: 'Bijoux',
  lunettes: 'Lunettes',
  ordinateur: 'Ordinateur',
  montre: 'Montre',
  vetements: 'Vêtements',
  autre: 'Autre'
}

export default function ObjetRetouveDetailPage() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const { setTitle, setSubtitle } = useGestionLayout()
  const { user } = useAuth()
  const objetId = params.id as string

  const { objet, loading, error, refetch } = useObjetRetrouveDetail(objetId)
  
  // Calculer la date max uniquement côté client pour éviter les problèmes d'hydratation
  const [maxDate, setMaxDate] = useState<string>('')
  
  useEffect(() => {
    // Calculer la date max uniquement côté client
    setMaxDate(new Date().toISOString().split('T')[0])
  }, [])
  
  // États pour les modals et actions
  const [isUpdateStatutModalOpen, setIsUpdateStatutModalOpen] = useState(false)
  const [actionType, setActionType] = useState<'restitue' | 'nonReclame' | null>(null)
  const [dateRestitution, setDateRestitution] = useState('')
  const [proprietaireNom, setProprietaireNom] = useState('')
  const [proprietairePrenom, setProprietairePrenom] = useState('')
  const [proprietaireTelephone, setProprietaireTelephone] = useState('')
  const [proprietaireEmail, setProprietaireEmail] = useState('')
  const [proprietaireAdresse, setProprietaireAdresse] = useState('')
  const [proprietaireCni, setProprietaireCni] = useState('')
  const [updateError, setUpdateError] = useState<string | null>(null)

  // État pour le modal de détail d'un objet de l'inventaire
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<any>(null)
  const [isInventoryItemModalOpen, setIsInventoryItemModalOpen] = useState(false)

  // Gestion du layout (titre et sous-titre)
  useEffect(() => {
    const commissariatName = user?.commissariat?.nom || ''
    
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
    
    const formattedCommissariat = commissariatName ? formatCommissariatName(commissariatName) : ''
    
    if (objet) {
      setTitle(`Objet Retrouvé - ${objet.numero}`)
      if (formattedCommissariat) {
        setSubtitle(`${formattedCommissariat} - ${objet.typeObjet}`)
      } else {
        setSubtitle(objet.typeObjet)
      }
    } else {
      setTitle(`Objet Retrouvé - ${objetId}`)
      if (formattedCommissariat) {
        setSubtitle(`${formattedCommissariat} - Détails du dépôt`)
      } else {
        setSubtitle("Détails du dépôt")
      }
    }
    
    // Cleanup: ne pas réinitialiser ici car la nouvelle page va définir ses propres valeurs
  }, [setTitle, setSubtitle, objetId, objet, user?.commissariat?.nom, pathname])

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'DISPONIBLE':
      case 'EN ATTENTE':
      case 'EN_ATTENTE':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'RESTITUÉ':
      case 'RESTITUE':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'NON RÉCLAMÉ':
      case 'NON_RECLAME':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'DISPONIBLE':
        return 'DISPONIBLE'
      case 'EN ATTENTE':
      case 'EN_ATTENTE':
        return 'EN ATTENTE'
      case 'RESTITUÉ':
      case 'RESTITUE':
        return 'RESTITUÉ'
      case 'NON RÉCLAMÉ':
      case 'NON_RECLAME':
        return 'NON RÉCLAMÉ'
      default:
        return statut
    }
  }

  // Normaliser le statut pour les comparaisons
  const normalizedStatut = useMemo(() => {
    if (!objet) return null
    const statut = objet.statut?.toUpperCase() || ''
    // DISPONIBLE = objet disponible au commissariat
    if (statut.includes('DISPONIBLE')) return 'DISPONIBLE'
    if (statut.includes('ATTENTE')) return 'EN_ATTENTE'
    if (statut.includes('RESTITU')) return 'RESTITUE'
    if (statut.includes('NON') && statut.includes('RÉCLAM') || statut.includes('NON') && statut.includes('RECLAM')) return 'NON_RECLAME'
    return statut
  }, [objet?.statut])

  // Fonction pour ouvrir le modal de mise à jour de statut
  const handleOpenUpdateModal = (type: 'restitue' | 'nonReclame') => {
    setActionType(type)
    if (type === 'restitue') {
      // Utiliser maxDate si disponible, sinon calculer côté client uniquement
      const today = typeof window !== 'undefined' ? new Date().toISOString().split('T')[0] : maxDate || ''
      setDateRestitution(today)
      // Pré-remplir avec les informations du propriétaire si déjà renseignées
      if (objet?.proprietaire) {
        setProprietaireNom(objet.proprietaire.nom || '')
        setProprietairePrenom(objet.proprietaire.prenom || '')
        setProprietaireTelephone(objet.proprietaire.telephone || '')
        setProprietaireEmail(objet.proprietaire.email || '')
        setProprietaireAdresse(objet.proprietaire.adresse || '')
        setProprietaireCni(objet.proprietaire.cni || '')
      }
    }
    setUpdateError(null)
    setIsUpdateStatutModalOpen(true)
  }

  // Fonction pour mettre à jour le statut
  const handleUpdateStatut = async () => {
    if (!objet || !actionType) return

    setUpdateError(null)

    try {
      let statutValue: string
      let dateRestitutionParam: string | undefined
      let proprietaireData: any = undefined

      if (actionType === 'restitue') {
        statutValue = 'RESTITUÉ'
        // Utiliser maxDate si disponible, sinon calculer côté client uniquement
        const today = typeof window !== 'undefined' ? new Date().toISOString().split('T')[0] : maxDate || ''
        dateRestitutionParam = dateRestitution || today
        
        // Préparer les informations du propriétaire si fournies
        if (proprietaireNom && proprietairePrenom && proprietaireTelephone) {
          proprietaireData = {
            nom: proprietaireNom,
            prenom: proprietairePrenom,
            telephone: proprietaireTelephone,
            email: proprietaireEmail || undefined,
            adresse: proprietaireAdresse || undefined,
            cni: proprietaireCni || undefined,
          }
        }
      } else {
        statutValue = 'NON RÉCLAMÉ'
      }

      // Appeler l'API pour mettre à jour le statut
      const queryParams = new URLSearchParams()
      queryParams.append('statut', statutValue)
      if (dateRestitutionParam) {
        queryParams.append('dateRestitution', dateRestitutionParam)
      }

      await api.patch(
        `/objets-retrouves/${objet.id}/statut?${queryParams.toString()}`,
        proprietaireData ? { proprietaire: proprietaireData } : {}
      )

      await refetch()
      
      // Afficher un message de succès
      alert(actionType === 'restitue' 
        ? 'Objet marqué comme restitué avec succès' 
        : 'Objet marqué comme non réclamé avec succès')
      
      setIsUpdateStatutModalOpen(false)
      setActionType(null)
      setDateRestitution('')
      setProprietaireNom('')
      setProprietairePrenom('')
      setProprietaireTelephone('')
      setProprietaireEmail('')
      setProprietaireAdresse('')
      setProprietaireCni('')
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du statut:', err)
      setUpdateError(
        err.response?.data?.message ||
        err.message ||
        'Erreur lors de la mise à jour du statut'
      )
    }
  }

  // Vérifier si des actions sont disponibles
  const canUpdateStatut = useMemo(() => {
    return normalizedStatut === 'EN_ATTENTE' || normalizedStatut === 'DISPONIBLE'
  }, [normalizedStatut])

  // Fonction pour ouvrir le modal de détail d'un objet de l'inventaire
  const handleViewInventoryItem = (item: any) => {
    setSelectedInventoryItem(item)
    setIsInventoryItemModalOpen(true)
  }

  // Fonction pour fermer le modal de détail d'un objet de l'inventaire
  const handleCloseInventoryItemModal = () => {
    setIsInventoryItemModalOpen(false)
    setSelectedInventoryItem(null)
  }

  // Fonction pour afficher les détails spécifiques selon le type d'objet
  const renderDetailsSpecifiques = useMemo(() => {
    if (!objet?.detailsSpecifiques || Object.keys(objet.detailsSpecifiques).length === 0) {
      return null
    }

    const details = objet.detailsSpecifiques
    const fields: React.ReactElement[] = []

    // Documents d'identité
    if (details.typeDocument || details.numeroDocument) {
      if (details.typeDocument) {
        fields.push(
          <div key="typeDocument">
            <p className="text-sm text-slate-500">Type de document</p>
            <p className="font-semibold text-slate-900">{details.typeDocument}</p>
          </div>
        )
      }
      if (details.numeroDocument) {
        fields.push(
          <div key="numeroDocument">
            <p className="text-sm text-slate-500">Numéro du document</p>
            <p className="font-semibold text-slate-900">{details.numeroDocument}</p>
          </div>
        )
      }
    }

    // Téléphone portable, Tablette, etc.
    if (details.marque || details.modele || details.imei || details.numeroSerie || details.capaciteStockage || details.numeroTelephone) {
      if (details.marque) {
        fields.push(
          <div key="marque">
            <p className="text-sm text-slate-500">Marque</p>
            <p className="font-semibold text-slate-900">{details.marque}</p>
          </div>
        )
      }
      if (details.modele) {
        fields.push(
          <div key="modele">
            <p className="text-sm text-slate-500">Modèle</p>
            <p className="font-semibold text-slate-900">{details.modele}</p>
          </div>
        )
      }
      if (details.imei) {
        fields.push(
          <div key="imei">
            <p className="text-sm text-slate-500">IMEI</p>
            <p className="font-semibold text-slate-900">{details.imei}</p>
          </div>
        )
      }
      if (details.numeroSerie) {
        fields.push(
          <div key="numeroSerie">
            <p className="text-sm text-slate-500">Numéro de série</p>
            <p className="font-semibold text-slate-900">{details.numeroSerie}</p>
          </div>
        )
      }
      if (details.capaciteStockage) {
        fields.push(
          <div key="capaciteStockage">
            <p className="text-sm text-slate-500">Capacité de stockage</p>
            <p className="font-semibold text-slate-900">{details.capaciteStockage}</p>
          </div>
        )
      }
      if (details.numeroTelephone) {
        fields.push(
          <div key="numeroTelephone">
            <p className="text-sm text-slate-500">Numéro de téléphone</p>
            <p className="font-semibold text-slate-900">{details.numeroTelephone}</p>
          </div>
        )
      }
    }

    // Portefeuille
    if (details.contenuPortefeuille || details.nombreCartes || details.montantArgent || details.materiau) {
      if (details.contenuPortefeuille) {
        fields.push(
          <div key="contenuPortefeuille">
            <p className="text-sm text-slate-500">Contenu</p>
            <p className="font-semibold text-slate-900">{details.contenuPortefeuille}</p>
          </div>
        )
      }
      if (details.nombreCartes) {
        fields.push(
          <div key="nombreCartes">
            <p className="text-sm text-slate-500">Nombre de cartes</p>
            <p className="font-semibold text-slate-900">{details.nombreCartes}</p>
          </div>
        )
      }
      if (details.montantArgent) {
        fields.push(
          <div key="montantArgent">
            <p className="text-sm text-slate-500">Montant d'argent</p>
            <p className="font-semibold text-slate-900">{details.montantArgent}</p>
          </div>
        )
      }
      if (details.materiau) {
        fields.push(
          <div key="materiau">
            <p className="text-sm text-slate-500">Matériau</p>
            <p className="font-semibold text-slate-900">{details.materiau}</p>
          </div>
        )
      }
    }

    // Clés
    if (details.nombreCles || details.typeCles || details.descriptionPorteCles) {
      if (details.nombreCles) {
        fields.push(
          <div key="nombreCles">
            <p className="text-sm text-slate-500">Nombre de clés</p>
            <p className="font-semibold text-slate-900">{details.nombreCles}</p>
          </div>
        )
      }
      if (details.typeCles) {
        fields.push(
          <div key="typeCles">
            <p className="text-sm text-slate-500">Type de clés</p>
            <p className="font-semibold text-slate-900">{details.typeCles}</p>
          </div>
        )
      }
      if (details.descriptionPorteCles) {
        fields.push(
          <div key="descriptionPorteCles">
            <p className="text-sm text-slate-500">Description porte-clés</p>
            <p className="font-semibold text-slate-900">{details.descriptionPorteCles}</p>
          </div>
        )
      }
    }

    // Bijoux
    if (details.typeBijou || details.materiauBijou || details.pierresPrecieuses || details.poids) {
      if (details.typeBijou) {
        fields.push(
          <div key="typeBijou">
            <p className="text-sm text-slate-500">Type de bijou</p>
            <p className="font-semibold text-slate-900">{details.typeBijou}</p>
          </div>
        )
      }
      if (details.materiauBijou) {
        fields.push(
          <div key="materiauBijou">
            <p className="text-sm text-slate-500">Matériau</p>
            <p className="font-semibold text-slate-900">{details.materiauBijou}</p>
          </div>
        )
      }
      if (details.pierresPrecieuses) {
        fields.push(
          <div key="pierresPrecieuses">
            <p className="text-sm text-slate-500">Pierres précieuses</p>
            <p className="font-semibold text-slate-900">{details.pierresPrecieuses}</p>
          </div>
        )
      }
      if (details.poids) {
        fields.push(
          <div key="poids">
            <p className="text-sm text-slate-500">Poids</p>
            <p className="font-semibold text-slate-900">{details.poids}</p>
          </div>
        )
      }
    }

    // Sac
    if (details.typeSac || details.contenuSac) {
      if (details.typeSac) {
        fields.push(
          <div key="typeSac">
            <p className="text-sm text-slate-500">Type de sac</p>
            <p className="font-semibold text-slate-900">{details.typeSac}</p>
          </div>
        )
      }
      if (details.contenuSac) {
        fields.push(
          <div key="contenuSac">
            <p className="text-sm text-slate-500">Contenu</p>
            <p className="font-semibold text-slate-900">{details.contenuSac}</p>
          </div>
        )
      }
    }

    // Ordinateur
    if (details.typeOrdinateur || details.numeroSerieOrdinateur || details.configuration) {
      if (details.typeOrdinateur) {
        fields.push(
          <div key="typeOrdinateur">
            <p className="text-sm text-slate-500">Type d'ordinateur</p>
            <p className="font-semibold text-slate-900">{details.typeOrdinateur}</p>
          </div>
        )
      }
      if (details.numeroSerieOrdinateur) {
        fields.push(
          <div key="numeroSerieOrdinateur">
            <p className="text-sm text-slate-500">Numéro de série</p>
            <p className="font-semibold text-slate-900">{details.numeroSerieOrdinateur}</p>
          </div>
        )
      }
      if (details.configuration) {
        fields.push(
          <div key="configuration">
            <p className="text-sm text-slate-500">Configuration</p>
            <p className="font-semibold text-slate-900">{details.configuration}</p>
          </div>
        )
      }
    }

    // Tablette
    if (details.capaciteTablette) {
      fields.push(
        <div key="capaciteTablette">
          <p className="text-sm text-slate-500">Capacité</p>
          <p className="font-semibold text-slate-900">{details.capaciteTablette}</p>
        </div>
      )
    }

    // Montre
    if (details.typeMontre || details.referenceMontre) {
      if (details.typeMontre) {
        fields.push(
          <div key="typeMontre">
            <p className="text-sm text-slate-500">Type de montre</p>
            <p className="font-semibold text-slate-900">{details.typeMontre}</p>
          </div>
        )
      }
      if (details.referenceMontre) {
        fields.push(
          <div key="referenceMontre">
            <p className="text-sm text-slate-500">Référence</p>
            <p className="font-semibold text-slate-900">{details.referenceMontre}</p>
          </div>
        )
      }
    }

    // Lunettes
    if (details.typeLunettes || details.correctionLunettes) {
      if (details.typeLunettes) {
        fields.push(
          <div key="typeLunettes">
            <p className="text-sm text-slate-500">Type de lunettes</p>
            <p className="font-semibold text-slate-900">{details.typeLunettes}</p>
          </div>
        )
      }
      if (details.correctionLunettes) {
        fields.push(
          <div key="correctionLunettes">
            <p className="text-sm text-slate-500">Correction</p>
            <p className="font-semibold text-slate-900">{details.correctionLunettes}</p>
          </div>
        )
      }
    }

    // Vêtements
    if (details.tailleVetement || details.typeVetement) {
      if (details.tailleVetement) {
        fields.push(
          <div key="tailleVetement">
            <p className="text-sm text-slate-500">Taille</p>
            <p className="font-semibold text-slate-900">{details.tailleVetement}</p>
          </div>
        )
      }
      if (details.typeVetement) {
        fields.push(
          <div key="typeVetement">
            <p className="text-sm text-slate-500">Type de vêtement</p>
            <p className="font-semibold text-slate-900">{details.typeVetement}</p>
          </div>
        )
      }
    }

    // Chaussures
    if (details.pointure || details.typeChaussures) {
      if (details.pointure) {
        fields.push(
          <div key="pointure">
            <p className="text-sm text-slate-500">Pointure</p>
            <p className="font-semibold text-slate-900">{details.pointure}</p>
          </div>
        )
      }
      if (details.typeChaussures) {
        fields.push(
          <div key="typeChaussures">
            <p className="text-sm text-slate-500">Type de chaussures</p>
            <p className="font-semibold text-slate-900">{details.typeChaussures}</p>
          </div>
        )
      }
    }

    // Vélo
    if (details.typeVelo || details.couleurVelo || details.marqueVelo || details.numeroCadre) {
      if (details.typeVelo) {
        fields.push(
          <div key="typeVelo">
            <p className="text-sm text-slate-500">Type de vélo</p>
            <p className="font-semibold text-slate-900">{details.typeVelo}</p>
          </div>
        )
      }
      if (details.couleurVelo) {
        fields.push(
          <div key="couleurVelo">
            <p className="text-sm text-slate-500">Couleur</p>
            <p className="font-semibold text-slate-900">{details.couleurVelo}</p>
          </div>
        )
      }
      if (details.marqueVelo) {
        fields.push(
          <div key="marqueVelo">
            <p className="text-sm text-slate-500">Marque</p>
            <p className="font-semibold text-slate-900">{details.marqueVelo}</p>
          </div>
        )
      }
      if (details.numeroCadre) {
        fields.push(
          <div key="numeroCadre">
            <p className="text-sm text-slate-500">Numéro de cadre</p>
            <p className="font-semibold text-slate-900">{details.numeroCadre}</p>
          </div>
        )
      }
    }

    // Scooter / Trottinette
    if (details.typeScooter) {
      fields.push(
        <div key="typeScooter">
          <p className="text-sm text-slate-500">Type</p>
          <p className="font-semibold text-slate-900">{details.typeScooter}</p>
        </div>
      )
    }

    // Animal
    if (details.typeAnimal || details.raceAnimal || details.nomAnimal || details.descriptionAnimal) {
      if (details.typeAnimal) {
        fields.push(
          <div key="typeAnimal">
            <p className="text-sm text-slate-500">Type d'animal</p>
            <p className="font-semibold text-slate-900">{details.typeAnimal}</p>
          </div>
        )
      }
      if (details.raceAnimal) {
        fields.push(
          <div key="raceAnimal">
            <p className="text-sm text-slate-500">Race</p>
            <p className="font-semibold text-slate-900">{details.raceAnimal}</p>
          </div>
        )
      }
      if (details.nomAnimal) {
        fields.push(
          <div key="nomAnimal">
            <p className="text-sm text-slate-500">Nom</p>
            <p className="font-semibold text-slate-900">{details.nomAnimal}</p>
          </div>
        )
      }
      if (details.descriptionAnimal) {
        fields.push(
          <div key="descriptionAnimal">
            <p className="text-sm text-slate-500">Description</p>
            <p className="font-semibold text-slate-900">{details.descriptionAnimal}</p>
          </div>
        )
      }
    }

    // Autres champs génériques
    if (details.tailleAutre) {
      fields.push(
        <div key="tailleAutre">
          <p className="text-sm text-slate-500">Taille</p>
          <p className="font-semibold text-slate-900">{details.tailleAutre}</p>
        </div>
      )
    }
    if (details.dimensions) {
      fields.push(
        <div key="dimensions">
          <p className="text-sm text-slate-500">Dimensions</p>
          <p className="font-semibold text-slate-900">{details.dimensions}</p>
        </div>
      )
    }

    // Ajouter d'autres champs numéro de série pour d'autres types d'objets électroniques
    if (details.numeroSerie && !details.imei) {
      fields.push(
        <div key="numeroSerie-generic">
          <p className="text-sm text-slate-500">Numéro de série</p>
          <p className="font-semibold text-slate-900">{details.numeroSerie}</p>
        </div>
      )
    }

    return fields.length > 0 ? fields : null
  }, [objet?.detailsSpecifiques])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-slate-600">Chargement des détails...</p>
        </div>
      </div>
    )
  }

  if (error || !objet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardBody className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Erreur</h2>
            <p className="text-slate-600 mb-4">{error || 'Objet retrouvé non trouvé'}</p>
            <Button onClick={() => router.back()} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  const dateDepotFormatee = objet.dateDepotFormatee || formatDateTime(objet.dateDepot)
  const dateTrouvailleFormatee = objet.dateTrouvailleFormatee || formatDate(objet.dateTrouvaille)
  const dateRestitutionFormatee = objet.dateRestitutionFormatee || formatDate(objet.dateRestitution)

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => router.back()}
            className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              {(objet as any).isContainer ? (
                <Layers className="w-6 h-6 text-emerald-600" />
              ) : (
                <PackageCheck className="w-6 h-6 text-emerald-600" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{objet.numero}</h1>
              <p className="text-slate-600">
                {(objet as any).isContainer && (objet as any).containerDetails 
                  ? `${containerTypeLabels[(objet as any).containerDetails.type] || (objet as any).containerDetails.type} - ${objet.typeObjet}`
                  : objet.typeObjet
                }
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300">
            <Printer className="w-4 h-4 mr-2" />
            Imprimer
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        </div>
      </div>

      {/* Statut et Badge Contenant */}
      <div className="flex items-center gap-3">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${getStatutColor(objet.statut)}`}>
          {normalizedStatut === 'EN_ATTENTE' && <Clock className="w-4 h-4" />}
          {normalizedStatut === 'DISPONIBLE' && <Clock className="w-4 h-4" />}
          {normalizedStatut === 'RESTITUE' && <CheckCircle className="w-4 h-4" />}
          {normalizedStatut === 'NON_RECLAME' && <AlertTriangle className="w-4 h-4" />}
          {getStatutLabel(objet.statut)}
        </div>
        
        {(objet as any).isContainer && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-purple-100 text-purple-700 border border-purple-200">
            <Layers className="w-4 h-4" />
            Contenant avec inventaire
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description de l'objet / contenant */}
          {(objet as any).isContainer && (objet as any).containerDetails ? (
            <>
              {/* Description du contenant */}
              <Card className="bg-white border border-gray-200">
                <CardBody className="p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    {React.createElement(containerTypeIcons[(objet as any).containerDetails.type] || ShoppingBag, { 
                      className: "w-5 h-5 text-purple-600" 
                    })}
                    Description du contenant
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-slate-500">Type de contenant</p>
                      <p className="font-semibold text-slate-900">
                        {containerTypeLabels[(objet as any).containerDetails.type] || (objet as any).containerDetails.type}
                      </p>
                    </div>
                    {(objet as any).containerDetails.couleur && (
                      <div>
                        <p className="text-sm text-slate-500">Couleur</p>
                        <p className="font-semibold text-slate-900">{(objet as any).containerDetails.couleur}</p>
                      </div>
                    )}
                    {(objet as any).containerDetails.marque && (
                      <div>
                        <p className="text-sm text-slate-500">Marque</p>
                        <p className="font-semibold text-slate-900">{(objet as any).containerDetails.marque}</p>
                      </div>
                    )}
                    {(objet as any).containerDetails.taille && (
                      <div>
                        <p className="text-sm text-slate-500">Taille</p>
                        <p className="font-semibold text-slate-900">{(objet as any).containerDetails.taille}</p>
                      </div>
                    )}
                    {objet.valeurEstimee && (
                      <div>
                        <p className="text-sm text-slate-500">Valeur estimée</p>
                        <p className="font-semibold text-orange-600">{objet.valeurEstimee}</p>
                      </div>
                    )}
                  </div>

                  {(objet as any).containerDetails.signesDistinctifs && (
                    <div className="mb-4">
                      <p className="text-sm text-slate-500 mb-2">Signes distinctifs</p>
                      <p className="text-slate-700 bg-slate-50 p-4 rounded-lg">
                        {(objet as any).containerDetails.signesDistinctifs}
                      </p>
                    </div>
                  )}

                  {objet.description && (
                    <div>
                      <p className="text-sm text-slate-500 mb-2">Description détaillée</p>
                      <p className="text-slate-700 bg-slate-50 p-4 rounded-lg">{objet.description}</p>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Inventaire du contenant */}
              {(objet as any).containerDetails.inventory && (objet as any).containerDetails.inventory.length > 0 && (
                <Card className="bg-white border border-gray-200">
                  <CardBody className="p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-purple-600" />
                      Inventaire du contenant ({(objet as any).containerDetails.inventory.length} objets)
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(objet as any).containerDetails.inventory.map((item: any, index: number) => {
                        const IconComponent = categoryIcons[item.category] || Box
                        
                        return (
                          <div 
                            key={index}
                            className="p-4 border border-slate-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer"
                            onClick={() => handleViewInventoryItem(item)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <IconComponent className="w-5 h-5 text-purple-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                                  <Eye className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                </div>
                                <p className="text-xs text-slate-500 mb-1">
                                  {categoryLabels[item.category] || item.category}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="inline-block w-4 h-4 rounded-full border-2 border-slate-300" 
                                        style={{ backgroundColor: item.color }}
                                  />
                                  <span className="text-sm text-slate-600">{item.color}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardBody>
                </Card>
              )}
            </>
          ) : (
            /* Description de l'objet simple (non-contenant) */
            <Card className="bg-white border border-gray-200">
              <CardBody className="p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-emerald-600" />
                  Description de l'objet
                </h2>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-slate-500">Type</p>
                    <p className="font-semibold text-slate-900">{objet.typeObjet}</p>
                  </div>
                  {objet.couleur && (
                    <div>
                      <p className="text-sm text-slate-500">Couleur</p>
                      <p className="font-semibold text-slate-900">{objet.couleur}</p>
                    </div>
                  )}
                  {objet.valeurEstimee && (
                    <div>
                      <p className="text-sm text-slate-500">Valeur estimée</p>
                      <p className="font-semibold text-emerald-600">{objet.valeurEstimee}</p>
                    </div>
                  )}
                </div>

                {/* Détails spécifiques selon le type */}
                {renderDetailsSpecifiques && (
                  <div className="grid grid-cols-2 gap-4 mb-4 border-t border-slate-200 pt-4">
                    {renderDetailsSpecifiques}
                  </div>
                )}

                <div>
                  <p className="text-sm text-slate-500 mb-2">Description détaillée</p>
                  <p className="text-slate-700 bg-slate-50 p-4 rounded-lg">{objet.description}</p>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Lieu de trouvaille */}
          <Card className="bg-white border border-gray-200">
            <CardBody className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                Lieu et circonstances de la trouvaille
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-sm text-slate-500">Lieu</p>
                  <p className="font-semibold text-slate-900">{objet.lieuTrouvaille || 'N/A'}</p>
                </div>
                {objet.adresseLieu && (
                  <div className="col-span-2">
                    <p className="text-sm text-slate-500">Adresse</p>
                    <p className="font-semibold text-slate-900">{objet.adresseLieu}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-slate-500">Date de trouvaille</p>
                  <p className="font-semibold text-slate-900">{dateTrouvailleFormatee}</p>
                </div>
                {objet.heureTrouvaille && (
                  <div>
                    <p className="text-sm text-slate-500">Heure approximative</p>
                    <p className="font-semibold text-slate-900">{objet.heureTrouvaille}</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Observations */}
          {objet.observations && (
            <Card className="bg-white border border-gray-200">
              <CardBody className="p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Observations
                </h2>
                <p className="text-slate-700 bg-slate-50 p-4 rounded-lg">{objet.observations}</p>
              </CardBody>
            </Card>
          )}

          {/* Historique */}
          {objet.historique && objet.historique.length > 0 && (
            <Card className="bg-white border border-gray-200">
              <CardBody className="p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Historique des actions
                </h2>
                <div className="space-y-4">
                  {objet.historique.map((item: any, index: number) => (
                    <div key={index} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{item.action}</p>
                        {item.details && (
                          <p className="text-sm text-slate-600 mt-1">{item.details}</p>
                        )}
                        <p className="text-sm text-slate-500 mt-1">{item.date} - {item.agent}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Alertes envoyées */}
          <Card className="bg-white border border-gray-200">
            <CardBody className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-600" />
                Alertes envoyées
              </h2>
              <p className="text-sm text-slate-500 text-center py-4">Aucune alerte envoyée pour cet objet</p>
            </CardBody>
          </Card>

          {/* Objets perdus correspondants */}
          <Card className="bg-white border border-gray-200">
            <CardBody className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <PackageSearch className="w-5 h-5 text-blue-600" />
                Objets perdus correspondants
              </h2>
              <p className="text-sm text-slate-500 text-center py-4">Aucun objet perdu correspondant trouvé</p>
            </CardBody>
          </Card>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Informations déposant */}
          <Card className="bg-white border border-gray-200">
            <CardBody className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Déposant
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-500">Nom complet</p>
                  <p className="font-semibold text-slate-900">
                    {typeof objet.deposant === 'object' 
                      ? `${objet.deposant.prenom || ''} ${objet.deposant.nom || ''}`.trim()
                      : 'N/A'}
                  </p>
                </div>
                {typeof objet.deposant === 'object' && objet.deposant.telephone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <p className="text-slate-700">{objet.deposant.telephone}</p>
                  </div>
                )}
                {typeof objet.deposant === 'object' && objet.deposant.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <p className="text-slate-700">{objet.deposant.email}</p>
                  </div>
                )}
                {typeof objet.deposant === 'object' && objet.deposant.adresse && (
                  <div>
                    <p className="text-sm text-slate-500">Adresse</p>
                    <p className="text-slate-700">{objet.deposant.adresse}</p>
                  </div>
                )}
                {typeof objet.deposant === 'object' && objet.deposant.cni && (
                  <div>
                    <p className="text-sm text-slate-500">N° CNI</p>
                    <p className="text-slate-700">{objet.deposant.cni}</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Agent traitant */}
          {objet.agent && (
            <Card className="bg-white border border-gray-200">
              <CardBody className="p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-green-600" />
                  Agent traitant
                </h2>
                <div className="space-y-2">
                  <p className="font-semibold text-slate-900">
                    {objet.agent.prenom || ''} {objet.agent.nom || ''}
                  </p>
                  <p className="text-sm text-slate-500">{objet.agent.matricule || 'N/A'}</p>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Informations dépôt */}
          <Card className="bg-white border border-gray-200">
            <CardBody className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                Dépôt
              </h2>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-slate-500">Commissariat</p>
                  <p className="font-semibold text-slate-900">
                    {objet.commissariat?.nom || user?.commissariat?.nom || 'Non spécifié'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Date et heure</p>
                  <p className="font-semibold text-slate-900">{dateDepotFormatee}</p>
                </div>
                {dateRestitutionFormatee !== 'N/A' && (
                  <div>
                    <p className="text-sm text-slate-500">Date de restitution</p>
                    <p className="font-semibold text-green-600">{dateRestitutionFormatee}</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Actions */}
          {canUpdateStatut && (
            <Card className="bg-white border border-gray-200">
              <CardBody className="p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Actions
                </h2>
                <div className="space-y-3">
                  {(normalizedStatut === 'EN_ATTENTE' || normalizedStatut === 'DISPONIBLE') && (
                    <>
                      <Button 
                        onClick={() => handleOpenUpdateModal('restitue')}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Marquer comme restitué
                      </Button>
                      <Button 
                        onClick={() => handleOpenUpdateModal('nonReclame')}
                        className="w-full bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 flex items-center justify-center gap-2"
                      >
                        <Archive className="w-4 h-4" />
                        Marquer non réclamé
                      </Button>
                    </>
                  )}
                  {normalizedStatut === 'RESTITUE' && (
                    <Button 
                      onClick={() => handleOpenUpdateModal('nonReclame')}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white flex items-center justify-center gap-2"
                    >
                      <Archive className="w-4 h-4" />
                      Marquer non réclamé
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Message processus terminé */}
          {normalizedStatut === 'NON_RECLAME' && (
            <Card className="bg-white border border-gray-200">
              <CardBody className="p-6">
                <div className="flex items-center gap-3 text-slate-600">
                  <CheckCircle className="w-5 h-5 text-gray-600" />
                  <p className="font-medium">Processus terminé - Objet non réclamé</p>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Informations propriétaire (si restitué) */}
          {objet.proprietaire && normalizedStatut === 'RESTITUE' && (
            <Card className="bg-green-50 border border-green-200">
              <CardBody className="p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-green-600" />
                  Propriétaire
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-500">Nom complet</p>
                    <p className="font-semibold text-slate-900">
                      {typeof objet.proprietaire === 'object'
                        ? `${objet.proprietaire.prenom || ''} ${objet.proprietaire.nom || ''}`.trim()
                        : objet.proprietaire}
                    </p>
                  </div>
                  {typeof objet.proprietaire === 'object' && objet.proprietaire.telephone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <p className="text-slate-700">{objet.proprietaire.telephone}</p>
                    </div>
                  )}
                  {typeof objet.proprietaire === 'object' && objet.proprietaire.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <p className="text-slate-700">{objet.proprietaire.email}</p>
                    </div>
                  )}
                  {typeof objet.proprietaire === 'object' && objet.proprietaire.adresse && (
                    <div>
                      <p className="text-sm text-slate-500">Adresse</p>
                      <p className="text-slate-700">{objet.proprietaire.adresse}</p>
                    </div>
                  )}
                  {typeof objet.proprietaire === 'object' && objet.proprietaire.cni && (
                    <div>
                      <p className="text-sm text-slate-500">N° CNI</p>
                      <p className="text-slate-700">{objet.proprietaire.cni}</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de mise à jour de statut */}
      <Modal isOpen={isUpdateStatutModalOpen} onClose={() => setIsUpdateStatutModalOpen(false)}>
        <ModalHeader>
          <ModalTitle>
            {actionType === 'restitue' ? 'Marquer comme restitué' : 'Marquer non réclamé'}
          </ModalTitle>
          <ModalClose onClick={() => setIsUpdateStatutModalOpen(false)} />
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-4">
            {actionType === 'restitue' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date de restitution <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={dateRestitution}
                    onChange={(e) => setDateRestitution(e.target.value)}
                    inputSize="md"
                    max={maxDate}
                    required
                  />
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Informations du propriétaire (optionnel)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Nom</label>
                      <Input
                        type="text"
                        value={proprietaireNom}
                        onChange={(e) => setProprietaireNom(e.target.value)}
                        inputSize="md"
                        placeholder="Nom de famille"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Prénom</label>
                      <Input
                        type="text"
                        value={proprietairePrenom}
                        onChange={(e) => setProprietairePrenom(e.target.value)}
                        inputSize="md"
                        placeholder="Prénom"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone</label>
                      <Input
                        type="tel"
                        value={proprietaireTelephone}
                        onChange={(e) => setProprietaireTelephone(e.target.value)}
                        inputSize="md"
                        placeholder="+225 XX XX XX XX XX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                      <Input
                        type="email"
                        value={proprietaireEmail}
                        onChange={(e) => setProprietaireEmail(e.target.value)}
                        inputSize="md"
                        placeholder="email@exemple.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Adresse</label>
                      <Input
                        type="text"
                        value={proprietaireAdresse}
                        onChange={(e) => setProprietaireAdresse(e.target.value)}
                        inputSize="md"
                        placeholder="Adresse"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">N° CNI</label>
                      <Input
                        type="text"
                        value={proprietaireCni}
                        onChange={(e) => setProprietaireCni(e.target.value)}
                        inputSize="md"
                        placeholder="Numéro CNI"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {actionType === 'nonReclame' && normalizedStatut === 'EN_ATTENTE' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-yellow-900 mb-1">Attention</p>
                    <p className="text-sm text-yellow-800">
                      Vous êtes sur le point de marquer cet objet comme non réclamé sans qu&apos;il ait été restitué. 
                      Cette action est irréversible.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {actionType === 'nonReclame' && normalizedStatut === 'RESTITUE' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-900 mb-1">Archivage du dossier</p>
                    <p className="text-sm text-blue-800">
                      Vous êtes sur le point de marquer cet objet comme non réclamé. L&apos;objet a déjà été restitué.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {actionType === 'nonReclame' && normalizedStatut === 'DISPONIBLE' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-1">Marquer comme non réclamé</p>
                    <p className="text-sm text-amber-700">
                      Cette action marquera l&apos;objet comme non réclamé. Êtes-vous sûr de vouloir continuer ?
                    </p>
                  </div>
                </div>
              </div>
            )}

            {updateError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{updateError}</p>
              </div>
            )}
          </div>
        </ModalBody>
        
        <ModalFooter>
          <Button
            onClick={() => setIsUpdateStatutModalOpen(false)}
            className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
          >
            Annuler
          </Button>
          <Button
            onClick={handleUpdateStatut}
            className={`${
              actionType === 'restitue' 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'bg-amber-600 hover:bg-amber-700'
            } text-white flex items-center gap-2`}
            disabled={actionType === 'restitue' && !dateRestitution}
          >
            <CheckCircle className="w-4 h-4" />
            Confirmer
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal de détail d'un objet de l'inventaire */}
      <Modal isOpen={isInventoryItemModalOpen} onClose={handleCloseInventoryItemModal}>
        <ModalHeader>
          <ModalTitle>Détails de l&apos;objet</ModalTitle>
          <ModalClose onClick={handleCloseInventoryItemModal} />
        </ModalHeader>
        
        <ModalBody>
          {selectedInventoryItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                {React.createElement(categoryIcons[selectedInventoryItem.category] || Box, { 
                  className: "w-8 h-8 text-purple-600" 
                })}
                <div>
                  <h3 className="font-bold text-slate-900">{selectedInventoryItem.name}</h3>
                  <p className="text-sm text-slate-500">
                    {categoryLabels[selectedInventoryItem.category] || selectedInventoryItem.category}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-500">Couleur</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-block w-6 h-6 rounded-full border-2 border-slate-300" 
                          style={{ backgroundColor: selectedInventoryItem.color }}
                    />
                    <span className="font-semibold text-slate-900">{selectedInventoryItem.color}</span>
                  </div>
                </div>

                {selectedInventoryItem.brand && (
                  <div>
                    <p className="text-sm text-slate-500">Marque</p>
                    <p className="font-semibold text-slate-900">{selectedInventoryItem.brand}</p>
                  </div>
                )}

                {selectedInventoryItem.serial && (
                  <div>
                    <p className="text-sm text-slate-500">Numéro de série</p>
                    <p className="font-semibold text-slate-900 font-mono">{selectedInventoryItem.serial}</p>
                  </div>
                )}

                {selectedInventoryItem.identityType && (
                  <>
                    <div>
                      <p className="text-sm text-slate-500">Type de document</p>
                      <p className="font-semibold text-slate-900">{selectedInventoryItem.identityType}</p>
                    </div>
                    {selectedInventoryItem.identityNumber && (
                      <div>
                        <p className="text-sm text-slate-500">Numéro</p>
                        <p className="font-semibold text-slate-900">{selectedInventoryItem.identityNumber}</p>
                      </div>
                    )}
                    {selectedInventoryItem.identityName && (
                      <div>
                        <p className="text-sm text-slate-500">Nom sur le document</p>
                        <p className="font-semibold text-slate-900">{selectedInventoryItem.identityName}</p>
                      </div>
                    )}
                  </>
                )}

                {selectedInventoryItem.cardType && (
                  <>
                    <div>
                      <p className="text-sm text-slate-500">Type de carte</p>
                      <p className="font-semibold text-slate-900">{selectedInventoryItem.cardType}</p>
                    </div>
                    {selectedInventoryItem.cardBank && (
                      <div>
                        <p className="text-sm text-slate-500">Banque</p>
                        <p className="font-semibold text-slate-900">{selectedInventoryItem.cardBank}</p>
                      </div>
                    )}
                    {selectedInventoryItem.cardLast4 && (
                      <div>
                        <p className="text-sm text-slate-500">4 derniers chiffres</p>
                        <p className="font-semibold text-slate-900 font-mono">XXXX {selectedInventoryItem.cardLast4}</p>
                      </div>
                    )}
                  </>
                )}

                {selectedInventoryItem.description && (
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Description</p>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-lg text-sm">
                      {selectedInventoryItem.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </ModalBody>
        
        <ModalFooter>
          <Button
            onClick={handleCloseInventoryItemModal}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Fermer
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}