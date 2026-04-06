const DEFAULT_ALLOWED_ORIGINS = [
  "https://keithfbuilds.dev",
  "https://www.keithfbuilds.dev",
  "http://localhost:5173",
];

const SUMMARY_FIELDS = [
  "total",
  "success",
  "failure",
  "blocked_origin",
  "rate_limited",
  "honeypot",
  "invalid",
  "risk_low",
  "risk_medium",
  "risk_high",
];

const summaryStore = globalThis.__contactSummaryStore || new Map();
globalThis.__contactSummaryStore = summaryStore;
const leadsStore = globalThis.__contactLeadsStore || [];
globalThis.__contactLeadsStore = leadsStore;
const LEADS_RECENT_LIMIT = Math.max(1, Number(process.env.CONTACT_RECENT_LEADS_LIMIT || 50));

function getAllowedOrigins() {
  const raw = process.env.CONTACT_ALLOWED_ORIGINS || "";
  const parsed = raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : DEFAULT_ALLOWED_ORIGINS;
}

function hasUpstash() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function sanitizeOrigin(origin) {
  try {
    if (!origin) return "";
    return new URL(origin).origin;
  } catch {
    return "";
  }
}

function summaryMetricKey(dateKey, metric) {
  return `contact:summary:${dateKey}:${metric}`;
}

function leadsRecentKey() {
  return "contact:leads:recent";
}

function json(statusCode, payload, origin) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin || "null",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Admin-Key",
      Vary: "Origin",
    },
    body: JSON.stringify(payload),
  };
}

async function upstashPipeline(commands) {
  const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/pipeline`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
    },
    body: JSON.stringify(commands),
  });

  if (!response.ok) {
    throw new Error(`Upstash request failed with ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data?.result) ? data.result : [];
}

function getAdminToken(event) {
  const rawAuth = event?.headers?.authorization || event?.headers?.Authorization || "";
  if (rawAuth.toLowerCase().startsWith("bearer ")) {
    return rawAuth.slice(7).trim();
  }
  return event?.headers?.["x-admin-key"] || event?.headers?.["X-Admin-Key"] || "";
}

function normalizeDate(input) {
  if (!input) return new Date().toISOString().slice(0, 10);
  const value = String(input).trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function getMemorySummary(dateKey) {
  const row = summaryStore.get(dateKey) || {};
  const out = {};
  for (const field of SUMMARY_FIELDS) {
    out[field] = Number(row[field] || 0);
  }
  return out;
}

async function getUpstashSummary(dateKey) {
  const commands = SUMMARY_FIELDS.map((field) => ["GET", summaryMetricKey(dateKey, field)]);
  const result = await upstashPipeline(commands);

  const out = {};
  SUMMARY_FIELDS.forEach((field, i) => {
    out[field] = Number(result?.[i]?.result || 0);
  });

  return out;
}

function getMemoryLeads(limit) {
  return leadsStore.slice(0, limit);
}

async function getUpstashLeads(limit) {
  const result = await upstashPipeline([["LRANGE", leadsRecentKey(), 0, limit - 1]]);
  const raw = result?.[0]?.result;
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      try {
        return typeof item === "string" ? JSON.parse(item) : item;
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function parsePositiveInt(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function buildReplyTemplate(lead) {
  const name = String(lead?.name || "there").trim();
  const email = String(lead?.email || "").trim();
  const riskLevel = String(lead?.riskLevel || "medium").toLowerCase();

  const baseSubject = `Re: Portfolio inquiry - ${name}`;

  if (riskLevel === "low") {
    return {
      level: "low",
      tone: "friendly",
      subject: baseSubject,
      body: [
        `Hi ${name},`,
        "",
        "Thank you for reaching out and for your interest in working together.",
        "I would love to learn more about the role/project details, scope, and expected timeline.",
        "",
        "If it works for you, we can set up a short intro call this week.",
        "",
        "Best regards,",
        "Keith",
      ].join("\n"),
      to: email,
    };
  }

  if (riskLevel === "high") {
    return {
      level: "high",
      tone: "verification-first",
      subject: `Verification required - ${baseSubject}`,
      body: [
        `Hi ${name},`,
        "",
        "Thanks for your message.",
        "Before we proceed, please confirm your company details and role by replying from an official company domain and sharing:",
        "1) Company website and role title",
        "2) Team/department and hiring manager name",
        "3) Public company contact channel where this opportunity can be verified",
        "",
        "After verification, I will be happy to continue the discussion.",
        "",
        "Regards,",
        "Keith",
      ].join("\n"),
      to: email,
    };
  }

  return {
    level: "medium",
    tone: "cautious",
    subject: baseSubject,
    body: [
      `Hi ${name},`,
      "",
      "Thank you for your inquiry.",
      "I am open to discussing this opportunity and would appreciate a few details first:",
      "- Company name and website",
      "- Role/project scope and engagement type",
      "- Hiring process and expected start date",
      "",
      "Once I receive these, we can schedule a call.",
      "",
      "Best,",
      "Keith",
    ].join("\n"),
    to: email,
  };
}

export async function handler(event) {
  const allowedOrigins = getAllowedOrigins();
  const requestOrigin = sanitizeOrigin(event?.headers?.origin || event?.headers?.Origin || "");
  const responseOrigin = requestOrigin || allowedOrigins[0];

  if (requestOrigin && !allowedOrigins.includes(requestOrigin)) {
    return json(403, { error: "Origin is not allowed." }, responseOrigin);
  }

  if (event.httpMethod === "OPTIONS") {
    return json(204, {}, responseOrigin);
  }

  if (event.httpMethod !== "GET") {
    return json(405, { error: "Method not allowed." }, responseOrigin);
  }

  const expectedAdminKey = process.env.ADMIN_SUMMARY_KEY;
  if (!expectedAdminKey) {
    return json(503, { error: "Summary endpoint is not configured." }, responseOrigin);
  }

  const token = getAdminToken(event);
  if (!token || token !== expectedAdminKey) {
    return json(401, { error: "Unauthorized." }, responseOrigin);
  }

  const date = normalizeDate(event?.queryStringParameters?.date);
  if (!date) {
    return json(400, { error: "Invalid date. Use YYYY-MM-DD." }, responseOrigin);
  }

  const includeLeads = String(event?.queryStringParameters?.includeLeads || "1") !== "0";
  const leadsLimit = Math.min(
    LEADS_RECENT_LIMIT,
    parsePositiveInt(event?.queryStringParameters?.leadsLimit, 10)
  );

  try {
    const data = hasUpstash() ? await getUpstashSummary(date) : getMemorySummary(date);
    const total = data.total || 0;
    const recentLeads = includeLeads
      ? hasUpstash()
        ? await getUpstashLeads(leadsLimit)
        : getMemoryLeads(leadsLimit)
      : [];

    const leadsWithTemplates = recentLeads.map((lead) => ({
      ...lead,
      suggestedReply: buildReplyTemplate(lead),
    }));

    return json(200, {
      ok: true,
      date,
      source: hasUpstash() ? "upstash" : "memory",
      metrics: {
        ...data,
        successRate: total > 0 ? Number(((data.success / total) * 100).toFixed(2)) : 0,
      },
      leadReview: {
        includeLeads,
        leadsReturned: leadsWithTemplates.length,
        recentLeads: leadsWithTemplates,
      },
    }, responseOrigin);
  } catch {
    return json(500, { error: "Unable to load summary." }, responseOrigin);
  }
}
