// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Routes publiques - laisser passer sans vérification
  const publicRoutes = [
    '/auth/login',
    '/auth/register',
    '/unauthorized',
    '/dev-login', // Page de développement
    '/documentation', // Documentation accessible à tous
  ];
  
  // Si accès à la racine, vérifier l'authentification
  if (pathname === '/') {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      // Pas de token, rediriger vers la page de connexion
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    // Token présent, laisser passer (la page d'accueil gérera la redirection)
    return NextResponse.next();
  }
  
  // Vérifier si c'est une route publique
  if (publicRoutes.includes(pathname) || 
      pathname.startsWith('/auth/login') || 
      pathname.startsWith('/auth/register') || 
      pathname.startsWith('/dev-login') ||
      pathname.startsWith('/documentation')) {
    return NextResponse.next();
  }
  
  // Routes protégées
  const isProtectedRoute = 
    pathname.startsWith('/admin') ||
    pathname.startsWith('/gestion') ||
    pathname.startsWith('/auth/logout');
  
  if (isProtectedRoute) {
    // Récupérer le token depuis les cookies
    const token = request.cookies.get('auth_token')?.value;
    
    // Si pas de token, rediriger vers login
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Récupérer le rôle utilisateur depuis les cookies
    const userRole = request.cookies.get('user_role')?.value;
    const roleUpper = userRole ? userRole.toUpperCase() : '';
    
    if (userRole) {
      // Vérifier les permissions selon la route
      if (pathname.startsWith('/admin')) {
        if (roleUpper !== 'ADMIN' && roleUpper !== 'ADMIN_PRINCIPAL') {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }
      
      if (pathname.startsWith('/gestion')) {
        if (roleUpper !== 'COMMISSAIRE' && roleUpper !== 'AGENT' && roleUpper !== 'ADMIN_PRINCIPAL') {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }
      
      // Pour /auth/logout, tous les utilisateurs authentifiés peuvent y accéder
    } else {
      // Pas de rôle trouvé, rediriger vers login
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // Pour toutes les autres routes, laisser passer
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/gestion/:path*',
    '/auth/logout/:path*',
    '/auth/login',
    '/auth/register',
    '/',
    '/unauthorized',
    '/dev-login',
    '/documentation',
  ],
};
