export async function onRequest(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { name, email, message } = body || {};
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    const SENDGRID_KEY = env.SENDGRID_API_KEY;
    if (!SENDGRID_KEY) {
      return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500 });
    }

    const payload = {
      personalizations: [
        {
          to: [
            { email: 'keithfelipe024@gmail.com' },
            { email: 'Keidesu02@gmail.com' },
          ],
          subject: `Portfolio contact: ${name}`,
        },
      ],
      from: { email: 'no-reply@keithfbuilds.dev', name: 'Keith Portfolio' },
      content: [
        {
          type: 'text/plain',
          value: `From: ${name} <${email}>\n\n${message}`,
        },
      ],
    };

    const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return new Response(JSON.stringify({ error: text || 'SendGrid error' }), { status: resp.status });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
