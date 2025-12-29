import Swal from 'sweetalert2'

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
})

export const toast = {
  success: (message: string, options?: { id?: string }) => {
    return Toast.fire({
      icon: 'success',
      title: message
    })
  },
  
  error: (message: string, options?: { id?: string }) => {
    return Toast.fire({
      icon: 'error',
      title: message
    })
  },
  
  loading: (message: string, options?: { id?: string }) => {
    return Swal.fire({
      title: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })
  },
  
  info: (message: string) => {
    return Toast.fire({
      icon: 'info',
      title: message
    })
  },
  
  warning: (message: string) => {
    return Toast.fire({
      icon: 'warning',
      title: message
    })
  }
}
