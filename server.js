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

app.post("/api/ai/strategy", async (req, res) => {
  const { apiKey, model, provider, emails, prompt } = req.body || {};

  try {
    if (!apiKey) throw new Error("Missing OpenAI API key.");
    const payload = (Array.isArray(emails) ? emails : []).slice(0, 80).map((email) => ({
      uid: email.uid,
      from: email.from,
      address: email.addr,
      subject: email.subj,
      preview: email.prev,
      category: email.cat,
      starred: Boolean(email.star),
      unread: Boolean(email.unread),
      spam: Boolean(email.spam)
    }));

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
            "You are an inbox operations strategist.",
            "Turn the user's organizing instructions into a practical inbox strategy before any email-level action is taken.",
            "Return strict JSON with this shape:",
            "{",
            '  "strategy": "short paragraph",',
            '  "processingSummary": "one sentence about what analyze will do",',
            '  "labels": [{"name":"string","description":"string","color":"#RRGGBB"}],',
            '  "summarySections": ["string","string"]',
            "}",
            "Rules:",
            "- Create 3 to 7 labels max.",
            "- Label names must be short, distinct, and mailbox-safe.",
            "- Prefer practical work labels over vague emotional ones.",
            "- summarySections should explain what the system will summarize or prioritize for the user."
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
        name: normalizeLabelName(label.name || `Label ${index + 1}`),
        description: String(label.description || "").trim(),
        color: /^#[0-9a-f]{6}$/i.test(label.color || "") ? label.color : ["#4f8ef7", "#3ecf8e", "#f7c948", "#f75f5f", "#00c8dc", "#7c5cfc"][index % 6]
      }))
      .filter((label) => label.name);

    res.json({
      ok: true,
      strategy: String(parsed.strategy || "").trim(),
      processingSummary: String(parsed.processingSummary || "").trim(),
      labels: safeLabels,
      summarySections: Array.isArray(parsed.summarySections)
        ? parsed.summarySections.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 4)
        : []
    });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post("/api/ai/organize", async (req, res) => {
  const { apiKey, model, provider, emails, prompt, strategy, labels } = req.body || {};

  try {
    if (!apiKey) throw new Error("Missing OpenAI API key.");
    if (!Array.isArray(emails) || !emails.length) {
      throw new Error("No emails available for organization.");
    }

    const usableLabels = Array.isArray(labels) ? labels : [];
    if (!usableLabels.length) {
      throw new Error("Generate a strategy first so labels exist.");
    }

    const payload = emails.slice(0, 80).map((email) => ({
      uid: email.uid,
      from: email.from,
      address: email.addr,
      subject: email.subj,
      preview: email.prev,
      category: email.cat,
      starred: Boolean(email.star),
      unread: Boolean(email.unread),
      spam: Boolean(email.spam)
    }));

    const content = await callAI({
      provider,
      apiKey,
      model,
      maxTokens: 1800,
      messages: [
        {
          role: "system",
          content: [
            "You are an inbox operations assistant.",
            "Use the approved strategy and labels exactly as provided.",
            "Return strict JSON with this shape:",
            "{",
            '  "summary": "short paragraph",',
            '  "assignments": [{"uid":123,"label":"string","reason":"short sentence","priority":"high|medium|low"}]',
            "}",
            "Rules:",
            "- Every assignment label must match one of the approved labels.",
            "- Assign every email to exactly one approved label.",
            "- Reason should explain why that email belongs there.",
            "- Priority should reflect the user's stated urgency preferences."
          ].join("\n")
        },
        {
          role: "user",
          content: `User instructions:\n${String(prompt || "").trim()}\n\nApproved strategy:\n${String(strategy || "").trim()}\n\nApproved labels:\n${JSON.stringify(usableLabels, null, 2)}\n\nEmails:\n${JSON.stringify(payload, null, 2)}`
        }
      ]
    });

    const parsed = JSON.parse(extractJsonBlock(content));
    const labelSet = new Set(usableLabels.map((label) => normalizeLabelName(label.name)));
    const assignments = Array.isArray(parsed.assignments) ? parsed.assignments : [];
    const safeAssignments = assignments
      .map((assignment) => ({
        uid: Number(assignment.uid),
        label: normalizeLabelName(assignment.label),
        reason: String(assignment.reason || "").trim(),
        priority: ["high", "medium", "low"].includes(String(assignment.priority || "").toLowerCase())
          ? String(assignment.priority).toLowerCase()
          : "medium"
      }))
      .filter((assignment) => assignment.uid && labelSet.has(assignment.label));

    res.json({
      ok: true,
      summary: String(parsed.summary || "").trim(),
      assignments: safeAssignments
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
        const mailboxPath = `MailMind/${label}`;
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

app.listen(PORT, () => {
  console.log(`MailMind local server running at http://localhost:${PORT}/`);
});
