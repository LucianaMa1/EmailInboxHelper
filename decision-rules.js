export const DECISION_CATEGORIES = ["action", "info", "promo", "learning"];
export const DECISION_URGENCY_LEVELS = ["low", "medium", "high"];
export const DECISION_EFFORT_LEVELS = ["quick", "deep"];

const NEWSLETTER_BRANDS = [
  "substack",
  "morning brew",
  "axios",
  "techcrunch",
  "the information",
  "the paypers",
  "fintech brainfood",
  "simon taylor",
  "payments strategy breakdown",
  "dwayne gefferie",
  "ben's bites",
  "lenny's newsletter",
  "xhs",
  "xiaohongshu"
];

const PROMO_PATTERNS = [
  "sale",
  "flash sale",
  "limited time",
  "ends tonight",
  "shop now",
  "buy now",
  "exclusive offer",
  "save big",
  "discount",
  "clearance",
  "% off",
  "deal",
  "deals",
  "coupon",
  "promo code",
  "free shipping",
  "last chance",
  "offer expires",
  "recommended for you",
  "you may also like",
  "new arrivals",
  "spring styles",
  "congratulates michigan",
  "gift with purchase",
  "afterpay",
  "while supplies last",
  "check out",
  "get started",
  "on us",
  "special offer",
  "exclusive savings",
  "free groceries",
  "local sitters",
  "indicate your interest"
];

const PROMO_SENDER_PATTERNS = [
  "store",
  "shopping",
  "fashion",
  "outlet",
  "rewards",
  "deals",
  "beauty",
  "nordstrom",
  "adidas",
  "confirmed",
  "marketing",
  "hilfiger",
  "tommy",
  "estee",
  "estée",
  "loyalty",
  "elist",
  "e-list",
  "care.com",
  "groupon",
  "thrive market",
  "hydro flask",
  "contact."
];

const PROMO_BODY_PATTERNS = [
  "unsubscribe",
  "display images to show real-time content",
  "while supplies last",
  "recommended for you",
  "you may also like",
  "free returns",
  "free samples",
  "gift with purchase",
  "shop the collection",
  "new beauty must-haves",
  "swipe sparkle go"
];

const ACTION_PATTERNS = [
  "action required",
  "please review",
  "please respond",
  "reply needed",
  "respond by",
  "deadline",
  "due today",
  "due tomorrow",
  "review requested",
  "approve",
  "approval needed",
  "confirm",
  "confirmation needed",
  "complete your setup",
  "finish setting up",
  "verify now",
  "update required",
  "submit",
  "sign",
  "schedule",
  "rsvp",
  "following up",
  "follow up",
  "next steps"
];

const TRANSACTIONAL_PATTERNS = [
  "security",
  "credential",
  "credentials",
  "password",
  "reset password",
  "verification",
  "verify your email",
  "verify email",
  "login",
  "new login",
  "sign in",
  "sign-in",
  "sign on",
  "account",
  "portal",
  "access",
  "access granted",
  "access request",
  "reminder",
  "expires",
  "expiration",
  "expiring",
  "billing",
  "invoice",
  "receipt",
  "order confirmation",
  "shipment",
  "delivery",
  "tax document",
  "statement",
  "notice",
  "alert",
  "booking confirmation",
  "travel itinerary"
];

const EDITORIAL_SENDER_PATTERNS = [
  "newsletter",
  "digest",
  "brief",
  "roundup",
  "editor",
  "editors",
  "newsroom",
  "briefing",
  "institute"
];

const EDITORIAL_SUBJECT_PATTERNS = [
  "daily digest",
  "weekly digest",
  "monthly digest",
  "xhs digest",
  "daily brief",
  "weekly brief",
  "roundup",
  "newsletter",
  "what we're reading",
  "top stories",
  "this week in",
  "today in"
];

const LEARNING_INTENT_PATTERNS = [
  "research",
  "analysis",
  "report",
  "insights",
  "trend",
  "trends",
  "guide",
  "playbook",
  "case study",
  "deep dive",
  "benchmark",
  "market map",
  "explainer",
  "how to",
  "what you need to know",
  "essay",
  "breakdown",
  "thinking"
];

