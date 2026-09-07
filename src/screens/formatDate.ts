/** A short, locale-aware date for a stored ISO timestamp; '' when unparseable. */
export function formatTournamentDate(iso: string): string {
  const parsed = Date.parse(iso)
  if (Number.isNaN(parsed)) return ''
  return new Date(parsed).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
