const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX_REQUESTS = 5;
const SUMMARY_RETENTION_DAYS = Math.max(1, Number(process.env.CONTACT_SUMMARY_RETENTION_DAYS || 30));
const SUMMARY_TTL_SEC = SUMMARY_RETENTION_DAYS * 24 * 60 * 60;
const LEADS_RECENT_LIMIT = Math.max(1, Number(process.env.CONTACT_RECENT_LEADS_LIMIT || 50));

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "proton.me",
  "protonmail.com",
  "icloud.com",
  "aol.com",
  "mail.com",
]);

const DEFAULT_ALLOWED_ORIGINS = [
  "https://keithfbuilds.dev",
  "https://www.keithfbuilds.dev",
  "http://localhost:5173",
];

const rateStore = globalThis.__contactRateStore || new Map();
globalThis.__contactRateStore = rateStore;

const summaryStore = globalThis.__contactSummaryStore || new Map();
globalThis.__contactSummaryStore = summaryStore;

const leadsStore = globalThis.__contactLeadsStore || [];
globalThis.__contactLeadsStore = leadsStore;

function hasUpstash() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function summaryDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function summaryMetricKey(dateKey, metric) {
  return `contact:summary:${dateKey}:${metric}`;
}

function leadsRecentKey() {
  return "contact:leads:recent";
}

function getEmailDomain(email) {
  const parts = String(email || "").toLowerCase().split("@");
  return parts[1] || "";
}

