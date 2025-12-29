# Système d'Aide Contextuel

## Vue d'ensemble

Le système d'aide contextuel fournit une assistance à l'utilisateur sur chaque rubrique de l'application. Il est automatiquement intégré dans les headers et s'adapte selon la page actuelle.

## Fonctionnalités

- ✅ Bouton d'aide dans les headers (admin et gestion)
- ✅ Contenu d'aide spécifique pour chaque rubrique
- ✅ Modal d'aide avec sections organisées
- ✅ Astuces pratiques pour chaque rubrique
- ✅ Détection automatique de la route actuelle

## Structure des fichiers

```
src/
├── lib/
│   └── help-content.ts          # Configuration du contenu d'aide
└── components/
    └── ui/
        ├── HelpButton.tsx       # Bouton d'aide réutilisable
        └── HelpModal.tsx        # Modal d'affichage de l'aide
```

## Utilisation

### Le bouton d'aide est automatiquement disponible

Le bouton d'aide est déjà intégré dans les headers (`AdminHeader` et `GestionHeader`). Il apparaît automatiquement sur toutes les pages et affiche le contenu d'aide correspondant à la route actuelle.

### Ajouter de l'aide pour une nouvelle rubrique

Pour ajouter du contenu d'aide pour une nouvelle rubrique, modifiez le fichier `src/lib/help-content.ts` :

```typescript
export const helpContent: Record<string, HelpContent> = {
  // ... contenu existant ...
  
  '/votre/nouvelle/route': {
    title: 'Aide - Votre Rubrique',
    description: 'Description de la rubrique et de son utilité.',
    sections: [
      {
        title: 'Section 1',
        content: [
          'Point 1 de la section',
          'Point 2 de la section',
          'Point 3 de la section'
        ]
      },
      {
        title: 'Section 2',
        content: [
          'Autre point d\'information'
        ]
      }
    ],
    tips: [
      '💡 Astuce pratique 1',
      '💡 Astuce pratique 2'
    ]
  }
}
```

### Utiliser le bouton d'aide sur une page spécifique

Si vous voulez ajouter un bouton d'aide flottant sur une page spécifique :

```tsx
import HelpButton from '@/components/ui/HelpButton'

export default function MaPage() {
  return (
    <div>
      {/* Votre contenu */}
      
      {/* Bouton d'aide flottant */}
      <HelpButton variant="floating" />
    </div>
  )
}
```

## Format du contenu d'aide

Chaque entrée d'aide doit suivre cette structure :

```typescript
interface HelpContent {
  title: string                    // Titre de la modal d'aide
  description: string              // Description générale de la rubrique
  sections: {                      // Sections d'information
    title: string                   // Titre de la section
    content: string[]               // Liste des points d'information
  }[]
  tips?: string[]                  // Astuces pratiques (optionnel)
}
```

## Détection automatique des routes

Le système détecte automatiquement la route actuelle et affiche le contenu d'aide correspondant. Si aucune correspondance exacte n'est trouvée, il cherche une correspondance partielle (utile pour les routes dynamiques comme `/admin/agents/[id]`).

## Personnalisation

### Styles du bouton

Le bouton d'aide dans le header utilise les styles par défaut. Pour personnaliser :

```tsx
<HelpButton className="votre-classe-css" />
```

### Variantes

- `default` : Bouton dans le header (par défaut)
- `floating` : Bouton flottant en bas à droite de l'écran

## Exemples de contenu d'aide

Consultez le fichier `src/lib/help-content.ts` pour voir des exemples complets de contenu d'aide pour chaque rubrique.

## Notes importantes

- Le bouton d'aide n'apparaît que si du contenu d'aide existe pour la route actuelle
- Le contenu d'aide est statique (pas de chargement dynamique)
- Les routes sont normalisées (suppression des trailing slashes)
- Le système fonctionne avec les routes dynamiques de Next.js

