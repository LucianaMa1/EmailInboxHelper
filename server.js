import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import {
  DECISION_CATEGORIES,
  DECISION_URGENCY_LEVELS,
  DECISION_EFFORT_LEVELS,
  classifyEmailDecision
} from "./decision-rules.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 3030);
const LOCAL_ORIGINS = new Set([
  `http://localhost:${PORT}`,
  `http://127.0.0.1:${PORT}`,
  "null"
]);

export function isLoopbackAddress(value = "") {
  return ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(String(value || "").trim());
}

export function localOnlyMiddleware(req, res, next) {
  const origin = String(req.headers.origin || "").trim();
  const remoteAddress = req.socket?.remoteAddress || req.ip || "";

  if (!isLoopbackAddress(remoteAddress)) {
    return res.status(403).json({
      ok: false,
      error: "Luci is a local-only app. This server only accepts loopback requests."
    });
  }

  if (origin && !LOCAL_ORIGINS.has(origin)) {
    return res.status(403).json({
      ok: false,
      error: "Luci only accepts requests from localhost."
    });
  }

  if (origin) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
  }
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
}

export function healthPayload(host = HOST, port = PORT) {
  return {
    ok: true,
    app: "Luci's Inbox Helper local server",
    localOnly: true,
    host,
    port
  };
}

app.use(localOnlyMiddleware);

app.use(express.json({ limit: "8mb" }));

const PROVIDERS = {
  gmail: { host: "imap.gmail.com", port: 993, secure: true, folder: "INBOX" },
  outlook: { host: "outlook.office365.com", port: 993, secure: true, folder: "INBOX" },
  yahoo: { host: "imap.mail.yahoo.com", port: 993, secure: true, folder: "INBOX" },
  qq: { host: "imap.qq.com", port: 993, secure: true, folder: "INBOX" },
  "163": { host: "imap.163.com", port: 993, secure: true, folder: "INBOX" }
};

const AI_PROVIDERS = {
  openai: {
    kind: "openai",
    baseUrl: "https://api.openai.com/v1"
  },
  anthropic: {
    kind: "anthropic",
    baseUrl: "https://api.anthropic.com/v1"
  },
  kimi: {
    kind: "openai",
    baseUrl: "https://api.moonshot.ai/v1"
  },
  deepseek: {
    kind: "openai",
    baseUrl: "https://api.deepseek.com/v1"
  },
  qwen: {
    kind: "openai",
    baseUrl: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
  }
};

const IMAP_SESSION_TTL_MS = 45000;
const imapSessions = new Map();

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

function stripHtml(value = "") {
  return String(value || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ");
}

function cleanNewsletterText(value = "") {
  return stripHtml(String(value || ""))
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/gi, "$1")
    .replace(/\[[^\]]+\]\(\s*\)/g, " ")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\bwww\.\S+/gi, " ")
    .replace(/\S+\.(png|jpg|jpeg|gif|webp)\b/gi, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/<!doctype html>/gi, " ")
    .replace(/insert hidden preheader text here\.?/gi, " ")
    .replace(/[\u00ad\u034f\u061c\u115f\u1160\u17b4\u17b5\u180e\u200b-\u200f\u202a-\u202e\u2060-\u206f\u3164\ufeff\uffa0]/g, " ")
    .replace(/\b(unsubscribe|view in browser|manage preferences|privacy policy|terms of service)\b[\s\S]*/gi, " ")
    .replace(/\(\s*https?:\/\/[^)]+\)/gi, " ")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildCleanPreview(text = "", maxLength = 220) {
  const cleaned = cleanNewsletterText(text);
  return cleaned.slice(0, maxLength).trim() || "(No preview available)";
}

function categorizeEmail({ from, subject, text }) {
  const haystack = `${from} ${subject} ${text}`.toLowerCase();
  const rules = [
    { cat: "Finance", patterns: ["invoice", "statement", "payment", "bank", "payroll", "receipt", "refund", "deposit", "billing"] },
    { cat: "Travel", patterns: ["flight", "booking", "hotel", "trip", "airline", "reservation", "itinerary"] },
    { cat: "Social", patterns: ["linkedin", "twitter", "x ", "instagram", "facebook", "mention", "comment", "follower"] },
    { cat: "Promotions", patterns: ["clearance", "% off", "percent off", "up to ", "sale", "deal", "shop now", "score now", "limited time", "free shipping", "ends tonight", "doorbuster", "promo code", "coupon", "buy now", "black friday", "cyber monday"] },
    { cat: "Newsletters", patterns: ["newsletter", "digest", "weekly", "daily", "unsubscribe", "product hunt", "substack"] },
    { cat: "Spam", patterns: ["winner", "claim now", "free iphone", "lottery", "urgent action", "crypto giveaway", "prize"] }
  ];

  for (const rule of rules) {
    if (rule.patterns.some((pattern) => haystack.includes(pattern))) {
      return rule.cat;
    }
  }

  return "Other";
}

