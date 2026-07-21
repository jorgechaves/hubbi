import { ActionError } from './forms.ts'

export function assertUserDeletionAllowed(input: {
  targetId: string
  currentUserId: string
  targetRole: string
  targetActive: boolean
  activeAdminCount: number
}) {
  if (input.targetId === input.currentUserId) throw new ActionError('Você não pode excluir a própria conta.')
  if (input.targetRole === 'admin' && input.targetActive && input.activeAdminCount <= 1) {
    throw new ActionError('Não é possível excluir o último administrador ativo.')
  }
}
