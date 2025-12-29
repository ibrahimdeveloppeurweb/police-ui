"use client"

import { HTMLAttributes, forwardRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ')
}

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ isOpen, onClose, className, children, ...props }, ref) => {
    const [mounted, setMounted] = useState(false)
    const [shouldAnimate, setShouldAnimate] = useState(false)
    const [portalElement, setPortalElement] = useState<HTMLElement | null>(null)

    // Get portal element on client side
    useEffect(() => {
      setPortalElement(document.body)
    }, [])

    useEffect(() => {
      if (isOpen) {
        setMounted(true)
        document.body.style.overflow = 'hidden'
        const timer = setTimeout(() => {
          setShouldAnimate(true)
        }, 50)
        return () => clearTimeout(timer)
      } else {
        setShouldAnimate(false)
        const timer = setTimeout(() => {
          setMounted(false)
          document.body.style.overflow = ''
          document.body.style.paddingRight = ''
          document.documentElement.style.overflow = ''
        }, 300)
        return () => clearTimeout(timer)
      }
    }, [isOpen])

    // Cleanup forcé au unmount du composant (navigation, etc.)
    useEffect(() => {
      return () => {
        // Force le déblocage du scroll quand le composant se démonte
        if (typeof document !== 'undefined') {
          document.body.style.overflow = ''
          document.body.style.paddingRight = ''
          document.documentElement.style.overflow = ''
        }
      }
    }, [])

    // Don't render if not mounted or no portal element
    if (!mounted || !portalElement) return null

    const modalContent = (
      <div className="fixed inset-0 z-[9999] overflow-y-auto">
        {/* Backdrop - onClick retiré */}
        <div
          className={cn(
            'fixed inset-0 bg-black/60 backdrop-blur-sm',
            'transition-opacity duration-300',
            shouldAnimate ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* Container centré */}
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
          {/* Modal Content */}
          <div
            ref={ref}
            className={cn(
              'relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl',
              'transition-all duration-300 ease-out',
              'my-auto',
              shouldAnimate
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 translate-y-8',
              className
            )}
            style={{
              maxHeight: 'calc(100vh - 4rem)',
              transformOrigin: 'center center'
            }}
            onClick={(e) => e.stopPropagation()}
            {...props}
          >
            <div className="flex flex-col" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
              {children}
            </div>
          </div>
        </div>
      </div>
    )

    return createPortal(modalContent, portalElement)
  }
)

Modal.displayName = 'Modal'

const ModalHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between p-6 border-b border-slate-200 bg-white rounded-t-2xl',
          'flex-shrink-0',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ModalHeader.displayName = 'ModalHeader'

const ModalTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn('text-2xl font-bold text-slate-900', className)}
        {...props}
      />
    )
  }
)

ModalTitle.displayName = 'ModalTitle'

const ModalClose = forwardRef<HTMLButtonElement, HTMLAttributes<HTMLButtonElement>>(
  ({ className, onClick, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'rounded-full p-2 hover:bg-slate-100 active:bg-slate-200',
          'transition-all duration-200 ease-out cursor-pointer',
          'hover:scale-110 active:scale-95 hover:rotate-90',
          className
        )}
        onClick={onClick}
        {...props}
      >
        <X className="w-5 h-5 text-slate-600" />
      </button>
    )
  }
)

ModalClose.displayName = 'ModalClose'

const ModalBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'p-6 overflow-y-auto flex-1',
          className
        )}
        style={{ maxHeight: 'calc(100vh - 16rem)' }}
        {...props}
      />
    )
  }
)

ModalBody.displayName = 'ModalBody'

const ModalFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl',
          'flex-shrink-0',
          className
        )}
        {...props}
      />
    )
  }
)

ModalFooter.displayName = 'ModalFooter'

// Exemple d'utilisation
export default function App() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Modal - Fermeture contrôlée</h1>
        <p className="text-slate-600 mb-8">
          Cette modal ne peut être fermée que via le bouton close (X). 
          Le clic sur le backdrop et la touche Escape sont désactivés.
        </p>
        
        <button
          onClick={() => setIsOpen(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 active:scale-95 transition-all"
        >
          Ouvrir la modal
        </button>

        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <ModalHeader>
            <ModalTitle>Titre de la modal</ModalTitle>
            <ModalClose onClick={() => setIsOpen(false)} />
          </ModalHeader>
          
          <ModalBody>
            <p className="text-slate-700 mb-4">
              Essayez de cliquer en dehors de cette modal ou d'appuyer sur Escape...
              Ça ne fonctionnera pas ! 😊
            </p>
            <p className="text-slate-700 mb-4">
              Seul le bouton X en haut à droite permet de fermer cette modal.
            </p>
            <p className="text-slate-700">
              Ceci est utile pour les formulaires importants ou les actions critiques
              où vous voulez vous assurer que l'utilisateur ferme intentionnellement la modal.
            </p>
          </ModalBody>
          
          <ModalFooter>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Confirmer
            </button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  )
}

export { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter }