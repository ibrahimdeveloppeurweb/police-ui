'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { HelpCircle } from 'lucide-react'
import HelpModal from './HelpModal'
import { getHelpContent } from '@/lib/help-content'

interface HelpButtonProps {
  className?: string
  variant?: 'default' | 'floating'
}

export default function HelpButton({ className = '', variant = 'default' }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const helpContent = getHelpContent(pathname)

  // Ne pas afficher le bouton si pas de contenu d'aide
  if (!helpContent) {
    return null
  }

  if (variant === 'floating') {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 z-40 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group ${className}`}
          aria-label="Aide"
          title="Aide"
        >
          <HelpCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
        <HelpModal 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)} 
          content={helpContent}
        />
      </>
    )
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 hover:text-blue-600 ${className}`}
        aria-label="Aide"
        title="Aide sur cette page"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
      <HelpModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        content={helpContent}
      />
    </>
  )
}