function isSpam({ from, subject, text }) {
  return categorizeEmail({ from, subject, text }) === "Spam";
}

function extractJsonBlock(value = "") {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    throw new Error("The AI response was empty.");
  }

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}

function normalizeLabelName(value = "") {
  return String(value || "")
    .replace(/[\\/*"%<>?|:#]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);
}

function buildEmailContext(email = {}, mode = "strategy") {
  const base = {
    uid: email.uid,
    from: email.from,
    address: email.addr,
    subject: email.subj,
    preview: email.prev,
    starred: Boolean(email.star),
    unread: Boolean(email.unread),
    spam: Boolean(email.spam)
  };

  const body = String(email.body || "").replace(/\s+/g, " ").trim();
  if (body) {
    base.bodySnippet = body.slice(0, mode === "organize" ? 2000 : 1200);
  }

  return base;
}

function getDefaultDecisionLabels() {
  return [
    { name: "action", description: "Requires decision, action, coordination, approval, or execution.", color: "#4f8ef7" },
    { name: "info", description: "Informational only. Useful to read, but no clear action is required.", color: "#3ecf8e" },
    { name: "promo", description: "Promotional, marketing, newsletter-like, or low-value bulk communication.", color: "#f7c948" },
    { name: "learning", description: "Newsletters, digests, and community updates worth skimming to learn from later.", color: "#8d7bd1" }
  ];
}

function sanitizeStrategySections(sections = []) {
  return (Array.isArray(sections) ? sections : [])
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .filter((item) => !/category\s*:\s*/i.test(item))
    .slice(0, 4);
}

function resolveAIConfig({ provider, apiKey, model }) {
  const resolved = AI_PROVIDERS[provider || "openai"] || AI_PROVIDERS.openai;
  if (!apiKey) {
    throw new Error("Missing AI API key.");
  }

  return {
    provider: provider || "openai",
    kind: resolved.kind,
    baseUrl: resolved.baseUrl,
    apiKey,
    model
  };
}

async function callAI({ provider, apiKey, model, maxTokens, messages, responseFormat }) {
  const cfg = resolveAIConfig({ provider, apiKey, model });

  if (cfg.kind === "anthropic") {
    const systemParts = messages.filter((message) => message.role === "system").map((message) => message.content).filter(Boolean);
    const userParts = messages.filter((message) => message.role !== "system");
    const response = await fetch(`${cfg.baseUrl}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": cfg.apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: cfg.model || "claude-3-5-sonnet-latest",
        max_tokens: maxTokens,
        system: systemParts.join("\n\n"),
        messages: userParts.map((message) => ({
          role: message.role === "assistant" ? "assistant" : "user",
          content: message.content
        }))
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error?.message || `Anthropic request failed with ${response.status}`);
    }

    return (data.content || [])
      .filter((item) => item.type === "text")
      .map((item) => item.text)
      .join("")
      .trim();
  }

  const response = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`
    },
    body: JSON.stringify({
      model: cfg.model || "gpt-4o-mini",
      max_tokens: maxTokens,
      response_format: responseFormat,
      messages
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || `${cfg.provider} request failed with ${response.status}`);
  }

  return data.choices?.[0]?.message?.content || "";
}

async function withImap(cfg, handler) {
  const imapConfig = resolveImapConfig(cfg);
  const key = JSON.stringify({
    host: imapConfig.host,
    port: imapConfig.port,
    secure: imapConfig.secure,
    user: imapConfig.auth.user,
    pass: imapConfig.auth.pass
  });

  const getFreshSession = async () => {
    const client = new ImapFlow({
      host: imapConfig.host,
      port: imapConfig.port,
      secure: imapConfig.secure,
      auth: imapConfig.auth,
      logger: false
    });
    await client.connect();
    const session = { client, timer: null, key };
    imapSessions.set(key, session);
    return session;
  };

  const scheduleCleanup = (session) => {
    if (!session) return;
    clearTimeout(session.timer);
    session.timer = setTimeout(async () => {
      const current = imapSessions.get(key);
      if (current !== session) return;
      imapSessions.delete(key);
      try {
        await session.client.logout();
      } catch {}
    }, IMAP_SESSION_TTL_MS);
  };

  const disposeSession = async (session) => {
    if (!session) return;
    clearTimeout(session.timer);
    const current = imapSessions.get(key);
    if (current === session) {
      imapSessions.delete(key);
    }
    try {
      await session.client.logout();
    } catch {}
  };

  let session = imapSessions.get(key);

  try {
    if (!session || session.client.usable === false) {
      session = await getFreshSession();
    }

    const result = await handler(session.client, imapConfig);
    scheduleCleanup(session);
    return result;
  } catch (error) {
    await disposeSession(session);
    throw error;
  }
}

async function testAIProvider({ provider, apiKey, model }) {
  if (!apiKey) {
    return { ok: false, skipped: true };
  }

  const content = await callAI({
    provider,
    apiKey,
    model,
    maxTokens: 20,
    messages: [
      {
        role: "system",
        content: "Reply with the single word OK."
      },
      {
        role: "user",
        content: "Connection test."
      }
    ]
  });

  return { ok: /ok/i.test(content), provider: provider || "openai" };
}

async function findTrashMailbox(client) {
  const mailboxes = await client.list();
  const byFlag = mailboxes.find((box) => box.flags && typeof box.flags.has === "function" && box.flags.has("\\Trash"));
  if (byFlag) return byFlag.path;

  const candidates = ["Trash", "[Gmail]/Trash", "Deleted Items", "Deleted Messages"];
  const byName = mailboxes.find((box) => candidates.includes(box.path));
  return byName?.path || "Trash";
}

async function fetchEmails(cfg, onProgress = () => {}) {
  return withImap(cfg, async (client, imapConfig) => {
    const count = Math.max(1, Math.min(Number(cfg.count || 50), 500));
    onProgress({
      phase: "connecting",
      progress: 8,
      message: "Connecting to mailbox..."
    });
    const lock = await client.getMailboxLock(imapConfig.folder);

    try {
      onProgress({
        phase: "opening",
        progress: 18,
        message: `Opening ${imapConfig.folder}...`
      });
      const mailbox = await client.status(imapConfig.folder, { messages: true });
      if (!mailbox.messages) {
        onProgress({
          phase: "complete",
          progress: 100,
          message: "Inbox is empty."
        });
        return [];
      }

      const start = Math.max(1, mailbox.messages - count + 1);
      const range = `${start}:${mailbox.messages}`;
      const emails = [];
      const total = mailbox.messages - start + 1;

      onProgress({
        phase: "fetching",
        progress: 24,
        message: `Fetching ${total} email${total === 1 ? "" : "s"}...`,
        completed: 0,
        total
      });

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
        const rawText = parsed.text || parsed.html || "";
        const cleanedText = cleanNewsletterText(rawText);
        const prev = buildCleanPreview(rawText, 220);
        const cat = categorizeEmail({ from, subject: subj, text: cleanedText || rawText });
        const spam = isSpam({ from, subject: subj, text: cleanedText || rawText });

        emails.push({
          id: message.uid,
          uid: message.uid,
          from,
          addr,
          subj,
          prev,
          body: (cleanedText || prev).trim(),
          date: formatDate(message.internalDate || message.envelope?.date),
          isoDate: new Date(message.internalDate || message.envelope?.date || Date.now()).toISOString(),
          cat,
          star: message.flags?.has("\\Flagged") || false,
          unread: !(message.flags?.has("\\Seen") || false),
          spam
        });

        const completed = emails.length;
        const ratio = total ? completed / total : 1;
        onProgress({
          phase: "fetching",
          progress: Math.min(94, Math.round(24 + ratio * 68)),
          message: `Fetching emails... ${completed}/${total}`,
          completed,
          total
        });
      }

      emails.sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate));
      onProgress({
        phase: "complete",
        progress: 100,
        message: `Synced ${emails.length} email${emails.length === 1 ? "" : "s"}.`,
        completed: emails.length,
        total: emails.length
      });
      return emails;
    } finally {
      lock.release();
    }
  });
}

