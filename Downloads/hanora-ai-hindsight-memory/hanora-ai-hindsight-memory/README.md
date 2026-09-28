# Hanora AI × Hindsight Memory

This folder adds a **Hindsight memory integration layer** for Hanora AI.

## Important: integration is prepared, not activated

The integration is intentionally **disabled by default**. It is safe to commit this folder to GitHub without making your current Vercel deployment call Hindsight.

Set:

```env
HINDSIGHT_ENABLED=false
```

When you are ready to activate it later, set:

```env
HINDSIGHT_ENABLED=true
HINDSIGHT_API_URL=https://your-hindsight-api
HINDSIGHT_API_KEY=your-key
HINDSIGHT_BANK_ID=hanora-ai
```

Do **not** commit `.env` or real API keys.

## What this integration is designed to remember

Hanora AI can use Hindsight as a long-term memory layer for:

- campaign analysis history
- cultural risk findings
- market-specific decisions
- approved/rejected recommendations
- localization learnings
- recurring brand preferences
- feedback from previous campaign reviews

The intended loop is:

**Retain → Recall → Analyze/Act → Improve → Retain**

Hindsight provides `retain`, `recall`, and `reflect` operations through its Node.js client.

## Files

```text
hindsight-memory/
├── api/
│   └── lib/
│       └── hindsight.js
├── memory-bank/
│   └── hanora-ai-bank.json
├── docs/
│   └── HINDSIGHT_INTEGRATION.md
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Installation later

From the Hanora AI repository:

```bash
npm install @vectorize-io/hindsight-client
```

The current code does not initialize or call Hindsight unless `HINDSIGHT_ENABLED=true`.

Official Hindsight documentation:
https://hindsight.vectorize.io/developer/api/quickstart
