'use client'

import React, { useState, useMemo } from 'react'
import { Plus, MapPin, Phone, Mail, Navigation, Search, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from '@/components/ui/Modal'

type PoliceStationFormData = {
  code: string
  name: string
  arrondissement_id: string
  address: string
  phone: string
  email: string
  latitude: string
  longitude: string
  type: 'CENTRAL' | 'DISTRICT' | 'MUNICIPAL' | 'SPECIAL'
  jurisdiction: string
}

interface PoliceStationFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PoliceStationFormData) => void
  arrondissements?: Array<{ id: string; name: string }>
}

const stationTypes = [
  { value: 'CENTRAL', label: 'Commissariat Central' },
  { value: 'DISTRICT', label: 'Commissariat de District' },
  { value: 'MUNICIPAL', label: 'Commissariat Municipal' },
  { value: 'SPECIAL', label: 'Commissariat Spécial' },
]

export default function PoliceStationForm({
  isOpen,
  onClose,
  onSubmit,
  arrondissements = [],
}: PoliceStationFormProps) {
  const [formData, setFormData] = useState<PoliceStationFormData>({
    code: '',
    name: '',
    arrondissement_id: '',
    address: '',
    phone: '',
    email: '',
    latitude: '',
    longitude: '',
    type: 'DISTRICT',
    jurisdiction: '',
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // ✅ Filtrer les arrondissements avec protection
  const filteredArrondissements = useMemo(() => {
    if (!Array.isArray(arrondissements)) return []
    if (!searchTerm) return arrondissements
    return arrondissements.filter((arr) =>
      arr.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [arrondissements, searchTerm])

  // ✅ Trouver l’arrondissement sélectionné avec sécurité
  const selectedArrondissement = useMemo(() => {
    if (!Array.isArray(arrondissements)) return undefined
    return arrondissements.find((arr) => arr.id === formData.arrondissement_id)
  }, [arrondissements, formData.arrondissement_id])

  const handleSubmit = () => {
    if (!formData.code || !formData.name || !formData.arrondissement_id || !formData.address || !formData.type) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      alert('Veuillez entrer une adresse email valide')
      return
    }

    onSubmit(formData)
    setFormData({
      code: '',
      name: '',
      arrondissement_id: '',
      address: '',
      phone: '',
      email: '',
      latitude: '',
      longitude: '',
      type: 'DISTRICT',
      jurisdiction: '',
    })
    setSearchTerm('')
    setIsDropdownOpen(false)
    onClose()
  }

  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleCoordinateChange = (field: 'latitude' | 'longitude', value: string) => {
    if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
      setFormData({
        ...formData,
        [field]: value,
      })
    }
  }

  const handleArrondissementSelect = (arrondissementId: string) => {
    handleChange('arrondissement_id', arrondissementId)
    setIsDropdownOpen(false)
    setSearchTerm('')
  }

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen)
    setSearchTerm('')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>Nouveau Commissariat</ModalTitle>
        <ModalClose onClick={onClose} />
      </ModalHeader>

      <ModalBody>
        <div className="space-y-5">
          {/* Code et Nom */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="code" className="block text-sm font-semibold text-slate-700 mb-2">
                Code <span className="text-red-600">*</span>
              </label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                placeholder="Ex: COM-001"
                inputSize="md"
                variant="default"
                maxLength={20}
              />
              <p className="text-xs text-slate-500 mt-1">Max. 20 caractères</p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                Nom <span className="text-red-600">*</span>
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ex: Commissariat Central"
                inputSize="md"
                variant="default"
                maxLength={100}
              />
              <p className="text-xs text-slate-500 mt-1">Max. 100 caractères</p>
            </div>
          </div>

          {/* Type et Arrondissement */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-semibold text-slate-700 mb-2">
                Type <span className="text-red-600">*</span>
              </label>
              <Select
                id="type"
                name="type"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                selectSize="md"
                variant="default"
              >
                {stationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Arrondissement <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white cursor-pointer hover:border-slate-400 transition-colors"
                  onClick={handleDropdownToggle}
                >
                  <div className="flex items-center justify-between">
                    <span className={selectedArrondissement ? 'text-slate-900' : 'text-slate-500'}>
                      {selectedArrondissement ? selectedArrondissement.name : 'Sélectionner un arrondissement'}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform ${
                        isDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    <div className="p-2 border-b border-slate-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Rechercher un arrondissement..."
                          className="pl-10 w-full"
                          inputSize="sm"
                          variant="default"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    <div className="py-1">
                      {filteredArrondissements.length > 0 ? (
                        filteredArrondissements.map((arr) => (
                          <div
                            key={arr.id}
                            className={`px-3 py-2 cursor-pointer hover:bg-slate-100 transition-colors ${
                              formData.arrondissement_id === arr.id ? 'bg-blue-50 text-blue-700' : ''
                            }`}
                            onClick={() => handleArrondissementSelect(arr.id)}
                          >
                            {arr.name}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-slate-500 text-center">Aucun arrondissement trouvé</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div>
            <label htmlFor="address" className="block text-sm font-semibold text-slate-700 mb-2">
              Adresse <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Adresse complète du commissariat"
                inputSize="md"
                variant="default"
                className="pl-10"
                maxLength={255}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">Max. 255 caractères</p>
          </div>

          {/* Téléphone et Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                Téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+225 XX XX XX XX"
                  inputSize="md"
                  variant="default"
                  className="pl-10"
                  maxLength={20}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@example.com"
                  inputSize="md"
                  variant="default"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Coordonnées GPS */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Coordonnées GPS</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-xs text-slate-600 mb-1">
                  Latitude
                </label>
                <div className="relative">
                  <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="latitude"
                    name="latitude"
                    value={formData.latitude}
                    onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
                    placeholder="5.3456"
                    inputSize="md"
                    variant="default"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="longitude" className="block text-xs text-slate-600 mb-1">
                  Longitude
                </label>
                <div className="relative">
                  <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="longitude"
                    name="longitude"
                    value={formData.longitude}
                    onChange={(e) => handleCoordinateChange('longitude', e.target.value)}
                    placeholder="-4.1234"
                    inputSize="md"
                    variant="default"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Juridiction */}
          <div>
            <label htmlFor="jurisdiction" className="block text-sm font-semibold text-slate-700 mb-2">
              Juridiction
            </label>
            <Textarea
              id="jurisdiction"
              name="jurisdiction"
              rows={2}
              value={formData.jurisdiction}
              onChange={(e) => handleChange('jurisdiction', e.target.value)}
              placeholder="Description de la juridiction du commissariat..."
              textareaSize="md"
              variant="default"
            />
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" size="md" onClick={onClose}>
          Annuler
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 border-blue-600"
        >
          <Plus className="w-5 h-5" />
          Créer le commissariat
        </Button>
      </ModalFooter>
    </Modal>
  )
}
