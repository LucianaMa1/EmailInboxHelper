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
