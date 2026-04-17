
# Luci's Inbox Helper

Luci's Inbox Helper turns up to 10 noisy inboxes into a calmer decision list. Instead of only summarizing email, it helps you decide what needs a reply, what is urgent, what should become a task, and what can wait.

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

## Before setup

- Node.js 20+ and npm
- At least one email account you can access through IMAP
- For Gmail, turn on IMAP and create an app password with 2-step verification enabled
  Official docs: [Gmail IMAP setup](https://support.google.com/mail/answer/75726?hl=en)
  Official docs: [Google app passwords](https://support.google.com/accounts/answer/185833?hl=en)
- If you plan to use Google app integration, create a Google app secret
  Official docs: [Create Google OAuth credentials](https://developers.google.com/workspace/guides/create-credentials)
- If you want AI summaries and draft replies, prepare one LLM API key
  Official docs:
  [Qwen / Alibaba Cloud Model Studio](https://www.alibabacloud.com/help/en/model-studio/get-api-key),
  [Kimi / Moonshot](https://platform.moonshot.cn/docs/intro),
  [OpenAI](https://platform.openai.com/docs/quickstart/using-the-api),
  [Claude / Anthropic](https://docs.anthropic.com/en/api/getting-started)

## Setup

Luci's Setup page has three parts:

1. Connect email
2. Connect AI
3. Learn category

### 1. Connect email

For each inbox you add, fill in:

- Provider
- Email address
- IMAP host
- Port
- Password or app password
- Folder
- Sync size

Tips:

- Gmail usually needs an app password, not your normal Gmail password
- Outlook may work with your Microsoft password or an app password if 2FA is enabled
- Yahoo works best with an app password
- QQ Mail and 163 Mail usually require IMAP enabled plus an authorization code
- For custom IMAP, the most common secure port is `993`

### 2. Connect AI

This step is optional. If you want summaries and draft replies, choose:

- Provider: OpenAI, Anthropic (Claude), DeepSeek, Kimi / Moonshot, or Qwen
- Model: keep the suggested default unless you want a different model
- API key: paste the key from your provider console

### 3. Learn category

This step is optional. Add one author or newsletter per line to the Author whitelist if you want Luci to treat those senders as learning sources.

### Final step

After filling everything in:

1. Click `test connections`
2. Click `save settings`

## What Luci does
<img width="400" height="240" alt="0415 (1)" src="https://github.com/user-attachments/assets/11a0e3ba-3b56-4243-a595-c3f0c2878ffa" />

- syncs your inbox locally
- surfaces urgent messages first
- highlights emails waiting on your reply
- separates useful newsletters from low-value promo noise

## License
MIT
