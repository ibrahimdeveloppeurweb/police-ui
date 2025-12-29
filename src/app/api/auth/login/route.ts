// src/app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials } from '@/data/mock-users';
import { JWTPayload } from '@/lib/types/auth';

export async function POST(request: NextRequest) {
  try {
    const { matricule, password } = await request.json();

    // Valider les entrées
    if (!matricule || !password) {
      return NextResponse.json(
        { success: false, message: 'Matricule et mot de passe requis' },
        { status: 400 }
      );
    }

    // Vérifier les credentials
    const user = await verifyCredentials(matricule, password);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Matricule ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Vérifier le statut de l'utilisateur
    if (user.statut !== 'actif') {
      return NextResponse.json(
        { success: false, message: 'Votre compte est inactif ou suspendu' },
        { status: 403 }
      );
    }

    // Créer le JWT payload
    const payload: JWTPayload = {
      userId: user.id,
      matricule: user.matricule,
      role: user.role,
      commissariatId: user.commissariatId,
    };



    // Créer la réponse avec le cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        matricule: user.matricule,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        commissariat: user.commissariat,
      },
      message: 'Connexion réussie',
    });



    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}