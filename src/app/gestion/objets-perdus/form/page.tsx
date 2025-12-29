'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  PackageSearch, Search, MapPin, User, FileText, ArrowLeft, Loader2,
  Package, Layers, PlusCircle, Edit, Trash2, X, CheckCircle, Info,
  Smartphone, Briefcase, Wallet, ShoppingBag, Backpack,
  CreditCard, Key, DollarSign, Watch, Glasses, Laptop, Shirt, Box,
  ScrollText, IdCard, AlertTriangle, Target, Eye, Link, Check
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardBody } from '@/components/ui/Card'
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { objetsPerdusService } from '@/lib/api/services'
import { useGestionLayout } from '@/contexts/GestionLayoutContext'
import Swal from 'sweetalert2'
import Cookies from 'js-cookie'

interface ObjetPerduFormProps {
  isOpen?: boolean
  onClose?: () => void
  onSubmit?: (data: any) => void
}

export default function ObjetPerduFormPage({ isOpen, onClose, onSubmit }: ObjetPerduFormProps = {}) {
  const router = useRouter()
  const isModalMode = isOpen !== undefined
  
  // useGestionLayout est optionnel (seulement en mode standalone)
  let setTitle: ((title: string) => void) | undefined
  let setSubtitle: ((subtitle: string) => void) | undefined
  
  try {
    const layout = useGestionLayout()
    setTitle = layout.setTitle
    setSubtitle = layout.setSubtitle
  } catch (e) {
    setTitle = undefined
    setSubtitle = undefined
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [commissariatId, setCommissariatId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // États pour les erreurs de validation
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  
  // États pour la vérification des correspondances
  const [matchedObjects, setMatchedObjects] = useState<any[]>([])
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false)
  const [isCheckingMatches, setIsCheckingMatches] = useState(false)
  
  // États pour le mode contenant/inventaire
  const [isContainer, setIsContainer] = useState<boolean | null>(null)
  const [containerType, setContainerType] = useState('')
  const [containerDescription, setContainerDescription] = useState({
    couleur: '',
    marque: '',
    taille: '',
    signesDistinctifs: ''
  })
  
  // États pour l'inventaire
  const [inventory, setInventory] = useState<any[]>([])
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  
  // État pour l'item en cours d'ajout/édition
  const [currentItem, setCurrentItem] = useState({
    category: '',
    icon: '',
    name: '',
    color: '',
    brand: '',
    serial: '',
    description: '',
    identityType: '',
    identityNumber: '',
    identityName: '',
    cardType: '',
    cardBank: '',
    cardLast4: ''
  })

  const [searchTypeObjet, setSearchTypeObjet] = useState('')
  const [isTypeObjetDropdownOpen, setIsTypeObjetDropdownOpen] = useState(false)

  // États pour l'upload de photos
  const [uploadedPhotos, setUploadedPhotos] = useState<Array<{
    id: string
    file: File
    preview: string
    type: 'facture' | 'objet' | 'autre'
  }>>([])

  // États pour la signature électronique
  const [signature, setSignature] = useState<string | null>(null)
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)

  // Types de contenants avec icônes
  const containerTypes = [
    { value: 'sac', label: 'Sac / Sacoche', icon: ShoppingBag },
    { value: 'valise', label: 'Valise / Bagage', icon: Briefcase },
    { value: 'portefeuille', label: 'Portefeuille', icon: Wallet },
    { value: 'mallette', label: 'Mallette professionnelle', icon: Briefcase },
    { value: 'sac_dos', label: 'Sac à dos', icon: Backpack }
  ]

  // Catégories d'objets pour l'inventaire avec icônes
  const itemCategories = [
    { value: 'telephone', label: 'Téléphone', icon: Smartphone },
    { value: 'portefeuille', label: 'Portefeuille', icon: Wallet },
    { value: 'papiers', label: 'Papiers', icon: ScrollText },
    { value: 'identite', label: 'Identité', icon: IdCard },
    { value: 'carte', label: 'Carte', icon: CreditCard },
    { value: 'cles', label: 'Clés', icon: Key },
    { value: 'argent', label: 'Argent', icon: DollarSign },
    { value: 'bijoux', label: 'Bijoux', icon: Watch },
    { value: 'lunettes', label: 'Lunettes', icon: Glasses },
    { value: 'ordinateur', label: 'Ordinateur', icon: Laptop },
    { value: 'montre', label: 'Montre', icon: Watch },
    { value: 'vetements', label: 'Vêtements', icon: Shirt },
    { value: 'autre', label: 'Autre', icon: Box }
  ]

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

  const [formData, setFormData] = useState({
    typeObjet: '',
    // Champs généraux
    description: '',
    valeurEstimee: '',
    couleur: '',
    // Champs spécifiques selon le type
    // Documents d'identité
    typeDocument: '',
    numeroDocument: '',
    // Téléphone portable
    marque: '',
    modele: '',
    imei: '',
    numeroSerie: '',
    capaciteStockage: '',
    numeroTelephone: '',
    // Portefeuille
    contenuPortefeuille: '',
    nombreCartes: '',
    montantArgent: '',
    materiau: '',
    // Clés
    nombreCles: '',
    typeCles: '',
    descriptionPorteCles: '',
    // Bijoux
    typeBijou: '',
    materiauBijou: '',
    pierresPrecieuses: '',
    poids: '',
    // Sac
    typeSac: '',
    contenuSac: '',
    // Ordinateur
    typeOrdinateur: '',
    numeroSerieOrdinateur: '',
    configuration: '',
    // Tablette
    capaciteTablette: '',
    // Montre
    typeMontre: '',
    referenceMontre: '',
    // Lunettes
    typeLunettes: '',
    correctionLunettes: '',
    // Vêtements
    tailleVetement: '',
    typeVetement: '',
    // Chaussures
    pointure: '',
    typeChaussures: '',
    // Vélo
    typeVelo: '',
    couleurVelo: '',
    marqueVelo: '',
    numeroCadre: '',
    // Scooter / Trottinette
    typeScooter: '',
    // Animal
    typeAnimal: '',
    raceAnimal: '',
    nomAnimal: '',
    descriptionAnimal: '',
    // Autres
    tailleAutre: '',
    dimensions: '',
    // Informations déclarant
    declarantNom: '',
    declarantPrenom: '',
    declarantTelephone: '',
    declarantEmail: '',
    declarantAdresse: '',
    declarantCni: '',
    // Lieu et date
    lieuPerte: '',
    adresseLieu: '',
    datePerte: '',
    heurePerte: '',
    // Observations
    observations: ''
  })

  // Fonctions pour l'upload de photos
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'facture' | 'objet' | 'autre') => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner uniquement des images')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('La photo ne doit pas dépasser 5 MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedPhotos(prev => [...prev, {
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview: reader.result as string,
          type
        }])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removePhoto = (id: string) => {
    setUploadedPhotos(prev => prev.filter(photo => photo.id !== id))
  }

  // Fonctions pour la signature électronique
  const openSignatureModal = () => {
    setIsSignatureModalOpen(true)
  }

  const closeSignatureModal = () => {
    setIsSignatureModalOpen(false)
  }

  const clearSignature = () => {
    setSignature(null)
    const canvas = document.getElementById('signature-canvas') as HTMLCanvasElement
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }

  const saveSignature = () => {
    const canvas = document.getElementById('signature-canvas') as HTMLCanvasElement
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png')
      setSignature(dataUrl)
      setIsSignatureModalOpen(false)
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = e.currentTarget
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.beginPath()
      const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
      const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top
      ctx.moveTo(x, y)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = e.currentTarget
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
      const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top
      ctx.lineTo(x, y)
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.stroke()
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  // Fonctions de validation en temps réel
  const validatePhone = (phone: string): string | null => {
    if (!phone) return null
    const phoneRegex = /^(\+225|225)?[0-9]{10}$/
    const cleanPhone = phone.replace(/\s/g, '')
    if (!phoneRegex.test(cleanPhone)) {
      return 'Format invalide. Ex: +225 07 12 34 56 78 ou 0712345678'
    }
    return null
  }

  const validateEmail = (email: string): string | null => {
    if (!email) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return 'Format email invalide. Ex: exemple@email.com'
    }
    return null
  }

  const validateIMEI = (imei: string): string | null => {
    if (!imei) return null
    const imeiRegex = /^[0-9]{15}$/
    if (!imeiRegex.test(imei)) {
      return 'IMEI invalide. Doit contenir exactement 15 chiffres'
    }
    return null
  }

  const validateSerialNumber = (serial: string, minLength: number = 5): string | null => {
    if (!serial) return null
    if (serial.length < minLength) {
      return `Numéro de série trop court (minimum ${minLength} caractères)`
    }
    return null
  }

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'declarantTelephone':
      case 'numeroTelephone':
        return validatePhone(value)
      case 'declarantEmail':
        return validateEmail(value)
      case 'imei':
        return validateIMEI(value)
      case 'numeroSerie':
      case 'numeroSerieOrdinateur':
      case 'numeroCadre':
        return validateSerialNumber(value)
      default:
        return null
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target
    
    // Liste des champs qui doivent être convertis en majuscules
    const fieldsToUpperCase = [
      'typeDocument', 'numeroDocument',
      'marque', 'modele', 'imei', 'numeroSerie', 'capaciteStockage',
      'contenuPortefeuille', 'nombreCartes', 'montantArgent', 'materiau',
      'nombreCles', 'typeCles', 'descriptionPorteCles',
      'typeBijou', 'materiauBijou', 'pierresPrecieuses', 'poids',
      'typeSac', 'contenuSac',
      'typeOrdinateur', 'numeroSerieOrdinateur', 'configuration',
      'capaciteTablette',
      'typeMontre', 'referenceMontre',
      'typeLunettes', 'correctionLunettes',
      'tailleVetement', 'typeVetement',
      'pointure', 'typeChaussures',
      'typeVelo', 'couleurVelo', 'marqueVelo', 'numeroCadre',
      'typeScooter',
      'typeAnimal', 'raceAnimal', 'nomAnimal', 'descriptionAnimal',
      'tailleAutre', 'dimensions',
      'couleur' // Couleur est au-dessus de description
    ]
    
    // Convertir en majuscules si le champ est dans la liste
    if (fieldsToUpperCase.includes(name) && typeof value === 'string') {
      value = value.toUpperCase()
    }
    
    // Si le type d'objet change, réinitialiser les champs spécifiques
    if (name === 'typeObjet') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        // Réinitialiser tous les champs spécifiques
        typeDocument: '',
        numeroDocument: '',
        marque: '',
        modele: '',
        imei: '',
        numeroSerie: '',
        capaciteStockage: '',
        numeroTelephone: '',
        contenuPortefeuille: '',
        nombreCartes: '',
        montantArgent: '',
        materiau: '',
        nombreCles: '',
        typeCles: '',
        descriptionPorteCles: '',
        typeBijou: '',
        materiauBijou: '',
        pierresPrecieuses: '',
        poids: '',
        typeSac: '',
        contenuSac: '',
        typeOrdinateur: '',
        numeroSerieOrdinateur: '',
        configuration: '',
        capaciteTablette: '',
        typeMontre: '',
        referenceMontre: '',
        typeLunettes: '',
        correctionLunettes: '',
        tailleVetement: '',
        typeVetement: '',
        pointure: '',
        typeChaussures: '',
        typeVelo: '',
        couleurVelo: '',
        marqueVelo: '',
        numeroCadre: '',
        typeScooter: '',
        typeAnimal: '',
        raceAnimal: '',
        nomAnimal: '',
        descriptionAnimal: '',
        tailleAutre: '',
        dimensions: '',
        couleur: ''
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleContainerDescriptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setContainerDescription(prev => ({ ...prev, [name]: value.toUpperCase() }))
  }

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCurrentItem(prev => ({ ...prev, [name]: value.toUpperCase() }))
  }

  const selectItemCategory = (category: string, icon: string) => {
    setCurrentItem(prev => ({ ...prev, category, icon }))
  }

  const openItemModal = (itemId: number | null = null) => {
    if (itemId) {
      const item = inventory.find(i => i.id === itemId)
      if (item) {
        setCurrentItem(item)
        setEditingItemId(itemId)
      }
    } else {
      setCurrentItem({
        category: '',
        icon: '',
        name: '',
        color: '',
        brand: '',
        serial: '',
        description: '',
        identityType: '',
        identityNumber: '',
        identityName: '',
        cardType: '',
        cardBank: '',
        cardLast4: ''
      })
      setEditingItemId(null)
    }
    setIsItemModalOpen(true)
  }

  const closeItemModal = () => {
    setIsItemModalOpen(false)
    setEditingItemId(null)
  }

  const addOrUpdateItem = () => {
    if (!currentItem.category) {
      alert('⚠️ Veuillez sélectionner une catégorie')
      return
    }
    if (!currentItem.name || !currentItem.color) {
      alert('⚠️ Veuillez remplir au minimum le nom et la couleur')
      return
    }

    if (editingItemId) {
      setInventory(prev => prev.map(item => 
        item.id === editingItemId ? { ...currentItem, id: editingItemId } : item
      ))
    } else {
      setInventory(prev => [...prev, { ...currentItem, id: Date.now() }])
    }
    
    closeItemModal()
  }

  const deleteItem = (id: number) => {
    if (confirm('Supprimer cet objet de l\'inventaire ?')) {
      setInventory(prev => prev.filter(item => item.id !== id))
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'telephone': '#3B82F6',
      'ordinateur': '#8B5CF6',
      'identite': '#DC2626',
      'papiers': '#F59E0B',
      'carte': '#10B981',
      'argent': '#16A34A',
      'bijoux': '#EC4899',
      'cles': '#6366F1',
      'lunettes': '#14B8A6',
      'montre': '#F97316',
      'portefeuille': '#A855F7',
      'vetements': '#FB923C',
      'autre': '#64748B'
    }
    return colors[category] || '#64748B'
  }

  const getCategoryIcon = (category: string) => {
    const cat = itemCategories.find(c => c.value === category)
    return cat ? cat.icon : Box
  }

  const filteredTypesObjets = useMemo(() => {
    if (!searchTypeObjet) return typesObjets
    const searchLower = searchTypeObjet.toLowerCase()
    return typesObjets.filter((type) =>
      type.value.toLowerCase().includes(searchLower) ||
      type.category.toLowerCase().includes(searchLower)
    )
  }, [searchTypeObjet])

  const handleTypeObjetSelect = (value: string) => {
    const event = {
      target: { name: 'typeObjet', value }
    } as React.ChangeEvent<HTMLSelectElement>
    handleFormChange(event)
    setIsTypeObjetDropdownOpen(false)
    setSearchTypeObjet('')
  }

  const createObjetPerdu = async (): Promise<string | null> => {
    if (!commissariatId) {
      setError('Commissariat non trouvé. Veuillez vous reconnecter.')
      return null
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Construire les détails spécifiques selon le type d'objet
      const detailsSpecifiques: Record<string, any> = {}
      
      // Liste des champs à inclure dans detailsSpecifiques
      const detailFields = [
        'typeDocument', 'numeroDocument',
        'marque', 'modele', 'imei', 'numeroSerie', 'capaciteStockage', 'numeroTelephone',
        'contenuPortefeuille', 'nombreCartes', 'montantArgent', 'materiau',
        'nombreCles', 'typeCles', 'descriptionPorteCles',
        'typeBijou', 'materiauBijou', 'pierresPrecieuses', 'poids',
        'typeSac', 'contenuSac',
        'typeOrdinateur', 'numeroSerieOrdinateur', 'configuration',
        'capaciteTablette',
        'typeMontre', 'referenceMontre',
        'typeLunettes', 'correctionLunettes',
        'tailleVetement', 'typeVetement',
        'pointure', 'typeChaussures',
        'typeVelo', 'couleurVelo', 'marqueVelo', 'numeroCadre',
        'typeScooter',
        'typeAnimal', 'raceAnimal', 'nomAnimal', 'descriptionAnimal',
        'tailleAutre', 'dimensions'
      ]

      detailFields.forEach(field => {
        const value = formData[field as keyof typeof formData]
        if (value && value !== '') {
          detailsSpecifiques[field] = value
        }
      })

      const apiData = {
        typeObjet: isContainer 
          ? containerTypes.find(c => c.value === containerType)?.label 
          : formData.typeObjet,
        description: formData.description,
        valeurEstimee: formData.valeurEstimee || undefined,
        couleur: formData.couleur || undefined,
        detailsSpecifiques: Object.keys(detailsSpecifiques).length > 0 ? detailsSpecifiques : undefined,
        isContainer: isContainer,
        containerDetails: isContainer ? {
          type: containerType,
          ...containerDescription,
          inventory: inventory
        } : undefined,
        declarant: {
          nom: formData.declarantNom,
          prenom: formData.declarantPrenom,
          telephone: formData.declarantTelephone,
          email: formData.declarantEmail || undefined,
          adresse: formData.declarantAdresse || undefined,
          cni: formData.declarantCni || undefined,
        },
        lieuPerte: formData.lieuPerte,
        adresseLieu: formData.adresseLieu || undefined,
        datePerte: formData.datePerte,
        heurePerte: formData.heurePerte || undefined,
        observations: formData.observations || undefined,
      }

      console.log('📤 Envoi des données au backend:', apiData)
      
      const response = await objetsPerdusService.create(apiData)
      
      console.log('📥 Réponse complète du backend:', response)
      
      if (response.success && response.data) {
        console.log('✅ Objet perdu créé avec succès:', response.data)
        const objetId = (response.data as any)?.id || (typeof response.data === 'string' ? response.data : null)
        if (!objetId) {
          console.error('❌ ID de l\'objet non trouvé dans la réponse:', response.data)
          setError('ID de l\'objet créé non trouvé dans la réponse')
          await Swal.fire({
            title: 'Erreur',
            text: 'ID de l\'objet créé non trouvé dans la réponse',
            icon: 'error',
            confirmButtonColor: '#ea580c',
          })
          return null
        }
        return objetId
      } else {
        const errorMsg = response.message || response.errors?.join(', ') || 'Erreur lors de la création de l\'objet perdu'
        console.error('❌ Erreur dans la réponse:', response)
        setError(errorMsg)
        return null
      }
    } catch (err: any) {
      console.error('❌ Erreur lors de la création de l\'objet perdu:', err)
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Erreur lors de la création de l\'objet perdu'
      setError(errorMessage)
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  // Extraire les identifiants ultra-uniques pour la vérification
  const extractUniqueIdentifiers = () => {
    const identifiers: Record<string, any> = {}
    
    if (isContainer && inventory.length > 0) {
      // Pour les contenants, chercher dans l'inventaire
      inventory.forEach(item => {
        if (item.serial) identifiers.imei = item.serial
        if (item.identityNumber) identifiers.numeroDocument = item.identityNumber
        if (item.cardLast4) identifiers.cardLast4 = item.cardLast4
      })
    } else {
      // Pour les objets simples
      if (formData.imei) identifiers.imei = formData.imei
      if (formData.numeroDocument) identifiers.numeroDocument = formData.numeroDocument
      if (formData.numeroSerie) identifiers.numeroSerie = formData.numeroSerie
      if (formData.numeroSerieOrdinateur) identifiers.numeroSerieOrdinateur = formData.numeroSerieOrdinateur
      if (formData.numeroCadre) identifiers.numeroCadre = formData.numeroCadre
    }
    
    return identifiers
  }

  // Vérifier les correspondances avec les objets retrouvés
  const checkMatches = async (): Promise<boolean> => {
    const identifiers = extractUniqueIdentifiers()
    
    // Si aucun identifiant ultra-unique, continuer sans vérification
    if (Object.keys(identifiers).length === 0) {
      return true
    }

    setIsCheckingMatches(true)
    
    try {
      const typeObjet = isContainer 
        ? containerTypes.find(c => c.value === containerType)?.label || containerType
        : formData.typeObjet

      const response = await objetsPerdusService.checkMatches({
        typeObjet,
        identifiers
      })

      if (response.success && response.data && response.data.count > 0) {
        // Des correspondances trouvées !
        setMatchedObjects(response.data.matches)
        setIsMatchModalOpen(true)
        return false // Arrêter la création
      }
      
      return true // Aucune correspondance, continuer
    } catch (error) {
      console.error('❌ Erreur lors de la vérification:', error)
      // En cas d'erreur, continuer quand même
      return true
    } finally {
      setIsCheckingMatches(false)
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    setError(null)

    // Validation
    if (isContainer === null) {
      setError('Veuillez choisir si c\'est un objet simple ou un contenant')
      return
    }

    if (isContainer) {
      if (!containerType) {
        setError('Veuillez sélectionner un type de contenant')
        return
      }
      if (inventory.length === 0) {
        setError('Veuillez ajouter au moins un objet à l\'inventaire')
        return
      }
    } else {
      if (!formData.typeObjet) {
        setError('Veuillez sélectionner un type d\'objet')
        return
      }
    }

    if (!formData.description) {
      setError('Veuillez remplir la description')
      return
    }

    if (!formData.declarantNom || !formData.declarantPrenom || !formData.declarantTelephone) {
      setError('Veuillez remplir les informations du déclarant')
      return
    }

    if (!formData.lieuPerte || !formData.datePerte) {
      setError('Veuillez indiquer le lieu et la date de perte')
      return
    }

    // 🔍 VÉRIFICATION DES CORRESPONDANCES AVANT CRÉATION
    const canProceed = await checkMatches()
    if (!canProceed) {
      return // Des correspondances trouvées, afficher le modal
    }

    const objetPerduId = await createObjetPerdu()
    
    if (!objetPerduId) {
      return
    }
    
    setFormData({
      typeObjet: '',
      description: '',
      valeurEstimee: '',
      couleur: '',
      typeDocument: '',
      numeroDocument: '',
      marque: '',
      modele: '',
      imei: '',
      numeroSerie: '',
      capaciteStockage: '',
      numeroTelephone: '',
      contenuPortefeuille: '',
      nombreCartes: '',
      montantArgent: '',
      materiau: '',
      nombreCles: '',
      typeCles: '',
      descriptionPorteCles: '',
      typeBijou: '',
      materiauBijou: '',
      pierresPrecieuses: '',
      poids: '',
      typeSac: '',
      contenuSac: '',
      typeOrdinateur: '',
      numeroSerieOrdinateur: '',
      configuration: '',
      capaciteTablette: '',
      typeMontre: '',
      referenceMontre: '',
      typeLunettes: '',
      correctionLunettes: '',
      tailleVetement: '',
      typeVetement: '',
      pointure: '',
      typeChaussures: '',
      typeVelo: '',
      couleurVelo: '',
      marqueVelo: '',
      numeroCadre: '',
      typeScooter: '',
      typeAnimal: '',
      raceAnimal: '',
      nomAnimal: '',
      descriptionAnimal: '',
      tailleAutre: '',
      dimensions: '',
      declarantNom: '',
      declarantPrenom: '',
      declarantTelephone: '',
      declarantEmail: '',
      declarantAdresse: '',
      declarantCni: '',
      lieuPerte: '',
      adresseLieu: '',
      datePerte: '',
      heurePerte: '',
      observations: ''
    })
    setSearchTypeObjet('')
    setError(null)
    setIsContainer(null)
    setContainerType('')
    setInventory([])
    
    if (onSubmit) {
      onSubmit({ id: objetPerduId })
    }
    
    if (onClose) {
      onClose()
    }
    
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'unset'
      document.body.style.paddingRight = '0px'
    }
    
    router.push(`/gestion/objets-perdus/${objetPerduId}`)
  }

  useEffect(() => {
    const getCommissariatId = (): string | null => {
      try {
        const directId = Cookies.get('commissariat_id') || localStorage.getItem('commissariat_id')
        if (directId) return directId

        const oldId = Cookies.get('user_commissariat_id') || localStorage.getItem('user_commissariat_id')
        if (oldId) return oldId

        const commissariatData = Cookies.get('user_commissariat') || localStorage.getItem('user_commissariat')
        if (commissariatData) {
          const commissariat = JSON.parse(commissariatData)
          return commissariat?.id || null
        }
        return null
      } catch (e) {
        console.error('Erreur lors de la récupération du commissariat:', e)
        return null
      }
    }

    setCommissariatId(getCommissariatId())
  }, [])

  useEffect(() => {
    if (!isModalMode && setTitle && setSubtitle) {
      setTitle('Nouvelle Déclaration d\'Objet Perdu')
      setSubtitle('Remplissez le formulaire pour déclarer un objet perdu')
    }
  }, [setTitle, setSubtitle, isModalMode])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.type-objet-dropdown')) {
        setIsTypeObjetDropdownOpen(false)
      }
    }
    if (isTypeObjetDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isTypeObjetDropdownOpen])

  const renderSpecificFields = () => {
    if (!formData.typeObjet || isContainer) return null;

    // Fonction pour rendre un champ avec label
    const renderField = (label: string, name: string, type: string = 'text', placeholder: string = '', required: boolean = false, options?: any[]) => {
      if (type === 'select') {
        return (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <Select
              name={name}
              value={formData[name as keyof typeof formData]}
              onChange={handleFormChange}
              required={required}
            >
              <option value="">Sélectionner</option>
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        );
      }
      
      return (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <Input
            type={type}
            name={name}
            value={formData[name as keyof typeof formData]}
            onChange={handleFormChange}
            placeholder={placeholder}
            required={required}
          />
        </div>
      );
    };

    // Récupérer la catégorie de l'objet sélectionné
    const selectedType = typesObjets.find(t => t.value === formData.typeObjet);
    const category = selectedType?.category || '';

    // Basé sur la catégorie, afficher les champs appropriés
    switch (category) {
      case "Documents et papiers":
        return (
          <>
            {renderField("Type de document", "typeDocument", "select", "", true, [
              { value: "CNI", label: "CNI (Carte Nationale d'Identité)" },
              { value: "Permis de conduire", label: "Permis de conduire" },
              { value: "Passeport", label: "Passeport" },
              { value: "Carte grise", label: "Carte grise" },
              { value: "Carte d'assurance", label: "Carte d'assurance" },
              { value: "Carte bancaire", label: "Carte bancaire" },
              { value: "Carte d'étudiant", label: "Carte d'étudiant" },
              { value: "Carte de sécurité sociale", label: "Carte de sécurité sociale" },
              { value: "Carnet de santé", label: "Carnet de santé" },
              { value: "Carnet de vaccination", label: "Carnet de vaccination" },
              { value: "Diplôme", label: "Diplôme" },
              { value: "Certificat", label: "Certificat" },
              { value: "Contrat", label: "Contrat" },
              { value: "Facture", label: "Facture" },
              { value: "Autre document", label: "Autre document" }
            ])}
            {renderField("Numéro du document", "numeroDocument", "text", "Numéro du document (ex: 123456789)", true)}
            {renderField("Nom sur le document", "nomAnimal", "text", "Nom complet du propriétaire")}
            {renderField("Date d'émission", "datePerte", "date", "Date d'émission du document")}
            <div className="md:col-span-2">
              {renderField("Informations supplémentaires", "descriptionAnimal", "textarea", "Autres détails sur le document")}
            </div>
          </>
        );

      case "Électronique et technologie":
        if (formData.typeObjet === "Téléphone portable") {
          return (
            <>
              {renderField("Marque", "marque", "text", "Ex: Apple, Samsung, Huawei...", true)}
              {renderField("Modèle", "modele", "text", "Ex: iPhone 14 Pro")}
              {renderField("Numéro IMEI", "imei", "text", "Numéro IMEI (15 chiffres)", true)}
              {renderField("Numéro de série", "numeroSerie", "text", "Numéro de série")}
              {renderField("Couleur", "couleur", "text", "Ex: Noir, Blanc, Or...")}
              {renderField("Capacité de stockage", "capaciteStockage", "text", "Ex: 128 GB, 256 GB...")}
              {renderField("Numéro de téléphone", "numeroTelephone", "tel", "+225 XX XX XX XX XX")}
              {renderField("Opérateur", "typeScooter", "text", "Ex: Orange, MTN, Moov")}
            </>
          );
        } else if (formData.typeObjet === "Ordinateur portable" || formData.typeObjet === "Ordinateur de bureau") {
          return (
            <>
              {renderField("Marque", "marque", "text", "Ex: Apple, Dell, HP, Lenovo...", true)}
              {renderField("Modèle", "modele", "text", "Ex: MacBook Pro, ThinkPad...")}
              {renderField("Type", "typeOrdinateur", "select", "", false, [
                { value: "Portable", label: "Portable" },
                { value: "Desktop", label: "Desktop (Bureau)" },
                { value: "All-in-One", label: "All-in-One" }
              ])}
              {renderField("Numéro de série", "numeroSerieOrdinateur", "text", "Numéro de série", true)}
              {renderField("Couleur", "couleur", "text", "Ex: Gris, Noir, Argent...")}
              {renderField("Configuration", "configuration", "text", "Ex: RAM 16 GB, SSD 512 GB, Processeur i7...")}
              {renderField("Taille d'écran", "tailleVetement", "text", "Ex: 13\", 15\", 27\"")}
            </>
          );
        } else if (formData.typeObjet === "Tablette") {
          return (
            <>
              {renderField("Marque", "marque", "text", "Ex: Apple, Samsung, Huawei...", true)}
              {renderField("Modèle", "modele", "text", "Ex: iPad Pro, Galaxy Tab...")}
              {renderField("Numéro de série", "numeroSerie", "text", "Numéro de série")}
              {renderField("Numéro IMEI", "imei", "text", "Numéro IMEI")}
              {renderField("Couleur", "couleur", "text", "Ex: Gris, Or, Argent...")}
              {renderField("Capacité", "capaciteTablette", "text", "Ex: 128 GB, 256 GB...")}
              {renderField("Taille d'écran", "tailleVetement", "text", "Ex: 10\", 12\"")}
            </>
          );
        } else if (formData.typeObjet === "Montre connectée" || formData.typeObjet === "Bracelet connecté") {
          return (
            <>
              {renderField("Marque", "marque", "text", "Ex: Apple, Samsung, Fitbit...", true)}
              {renderField("Modèle", "modele", "text", "Ex: Apple Watch Series 8, Galaxy Watch 5")}
              {renderField("Numéro de série", "numeroSerie", "text", "Numéro de série")}
              {renderField("Couleur", "couleur", "text", "Ex: Noir, Argent, Rose...")}
              {renderField("Taille", "tailleVetement", "text", "Ex: 41mm, 45mm")}
              {renderField("Type de bracelet", "materiau", "text", "Ex: Cuir, Silicone, Métal")}
            </>
          );
        } else {
          // Pour les autres appareils électroniques
          return (
            <>
              {renderField("Marque", "marque", "text", "Marque de l'appareil", true)}
              {renderField("Modèle", "modele", "text", "Modèle de l'appareil")}
              {renderField("Numéro de série", "numeroSerie", "text", "Numéro de série (si disponible)")}
              {renderField("Couleur", "couleur", "text", "Couleur de l'appareil")}
              <div className="md:col-span-2">
                {renderField("Description technique", "configuration", "textarea", "Caractéristiques techniques spécifiques")}
              </div>
            </>
          );
        }

      case "Accessoires personnels":
        if (formData.typeObjet === "Portefeuille" || formData.typeObjet === "Porte-monnaie") {
          return (
            <>
              {renderField("Couleur", "couleur", "text", "Ex: Marron, Noir, Cuir...", true)}
              {renderField("Matériau", "materiau", "select", "", false, [
                { value: "Cuir", label: "Cuir" },
                { value: "Tissu", label: "Tissu" },
                { value: "Synthétique", label: "Synthétique" },
                { value: "Plastique", label: "Plastique" },
                { value: "Autre", label: "Autre" }
              ])}
              {renderField("Nombre de cartes", "nombreCartes", "number", "Nombre de cartes approximatif")}
              {renderField("Montant d'argent", "montantArgent", "text", "Ex: 50 000 FCFA")}
              <div className="md:col-span-2">
                {renderField("Contenu (cartes bancaires, papiers...)", "contenuPortefeuille", "textarea", "Décrivez le contenu du portefeuille")}
              </div>
            </>
          );
        } else if (formData.typeObjet === "Clés" || formData.typeObjet === "Porte-clés") {
          return (
            <>
              {renderField("Nombre de clés", "nombreCles", "number", "Nombre de clés", true)}
              {renderField("Type de clés", "typeCles", "select", "", false, [
                { value: "Maison/Appartement", label: "Maison/Appartement" },
                { value: "Voiture", label: "Voiture" },
                { value: "Bureau", label: "Bureau" },
                { value: "Coffre-fort", label: "Coffre-fort" },
                { value: "Autre", label: "Autre" }
              ])}
              {renderField("Couleur du porte-clés", "couleur", "text", "Ex: Rouge, Bleu, Noir...")}
              {renderField("Marque/Marquage", "marque", "text", "Marque ou inscription sur les clés")}
              <div className="md:col-span-2">
                {renderField("Description du porte-clés", "descriptionPorteCles", "textarea", "Décrivez le porte-clés")}
              </div>
            </>
          );
        } else if (formData.typeObjet === "Bijoux" || formData.typeObjet.includes("Bague") || formData.typeObjet.includes("Collier") || 
                  formData.typeObjet.includes("Bracelet") || formData.typeObjet.includes("Boucles d'oreilles") || 
                  formData.typeObjet === "Broche" || formData.typeObjet === "Pendentif" || formData.typeObjet === "Chaîne") {
          return (
            <>
              {renderField("Type de bijou", "typeBijou", "select", "", true, [
                { value: "Bague", label: "Bague" },
                { value: "Collier", label: "Collier" },
                { value: "Bracelet", label: "Bracelet" },
                { value: "Boucles d'oreilles", label: "Boucles d'oreilles" },
                { value: "Broche", label: "Broche" },
                { value: "Pendentif", label: "Pendentif" },
                { value: "Chaîne", label: "Chaîne" },
                { value: "Autre", label: "Autre" }
              ])}
              {renderField("Matériau", "materiauBijou", "select", "", false, [
                { value: "Or", label: "Or" },
                { value: "Argent", label: "Argent" },
                { value: "Platine", label: "Platine" },
                { value: "Acier", label: "Acier" },
                { value: "Cuivre", label: "Cuivre" },
                { value: "Autre métal", label: "Autre métal" }
              ])}
              {renderField("Pierres précieuses", "pierresPrecieuses", "text", "Ex: Diamant, Émeraude, Rubis...")}
              {renderField("Couleur des pierres", "couleur", "text", "Ex: Rouge, Bleu, Transparent...")}
              {renderField("Poids", "poids", "text", "Ex: 5 g, 10 g, 1 carat...")}
              {renderField("Marque/Bijoutier", "marque", "text", "Marque ou nom du bijoutier")}
            
            </>
          );
        } else if (formData.typeObjet.includes("Sac") || formData.typeObjet === "Porte-documents" || formData.typeObjet === "Trousses et étuis") {
          return (
            <>
              {renderField("Type", "typeSac", "select", "", true, [
                { value: "Sac à main", label: "Sac à main" },
                { value: "Sac à dos", label: "Sac à dos" },
                { value: "Sac de voyage", label: "Sac de voyage" },
                { value: "Sac de sport", label: "Sac de sport" },
                { value: "Porte-documents", label: "Porte-documents" },
                { value: "Trousses/Étuis", label: "Trousses/Étuis" },
                { value: "Autre", label: "Autre" }
              ])}
              {renderField("Couleur", "couleur", "text", "Ex: Noir, Marron, Rouge...", true)}
              {renderField("Matériau", "materiau", "select", "", false, [
                { value: "Cuir", label: "Cuir" },
                { value: "Toile", label: "Toile" },
                { value: "Nylon", label: "Nylon" },
                { value: "Polyester", label: "Polyester" },
                { value: "Plastique", label: "Plastique" },
                { value: "Autre", label: "Autre" }
              ])}
              {renderField("Marque", "marque", "text", "Marque du sac")}
              {renderField("Taille", "tailleVetement", "select", "", false, [
                { value: "PETIT", label: "Petit" },
                { value: "MOYEN", label: "Moyen" },
                { value: "GRAND", label: "Grand" },
                { value: "TRES_GRAND", label: "Très grand" }
              ])}
              <div className="md:col-span-2">
                {renderField("Contenu", "contenuSac", "textarea", "Décrivez le contenu du sac")}
              </div>
            </>
          );
        } else if (formData.typeObjet === "Montre") {
          return (
            <>
              {renderField("Marque", "marque", "text", "Ex: Rolex, Omega, Casio...", true)}
              {renderField("Modèle / Référence", "referenceMontre", "text", "Référence ou modèle")}
              {renderField("Type", "typeMontre", "select", "", false, [
                { value: "Quartz", label: "Quartz" },
                { value: "Automatique", label: "Automatique" },
                { value: "Électronique", label: "Électronique" },
                { value: "Mécanique", label: "Mécanique" },
                { value: "Digitale", label: "Digitale" }
              ])}
              {renderField("Couleur du boîtier", "couleur", "text", "Ex: Or, Argent, Noir, Bleu...")}
              {renderField("Matériau du bracelet", "materiau", "select", "", false, [
                { value: "Cuir", label: "Cuir" },
                { value: "Métal", label: "Métal" },
                { value: "Caoutchouc", label: "Caoutchouc" },
                { value: "Nylon", label: "Nylon" },
                { value: "Plastique", label: "Plastique" }
              ])}
              {renderField("Numéro de série", "numeroSerie", "text", "Numéro de série (si disponible)")}
            </>
          );
        } else if (formData.typeObjet.includes("Lunettes")) {
          return (
            <>
              {renderField("Type", "typeLunettes", "select", "", true, [
                { value: "Lunettes de vue", label: "Lunettes de vue" },
                { value: "Lunettes de soleil", label: "Lunettes de soleil" },
                { value: "Lunettes de sport", label: "Lunettes de sport" },
                { value: "Lunettes de sécurité", label: "Lunettes de sécurité" }
              ])}
              {renderField("Marque", "marque", "text", "Ex: Ray-Ban, Oakley, Essilor...")}
              {renderField("Couleur de la monture", "couleur", "text", "Ex: Noir, Transparent, Or, Argent...")}
              {renderField("Correction (si lunettes de vue)", "correctionLunettes", "text", "Ex: -2.5, +1.0, Astigmatie...")}
              {renderField("Matériau", "materiau", "select", "", false, [
                { value: "Plastique", label: "Plastique" },
                { value: "Métal", label: "Métal" },
                { value: "Mixte", label: "Mixte" },
                { value: "Autre", label: "Autre" }
              ])}
              <div className="md:col-span-2">
                {renderField("Description des verres", "descriptionPorteCles", "textarea", "Couleur des verres, traitement, etc.")}
              </div>
            </>
          );
        } else {
          // Pour les autres accessoires personnels
          return (
            <>
              {renderField("Couleur", "couleur", "text", "Couleur de l'accessoire", true)}
              {renderField("Matériau", "materiau", "text", "Matériau de fabrication")}
              {renderField("Marque", "marque", "text", "Marque de l'accessoire")}
              {renderField("Taille/Dimensions", "tailleVetement", "text", "Taille ou dimensions")}
              <div className="md:col-span-2">
                {renderField("Description détaillée", "descriptionPorteCles", "textarea", "Décrivez l'accessoire en détail")}
              </div>
            </>
          );
        }

      case "Vêtements et chaussures":
        if (formData.typeObjet.includes("Vêtements")
           || formData.typeObjet.includes("T-shirt") || 
            formData.typeObjet.includes("Chemise") || formData.typeObjet.includes("Pantalon") || 
            formData.typeObjet.includes("Jean") || formData.typeObjet.includes("Robe") || 
            formData.typeObjet.includes("Jupe") || formData.typeObjet.includes("Veste") || 
            formData.typeObjet.includes("Manteau") || formData.typeObjet.includes("Blouson") || 
            formData.typeObjet.includes("Pull") || formData.typeObjet.includes("Sweat-shirt") || 
            formData.typeObjet.includes("Short") || formData.typeObjet.includes("Maillot de bain") || 
            formData.typeObjet.includes("Sous-vêtements")) {
          return (
            <>
              {renderField("Type de vêtement", "typeVetement", "select", "", true, [
                { value: "T-shirt", label: "T-shirt" },
                { value: "Chemise", label: "Chemise" },
                { value: "Pantalon", label: "Pantalon" },
                { value: "Jean", label: "Jean" },
                { value: "Robe", label: "Robe" },
                { value: "Jupe", label: "Jupe" },
                { value: "Veste", label: "Veste" },
                { value: "Manteau", label: "Manteau" },
                { value: "Blouson", label: "Blouson" },
                { value: "Pull", label: "Pull" },
                { value: "Sweat-shirt", label: "Sweat-shirt" },
                { value: "Short", label: "Short" },
                { value: "Maillot de bain", label: "Maillot de bain" },
                { value: "Sous-vêtements", label: "Sous-vêtements" },
                { value: "Autre", label: "Autre" }
              ])}
              {renderField("Taille", "tailleVetement", "select", "", true, [
                { value: "XS", label: "XS" },
                { value: "S", label: "S" },
                { value: "M", label: "M" },
                { value: "L", label: "L" },
                { value: "XL", label: "XL" },
                { value: "XXL", label: "XXL" },
                { value: "XXXL", label: "XXXL" },
                { value: "Enfant", label: "Enfant" },
                { value: "Autre", label: "Autre" }
              ])}
              {renderField("Couleur", "couleur", "text", "Ex: Bleu, Rouge, Noir, Blanc...", true)}
              {renderField("Marque", "marque", "text", "Marque du vêtement")}
              {renderField("Matériau", "materiau", "text", "Ex: Coton, Laine, Polyester, Lin...")}
              <div className="md:col-span-2">
                {renderField("Description (motifs, logo, détails...)", "descriptionPorteCles", "textarea", "Décrivez les détails du vêtement")}
              </div>
            </>
          );
        } else if (formData.typeObjet.includes("Chaussures") || formData.typeObjet.includes("Baskets") || 
                  formData.typeObjet.includes("Sandales") || formData.typeObjet.includes("Bottes") || 
                  formData.typeObjet.includes("Tongs") || formData.typeObjet.includes("Chaussures de sécurité")) {
          return (
            <>
              {renderField("Type", "typeChaussures", "select", "", true, [
                { value: "Baskets", label: "Baskets" },
                { value: "Chaussures de ville", label: "Chaussures de ville" },
                { value: "Sandales", label: "Sandales" },
                { value: "Bottes", label: "Bottes" },
                { value: "Chaussures de sport", label: "Chaussures de sport" },
                { value: "Tongs", label: "Tongs" },
                { value: "Chaussures de sécurité", label: "Chaussures de sécurité" },
                { value: "Autre", label: "Autre" }
              ])}
              {renderField("Pointure", "pointure", "text", "Ex: 42, 9, M, 38...", true)}
              {renderField("Couleur", "couleur", "text", "Ex: Noir, Blanc, Marron, Bleu...", true)}
              {renderField("Marque", "marque", "text", "Marque des chaussures")}
              {renderField("Matériau", "materiau", "select", "", false, [
                { value: "Cuir", label: "Cuir" },
                { value: "Toile", label: "Toile" },
                { value: "Caoutchouc", label: "Caoutchouc" },
                { value: "Synthétique", label: "Synthétique" },
                { value: "Autre", label: "Autre" }
              ])}
              <div className="md:col-span-2">
                {renderField("État et détails", "descriptionPorteCles", "textarea", "État, usure, détails particuliers...")}
              </div>
            </>
          );
        }

      case "Véhicules":
        if (formData.typeObjet.includes("Vélo")) {
          return (
            <>
              {renderField("Type", "typeVelo", "select", "", true, [
                { value: "Vélo de ville", label: "Vélo de ville" },
                { value: "VTT", label: "VTT" },
                { value: "Vélo de route", label: "Vélo de route" },
                { value: "Vélo électrique", label: "Vélo électrique" },
                { value: "Vélo enfant", label: "Vélo enfant" },
                { value: "BMX", label: "BMX" },
                { value: "Autre", label: "Autre" }
              ])}
              {renderField("Marque", "marqueVelo", "text", "Ex: Decathlon, Trek, Giant...", true)}
              {renderField("Modèle", "modele", "text", "Modèle du vélo")}
              {renderField("Couleur", "couleurVelo", "text", "Ex: Rouge, Bleu, Noir, Vert...", true)}
              {renderField("Numéro de cadre", "numeroCadre", "text", "Numéro de série du cadre", true)}
              {renderField("Taille", "tailleVetement", "text", "Ex: S, M, L, 26\", 28\"")}
              <div className="md:col-span-2">
                {renderField("Équipements/accessoires", "descriptionPorteCles", "textarea", "Paniers, phares, antivol, etc.")}
              </div>
            </>
          );
        } else if (formData.typeObjet.includes("Scooter") || formData.typeObjet.includes("Trottinette")) {
          return (
            <>
              {renderField("Type", "typeScooter", "select", "", true, [
                { value: "Scooter", label: "Scooter" },
                { value: "Trottinette", label: "Trottinette" },
                { value: "Trottinette électrique", label: "Trottinette électrique" },
                { value: "Autre", label: "Autre" }
              ])}
              {renderField("Marque", "marque", "text", "Ex: Xiaomi, Segway, Peugeot...", true)}
              {renderField("Modèle", "modele", "text", "Modèle du scooter/trottinette")}
              {renderField("Couleur", "couleur", "text", "Ex: Noir, Blanc, Rouge, Gris...", true)}
              {renderField("Numéro de série", "numeroSerie", "text", "Numéro de série")}
              {renderField("Autonomie (si électrique)", "capaciteStockage", "text", "Ex: 25 km")}
            </>
          );
        } else if (formData.typeObjet.includes("Casque")) {
          return (
            <>
              {renderField("Type", "typeScooter", "select", "", true, [
                { value: "Casque moto", label: "Casque moto" },
                { value: "Casque vélo", label: "Casque vélo" },
                { value: "Casque de ski", label: "Casque de ski" },
                { value: "Autre", label: "Autre" }
              ])}
              {renderField("Marque", "marque", "text", "Ex: Bell, Giro, Shoei...")}
              {renderField("Couleur", "couleur", "text", "Ex: Noir, Rouge, Bleu, Multicolore...", true)}
              {renderField("Taille", "tailleVetement", "text", "Ex: S, M, L, XL")}
              {renderField("Certification", "typeDocument", "text", "Ex: CE, DOT, ECE")}
            </>
          );
        } else if (formData.typeObjet === "Plaque d'immatriculation") {
          return (
            <>
              {renderField("Numéro de plaque", "numeroDocument", "text", "Numéro d'immatriculation", true)}
              {renderField("Pays", "typeAnimal", "text", "Ex: CI, FR, TG...")}
              {renderField("Type de véhicule", "typeScooter", "select", "", false, [
                { value: "Voiture", label: "Voiture" },
                { value: "Moto", label: "Moto" },
                { value: "Scooter", label: "Scooter" },
                { value: "Camion", label: "Camion" },
                { value: "Autre", label: "Autre" }
              ])}
              {renderField("Couleur de la plaque", "couleur", "text", "Ex: Blanche, Jaune")}
            </>
          );
        } else {
          // Pour les autres accessoires véhicule
          return (
            <>
              {renderField("Type d'accessoire", "typeScooter", "select", "", true, [
                { value: "Antivol", label: "Antivol" },
                { value: "Rétroviseur", label: "Rétroviseur" },
                { value: "Accessoire intérieur", label: "Accessoire intérieur" },
                { value: "Accessoire extérieur", label: "Accessoire extérieur" },
                { value: "Autre", label: "Autre" }
              ])}
              {renderField("Marque", "marque", "text", "Marque de l'accessoire")}
              {renderField("Couleur", "couleur", "text", "Couleur de l'accessoire")}
              {renderField("Type de véhicule", "typeAnimal", "text", "Pour quel type de véhicule")}
              <div className="md:col-span-2">
                {renderField("Description", "descriptionPorteCles", "textarea", "Décrivez l'accessoire")}
              </div>
            </>
          );
        }

      case "Animaux":
        return (
          <>
            {renderField("Type d'animal", "typeAnimal", "select", "", true, [
              { value: "Chien", label: "Chien" },
              { value: "Chat", label: "Chat" },
              { value: "Oiseau", label: "Oiseau" },
              { value: "Rongeur", label: "Rongeur" },
              { value: "Reptile", label: "Reptile" },
              { value: "Autre", label: "Autre" }
            ])}
            {renderField("Nom", "nomAnimal", "text", "Nom de l'animal")}
            {renderField("Race", "raceAnimal", "text", "Race de l'animal")}
            {renderField("Couleur / Pelage", "couleur", "text", "Ex: Noir et blanc, Roux, Gris...", true)}
            {renderField("Âge", "poids", "text", "Ex: 3 ans, 6 mois")}
            {renderField("Taille/Poids", "typeVetement", "text", "Ex: Petit, Moyen, 5 kg")}
            <div className="md:col-span-2">
              {renderField("Signes distinctifs", "descriptionAnimal", "textarea", "Marques, cicatrices, comportements...")}
            </div>
            {renderField("Accessoires (laisse, collier...)", "descriptionPorteCles", "text", "Accessoires perdus avec l'animal")}
          </>
        );

      case "Articles de sport":
        return (
          <>
            {renderField("Type d'article", "typeScooter", "select", "", true, [
              { value: "Ballon", label: "Ballon" },
              { value: "Raquette", label: "Raquette" },
              { value: "Club de golf", label: "Club de golf" },
              { value: "Équipement fitness", label: "Équipement fitness" },
              { value: "Planche", label: "Planche (surf, snowboard)" },
              { value: "Patins/Rollers", label: "Patins/Rollers" },
              { value: "Autre", label: "Autre" }
            ])}
            {renderField("Marque", "marque", "text", "Marque de l'article")}
            {renderField("Modèle", "modele", "text", "Modèle de l'article")}
            {renderField("Couleur", "couleur", "text", "Couleur de l'article")}
            {renderField("Taille/Dimensions", "tailleVetement", "text", "Ex: Taille, poids, dimensions")}
            <div className="md:col-span-2">
              {renderField("Description technique", "descriptionPorteCles", "textarea", "Caractéristiques techniques")}
            </div>
          </>
        );

      case "Outils et équipements":
        return (
          <>
            {renderField("Type d'outil", "typeScooter", "select", "", true, [
              { value: "Outils à main", label: "Outils à main" },
              { value: "Outils électriques", label: "Outils électriques" },
              { value: "Boîte à outils", label: "Boîte à outils" },
              { value: "Équipement de jardinage", label: "Équipement de jardinage" },
              { value: "Équipement de mesure", label: "Équipement de mesure" },
              { value: "Autre", label: "Autre" }
            ])}
            {renderField("Marque", "marque", "text", "Marque de l'outil")}
            {renderField("Modèle", "modele", "text", "Modèle de l'outil")}
            {renderField("Numéro de série", "numeroSerie", "text", "Numéro de série (si disponible)")}
            {renderField("Couleur", "couleur", "text", "Couleur de l'outil")}
            {renderField("Tension/Puissance", "capaciteStockage", "text", "Ex: 220V, 18V, 500W")}
            <div className="md:col-span-2">
              {renderField("Description", "descriptionPorteCles", "textarea", "État, accessoires inclus, etc.")}
            </div>
          </>
        );

      case "Médicaments et santé":
        return (
          <>
            {renderField("Type d'article", "typeScooter", "select", "", true, [
              { value: "Médicaments", label: "Médicaments" },
              { value: "Trousse de secours", label: "Trousse de secours" },
              { value: "Appareil médical", label: "Appareil médical" },
              { value: "Aide à la mobilité", label: "Aide à la mobilité" },
              { value: "Autre", label: "Autre" }
            ])}
            {renderField("Nom du médicament/appareil", "nomAnimal", "text", "Nom exact")}
            {renderField("Marque/Fabricant", "marque", "text", "Marque ou fabricant")}
            {renderField("Quantité", "nombreCartes", "text", "Ex: 1 boîte, 10 comprimés")}
            {renderField("Date de péremption", "datePerte", "date", "Pour les médicaments")}
            <div className="md:col-span-2">
              {renderField("Description", "descriptionPorteCles", "textarea", "Détails importants")}
            </div>
          </>
        );

      case "Jouets et jeux":
        return (
          <>
            {renderField("Type de jouet", "typeScooter", "select", "", true, [
              { value: "Jouet éducatif", label: "Jouet éducatif" },
              { value: "Poupée/Peluche", label: "Poupée/Peluche" },
              { value: "Jeu de société", label: "Jeu de société" },
              { value: "Jeu vidéo", label: "Jeu vidéo" },
              { value: "Console de jeu", label: "Console de jeu" },
              { value: "Jouet extérieur", label: "Jouet extérieur" },
              { value: "Autre", label: "Autre" }
            ])}
            {renderField("Marque", "marque", "text", "Marque du jouet")}
            {renderField("Nom du jouet/jeu", "nomAnimal", "text", "Nom du jouet ou du jeu")}
            {renderField("Couleur", "couleur", "text", "Couleur principale")}
            {renderField("Âge recommandé", "poids", "text", "Ex: 3+, 6+, 12+")}
            <div className="md:col-span-2">
              {renderField("Description", "descriptionPorteCles", "textarea", "État, pièces manquantes, etc.")}
            </div>
          </>
        );

      case "Instruments de musique":
        return (
          <>
            {renderField("Type d'instrument", "typeScooter", "select", "", true, [
              { value: "Guitare", label: "Guitare" },
              { value: "Violon", label: "Violon" },
              { value: "Piano/Clavier", label: "Piano/Clavier" },
              { value: "Instrument à vent", label: "Instrument à vent" },
              { value: "Instrument à percussion", label: "Instrument à percussion" },
              { value: "Équipement audio", label: "Équipement audio" },
              { value: "Autre", label: "Autre" }
            ])}
            {renderField("Marque", "marque", "text", "Marque de l'instrument")}
            {renderField("Modèle", "modele", "text", "Modèle de l'instrument")}
            {renderField("Numéro de série", "numeroSerie", "text", "Numéro de série")}
            {renderField("Couleur", "couleur", "text", "Couleur de l'instrument")}
            {renderField("Année de fabrication", "datePerte", "text", "Année approximative")}
            <div className="md:col-span-2">
              {renderField("Description", "descriptionPorteCles", "textarea", "État, accessoires, particularités")}
            </div>
          </>
        );

      case "Articles de cuisine":
        return (
          <>
            {renderField("Type d'article", "typeScooter", "select", "", true, [
              { value: "Récipient", label: "Récipient (thermos, gourde)" },
              { value: "Boîte repas", label: "Boîte repas" },
              { value: "Ustensile", label: "Ustensile" },
              { value: "Accessoire", label: "Accessoire" },
              { value: "Autre", label: "Autre" }
            ])}
            {renderField("Marque", "marque", "text", "Marque de l'article")}
            {renderField("Modèle", "modele", "text", "Modèle ou type")}
            {renderField("Couleur", "couleur", "text", "Couleur de l'article")}
            {renderField("Capacité", "capaciteStockage", "text", "Ex: 500ml, 1L")}
            {renderField("Matériau", "materiau", "select", "", false, [
              { value: "Plastique", label: "Plastique" },
              { value: "Métal", label: "Métal" },
              { value: "Verre", label: "Verre" },
              { value: "Bambou", label: "Bambou" },
              { value: "Autre", label: "Autre" }
            ])}
            <div className="md:col-span-2">
              {renderField("Description", "descriptionPorteCles", "textarea", "État, particularités")}
            </div>
          </>
        );

      case "Autres":
      default:
        return (
          <>
            {renderField("Couleur", "couleur", "text", "Couleur de l'objet")}
            {renderField("Marque", "marque", "text", "Marque de l'objet")}
            {renderField("Taille/Dimensions", "tailleAutre", "text", "Taille ou dimensions")}
            {renderField("Matériau", "materiau", "text", "Matériau de fabrication")}
            <div className="md:col-span-2">
              {renderField("Description détaillée", "descriptionPorteCles", "textarea", "Décrivez l'objet en détail")}
            </div>
          </>
        );
    }
  };

  const formContent = (
    <div className="space-y-6">
      {/* Affichage des erreurs */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Sélection Objet Simple / Contenant */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Type de déclaration</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setIsContainer(false)}
            className={`p-6 border-2 rounded-xl text-center transition-all ${
              isContainer === false 
                ? 'border-purple-600 bg-purple-50' 
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="flex justify-center mb-2">
              <Smartphone className="w-12 h-12 text-purple-600" />
            </div>
            <div className="font-semibold text-slate-900">Objet simple</div>
            <div className="text-xs text-slate-600 mt-1">Un seul objet perdu</div>
          </button>

          <button
            onClick={() => setIsContainer(true)}
            className={`p-6 border-2 rounded-xl text-center transition-all ${
              isContainer === true 
                ? 'border-purple-600 bg-purple-50' 
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="flex justify-center mb-2">
              <Backpack className="w-12 h-12 text-purple-600" />
            </div>
            <div className="font-semibold text-slate-900">Contenant avec inventaire</div>
            <div className="text-xs text-slate-600 mt-1">Sac, valise, portefeuille...</div>
          </button>
        </div>
      </div>

      {/* Si Contenant sélectionné */}
      {isContainer === true && (
        <>
          {/* Type de contenant */}
          <div className="border-b border-slate-200 pb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Type de contenant</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {containerTypes.map((type) => {
                const IconComponent = type.icon
                return (
                  <button
                    key={type.value}
                    onClick={() => setContainerType(type.value)}
                    className={`p-4 border-2 rounded-xl text-center transition-all ${
                      containerType === type.value
                        ? 'border-orange-600 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex justify-center mb-2">
                      <IconComponent className="w-8 h-8 text-orange-600" />
                    </div>
                    <div className="text-sm font-medium text-slate-900">{type.label}</div>
                  </button>
                )
              })}
            </div>

            {/* Description du contenant */}
            {containerType && (
              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Description du contenant</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Couleur(s) *</label>
                    <Input
                      type="text"
                      name="couleur"
                      value={containerDescription.couleur}
                      onChange={handleContainerDescriptionChange}
                      placeholder="Ex: NOIR, MARRON"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Marque/Modèle</label>
                    <Input
                      type="text"
                      name="marque"
                      value={containerDescription.marque}
                      onChange={handleContainerDescriptionChange}
                      placeholder="Ex: LOUIS VUITTON"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Taille</label>
                    <Select
                      name="taille"
                      value={containerDescription.taille}
                      onChange={handleContainerDescriptionChange}
                    >
                      <option value="">Sélectionner...</option>
                      <option value="PETIT">Petit (&lt; 30cm)</option>
                      <option value="MOYEN">Moyen (30-50cm)</option>
                      <option value="GRAND">Grand (50-70cm)</option>
                      <option value="TRES_GRAND">Très grand (&gt; 70cm)</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Signes distinctifs</label>
                    <Input
                      type="text"
                      name="signesDistinctifs"
                      value={containerDescription.signesDistinctifs}
                      onChange={handleContainerDescriptionChange}
                      placeholder="RAYURES, AUTOCOLLANTS..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section Inventaire */}
          {containerType && (
            <div className="border-b border-slate-200 pb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Inventaire du contenu</h3>
                </div>
                <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                  {inventory.length} objet(s)
                </div>
              </div>

              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong>Important :</strong> Listez TOUS les objets contenus. Plus l'inventaire est complet, plus les chances de récupération sont élevées.
                </div>
              </div>

              {/* Liste des objets */}
              <div className="space-y-3 mb-4">
                {inventory.map((item, index) => {
                  const color = getCategoryColor(item.category)
                  const IconComponent = getCategoryIcon(item.category)
                  return (
                    <div
                      key={item.id}
                      className="p-4 border-l-4 bg-slate-50 rounded-lg"
                      style={{ borderLeftColor: color }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: color + '20' }}
                          >
                            <IconComponent className="w-5 h-5" style={{ color }} />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{item.name}</div>
                            <div className="text-xs text-slate-600">Objet #{index + 1}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openItemModal(item.id)}
                            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 text-slate-600" />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white p-2 rounded">
                          <div className="text-xs text-slate-500">Couleur</div>
                          <div className="text-sm font-medium">{item.color}</div>
                        </div>
                        {item.brand && (
                          <div className="bg-white p-2 rounded">
                            <div className="text-xs text-slate-500">Marque</div>
                            <div className="text-sm font-medium">{item.brand}</div>
                          </div>
                        )}
                        {item.serial && (
                          <div className="bg-white p-2 rounded">
                            <div className="text-xs text-slate-500">N° Série</div>
                            <div className="text-sm font-medium">{item.serial}</div>
                          </div>
                        )}
                        {item.identityNumber && (
                          <div className="bg-white p-2 rounded">
                            <div className="text-xs text-slate-500">N° Document</div>
                            <div className="text-sm font-medium text-red-600">{item.identityNumber}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Bouton Ajouter */}
              <button
                onClick={() => openItemModal(null)}
                className="w-full p-4 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 font-semibold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                Ajouter un objet au contenu
              </button>
            </div>
          )}
        </>
      )}

      {/* Si Objet Simple sélectionné */}
      {isContainer === false && (
        <div className="border-b border-slate-200 pb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <PackageSearch className="w-4 h-4 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Type d'objet</h3>
          </div>
          
          <div className="relative type-objet-dropdown">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Type d'objet <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 z-10" />
              <input
                type="text"
                value={isTypeObjetDropdownOpen ? searchTypeObjet : (formData.typeObjet || '')}
                onChange={(e) => {
                  setSearchTypeObjet(e.target.value)
                  setIsTypeObjetDropdownOpen(true)
                  if (!e.target.value) {
                    const event = {
                      target: { name: 'typeObjet', value: '' }
                    } as React.ChangeEvent<HTMLSelectElement>
                    handleFormChange(event)
                  }
                }}
                onFocus={() => {
                  setIsTypeObjetDropdownOpen(true)
                  setSearchTypeObjet(formData.typeObjet || '')
                }}
                onClick={() => {
                  setIsTypeObjetDropdownOpen(true)
                  setSearchTypeObjet(formData.typeObjet || '')
                }}
                placeholder="Rechercher un type d'objet..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                required
              />
              {formData.typeObjet && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTypeObjetSelect('')
                    setSearchTypeObjet('')
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  ×
                </button>
              )}
            </div>

            {isTypeObjetDropdownOpen && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                <div className="p-2 border-b border-slate-200 sticky top-0 bg-white">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchTypeObjet}
                      onChange={(e) => setSearchTypeObjet(e.target.value)}
                      placeholder="Rechercher un type d'objet..."
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="py-1">
                  {filteredTypesObjets.length > 0 ? (
                    (() => {
                      const grouped = filteredTypesObjets.reduce((acc, type) => {
                        if (!acc[type.category]) {
                          acc[type.category] = []
                        }
                        acc[type.category].push(type)
                        return acc
                      }, {} as Record<string, typeof typesObjets>)

                      return Object.entries(grouped).map(([category, types]) => (
                        <div key={category}>
                          <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 bg-slate-50 uppercase">
                            {category}
                          </div>
                          {types.map((type) => (
                            <div
                              key={type.value}
                              className={`px-4 py-2 cursor-pointer hover:bg-orange-50 transition-colors ${
                                formData.typeObjet === type.value ? 'bg-orange-100 text-orange-700 font-medium' : 'text-slate-700'
                              }`}
                              onClick={() => handleTypeObjetSelect(type.value)}
                            >
                              {type.value}
                            </div>
                          ))}
                        </div>
                      ))
                    })()
                  ) : (
                    <div className="px-3 py-2 text-slate-500 text-center text-sm">
                      Aucun type d'objet trouvé
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Champs spécifiques selon le type d'objet sélectionné */}
          {formData.typeObjet && (
            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Détails spécifiques de l'objet</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderSpecificFields()}
                
                {/* Valeur estimée */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Valeur estimée</label>
                  <Input
                    type="text"
                    name="valeurEstimee"
                    value={formData.valeurEstimee}
                    onChange={handleFormChange}
                    placeholder="Ex: 500 000 FCFA"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Informations du déclarant (toujours affiché si un type est sélectionné) */}
      {isContainer !== null && (
        <>
          <div className="border-b border-slate-200 pb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Informations du déclarant</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nom *</label>
                <Input
                  type="text"
                  name="declarantNom"
                  value={formData.declarantNom}
                  onChange={handleFormChange}
                  placeholder="Nom de famille"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Prénom *</label>
                <Input
                  type="text"
                  name="declarantPrenom"
                  value={formData.declarantPrenom}
                  onChange={handleFormChange}
                  placeholder="Prénom(s)"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone *</label>
                <Input
                  type="tel"
                  name="declarantTelephone"
                  value={formData.declarantTelephone}
                  onChange={handleFormChange}
                  placeholder="+225 XX XX XX XX XX"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <Input
                  type="email"
                  name="declarantEmail"
                  value={formData.declarantEmail}
                  onChange={handleFormChange}
                  placeholder="email@exemple.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">N° CNI</label>
                <Input
                  type="text"
                  name="declarantCni"
                  value={formData.declarantCni}
                  onChange={handleFormChange}
                  placeholder="Numéro de carte d'identité"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Adresse</label>
                <Input
                  type="text"
                  name="declarantAdresse"
                  value={formData.declarantAdresse}
                  onChange={handleFormChange}
                  placeholder="Adresse de résidence"
                />
              </div>
            </div>
          </div>

          {/* Lieu et date */}
          <div className="border-b border-slate-200 pb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Lieu et date de perte</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Lieu de perte *</label>
                <Input
                  type="text"
                  name="lieuPerte"
                  value={formData.lieuPerte}
                  onChange={handleFormChange}
                  placeholder="Ex: Autoroute du Nord..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date de perte *</label>
                <Input
                  type="date"
                  name="datePerte"
                  value={formData.datePerte}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Heure</label>
                <Input
                  type="time"
                  name="heurePerte"
                  value={formData.heurePerte}
                  onChange={handleFormChange}
                />
              </div>
            </div>
          </div>

          {/* Description détaillée - Toujours visible */}
          <div className="border-b border-slate-200 pb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Description détaillée <span className="text-red-500">*</span></h3>
            </div>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Décrivez l'objet en détail (numéro de série, signes distinctifs, contenu...)"
              rows={4}
              required
            />
          </div>

          {/* Observations */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Observations</h3>
            </div>
            <Textarea
              name="observations"
              value={formData.observations}
              onChange={handleFormChange}
              placeholder="Observations supplémentaires (optionnel)"
              rows={4}
            />
          </div>
        </>
      )}
    </div>
  )

  // Modal Correspondances Trouvées
  const matchModal = (
    <Modal isOpen={isMatchModalOpen} onClose={() => setIsMatchModalOpen(false)} className="max-w-5xl w-full">
      <ModalHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <ModalTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Correspondances Trouvées !
            </ModalTitle>
            <p className="text-sm text-slate-600 mt-1">Des objets retrouvés correspondent à votre déclaration</p>
          </div>
        </div>
        <ModalClose onClick={() => setIsMatchModalOpen(false)} />
      </ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          {/* Alerte info */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <strong>Nous avons trouvé {matchedObjects.length} objet(s) correspondant à votre déclaration.</strong>
                <p className="mt-1">Vérifiez si l'un de ces objets est le vôtre avant de continuer.</p>
              </div>
            </div>
          </div>

          {/* Liste des correspondances */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {matchedObjects.map((match, index) => (
              <div key={match.id} className="p-4 border-2 border-green-200 rounded-lg bg-green-50 hover:border-green-400 transition-colors">
                {/* En-tête avec score */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-lg text-slate-900">{match.typeObjet}</div>
                      <div className="text-sm text-slate-600">N° {match.numero}</div>
                      {match.dateRecuperation && (
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Retrouvé le {new Date(match.dateRecuperation).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold">
                      {match.matchScore}% match
                    </div>
                    {match.statut && (
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        match.statut === 'DISPONIBLE' ? 'bg-green-100 text-green-700' :
                        match.statut === 'EN_RESTITUTION' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {match.statut}
                      </div>
                    )}
                  </div>
                </div>

                {/* Informations principales en grille */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="p-3 bg-white rounded-lg">
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Champ correspondant
                    </div>
                    <div className="font-semibold text-green-700">{match.matchedField}</div>
                    {match.matchedValue && (
                      <div className="text-xs text-slate-500 mt-1">
                        Valeur: <span className="font-mono text-green-700">{match.matchedValue}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Type de correspondance</div>
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      {match.matchedIn === 'direct' ? (
                        <>
                          <Target className="w-4 h-4 text-green-600" />
                          Objet direct
                        </>
                      ) : (
                        <>
                          <Package className="w-4 h-4 text-blue-600" />
                          Dans un contenant
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Détails de l'objet */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {match.couleur && (
                    <div className="p-2 bg-white rounded-lg">
                      <div className="text-xs text-slate-500 mb-1">Couleur</div>
                      <div className="text-sm font-medium text-slate-900">{match.couleur}</div>
                    </div>
                  )}
                  {match.marque && (
                    <div className="p-2 bg-white rounded-lg">
                      <div className="text-xs text-slate-500 mb-1">Marque</div>
                      <div className="text-sm font-medium text-slate-900">{match.marque}</div>
                    </div>
                  )}
                </div>

                {/* Lieu de récupération */}
                {match.lieuRecuperation && (
                  <div className="p-3 bg-white rounded-lg mb-3">
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Lieu de récupération
                    </div>
                    <div className="text-sm font-medium text-slate-900">{match.lieuRecuperation}</div>
                  </div>
                )}

                {/* Commissariat */}
                {match.commissariat && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                    <div className="text-xs text-blue-700 font-semibold mb-2 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Actuellement au commissariat
                    </div>
                    <div className="font-semibold text-slate-900">
                      {match.commissariat.nom}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      {match.commissariat.adresse && <div>{match.commissariat.adresse}</div>}
                      {match.commissariat.ville && <div>{match.commissariat.ville}</div>}
                      {match.commissariat.telephone && (
                        <div className="flex items-center gap-1 mt-1 text-blue-700">
                          <User className="w-3 h-3" />
                          {match.commissariat.telephone}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="p-3 bg-white rounded-lg mb-3">
                  <div className="text-xs text-slate-500 mb-1">Description</div>
                  <div className="text-sm text-slate-700">{match.description}</div>
                </div>

                {/* Objet dans inventaire */}
                {match.inventoryItem && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                    <div className="text-xs text-blue-700 font-semibold mb-2 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Objet trouvé dans l'inventaire du contenant :
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <div className="text-xs text-slate-500">Nom</div>
                        <div className="text-sm font-medium">{match.inventoryItem.name}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Couleur</div>
                        <div className="text-sm font-medium">{match.inventoryItem.color}</div>
                      </div>
                      {match.inventoryItem.brand && (
                        <div>
                          <div className="text-xs text-slate-500">Marque</div>
                          <div className="text-sm font-medium">{match.inventoryItem.brand}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Déclarant */}
                {match.declarant && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-3">
                    <div className="text-xs text-amber-700 font-semibold mb-2 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Déclarant (personne qui a rapporté l'objet)
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {match.declarant.nom && (
                        <div>
                          <span className="text-slate-500">Nom:</span> <span className="font-medium">{match.declarant.nom} {match.declarant.prenom}</span>
                        </div>
                      )}
                      {match.declarant.telephone && (
                        <div className="text-blue-700 font-medium">
                          📞 {match.declarant.telephone}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => window.open(`/gestion/objets-retrouves/${match.id}`, '_blank')}
                    variant="secondary"
                    className="flex-1 text-sm flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Voir les détails
                  </Button>
                  <Button
                    onClick={() => {
                      // TODO: Implémenter création lien restitution
                      Swal.fire({
                        title: 'Fonctionnalité à venir',
                        text: 'La création de lien de restitution sera bientôt disponible',
                        icon: 'info',
                        confirmButtonColor: '#ea580c'
                      })
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-sm flex items-center justify-center gap-2"
                  >
                    <Link className="w-4 h-4" />
                    Créer lien restitution
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          onClick={() => setIsMatchModalOpen(false)}
          variant="secondary"
        >
          Annuler
        </Button>
        <Button
          onClick={async () => {
            setIsMatchModalOpen(false)
            const objetPerduId = await createObjetPerdu()
            if (objetPerduId) {
              await Swal.fire({
                title: 'Déclaration créée !',
                text: 'L\'objet perdu a été enregistré malgré les correspondances trouvées.',
                icon: 'success',
                confirmButtonColor: '#ea580c'
              })
              if (onClose) onClose()
              else router.push(`/gestion/objets-perdus/${objetPerduId}`)
            }
          }}
          className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          Enregistrer quand même
        </Button>
      </ModalFooter>
    </Modal>
  )

  // Modal Ajouter Objet
  const itemModal = (
    <Modal isOpen={isItemModalOpen} onClose={closeItemModal}  className="max-w-[60vw] w-full">
      <ModalHeader>
        <ModalTitle>{editingItemId ? 'Modifier l\'objet' : 'Ajouter un objet'}</ModalTitle>
        <ModalClose onClick={closeItemModal} />
      </ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          {/* Catégories */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Catégorie d'objet *</label>
            <div className="grid grid-cols-4 gap-2">
              {itemCategories.map((cat) => {
                const IconComponent = cat.icon
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => selectItemCategory(cat.value, cat.value)}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      currentItem.category === cat.value
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex justify-center mb-1">
                      <IconComponent className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-xs font-medium">{cat.label}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Champs de base */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nom *</label>
              <Input
                type="text"
                name="name"
                value={currentItem.name}
                onChange={handleItemChange}
                placeholder="Ex: IPHONE 13 PRO"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Couleur *</label>
              <Input
                type="text"
                name="color"
                value={currentItem.color}
                onChange={handleItemChange}
                placeholder="Ex: NOIR"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Marque</label>
              <Input
                type="text"
                name="brand"
                value={currentItem.brand}
                onChange={handleItemChange}
                placeholder="Ex: APPLE"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">N° Série</label>
              <Input
                type="text"
                name="serial"
                value={currentItem.serial}
                onChange={handleItemChange}
                placeholder="IMEI, N° série"
              />
            </div>
          </div>

          {/* Champs spécifiques identité */}
          {(currentItem.category === 'identite' || currentItem.category === 'papiers') && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-red-700 font-semibold">
                <IdCard className="w-5 h-5" />
                <span>Pièce d'identité détectée</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type *</label>
                  <Select
                    name="identityType"
                    value={currentItem.identityType}
                    onChange={handleItemChange}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="CNI">CNI</option>
                    <option value="PASSEPORT">Passeport</option>
                    <option value="PERMIS">Permis de conduire</option>
                    <option value="CARTE_SEJOUR">Carte de séjour</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Numéro *</label>
                  <Input
                    type="text"
                    name="identityNumber"
                    value={currentItem.identityNumber}
                    onChange={handleItemChange}
                    placeholder="N° document"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nom sur le document</label>
                  <Input
                    type="text"
                    name="identityName"
                    value={currentItem.identityName}
                    onChange={handleItemChange}
                    placeholder="NOM COMPLET"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Champs spécifiques carte */}
          {currentItem.category === 'carte' && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-yellow-700 font-semibold">
                <CreditCard className="w-5 h-5" />
                <span>Carte bancaire/Crédit</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type *</label>
                  <Select
                    name="cardType"
                    value={currentItem.cardType}
                    onChange={handleItemChange}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="VISA">Visa</option>
                    <option value="MASTERCARD">Mastercard</option>
                    <option value="DEBIT">Carte de débit</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Banque</label>
                  <Input
                    type="text"
                    name="cardBank"
                    value={currentItem.cardBank}
                    onChange={handleItemChange}
                    placeholder="SGBCI, BICICI..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">4 derniers chiffres</label>
                  <Input
                    type="text"
                    name="cardLast4"
                    value={currentItem.cardLast4}
                    onChange={handleItemChange}
                    placeholder="XXXX"
                    maxLength={4}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <Textarea
              name="description"
              value={currentItem.description}
              onChange={handleItemChange}
              placeholder="Signes particuliers, état, détails..."
              rows={3}
            />
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button onClick={closeItemModal} variant="secondary">
          Annuler
        </Button>
        <Button onClick={addOrUpdateItem} className="bg-purple-600 hover:bg-purple-700">
          {editingItemId ? 'Mettre à jour' : 'Ajouter'}
        </Button>
      </ModalFooter>
    </Modal>
  )

  if (isModalMode) {
    return (
      <>
        <Modal isOpen={isOpen || false} onClose={onClose || (() => {})} className="max-w-[60vw] w-full">
          <ModalHeader>
            <ModalTitle>Nouvelle Déclaration d'Objet Perdu</ModalTitle>
            <ModalClose onClick={onClose} />
          </ModalHeader>
          <ModalBody>
            {formContent}
          </ModalBody>
          <ModalFooter>
            <Button 
              onClick={onClose} 
              variant="secondary"
              disabled={isSubmitting || isCheckingMatches}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || isCheckingMatches} 
              className="bg-orange-600 hover:bg-orange-700 text-white min-w-[180px]"
            >
              {isCheckingMatches ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Vérification...
                </>
              ) : isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création en cours...
                </>
              ) : (
                'Créer la déclaration'
              )}
            </Button>
          </ModalFooter>
        </Modal>
        {matchModal}
        {itemModal}
      </>
    )
  }

  return (
    <div className="min-h-screen space-y-6 pb-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="secondary"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <PackageSearch className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Nouvelle Déclaration d'Objet Perdu</h1>
            <p className="text-slate-600 text-sm">Remplissez le formulaire pour déclarer un objet perdu</p>
          </div>
        </div>
      </div>

      <Card className="bg-white border border-gray-200">
        <CardBody className="p-6">
          {formContent}
          
          {isContainer !== null && (
            <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
              <Button 
                onClick={() => router.back()} 
                variant="secondary"
                disabled={isSubmitting || isCheckingMatches}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || isCheckingMatches} 
                className="bg-orange-600 hover:bg-orange-700 text-white min-w-[180px]"
              >
                {isCheckingMatches ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Vérification...
                  </>
                ) : isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  'Créer la déclaration'
                )}
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
      
      {matchModal}
      {itemModal}
    </div>
  )
}