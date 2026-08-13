'use client'

import { useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'

type Props = { panelId: string; panelName: string }

export function PanelIframe({ panelId, panelName }: Props) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  return (
    <div className="relative h-full min-h-[420px] overflow-hidden">
      {loading && !error ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-card text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
          <p className="text-xs">Carregando painel...</p>
        </div>
      ) : null}
      {error ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-card px-5 text-center text-muted-foreground">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Não foi possível carregar o painel.</p>
            <p className="mt-1 text-xs text-muted-foreground">Verifique a conexão e tente novamente.</p>
          </div>
        </div>
      ) : null}
      <iframe
        src={`/api/panel-proxy/${panelId}`}
        title={panelName}
        className="h-full min-h-[420px] w-full border-0 bg-white"
        onLoad={() => setLoading(false)}
        onError={() => { setLoading(false); setError(true) }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  )
}
