'use client'

import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from './Modal'
import { HelpContent } from '@/lib/help-content'
import { HelpCircle, Lightbulb, CheckCircle } from 'lucide-react'
import { Button } from './Button'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
  content: HelpContent
}

export default function HelpModal({ isOpen, onClose, content }: HelpModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-blue-600" />
          </div>
          <ModalTitle>{content.title}</ModalTitle>
        </div>
        <ModalClose onClick={onClose} />
      </ModalHeader>
      
      <ModalBody>
        <div className="space-y-6">
          {/* Description */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <p className="text-gray-700 text-sm leading-relaxed">{content.description}</p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {content.sections.map((section, index) => (
              <div key={index} className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  {section.title}
                </h3>
                <ul className="space-y-2 ml-7">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-gray-700 text-sm leading-relaxed flex items-start gap-2">
                      <span className="text-blue-600 mt-1.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Tips */}
          {content.tips && content.tips.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-gray-900">Astuces</h3>
              </div>
              <ul className="space-y-2">
                {content.tips.map((tip, index) => (
                  <li key={index} className="text-gray-700 text-sm leading-relaxed">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </ModalBody>
      
      <ModalFooter>
        <Button 
          onClick={onClose}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          J'ai compris
        </Button>
      </ModalFooter>
    </Modal>
  )
}