const HIGH_VALUE_INFO_PATTERNS = [
  "receipt",
  "invoice",
  "statement",
  "tax",
  "security alert",
  "password reset",
  "verification code",
  "new login",
  "policy update",
  "travel itinerary",
  "booking confirmation",
  "interview",
  "offer letter",
  "contract",
  "meeting notes",
  "claim",
  "escalation"
];

const NO_REPLY_PATTERNS = [
  "no-reply",
  "noreply",
  "do-not-reply",
  "donotreply"
];

const HIGH_URGENCY_PATTERNS = [
  "urgent",
  "asap",
  "by eod",
  "deadline",
  "immediately",
  "final reminder",
  "due today",
  "due tomorrow",
  "respond by",
  "action required"
];

const FOLLOW_UP_PATTERNS = [
  "follow up",
  "following up",
  "check back",
  "next steps",
  "waiting on",
  "loop back",
  "keep posted",
  "reminder"
];

const DEEP_PATTERNS = [
  "proposal",
  "contract",
  "scope",
  "review",
  "deck",
  "spec",
  "plan",
  "analysis",
  "notes",
  "brief",
  "summary",
  "document",
  "attached",
  "roadmap",
  "legal"
];

const TASK_PATTERNS = [
  "claim",
  "escalation",
  "contract",
  "proposal",
  "review requested",
  "approval needed",
  "sign",
  "complete your setup",
  "finish setting up",
  "access request",
  "next steps",
  "follow up"
];

const FINANCE_PATTERNS = [
  "invoice",
  "payment",
  "payments",
  "billing",
  "bill",
  "claim",
  "claims",
  "refund",
  "refunded",
  "receipt",
  "statement",
  "transaction",
  "charged",
  "charge",
  "payout",
  "deposit",
  "tax",
  "notification",
  "notifications",
  "account notice"
];

const ORDERS_AND_RECEIPTS_PATTERNS = [
  "order confirmation",
  "your order",
  "order has shipped",
  "shipment",
  "shipping update",
  "delivery update",
  "delivered",
  "out for delivery",
  "receipt",
  "invoice",
  "payment receipt",
  "purchase confirmation",
  "return received",
  "refund processed",
  "track your package",
  "tracking number"
];

const CUSTOM_CATEGORY_STOPWORDS = new Set([
  "about", "after", "again", "anything", "around", "because", "before", "being", "below", "between",
  "could", "every", "first", "found", "from", "have", "into", "just", "like", "make", "more", "most",
  "much", "must", "only", "other", "over", "same", "should", "some", "such", "than", "that", "their",
  "them", "then", "there", "these", "they", "this", "those", "through", "under", "very", "what", "when",
  "where", "which", "while", "with", "would", "your"
]);

function normalizeWhitelist(values = []) {
  const list = Array.isArray(values)
    ? values
    : String(values || "")
        .split(/[\n,]/)
        .map((item) => item.trim());
  return list.map((item) => normalize(item)).filter(Boolean);
}

function stripInvisibleChars(value = "") {
  return String(value || "").replace(/[\u00ad\u034f\u061c\u115f\u1160\u17b4\u17b5\u180e\u200b-\u200f\u202a-\u202e\u2060-\u206f\u3164\ufeff\uffa0]/g, " ");
}

function stripUrls(value = "") {
  return String(value || "").replace(/https?:\/\/\S+/gi, " ");
}

