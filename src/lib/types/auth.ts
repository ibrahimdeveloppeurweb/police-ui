// src/lib/types/auth.ts

export interface User {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  grade: string;
  commissariat?: string;
  commissariatId?: string;
  telephone: string;
  statut: 'actif' | 'inactif' | 'suspendu';
  derniereConnexion?: Date;
  photoUrl?: string;
}

export type UserRole = 'admin_national' | 'chef_commissariat' | 'agent' | 'superviseur';

export interface LoginCredentials {
  matricule: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface JWTPayload {
  userId: string;
  matricule: string;
  role: UserRole;
  commissariatId?: string;
  exp?: number;
  iat?: number;
}

export interface SessionUser {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  role: UserRole;
  commissariatId?: string;
}