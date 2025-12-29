'use client';

import { useEffect } from 'react';

export default function InitialLoader() {
  useEffect(() => {
    // Ajouter la classe loaded après le chargement
    const timer = setTimeout(() => {
      document.body.classList.add('loaded');
    }, 2000); // Durée du fond bleu (ajustez selon vos besoins)

    return () => clearTimeout(timer);
  }, []);

  return null;
}