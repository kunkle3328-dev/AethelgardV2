
/**
 * 📉 CONFIDENCE ADJUSTMENT
 * Updates the belief confidence based on adversarial novelty.
 */
export function adjustConfidence(currentConfidence: number, noveltyScore: number, significant: boolean) {
  if (!significant) return currentConfidence;

  // Maximum penalty of 0.2 per significant scout cycle
  const penalty = Math.min(0.2, noveltyScore * 0.25);
  const next = currentConfidence - penalty;

  return parseFloat(Math.max(0.3, next).toFixed(2));
}
