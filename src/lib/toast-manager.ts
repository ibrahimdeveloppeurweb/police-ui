// Gestionnaire global de toasts pour les modules non-React (comme le client API)

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastEvent {
  message: string
  type: ToastType
  duration?: number
}

type ToastListener = (toast: ToastEvent) => void

class ToastManager {
  private listeners: ToastListener[] = []

  // Enregistrer un listener (utilisé par le ToastProvider)
  subscribe(listener: ToastListener): () => void {
    this.listeners.push(listener)
    
    // Retourner une fonction pour se désabonner
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // Afficher un toast (peut être appelé depuis n'importe où)
  show(message: string, type: ToastType = 'info', duration: number = 5000): void {
    if (typeof window === 'undefined') return // SSR
    
    const toast: ToastEvent = { message, type, duration }
    this.listeners.forEach(listener => {
      try {
        listener(toast)
      } catch (error) {
        console.error('Erreur lors de l\'affichage du toast:', error)
      }
    })
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration)
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration)
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration)
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration)
  }

  // Déterminer le type de toast selon le status code HTTP
  getToastTypeFromStatusCode(statusCode: number): ToastType {
    if (statusCode >= 200 && statusCode < 300) {
      return 'success'
    } else if (statusCode >= 400 && statusCode < 500) {
      if (statusCode === 429) {
        return 'warning' // Too Many Requests
      }
      return 'error'
    } else if (statusCode >= 500) {
      return 'error'
    }
    return 'info'
  }
}

// Instance singleton globale
export const toastManager = new ToastManager()

// Fonction helper pour afficher un toast depuis n'importe où
export const showToast = (message: string, type?: ToastType, duration?: number) => {
  toastManager.show(message, type, duration)
}

