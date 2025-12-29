// Configuration du contenu d'aide pour chaque rubrique
export interface HelpContent {
  title: string
  description: string
  sections: {
    title: string
    content: string[]
  }[]
  tips?: string[]
}

export const helpContent: Record<string, HelpContent> = {
  // ADMIN MODULE
  '/admin/dashboard': {
    title: 'Aide - Dashboard Administration',
    description: 'Le tableau de bord administratif vous donne une vue d\'ensemble de toutes les opérations nationales.',
    sections: [
      {
        title: 'Statistiques principales',
        content: [
          'Les 6 cartes en haut affichent les indicateurs clés : contrôles nationaux, revenus, agents opérationnels, alertes, performance et conformité.',
          'Cliquez sur une carte pour voir plus de détails.',
          'Les pourcentages en vert indiquent une évolution positive par rapport à la période précédente.'
        ]
      },
      {
        title: 'Filtres de période',
        content: [
          'Utilisez les boutons en haut pour filtrer les données par période : Aujourd\'hui, Semaine, Mois, Année ou Tout.',
          'Vous pouvez également sélectionner une période personnalisée avec les champs Date début et Date fin.',
          'Tous les graphiques et statistiques se mettent à jour automatiquement selon la période sélectionnée.'
        ]
      },
      {
        title: 'Graphique d\'activité',
        content: [
          'Le graphique montre l\'évolution des contrôles, infractions et amendes sur la période sélectionnée.',
          'Survolez les points du graphique pour voir les valeurs détaillées.',
          'Vous pouvez exporter le graphique en cliquant sur le bouton "Exporter".'
        ]
      },
      {
        title: 'Performance des commissariats',
        content: [
          'Les cartes de performance montrent les 3 meilleurs commissariats.',
          'Les commissariats marqués "TOP PERFORMER" sont les plus performants.',
          'Les commissariats en "ATTENTION" nécessitent un suivi particulier.'
        ]
      }
    ],
    tips: [
      '💡 Utilisez la période "Tout" pour voir les tendances à long terme.',
      '💡 Le centre de crise national permet d\'activer un mode d\'alerte pour les situations critiques.',
      '💡 Les activités critiques récentes sont mises à jour en temps réel.'
    ]
  },
  '/admin/agents': {
    title: 'Aide - Gestion des Agents',
    description: 'Gérez les 342 agents de la police nationale et suivez leur performance.',
    sections: [
      {
        title: 'Liste des agents',
        content: [
          'La liste affiche tous les agents avec leurs informations : nom, matricule, commissariat d\'affectation, statut.',
          'Utilisez la barre de recherche pour trouver un agent spécifique.',
          'Filtrez par commissariat ou statut pour affiner votre recherche.'
        ]
      },
      {
        title: 'Statut des agents',
        content: [
          'EN SERVICE : Agent actuellement en opération.',
          'PAUSE : Agent en pause ou repos.',
          'INDISPONIBLE : Agent absent ou en congé.'
        ]
      },
      {
        title: 'Actions disponibles',
        content: [
          'Cliquez sur un agent pour voir ses détails et statistiques.',
          'Vous pouvez modifier l\'affectation d\'un agent.',
          'Consultez l\'historique des contrôles effectués par chaque agent.'
        ]
      }
    ],
    tips: [
      '💡 Les agents sont répartis sur les 23 commissariats.',
      '💡 Le taux d\'opérationnalité est calculé en temps réel.',
      '💡 Utilisez les filtres pour identifier rapidement les agents disponibles.'
    ]
  },
  '/admin/commissariats': {
    title: 'Aide - Gestion des Commissariats',
    description: 'Supervisez les 23 commissariats et leur performance.',
    sections: [
      {
        title: 'Liste des commissariats',
        content: [
          'La liste affiche les 23 commissariats avec leurs codes, localisations et statistiques.',
          'Les commissariats sont triés par performance par défaut.',
          'Cliquez sur un commissariat pour voir ses détails complets.'
        ]
      },
      {
        title: 'Indicateurs de performance',
        content: [
          'Performance : Pourcentage calculé sur la base des contrôles, infractions et revenus.',
          'Revenus : Montant total des amendes collectées.',
          'Efficacité : Nombre de contrôles par agent et par heure.'
        ]
      },
      {
        title: 'Actions disponibles',
        content: [
          'Consultez les détails d\'un commissariat pour voir ses agents, statistiques et historique.',
          'Contactez directement un commissariat via le bouton "Contacter".',
          'Déployez des renforts si nécessaire.'
        ]
      }
    ],
    tips: [
      '💡 Les commissariats en "ATTENTION" nécessitent un suivi particulier.',
      '💡 Utilisez les filtres pour comparer les performances.',
      '💡 Les top performers sont automatiquement mis en avant.'
    ]
  },
  '/admin/controles': {
    title: 'Aide - Contrôles Nationaux',
    description: 'Consultez tous les contrôles effectués sur le territoire national.',
    sections: [
      {
        title: 'Liste des contrôles',
        content: [
          'La liste affiche tous les contrôles avec leurs détails : date, heure, lieu, agent, véhicule, résultat.',
          'Utilisez les filtres pour rechercher par date, commissariat, agent ou type de contrôle.',
          'Les contrôles sont triés par date (plus récents en premier).'
        ]
      },
      {
        title: 'Types de contrôles',
        content: [
          'Contrôle routier : Vérification des documents et du véhicule.',
          'Contrôle d\'identité : Vérification de l\'identité des personnes.',
          'Contrôle de conformité : Vérification de la conformité du véhicule.'
        ]
      },
      {
        title: 'Résultats des contrôles',
        content: [
          'CONFORME : Véhicule et documents en règle.',
          'INFRACTION : Infraction détectée, amende ou verbalisation nécessaire.',
          'ALERTE : Véhicule volé ou personne recherchée détectée.'
        ]
      }
    ],
    tips: [
      '💡 Les contrôles avec alerte sont automatiquement signalés.',
      '💡 Vous pouvez exporter la liste des contrôles en CSV ou Excel.',
      '💡 Cliquez sur un contrôle pour voir tous les détails et documents associés.'
    ]
  },
  '/admin/amendes': {
    title: 'Aide - Gestion des Amendes',
    description: 'Suivez toutes les amendes émises et leur statut de paiement.',
    sections: [
      {
        title: 'Liste des amendes',
        content: [
          'La liste affiche toutes les amendes avec leur montant, date, statut et véhicule concerné.',
          'Filtrez par statut : En attente, Payée, Impayée, Contestée.',
          'Recherchez par numéro de plaque, montant ou date.'
        ]
      },
      {
        title: 'Statuts des amendes',
        content: [
          'EN ATTENTE : Amende émise, en attente de paiement.',
          'PAYÉE : Amende payée, transaction complétée.',
          'IMPAYÉE : Amende non payée dans les délais.',
          'CONTESTÉE : Amende contestée par le contrevenant.'
        ]
      },
      {
        title: 'Actions disponibles',
        content: [
          'Consultez les détails d\'une amende pour voir tous les documents.',
          'Générez un reçu de paiement.',
          'Suivez les amendes impayées pour relance.'
        ]
      }
    ],
    tips: [
      '💡 Les amendes impayées sont automatiquement signalées après le délai.',
      '💡 Le montant total des revenus est mis à jour en temps réel.',
      '💡 Vous pouvez exporter les données pour comptabilité.'
    ]
  },
  '/admin/securite': {
    title: 'Aide - Centre de Sécurité',
    description: 'Gérez les alertes sécuritaires et les situations critiques.',
    sections: [
      {
        title: 'Alertes actives',
        content: [
          'Les alertes sont classées par niveau : Critique, Importante, Standard.',
          'Les alertes critiques nécessitent une intervention immédiate.',
          'Les alertes incluent : véhicules volés, personnes recherchées, situations d\'urgence.'
        ]
      },
      {
        title: 'Actions d\'urgence',
        content: [
          'Activez le centre de crise pour coordonner les interventions.',
          'Déployez des renforts vers les zones critiques.',
          'Diffusez des alertes à tous les commissariats.'
        ]
      },
      {
        title: 'Suivi des alertes',
        content: [
          'Suivez l\'évolution de chaque alerte en temps réel.',
          'Consultez l\'historique des alertes résolues.',
          'Générez des rapports d\'intervention.'
        ]
      }
    ],
    tips: [
      '💡 Les alertes critiques sont automatiquement notifiées aux responsables.',
      '💡 Le centre de crise permet une coordination nationale.',
      '💡 Les alertes sont synchronisées avec tous les commissariats en temps réel.'
    ]
  },
  '/admin/monitoring': {
    title: 'Aide - Monitoring Temps Réel',
    description: 'Surveillez en temps réel toutes les opérations en cours.',
    sections: [
      {
        title: 'Carte interactive',
        content: [
          'La carte montre la position de tous les agents en service.',
          'Les points de couleur indiquent les différents types d\'opérations.',
          'Cliquez sur un point pour voir les détails de l\'opération.'
        ]
      },
      {
        title: 'Flux d\'activité',
        content: [
          'Le flux montre toutes les activités en temps réel : contrôles, infractions, alertes.',
          'Les activités sont triées par ordre chronologique.',
          'Filtrez par type d\'activité pour affiner l\'affichage.'
        ]
      },
      {
        title: 'Statistiques en direct',
        content: [
          'Les statistiques sont mises à jour toutes les minutes.',
          'Consultez les tendances en temps réel.',
          'Comparez avec les périodes précédentes.'
        ]
      }
    ],
    tips: [
      '💡 Le monitoring est mis à jour automatiquement toutes les 30 secondes.',
      '💡 Utilisez les filtres pour suivre des zones ou agents spécifiques.',
      '💡 Les alertes critiques apparaissent en premier dans le flux.'
    ]
  },
  // GESTION MODULE
  '/gestion/dashboard': {
    title: 'Aide - Dashboard Commissariat',
    description: 'Tableau de bord local de votre commissariat avec toutes les statistiques et activités.',
    sections: [
      {
        title: 'Statistiques du commissariat',
        content: [
          'Les 6 cartes affichent les indicateurs clés de votre commissariat : contrôles, infractions, revenus, agents, performance et alertes.',
          'Les données sont filtrées selon la période sélectionnée en haut de la page.',
          'Les évolutions sont comparées avec la période précédente.'
        ]
      },
      {
        title: 'Graphiques d\'activité',
        content: [
          'Le graphique de ligne montre l\'évolution des contrôles et infractions sur la période.',
          'Le graphique en barres montre la performance de chaque agent.',
          'Survolez les points pour voir les valeurs détaillées.'
        ]
      },
      {
        title: 'Équipe du commissariat',
        content: [
          'Le tableau liste tous les agents de votre commissariat avec leurs statistiques.',
          'Consultez le nombre de contrôles et infractions par agent.',
          'Vérifiez le statut de chaque agent (en service, pause, indisponible).'
        ]
      },
      {
        title: 'Alertes récentes',
        content: [
          'Les alertes critiques et importantes sont affichées en haut de la liste.',
          'Cliquez sur "Intervenir" pour une alerte critique.',
          'Suivez les alertes importantes pour un suivi ultérieur.'
        ]
      }
    ],
    tips: [
      '💡 Utilisez les filtres de période pour analyser différentes périodes.',
      '💡 Les alertes sont mises à jour en temps réel.',
      '💡 Consultez la performance des agents pour optimiser les affectations.'
    ]
  },
  '/gestion/controles': {
    title: 'Aide - Gestion des Contrôles',
    description: 'Effectuez et gérez tous les contrôles routiers de votre commissariat.',
    sections: [
      {
        title: 'Nouveau contrôle',
        content: [
          'Cliquez sur "Nouveau contrôle" pour créer un nouveau contrôle.',
          'Remplissez les informations : date, heure, lieu, agent, véhicule.',
          'Vérifiez les documents : permis, assurance, carte grise, contrôle technique.',
          'Enregistrez le résultat : conforme, infraction, ou alerte.'
        ]
      },
      {
        title: 'Liste des contrôles',
        content: [
          'La liste affiche tous les contrôles effectués par votre commissariat.',
          'Filtrez par date, agent, type ou résultat.',
          'Recherchez par numéro de plaque ou nom du conducteur.'
        ]
      },
      {
        title: 'Vérification des documents',
        content: [
          'Le système vérifie automatiquement la validité des documents.',
          'Les véhicules volés sont automatiquement détectés.',
          'Les personnes recherchées sont signalées immédiatement.'
        ]
      },
      {
        title: 'Actions disponibles',
        content: [
          'Consultez les détails d\'un contrôle pour voir tous les documents.',
          'Générez un procès-verbal si nécessaire.',
          'Archivez les contrôles anciens.'
        ]
      }
    ],
    tips: [
      '💡 Utilisez la recherche par plaque pour vérifier rapidement un véhicule.',
      '💡 Les alertes sont automatiquement envoyées au centre de sécurité.',
      '💡 Enregistrez les contrôles rapidement pour une meilleure traçabilité.'
    ]
  },
  '/gestion/verbalisations': {
    title: 'Aide - Gestion des Verbalisations',
    description: 'Créez et gérez les procès-verbaux (PV) pour les infractions détectées.',
    sections: [
      {
        title: 'Créer un PV',
        content: [
          'Cliquez sur "Nouveau PV" pour créer un procès-verbal.',
          'Sélectionnez le contrôle associé ou créez un nouveau cas.',
          'Remplissez les informations : infraction, montant de l\'amende, détails.',
          'Générez le PV en PDF pour impression.'
        ]
      },
      {
        title: 'Types d\'infractions',
        content: [
          'Infraction au code de la route : excès de vitesse, non-respect des feux, etc.',
          'Document manquant : permis, assurance, carte grise.',
          'Véhicule non conforme : éclairage, pneus, etc.',
          'Conduite dangereuse : état d\'ivresse, téléphone au volant.'
        ]
      },
      {
        title: 'Barème des amendes',
        content: [
          'Le montant de l\'amende dépend du type et de la gravité de l\'infraction.',
          'Consultez le barème des amendes pour connaître les montants.',
          'Les récidivistes peuvent avoir des amendes majorées.'
        ]
      },
      {
        title: 'Génération du PV',
        content: [
          'Le PV est généré automatiquement avec toutes les informations.',
          'Vous pouvez prévisualiser le PV avant impression.',
          'Le PV est enregistré dans le système et envoyé au contrevenant.'
        ]
      }
    ],
    tips: [
      '💡 Vérifiez toujours les informations avant de générer le PV.',
      '💡 Les PV sont automatiquement liés aux amendes.',
      '💡 Consultez l\'historique pour voir tous les PV générés.'
    ]
  },
  '/gestion/infractions': {
    title: 'Aide - Gestion des Infractions',
    description: 'Consultez et gérez les 156 types d\'infractions du système.',
    sections: [
      {
        title: 'Liste des infractions',
        content: [
          'La liste affiche les 156 types d\'infractions avec leurs détails.',
          'Les infractions sont classées par catégorie : code de la route, documents, véhicule, etc.',
          'Recherchez par nom, catégorie ou montant d\'amende.'
        ]
      },
      {
        title: 'Catégories d\'infractions',
        content: [
          'Code de la route : excès de vitesse, feux, priorités, etc.',
          'Documents : permis, assurance, carte grise manquants.',
          'Véhicule : non-conformité technique, éclairage, pneus.',
          'Conduite : état d\'ivresse, téléphone, ceinture de sécurité.'
        ]
      },
      {
        title: 'Barème des amendes',
        content: [
          'Chaque infraction a un montant d\'amende fixe.',
          'Les montants peuvent être majorés pour les récidivistes.',
          'Consultez le barème pour connaître les montants exacts.'
        ]
      },
      {
        title: 'Système de points',
        content: [
          'Certaines infractions entraînent un retrait de points sur le permis.',
          'Le nombre de points retirés dépend de la gravité de l\'infraction.',
          'Consultez le système de points pour voir les détails.'
        ]
      }
    ],
    tips: [
      '💡 Utilisez les catégories pour trouver rapidement une infraction.',
      '💡 Le barème est mis à jour régulièrement selon la législation.',
      '💡 Les récidivistes peuvent avoir des sanctions plus sévères.'
    ]
  },
  '/gestion/amendes': {
    title: 'Aide - Gestion des Amendes',
    description: 'Suivez toutes les amendes émises par votre commissariat et leur paiement.',
    sections: [
      {
        title: 'Liste des amendes',
        content: [
          'La liste affiche toutes les amendes avec leur statut de paiement.',
          'Filtrez par statut : En attente, Payée, Impayée.',
          'Recherchez par numéro de plaque, montant ou date.'
        ]
      },
      {
        title: 'Statuts des amendes',
        content: [
          'EN ATTENTE : Amende émise, en attente de paiement.',
          'PAYÉE : Amende payée, vous pouvez générer un reçu.',
          'IMPAYÉE : Amende non payée dans les délais, relance nécessaire.'
        ]
      },
      {
        title: 'Paiement des amendes',
        content: [
          'Les amendes peuvent être payées en ligne ou au commissariat.',
          'Enregistrez le paiement pour mettre à jour le statut.',
          'Générez un reçu de paiement pour le contrevenant.'
        ]
      },
      {
        title: 'Suivi des impayées',
        content: [
          'Les amendes impayées sont automatiquement signalées après le délai.',
          'Vous pouvez envoyer des relances aux contrevenants.',
          'Consultez l\'historique des paiements.'
        ]
      }
    ],
    tips: [
      '💡 Les amendes payées sont automatiquement comptabilisées dans les revenus.',
      '💡 Suivez régulièrement les amendes impayées pour relance.',
      '💡 Exportez les données pour la comptabilité.'
    ]
  },
  '/gestion/inspections': {
    title: 'Aide - Gestion des Inspections',
    description: 'Planifiez et suivez les inspections de véhicules et de documents.',
    sections: [
      {
        title: 'Planifier une inspection',
        content: [
          'Créez une nouvelle inspection avec la date, l\'heure et le lieu.',
          'Assignez les agents qui effectueront l\'inspection.',
          'Définissez le type d\'inspection : routière, documentaire, technique.'
        ]
      },
      {
        title: 'Types d\'inspections',
        content: [
          'Inspection routière : Contrôle sur la voie publique.',
          'Inspection documentaire : Vérification des documents au commissariat.',
          'Inspection technique : Contrôle approfondi du véhicule.'
        ]
      },
      {
        title: 'Suivi des inspections',
        content: [
          'Consultez la liste de toutes les inspections planifiées et effectuées.',
          'Suivez le statut : Planifiée, En cours, Terminée.',
          'Consultez les résultats et statistiques de chaque inspection.'
        ]
      }
    ],
    tips: [
      '💡 Planifiez les inspections à l\'avance pour une meilleure organisation.',
      '💡 Les inspections sont automatiquement enregistrées dans le système.',
      '💡 Consultez les statistiques pour optimiser les inspections.'
    ]
  },
  '/gestion/plaintes': {
    title: 'Aide - Gestion des Plaintes',
    description: 'Enregistrez et suivez toutes les plaintes déposées au commissariat.',
    sections: [
      {
        title: 'Enregistrer une plainte',
        content: [
          'Créez une nouvelle plainte avec les informations du plaignant.',
          'Remplissez les détails de l\'incident : date, lieu, description.',
          'Assignez un numéro de dossier unique.',
          'Enregistrez les pièces jointes si nécessaire.'
        ]
      },
      {
        title: 'Suivi des plaintes',
        content: [
          'Consultez la liste de toutes les plaintes avec leur statut.',
          'Filtrez par statut : Enregistrée, En cours, Résolue, Classée.',
          'Recherchez par numéro de dossier, nom du plaignant ou date.'
        ]
      },
      {
        title: 'Statuts des plaintes',
        content: [
          'ENREGISTRÉE : Plainte déposée, en attente de traitement.',
          'EN COURS : Plainte en cours d\'investigation.',
          'RÉSOLUE : Plainte traitée et résolue.',
          'CLASSÉE : Plainte classée sans suite.'
        ]
      }
    ],
    tips: [
      '💡 Enregistrez les plaintes rapidement pour une meilleure traçabilité.',
      '💡 Suivez régulièrement les plaintes en cours.',
      '💡 Consultez l\'historique pour voir toutes les plaintes résolues.'
    ]
  },
  '/gestion/alertes': {
    title: 'Aide - Gestion des Alertes',
    description: 'Gérez les alertes sécuritaires : véhicules volés, personnes recherchées, etc.',
    sections: [
      {
        title: 'Types d\'alertes',
        content: [
          'Véhicule volé : Signalement d\'un véhicule volé.',
          'Personne recherchée : Avis de recherche d\'une personne.',
          'Situation d\'urgence : Alerte pour intervention rapide.'
        ]
      },
      {
        title: 'Créer une alerte',
        content: [
          'Cliquez sur "Nouvelle alerte" pour créer une alerte.',
          'Sélectionnez le type d\'alerte.',
          'Remplissez les informations : description, lieu, niveau de priorité.',
          'L\'alerte est automatiquement diffusée à tous les agents.'
        ]
      },
      {
        title: 'Niveaux de priorité',
        content: [
          'CRITIQUE : Intervention immédiate requise.',
          'IMPORTANTE : Suivi nécessaire dans les plus brefs délais.',
          'STANDARD : Alerte d\'information, suivi normal.'
        ]
      },
      {
        title: 'Suivi des alertes',
        content: [
          'Les alertes actives sont affichées en haut de la liste.',
          'Les alertes critiques sont automatiquement notifiées.',
          'Archivez les alertes résolues.'
        ]
      }
    ],
    tips: [
      '💡 Les alertes critiques sont diffusées immédiatement à tous les agents.',
      '💡 Vérifiez régulièrement les alertes actives.',
      '💡 Les alertes sont synchronisées avec le centre de sécurité national.'
    ]
  }
}

