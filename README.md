
# Luci's Inbox Helper

Luci turns a noisy inbox into a calmer decision list. Instead of only summarizing email, it helps you decide what needs a reply, what is urgent, what should become a task, and what can wait.

<img width="1491" height="840" alt="image" src="https://github.com/user-attachments/assets/ec04e796-bb31-4cc5-8a91-e3de4119e374" />

<img width="1491" height="843" alt="image" src="https://github.com/user-attachments/assets/01b840e1-68f5-4490-b8c7-5f3ecc958367" />


## Quick start

### Easiest Terminal flow

Clone the repo and start Luci:

```bash
git clone https://github.com/LucianaMa1/EmailInboxHelper.git
cd EmailInboxHelper
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
<img width="400" height="240" alt="0415 (1)" src="https://github.com/user-attachments/assets/11a0e3ba-3b56-4243-a595-c3f0c2878ffa" />
- syncs your inbox locally
- surfaces urgent messages first
- highlights emails waiting on your reply
- separates useful newsletters from low-value promo noise

## License
MIT
