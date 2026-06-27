import { Suspense } from 'react'
import { ResetPasswordClient } from './reset-password-client'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 bg-card p-8 rounded-xl border border-border">
        <Suspense>
          <ResetPasswordClient code={code} />
        </Suspense>
      </div>
    </div>
  )
}
