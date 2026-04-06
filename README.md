# EmailInboxHelper

MailMind is a local-first email inbox helper with a polished single-page UI, IMAP sync, starring, delete-to-trash, and AI-powered summaries.

## Features

- Real IMAP connection from a local Node server
- Inbox sync with preview text and simple categorization
- Star and delete actions wired to the mailbox
- Multi-provider AI setup for OpenAI, Anthropic, Kimi, DeepSeek, and Qwen
- Prompt-driven inbox strategy generation before analysis starts
- AI organization that applies the approved strategy to create custom labels and assignments
- Optional mailbox label creation under `MailMind/<label>`
- Daily brief and per-email AI summary
- Single-file frontend that is easy to host or customize

## AI workflow

1. Connect IMAP and configure your AI provider, API key, and model.
2. Click `Test Connection` in settings to validate mailbox + AI access.
3. Write a natural-language inbox instruction and click `Apply`.
4. Review the generated strategy, labels, and summary plan.
5. Click `Start Analyze` in the inbox to assign emails using that approved strategy.
6. Optionally click `Create Mailbox Labels` to create matching folders/labels on the server.

## Run locally

```bash
npm install
npm start
```

Then open `http://localhost:3030/`

## Notes

- For Gmail, use an App Password instead of your normal password.
- The frontend stores your credentials in browser localStorage on your machine.
- The server sends credentials only to your mail provider and selected AI provider when you use AI features.
- AI-generated labels are app-level until you click `Create Mailbox Labels`, which creates folders/labels on the mail server when supported.
