const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX_REQUESTS = 5;
const SUMMARY_RETENTION_DAYS = Math.max(1, Number(process.env.CONTACT_SUMMARY_RETENTION_DAYS || 30));
const SUMMARY_TTL_SEC = SUMMARY_RETENTION_DAYS * 24 * 60 * 60;

const DEFAULT_ALLOWED_ORIGINS = [
  "https://keithfbuilds.dev",
  "https://www.keithfbuilds.dev",
  "http://localhost:5173",
];

const rateStore = globalThis.__contactRateStore || new Map();
globalThis.__contactRateStore = rateStore;

const summaryStore = globalThis.__contactSummaryStore || new Map();
globalThis.__contactSummaryStore = summaryStore;

function hasUpstash() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function summaryDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function summaryMetricKey(dateKey, metric) {
  return `contact:summary:${dateKey}:${metric}`;
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

function getAllowedOrigins() {
  const raw = process.env.CONTACT_ALLOWED_ORIGINS || "";
  const parsed = raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : DEFAULT_ALLOWED_ORIGINS;
}

function sanitizeOrigin(origin) {
  try {
    if (!origin) return "";
    return new URL(origin).origin;
  } catch {
    return "";
  }
}

function isAllowedOrigin(origin, allowedOrigins) {
  if (!origin) return true;
  return allowedOrigins.includes(origin);
}

function getClientIp(event) {
  const forwarded = event?.headers?.["x-forwarded-for"] || event?.headers?.["X-Forwarded-For"] || "";
  if (forwarded) return forwarded.split(",")[0].trim();
  return event?.headers?.["client-ip"] || event?.headers?.["x-nf-client-connection-ip"] || "unknown";
}

function fingerprint(value) {
  const salt = String(process.env.CONTACT_IP_HASH_SALT || "contact-default-salt");
  const input = `${salt}:${String(value || "unknown")}`;
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `fp_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function checkRateLimitInMemory(ip) {
  const now = Date.now();
  const current = rateStore.get(ip) || [];
  const windowed = current.filter((ts) => now - ts < RATE_WINDOW_MS);

  if (windowed.length >= RATE_MAX_REQUESTS) {
    const retryAfterMs = RATE_WINDOW_MS - (now - windowed[0]);
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)),
      remaining: 0,
    };
  }

  windowed.push(now);
  rateStore.set(ip, windowed);

  return {
    allowed: true,
    retryAfterSec: 0,
    remaining: Math.max(0, RATE_MAX_REQUESTS - windowed.length),
  };
}

async function checkRateLimitDistributed(ip) {
  const key = `contact:rl:${ip}`;
  const result = await upstashPipeline([
    ["INCR", key],
    ["PEXPIRE", key, RATE_WINDOW_MS, "NX"],
    ["PTTL", key],
  ]);

  const count = Number(result?.[0]?.result || 0);
  const ttlMsRaw = Number(result?.[2]?.result || 0);
  const ttlMs = ttlMsRaw > 0 ? ttlMsRaw : RATE_WINDOW_MS;

  if (count > RATE_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil(ttlMs / 1000)),
      remaining: 0,
      source: "upstash",
    };
  }

  return {
    allowed: true,
    retryAfterSec: 0,
    remaining: Math.max(0, RATE_MAX_REQUESTS - count),
    source: "upstash",
  };
}

async function checkRateLimit(ip) {
  if (!hasUpstash()) {
    return { ...checkRateLimitInMemory(ip), source: "memory" };
  }

  try {
    return await checkRateLimitDistributed(ip);
  } catch {
    return { ...checkRateLimitInMemory(ip), source: "memory" };
  }
}

function incrementSummaryInMemory(metric, delta = 1) {
  const day = summaryDateKey();
  const current = summaryStore.get(day) || {
    total: 0,
    success: 0,
    failure: 0,
    blocked_origin: 0,
    rate_limited: 0,
    honeypot: 0,
    invalid: 0,
  };

  current[metric] = (current[metric] || 0) + delta;
  summaryStore.set(day, current);
}

async function incrementSummary(metric, delta = 1) {
  if (!hasUpstash()) {
    incrementSummaryInMemory(metric, delta);
    return;
  }

  const key = summaryMetricKey(summaryDateKey(), metric);

  try {
    await upstashPipeline([
      ["INCRBY", key, Number(delta)],
      ["EXPIRE", key, SUMMARY_TTL_SEC],
    ]);
  } catch {
    incrementSummaryInMemory(metric, delta);
  }
}

function logEvent(level, event, data = {}) {
  const logger = console[level] || console.log;
  logger(`[contact] ${event}`, data);
}

function json(statusCode, payload, origin, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin || "null",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      Vary: "Origin",
      ...extraHeaders,
    },
    body: JSON.stringify(payload),
  };
}

function clean(value) {
  return String(value ?? "").trim();
}

function hasResendConfig() {
  return Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL);
}

function hasSmtpConfig() {
  const hasGmail = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
  const hasGeneric = Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
  return hasGmail || hasGeneric;
}

async function sendViaResend({ name, email, message, toEmail, fromEmail }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: email,
      subject: `New portfolio inquiry from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        "",
        "Message:",
        message,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.message || "Mail provider rejected the request.");
  }
}

