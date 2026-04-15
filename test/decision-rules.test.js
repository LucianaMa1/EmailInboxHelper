import test from "node:test";
import assert from "node:assert/strict";

import { classifyEmailDecision } from "../decision-rules.js";

test("classifies a direct deadline request as action with reply expected", () => {
  const decision = classifyEmailDecision({
    from: "Sarah Chen",
    addr: "sarah@company.com",
    subj: "Need your approval by EOD today",
    prev: "Please review the updated roadmap and reply with approval.",
    body: "Hi, please review the attached roadmap and reply with approval by EOD today. We need your sign-off before tomorrow's board call."
  });

  assert.equal(decision.category, "action");
  assert.equal(decision.requires_reply, true);
  assert.equal(decision.urgency, "high");
});

test("classifies a retail promotion as promo without reply pressure", () => {
  const decision = classifyEmailDecision({
    from: "Nordstrom Rewards",
    addr: "offers@nordstrom.com",
    subj: "Flash sale: 25% off ends tonight",
    prev: "Exclusive offer with free shipping.",
    body: "Shop now for exclusive savings, free shipping, and limited time deals. Unsubscribe anytime."
  });

  assert.equal(decision.category, "promo");
  assert.equal(decision.requires_reply, false);
  assert.equal(decision.urgency, "low");
});

test("classifies an editorial digest as learning", () => {
  const decision = classifyEmailDecision({
    from: "Fintech Brainfood",
    addr: "newsletter@fintechbrainfood.com",
    subj: "Weekly digest: fintech trends and analysis",
    prev: "This week's deep dive covers payments infrastructure and market shifts.",
    body: "Welcome back. This week's newsletter includes analysis, research, and a market map for emerging payment rails."
  });

  assert.equal(decision.category, "learning");
  assert.equal(decision.requires_reply, false);
  assert.equal(decision.disallowTask, true);
});
