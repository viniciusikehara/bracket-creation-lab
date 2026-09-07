import type { ReactNode } from 'react'

/**
 * Screens are stubs on purpose: this work order delivers the foundation, and
 * the following ones fill each screen in. The stub still renders live store
 * data so the shell is verifiably wired to persistence.
 */
export function ScreenStub({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <section>
      <h1>{title}</h1>
      <p className="muted">{description}</p>
      <div className="card">{children ?? <p className="muted">Coming in a later work order.</p>}</div>
    </section>
  )
}