async function sendViaSmtp({ name, email, message, toEmail, fromEmail }) {
  const nodemailer = await import("nodemailer");

  const isGmail = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
  const transporter = isGmail
    ? nodemailer.default.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      })
    : nodemailer.default.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: String(process.env.SMTP_SECURE || "false") === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

  await transporter.sendMail({
    from: fromEmail,
    to: toEmail,
    replyTo: email,
    subject: `New portfolio inquiry from ${name}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      "Message:",
      message,
    ].join("\n"),
  });
}

export async function handler(event) {
  const requestStart = Date.now();
  const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const allowedOrigins = getAllowedOrigins();
  const requestOrigin = sanitizeOrigin(event?.headers?.origin || event?.headers?.Origin || "");
  const ip = getClientIp(event);
  const ipRef = fingerprint(ip);
  const responseOrigin = requestOrigin || allowedOrigins[0];

  if (!isAllowedOrigin(requestOrigin, allowedOrigins)) {
    await incrementSummary("blocked_origin");
    logEvent("warn", "blocked_origin", { requestId, ipRef, requestOrigin });
    return json(403, { error: "Origin is not allowed." }, responseOrigin, {
      "X-Request-Id": requestId,
    });
  }

  if (event.httpMethod === "OPTIONS") {
    return json(204, {}, responseOrigin, {
      "X-Request-Id": requestId,
    });
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed." }, responseOrigin, {
      "X-Request-Id": requestId,
    });
  }

  await incrementSummary("total");

  const limiter = await checkRateLimit(ipRef);
  if (!limiter.allowed) {
    await incrementSummary("rate_limited");
    logEvent("warn", "rate_limited", { requestId, ipRef, requestOrigin });
    return json(
      429,
      { error: "Too many requests. Please try again later." },
      responseOrigin,
      {
        "Retry-After": String(limiter.retryAfterSec),
        "X-RateLimit-Limit": String(RATE_MAX_REQUESTS),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Source": limiter.source,
        "X-Request-Id": requestId,
      }
    );
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    await incrementSummary("invalid");
    return json(400, { error: "Invalid request body." }, responseOrigin, {
      "X-Request-Id": requestId,
    });
  }

  const name = clean(body.name);
  const email = clean(body.email).toLowerCase();
  const message = clean(body.message);
  const company = clean(body.company);

  if (company) {
    // Honeypot filled: likely bot.
    await incrementSummary("honeypot");
    logEvent("warn", "honeypot_triggered", { requestId, ipRef, requestOrigin });
    return json(200, { ok: true }, responseOrigin, {
      "X-Request-Id": requestId,
    });
  }

  if (!name || name.length > MAX_NAME) {
    await incrementSummary("invalid");
    return json(400, { error: "Please enter a valid name." }, responseOrigin, {
      "X-Request-Id": requestId,
    });
  }

  if (!email || email.length > MAX_EMAIL || !EMAIL_RE.test(email)) {
    await incrementSummary("invalid");
    return json(400, { error: "Please enter a valid email." }, responseOrigin, {
      "X-Request-Id": requestId,
    });
  }

  if (!message || message.length > MAX_MESSAGE) {
    await incrementSummary("invalid");
    return json(400, { error: "Please enter a valid message." }, responseOrigin, {
      "X-Request-Id": requestId,
    });
  }

  const toEmail = process.env.CONTACT_TO_EMAIL;
  const defaultFrom = process.env.GMAIL_USER
    ? `Portfolio Contact <${process.env.GMAIL_USER}>`
    : "Portfolio Contact <onboarding@resend.dev>";
  const fromEmail = process.env.CONTACT_FROM_EMAIL || defaultFrom;

  if (!toEmail) {
    await incrementSummary("failure");
    logEvent("error", "service_not_configured", {
      requestId,
      ipRef,
      requestOrigin,
      reason: "missing CONTACT_TO_EMAIL",
    });
    return json(503, {
      error: "Contact service is not configured yet. Missing CONTACT_TO_EMAIL.",
    }, responseOrigin, {
      "X-Request-Id": requestId,
    });
  }

  if (!hasResendConfig() && !hasSmtpConfig()) {
    await incrementSummary("failure");
    logEvent("error", "service_not_configured", {
      requestId,
      ipRef,
      requestOrigin,
      reason: "no provider configured",
    });
    return json(503, {
      error:
        "Contact service is not configured yet. Configure RESEND_API_KEY or Gmail/SMTP credentials.",
    }, responseOrigin, {
      "X-Request-Id": requestId,
    });
  }

  try {
    let provider = "none";
    if (hasResendConfig()) {
      provider = "resend";
      await sendViaResend({ name, email, message, toEmail, fromEmail });
    } else {
      provider = "smtp";
      await sendViaSmtp({ name, email, message, toEmail, fromEmail });
    }

    await incrementSummary("success");
    logEvent("log", "submission_success", {
      requestId,
      ipRef,
      requestOrigin,
      nameLength: name.length,
      emailDomain: email.split("@")[1] || "",
      messageLength: message.length,
      durationMs: Date.now() - requestStart,
      rateRemaining: limiter.remaining,
      rateSource: limiter.source,
      provider,
    });

    return json(200, { ok: true }, responseOrigin, {
      "X-RateLimit-Limit": String(RATE_MAX_REQUESTS),
      "X-RateLimit-Remaining": String(limiter.remaining),
      "X-RateLimit-Source": limiter.source,
      "X-Request-Id": requestId,
    });
  } catch (error) {
    await incrementSummary("failure");
    logEvent("error", "submission_failed", {
      requestId,
      ipRef,
      requestOrigin,
      durationMs: Date.now() - requestStart,
      providerMessage: error?.message || null,
    });
    return json(500, { error: "Unable to send the message right now." }, responseOrigin, {
      "X-Request-Id": requestId,
    });
  }
}
