# Hanora AI

Hi akka 👋

Hanora AI is a marketing intelligence platform. User business details enter chesaka, app step-by-step ga strategy, content, SEO, cultural validation, launch and analytics flow ni handle chestundi.

## Current working flow

Business input → Marketing strategy → Text content → SEO → Campaign assembly → Campaign Intelligence → User approval → Platform launch → Analytics

## What is done

- Business onboarding: business name, industry, goals, target audience, budget, target countries, products/services, competitors, brand guidelines and social presence.
- User documents can be uploaded and included as business context.
- Real per-user Firestore persistence for drafts, generated results, documents, campaign state, launches and latest metrics.
- Complete marketing strategy generation:
  - strategy summary
  - go-to-market plan
  - sales funnel
  - marketing funnel
  - budget allocation
  - campaign timeline
  - platform recommendations
  - growth strategy
- Text content generation for Instagram, Facebook, LinkedIn, X, ad copy, blogs, emails, press releases and hashtags.
- SEO generation for keywords, competitor keywords, meta titles, meta descriptions, blog topics, technical SEO, internal linking and website suggestions.
- Campaign assembly from the generated strategy and content.
- Campaign Intelligence validation with six lenses:
  - cultural
  - historical
  - religious
  - political
  - social
  - localization
- Intelligence results include risk score, risk level, detected issues, audience prediction, localization score, market readiness, recommendations and AI rewrites.
- Platform selection and real publishing integrations for Facebook, Instagram and LinkedIn.
- Google Ads and YouTube campaign creation through Google Ads API. Campaigns are created **PAUSED** so the user can review before spending money.
- Provider metrics polling for Meta, LinkedIn and Google Ads.
- Authentication, protected API routes, private settings storage and server-side API keys.
- Deployment checks, launch validation, duplicate launch protection and basic automated checks.

## Important current limitations

Image and video generation intentionally are not included yet, akka. Instagram publishing needs a user-provided HTTPS image URL.

These areas are still partial or future work:

- Advanced audience targeting, ad groups, keywords and bidding automation.
- Campaign scheduling, duration and background job automation.
- Full YouTube Analytics integration.
- Complete conversions, revenue, ROI and country/platform performance reporting.
- Daily, weekly and monthly report exports.
- Tavily research is optional. Without a Tavily key, the AI still works but live web research is skipped.

LLM API KEYS VERCEL ENV LO ADD CHESUKOVACHU AKKA 
LLM_BASE_URL=https://openrouter.ai/api/v1
LLM_API_KEY=<your LLM key>
LLM_MODEL=openrouter/free
TAVILY_API_KEY=<optional Tavily key>
```

LLM keys can also be added from the website’s API Keys page. Meta, LinkedIn and Google credentials are configured there and stored privately per user.

### Local checks

```bash
npm install
npm test
npm run check
```

## Deployment

The app is configured for Vercel static pages plus serverless API routes. After adding Firebase credentials and any provider keys, deploy the `main` branch.

Always review generated content and cultural-risk results before publishing. Google Ads and YouTube campaigns remain paused until the user explicitly enables them.
