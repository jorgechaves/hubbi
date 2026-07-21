export class ActionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ActionError'
  }
}

type StringOptions = {
  max?: number
}

type UrlOptions = {
  optional?: boolean
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function actionErrorMessage(error: unknown) {
  if (error instanceof ActionError) return error.message
  return 'Não foi possível concluir a operação. Tente novamente.'
}

export function sanitizeRedirectPath(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== 'string') return '/dashboard'

  const path = value.trim()
  if (!path.startsWith('/') || path.startsWith('//')) return '/dashboard'
  if (/[\r\n\t\0]/.test(path)) return '/dashboard'

  return path
}

export function getRequiredString(
  formData: FormData,
  name: string,
  label: string,
  options: StringOptions = {}
) {
  const value = formData.get(name)
  if (typeof value !== 'string') {
    throw new ActionError(`${label} é obrigatório.`)
  }

  const trimmed = value.trim()
  if (!trimmed) {
    throw new ActionError(`${label} é obrigatório.`)
  }

  if (options.max && trimmed.length > options.max) {
    throw new ActionError(`${label} deve ter no máximo ${options.max} caracteres.`)
  }

  return trimmed
}

export function getOptionalString(
  formData: FormData,
  name: string,
  label: string,
  options: StringOptions = {}
) {
  const value = formData.get(name)
  if (value == null) return null
  if (typeof value !== 'string') {
    throw new ActionError(`${label} inválido.`)
  }

  const trimmed = value.trim()
  if (!trimmed) return null

  if (options.max && trimmed.length > options.max) {
    throw new ActionError(`${label} deve ter no máximo ${options.max} caracteres.`)
  }

  return trimmed
}

export function getOptionalPassword(formData: FormData) {
  const password = getOptionalString(formData, 'temporary_password', 'Senha temporária', { max: 256 })
  if (password === null) return null

  const confirmation = getRequiredString(formData, 'password_confirmation', 'Confirmação de senha', { max: 256 })
  if (password.length < 8) throw new ActionError('A senha temporária deve ter no mínimo 8 caracteres.')
  if (password !== confirmation) throw new ActionError('As senhas não coincidem.')
  return password
}

export function parseRole(value: FormDataEntryValue | string | null | undefined) {
  if (value == null || value === '') return 'user'
  if (value === 'admin' || value === 'user') return value
  throw new ActionError('Role inválida.')
}

export function parseBoolean(value: FormDataEntryValue | string | null | undefined, label: string) {
  if (value === 'true') return true
  if (value === 'false') return false
  throw new ActionError(`${label} inválido.`)
}

export function parseUuid(value: string, label: string) {
  if (!UUID_RE.test(value)) throw new ActionError(`${label} inválido.`)
  return value
}

export function parseUuidList(values: FormDataEntryValue[] | string[], label: string) {
  const unique = new Set<string>()

  values.forEach(value => {
    if (typeof value !== 'string') throw new ActionError(`${label} inválido.`)
    const trimmed = value.trim()
    if (!trimmed) return
    unique.add(parseUuid(trimmed, label))
  })

  return [...unique]
}

export function parseHttpUrl(
  value: FormDataEntryValue | string | null | undefined,
  label: string,
  options: UrlOptions = {}
) {
  if (typeof value !== 'string' || !value.trim()) {
    if (options.optional) return null
    throw new ActionError(`${label} é obrigatória.`)
  }

  const trimmed = value.trim()

  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new ActionError(`${label} deve usar http ou https.`)
    }
    return url.toString()
  } catch (error) {
    if (error instanceof ActionError) throw error
    throw new ActionError(`${label} inválida.`)
  }
}
