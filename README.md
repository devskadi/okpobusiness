# OkPo Leadership Prototype

A frontend-only prototype of OkPo’s community-powered creator campaign marketplace. It uses deterministic mock data and versioned browser `localStorage`; there is no backend, authentication, payment processing, social API, or administrative portal.

## Product model

The prototype demonstrates this complete operating flow:

1. A Brand creates a reusable product and posts a fixed campaign opportunity.
2. a Community Leader previews a system-calculated content quota and budget allocation based on verified community size.
3. The Leader confirms the claim and receives the allocation immediately—without Brand approval or negotiation.
4. The Leader divides the allocation into one or more operational community campaigns.
5. The Leader prepares the campaign, activates members, and assigns content requirements.
6. Community Members accept participation, publish on their own social accounts, and record public links in OkPo.
7. The Leader validates recorded content, which then counts toward the Brand commitment.
8. The Brand monitors consolidated content fulfillment, participating communities, budget use, supporting reach, and completion reports.

The hero Dermorepubliq-style campaign commits to 300 published contents with a ₱150,000 budget. Three verified communities of 150, 100, and 50 members receive proportional allocations of 150/₱75,000, 100/₱50,000, and 50/₱25,000.

## Run locally

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 4173
```

Open `http://127.0.0.1:4173/brand`.

The standalone design-system reference defaults to Inter at `http://127.0.0.1:4173/design-system.html`. Dedicated typography editions are available at `/design-system-inter.html`, `/design-system-poppins.html`, `/design-system-geist.html`, and `/design-system-sf-pro.html`.

## Workspaces and routes

Leadership can switch profiles from the shared sidebar.

### Brand Representative

- `/brand` — content-commitment dashboard
- `/brand/products` — reusable product library
- `/brand/opportunities` — opportunity portfolio
- `/brand/opportunities/new` — four-step posting wizard
- `/brand/opportunities/:opportunityId` — consolidated campaign workspace and report
- `/brand/communities` — legacy redirect to the seeded campaign’s Communities tab
- `/brand/content` — consolidated recorded content
- `/brand/reports` — completion reports
- `/brand/profile` — editable Brand profile

### Community Leader

- `/leader` — community delivery dashboard
- `/leader/opportunities` — claimable Brand opportunities
- `/leader/opportunities/:opportunityId` — allocation preview and immediate claim
- `/leader/campaigns` — operational community campaigns
- `/leader/campaigns/:communityCampaignId` — preparation, members, content, and budget
- `/leader/members` — member activation roster
- `/leader/content` — published-link validation
- `/leader/budget` — allocation ledger
- `/leader/community` — editable community profile and verified size

### Community Member

- `/member` — responsive member dashboard
- `/member/campaigns` — available and assigned campaigns
- `/member/campaigns/:communityCampaignId` — product, brief, requirements, deadline, and reward
- `/member/content` — in-progress, published, recorded, validated, and counted content
- `/member/rewards` — pending, approved, and completed reward statuses
- `/member/profile` — community membership profile

## Prototype behavior

- Every supported action persists across refreshes in `okpo-community-marketplace-v3`.
- **Reset demo data** restores the deterministic seed.
- Content and budget allocation uses verified community size, whole-number quotas, and remaining-capacity caps.
- Community claims are immediate and immutable.
- Leaders cannot exceed assigned content or budget when creating community campaigns or member assignments.
- Preparation progress is separate from the live publishing commitment.
- Views and engagement are labeled as supporting metrics only.
- Philippine peso is used throughout.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

The automated suite covers route rendering, profile switching, proportional allocation and caps, immediate claims, allocation guardrails, member assignment, content recording and validation, Brand fulfillment propagation, local persistence, reset behavior, preparation readiness, a completed report, and one complete cross-profile leadership demonstration.
