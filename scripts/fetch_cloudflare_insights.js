const https = require('https');
const fs = require('fs');
const crypto = require('crypto');
const url = 'https://static.cloudflareinsights.com/beacon.min.js/v8c78df7c7c0f484497ecbca7046644da1771523124516';

https.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error('HTTP status', res.statusCode);
    process.exit(1);
  }
  const chunks = [];
  res.on('data', (c) => chunks.push(c));
  res.on('end', () => {
    const buf = Buffer.concat(chunks);
    fs.mkdirSync('public', { recursive: true });
    fs.writeFileSync('public/cloudflare-insights.js', buf);
    const hash = crypto.createHash('sha512').update(buf).digest('base64');
    console.log('sha512-' + hash);
  });
}).on('error', (e) => {
  console.error(e.message);
  process.exit(1);
});
