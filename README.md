# Luci's Inbox Helper

Luci's Inbox Helper is a local-first email assistant that connects to a real mailbox over IMAP, runs AI analysis through your chosen model provider, and turns your inbox into a decision-focused workspace.

It is designed around a simple idea: email is not just something to sort, it is something to decide on.

## What The App Does

Luci helps you:

- connect a real mailbox through a local Node server
- sync recent emails from your inbox
- generate an AI strategy from your natural-language instructions
- analyze each email independently using a structured decision schema
- show a Daily Brief focused on what needs reply, what is urgent, and what should become tracked work
- create matching mailbox labels/folders on the mail server
- star, delete, and summarize emails from the UI

## Core Product Flow

The app is organized into three setup steps:

1. Connect your email
2. Connect your AI API
3. Tell Luci what you care about

Then the normal workflow is:

1. Connect and sync the inbox
2. Test email + AI access
3. Write your inbox instruction
4. Click `Apply` to generate strategy
5. Review the generated strategy
6. Click `Start Analyze` to classify real emails
7. Use the Daily Brief and inbox list to decide what to do next

## Current AI Decision Schema

Luci's current inbox decision engine classifies each email independently and returns one structured decision per message.

Each analyzed email is mapped into:

```json
{
  "category": "action | info | promo",
  "requires_reply": true,
  "urgency": "high | medium | low",
  "effort": "quick | deep",
  "follow_up": true,
  "convert_to_task": true
}
```

### Meaning of each field

- `category`
  - `action`: requires decision, action, approval, coordination, or execution
  - `info`: mostly informational, no clear action required
  - `promo`: promotional, marketing, newsletter-like, or low-value bulk communication

- `requires_reply`
  - whether the sender is reasonably expecting a response

- `urgency`
  - `high`, `medium`, or `low`

- `effort`
  - `quick`: likely a few minutes
  - `deep`: requires thought, drafting, research, or multi-step work

- `follow_up`
  - whether the email implies tracking, checking back, or future action

- `convert_to_task`
  - whether the email should become tracked work rather than just reference or reading

## Features

### 1. Local-first mailbox connection

- real IMAP connection through a local Express server
- supported presets for:
  - Gmail
  - Outlook
  - Yahoo
  - QQ Mail
  - 163 Mail
  - custom IMAP
- folder selection
- configurable sync size up to 500 emails

### 2. Settings UI with 3-step setup

- horizontal 3-box setup layout
- email connection step
- AI provider/model/API key step
- natural-language strategy prompt step
- inline step status feedback

### 3. Multi-provider AI support

The app supports:

- OpenAI
- Anthropic
- Kimi / Moonshot
- DeepSeek
- Qwen

Users can choose provider, model, and API key directly in Settings.

### 4. Mailbox + AI connection testing

`Test Email + AI` validates:

- mailbox credentials
- IMAP connectivity
- AI provider API access

### 5. Inbox sync and parsing

When syncing, the app:

- connects to the selected IMAP mailbox
- fetches recent messages
- parses raw email content into UI-friendly fields
- extracts sender, subject, preview, body, date, star state, and spam hint

### 6. Heuristic pre-classification

Before AI analysis, the app still keeps a lightweight heuristic category layer for initial fallback display:

- Finance
- Travel
- Social
- Promotions
- Newsletters
- Spam
- Other

This is only the fallback layer before AI decision analysis runs.

### 7. Prompt-driven strategy generation

When the user clicks `Apply`, Luci:

- reads the user's inbox instruction
- reads a lightweight snapshot of synced emails
- generates a strategy
- constrains category output to:
  - `action`
  - `info`
  - `promo`

The strategy preview shows:

- a short strategy paragraph
- a processing summary
- the allowed decision categories that will be used later

### 8. Structured email analysis

When the user clicks `Start Analyze`, Luci:

- analyzes synced emails independently
- applies the approved strategy
- stores decision fields on each email
- updates the inbox list, detail view, categories, and Daily Brief

### 9. Daily Brief home screen

Daily Brief is the default landing page.

It:

- opens first when the app loads
- refreshes automatically when setup is ready
- shows setup prompts when email or AI config is missing
- summarizes the inbox using action-oriented language

