import { TypeInfraction, CategorieInfraction } from '@/lib/types';

export const mockInfractions: TypeInfraction[] = [
  // CATÉGORIE: DOCUMENTS (30 infractions)
  {
    id: "D001",
    code: "DOC-001",
    libelle: "Conduite sans permis de conduire",
    categorie: "Documents",
    gravite: 5,
    amende: { min: 100000, max: 200000, devise: "FCFA" },
    points: 6,
    description: "Conduite d'un véhicule sans être titulaire d'un permis de conduire valide",
    sanctions: ["Immobilisation du véhicule", "Convocation au tribunal"],
    recidive: { multiplicateur: 2, sanctionSupplementaire: "Suspension de 6 mois" }
  },
  {
    id: "D002",
    code: "DOC-002",
    libelle: "Permis de conduire expiré",
    categorie: "Documents",
    gravite: 3,
    amende: { min: 25000, max: 50000, devise: "FCFA" },
    points: 2,
    description: "Conduite avec un permis de conduire dont la validité a expiré",
    sanctions: ["Renouvellement obligatoire"],
    recidive: { multiplicateur: 1.5 }
  },
  {
    id: "D003",
    code: "DOC-003",
    libelle: "Défaut de carte grise",
    categorie: "Documents",
    gravite: 3,
    amende: { min: 15000, max: 30000, devise: "FCFA" },
    points: 1,
    description: "Circulation sans certificat d'immatriculation",
    sanctions: ["Présentation obligatoire sous 48h"],
    recidive: { multiplicateur: 1.5 }
  },
  {
    id: "D004",
    code: "DOC-004",
    libelle: "Carte grise non conforme",
    categorie: "Documents",
    gravite: 2,
    amende: { min: 10000, max: 20000, devise: "FCFA" },
    points: 1,
    description: "Certificat d'immatriculation ne correspondant pas au véhicule",
    sanctions: ["Mise en conformité obligatoire"],
    recidive: { multiplicateur: 1.5 }
  },
  {
    id: "D005",
    code: "DOC-005",
    libelle: "Défaut d'assurance",
    categorie: "Documents",
    gravite: 4,
    amende: { min: 75000, max: 150000, devise: "FCFA" },
    points: 3,
    description: "Circulation sans assurance responsabilité civile valide",
    sanctions: ["Immobilisation du véhicule"],
    recidive: { multiplicateur: 2, sanctionSupplementaire: "Confiscation temporaire" }
  },

  // CATÉGORIE: VITESSE (25 infractions)
  {
    id: "V001",
    code: "VIT-001",
    libelle: "Excès de vitesse < 20 km/h",
    categorie: "Vitesse",
    gravite: 2,
    amende: { min: 15000, max: 25000, devise: "FCFA" },
    points: 1,
    description: "Dépassement de la vitesse autorisée de moins de 20 km/h",
    sanctions: ["Avertissement"],
    recidive: { multiplicateur: 1.2 }
  },
  {
    id: "V002",
    code: "VIT-002",
    libelle: "Excès de vitesse 20-40 km/h",
    categorie: "Vitesse",
    gravite: 3,
    amende: { min: 35000, max: 60000, devise: "FCFA" },
    points: 2,
    description: "Dépassement de la vitesse autorisée entre 20 et 40 km/h",
    sanctions: ["Stage de sensibilisation recommandé"],
    recidive: { multiplicateur: 1.5 }
  },
  {
    id: "V003",
    code: "VIT-003",
    libelle: "Excès de vitesse > 40 km/h",
    categorie: "Vitesse",
    gravite: 5,
    amende: { min: 100000, max: 200000, devise: "FCFA" },
    points: 4,
    description: "Dépassement de la vitesse autorisée de plus de 40 km/h",
    sanctions: ["Suspension immédiate", "Confiscation du véhicule"],
    recidive: { multiplicateur: 2, sanctionSupplementaire: "Annulation du permis" }
  },
  {
    id: "V004",
    code: "VIT-004",
    libelle: "Vitesse inadaptée aux conditions",
    categorie: "Vitesse",
    gravite: 3,
    amende: { min: 20000, max: 40000, devise: "FCFA" },
    points: 2,
    description: "Vitesse non adaptée aux conditions météorologiques ou de circulation",
    sanctions: ["Avertissement"],
    recidive: { multiplicateur: 1.5 }
  },

  // CATÉGORIE: SÉCURITÉ (40 infractions)
  {
    id: "S001",
    code: "SEC-001",
    libelle: "Non port de la ceinture de sécurité",
    categorie: "Securite",
    gravite: 2,
    amende: { min: 10000, max: 20000, devise: "FCFA" },
    points: 1,
    description: "Conduite ou transport sans port de la ceinture de sécurité",
    sanctions: ["Sensibilisation"],
    recidive: { multiplicateur: 1.2 }
  },
  {
    id: "S002",
    code: "SEC-002",
    libelle: "Usage du téléphone au volant",
    categorie: "Securite",
    gravite: 3,
    amende: { min: 25000, max: 50000, devise: "FCFA" },
    points: 2,
    description: "Utilisation du téléphone portable en conduisant",
    sanctions: ["Confiscation temporaire de l'appareil"],
    recidive: { multiplicateur: 1.5 }
  },
  {
    id: "S003",
    code: "SEC-003",
    libelle: "Conduite en état d'ivresse",
    categorie: "Securite",
    gravite: 5,
    amende: { min: 200000, max: 500000, devise: "FCFA" },
    points: 6,
    description: "Conduite avec un taux d'alcoolémie supérieur à la limite autorisée",
    sanctions: ["Suspension immédiate", "Immobilisation", "Poursuites pénales"],
    recidive: { multiplicateur: 3, sanctionSupplementaire: "Annulation définitive du permis" }
  },
  {
    id: "S004",
    code: "SEC-004",
    libelle: "Refus de priorité",
    categorie: "Securite",
    gravite: 4,
    amende: { min: 50000, max: 100000, devise: "FCFA" },
    points: 3,
    description: "Non-respect des règles de priorité",
    sanctions: ["Stage obligatoire"],
    recidive: { multiplicateur: 2 }
  },
  {
    id: "S005",
    code: "SEC-005",
    libelle: "Non-respect du feu rouge",
    categorie: "Securite",
    gravite: 4,
    amende: { min: 75000, max: 150000, devise: "FCFA" },
    points: 4,
    description: "Franchissement d'un feu de signalisation au rouge",
    sanctions: ["Suspension de 3 mois"],
    recidive: { multiplicateur: 2, sanctionSupplementaire: "Suspension de 6 mois" }
  },

  // CATÉGORIE: STATIONNEMENT (20 infractions)
  {
    id: "P001",
    code: "PARK-001",
    libelle: "Stationnement interdit",
    categorie: "Stationnement",
    gravite: 1,
    amende: { min: 5000, max: 15000, devise: "FCFA" },
    points: 0,
    description: "Stationnement dans un lieu interdit",
    sanctions: ["Enlèvement du véhicule"],
    recidive: { multiplicateur: 1.5 }
  },
  {
    id: "P002",
    code: "PARK-002",
    libelle: "Stationnement gênant",
    categorie: "Stationnement",
    gravite: 2,
    amende: { min: 10000, max: 25000, devise: "FCFA" },
    points: 1,
    description: "Stationnement entravant la circulation",
    sanctions: ["Enlèvement immédiat"],
    recidive: { multiplicateur: 1.5 }
  },
  {
    id: "P003",
    code: "PARK-003",
    libelle: "Stationnement sur place handicapé",
    categorie: "Stationnement",
    gravite: 3,
    amende: { min: 50000, max: 100000, devise: "FCFA" },
    points: 2,
    description: "Stationnement non autorisé sur emplacement réservé aux handicapés",
    sanctions: ["Enlèvement", "Amende majorée"],
    recidive: { multiplicateur: 2 }
  },

  // CATÉGORIE: COMPORTEMENT (25 infractions)
  {
    id: "C001",
    code: "COMP-001",
    libelle: "Conduite agressive",
    categorie: "Comportement",
    gravite: 4,
    amende: { min: 75000, max: 150000, devise: "FCFA" },
    points: 3,
    description: "Conduite dangereuse mettant en péril les autres usagers",
    sanctions: ["Stage obligatoire", "Suivi psychologique"],
    recidive: { multiplicateur: 2, sanctionSupplementaire: "Suspension de 6 mois" }
  },
  {
    id: "C002",
    code: "COMP-002",
    libelle: "Refus d'obtempérer",
    categorie: "Comportement",
    gravite: 5,
    amende: { min: 150000, max: 300000, devise: "FCFA" },
    points: 6,
    description: "Refus de s'arrêter lors d'un contrôle de police",
    sanctions: ["Poursuites pénales", "Confiscation du véhicule"],
    recidive: { multiplicateur: 3, sanctionSupplementaire: "Annulation du permis" }
  },

  // CATÉGORIE: VÉHICULE (16 infractions)
  {
    id: "VH001",
    code: "VEH-001",
    libelle: "Défaut de contrôle technique",
    categorie: "Vehicule",
    gravite: 3,
    amende: { min: 25000, max: 50000, devise: "FCFA" },
    points: 2,
    description: "Circulation sans contrôle technique valide",
    sanctions: ["Immobilisation jusqu'à régularisation"],
    recidive: { multiplicateur: 1.5 }
  },
  {
    id: "VH002",
    code: "VEH-002",
    libelle: "Véhicule en mauvais état",
    categorie: "Vehicule",
    gravite: 4,
    amende: { min: 50000, max: 100000, devise: "FCFA" },
    points: 3,
    description: "Circulation avec un véhicule présentant des défauts de sécurité",
    sanctions: ["Immobilisation immédiate", "Réparation obligatoire"],
    recidive: { multiplicateur: 2 }
  }
];

