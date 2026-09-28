/**
 * Hanora AI × Hindsight
 *
 * This module is intentionally disabled unless HINDSIGHT_ENABLED=true.
 * Importing this module alone does not make a Hindsight API request.
 *
 * Hindsight operations:
 *   retain()  -> store durable Hanora AI knowledge
 *   recall()  -> retrieve relevant previous knowledge
 *   reflect() -> ask Hindsight to reason over memory
 */

let clientPromise = null;

function isEnabled() {
  return String(process.env.HINDSIGHT_ENABLED || "false").toLowerCase() === "true";
}

async function getClient() {
  if (!isEnabled()) return null;

  if (!process.env.HINDSIGHT_API_URL) {
    throw new Error("HINDSIGHT_API_URL is required when HINDSIGHT_ENABLED=true");
  }

  if (!clientPromise) {
    clientPromise = import("@vectorize-io/hindsight-client").then(({ HindsightClient }) => {
      return new HindsightClient({
        baseUrl: process.env.HINDSIGHT_API_URL,
        ...(process.env.HINDSIGHT_API_KEY
          ? { apiKey: process.env.HINDSIGHT_API_KEY }
          : {})
      });
    });
  }

  return clientPromise;
}

function bankId() {
  return process.env.HINDSIGHT_BANK_ID || "hanora-ai";
}

/**
 * Store a durable memory.
 * Returns { enabled: false } while integration is disabled.
 */
export async function retainMemory(content, options = {}) {
  const client = await getClient();
  if (!client) return { enabled: false, operation: "retain" };

  return client.retain(bankId(), content, options);
}

/**
 * Retrieve relevant memories.
 * Returns an empty result while integration is disabled.
 */
export async function recallMemory(query, options = {}) {
  const client = await getClient();
  if (!client) return { enabled: false, operation: "recall", results: [] };

  return client.recall(bankId(), query, options);
}

/**
 * Generate a response using Hindsight memory.
 * Returns a disabled response while integration is disabled.
 */
export async function reflectMemory(query, options = {}) {
  const client = await getClient();
  if (!client) return { enabled: false, operation: "reflect" };

  return client.reflect(bankId(), query, options);
}

export function hindsightStatus() {
  return {
    enabled: isEnabled(),
    bankId: bankId(),
    configured: Boolean(process.env.HINDSIGHT_API_URL)
  };
}