Current brief sections include:

- total email count
- needs reply
- high urgency
- convert to task
- AI summary
- needs reply first
- deep work / follow-up
- decision breakdown
- spam suggested for deletion

### 10. Inbox view

The inbox view supports:

- search
- category filtering
- starred filter
- unread filter
- select all
- bulk delete
- sync refresh
- `Start Analyze`
- `Create Mailbox Labels`

### 11. Email detail view

Each email detail view can show:

- sender
- subject
- date
- full body or preview
- AI decision block
- per-email AI summary
- star/unstar action
- delete action

### 12. Per-email AI summary

Users can generate an AI summary for a single email from the detail panel.

### 13. Star and delete actions

The app supports real mailbox actions:

- add/remove star
- move selected email(s) to Trash
- delete spam in bulk

### 14. Mailbox label creation

After AI categories exist, the app can create mailbox folders/labels under:

`Luci Inbox/<label>`

This uses IMAP mailbox creation when the provider supports it.

## UI Language

The product is currently shifting from a category-first inbox organizer into a decision-first assistant.

That means the app now emphasizes:

- `Needs Reply`
- `High Urgency`
- `Quick / Deep`
- `Follow-up`
- `Convert To Task`

instead of only showing generic categories.

## API Endpoints

Current backend routes in `server.js`:

- `POST /api/test-connection`
  - validates IMAP + AI access

- `POST /api/emails/sync`
  - syncs mailbox emails

- `POST /api/emails/delete`
  - moves email(s) to Trash

- `POST /api/emails/star`
  - toggles mailbox star state

- `POST /api/ai/summarize`
  - summarizes one email

- `POST /api/ai/brief`
  - generates Daily Brief text

- `POST /api/ai/strategy`
  - generates a constrained inbox strategy

- `POST /api/ai/organize`
  - runs structured per-email decision analysis

- `POST /api/mailboxes/create-labels`
  - creates mailbox labels/folders from generated categories

## Architecture

The app uses a local proxy pattern:

- browser frontend in `index.html`
- local Node/Express server in `server.js`
- IMAP for mailbox access
- chosen AI provider API for strategy, analysis, and summaries

The browser never talks directly to IMAP.

## Local Storage And Privacy

- credentials are stored in browser `localStorage` on the user's machine
- email credentials are sent only to the configured mail server
- AI credentials are sent only to the selected AI provider
- the app uses the local Node server as the bridge between browser and IMAP

## Running Locally

Install dependencies:

```bash
npm install
```

Start the local server:

```bash
npm start
```

Open:

```text
http://localhost:3030/
```

## Gmail Note

For Gmail, use an App Password instead of your normal account password.

Typical flow:

1. enable 2-Step Verification
2. generate a Gmail App Password
3. paste that app password into Luci

## Current Limitations

- the app currently uses IMAP + app-password login, not Google OAuth
- labels created through IMAP are mailbox folders, not native Gmail API labels
- AI analysis currently works on a sampled payload rather than the entire mailbox at once
- heuristic fallback categories still exist before AI analysis runs
- task conversion is currently a decision signal in the UI, not yet a full task manager integration

## Suggested Demo Flow

If you want to demo the app clearly:

1. Open Daily Brief
2. Go to Settings and show the 3-step setup
3. Connect the inbox
4. Connect the AI provider
5. Write a prompt like:
   - "Separate emails into action, info, and promo. Mark what needs reply, what is urgent, and what should become tracked work."
6. Click `Apply`
7. Click `Start Analyze`
8. Return to Daily Brief and show:
   - needs reply
   - high urgency
   - deep work / follow-up
   - decision breakdown

## Repo Structure

- `index.html`
  - single-page frontend UI

- `server.js`
  - Express server, IMAP bridge, AI routes

- `package.json`
  - local runtime and scripts

## Status

This app is currently best described as:

- a local-first AI inbox assistant
- an agentic inbox workflow
- a decision-oriented email operations prototype

It is not yet a fully autonomous email agent, but it already supports strategy generation, structured decisioning, mailbox actions, and AI-assisted prioritization.
