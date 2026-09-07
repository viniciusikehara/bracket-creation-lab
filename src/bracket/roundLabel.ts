/**
 * Names a round by how far it sits from the end, which is how people talk about
 * a bracket ("the semi-final"), not by its number ("round 3").
 */
export function roundLabel(round: number, totalRounds: number): string {
  const fromEnd = totalRounds - round
  if (fromEnd === 0) return 'Final'
  if (fromEnd === 1) return 'Semi-finals'
  if (fromEnd === 2) return 'Quarter-finals'
  return `Round ${round}`
}
