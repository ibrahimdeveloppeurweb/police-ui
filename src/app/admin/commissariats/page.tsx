'use client'
import { useState, useEffect } from 'react'
import { 
  Plus, Eye, Settings, Edit, Search,
  MapPin, Users, TrendingUp, TrendingDown, AlertTriangle, Phone, Calendar,
  CheckCircle, Printer, FileDown, Activity, Target, Shield, Award
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useRouter } from 'next/navigation'

type Commissariat = {
  id: string; nom: string; localisation: string; responsable: string;
  titre: string; telephone: string; statut: string; niveau: string;
  agentsActifs: number; agentsTotal: number; tauxActivite: number;
  performance: number; controles: number; evolutionControles: number;
  revenus: string; evolutionRevenus: number; conformite: number;
  evolutionConformite: number;
};

type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'

export default function CommissariatsPage() {
  const router = useRouter()
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('jour')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Données par période
  const dataByPeriod = {
    jour: {
      activityData: [
        { period: '00h-04h', controles: 45, agents: 12, revenus: 0.3 },
        { period: '04h-08h', controles: 89, agents: 18, revenus: 0.6 },
        { period: '08h-12h', controles: 456, agents: 42, revenus: 3.2 },
        { period: '12h-16h', controles: 523, agents: 45, revenus: 3.7 },
        { period: '16h-20h', controles: 387, agents: 38, revenus: 2.7 },
        { period: '20h-24h', controles: 156, agents: 25, revenus: 1.1 }
      ],
      performanceData: [
        { region: 'Abidjan', performance: 87.4, commissariats: 12 },
        { region: 'Centre', performance: 82.1, commissariats: 8 },
        { region: 'Ouest', performance: 79.6, commissariats: 6 },
        { region: 'Nord', performance: 76.8, commissariats: 5 }
      ],
      pieData: [
        { name: 'Actif', value: 28, color: '#10b981' },
        { name: 'Attention', value: 5, color: '#f59e0b' },
        { name: 'Critique', value: 2, color: '#ef4444' }
      ],
      commissariats: [
        {
          id: 'COM-ABJ-003', nom: '3ème Arrondissement', localisation: 'Adjamé, Abidjan',
          responsable: 'Moussa DIABATE', titre: 'Commissaire Principal', telephone: '+225 21 37 45 67',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 38, agentsTotal: 45, tauxActivite: 84,
          performance: 94.2, controles: 1247, evolutionControles: 8.6, revenus: '8.7M',
          evolutionRevenus: 11.5, conformite: 76.8, evolutionConformite: 3.5
        },
        {
          id: 'COM-ABJ-005', nom: '5ème Arrondissement', localisation: 'Marcory, Abidjan',
          responsable: 'Aminata KONE', titre: 'Commissaire', telephone: '+225 21 26 78 90',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 32, agentsTotal: 38, tauxActivite: 84,
          performance: 89.7, controles: 1087, evolutionControles: 6.5, revenus: '7.2M',
          evolutionRevenus: 4.3, conformite: 78.5, evolutionConformite: 3.3
        },
        {
          id: 'COM-ABJ-002', nom: '2ème Arrondissement', localisation: 'Plateau, Abidjan',
          responsable: 'Yao KOUASSI', titre: 'Commissaire Principal', telephone: '+225 21 22 34 56',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 40, agentsTotal: 45, tauxActivite: 89,
          performance: 92.5, controles: 1189, evolutionControles: 7.8, revenus: '8.2M',
          evolutionRevenus: 9.2, conformite: 80.1, evolutionConformite: 4.2
        },
        {
          id: 'COM-ABJ-006', nom: '6ème Arrondissement', localisation: 'Treichville, Abidjan',
          responsable: 'Fatou DIALLO', titre: 'Commissaire', telephone: '+225 21 24 56 78',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 35, agentsTotal: 40, tauxActivite: 88,
          performance: 88.3, controles: 1034, evolutionControles: 5.9, revenus: '6.9M',
          evolutionRevenus: 6.1, conformite: 77.8, evolutionConformite: 2.9
        },
        {
          id: 'COM-ABJ-007', nom: '7ème Arrondissement', localisation: 'Koumassi, Abidjan',
          responsable: 'Sekou TRAORE', titre: 'Commissaire Adjoint', telephone: '+225 21 25 67 89',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 30, agentsTotal: 36, tauxActivite: 83,
          performance: 85.4, controles: 945, evolutionControles: 4.2, revenus: '6.1M',
          evolutionRevenus: 3.8, conformite: 75.6, evolutionConformite: 2.1
        },
        {
          id: 'COM-ABJ-010', nom: '10ème Arrondissement', localisation: 'Abobo, Abidjan',
          responsable: 'Ibrahim OUATTARA', titre: 'Commissaire Adjoint', telephone: '+225 21 35 89 12',
          statut: 'CRITIQUE', niveau: 'ROUGE', agentsActifs: 25, agentsTotal: 32, tauxActivite: 78,
          performance: 72.4, controles: 678, evolutionControles: -10.3, revenus: '4.2M',
          evolutionRevenus: -12.5, conformite: 68.9, evolutionConformite: -3.2
        }
      ],
      regions: [
        { name: "Région d'Abidjan", commissariats: 12, agents: 456, performance: 87.4, revenus: "95.4M FCFA" },
        { name: "Région du Centre", commissariats: 8, agents: 287, performance: 82.1, revenus: "62.8M FCFA" },
        { name: "Région de l'Ouest", commissariats: 6, agents: 198, performance: 79.6, revenus: "45.2M FCFA" },
        { name: "Région du Nord", commissariats: 5, agents: 167, performance: 76.8, revenus: "38.9M FCFA" }
      ],
      stats: {
        totalCommissariats: 35,
        totalAgents: 1108,
        totalControles: 12047,
        totalRevenus: '242.3M',
        performanceMoyenne: 81.5,
        tauxActivite: 83.2,
        commissariatsActifs: 28,
        commissariatsCritiques: 2
      }
    },
    semaine: {
      activityData: [
        { period: 'Lun', controles: 1892, agents: 42, revenus: 13.2 },
        { period: 'Mar', controles: 2045, agents: 44, revenus: 14.3 },
        { period: 'Mer', controles: 1967, agents: 43, revenus: 13.8 },
        { period: 'Jeu', controles: 2134, agents: 45, revenus: 14.9 },
        { period: 'Ven', controles: 2287, agents: 45, revenus: 16.0 },
        { period: 'Sam', controles: 1678, agents: 38, revenus: 11.7 },
        { period: 'Dim', controles: 1345, agents: 32, revenus: 9.4 }
      ],
      performanceData: [
        { region: 'Abidjan', performance: 86.8, commissariats: 12 },
        { region: 'Centre', performance: 81.4, commissariats: 8 },
        { region: 'Ouest', performance: 78.9, commissariats: 6 },
        { region: 'Nord', performance: 75.2, commissariats: 5 }
      ],
      pieData: [
        { name: 'Actif', value: 27, color: '#10b981' },
        { name: 'Attention', value: 6, color: '#f59e0b' },
        { name: 'Critique', value: 2, color: '#ef4444' }
      ],
      commissariats: [
        {
          id: 'COM-ABJ-003', nom: '3ème Arrondissement', localisation: 'Adjamé, Abidjan',
          responsable: 'Moussa DIABATE', titre: 'Commissaire Principal', telephone: '+225 21 37 45 67',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 38, agentsTotal: 45, tauxActivite: 84,
          performance: 92.8, controles: 8393, evolutionControles: 7.2, revenus: '60.1M',
          evolutionRevenus: 9.8, conformite: 78.2, evolutionConformite: 2.8
        },
        {
          id: 'COM-ABJ-002', nom: '2ème Arrondissement', localisation: 'Plateau, Abidjan',
          responsable: 'Yao KOUASSI', titre: 'Commissaire Principal', telephone: '+225 21 22 34 56',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 40, agentsTotal: 45, tauxActivite: 89,
          performance: 90.5, controles: 7856, evolutionControles: 6.9, revenus: '55.8M',
          evolutionRevenus: 8.3, conformite: 79.5, evolutionConformite: 3.5
        },
        {
          id: 'COM-ABJ-005', nom: '5ème Arrondissement', localisation: 'Marcory, Abidjan',
          responsable: 'Aminata KONE', titre: 'Commissaire', telephone: '+225 21 26 78 90',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 32, agentsTotal: 38, tauxActivite: 84,
          performance: 88.3, controles: 7245, evolutionControles: 5.8, revenus: '52.3M',
          evolutionRevenus: 6.4, conformite: 79.8, evolutionConformite: 3.1
        },
        {
          id: 'COM-ABJ-006', nom: '6ème Arrondissement', localisation: 'Treichville, Abidjan',
          responsable: 'Fatou DIALLO', titre: 'Commissaire', telephone: '+225 21 24 56 78',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 35, agentsTotal: 40, tauxActivite: 88,
          performance: 86.7, controles: 6934, evolutionControles: 5.2, revenus: '48.9M',
          evolutionRevenus: 5.8, conformite: 78.2, evolutionConformite: 2.7
        },
        {
          id: 'COM-ABJ-007', nom: '7ème Arrondissement', localisation: 'Koumassi, Abidjan',
          responsable: 'Sekou TRAORE', titre: 'Commissaire Adjoint', telephone: '+225 21 25 67 89',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 30, agentsTotal: 36, tauxActivite: 83,
          performance: 83.9, controles: 6123, evolutionControles: 3.8, revenus: '43.5M',
          evolutionRevenus: 4.2, conformite: 76.1, evolutionConformite: 1.9
        },
        {
          id: 'COM-ABJ-010', nom: '10ème Arrondissement', localisation: 'Abobo, Abidjan',
          responsable: 'Ibrahim OUATTARA', titre: 'Commissaire Adjoint', telephone: '+225 21 35 89 12',
          statut: 'ATTENTION', niveau: 'ORANGE', agentsActifs: 25, agentsTotal: 32, tauxActivite: 78,
          performance: 74.6, controles: 4892, evolutionControles: -8.7, revenus: '31.5M',
          evolutionRevenus: -9.2, conformite: 70.3, evolutionConformite: -2.8
        }
      ],
      regions: [
        { name: "Région d'Abidjan", commissariats: 12, agents: 456, performance: 86.8, revenus: "642.5M FCFA" },
        { name: "Région du Centre", commissariats: 8, agents: 287, performance: 81.4, revenus: "423.7M FCFA" },
        { name: "Région de l'Ouest", commissariats: 6, agents: 198, performance: 78.9, revenus: "298.4M FCFA" },
        { name: "Région du Nord", commissariats: 5, agents: 167, performance: 75.2, revenus: "254.8M FCFA" }
      ],
      stats: {
        totalCommissariats: 35,
        totalAgents: 1108,
        totalControles: 83428,
        totalRevenus: '1.6Mrd',
        performanceMoyenne: 80.6,
        tauxActivite: 82.8,
        commissariatsActifs: 27,
        commissariatsCritiques: 2
      }
    },
    mois: {
      activityData: [
        { period: 'Sem 1', controles: 7892, agents: 42, revenus: 55.2 },
        { period: 'Sem 2', controles: 8245, agents: 44, revenus: 57.7 },
        { period: 'Sem 3', controles: 7934, agents: 43, revenus: 55.5 },
        { period: 'Sem 4', controles: 8534, agents: 45, revenus: 59.7 }
      ],
      performanceData: [
        { region: 'Abidjan', performance: 85.9, commissariats: 12 },
        { region: 'Centre', performance: 80.8, commissariats: 8 },
        { region: 'Ouest', performance: 78.1, commissariats: 6 },
        { region: 'Nord', performance: 74.5, commissariats: 5 }
      ],
      pieData: [
        { name: 'Actif', value: 26, color: '#10b981' },
        { name: 'Attention', value: 7, color: '#f59e0b' },
        { name: 'Critique', value: 2, color: '#ef4444' }
      ],
      commissariats: [
        {
          id: 'COM-ABJ-003', nom: '3ème Arrondissement', localisation: 'Adjamé, Abidjan',
          responsable: 'Moussa DIABATE', titre: 'Commissaire Principal', telephone: '+225 21 37 45 67',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 38, agentsTotal: 45, tauxActivite: 84,
          performance: 91.5, controles: 31674, evolutionControles: 6.8, revenus: '228.6M',
          evolutionRevenus: 8.5, conformite: 79.5, evolutionConformite: 3.2
        },
        {
          id: 'COM-ABJ-002', nom: '2ème Arrondissement', localisation: 'Plateau, Abidjan',
          responsable: 'Yao KOUASSI', titre: 'Commissaire Principal', telephone: '+225 21 22 34 56',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 40, agentsTotal: 45, tauxActivite: 89,
          performance: 89.8, controles: 29834, evolutionControles: 6.2, revenus: '215.4M',
          evolutionRevenus: 7.8, conformite: 80.3, evolutionConformite: 3.8
        },
        {
          id: 'COM-ABJ-005', nom: '5ème Arrondissement', localisation: 'Marcory, Abidjan',
          responsable: 'Aminata KONE', titre: 'Commissaire', telephone: '+225 21 26 78 90',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 32, agentsTotal: 38, tauxActivite: 84,
          performance: 87.1, controles: 28456, evolutionControles: 5.2, revenus: '198.4M',
          evolutionRevenus: 7.1, conformite: 80.2, evolutionConformite: 2.9
        },
        {
          id: 'COM-ABJ-006', nom: '6ème Arrondissement', localisation: 'Treichville, Abidjan',
          responsable: 'Fatou DIALLO', titre: 'Commissaire', telephone: '+225 21 24 56 78',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 35, agentsTotal: 40, tauxActivite: 88,
          performance: 85.3, controles: 26123, evolutionControles: 4.8, revenus: '184.7M',
          evolutionRevenus: 6.5, conformite: 78.9, evolutionConformite: 2.5
        },
        {
          id: 'COM-ABJ-007', nom: '7ème Arrondissement', localisation: 'Koumassi, Abidjan',
          responsable: 'Sekou TRAORE', titre: 'Commissaire Adjoint', telephone: '+225 21 25 67 89',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 30, agentsTotal: 36, tauxActivite: 83,
          performance: 82.7, controles: 23456, evolutionControles: 3.5, revenus: '165.8M',
          evolutionRevenus: 4.9, conformite: 76.8, evolutionConformite: 1.8
        },
        {
          id: 'COM-ABJ-010', nom: '10ème Arrondissement', localisation: 'Abobo, Abidjan',
          responsable: 'Ibrahim OUATTARA', titre: 'Commissaire Adjoint', telephone: '+225 21 35 89 12',
          statut: 'ATTENTION', niveau: 'ORANGE', agentsActifs: 25, agentsTotal: 32, tauxActivite: 78,
          performance: 76.2, controles: 19234, evolutionControles: -7.5, revenus: '124.8M',
          evolutionRevenus: -8.3, conformite: 72.1, evolutionConformite: -2.5
        }
      ],
      regions: [
        { name: "Région d'Abidjan", commissariats: 12, agents: 456, performance: 85.9, revenus: "2.5Mrd FCFA" },
        { name: "Région du Centre", commissariats: 8, agents: 287, performance: 80.8, revenus: "1.7Mrd FCFA" },
        { name: "Région de l'Ouest", commissariats: 6, agents: 198, performance: 78.1, revenus: "1.2Mrd FCFA" },
        { name: "Région du Nord", commissariats: 5, agents: 167, performance: 74.5, revenus: "987M FCFA" }
      ],
      stats: {
        totalCommissariats: 35,
        totalAgents: 1108,
        totalControles: 284405,
        totalRevenus: '6.4Mrd',
        performanceMoyenne: 79.8,
        tauxActivite: 82.1,
        commissariatsActifs: 26,
        commissariatsCritiques: 2
      }
    },
    annee: {
      activityData: [
        { period: 'Jan', controles: 23567, agents: 42, revenus: 164.9 },
        { period: 'Fév', controles: 21345, agents: 41, revenus: 149.4 },
        { period: 'Mar', controles: 25789, agents: 44, revenus: 180.5 },
        { period: 'Avr', controles: 24678, agents: 43, revenus: 172.7 },
        { period: 'Mai', controles: 26891, agents: 45, revenus: 188.2 },
        { period: 'Juin', controles: 25945, agents: 44, revenus: 181.6 },
        { period: 'Juil', controles: 27856, agents: 45, revenus: 195.0 },
        { period: 'Août', controles: 26734, agents: 44, revenus: 187.1 },
        { period: 'Sep', controles: 25189, agents: 43, revenus: 176.3 },
        { period: 'Oct', controles: 28405, agents: 45, revenus: 198.8 }
      ],
      performanceData: [
        { region: 'Abidjan', performance: 84.8, commissariats: 12 },
        { region: 'Centre', performance: 79.5, commissariats: 8 },
        { region: 'Ouest', performance: 77.2, commissariats: 6 },
        { region: 'Nord', performance: 73.8, commissariats: 5 }
      ],
      pieData: [
        { name: 'Actif', value: 25, color: '#10b981' },
        { name: 'Attention', value: 8, color: '#f59e0b' },
        { name: 'Critique', value: 2, color: '#ef4444' }
      ],
      commissariats: [
        {
          id: 'COM-ABJ-003', nom: '3ème Arrondissement', localisation: 'Adjamé, Abidjan',
          responsable: 'Moussa DIABATE', titre: 'Commissaire Principal', telephone: '+225 21 37 45 67',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 38, agentsTotal: 45, tauxActivite: 84,
          performance: 90.2, controles: 303352, evolutionControles: 8.2, revenus: '2.2Mrd',
          evolutionRevenus: 10.3, conformite: 80.8, evolutionConformite: 4.5
        },
        {
          id: 'COM-ABJ-002', nom: '2ème Arrondissement', localisation: 'Plateau, Abidjan',
          responsable: 'Yao KOUASSI', titre: 'Commissaire Principal', telephone: '+225 21 22 34 56',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 40, agentsTotal: 45, tauxActivite: 89,
          performance: 88.7, controles: 289456, evolutionControles: 7.5, revenus: '2.1Mrd',
          evolutionRevenus: 9.6, conformite: 81.2, evolutionConformite: 4.8
        },
        {
          id: 'COM-ABJ-005', nom: '5ème Arrondissement', localisation: 'Marcory, Abidjan',
          responsable: 'Aminata KONE', titre: 'Commissaire', telephone: '+225 21 26 78 90',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 32, agentsTotal: 38, tauxActivite: 84,
          performance: 86.4, controles: 267891, evolutionControles: 6.9, revenus: '1.9Mrd',
          evolutionRevenus: 8.7, conformite: 81.5, evolutionConformite: 3.8
        },
        {
          id: 'COM-ABJ-006', nom: '6ème Arrondissement', localisation: 'Treichville, Abidjan',
          responsable: 'Fatou DIALLO', titre: 'Commissaire', telephone: '+225 21 24 56 78',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 35, agentsTotal: 40, tauxActivite: 88,
          performance: 84.8, controles: 245678, evolutionControles: 6.2, revenus: '1.7Mrd',
          evolutionRevenus: 7.8, conformite: 79.6, evolutionConformite: 3.2
        },
        {
          id: 'COM-ABJ-007', nom: '7ème Arrondissement', localisation: 'Koumassi, Abidjan',
          responsable: 'Sekou TRAORE', titre: 'Commissaire Adjoint', telephone: '+225 21 25 67 89',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 30, agentsTotal: 36, tauxActivite: 83,
          performance: 81.9, controles: 223456, evolutionControles: 5.3, revenus: '1.5Mrd',
          evolutionRevenus: 6.8, conformite: 77.9, evolutionConformite: 2.6
        },
        {
          id: 'COM-ABJ-010', nom: '10ème Arrondissement', localisation: 'Abobo, Abidjan',
          responsable: 'Ibrahim OUATTARA', titre: 'Commissaire Adjoint', telephone: '+225 21 35 89 12',
          statut: 'ATTENTION', niveau: 'ORANGE', agentsActifs: 25, agentsTotal: 32, tauxActivite: 78,
          performance: 77.8, controles: 189456, evolutionControles: -5.8, revenus: '1.3Mrd',
          evolutionRevenus: -6.5, conformite: 74.2, evolutionConformite: -1.8
        }
      ],
      regions: [
        { name: "Région d'Abidjan", commissariats: 12, agents: 456, performance: 84.8, revenus: "28.5Mrd FCFA" },
        { name: "Région du Centre", commissariats: 8, agents: 287, performance: 79.5, revenus: "19.2Mrd FCFA" },
        { name: "Région de l'Ouest", commissariats: 6, agents: 198, performance: 77.2, revenus: "13.8Mrd FCFA" },
        { name: "Région du Nord", commissariats: 5, agents: 167, performance: 73.8, revenus: "11.4Mrd FCFA" }
      ],
      stats: {
        totalCommissariats: 35,
        totalAgents: 1108,
        totalControles: 2558499,
        totalRevenus: '72.9Mrd',
        performanceMoyenne: 78.8,
        tauxActivite: 81.5,
        commissariatsActifs: 25,
        commissariatsCritiques: 2
      }
    },
    tout: {
      activityData: [
        { period: '2020', controles: 876543, agents: 38, revenus: 6135.8 },
        { period: '2021', controles: 967892, agents: 40, revenus: 6775.2 },
        { period: '2022', controles: 1034567, agents: 41, revenus: 7242.0 },
        { period: '2023', controles: 1076234, agents: 42, revenus: 7533.6 },
        { period: '2024', controles: 1158499, agents: 45, revenus: 8109.5 }
      ],
      performanceData: [
        { region: 'Abidjan', performance: 83.5, commissariats: 12 },
        { region: 'Centre', performance: 78.2, commissariats: 8 },
        { region: 'Ouest', performance: 76.1, commissariats: 6 },
        { region: 'Nord', performance: 72.5, commissariats: 5 }
      ],
      pieData: [
        { name: 'Actif', value: 24, color: '#10b981' },
        { name: 'Attention', value: 9, color: '#f59e0b' },
        { name: 'Critique', value: 2, color: '#ef4444' }
      ],
      commissariats: [
        {
          id: 'COM-ABJ-003', nom: '3ème Arrondissement', localisation: 'Adjamé, Abidjan',
          responsable: 'Moussa DIABATE', titre: 'Commissaire Principal', telephone: '+225 21 37 45 67',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 38, agentsTotal: 45, tauxActivite: 84,
          performance: 89.5, controles: 1398840, evolutionControles: 12.5, revenus: '10.1Mrd',
          evolutionRevenus: 15.2, conformite: 82.3, evolutionConformite: 6.8
        },
        {
          id: 'COM-ABJ-002', nom: '2ème Arrondissement', localisation: 'Plateau, Abidjan',
          responsable: 'Yao KOUASSI', titre: 'Commissaire Principal', telephone: '+225 21 22 34 56',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 40, agentsTotal: 45, tauxActivite: 89,
          performance: 87.9, controles: 1289456, evolutionControles: 11.8, revenus: '9.5Mrd',
          evolutionRevenus: 14.3, conformite: 82.8, evolutionConformite: 6.5
        },
        {
          id: 'COM-ABJ-005', nom: '5ème Arrondissement', localisation: 'Marcory, Abidjan',
          responsable: 'Aminata KONE', titre: 'Commissaire', telephone: '+225 21 26 78 90',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 32, agentsTotal: 38, tauxActivite: 84,
          performance: 85.7, controles: 1156723, evolutionControles: 10.8, revenus: '8.7Mrd',
          evolutionRevenus: 13.4, conformite: 83.1, evolutionConformite: 5.9
        },
        {
          id: 'COM-ABJ-006', nom: '6ème Arrondissement', localisation: 'Treichville, Abidjan',
          responsable: 'Fatou DIALLO', titre: 'Commissaire', telephone: '+225 21 24 56 78',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 35, agentsTotal: 40, tauxActivite: 88,
          performance: 84.2, controles: 1034567, evolutionControles: 9.8, revenus: '7.9Mrd',
          evolutionRevenus: 12.6, conformite: 81.5, evolutionConformite: 5.2
        },
        {
          id: 'COM-ABJ-007', nom: '7ème Arrondissement', localisation: 'Koumassi, Abidjan',
          responsable: 'Sekou TRAORE', titre: 'Commissaire Adjoint', telephone: '+225 21 25 67 89',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 30, agentsTotal: 36, tauxActivite: 83,
          performance: 81.3, controles: 923456, evolutionControles: 8.5, revenus: '7.1Mrd',
          evolutionRevenus: 10.9, conformite: 79.8, evolutionConformite: 4.5
        },
        {
          id: 'COM-ABJ-010', nom: '10ème Arrondissement', localisation: 'Abobo, Abidjan',
          responsable: 'Ibrahim OUATTARA', titre: 'Commissaire Adjoint', telephone: '+225 21 35 89 12',
          statut: 'CRITIQUE', niveau: 'ROUGE', agentsActifs: 25, agentsTotal: 32, tauxActivite: 78,
          performance: 76.4, controles: 892341, evolutionControles: -3.2, revenus: '6.1Mrd',
          evolutionRevenus: -2.8, conformite: 75.8, evolutionConformite: -0.5
        }
      ],
      regions: [
        { name: "Région d'Abidjan", commissariats: 12, agents: 456, performance: 83.5, revenus: "124.8Mrd FCFA" },
        { name: "Région du Centre", commissariats: 8, agents: 287, performance: 78.2, revenus: "87.3Mrd FCFA" },
        { name: "Région de l'Ouest", commissariats: 6, agents: 198, performance: 76.1, revenus: "62.4Mrd FCFA" },
        { name: "Région du Nord", commissariats: 5, agents: 167, performance: 72.5, revenus: "48.9Mrd FCFA" }
      ],
      stats: {
        totalCommissariats: 35,
        totalAgents: 1108,
        totalControles: 5113735,
        totalRevenus: '323.4Mrd',
        performanceMoyenne: 77.6,
        tauxActivite: 80.8,
        commissariatsActifs: 24,
        commissariatsCritiques: 2
      }
    },
    personnalise: {
      activityData: [
        { period: '10/10', controles: 1892, agents: 42, revenus: 13.2 },
        { period: '11/10', controles: 2045, agents: 44, revenus: 14.3 },
        { period: '12/10', controles: 1967, agents: 43, revenus: 13.8 },
        { period: '13/10', controles: 2134, agents: 45, revenus: 14.9 },
        { period: '14/10', controles: 2098, agents: 44, revenus: 14.7 }
      ],
      performanceData: [
        { region: 'Abidjan', performance: 86.2, commissariats: 12 },
        { region: 'Centre', performance: 81.1, commissariats: 8 },
        { region: 'Ouest', performance: 78.5, commissariats: 6 },
        { region: 'Nord', performance: 75.4, commissariats: 5 }
      ],
      pieData: [
        { name: 'Actif', value: 27, color: '#10b981' },
        { name: 'Attention', value: 6, color: '#f59e0b' },
        { name: 'Critique', value: 2, color: '#ef4444' }
      ],
      commissariats: [
        {
          id: 'COM-ABJ-003', nom: '3ème Arrondissement', localisation: 'Adjamé, Abidjan',
          responsable: 'Moussa DIABATE', titre: 'Commissaire Principal', telephone: '+225 21 37 45 67',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 38, agentsTotal: 45, tauxActivite: 84,
          performance: 93.1, controles: 6036, evolutionControles: 9.8, revenus: '43.6M',
          evolutionRevenus: 10.2, conformite: 77.5, evolutionConformite: 5.1
        },
        {
          id: 'COM-ABJ-002', nom: '2ème Arrondissement', localisation: 'Plateau, Abidjan',
          responsable: 'Yao KOUASSI', titre: 'Commissaire Principal', telephone: '+225 21 22 34 56',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 40, agentsTotal: 45, tauxActivite: 89,
          performance: 91.2, controles: 5678, evolutionControles: 8.9, revenus: '41.2M',
          evolutionRevenus: 9.5, conformite: 79.2, evolutionConformite: 4.8
        },
        {
          id: 'COM-ABJ-005', nom: '5ème Arrondissement', localisation: 'Marcory, Abidjan',
          responsable: 'Aminata KONE', titre: 'Commissaire', telephone: '+225 21 26 78 90',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 32, agentsTotal: 38, tauxActivite: 84,
          performance: 88.9, controles: 5234, evolutionControles: 7.3, revenus: '38.2M',
          evolutionRevenus: 8.5, conformite: 79.1, evolutionConformite: 4.2
        },
        {
          id: 'COM-ABJ-006', nom: '6ème Arrondissement', localisation: 'Treichville, Abidjan',
          responsable: 'Fatou DIALLO', titre: 'Commissaire', telephone: '+225 21 24 56 78',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 35, agentsTotal: 40, tauxActivite: 88,
          performance: 86.5, controles: 4789, evolutionControles: 6.5, revenus: '34.8M',
          evolutionRevenus: 7.8, conformite: 77.9, evolutionConformite: 3.5
        },
        {
          id: 'COM-ABJ-007', nom: '7ème Arrondissement', localisation: 'Koumassi, Abidjan',
          responsable: 'Sekou TRAORE', titre: 'Commissaire Adjoint', telephone: '+225 21 25 67 89',
          statut: 'ACTIF', niveau: 'VERT', agentsActifs: 30, agentsTotal: 36, tauxActivite: 83,
          performance: 83.8, controles: 4123, evolutionControles: 5.2, revenus: '29.5M',
          evolutionRevenus: 6.3, conformite: 75.8, evolutionConformite: 2.8
        },
        {
          id: 'COM-ABJ-010', nom: '10ème Arrondissement', localisation: 'Abobo, Abidjan',
          responsable: 'Ibrahim OUATTARA', titre: 'Commissaire Adjoint', telephone: '+225 21 35 89 12',
          statut: 'ATTENTION', niveau: 'ORANGE', agentsActifs: 25, agentsTotal: 32, tauxActivite: 78,
          performance: 75.3, controles: 3456, evolutionControles: -6.5, revenus: '22.8M',
          evolutionRevenus: -7.2, conformite: 71.5, evolutionConformite: -1.9
        }
      ],
      regions: [
        { name: "Région d'Abidjan", commissariats: 12, agents: 456, performance: 86.2, revenus: "387.5M FCFA" },
        { name: "Région du Centre", commissariats: 8, agents: 287, performance: 81.1, revenus: "256.8M FCFA" },
        { name: "Région de l'Ouest", commissariats: 6, agents: 198, performance: 78.5, revenus: "189.3M FCFA" },
        { name: "Région du Nord", commissariats: 5, agents: 167, performance: 75.4, revenus: "145.7M FCFA" }
      ],
      stats: {
        totalCommissariats: 35,
        totalAgents: 1108,
        totalControles: 50136,
        totalRevenus: '979.3M',
        performanceMoyenne: 80.3,
        tauxActivite: 82.5,
        commissariatsActifs: 27,
        commissariatsCritiques: 2
      }
    }
  }

  const currentData = isCustomDateRange ? dataByPeriod.personnalise : dataByPeriod[globalFilter]

  // Obtenir le top 3 des commissariats basé sur la performance
  const top3Commissariats = [...currentData.commissariats]
    .sort((a, b) => b.performance - a.performance)
    .slice(0, 3)

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null || isNaN(num)) {
      return '0'
    }
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const handleFilterChange = (filter: PeriodKey) => {
    setGlobalFilter(filter)
    setIsCustomDateRange(false)
    setDateDebut('')
    setDateFin('')
  }

  const handleCustomDateSearch = () => {
    if (dateDebut && dateFin) {
      setIsCustomDateRange(true)
      setGlobalFilter('personnalise')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    alert('Export des données en cours...\nFormat: CSV/Excel/PDF')
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  const CommissariatCard = ({ commissariat, rank }: { commissariat: Commissariat; rank: number }) => (
    <Card className={`border-t-[3px] ${commissariat.niveau === 'VERT' ? 'border-t-green-500' : commissariat.niveau === 'ORANGE' ? 'border-t-orange-500' : 'border-t-red-500'}`}>
      <CardBody>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
              rank === 1 ? 'bg-yellow-100' : rank === 2 ? 'bg-gray-100' : 'bg-orange-100'
            }`}>
              <Award className={`w-6 h-6 ${
                rank === 1 ? 'text-yellow-600' : rank === 2 ? 'text-gray-600' : 'text-orange-600'
              }`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-2xl font-bold ${
                  rank === 1 ? 'text-yellow-600' : rank === 2 ? 'text-gray-600' : 'text-orange-600'
                }`}>#{rank}</span>
                <h3 className="font-bold text-xl text-slate-900">{commissariat.nom}</h3>
              </div>
              <p className="text-sm text-slate-500 mb-2">{commissariat.id}</p>
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                <MapPin className="w-4 h-4" />
                {commissariat.localisation}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                <Users className="w-4 h-4" />
                {commissariat.titre} {commissariat.responsable}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-4 h-4" />
                {commissariat.telephone}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
              commissariat.statut === 'ACTIF' ? 'bg-green-100 text-green-800' : commissariat.statut === 'ATTENTION' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
            }`}>{commissariat.statut}</span>
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
              commissariat.niveau === 'VERT' ? 'bg-green-100 text-green-800' : commissariat.niveau === 'ORANGE' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
            }`}>{commissariat.niveau}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {commissariat.agentsActifs}/{commissariat.agentsTotal}
            </div>
            <div className="text-sm text-slate-500">Agents Actifs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">{commissariat.performance}%</div>
            <div className="text-sm text-slate-500">Performance</div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <p className="text-sm font-medium text-slate-700 mb-4">Statistiques de la période</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { val: formatNumber(commissariat.controles), label: 'Contrôles', evol: commissariat.evolutionControles },
              { val: commissariat.revenus, label: 'FCFA', evol: commissariat.evolutionRevenus },
              { val: commissariat.conformite + '%', label: 'Conformité', evol: commissariat.evolutionConformite }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-bold text-lg text-slate-900">{stat.val}</div>
                <div className="text-xs text-slate-500 mb-1">{stat.label}</div>
                <div className={`flex items-center justify-center gap-1 text-xs font-medium ${
                  stat.evol > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.evol > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(stat.evol)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-slate-100">
          <Button 
          onClick={() => router.push(`/admin/commissariats/${commissariat.id}`)}
          variant="primary" size="sm" className="flex-1">
            <Eye className="w-4 h-4" />
            Superviser
          </Button>
          <Button variant="outline" size="sm"><Settings className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm"><Edit className="w-4 h-4" /></Button>
        </div>

        {commissariat.niveau === 'ROUGE' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Attention requise - Performance en baisse</span>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Commissariats - Tableau de Bord National</h1>
        <p className="text-slate-600 mt-2">Vue d'ensemble et gestion de tous les commissariats du territoire</p>
      </div>

      {/* Filtre Global de Période */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardBody className="p-4 md:p-6">
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Période d'analyse</h2>
                  <p className="text-gray-600 text-xs md:text-sm hidden sm:block">Sélectionnez la période pour filtrer toutes les données</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  onClick={() => handleFilterChange('jour')}
                  className={`${globalFilter === 'jour' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Aujourd'hui
                </Button>
                <Button 
                  onClick={() => handleFilterChange('semaine')}
                  className={`${globalFilter === 'semaine' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Semaine
                </Button>
                <Button 
                  onClick={() => handleFilterChange('mois')}
                  className={`${globalFilter === 'mois' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Mois
                </Button>
                <Button 
                  onClick={() => handleFilterChange('annee')}
                  className={`${globalFilter === 'annee' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Année
                </Button>
                <Button 
                  onClick={() => handleFilterChange('tout')}
                  className={`${globalFilter === 'tout' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Tout
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-4 border-t border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">Date début:</label>
                <input 
                  type="date" 
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">Date fin:</label>
                <input 
                  type="date" 
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                />
              </div>
              
              <Button 
                onClick={handleCustomDateSearch}
                disabled={!dateDebut || !dateFin}
                className={`${!dateDebut || !dateFin ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'} flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2 w-full sm:w-auto`}
              >
                <Search className="w-4 h-4" />
                Rechercher
              </Button>

              <div className="hidden sm:block w-px h-8 bg-blue-300"></div>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  onClick={handlePrint}
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2"
                >
                  <Printer className="w-4 h-4" />
                  Imprimer
                </Button>
                
                <Button 
                  onClick={handleExport}
                  className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2"
                >
                  <FileDown className="w-4 h-4" />
                  Exporter
                </Button>
              </div>
            </div>
            
            {isCustomDateRange && (
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg w-full sm:w-auto">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs md:text-sm font-medium">Période personnalisée active</span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Statistiques - 8 cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-t-4 border-blue-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">COMMISSARIATS</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats?.totalCommissariats || 'N/A'}</div>
            <div className="text-gray-600 text-sm font-bold">Total national</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-green-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">AGENTS TOTAUX</h3>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{formatNumber(currentData.stats?.totalAgents)}</div>
            <div className="text-green-600 text-sm font-bold">Effectif national</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-purple-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">CONTRÔLES TOTAUX</h3>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{formatNumber(currentData.stats?.totalControles)}</div>
            <div className="text-purple-600 text-sm font-bold">Période sélectionnée</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-orange-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">REVENUS TOTAUX</h3>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats?.totalRevenus || 'N/A'}</div>
            <div className="text-orange-600 text-sm font-bold">FCFA collectés</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-teal-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">PERFORMANCE MOYENNE</h3>
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-teal-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats?.performanceMoyenne || 'N/A'}%</div>
            <div className="text-teal-600 text-sm font-bold">Score national</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-indigo-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">TAUX D'ACTIVITÉ</h3>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats?.tauxActivite || 'N/A'}%</div>
            <div className="text-indigo-600 text-sm font-bold">Agents opérationnels</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-green-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">COMMISSARIATS ACTIFS</h3>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats?.commissariatsActifs || 'N/A'}</div>
            <div className="text-green-600 text-sm font-bold">Statut opérationnel</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-red-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">CRITIQUES</h3>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats?.commissariatsCritiques || 'N/A'}</div>
            <div className="text-red-600 text-sm font-bold">Nécessitent attention</div>
          </CardBody>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardBody className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Évolution des contrôles et agents actifs</h3>
            
            <div className="h-80 w-full">
              {currentData.activityData && currentData.activityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={currentData.activityData} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    barGap={8}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis 
                      dataKey="period" 
                      stroke="#6b7280" 
                      fontSize={12}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#6b7280" 
                      fontSize={12}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      align="center"
                      height={50}
                      iconType="circle"
                      wrapperStyle={{ paddingBottom: '20px' }}
                    />
                    <Bar 
                      dataKey="controles" 
                      fill="#6B9FED" 
                      radius={[8, 8, 0, 0]}
                      maxBarSize={50}
                      name="Contrôles"
                      isAnimationActive={false}
                    />
                    <Bar 
                      dataKey="agents" 
                      fill="#10B981" 
                      radius={[8, 8, 0, 0]}
                      maxBarSize={50}
                      name="Agents actifs"
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Chargement des données...</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Statuts Commissariats
            </h3>
            
            <div className="h-64 w-full">
              {currentData.pieData && currentData.pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentData.pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry:any) => `${(entry.percent * 100).toFixed(1)}%`}
                      outerRadius={80}
                      dataKey="value"
                      isAnimationActive={false}
                    >
                      {currentData.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Chargement des données...</p>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              {currentData.pieData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Performance par région */}
      <Card>
        <CardBody className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Performance par région</h3>
          <div className="space-y-4">
            {currentData.performanceData && currentData.performanceData.length > 0 ? (
              currentData.performanceData.map((region, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-semibold text-slate-900">{region.region}</span>
                        <span className="text-sm text-slate-500 ml-2">({region.commissariats} commissariats)</span>
                      </div>
                      <span className="font-bold text-slate-900">{region.performance}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${region.performance}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">Aucune donnée disponible</div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Régions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentData.regions.map((region, index) => (
          <Card key={index}>
            <CardBody className="p-6">
              <div className="mb-4">
                <h3 className="font-medium text-slate-700 text-sm mb-2">{region.name}</h3>
                <div className="flex items-baseline gap-4">
                  <span className="text-3xl font-bold text-slate-900">{region.commissariats}</span>
                  <span className="text-2xl font-bold text-blue-600">{region.performance}%</span>
                </div>
                <p className="text-sm text-slate-500 mt-1">{region.agents} agents</p>
                <p className="text-xs text-slate-400 mt-2">Performance</p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-600 mb-1">Revenus</p>
                <p className="text-lg font-bold text-green-600">{region.revenus}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Top 3 Commissariats */}
      <Card className="mb-8">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Top 3 des Meilleurs Commissariats</h2>
              <p className="text-slate-600 mt-1">Classement basé sur la performance globale</p>
            </div>
            <Button variant="warning" size="md">
              Voir Commissariats
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {top3Commissariats.map((commissariat, index) => (
          <CommissariatCard key={commissariat.id} commissariat={commissariat} rank={index + 1} />
        ))}
      </div>
    </div>
  )
}