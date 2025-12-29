import { Agent, GradeAgent, StatusAgent } from '@/lib/types';

// Noms et prénoms ivoiriens typiques
const noms = [
  'KOUAME', 'TRAORE', 'KONE', 'OUATTARA', 'YAO', 'BAMBA', 'DIALLO', 'SANGARE',
  'TOURE', 'DIABATE', 'SILUE', 'DOUMBIA', 'COULIBALY', 'DIABY', 'KOFFI', 
  'GBANE', 'KAMATE', 'FOFANA', 'BAKAYOKO', 'DEMBELE', 'CISSE', 'CAMARA'
];

const prenoms = [
  'Adjoua', 'Fatou', 'Aminata', 'Marie', 'Aya', 'Mariam', 'Akissi', 'Affoué',
  'Kouadio', 'Yao', 'Koffi', 'Jean', 'Ibrahim', 'Seydou', 'Mamadou', 'Moussa',
  'Pascal', 'Laurent', 'Michel', 'François', 'Christian', 'Alain', 'Vincent'
];

const grades: GradeAgent[] = [
  'Gardien de la Paix', 'Brigadier', 'Brigadier-Chef', 'Sous-Lieutenant',
  'Lieutenant', 'Capitaine', 'Commandant', 'Lieutenant-Colonel', 'Colonel'
];

const specialites = [
  'Contrôles routiers', 'Sécurité urbaine', 'Investigation', 'Cybercriminalité',
  'Stupéfiants', 'Ordre public', 'Circulation', 'Renseignement', 'Formation',
  'Logistique', 'Communication', 'Intervention rapide'
];

const statuses: StatusAgent[] = ['actif', 'repos', 'mission', 'formation', 'conge'];

// Fonction pour générer un agent aléatoire
function generateAgent(id: number, commissariatId: string): Agent {
  const nom = noms[Math.floor(Math.random() * noms.length)];
  const prenom = prenoms[Math.floor(Math.random() * prenoms.length)];
  const grade = grades[Math.floor(Math.random() * grades.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  // Pondération des statuts (plus d'agents actifs)
  const weightedStatus = Math.random() < 0.7 ? 'actif' : status;
  
  return {
    id: id.toString(),
    matricule: `PN${String(id).padStart(4, '0')}`,
    nom,
    prenoms: prenom,
    grade,
    commissariat: commissariatId,
    telephone: `+225 ${Math.random() > 0.5 ? '07' : '05'} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10}`,
    email: `${prenom.toLowerCase()}.${nom.toLowerCase()}@police.ci`,
    status: weightedStatus,
    specialites: [
      specialites[Math.floor(Math.random() * specialites.length)],
      ...(Math.random() > 0.6 ? [specialites[Math.floor(Math.random() * specialites.length)]] : [])
    ],
    dateRecrutement: `${2010 + Math.floor(Math.random() * 15)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    derniereActivite: `2025-09-${String(Math.floor(Math.random() * 7) + 20).padStart(2, '0')}T${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00Z`
  };
}

// Répartition des agents par commissariat (basé sur les données des commissariats)
const repartitionAgents = [
  { commissariatId: "1", nombre: 23 },
  { commissariatId: "2", nombre: 18 },
  { commissariatId: "3", nombre: 20 },
  { commissariatId: "4", nombre: 25 },
  { commissariatId: "5", nombre: 16 },
  { commissariatId: "6", nombre: 19 },
  { commissariatId: "7", nombre: 15 },
  { commissariatId: "8", nombre: 21 },
  { commissariatId: "9", nombre: 17 },
  { commissariatId: "10", nombre: 14 }
];

// Générer les agents pour les 10 premiers commissariats
let currentId = 1;
export const mockAgents: Agent[] = [];

repartitionAgents.forEach(({ commissariatId, nombre }) => {
  for (let i = 0; i < nombre; i++) {
    mockAgents.push(generateAgent(currentId, commissariatId));
    currentId++;
  }
});

// Générer les agents pour les commissariats restants (11-23)
for (let commissariatId = 11; commissariatId <= 23; commissariatId++) {
  const nombreAgents = 12 + Math.floor(Math.random() * 10); // Entre 12 et 21 agents
  for (let i = 0; i < nombreAgents; i++) {
    mockAgents.push(generateAgent(currentId, commissariatId.toString()));
    currentId++;
  }
}

// Quelques agents spéciaux avec des grades élevés
const agentsSpeciaux: Agent[] = [
  {
    id: "SPEC001",
    matricule: "PN0001",
    nom: "KOUAME",
    prenoms: "Adjoua",
    grade: "Colonel",
    commissariat: "1",
    telephone: "+225 07 20 21 22 23",
    email: "adjoua.kouame@police.ci",
    status: "actif",
    specialites: ["Direction", "Stratégie"],
    dateRecrutement: "2005-01-15",
    derniereActivite: "2025-09-27T08:00:00Z"
  },
  {
    id: "SPEC002",
    matricule: "PN0002", 
    nom: "TRAORE",
    prenoms: "Mamadou",
    grade: "Lieutenant-Colonel",
    commissariat: "2",
    telephone: "+225 07 20 21 22 24",
    email: "mamadou.traore@police.ci",
    status: "actif",
    specialites: ["Operations", "Formation"],
    dateRecrutement: "2008-03-20",
    derniereActivite: "2025-09-27T07:30:00Z"
  }
];

// Combiner tous les agents
export const allAgents = [...agentsSpeciaux, ...mockAgents];

// Statistiques calculées
export const statsAgents = {
  total: allAgents.length,
  parStatus: allAgents.reduce((acc, agent) => {
    acc[agent.status] = (acc[agent.status] || 0) + 1;
    return acc;
  }, {} as Record<StatusAgent, number>),
  parGrade: allAgents.reduce((acc, agent) => {
    acc[agent.grade] = (acc[agent.grade] || 0) + 1;
    return acc;
  }, {} as Record<GradeAgent, number>),
  parCommissariat: allAgents.reduce((acc, agent) => {
    acc[agent.commissariat] = (acc[agent.commissariat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>),
  anciennete: {
    moyenne: allAgents.reduce((sum, agent) => {
      const anneeRecrutement = parseInt(agent.dateRecrutement.split('-')[0]);
      return sum + (2025 - anneeRecrutement);
    }, 0) / allAgents.length,
    distribution: allAgents.reduce((acc, agent) => {
      const anciennete = 2025 - parseInt(agent.dateRecrutement.split('-')[0]);
      const tranche = anciennete < 5 ? 'junior' : anciennete < 10 ? 'moyen' : 'senior';
      acc[tranche] = (acc[tranche] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  }
};

// Agents par commissariat (helper function)
export function getAgentsByCommissariat(commissariatId: string): Agent[] {
  return allAgents.filter(agent => agent.commissariat === commissariatId);
}

// Top agents par critères
export const topAgents = {
  plusAnciens: [...allAgents].sort((a, b) => 
    new Date(a.dateRecrutement).getTime() - new Date(b.dateRecrutement).getTime()
  ).slice(0, 10),
  gradesEleves: allAgents.filter(agent => 
    ['Colonel', 'Lieutenant-Colonel', 'Commandant'].includes(agent.grade)
  ),
  recemmentActifs: [...allAgents].sort((a, b) => 
    new Date(b.derniereActivite).getTime() - new Date(a.derniereActivite).getTime()
  ).slice(0, 20)
};