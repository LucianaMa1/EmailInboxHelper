import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT || 3030);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: "2mb" }));

const PROVIDERS = {
  gmail: { host: "imap.gmail.com", port: 993, secure: true, folder: "INBOX" },
  outlook: { host: "outlook.office365.com", port: 993, secure: true, folder: "INBOX" },
  yahoo: { host: "imap.mail.yahoo.com", port: 993, secure: true, folder: "INBOX" },
  qq: { host: "imap.qq.com", port: 993, secure: true, folder: "INBOX" },
  "163": { host: "imap.163.com", port: 993, secure: true, folder: "INBOX" }
};

function resolveImapConfig(cfg = {}) {
  const preset = PROVIDERS[cfg.prov] || {};
  const host = cfg.imapHost || preset.host;
  const port = Number(cfg.imapPort || preset.port || 993);
  const secure = port === 993;
  const folder = cfg.folder || preset.folder || "INBOX";

  if (!cfg.email || !cfg.pass || !host || !port) {
    throw new Error("Missing email, password, or IMAP server settings.");
  }

  return {
    host,
    port,
    secure,
    auth: {
      user: cfg.email,
      pass: cfg.pass
    },
    folder
  };
}

function formatDate(value) {
  const date = value ? new Date(value) : new Date();
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function categorizeEmail({ from, subject, text }) {
  const haystack = `${from} ${subject} ${text}`.toLowerCase();
  const rules = [
    { cat: "Finance", patterns: ["invoice", "statement", "payment", "bank", "payroll", "receipt", "refund", "deposit", "billing"] },
    { cat: "Travel", patterns: ["flight", "booking", "hotel", "trip", "airline", "reservation", "itinerary"] },
    { cat: "Social", patterns: ["linkedin", "twitter", "x ", "instagram", "facebook", "mention", "comment", "follower"] },
    { cat: "Newsletters", patterns: ["newsletter", "digest", "weekly", "daily", "unsubscribe", "product hunt", "substack"] },
    { cat: "Spam", patterns: ["winner", "claim now", "free iphone", "lottery", "urgent action", "crypto giveaway", "prize"] }
  ];

  for (const rule of rules) {
    if (rule.patterns.some((pattern) => haystack.includes(pattern))) {
      return rule.cat;
    }
  }

  return "Work";
}

function isSpam({ from, subject, text }) {
  return categorizeEmail({ from, subject, text }) === "Spam";
}

async function withImap(cfg, handler) {
  const imapConfig = resolveImapConfig(cfg);
  const client = new ImapFlow({
    host: imapConfig.host,
    port: imapConfig.port,
    secure: imapConfig.secure,
    auth: imapConfig.auth,
    logger: false
  });

  try {
    await client.connect();
    return await handler(client, imapConfig);
  } finally {
    try {
      await client.logout();
    } catch {}
  }
}

async function testOpenAIKey(apiKey) {
  if (!apiKey) {
    return { ok: false, skipped: true };
  }

  const response = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` }
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error?.message || `OpenAI request failed with ${response.status}`);
  }

  return { ok: true };
}

async function findTrashMailbox(client) {
  const mailboxes = await client.list();
  const byFlag = mailboxes.find((box) => box.flags && typeof box.flags.has === "function" && box.flags.has("\\Trash"));
  if (byFlag) return byFlag.path;

  const candidates = ["Trash", "[Gmail]/Trash", "Deleted Items", "Deleted Messages"];
  const byName = mailboxes.find((box) => candidates.includes(box.path));
  return byName?.path || "Trash";
}

async function fetchEmails(cfg) {
  return withImap(cfg, async (client, imapConfig) => {
    const count = Math.max(1, Math.min(Number(cfg.count || 50), 200));
    const lock = await client.getMailboxLock(imapConfig.folder);

    try {
      const mailbox = await client.status(imapConfig.folder, { messages: true });
      if (!mailbox.messages) {
        return [];
      }

      const start = Math.max(1, mailbox.messages - count + 1);
      const range = `${start}:${mailbox.messages}`;
      const emails = [];

      for await (const message of client.fetch(range, {
        uid: true,
        envelope: true,
        flags: true,
        internalDate: true,
        source: true
      })) {
        const parsed = await simpleParser(message.source);
        const fromValue = parsed.from?.value?.[0];
        const from = fromValue?.name || fromValue?.address || message.envelope?.from?.[0]?.name || message.envelope?.from?.[0]?.address || "Unknown sender";
        const addr = fromValue?.address || message.envelope?.from?.[0]?.address || "";
        const subj = parsed.subject || message.envelope?.subject || "(No subject)";
        const text = (parsed.text || parsed.html || "").replace(/\s+/g, " ").trim();
        const prev = text.slice(0, 220) || "(No preview available)";
        const cat = categorizeEmail({ from, subject: subj, text });
        const spam = isSpam({ from, subject: subj, text });

        emails.push({
          id: message.uid,
          uid: message.uid,
          from,
          addr,
          subj,
          prev,
          body: (parsed.text || prev).trim(),
          date: formatDate(message.internalDate || message.envelope?.date),
          isoDate: new Date(message.internalDate || message.envelope?.date || Date.now()).toISOString(),
          cat,
          star: message.flags?.has("\\Flagged") || false,
          unread: !(message.flags?.has("\\Seen") || false),
          spam
        });
      }

      emails.sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate));
      return emails;
    } finally {
      lock.release();
    }
  });
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, app: "MailMind local server" });
});

app.post("/api/test-connection", async (req, res) => {
  const cfg = req.body || {};

  try {
    const imapConfig = resolveImapConfig(cfg);
    await withImap(cfg, async (client, resolved) => {
      await client.mailboxOpen(resolved.folder);
    });

    let openai = { ok: false, skipped: true };
    if (cfg.okey) {
      openai = await testOpenAIKey(cfg.okey);
    }

    res.json({
      ok: true,
      message: openai.ok
        ? `IMAP connected to ${imapConfig.host}:${imapConfig.port}, and the OpenAI key is valid.`
        : `IMAP connected to ${imapConfig.host}:${imapConfig.port}.`,
      imap: { host: imapConfig.host, port: imapConfig.port, folder: imapConfig.folder },
      openai
    });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post("/api/emails/sync", async (req, res) => {
  try {
    const emails = await fetchEmails(req.body || {});
    res.json({ ok: true, emails });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post("/api/emails/delete", async (req, res) => {
  const { cfg, uids } = req.body || {};

  try {
    if (!Array.isArray(uids) || !uids.length) {
      throw new Error("No emails were selected.");
    }

    await withImap(cfg, async (client, imapConfig) => {
      const lock = await client.getMailboxLock(imapConfig.folder);
      const trashPath = await findTrashMailbox(client);
      try {
        await client.messageMove(uids, trashPath, { uid: true });
      } finally {
        lock.release();
      }
    });

    res.json({ ok: true, deleted: uids.length });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post("/api/emails/star", async (req, res) => {
  const { cfg, uid, star } = req.body || {};

  try {
    if (!uid) throw new Error("Missing email id.");

    await withImap(cfg, async (client, imapConfig) => {
      const lock = await client.getMailboxLock(imapConfig.folder);
      try {
        if (star) {
          await client.messageFlagsAdd(uid, ["\\Flagged"], { uid: true });
        } else {
          await client.messageFlagsRemove(uid, ["\\Flagged"], { uid: true });
        }
      } finally {
        lock.release();
      }
    });

    res.json({ ok: true, uid, star: Boolean(star) });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post("/api/ai/summarize", async (req, res) => {
  const { apiKey, model, email } = req.body || {};

  try {
    if (!apiKey) throw new Error("Missing OpenAI API key.");
    if (!email) throw new Error("Missing email payload.");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || "gpt-4o-mini",
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content: "You are an email assistant. Summarize the email in 2 to 3 sentences and give one clear action item."
          },
          {
            role: "user",
            content: `From: ${email.from} <${email.addr}>\nSubject: ${email.subj}\n\n${email.body || email.prev}`
          }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || `OpenAI request failed with ${response.status}`);
    }

    res.json({ ok: true, summary: data.choices?.[0]?.message?.content || "" });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post("/api/ai/brief", async (req, res) => {
  const { apiKey, model, emails } = req.body || {};

  try {
    if (!apiKey) throw new Error("Missing OpenAI API key.");
    if (!Array.isArray(emails) || !emails.length) {
      throw new Error("No emails available for analysis.");
    }

    const snapshot = emails
      .slice(0, 20)
      .map((email) => `[${email.cat}][${email.star ? "starred" : "normal"}] "${email.subj}" from ${email.from}`)
      .join("\n");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || "gpt-4o-mini",
        max_tokens: 400,
        messages: [
          {
            role: "system",
            content: "You are a professional email assistant. Write a concise daily inbox brief in 3 to 4 sentences. Highlight what needs attention first and include one clear next step."
          },
          {
            role: "user",
            content: `Today's inbox snapshot:\n${snapshot}\n\nWrite the brief.`
          }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || `OpenAI request failed with ${response.status}`);
    }

    res.json({ ok: true, brief: data.choices?.[0]?.message?.content || "" });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.use(express.static(__dirname));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`MailMind local server running at http://localhost:${PORT}/`);
});
