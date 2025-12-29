// src/app/api/auth/logout/route.ts

import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: 'Déconnexion réussie' },
    { status: 200 }
  );

  // Supprimer le cookie d'authentification
  response.cookies.delete('auth-token');

  return response;
}