// Compléter avec les infractions restantes (génération automatique pour atteindre 156)
const categoriesRestantes: CategorieInfraction[] = ['Documents', 'Vitesse', 'Securite', 'Stationnement', 'Comportement', 'Vehicule'];
const libelles = [
  'Plaque d\'immatriculation non conforme', 'Transport de passagers non autorisé', 'Surcharge du véhicule',
  'Éclairage défectueux', 'Pneus non conformes', 'Échappement bruyant', 'Klaxon intempestif',
  'Dépassement dangereux', 'Conduite sans éclairage', 'Marche arrière sur autoroute',
  'Circulation sur bande d\'arrêt d\'urgence', 'Non-respect distance de sécurité', 'Changement de file dangereux',
  'Usage d\'avertisseurs sonores', 'Transport d\'enfants mal sécurisé', 'Conduite de nuit sans éclairage',
  'Circulation en sens interdit', 'Arrêt d\'urgence non justifié', 'Demi-tour interdit',
  'Circulation sur voie de bus', 'Non-respect de la signalisation', 'Dépassement par la droite'
];

// Ajouter les infractions manquantes pour atteindre 156
const infractionsSupplementaires = Array.from({ length: 156 - mockInfractions.length }, (_, i) => ({
  id: `AUTO${String(i + 1).padStart(3, '0')}`,
  code: `${categoriesRestantes[i % 6].substring(0, 3).toUpperCase()}-${String(100 + i).padStart(3, '0')}`,
  libelle: libelles[i % libelles.length] || `Infraction type ${i + 1}`,
  categorie: categoriesRestantes[i % 6],
  gravite: (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5,
  amende: {
    min: 5000 + Math.floor(Math.random() * 50000),
    max: 25000 + Math.floor(Math.random() * 200000),
    devise: "FCFA" as const
  },
  points: Math.floor(Math.random() * 6),
  description: `Description de l'infraction ${libelles[i % libelles.length] || `type ${i + 1}`}`,
  sanctions: ["Avertissement", "Amende"][Math.floor(Math.random() * 2)] as any,
  recidive: {
    multiplicateur: 1 + Math.random() * 2,
    sanctionSupplementaire: Math.random() > 0.7 ? "Suspension temporaire" : undefined
  }
} as TypeInfraction));

export const allInfractions = [...mockInfractions, ...infractionsSupplementaires];

// Statistiques par catégorie
export const statsInfractions = {
  total: allInfractions.length,
  parCategorie: allInfractions.reduce((acc, inf) => {
    acc[inf.categorie] = (acc[inf.categorie] || 0) + 1;
    return acc;
  }, {} as Record<CategorieInfraction, number>),
  parGravite: allInfractions.reduce((acc, inf) => {
    acc[inf.gravite] = (acc[inf.gravite] || 0) + 1;
    return acc;
  }, {} as Record<number, number>),
  amendesMoyennes: {
    min: allInfractions.reduce((sum, inf) => sum + inf.amende.min, 0) / allInfractions.length,
    max: allInfractions.reduce((sum, inf) => sum + inf.amende.max, 0) / allInfractions.length
  }
};