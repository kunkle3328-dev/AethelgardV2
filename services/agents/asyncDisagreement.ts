
import { VaultEntry } from "../../schemas/vault.schema";
import { runRedTeam } from "./redTeam";
import { useVaultStore } from "../../stores/vaultStore";

/**
 * 👥 ASYNCHRONOUS AGENT DISAGREEMENT
 * Orchestrates non-blocking agent conflicts.
 */
export async function scheduleAgentDisagreement(
  targetId: string, 
  synthesisText: string, 
  vault: VaultEntry[]
) {
  // We execute this in a "background task" manner using a setTimeout or just not awaiting it in the caller.
  setTimeout(async () => {
    console.log(`[ASYNC] Initializing Red-Team scan for node: ${targetId}`);
    
    const objection = await runRedTeam(synthesisText, vault);
    
    if (objection && objection.severity > 0.5) {
      console.log(`[ASYNC] Red-Team found significant issues (Severity: ${objection.severity}). Annotating vault.`);
      
      const { addAnnotation } = useVaultStore.getState();
      addAnnotation(targetId, {
        id: crypto.randomUUID(),
        type: 'agent_objection',
        agent: objection.agent,
        message: objection.critique,
        severity: objection.severity,
        timestamp: objection.timestamp
      });
    }
  }, 2000); // 2 second delay to simulate background processing
}
