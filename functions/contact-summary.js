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
];

const summaryStore = globalThis.__contactSummaryStore || new Map();
globalThis.__contactSummaryStore = summaryStore;

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

  try {
    const data = hasUpstash() ? await getUpstashSummary(date) : getMemorySummary(date);
    const total = data.total || 0;
    return json(200, {
      ok: true,
      date,
      source: hasUpstash() ? "upstash" : "memory",
      metrics: {
        ...data,
        successRate: total > 0 ? Number(((data.success / total) * 100).toFixed(2)) : 0,
      },
    }, responseOrigin);
  } catch {
    return json(500, { error: "Unable to load summary." }, responseOrigin);
  }
}
