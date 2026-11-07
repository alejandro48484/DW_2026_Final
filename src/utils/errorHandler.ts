import axios from 'axios'

// TODO 5.1: convierte cualquier error en mensaje legible en español
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Sin conexión. Verifique su internet.'
    const status = error.response.status
    if (status === 400) return error.response.data?.message ?? 'Solicitud incorrecta.'
    if (status === 401) return 'Credenciales incorrectas o sesión expirada.'
    if (status === 403) return 'No tiene permiso para realizar esta acción.'
    if (status === 404) return error.response.data?.message ?? 'Recurso no encontrado.'
    if (status >= 500) return 'Error en el servidor. Intente más tarde.'
    return error.response.data?.message ?? 'Ocurrió un error inesperado.'
  }
  if (error instanceof Error) return error.message
  return 'Ocurrió un error desconocido.'
}