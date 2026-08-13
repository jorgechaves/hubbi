'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { actionErrorMessage, getPasswordChangeInput, getRequiredString, sanitizeRedirectPath } from '@/lib/security/forms'
import { resolveSiteUrl } from '@/lib/security/site-url'

export async function login(formData: FormData) {
  const supabase = await createClient()

  let email: string
  let password: string
  try {
    email = getRequiredString(formData, 'email', 'Email', { max: 320 })
    password = getRequiredString(formData, 'password', 'Senha', { max: 256 })
  } catch (error) {
    return { error: actionErrorMessage(error) }
  }

  const { error, data } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Email ou senha inválidos.' }
  }

  // Check if user is active
  const { data: profile } = await supabase
    .from('profiles')
    .select('active')
    .eq('id', data.user.id)
    .single()

  if (!profile?.active) {
    await supabase.auth.signOut()
    return { error: 'Conta desativada. Contate o administrador.' }
  }

  const next = sanitizeRedirectPath(formData.get('next'))
  revalidatePath('/', 'layout')
  redirect(next)
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient()
  let email: string
  try {
    email = getRequiredString(formData, 'email', 'Email', { max: 320 })
  } catch (error) {
    return { error: actionErrorMessage(error) }
  }
  const requestHeaders = await headers()
  const siteUrl = resolveSiteUrl({
    configuredUrl: process.env.NEXT_PUBLIC_SITE_URL,
    origin: requestHeaders.get('origin'),
    forwardedHost: requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host'),
    forwardedProto: requestHeaders.get('x-forwarded-proto'),
  })

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/reset-password`,
  })

  if (error) {
    console.error('[forgotPassword]', error.message)
    return { error: error.message }
  }

  return { success: true }
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  let password: string
  try {
    password = getRequiredString(formData, 'password', 'Senha', { max: 256 })
  } catch (error) {
    return { error: actionErrorMessage(error) }
  }

  if (password.length < 8) {
    return { error: 'A senha deve ter no mínimo 8 caracteres.' }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: 'Não foi possível redefinir a senha. O link pode ter expirado.' }
  }

  redirect('/login?reset=success')
}

export async function changeOwnPassword(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { error: 'Sessão expirada. Entre novamente.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('active')
    .eq('id', user.id)
    .single()
  if (!profile?.active) return { error: 'Acesso negado.' }

  let currentPassword: string
  let newPassword: string
  try {
    ({ currentPassword, newPassword } = getPasswordChangeInput(formData))
  } catch (error) {
    return { error: actionErrorMessage(error) }
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })
  if (verifyError) return { error: 'Senha atual incorreta.' }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
  if (updateError) return { error: 'Não foi possível alterar a senha.' }

  return { success: true }
}
