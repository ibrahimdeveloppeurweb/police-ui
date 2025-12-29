"use client"

import React, { useState } from 'react'
import { Plus, FileText, Shield, Gauge, Wrench, Truck, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Radio } from '@/components/ui/Radio'
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from '@/components/ui/Modal'

type InfractionFormData = {
  nom: string
  categorie: string
  description: string
  amende: string
  points: string
  gravite: 'faible' | 'moyenne' | 'elevee'
}

type InfractionCategory = {
  id: string
  title: string
  icon: React.ElementType
}

const categoriesData: InfractionCategory[] = [
  { id: 'documents', title: 'Documents', icon: FileText },
  { id: 'securite', title: 'Sécurité', icon: Shield },
  { id: 'comportement', title: 'Comportement', icon: Gauge },
  { id: 'etat-technique', title: 'État technique', icon: Wrench },
  { id: 'chargement', title: 'Chargement', icon: Truck },
  { id: 'environnement', title: 'Environnement', icon: Leaf }
]

interface InfractionFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: InfractionFormData) => void
}

export default function InfractionForm({ isOpen, onClose, onSubmit }: InfractionFormProps) {
  const [formData, setFormData] = useState<InfractionFormData>({
    nom: '',
    categorie: '',
    description: '',
    amende: '',
    points: '',
    gravite: 'moyenne'
  })

  const handleSubmit = () => {
    if (!formData.nom || !formData.categorie || !formData.amende || !formData.points) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }
    
    onSubmit(formData)
    // Réinitialiser le formulaire
    setFormData({
      nom: '',
      categorie: '',
      description: '',
      amende: '',
      points: '',
      gravite: 'moyenne'
    })
    onClose()
  }

  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>Nouvelle Infraction</ModalTitle>
        <ModalClose onClick={onClose} />
      </ModalHeader>

      <ModalBody>
        <div className="space-y-5">
          {/* Nom de l'infraction */}
          <div>
            <label htmlFor="nom" className="block text-sm font-semibold text-slate-700 mb-2">
              Nom de l'infraction <span className="text-red-600">*</span>
            </label>
            <Input
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={(e) => handleChange('nom', e.target.value)}
              placeholder="Ex: Excès de vitesse"
              inputSize="md"
              variant="default"
            />
          </div>

          {/* Catégorie */}
          <div>
            <label htmlFor="categorie" className="block text-sm font-semibold text-slate-700 mb-2">
              Catégorie <span className="text-red-600">*</span>
            </label>
            <Select
              id="categorie"
              name="categorie"
              value={formData.categorie}
              onChange={(e) => handleChange('categorie', e.target.value)}
              selectSize="md"
              variant="default"
            >
              <option value="">Sélectionner une catégorie</option>
              {categoriesData.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </Select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Description détaillée de l'infraction"
              textareaSize="md"
              variant="default"
            />
          </div>

          {/* Montant et Points */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="amende" className="block text-sm font-semibold text-slate-700 mb-2">
                Montant amende (FCFA) <span className="text-red-600">*</span>
              </label>
              <Input
                type="number"
                id="amende"
                name="amende"
                min="0"
                value={formData.amende}
                onChange={(e) => handleChange('amende', e.target.value)}
                placeholder="50000"
                inputSize="md"
                variant="default"
              />
            </div>

            <div>
              <label htmlFor="points" className="block text-sm font-semibold text-slate-700 mb-2">
                Points retirés <span className="text-red-600">*</span>
              </label>
              <Input
                type="number"
                id="points"
                name="points"
                min="0"
                max="12"
                value={formData.points}
                onChange={(e) => handleChange('points', e.target.value)}
                placeholder="2"
                inputSize="md"
                variant="default"
              />
            </div>
          </div>

          {/* Gravité avec Radio buttons */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Niveau de gravité <span className="text-red-600">*</span>
            </label>
            <div className="flex gap-4">
                  {[
                { value: 'faible', label: 'Faible', color: 'bg-green-50 border-green-200 text-green-700' },
                { value: 'moyenne', label: 'Moyenne', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
                { value: 'elevee', label: 'Élevée', color: 'bg-red-50 border-red-200 text-red-700' }
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex-1 cursor-pointer border-2 rounded-xl p-3 text-center font-semibold transition-all ${
                    formData.gravite === option.value
                      ? option.color
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="gravite"
                    value={option.value}
                    checked={formData.gravite === option.value}
                    onChange={(e) => handleChange('gravite', e.target.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button 
          variant="outline" 
          size="md"
          onClick={onClose}
        >
          Annuler
        </Button>
      <Button 
        variant="primary" 
        size="md" 
        onClick={handleSubmit}
        className="bg-[#16a34a] hover:bg-[#15803d] border-[#16a34a]"
      >
        <Plus className="w-5 h-5" />
        Ajouter l'infraction
      </Button>
      </ModalFooter>
    </Modal>
  )
}