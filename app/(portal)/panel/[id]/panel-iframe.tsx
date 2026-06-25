'use client'

import { useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'

type Props = { panelId: string; panelName: string }

export function PanelIframe({ panelId, panelName }: Props) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  return (
    <div className="relative flex-1">
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500">
          <AlertCircle className="h-8 w-8" />
          <p className="text-sm">Não foi possível carregar o painel.</p>
        </div>
      )}
      <iframe
        src={`/api/panel-proxy/${panelId}`}
        title={panelName}
        className="w-full h-full border-0"
        onLoad={() => setLoading(false)}
        onError={() => { setLoading(false); setError(true) }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  )
}