function assessLeadRisk({ email, message, requestOrigin }) {
  const reasons = [];
  let score = 0;

  const domain = getEmailDomain(email);
  if (!domain) {
    score += 40;
    reasons.push("missing_email_domain");
  } else if (FREE_EMAIL_DOMAINS.has(domain)) {
    score += 35;
    reasons.push("free_email_provider");
  } else {
    reasons.push("company_domain_email");
  }

  const msg = String(message || "").toLowerCase();
  const suspiciousTerms = ["urgent", "bitcoin", "gift card", "wire", "password", "otp", "telegram"];
  const matchedSuspicious = suspiciousTerms.filter((term) => msg.includes(term));
  if (matchedSuspicious.length > 0) {
    score += Math.min(30, matchedSuspicious.length * 10);
    reasons.push(`suspicious_terms:${matchedSuspicious.join("|")}`);
  }

  if (msg.length < 25) {
    score += 12;
    reasons.push("very_short_message");
  }

  if (requestOrigin && !requestOrigin.includes("keithfbuilds.dev") && !requestOrigin.includes("localhost")) {
    score += 10;
    reasons.push("unexpected_origin");
  }

  const level = score >= 45 ? "high" : score >= 25 ? "medium" : "low";
  const checklist = [
    "Verify sender domain and LinkedIn profile",
    "Cross-check role via official company channels",
    "Request video call with company email invite",
    "Do not share sensitive IDs or payment details",
  ];

  return { score, level, reasons, domain, checklist };
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

function storeLeadRecordInMemory(record) {
  leadsStore.unshift(record);
  if (leadsStore.length > LEADS_RECENT_LIMIT) leadsStore.length = LEADS_RECENT_LIMIT;
}

async function storeLeadRecord(record) {
  if (!hasUpstash()) {
    storeLeadRecordInMemory(record);
    return;
  }

  try {
    await upstashPipeline([
      ["LPUSH", leadsRecentKey(), JSON.stringify(record)],
      ["LTRIM", leadsRecentKey(), 0, LEADS_RECENT_LIMIT - 1],
      ["EXPIRE", leadsRecentKey(), SUMMARY_TTL_SEC],
    ]);
  } catch {
    storeLeadRecordInMemory(record);
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildEmailContent({ name, email, message, requestId, submittedAt, leadRisk }) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");
  const safeRequestId = escapeHtml(requestId);
  const safeSubmittedAt = escapeHtml(submittedAt);
  const safeRiskLevel = escapeHtml((leadRisk?.level || "unknown").toUpperCase());
  const safeRiskScore = escapeHtml(String(leadRisk?.score ?? "n/a"));
  const safeRiskReasons = (leadRisk?.reasons || [])
    .map((reason) => `• ${escapeHtml(reason)}`)
    .join("<br />");
  const safeChecklist = (leadRisk?.checklist || [])
    .map((item) => `• ${escapeHtml(item)}`)
    .join("<br />");

  const subject = `New portfolio inquiry from ${name}`;
  const text = [
    "KeithfBuilds Portfolio Inquiry",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Submitted: ${submittedAt}`,
    `Reference ID: ${requestId}`,
    `Lead Risk: ${leadRisk?.level || "unknown"} (${leadRisk?.score ?? "n/a"})`,
    "",
    "Message:",
    message,
  ].join("\n");

  const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Portfolio Inquiry</title>
  </head>
  <body style="margin:0;padding:0;background:#040a08;background-image:radial-gradient(circle at 15% 10%, rgba(22,193,114,0.16), transparent 35%),radial-gradient(circle at 90% 80%, rgba(14,173,212,0.15), transparent 40%);font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#e8f5f0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 14px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:linear-gradient(180deg, rgba(12,20,16,0.95), rgba(9,16,13,0.95));border:1px solid rgba(22,193,114,0.35);border-radius:16px;overflow:hidden;box-shadow:0 20px 45px rgba(0,0,0,0.36),0 0 0 1px rgba(22,193,114,0.2) inset;">
            <tr>
              <td style="padding:24px 24px 12px 24px;">
                <div style="display:inline-block;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;padding:6px 10px;border:1px solid rgba(22,193,114,0.45);border-radius:999px;color:#16c172;background:rgba(22,193,114,0.1);">
                  KeithfBuilds Contact Signal
                </div>
                <h1 style="margin:14px 0 6px 0;font-size:29px;line-height:1.15;color:#f2fffb;font-weight:700;">New Portfolio Inquiry</h1>
                <p style="margin:0;color:#8cb2a2;font-size:14px;line-height:1.6;">A new message just landed from the portfolio contact form.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 24px 0 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0 10px;">
                  <tr>
                    <td style="width:120px;color:#5f8a78;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">From</td>
                    <td style="color:#e8f5f0;font-size:15px;font-weight:600;">${safeName}</td>
                  </tr>
                  <tr>
                    <td style="width:120px;color:#5f8a78;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">Email</td>
                    <td style="font-size:15px;"><a href="mailto:${safeEmail}" style="color:#8fd0ff;text-decoration:none;">${safeEmail}</a></td>
                  </tr>
                  <tr>
                    <td style="width:120px;color:#5f8a78;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">Submitted</td>
                    <td style="color:#d5e8df;font-size:14px;">${safeSubmittedAt}</td>
                  </tr>
                  <tr>
                    <td style="width:120px;color:#5f8a78;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">Reference</td>
                    <td style="color:#16c172;font-size:13px;font-family:Consolas,Monaco,monospace;">${safeRequestId}</td>
                  </tr>
                  <tr>
                    <td style="width:120px;color:#5f8a78;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">Lead Risk</td>
                    <td style="font-size:14px;color:#ffd38a;">${safeRiskLevel} <span style="color:#e8f5f0;opacity:0.75;">(score ${safeRiskScore})</span></td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 24px 22px 24px;">
                <div style="border:1px solid rgba(22,193,114,0.25);background:rgba(3,8,6,0.7);border-radius:12px;padding:16px;">
                  <div style="font-size:12px;color:#5f8a78;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:10px;">Message Payload</div>
                  <div style="font-size:15px;line-height:1.8;color:#e8f5f0;word-break:break-word;">${safeMessage}</div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px 24px 24px;">
                <div style="border:1px solid rgba(245,158,11,0.4);background:rgba(245,158,11,0.08);border-radius:10px;padding:12px 14px;margin-bottom:12px;">
                  <div style="font-size:12px;color:#f6c56f;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">Verification Signals</div>
                  <div style="font-size:13px;line-height:1.7;color:#e8f5f0;">${safeRiskReasons || "• no_special_signals"}</div>
                </div>
                <div style="border:1px solid rgba(117,217,243,0.35);background:rgba(117,217,243,0.08);border-radius:10px;padding:12px 14px;margin-bottom:12px;">
                  <div style="font-size:12px;color:#75d9f3;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">Follow-up Checklist</div>
                  <div style="font-size:13px;line-height:1.7;color:#e8f5f0;">${safeChecklist}</div>
                </div>
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding:8px 12px;border:1px solid rgba(22,193,114,0.34);border-radius:8px;background:rgba(22,193,114,0.08);font-size:12px;color:#16c172;">Status: Unread</td>
                    <td style="width:10px;"></td>
                    <td style="padding:8px 12px;border:1px solid rgba(14,173,212,0.34);border-radius:8px;background:rgba(14,173,212,0.09);font-size:12px;color:#75d9f3;">Source: Portfolio Form</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
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

async function sendViaResend({ name, email, message, toEmail, fromEmail, leadRisk }) {
  const submittedAt = new Date().toISOString();
  const requestId = globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-email`;
  const content = buildEmailContent({ name, email, message, requestId, submittedAt, leadRisk });

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
      subject: content.subject,
      text: content.text,
      html: content.html,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.message || "Mail provider rejected the request.");
  }
}

async function sendViaSmtp({ name, email, message, toEmail, fromEmail, leadRisk }) {
  const nodemailer = await import("nodemailer");
  const submittedAt = new Date().toISOString();
  const requestId = globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-email`;
  const content = buildEmailContent({ name, email, message, requestId, submittedAt, leadRisk });

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
    subject: content.subject,
    text: content.text,
    html: content.html,
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

  const leadRisk = assessLeadRisk({
    email,
    message,
    requestOrigin,
  });

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
      await sendViaResend({ name, email, message, toEmail, fromEmail, leadRisk });
    } else {
      provider = "smtp";
      await sendViaSmtp({ name, email, message, toEmail, fromEmail, leadRisk });
    }

    await incrementSummary("success");
    await incrementSummary(`risk_${leadRisk.level}`);
    await storeLeadRecord({
      ts: Date.now(),
      requestId,
      name,
      email,
      emailDomain: leadRisk.domain,
      origin: requestOrigin,
      riskLevel: leadRisk.level,
      riskScore: leadRisk.score,
      riskReasons: leadRisk.reasons,
      messagePreview: message.slice(0, 200),
      provider,
    });

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
      riskLevel: leadRisk.level,
      riskScore: leadRisk.score,
    });

    return json(200, { ok: true }, responseOrigin, {
      "X-RateLimit-Limit": String(RATE_MAX_REQUESTS),
      "X-RateLimit-Remaining": String(limiter.remaining),
      "X-RateLimit-Source": limiter.source,
      "X-Request-Id": requestId,
      "X-Lead-Risk": leadRisk.level,
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
