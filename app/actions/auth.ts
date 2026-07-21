'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { actionErrorMessage, getRequiredString, sanitizeRedirectPath } from '@/lib/security/forms'

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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

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
