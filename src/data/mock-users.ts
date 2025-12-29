// src/data/mock-users.ts

import { User } from '@/lib/types/auth';
import bcrypt from 'bcryptjs';

// Pour le développement, tous les mots de passe sont : "Police2025"
const defaultPasswordHash = bcrypt.hashSync('Police2025', 10);

export const mockUsers: (User & { passwordHash: string })[] = [
  // Administrateurs Nationaux
  {
    id: '1',
    matricule: 'admin@police.ci',
    nom: 'KOUASSI',
    prenom: 'Jean-Pierre',
    email: 'jp.kouassi@police.ci',
    role: 'admin_national',
    grade: 'Commissaire Divisionnaire',
    telephone: '+225 0749123456',
    statut: 'actif',
    passwordHash: defaultPasswordHash,
  },
  {
    id: '2',
    matricule: 'ADM002',
    nom: 'DIALLO',
    prenom: 'Fatou',
    email: 'f.diallo@police.ci',
    role: 'admin_national',
    grade: 'Commissaire Principal',
    telephone: '+225 0707234567',
    statut: 'actif',
    passwordHash: defaultPasswordHash,
  },

  // Chefs de Commissariats
  {
    id: '3',
    matricule: 'commissaire@police.ci',
    nom: 'KONE',
    prenom: 'Mamadou',
    email: 'm.kone@police.ci',
    role: 'chef_commissariat',
    grade: 'Commissaire',
    commissariat: 'Commissariat Central Plateau',
    commissariatId: 'COMM_001',
    telephone: '+225 0708345678',
    statut: 'actif',
    passwordHash: defaultPasswordHash,
  },
  {
    id: '4',
    matricule: 'COM002',
    nom: 'YAO',
    prenom: 'Kouadio',
    email: 'k.yao@police.ci',
    role: 'chef_commissariat',
    grade: 'Commissaire',
    commissariat: 'Commissariat Cocody',
    commissariatId: 'COMM_002',
    telephone: '+225 0749456789',
    statut: 'actif',
    passwordHash: defaultPasswordHash,
  },
  {
    id: '5',
    matricule: 'COM003',
    nom: 'BAMBA',
    prenom: 'Aminata',
    email: 'a.bamba@police.ci',
    role: 'chef_commissariat',
    grade: 'Commissaire',
    commissariat: 'Commissariat Yopougon',
    commissariatId: 'COMM_003',
    telephone: '+225 0707567890',
    statut: 'actif',
    passwordHash: defaultPasswordHash,
  },

  // Superviseurs
  {
    id: '6',
    matricule: 'SUP001',
    nom: 'TRAORE',
    prenom: 'Ibrahim',
    email: 'i.traore@police.ci',
    role: 'superviseur',
    grade: 'Commandant',
    commissariat: 'Commissariat Central Plateau',
    commissariatId: 'COMM_001',
    telephone: '+225 0708678901',
    statut: 'actif',
    passwordHash: defaultPasswordHash,
  },
  {
    id: '7',
    matricule: 'SUP002',
    nom: 'OUATTARA',
    prenom: 'Mariam',
    email: 'm.ouattara@police.ci',
    role: 'superviseur',
    grade: 'Commandant',
    commissariat: 'Commissariat Cocody',
    commissariatId: 'COMM_002',
    telephone: '+225 0749789012',
    statut: 'actif',
    passwordHash: defaultPasswordHash,
  },

  // Agents de terrain
  {
    id: '8',
    matricule: 'AGT001',
    nom: 'COULIBALY',
    prenom: 'Seydou',
    email: 's.coulibaly@police.ci',
    role: 'agent',
    grade: 'Brigadier-Chef',
    commissariat: 'Commissariat Central Plateau',
    commissariatId: 'COMM_001',
    telephone: '+225 0707890123',
    statut: 'actif',
    passwordHash: defaultPasswordHash,
  },
  {
    id: '9',
    matricule: 'AGT002',
    nom: 'GBAGBO',
    prenom: 'Michel',
    email: 'm.gbagbo@police.ci',
    role: 'agent',
    grade: 'Brigadier',
    commissariat: 'Commissariat Cocody',
    commissariatId: 'COMM_002',
    telephone: '+225 0708901234',
    statut: 'actif',
    passwordHash: defaultPasswordHash,
  },
  {
    id: '10',
    matricule: 'AGT003',
    nom: 'SORO',
    prenom: 'Adama',
    email: 'a.soro@police.ci',
    role: 'agent',
    grade: 'Gardien de la Paix',
    commissariat: 'Commissariat Yopougon',
    commissariatId: 'COMM_003',
    telephone: '+225 0749012345',
    statut: 'actif',
    passwordHash: defaultPasswordHash,
  },
  {
    id: '11',
    matricule: 'AGT004',
    nom: 'DROGBA',
    prenom: 'Didier',
    email: 'd.drogba@police.ci',
    role: 'agent',
    grade: 'Gardien de la Paix',
    commissariat: 'Commissariat Marcory',
    commissariatId: 'COMM_004',
    telephone: '+225 0707123456',
    statut: 'actif',
    passwordHash: defaultPasswordHash,
  },
  {
    id: '12',
    matricule: 'AGT005',
    nom: 'TOURE',
    prenom: 'Yaya',
    email: 'y.toure@police.ci',
    role: 'agent',
    grade: 'Brigadier',
    commissariat: 'Commissariat Abobo',
    commissariatId: 'COMM_005',
    telephone: '+225 0708234567',
    statut: 'actif',
    passwordHash: defaultPasswordHash,
  }
];

// Fonction helper pour récupérer un utilisateur par matricule
export const getUserByMatricule = (matricule: string) => {
  return mockUsers.find(user => user.matricule === matricule);
};

// Fonction helper pour vérifier les credentials
export const verifyCredentials = async (matricule: string, password: string) => {
  const user = getUserByMatricule(matricule);
  if (!user) return null;
  
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;
  
  // Retourner l'utilisateur sans le hash du mot de passe
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Informations pour la page de login
export const loginInfo = {
  admin: {
    matricule: 'admin@police.ci',
    password: 'Admin123!@#',
    description: 'Accès Administration Nationale (ADMIN_PRINCIPAL)'
  },
  chef: {
    matricule: 'commissaire@police.ci',
    password: 'Comm123!@#',
    description: 'Accès Chef de Commissariat (COMMISSAIRE)'
  },
  agent1: {
    matricule: 'agent1@police.ci',
    password: 'Agent123!@#',
    description: 'Accès Agent de terrain (AGENT)'
  },
  agent2: {
    matricule: 'agent2@police.ci',
    password: 'Agent123!@#',
    description: 'Accès Agent de terrain (AGENT)'
  }
};