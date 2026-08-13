import Link from 'next/link'
import { ArrowLeft, type LucideIcon } from 'lucide-react'

type Props = {
  eyebrow?: string
  title: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
  backHref?: string
}

export function AdminPageHeader({
  eyebrow = 'Administração',
  title,
  description,
  icon: Icon,
  action,
  backHref,
}: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        {backHref ? (
          <Link
            href={backHref}
            aria-label="Voltar"
            className="mt-0.5 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : null}
        {Icon ? <Icon className="mt-1 h-5 w-5 text-muted-foreground" aria-hidden="true" /> : null}
        <div>
          <p className="text-[10px] font-mono-brand uppercase tracking-[0.18em] text-muted-foreground">
            {eyebrow}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
