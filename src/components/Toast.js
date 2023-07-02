import { toast } from 'react-toastify'

const _toast = {}

const baseConfig = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: true,
  closeOnClick: false,
  pauseOnHover: false,
  draggable: false,
  progress: false,
  icon: false,
}

_toast.success = function (msg) {
  toast.success(msg, {
    ...baseConfig,
    className: 'toast-container toast-success-container',
  })
}

_toast.error = function (msg) {
  toast.error(msg, {
    ...baseConfig,
    className: 'toast-container toast-error-container',
  })
}

export { _toast as toast }
