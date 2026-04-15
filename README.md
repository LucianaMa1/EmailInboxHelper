# Luci's Inbox Helper

Luci turns a noisy inbox into a calmer decision list. Instead of only summarizing email, it helps you decide what needs a reply, what is urgent, what should become a task, and what can wait.

## Status

Luci is an open-source local-first app, not a hosted SaaS product.

- Runs on your own machine.
- Connects to your mailbox over IMAP.
- Can call an AI provider directly from the local app when you add an API key.
- Is not ready to be deployed as a multi-user public web service without additional security work.

## Quick Start

### Easiest terminal flow

```bash
git clone https://github.com/LucianaMa1/EmailInboxHelper.git
cd EmailInboxHelper
npm run easy:start
```

What it does:

- installs dependencies automatically on first run
- starts the local server
- opens `http://localhost:3030`

Keep that terminal window open while Luci is running.

### Mac double-click flow

If you do not want to type commands after cloning, open the folder in Finder and double-click:

```text
Open Luci.command
```

### First-time setup only

```bash
npm run setup
```

Then later:

```bash
npm start
```

## Requirements

- Node.js 20+ and npm
- An email account with IMAP enabled
- Optional: an AI API key for summaries and draft replies

## Security Model

Luci is intentionally local-only right now.

- The Express server binds to `127.0.0.1`.
- Browser requests are only accepted from `localhost`.
- IMAP passwords and AI keys are kept only in memory for the current browser tab.
- Secrets are not written to `localStorage`.

If you want to turn this into a hosted app, treat that as a separate security project. You would need proper auth, encrypted secret storage, CSRF protection, rate limiting, audit logging, and a safer mailbox access model.

## What Luci Does

- syncs your inbox locally
- surfaces urgent messages first
- highlights emails waiting on your reply
- drafts summaries and replies
- separates useful newsletters from low-value promo noise
- groups messages into practical “do first”, “reply next”, “can wait”, and “ignore” buckets

## Open-Source Readiness Checklist

Current priority checklist for this repo:

- [x] Make the app local-only by default instead of network-exposed
- [x] Stop persisting IMAP passwords and AI keys in browser storage
- [x] Add a real open-source license
- [x] Document the local-first security model clearly
- [x] Add `SECURITY.md` vulnerability reporting guidance
- [x] Add an initial automated test harness for `decision-rules.js` and local-only security behavior
- [ ] Add route-level tests for sync, star, delete, and AI endpoints
- [ ] Break up `server.js` into smaller modules
- [ ] Break up the frontend script from `index.html`
- [ ] Add screenshots and contributor setup notes
- [ ] Add CI for syntax/test checks on pull requests
- [ ] Add safer mailbox auth options if the product ever moves beyond local IMAP use

## Known Limitations

- The automated test suite is intentionally small and does not cover IMAP or AI integrations yet
- IMAP-only; no OAuth mailbox integrations yet
- Classification is heuristic and can be wrong
- Large inboxes may feel slow because parsing happens locally in one Node process
- This repo is optimized for one local user, not teams or public deployment

## Customizing The Decision Rules

If Luci's default triage logic does not fit your inbox, the main file to customize is:

- `decision-rules.js`

That file contains the shared heuristics for category, urgency, reply expectation, task conversion, sender importance, confidence, finance grouping, and custom category inference.

### What to customize first

If you want Luci to feel like it was built for your inbox, these are the most important areas to edit inside `decision-rules.js`:

- `inferSenderImportance(email)`
  This is where the current VIP logic lives. Right now it uses hardcoded assumptions and example names. Replace that with your own important contacts, domains, or rules. A better version might prioritize your family members, manager, clients, school contacts, or your most frequent correspondents.
- `inferConfidence(email, decision, rule)`
  This controls how confident the system feels about a classification. If you want Luci to say "needs review" or "unclear" when confidence is low, this is the right place to start. Today the app always forces a decision, so this function is the easiest place to add safer fallback behavior.
- `PROMO_PATTERNS`, `PROMO_SENDER_PATTERNS`, `ACTION_PATTERNS`, `TRANSACTIONAL_PATTERNS`, `EDITORIAL_*`, `HIGH_VALUE_INFO_PATTERNS`
  These keyword lists define most of the triage behavior. If your inbox is not English-first, not business-oriented, or has important domain-specific language, expand these lists for your own use case.
- `classifyEmailDecision(email)`
  This is the main decision engine. If you want to separate global baseline rules from your personal rules, this is the best function to restructure while keeping the overall architecture intact.
- `buildDecisionRule(email, decision)`
  This is where Luci turns a decision into a structured explanation. If you want multi-label output like `promo + high value` or `learning + finance`, this is one of the main places to extend the rule shape.
- `inferCustomCategory(parts)` and the custom category helpers
  If you want stronger user-specific buckets, this is the place to grow your own category layer.

### Suggested customization projects

Without changing the overall architecture, here are the safest and highest-value improvements contributors can make by editing `decision-rules.js`:

- Replace hardcoded people and importance assumptions.
  Edit `inferSenderImportance(email)` so important senders come from your own contacts, known domains, or frequent correspondents instead of baked-in example names.
- Add confidence and fallback behavior.
  Edit `inferConfidence(...)` and `classifyEmailDecision(...)` to introduce a low-confidence outcome such as `unclear`, `needs review`, or `manual triage`.
- Separate global rules from user rules.
  Keep the top-level shared pattern lists small, then add a clearly marked personal layer in `decision-rules.js` for your own allowlists, blocklists, important senders, and learned overrides.
- Expand the label model.
  If one category is too rigid, extend `classifyEmailDecision(...)` and `buildDecisionRule(...)` so an email can carry multiple signals such as `transactional + urgent` or `learning + finance`.
- Improve language support.
  Add translated keywords, multilingual normalization, and language-specific pattern lists near the top of `decision-rules.js`.
- Build evaluation data.
  Add more tests under `test/`, especially real labeled inbox examples from different inbox styles. This is the best way to tell whether your rule edits actually improve behavior.
- Add negative-feedback loops.
  If you want Luci to remember reclassifications, start by extending the rule inputs and tests so user corrections can override default heuristics the next time a similar message appears.

### Recommended workflow for contributors

- Update `decision-rules.js`
- Add or edit tests in `test/decision-rules.test.js`
- Run `npm test`
- Try a few real inbox examples locally
- Keep changes small enough that you can explain which inbox style they help

### Important note

The default rule set is a baseline, not a universal truth. If you are adapting Luci for a school inbox, a family inbox, a recruiting inbox, a non-English inbox, or a highly regulated domain, you should expect to customize `decision-rules.js` to match your own workflow.

## Project Files

- `server.js`: local API, IMAP sync, AI calls
- `decision-rules.js`: inbox triage heuristics
- `index.html`: single-page UI
- `scripts/`: setup and launch helpers

## Contributing

Small, focused pull requests are best right now. Security, test coverage, and maintainability improvements are especially helpful.

Before opening a PR:

- run `npm test`
- run `node --check server.js`
- run `node --check decision-rules.js`
- describe the user-visible behavior change
- avoid introducing hosted-service assumptions unless discussed first

## License

MIT. See [LICENSE](./LICENSE).
