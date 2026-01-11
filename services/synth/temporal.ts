
import { VaultEntry } from "../../schemas/vault.schema";

export interface TemporalAnalysis {
  trend: 'expanding' | 'consolidating' | 'pivoting' | 'stable';
  volatility: number; // 0 to 1
  shifts: string[];
  velocity: number; // nodes per day
}

export async function analyzeTemporal(entries: VaultEntry[]): Promise<TemporalAnalysis> {
  if (entries.length < 2) {
    return { trend: 'stable', volatility: 0, shifts: [], velocity: 0 };
  }

  const sorted = [...entries].sort((a, b) => a.createdAt - b.createdAt);
  const first = sorted[0].createdAt;
  const last = sorted[sorted.length - 1].createdAt;
  const spanMs = last - first || 1;
  const days = spanMs / (1000 * 60 * 60 * 24);

  // Velocity: growth rate
  const velocity = entries.length / Math.max(1, days);

  // Volatility: Variance in creation times (clumpiness)
  const averageGap = spanMs / (entries.length - 1);
  let variance = 0;
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].createdAt - sorted[i-1].createdAt;
    variance += Math.pow(gap - averageGap, 2);
  }
  const volatility = Math.min(1, Math.sqrt(variance / entries.length) / averageGap);

  // Heuristic for trend
  let trend: TemporalAnalysis['trend'] = 'stable';
  if (velocity > 2) trend = 'expanding';
  else if (volatility > 0.7) trend = 'pivoting';
  else if (entries.length > 10 && velocity < 0.5) trend = 'consolidating';

  return {
    trend,
    volatility,
    shifts: [], // Would require semantic diffing to detect real shifts
    velocity
  };
}