async function deleteEmails(cfg, uids, onProgress = () => {}) {
  if (!Array.isArray(uids) || !uids.length) {
    throw new Error("No emails were selected.");
  }

  return withImap(cfg, async (client, imapConfig) => {
    onProgress({
      phase: "connecting",
      progress: 8,
      message: "Connecting to mailbox..."
    });

    const lock = await client.getMailboxLock(imapConfig.folder);
    const trashPath = await findTrashMailbox(client);

    try {
      const total = uids.length;
      const batchSize = Math.min(25, total);
      onProgress({
        phase: "deleting",
        progress: 18,
        message: `Moving ${total} email${total === 1 ? "" : "s"} to ${trashPath}...`,
        completed: 0,
        total
      });

      for (let index = 0; index < uids.length; index += batchSize) {
        const batch = uids.slice(index, index + batchSize);
        await client.messageMove(batch, trashPath, { uid: true });

        const completed = Math.min(index + batch.length, total);
        const ratio = total ? completed / total : 1;
        onProgress({
          phase: "deleting",
          progress: Math.min(94, Math.round(18 + ratio * 76)),
          message: `Deleting emails... ${completed}/${total}`,
          completed,
          total
        });
      }

      onProgress({
        phase: "complete",
        progress: 100,
        message: `Deleted ${total} email${total === 1 ? "" : "s"}.`,
        completed: total,
        total
      });

      return { deleted: total };
    } finally {
      lock.release();
    }
  });
}

