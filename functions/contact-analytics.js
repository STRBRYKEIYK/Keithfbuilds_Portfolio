const DEFAULT_ALLOWED_ORIGINS = [
  "https://keithfbuilds.dev",
  "https://www.keithfbuilds.dev",
  "http://localhost:5173",
];

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

function json(statusCode, payload, origin) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin || "null",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      Vary: "Origin",
    },
    body: JSON.stringify(payload),
  };
}

export async function handler(event) {
  const allowedOrigins = getAllowedOrigins();
  const requestOrigin = sanitizeOrigin(event?.headers?.origin || event?.headers?.Origin || "");

  if (requestOrigin && !allowedOrigins.includes(requestOrigin)) {
    return json(403, { error: "Origin is not allowed." }, requestOrigin || allowedOrigins[0]);
  }

  if (event.httpMethod === "OPTIONS") {
    return json(204, {}, requestOrigin || allowedOrigins[0]);
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed." }, requestOrigin || allowedOrigins[0]);
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid request body." }, requestOrigin || allowedOrigins[0]);
  }

  const eventName = String(body?.event || "").trim();
  if (!eventName) {
    return json(400, { error: "Missing event name." }, requestOrigin || allowedOrigins[0]);
  }

  // Lightweight analytics via server logs.
  console.log("[analytics] event", {
    event: eventName,
    source: String(body?.source || "contact_form").slice(0, 80),
    ts: Number(body?.ts || Date.now()),
    ipRef: fingerprint(getClientIp(event)),
    origin: requestOrigin,
  });

  return json(200, { ok: true }, requestOrigin || allowedOrigins[0]);
}
