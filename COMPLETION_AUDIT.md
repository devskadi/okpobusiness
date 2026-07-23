# OkPo Prototype Completion Audit

This matrix maps the confirmed build brief to current implementation evidence. It is intended to keep future prototype changes aligned with the community-claim operating model.

## Marketplace invariants

| Requirement | Evidence |
|---|---|
| Brand posts a fixed campaign opportunity | Brand opportunity wizard and `CREATE_OPPORTUNITY` / `POST_OPPORTUNITY` reducer actions |
| Claims are based on verified community size | `calculateAllocation` in `src/store.tsx`; 150/100/50-member allocation unit test |
| Whole-number quotas and no over-allocation | Integer allocation engine, remaining-capacity caps, and unit tests |
| Claim is immediate, without Brand approval | `CLAIM_OPPORTUNITY` writes the claim and status in one reducer action; Leader claim receipt and E2E flow |
| No negotiation or manual allocation | No actions or Brand controls exist for claim approval, rejection, negotiation, or allocation editing |
| Leader stays within assigned quota and budget | `CREATE_COMMUNITY_CAMPAIGN` rejects excess content, budget, and deadlines outside the fixed live period |
| Content counts only after publication and recording | `RECORD_CONTENT` creates Recorded state; `VALIDATE_AND_COUNT_CONTENT` only accepts Recorded/Validated content |
| Published-content volume is primary | Brand and Leader dashboards, workspace commitment funnel, community completion, and completion report |
| Views and engagement are secondary | Labeled “Supporting reach” / “supporting metric only”; no outcome guarantees |

## Brand Representative

- Editable Brand profile at `/brand/profile`.
- Reusable product create/edit flow at `/brand/products`.
- Four-step opportunity wizard supports direct step navigation and contains campaign, product, platform, objective, preparation/live start dates and durations, content volume, budget, priority messages, content direction, hashtags, and mentions. End dates are derived automatically.
- Draft and Post actions are persisted.
- Opportunity workspace shows claims, calculated allocations, Leaders, participating communities, content stages, creators activated, budget totals, allocated/used/unallocated/remaining budget, consolidated public links, supporting reach, and completion report. Global content is grouped by campaign; community participation remains scoped to each campaign workspace.
- Brand surfaces are read-only for community claims and content validation.

## Community Leader

- Editable community profile and read-only verified size at `/leader/community`.
- Internal and external Leader classifications are represented in seed data.
- Open opportunity marketplace and fixed allocation preview at `/leader/opportunities/:opportunityId`.
- Immediate claim confirmation with quota, budget, dates, and remaining campaign capacity.
- One-to-many operational community campaigns with content, budget, and timeline guardrails.
- Six-item preparation checklist, separate from live delivery.
- Existing member activation, new-recruit marking, assignments, progress monitoring, published-link recording, validation/counting, and reward status management.
- Allocation ledger and campaign-level budget utilization.

## Community Member

- Responsive dashboard, campaigns, content, rewards, and profile routes.
- Participation acceptance and complete product/campaign brief.
- Visible themes, instructions, quantities, tags, deadline, and reward.
- Assigned → In Progress → Published → Recorded → Validated → Counted workflow.
- Public-link recording, completed/remaining requirements, and Pending/Approved/Completed reward statuses.

## Prototype and UX requirements

- Frontend-only React/Vite application with deterministic mock data.
- Versioned browser persistence key: `okpo-community-marketplace-v3`.
- Reset demo data action in the shared sidebar.
- Brand, Leader, and Member profile switching with direct-route synchronization.
- Philippine peso formatting throughout.
- Yellow, black, and white visual system with minimal transitions.
- Desktop-first Brand/Leader layouts and verified 390px Member layout without horizontal overflow.
- No Super Admin, backend, authentication, payments, social API, inventory, courier, samples, contracts, tax, permissions, social feed, AI matching, or advanced analytics.

## Verification evidence

- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm test` — 15 tests passed.
- `npm run build` — passed.
- `npm run test:e2e` — 4 browser workflows passed, including the complete Brand → Leader → Member → Leader → Brand leadership story.
- In-app visual QA completed for Brand desktop dashboard, Brand wizard, Leader desktop allocation, and Community Member 390×844 dashboard; console clean and no horizontal overflow.
