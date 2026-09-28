# Hanora AI × Hindsight Integration

## Purpose

Hindsight is prepared as the long-term memory layer for Hanora AI's Cultural Intelligence workflow.

Instead of treating every campaign review as an isolated request, the future integration can remember validated findings and use them during later analyses.

### Example

Campaign A:

> A color/symbol combination caused cultural risk in Market X.

Hindsight can retain that validated finding.

Campaign B:

> A similar campaign is being reviewed for Market X.

Hanora AI can recall the previous finding and use it as additional context.

## Proposed workflow

```text
Campaign Upload
      ↓
Hanora AI Cultural Intelligence Analysis
      ↓
Hindsight Recall
      ↓
Combine current evidence + relevant memory
      ↓
Risk / Localization / Market Readiness Analysis
      ↓
Human Validation
      ↓
Hindsight Retain
      ↓
Improved future analysis
```

## Why this is useful for Hanora AI

Hindsight can provide persistent memory around:

1. Cultural intelligence findings
2. Market-specific campaign patterns
3. Brand-specific preferences
4. Localization decisions
5. Human-validated corrections
6. Previous campaign outcomes

This supports the Hanora AI idea of a **Human + AI Cultural Intelligence with Marketing OS**.

## Current deployment state

**Prepared only. Not activated.**

The code intentionally checks:

```env
HINDSIGHT_ENABLED=false
```

With this value, the helper functions return without contacting Hindsight.

Therefore, this package can be committed to the GitHub repository while the existing Vercel deployment remains unchanged.

## Activation later

When you intentionally want to test it:

```env
HINDSIGHT_ENABLED=true
HINDSIGHT_API_URL=https://your-hindsight-api
HINDSIGHT_API_KEY=your-key
HINDSIGHT_BANK_ID=hanora-ai
```

Install:

```bash
npm install @vectorize-io/hindsight-client
```

Then connect `retainMemory`, `recallMemory`, or `reflectMemory` to the specific Hanora AI workflow you want to demonstrate.

## Security

Never put API keys in:

- GitHub source files
- `hanora-ai-bank.json`
- frontend JavaScript
- README files
- screenshots

Keep credentials in environment variables/server-side configuration.
