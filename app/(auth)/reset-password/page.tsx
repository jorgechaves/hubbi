import { Suspense } from 'react'
import { ResetPasswordClient } from './reset-password-client'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams

  return (
    <Suspense fallback={<div className="h-48 rounded-lg bg-muted animate-pulse" />}>
      <ResetPasswordClient code={code} />
    </Suspense>
  )
}
