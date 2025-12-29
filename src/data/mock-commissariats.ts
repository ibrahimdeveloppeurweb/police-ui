import { Commissariat } from '@/lib/types';

export const mockCommissariats: Commissariat[] = [
  {
    id: "1",
    nom: "Commissariat Central Abidjan",
    localisation: "Plateau, Abidjan",
    coordonnees: {
      latitude: 5.3236,
      longitude: -4.0268
    },
    responsable: {
      nom: "Colonel KOUAME Adjoua",
      grade: "Colonel",
      telephone: "+225 27 20 21 22 23"
    },
    agents: {
      total: 23,
      presents: 19,
      enMission: 3
    },
    statistiques: {
      controlesJour: 47,
      controlesSemaine: 329,
      controlesMois: 1410,
      revenus: 340000,
      tauxConformite: 84.8
    },
    status: "actif"
  },
  {
    id: "2",
    nom: "Commissariat Adjamé",
    localisation: "Adjamé, Abidjan",
    coordonnees: {
      latitude: 5.3515,
      longitude: -4.0246
    },
    responsable: {
      nom: "Commandant TRAORE Mamadou",
      grade: "Commandant",
      telephone: "+225 27 20 21 22 24"
    },
    agents: {
      total: 18,
      presents: 16,
      enMission: 2
    },
    statistiques: {
      controlesJour: 38,
      controlesSemaine: 266,
      controlesMois: 1140,
      revenus: 285000,
      tauxConformite: 79.2
    },
    status: "actif"
  },
  {
    id: "3",
    nom: "Commissariat Cocody",
    localisation: "Cocody, Abidjan",
    coordonnees: {
      latitude: 5.3447,
      longitude: -3.9871
    },
    responsable: {
      nom: "Commandant BAMBA Fatou",
      grade: "Commandant",
      telephone: "+225 27 20 21 22 25"
    },
    agents: {
      total: 20,
      presents: 18,
      enMission: 1
    },
    statistiques: {
      controlesJour: 52,
      controlesSemaine: 364,
      controlesMois: 1560,
      revenus: 390000,
      tauxConformite: 88.5
    },
    status: "actif"
  },
  {
    id: "4",
    nom: "Commissariat Yopougon",
    localisation: "Yopougon, Abidjan",
    coordonnees: {
      latitude: 5.3364,
      longitude: -4.0677
    },
    responsable: {
      nom: "Lieutenant-Colonel KONE Seydou",
      grade: "Lieutenant-Colonel",
      telephone: "+225 27 20 21 22 26"
    },
    agents: {
      total: 25,
      presents: 22,
      enMission: 3
    },
    statistiques: {
      controlesJour: 63,
      controlesSemaine: 441,
      controlesMois: 1890,
      revenus: 472000,
      tauxConformite: 81.7
    },
    status: "actif"
  },
  {
    id: "5",
    nom: "Commissariat Marcory",
    localisation: "Marcory, Abidjan",
    coordonnees: {
      latitude: 5.2886,
      longitude: -3.9927
    },
    responsable: {
      nom: "Capitaine OUATTARA Ibrahim",
      grade: "Capitaine",
      telephone: "+225 27 20 21 22 27"
    },
    agents: {
      total: 16,
      presents: 14,
      enMission: 2
    },
    statistiques: {
      controlesJour: 34,
      controlesSemaine: 238,
      controlesMois: 1020,
      revenus: 255000,
      tauxConformite: 86.3
    },
    status: "actif"
  },
  // Ajouter les 18 autres commissariats
  {
    id: "6",
    nom: "Commissariat Bouaké Central",
    localisation: "Centre-ville, Bouaké",
    coordonnees: {
      latitude: 7.6898,
      longitude: -5.0300
    },
    responsable: {
      nom: "Commandant YAO Koffi",
      grade: "Commandant",
      telephone: "+225 27 31 63 12 34"
    },
    agents: {
      total: 19,
      presents: 17,
      enMission: 2
    },
    statistiques: {
      controlesJour: 41,
      controlesSemaine: 287,
      controlesMois: 1230,
      revenus: 308000,
      tauxConformite: 82.1
    },
    status: "actif"
  },
  {
    id: "7",
    nom: "Commissariat San Pedro",
    localisation: "Centre, San Pedro",
    coordonnees: {
      latitude: 4.7469,
      longitude: -6.6364
    },
    responsable: {
      nom: "Capitaine DIALLO Aminata",
      grade: "Capitaine",
      telephone: "+225 27 34 71 25 36"
    },
    agents: {
      total: 15,
      presents: 13,
      enMission: 2
    },
    statistiques: {
      controlesJour: 28,
      controlesSemaine: 196,
      controlesMois: 840,
      revenus: 210000,
      tauxConformite: 89.2
    },
    status: "actif"
  },
  {
    id: "8",
    nom: "Commissariat Yamoussoukro",
    localisation: "Capitale politique, Yamoussoukro",
    coordonnees: {
      latitude: 6.8276,
      longitude: -5.2893
    },
    responsable: {
      nom: "Lieutenant-Colonel GBANE Pascal",
      grade: "Lieutenant-Colonel",
      telephone: "+225 27 30 64 15 78"
    },
    agents: {
      total: 21,
      presents: 19,
      enMission: 1
    },
    statistiques: {
      controlesJour: 35,
      controlesSemaine: 245,
      controlesMois: 1050,
      revenus: 262000,
      tauxConformite: 91.4
    },
    status: "actif"
  },
  {
    id: "9",
    nom: "Commissariat Korhogo",
    localisation: "Centre-ville, Korhogo",
    coordonnees: {
      latitude: 9.4581,
      longitude: -5.6300
    },
    responsable: {
      nom: "Commandant SILUE Moussa",
      grade: "Commandant",
      telephone: "+225 27 36 86 42 19"
    },
    agents: {
      total: 17,
      presents: 15,
      enMission: 2
    },
    statistiques: {
      controlesJour: 31,
      controlesSemaine: 217,
      controlesMois: 930,
      revenus: 233000,
      tauxConformite: 85.7
    },
    status: "actif"
  },
  {
    id: "10",
    nom: "Commissariat Daloa",
    localisation: "Centre, Daloa",
    coordonnees: {
      latitude: 6.8770,
      longitude: -6.4503
    },
    responsable: {
      nom: "Capitaine KOFFI Marie",
      grade: "Capitaine",
      telephone: "+225 27 32 78 95 20"
    },
    agents: {
      total: 14,
      presents: 12,
      enMission: 2
    },
    statistiques: {
      controlesJour: 26,
      controlesSemaine: 182,
      controlesMois: 780,
      revenus: 195000,
      tauxConformite: 87.9
    },
    status: "maintenance"
  },
  // Commissariats restants (11-23) en version condensée
  ...Array.from({ length: 13 }, (_, i) => ({
    id: (i + 11).toString(),
    nom: `Commissariat ${['Man', 'Gagnoa', 'Divo', 'Aboisso', 'Bondoukou', 'Séguéla', 'Odienné', 'Bouna', 'Tabou', 'Grand-Bassam', 'Bingerville', 'Anyama', 'Abobo'][i]}`,
    localisation: `Centre-ville, ${['Man', 'Gagnoa', 'Divo', 'Aboisso', 'Bondoukou', 'Séguéla', 'Odienné', 'Bouna', 'Tabou', 'Grand-Bassam', 'Bingerville', 'Anyama', 'Abobo'][i]}`,
    coordonnees: {
      latitude: 5.0 + Math.random() * 5,
      longitude: -8.0 + Math.random() * 6
    },
    responsable: {
      nom: `${['Capitaine', 'Commandant', 'Lieutenant'][Math.floor(Math.random() * 3)]} ${['KOUASSI', 'DIABY', 'TOURE', 'SANGARE'][Math.floor(Math.random() * 4)]} ${['Jean', 'Marie', 'Ibrahim', 'Fatou'][Math.floor(Math.random() * 4)]}`,
      grade: ['Capitaine', 'Commandant', 'Lieutenant'][Math.floor(Math.random() * 3)] as any,
      telephone: `+225 27 ${30 + Math.floor(Math.random() * 10)} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10}`
    },
    agents: {
      total: 12 + Math.floor(Math.random() * 10),
      presents: 10 + Math.floor(Math.random() * 8),
      enMission: 1 + Math.floor(Math.random() * 3)
    },
    statistiques: {
      controlesJour: 20 + Math.floor(Math.random() * 30),
      controlesSemaine: 140 + Math.floor(Math.random() * 210),
      controlesMois: 600 + Math.floor(Math.random() * 900),
      revenus: 150000 + Math.floor(Math.random() * 200000),
      tauxConformite: 75 + Math.random() * 20
    },
    status: Math.random() > 0.1 ? 'actif' : 'maintenance'
  } as Commissariat))
];

// Statistiques calculées
export const statsCommissariats = {
  total: mockCommissariats.length,
  actifs: mockCommissariats.filter(c => c.status === 'actif').length,
  enMaintenance: mockCommissariats.filter(c => c.status === 'maintenance').length,
  totalAgents: mockCommissariats.reduce((sum, c) => sum + c.agents.total, 0),
  agentsActifs: mockCommissariats.reduce((sum, c) => sum + c.agents.presents, 0),
  agentsEnMission: mockCommissariats.reduce((sum, c) => sum + c.agents.enMission, 0),
  controlesJour: mockCommissariats.reduce((sum, c) => sum + c.statistiques.controlesJour, 0),
  revenusJour: mockCommissariats.reduce((sum, c) => sum + c.statistiques.revenus, 0),
  tauxConformiteMoyen: mockCommissariats.reduce((sum, c) => sum + c.statistiques.tauxConformite, 0) / mockCommissariats.length
};