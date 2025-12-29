'use client'

import { useState } from 'react'
import { 
  Book, FileText, Code, Users, HelpCircle, ChevronRight, 
  ExternalLink, Search, Home, Settings, Shield, BarChart3
} from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import HelpButton from '@/components/ui/HelpButton'

interface DocSection {
  id: string
  title: string
  icon: any
  description: string
  items: {
    title: string
    description: string
    path: string
    category: 'technical' | 'user' | 'project'
  }[]
}

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'technical' | 'user' | 'project'>('all')

  const docSections: DocSection[] = [
    {
      id: 'technical',
      title: 'Documentation Technique',
      icon: Code,
      description: 'Documentation pour les développeurs',
      items: [
        {
          title: 'Architecture',
          description: 'Architecture du système, structure, flux de données',
          path: '/docs/technical/ARCHITECTURE.md',
          category: 'technical'
        },
        {
          title: 'Guide de Développement',
          description: 'Comment développer et contribuer au projet',
          path: '/docs/technical/DEVELOPMENT.md',
          category: 'technical'
        },
        {
          title: 'Documentation API',
          description: 'Documentation complète de l\'API backend',
          path: '/docs/technical/API.md',
          category: 'technical'
        },
        {
          title: 'Guide Frontend',
          description: 'Documentation du frontend Next.js',
          path: '/docs/technical/FRONTEND.md',
          category: 'technical'
        },
        {
          title: 'Guide Backend',
          description: 'Documentation du backend Go',
          path: '/docs/technical/BACKEND.md',
          category: 'technical'
        },
        {
          title: 'Déploiement',
          description: 'Guide de déploiement et configuration',
          path: '/docs/technical/DEPLOYMENT.md',
          category: 'technical'
        }
      ]
    },
    {
      id: 'user',
      title: 'Documentation Utilisateur',
      icon: Users,
      description: 'Guides pour les utilisateurs finaux',
      items: [
        {
          title: 'Guide Admin',
          description: 'Guide complet pour les administrateurs',
          path: '/docs/user/USER_GUIDE_ADMIN.md',
          category: 'user'
        },
        {
          title: 'Guide Gestion',
          description: 'Guide complet pour les commissariats',
          path: '/docs/user/USER_GUIDE_GESTION.md',
          category: 'user'
        },
        {
          title: 'FAQ',
          description: 'Questions fréquemment posées',
          path: '/docs/user/FAQ.md',
          category: 'user'
        },
        {
          title: 'Aide Contextuelle',
          description: 'Comment utiliser le système d\'aide intégré',
          path: '/docs/user/CONTEXTUAL_HELP.md',
          category: 'user'
        }
      ]
    },
    {
      id: 'project',
      title: 'Documentation Projet',
      icon: Settings,
      description: 'Informations sur le projet',
      items: [
        {
          title: 'Vue d\'ensemble',
          description: 'Présentation générale du projet',
          path: '/docs/project/OVERVIEW.md',
          category: 'project'
        },
        {
          title: 'Roadmap',
          description: 'Feuille de route et planification',
          path: '/docs/project/ROADMAP.md',
          category: 'project'
        },
        {
          title: 'Changelog',
          description: 'Historique des versions et changements',
          path: '/docs/project/CHANGELOG.md',
          category: 'project'
        },
        {
          title: 'Contribution',
          description: 'Comment contribuer au projet',
          path: '/docs/project/CONTRIBUTING.md',
          category: 'project'
        }
      ]
    }
  ]

  const filteredSections = docSections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  })).filter(section => section.items.length > 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec aide */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Book className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Documentation</h1>
                <p className="text-sm text-gray-600">Documentation complète du système</p>
              </div>
            </div>
            <HelpButton />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barre de recherche et filtres */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher dans la documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtres par catégorie */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setSelectedCategory('all')}
              variant={selectedCategory === 'all' ? 'primary' : 'outline'}
              size="sm"
            >
              Tous
            </Button>
            <Button
              onClick={() => setSelectedCategory('technical')}
              variant={selectedCategory === 'technical' ? 'primary' : 'outline'}
              size="sm"
            >
              <Code className="w-4 h-4 mr-2" />
              Technique
            </Button>
            <Button
              onClick={() => setSelectedCategory('user')}
              variant={selectedCategory === 'user' ? 'primary' : 'outline'}
              size="sm"
            >
              <Users className="w-4 h-4 mr-2" />
              Utilisateur
            </Button>
            <Button
              onClick={() => setSelectedCategory('project')}
              variant={selectedCategory === 'project' ? 'primary' : 'outline'}
              size="sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              Projet
            </Button>
          </div>
        </div>

        {/* Sections de documentation */}
        <div className="space-y-8">
          {filteredSections.map((section) => {
            const Icon = section.icon
            return (
              <div key={section.id}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.items.map((item, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardBody className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                          <ExternalLink className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(item.path, '_blank')}
                          className="w-full"
                        >
                          Consulter
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Message si aucun résultat */}
        {filteredSections.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun résultat</h3>
            <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
          </div>
        )}

        {/* Liens rapides */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Liens Rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Accueil</h4>
                    <p className="text-sm text-gray-600">Retour à l'accueil</p>
                  </div>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Support</h4>
                    <p className="text-sm text-gray-600">Contactez le support</p>
                  </div>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Statistiques</h4>
                    <p className="text-sm text-gray-600">Voir les statistiques</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

