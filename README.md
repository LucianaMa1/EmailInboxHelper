# Luci's Inbox Helper

Luci turns a noisy inbox into a calmer decision list. Instead of only summarizing email, it helps you decide what needs a reply, what is urgent, what should become a task, and what can wait.

## Quick start

### Easiest Terminal flow

Clone the repo and start Luci:

```bash
git clone https://github.com/YOUR-USERNAME/EmailInboxHelper-repo.git
cd EmailInboxHelper-repo
npm run easy:start
```

What it does:

- installs dependencies automatically on first run
- starts the local server
- opens `http://localhost:3030`

Keep that Terminal window open while Luci is running.

### Mac double-click flow

If you do not want to type commands after cloning, open the folder in Finder and double-click:

```text
Open Luci.command
```

That launches the same guided startup flow.

## First-time setup if needed

If you only want to install everything first:

```bash
npm run setup
```

Then later you can run:

```bash
npm start
```

## What you need

- Node.js 20+ and npm
- An email account with IMAP enabled
- Optional: an AI API key if you want summaries and draft replies

## What Luci does

- syncs your inbox locally
- surfaces urgent messages first
- highlights emails waiting on your reply
- drafts summaries and replies
- separates useful newsletters from low-value promo noise
