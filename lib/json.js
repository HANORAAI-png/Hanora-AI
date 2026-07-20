function parseJSON(text) {
  if (typeof text !== "string") throw new Error("Expected JSON text");
  const source = text.trim().replace(/^```(?:json)?\s*|\s*```$/gi, "");
  try { return JSON.parse(source); } catch {}
  const start = source.indexOf("{");
  if (start < 0) throw new Error("Model did not return valid JSON");
  let depth = 0, quoted = false, escaped = false;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (quoted) { if (escaped) escaped = false; else if (ch === "\\") escaped = true; else if (ch === '"') quoted = false; continue; }
    if (ch === '"') quoted = true;
    else if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) return JSON.parse(source.slice(start, i + 1));
  }
  throw new Error("Model did not return valid JSON");
}

module.exports = { parseJSON };