app.get("/api/health", (_req, res) => {
  res.json(healthPayload(HOST, PORT));
});

app.post("/api/test-connection", async (req, res) => {
  const cfg = req.body || {};

  try {
    const imapConfig = resolveImapConfig(cfg);
    await withImap(cfg, async (client, resolved) => {
      await client.mailboxOpen(resolved.folder);
    });

    let ai = { ok: false, skipped: true };
    if (cfg.aiKey || cfg.okey) {
      ai = await testAIProvider({
        provider: cfg.aiProvider || "openai",
        apiKey: cfg.aiKey || cfg.okey,
        model: cfg.aiModel || cfg.model
      });
    }

    res.json({
      ok: true,
      message: ai.ok
        ? `IMAP connected to ${imapConfig.host}:${imapConfig.port}, and the AI provider is reachable.`
        : `IMAP connected to ${imapConfig.host}:${imapConfig.port}.`,
      imap: { host: imapConfig.host, port: imapConfig.port, folder: imapConfig.folder },
      ai
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

app.post("/api/emails/sync-progress", async (req, res) => {
  res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");

  const sendEvent = (event) => {
    res.write(`${JSON.stringify(event)}\n`);
  };

  try {
    const emails = await fetchEmails(req.body || {}, (event) => {
      sendEvent({ type: "progress", ...event });
    });

    sendEvent({ type: "result", ok: true, emails });
    res.end();
  } catch (error) {
    sendEvent({ type: "error", ok: false, error: error.message });
    res.end();
  }
});

app.post("/api/emails/delete", async (req, res) => {
  const { cfg, uids } = req.body || {};

  try {
    const result = await deleteEmails(cfg, uids);
    res.json({ ok: true, deleted: result.deleted });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post("/api/emails/delete-progress", async (req, res) => {
  res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");

  const { cfg, uids } = req.body || {};

  const sendEvent = (event) => {
    res.write(`${JSON.stringify(event)}\n`);
  };

  try {
    const result = await deleteEmails(cfg, uids, (event) => {
      sendEvent({ type: "progress", ...event });
    });

    sendEvent({ type: "result", ok: true, deleted: result.deleted });
    res.end();
  } catch (error) {
    sendEvent({ type: "error", ok: false, error: error.message });
    res.end();
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
  const { apiKey, model, provider, email } = req.body || {};

  try {
    if (!apiKey) throw new Error("Missing OpenAI API key.");
    if (!email) throw new Error("Missing email payload.");

    const summary = await callAI({
      provider,
      apiKey,
      model,
      maxTokens: 300,
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
    });

    res.json({ ok: true, summary });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post("/api/ai/draft-reply", async (req, res) => {
  const { apiKey, model, provider, email, decision } = req.body || {};

  try {
    if (!apiKey) throw new Error("Missing OpenAI API key.");
    if (!email) throw new Error("Missing email payload.");

    const draft = await callAI({
      provider,
      apiKey,
      model,
      maxTokens: 400,
      messages: [
        {
          role: "system",
          content: "You are an executive assistant. Draft a concise, professional email reply. Return only the draft email body."
        },
        {
          role: "user",
          content: `Email:\nFrom: ${email.from} <${email.addr}>\nSubject: ${email.subj}\n\n${email.body || email.prev}\n\nDecision summary:\n${JSON.stringify(decision || {}, null, 2)}`
        }
      ]
    });

    res.json({ ok: true, draft: String(draft || "").trim() });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post("/api/ai/brief", async (req, res) => {
  const { apiKey, model, provider, emails } = req.body || {};

  try {
    if (!apiKey) throw new Error("Missing OpenAI API key.");
    if (!Array.isArray(emails) || !emails.length) {
      throw new Error("No emails available for analysis.");
    }

    const snapshot = emails
      .slice(0, 20)
      .map((email) => `[${email.cat}][${email.star ? "starred" : "normal"}] "${email.subj}" from ${email.from}`)
      .join("\n");

    const brief = await callAI({
      provider,
      apiKey,
      model,
      maxTokens: 400,
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
    });

    res.json({ ok: true, brief });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post("/api/ai/learning-brief", async (req, res) => {
  const { apiKey, model, provider, emails } = req.body || {};

  try {
    if (!Array.isArray(emails) || !emails.length) {
      throw new Error("No learning emails available for summary.");
    }

    const payload = emails.slice(0, 24).map((email) => ({
      uid: String(email.uid),
      from: email.from,
      subject: email.subj,
      preview: buildCleanPreview(email.prev, 180),
      body: cleanNewsletterText(String(email.body || "")).slice(0, 1200)
    }));

    if (!apiKey) {
      const summaries = payload.map((email) => ({
        uid: email.uid,
        summary: buildCleanPreview(
          `${email.subject || "Newsletter update"}. ${email.preview || email.body || ""}`,
          180
        )
      }));
      return res.json({ ok: true, summaries, fallback: true });
    }

    const content = await callAI({
      provider,
      apiKey,
      model,
      maxTokens: 1000,
      responseFormat: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "You summarize learning-oriented newsletters for a busy reader.",
            "Return strict JSON with shape: {\"summaries\":[{\"uid\":\"abc\",\"summary\":\"one sentence\"}]}",
            "Rules:",
            "- Write exactly one concise sentence per email.",
            "- Focus on what the newsletter teaches, announces, or covers.",
            "- Do not mention links, unsubscribe text, or marketing boilerplate.",
            "- Ignore HTML fragments, tracking URLs, and email template scaffolding.",
            "- Keep each summary under 24 words."
          ].join("\n")
        },
        {
          role: "user",
          content: JSON.stringify(payload, null, 2)
        }
      ]
    });

    const parsed = JSON.parse(extractJsonBlock(content));
    const summaries = (Array.isArray(parsed.summaries) ? parsed.summaries : [])
      .map((item) => ({
        uid: String(item.uid),
        summary: String(item.summary || "").trim()
      }))
      .filter((item) => item.uid && item.summary);

    res.json({ ok: true, summaries });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post("/api/ai/strategy", async (req, res) => {
  const { apiKey, model, provider, emails, prompt } = req.body || {};

  try {
    if (!apiKey) throw new Error("Missing OpenAI API key.");
    const payload = (Array.isArray(emails) ? emails : []).slice(0, 80).map((email) => buildEmailContext(email, "strategy"));

    const promptLayer = String(prompt || "").trim() || "Group my inbox by urgency and theme. Keep labels practical and minimal.";
    const content = await callAI({
      provider,
      apiKey,
      model,
      maxTokens: 1400,
      messages: [
        {
          role: "system",
          content: [
            "You are an inbox decision strategist.",
            "Turn the user's organizing instructions into a practical decision strategy before any email-level action is taken.",
            "Return strict JSON with this shape:",
            "{",
            '  "strategy": "short paragraph",',
            '  "processingSummary": "one sentence about what analyze will do",',
            '  "labels": [{"name":"string","description":"string","color":"#RRGGBB"}],',
            '  "summarySections": ["string","string"]',
            "}",
            "Rules:",
            `- Labels must come only from these category enums: ${DECISION_CATEGORIES.join(", ")}.`,
            "- Return 1 to 3 relevant categories from that enum list, not custom names.",
            "- Cold outbound sales, unsolicited pitches, link-building, agency offers, growth hacks, SEO outreach, guest post asks, and generic marketing blasts should not be placed in a real work bucket unless the user's instructions explicitly say so.",
            "- Sales outreach, newsletters, bulk marketing, coupons, and low-value blasts should usually be promo unless the user's instructions clearly say otherwise.",
            "- The final analyze step will classify each email independently and decide whether it needs a reply, follow-up, or task conversion.",
            "- summarySections should explain what the system will prioritize or defer for the user."
          ].join("\n")
        },
        {
          role: "user",
          content: payload.length
            ? `User organizing instructions:\n${promptLayer}\n\nCurrent email snapshot:\n${JSON.stringify(payload, null, 2)}`
            : `User organizing instructions:\n${promptLayer}\n\nNo emails have been synced yet. Generate a strategy and label system from the user's instructions alone, and make the processing summary explain that analysis will start after mailbox sync.`
        }
      ]
    });

    const parsed = JSON.parse(extractJsonBlock(content));
    const labels = Array.isArray(parsed.labels) ? parsed.labels : [];

    const safeLabels = labels
      .map((label, index) => ({
        name: String(label.name || "").trim().toLowerCase(),
        description: String(label.description || "").trim(),
        color: /^#[0-9a-f]{6}$/i.test(label.color || "") ? label.color : ["#4f8ef7", "#3ecf8e", "#f7c948", "#f75f5f", "#00c8dc", "#7c5cfc"][index % 6]
      }))
      .filter((label) => DECISION_CATEGORIES.includes(label.name));

    const finalLabels = safeLabels.length ? safeLabels : getDefaultDecisionLabels();
    const finalSections = sanitizeStrategySections(parsed.summarySections);

    res.json({
      ok: true,
      strategy: String(parsed.strategy || "").trim(),
      processingSummary: String(parsed.processingSummary || "").trim(),
      labels: finalLabels,
      summarySections: finalSections
    });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post("/api/ai/organize", async (req, res) => {
  const { emails } = req.body || {};

  try {
    if (!Array.isArray(emails) || !emails.length) {
      throw new Error("No emails available for organization.");
    }
    const payload = emails.slice(0, 120);
    const safeDecisions = payload
      .map((email) => ({
        uid: Number(email.uid),
        ...classifyEmailDecision(email)
      }))
      .filter((decision) =>
        decision.uid &&
        DECISION_CATEGORIES.includes(decision.category) &&
        DECISION_URGENCY_LEVELS.includes(decision.urgency) &&
        DECISION_EFFORT_LEVELS.includes(decision.effort)
      );

    const needsReplyCount = safeDecisions.filter((decision) => decision.requires_reply).length;
    const highUrgencyCount = safeDecisions.filter((decision) => decision.urgency === "high").length;
    const taskCount = safeDecisions.filter((decision) => decision.convert_to_task).length;
    const summary = `${needsReplyCount} emails likely need a reply, ${highUrgencyCount} are high urgency, and ${taskCount} should probably become tracked tasks.`;

    res.json({
      ok: true,
      summary,
      labels: getDefaultDecisionLabels(),
      decisions: safeDecisions
    });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post("/api/mailboxes/create-labels", async (req, res) => {
  const { cfg, labels } = req.body || {};

  try {
    if (!Array.isArray(labels) || !labels.length) {
      throw new Error("No labels were provided.");
    }

    const requested = labels
      .map((label) => normalizeLabelName(label))
      .filter(Boolean)
      .slice(0, 20);

    if (!requested.length) {
      throw new Error("No valid labels were provided.");
    }

    const created = await withImap(cfg, async (client) => {
      const existing = await client.list();
      const existingPaths = new Set(existing.map((box) => box.path));
      const createdPaths = [];

      for (const label of requested) {
        const mailboxPath = `Luci Inbox/${label}`;
        if (!existingPaths.has(mailboxPath)) {
          await client.mailboxCreate(mailboxPath);
          existingPaths.add(mailboxPath);
          createdPaths.push(mailboxPath);
        }
      }

      return createdPaths;
    });

    res.json({ ok: true, created, requested });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.use(express.static(__dirname));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

export { app, HOST, PORT };

export function startServer(host = HOST, port = PORT) {
  return app.listen(port, host, () => {
    console.log(`Luci's Inbox Helper local server running at http://${host}:${port}/`);
    if (host === "127.0.0.1") {
      console.log(`Open http://localhost:${port}/ in your browser.`);
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  startServer();
}