function normalize(str = "") {
  return stripInvisibleChars(stripUrls(String(str || "")))
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(text, patterns = []) {
  const hay = normalize(text);
  return patterns.some((pattern) => hay.includes(normalize(pattern)));
}

function escapeRegex(str = "") {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function regexAny(text, patterns = []) {
  const hay = normalize(text);
  return patterns.some((pattern) => new RegExp(`\\b${escapeRegex(normalize(pattern))}\\b`, "i").test(hay));
}

function countMatches(text, patterns = []) {
  const hay = normalize(text);
  return patterns.reduce((count, pattern) => count + (hay.includes(normalize(pattern)) ? 1 : 0), 0);
}

function getParts(email = {}) {
  return {
    from: normalize(email.from || ""),
    addr: normalize(email.addr || email.address || email.email || ""),
    subject: normalize(email.subj || email.subject || ""),
    preview: normalize(email.prev || email.preview || ""),
    body: normalize(email.body || email.bodySnippet || ""),
    learningWhitelist: email.learningWhitelist || email.customLearningWhitelist || [],
    ownerTokens: Array.isArray(email.ownerTokens) ? email.ownerTokens : [],
    ownerEmail: normalize(email.ownerEmail || ""),
    customCategories: Array.isArray(email.customCategories) ? email.customCategories : []
  };
}

function buildTexts(parts) {
  const senderText = `${parts.from} ${parts.addr}`.trim();
  const subjectText = parts.subject;
  const contentText = `${parts.subject} ${parts.preview} ${parts.body}`.trim();
  const haystack = `${senderText} ${contentText}`.trim();
  return { senderText, subjectText, contentText, haystack };
}

function normalizeOwnerTokens(values = []) {
  return (Array.isArray(values) ? values : [])
    .map((value) => normalize(value))
    .filter((value) => value && value.length >= 3);
}

function ownerMentionScore(parts) {
  const ownerTokens = normalizeOwnerTokens(parts.ownerTokens);
  const ownerEmail = normalize(parts.ownerEmail || "");
  if (!ownerTokens.length && !ownerEmail) return 0;

  const { subjectText, contentText } = buildTexts(parts);
  const combined = `${subjectText} ${contentText}`;
  let score = 0;

  for (const token of ownerTokens) {
    if (combined.includes(token)) score += 1;
  }

  if (ownerEmail && combined.includes(ownerEmail)) {
    score += 2;
  }

  return score;
}

function isFinanceSource(parts) {
  const { senderText, subjectText, contentText } = buildTexts(parts);
  const financeLanguage = countMatches(`${subjectText} ${contentText}`, FINANCE_PATTERNS);
  const financeSender = /(billing|payments?|claims?|invoices?|bank|stripe|chase|amex|visa|mastercard|customer care claims|escalations)/i.test(senderText);
  return financeLanguage >= 1 || financeSender;
}

function inferFinanceBucket(parts) {
  const financeRelated = isFinanceSource(parts);
  if (!financeRelated) return "other";
  return ownerMentionScore(parts) > 0 ? "personal_finance" : "finance";
}

function normalizeCustomCategories(values = []) {
  return (Array.isArray(values) ? values : [])
    .map((item) => ({
      id: String(item?.id || "").trim(),
      name: String(item?.name || "").trim(),
      instructions: String(item?.instructions || "").trim()
    }))
    .filter((item) => item.name);
}

function customCategoryTokens(category = {}) {
  return Array.from(new Set(
    `${category.name || ""} ${category.instructions || ""}`
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 4 && !CUSTOM_CATEGORY_STOPWORDS.has(token))
  )).slice(0, 16);
}

function inferCustomCategory(parts) {
  const builtinCategory = inferBuiltinCustomCategory(parts);
  if (builtinCategory) return builtinCategory;

  const categories = normalizeCustomCategories(parts.customCategories);
  if (!categories.length) return "";

  const { senderText, subjectText, contentText, haystack } = buildTexts(parts);
  let best = { name: "", score: 0 };

  for (const category of categories) {
    const name = normalize(category.name);
    const instructions = normalize(category.instructions);
    const tokens = customCategoryTokens(category);
    const directNameMatch = name && (subjectText.includes(name) || haystack.includes(name));
    const senderMatches = tokens.filter((token) => senderText.includes(token)).length;
    const bodyMatches = tokens.filter((token) => contentText.includes(token)).length;
    const instructionPhraseMatch = instructions && haystack.includes(instructions);
    const score = (directNameMatch ? 4 : 0) + (instructionPhraseMatch ? 3 : 0) + senderMatches + bodyMatches;

    if (score > best.score && (directNameMatch || instructionPhraseMatch || senderMatches + bodyMatches >= 2)) {
      best = { name: category.name, score };
    }
  }

  return best.name;
}

function inferBuiltinCustomCategory(parts) {
  const { senderText, subjectText, contentText, haystack } = buildTexts(parts);
  const ordersAndReceiptsScore =
    countMatches(`${subjectText} ${contentText}`, ORDERS_AND_RECEIPTS_PATTERNS)
    + (/(order|receipt|invoice|shipping|delivery|tracking|returns?|refund)/i.test(senderText) ? 1 : 0)
    + (/(track your package|tracking number|order #|receipt #|invoice #)/i.test(haystack) ? 1 : 0);

  if (ordersAndReceiptsScore >= 2) {
    return "orders and receipts";
  }

  return "";
}

export function isNoReplySender(parts) {
  const senderText = `${parts.from} ${parts.addr}`;
  return includesAny(senderText, NO_REPLY_PATTERNS);
}

export function isPromoSource(parts) {
  const { senderText, subjectText, contentText } = buildTexts(parts);
  const senderLooksRetail = includesAny(senderText, PROMO_SENDER_PATTERNS);
  const subjectPromoCount = countMatches(subjectText, PROMO_PATTERNS);
  const contentPromoCount = countMatches(contentText, [...PROMO_PATTERNS, ...PROMO_BODY_PATTERNS]);
  const promoLanguage = subjectPromoCount + contentPromoCount;
  const repeatedCtaSignals = /(shop now|buy now|learn more|last chance|limited time|free shipping)/i.test(contentText);
  const onboardingOrMarketing = /(check out|get started|on us|exclusive savings|free groceries|find care|local sitters|indicate your interest)/i.test(contentText);
  const promoScore = (senderLooksRetail ? 2 : 0) + promoLanguage + (repeatedCtaSignals ? 1 : 0) + (onboardingOrMarketing ? 1 : 0);
  return promoScore >= 2;
}

export function hasActionSignals(parts) {
  const { subjectText, contentText } = buildTexts(parts);
  return includesAny(subjectText, ACTION_PATTERNS) || includesAny(contentText, ACTION_PATTERNS);
}

export function isTransactionalOrSystemInfo(parts) {
  const { senderText, subjectText, contentText } = buildTexts(parts);
  const senderLooksSystem = /(no-?reply|noreply|notification|notifications|support|security|alerts?)/i.test(senderText);
  const transactionalLanguage = includesAny(subjectText, TRANSACTIONAL_PATTERNS) || includesAny(contentText, TRANSACTIONAL_PATTERNS);
  const hardMatch = /(security credentials?|update your credentials?|password reset|verify your email|new login|sign-?in attempt|access granted|access request|account notice|billing notice|invoice|receipt|order confirmation|shipment|delivery)/i.test(contentText);
  return (senderLooksSystem && transactionalLanguage) || hardMatch || transactionalLanguage;
}

export function isHighValueInfo(parts) {
  const { subjectText, contentText } = buildTexts(parts);
  return includesAny(subjectText, HIGH_VALUE_INFO_PATTERNS) || includesAny(contentText, HIGH_VALUE_INFO_PATTERNS);
}

export function hasReplyExpectation(parts) {
  const { subjectText, contentText } = buildTexts(parts);
  const explicitAskPatterns = [
    "can you",
    "could you",
    "please review",
    "please confirm",
    "please respond",
    "please reply",
    "let me know",
    "what do you think",
    "thoughts?",
    "are you available",
    "send me",
    "get back to me"
  ];
  return includesAny(subjectText, explicitAskPatterns)
    || includesAny(contentText, explicitAskPatterns)
    || /(^|\s)(re:|fwd:)\b/i.test(subjectText);
}

export function isNewsletterOrNewsSource(parts) {
  const { senderText, subjectText, contentText } = buildTexts(parts);
  const customWhitelist = normalizeWhitelist(parts.learningWhitelist);
  const senderLooksEditorial = includesAny(senderText, EDITORIAL_SENDER_PATTERNS) || includesAny(senderText, [...NEWSLETTER_BRANDS, ...customWhitelist]);
  const subjectLooksEditorial = includesAny(subjectText, EDITORIAL_SUBJECT_PATTERNS) || /(daily|weekly|monthly).*(digest|brief|roundup|newsletter|update)/i.test(subjectText);
  const bodyLooksEditorial = /(in this edition|top stories|read more|what we're reading|weekly roundup|today's newsletter|editor's note)/i.test(contentText);
  return senderLooksEditorial || subjectLooksEditorial || bodyLooksEditorial;
}

function isDirectLearningWhitelist(parts) {
  const { senderText, subjectText } = buildTexts(parts);
  const combined = [...NEWSLETTER_BRANDS, ...normalizeWhitelist(parts.learningWhitelist)];
  return includesAny(senderText, combined) || includesAny(subjectText, combined);
}

export function isLearningSource(parts) {
  const { senderText, subjectText, contentText } = buildTexts(parts);
  const editorialSignals = isNewsletterOrNewsSource(parts) || /(editor|editorial|community digest|weekly roundup|briefing)/i.test(senderText);
  const learningIntentSignals = includesAny(subjectText, LEARNING_INTENT_PATTERNS) || includesAny(contentText, LEARNING_INTENT_PATTERNS);
  const essayStyleSignals = /(essay|thinking|philosophy|ideas|the [a-z]+ chain|deep dive|analysis)/i.test(contentText);
  const digestSignals = /(xhs digest|xiaohongshu digest|daily digest|weekly digest|monthly digest)/i.test(`${senderText} ${subjectText}`);
  return (isDirectLearningWhitelist(parts) || digestSignals || (editorialSignals && learningIntentSignals) || (editorialSignals && essayStyleSignals))
    && !isTransactionalOrSystemInfo(parts)
    && !isPromoSource(parts);
}

function inferSenderImportance(email = {}) {
  const text = `${email.from || ""} ${email.addr || email.address || ""}`.toLowerCase();
  if (/(ceo|founder|investor|legal|board|customer|client|sarah|priya|david)/.test(text)) return "vip";
  if (/(github|notion|linear|noreply|no-reply|notification)/.test(text)) return "automated";
  return "known";
}

function getSubtype(parts) {
  const { contentText } = buildTexts(parts);
  if (/(password reset|verify your email|new login|security|credential)/i.test(contentText)) return "security_notice";
  if (/(portal|developer portal|access granted|access request)/i.test(contentText)) return "portal_update";
  if (isNewsletterOrNewsSource(parts) || isLearningSource(parts)) return "newsletter";
  if (isPromoSource(parts)) return "promo_offer";
  if (/(invoice|receipt|statement|order confirmation)/i.test(contentText)) return "receipt";
  if (/(please review|respond|reply|approve|schedule|rsvp|confirm)/i.test(contentText)) return "human_request";
  return "general_info";
}

function inferActionType(decision) {
  if (decision.category === "promo") return "read";
  if (decision.category === "learning") return "learn";
  if (decision.requires_reply) return "reply";
  if (decision.convert_to_task || decision.effort === "deep") return "review";
  if (decision.follow_up) return "track";
  return "read";
}

function inferRuleType(category) {
  return category === "action" ? "action_required" : category === "promo" ? "noise" : "informational";
}

function refineReplyDecision({ parts, category, replyExpectation, actionSignals, promoSignals, transactionalInfo, noReply }) {
  const { subjectText, contentText } = buildTexts(parts);
  const directReplySignals = [
    "please reply",
    "reply by",
    "let me know",
    "can you",
    "could you",
    "would you",
    "please confirm",
    "please respond",
    "send me",
    "get back to me",
    "what do you think",
    "are you available",
    "thoughts?"
  ];
  const coordinationSignals = [
    "approve",
    "confirm",
    "availability",
    "schedule",
    "meeting",
    "calendar",
    "review requested",
    "feedback",
    "follow up",
    "following up",
    "next steps",
    "rsvp"
  ];
  const text = `${subjectText} ${contentText}`;
  const directReplyCount = countMatches(text, directReplySignals);
  const coordinationCount = countMatches(text, coordinationSignals);
  const weakQuestionOnly = /\?/.test(text) && directReplyCount === 0 && coordinationCount === 0;
  const subjectIsConversational = /^(re|fwd):/i.test(subjectText) || /(quick question|checking in|following up)/i.test(subjectText);
  const explicitRecipientAsk = /(you|your)\b/.test(text) && (directReplyCount > 0 || coordinationCount > 0);
  const requiresReply = category === "action"
    && replyExpectation
    && !promoSignals
    && !transactionalInfo
    && !noReply
    && !weakQuestionOnly
    && (directReplyCount > 0 || coordinationCount > 1 || explicitRecipientAsk || subjectIsConversational || actionSignals);

  return {
    requiresReply,
    reviewScore: Math.min(5, directReplyCount + coordinationCount + (subjectIsConversational ? 1 : 0) + (explicitRecipientAsk ? 1 : 0)),
    reviewReason: requiresReply
      ? "A second pass found explicit reply language aimed at you, so this stays in reply next."
      : replyExpectation
        ? "A second pass did not find a clear direct ask, so this should not sit in reply next."
        : "No explicit reply ask was found on review."
  };
}

export function classifyEmailDecision(email = {}) {
  const parts = getParts(email);
  const { haystack, contentText } = buildTexts(parts);

  const promoSignals = isPromoSource(parts);
  const actionSignals = hasActionSignals(parts);
  const transactionalInfo = isTransactionalOrSystemInfo(parts);
  const newsSignals = isNewsletterOrNewsSource(parts);
  const learningSource = isLearningSource(parts);
  const highValueInfo = isHighValueInfo(parts);
  const noReply = isNoReplySender(parts);
  const replyExpectation = hasReplyExpectation(parts);

  let category = "info";

  if (promoSignals && !transactionalInfo && !highValueInfo) {
    category = "promo";
  } else if ((newsSignals || learningSource) && !promoSignals && !transactionalInfo && !actionSignals && !replyExpectation && !highValueInfo) {
    category = "learning";
  } else if (highValueInfo && /(deadline|today|tomorrow|due|review|action required)/i.test(haystack)) {
    category = "action";
  } else if (actionSignals || replyExpectation) {
    category = "action";
  } else if (!noReply && /\b(re|fwd):/i.test(parts.subject)) {
    category = "action";
  } else if (transactionalInfo) {
    category = /(action required|update required|verify now|expires|expiration|expiring|reminder)/i.test(haystack) ? "action" : "info";
  } else if (highValueInfo) {
    category = "info";
  }

  const replyReview = refineReplyDecision({
    parts,
    category,
    replyExpectation,
    actionSignals,
    promoSignals,
    transactionalInfo,
    noReply
  });

  const disallowReply = category === "promo" || category === "learning";
  const disallowTask = category === "promo" || category === "learning";
  const requiresReply = !disallowReply && replyReview.requiresReply;
  const hardUrgency = regexAny(haystack, HIGH_URGENCY_PATTERNS);
  const urgency = category === "promo" || category === "learning"
    ? "low"
    : hardUrgency
      ? "high"
      : category === "action"
        ? "medium"
        : "low";
  const effort = category === "action" && includesAny(contentText, DEEP_PATTERNS) ? "deep" : ((category === "info" || category === "learning") && (includesAny(contentText, DEEP_PATTERNS) || contentText.length > 1600) ? "deep" : "quick");
  const followUp = includesAny(haystack, FOLLOW_UP_PATTERNS);
  const taskSignals = includesAny(contentText, TASK_PATTERNS);
  const convertToTask = category === "action" && !disallowTask && !requiresReply && (effort === "deep" || followUp || taskSignals);

  let reason = "Primarily informational with no strong action signal.";
  if (category === "promo") {
    reason = "Contains promotional or retail-style language and should be handled like a promo, not a learning item.";
  } else if (category === "learning") {
    reason = "Looks editorial and learning-oriented, so it belongs in newsletters for learning rather than reply next.";
  } else if (category === "action") {
    reason = requiresReply
      ? "The sender appears to expect a response or action from you."
      : replyExpectation
        ? replyReview.reviewReason
        : "This message contains a clear action or coordination signal even if no reply is strictly required.";
  } else if (transactionalInfo || highValueInfo) {
    reason = "Looks like transactional or system information that is useful to read but not something to classify as learning.";
  }

  return {
    category,
    subtype: getSubtype(parts),
    disallowReply,
    disallowTask,
    requires_reply: requiresReply,
    reply_candidate: replyExpectation && category === "action",
    reply_score: replyReview.reviewScore,
    urgency,
    effort,
    follow_up: followUp,
    convert_to_task: convertToTask,
    reason,
    debug: {
      promoSignals,
      actionSignals,
      transactionalInfo,
      newsSignals,
      learningSource,
      highValueInfo,
      noReply,
      replyExpectation
    }
  };
}

function inferConfidence(email, decision, rule) {
  const parts = getParts(email);
  const { haystack } = buildTexts(parts);
  let score = 0.62;
  if (rule.type === "action_required") score += 0.12;
  if (/(please|need|review|reply|schedule|approve|deadline)/.test(haystack)) score += 0.12;
  if (decision.urgency === "high") score += 0.08;
  if (inferSenderImportance(email) === "vip") score += 0.04;
  if (rule.type === "noise") score += 0.06;
  if (decision.requires_reply) score += Math.min(0.12, (decision.reply_score || 0) * 0.02);
  if (!decision.requires_reply && decision.reply_candidate) score -= 0.08;
  return Math.max(0.35, Math.min(0.98, Number(score.toFixed(2))));
}

export function buildDecisionRule(email = {}, decision = classifyEmailDecision(email)) {
  const parts = getParts(email);
  const { subjectText, previewText = parts.preview, contentText } = { subjectText: parts.subject, previewText: parts.preview, contentText: `${parts.subject} ${parts.preview} ${parts.body}`.trim() };
  const financeBucket = inferFinanceBucket(parts);
  const customCategory = inferCustomCategory(parts);
  const rule = {
    type: inferRuleType(decision.category),
    finance: financeBucket,
    custom_category: customCategory || "uncategorized",
    priority: decision.urgency === "high" ? "high" : decision.urgency === "medium" ? "medium" : "low",
    action: inferActionType(decision),
    urgency: decision.urgency === "high" ? "today" : decision.urgency === "medium" ? "this_week" : "later",
    key_entities: {
      sender: inferSenderImportance(email) === "vip" ? "colleague" : inferSenderImportance(email),
      topic: subjectText || previewText.split(".")[0] || "Inbox item",
      deadline: contentText.match(/(EOD tomorrow|by [^.!\n]+|tomorrow|today|Friday|Monday|Tuesday|Wednesday|Thursday|Saturday|Sunday)/i)?.[0] || "none stated",
      finance_owner_match: financeBucket === "personal_finance" ? "owner mentioned" : financeBucket === "finance" ? "finance-related" : "not finance"
    },
    reason: {
      why_type: decision.category === "action" ? "Explicit request for review" : decision.category === "promo" ? "Promotional or digest pattern" : decision.category === "learning" ? "Learning-oriented editorial content" : "Primarily informational content",
      why_action: decision.requires_reply
        ? `Direct response is likely expected (reply review ${decision.reply_score || 0}/5)`
        : decision.reply_candidate
          ? `Reply signals were reviewed again and did not hold up (${decision.reply_score || 0}/5)`
          : decision.convert_to_task
            ? "Requires focused time, not instant reply"
            : decision.follow_up
              ? "Should become tracked work"
              : decision.category === "learning"
                ? "Worth saving to learn from later, not for immediate action"
                : "Can be triaged with a quick read",
      risk_if_ignored: decision.urgency === "high" ? "Blocks project progress" : decision.urgency === "medium" ? "May delay follow-up" : "Low immediate risk"
    }
  };
  rule.confidence = inferConfidence(email, decision, rule);
  return rule;
}

export function emailDecision(email = {}) {
  const decision = classifyEmailDecision(email);
  return {
    ...decision,
    sender_importance: inferSenderImportance(email),
    rule: buildDecisionRule(email, decision)
  };
}

export function fallbackOneLine(email = {}) {
  const decision = emailDecision(email);
  if (decision.category === "promo") return "Quietly low priority. Review only if you have space.";
  if (decision.category === "learning") return "Looks worth reading to learn from later, but nothing here needs a reply now.";
  if (decision.urgency === "high") return "This looks time-sensitive and worth moving on soon.";
  if (decision.requires_reply) return "A response is probably expected here.";
  return "Mostly informational, with no immediate action signal.";
}

export function confidenceTone(confidence) {
  if (confidence >= 0.85) return "high";
  if (confidence >= 0.65) return "mid";
  return "low";
}
