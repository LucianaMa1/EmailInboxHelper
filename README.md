# EmailInboxHelper

MailMind is a local-first email inbox helper with a polished single-page UI, IMAP sync, starring, delete-to-trash, and OpenAI-powered summaries.

## Features

- Real IMAP connection from a local Node server
- Inbox sync with preview text and simple categorization
- Star and delete actions wired to the mailbox
- Daily brief and per-email AI summary via OpenAI
- Single-file frontend that is easy to host or customize

## Run locally

```bash
npm install
npm start
```

Then open `http://localhost:3030/`

## Notes

- For Gmail, use an App Password instead of your normal password.
- The frontend stores your credentials in browser localStorage on your machine.
- The server sends credentials only to your mail provider and OpenAI when you use AI features.
