
import { VaultEntry } from "../../schemas/vault.schema";
import { scheduleAgentDisagreement } from "../agents/asyncDisagreement";
import { runAdversarialSearch } from "../search/adversarial";
import { useVaultStore } from "../../stores/vaultStore";

/**
 * 😈 AETHELGARD DEVIL MONITOR (Watchdog)
 * A silent watchdog for intellectual drift and confidence spikes.
 */
export async function devilMonitor(event: {
  type: 'synthesis' | 'entry_update' | 'source_ingest';
  targetId: string;
  synthesisText: string;
  confidence: number;
  vault: VaultEntry[];
}) {
  const metrics = {
    confidenceSpike: event.confidence > 0.88,
    contradictionDetected: false,
    staleness: 0 
  };

  // 1. Force Red-Team disagreement on confidence spikes
  if (metrics.confidenceSpike) {
    console.log(`[WATCHDOG] Confidence spike detected (${event.confidence}). Scheduling Red-Team disagreement.`);
    scheduleAgentDisagreement(event.targetId, event.synthesisText, event.vault);
    
    // 2. Trigger Adversarial Search (Active Falsification)
    setTimeout(async () => {
      const counterSources = await runAdversarialSearch(event.synthesisText.slice(0, 200));
      if (counterSources.length > 0) {
        console.log(`[WATCHDOG] Adversarial search found ${counterSources.length} counter-sources.`);
        
        const { addAnnotation } = useVaultStore.getState();
        addAnnotation(event.targetId, {
          id: crypto.randomUUID(),
          type: 'adversarial_finding',
          agent: 'AdversarialScanner',
          message: `Discovered evidence challenging this claim: ${counterSources[0].title}. Sources suggest a different narrative.`,
          severity: 0.85,
          timestamp: Date.now(),
          thread: [{ role: 'agent', content: `Adversarial search triggered by high confidence. Sources: ${counterSources.map(s => s.uri).join(', ')}`, timestamp: Date.now() }]
        });
      }
    }, 5000);
  }

  // 3. Detect staleness
  const target = event.vault.find(v => v.id === event.targetId);
  if (target) {
    const daysSince = (Date.now() - target.updatedAt) / (1000 * 60 * 60 * 24);
    if (daysSince > 14) {
      console.log(`[WATCHDOG] Staleness detected for node ${event.targetId}.`);
    }
  }
}