// Fonction pour obtenir le contenu d'aide selon la route
export function getHelpContent(pathname: string): HelpContent | null {
  // Normaliser le pathname (enlever les trailing slashes)
  const normalizedPath = pathname.replace(/\/$/, '') || '/'
  
  // Chercher une correspondance exacte
  if (helpContent[normalizedPath]) {
    return helpContent[normalizedPath]
  }
  
  // Chercher une correspondance partielle (pour les routes dynamiques comme /admin/agents/[id])
  for (const [key, content] of Object.entries(helpContent)) {
    if (normalizedPath.startsWith(key)) {
      return content
    }
  }
  
  // Retourner un contenu par défaut si aucune correspondance
  return {
    title: 'Aide',
    description: 'Bienvenue dans le système d\'aide. Sélectionnez une rubrique pour obtenir de l\'aide spécifique.',
    sections: [
      {
        title: 'Navigation',
        content: [
          'Utilisez le menu latéral pour naviguer entre les différentes rubriques.',
          'Chaque rubrique a son propre système d\'aide contextuel.',
          'Cliquez sur le bouton d\'aide (?) pour obtenir de l\'aide sur la rubrique actuelle.'
        ]
      }
    ],
    tips: [
      '💡 Le système d\'aide est disponible sur toutes les pages.',
      '💡 Consultez l\'aide pour chaque rubrique pour des instructions détaillées.'
    ]
  }
}

