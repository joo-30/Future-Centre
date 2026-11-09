import fs from 'node:fs/promises';
const [action, reference, ...rest] = process.argv.slice(2);
const base = `http://127.0.0.1:${process.env.PORT || 5001}/api/admin`;
const headers = {
  'X-Admin-Key': process.env.ADMIN_API_KEY || '',
  'Content-Type': 'application/json',
};
let url = base + '/appointments',
  options = { headers };
if (action === 'schedule') url = base + '/schedule';
else if (action === 'schedule:set') {
  if (!reference) throw new Error('Provide a schedule JSON file.');
  url = base + '/schedule';
  options = {
    headers,
    method: 'PUT',
    body: JSON.stringify(JSON.parse(await fs.readFile(reference, 'utf8'))),
  };
} else if (action === 'interests') url = base + '/interests';
else if (['approve', 'reject', 'cancel', 'complete', 'no_show', 'reschedule'].includes(action)) {
  if (!reference) throw new Error('Provide appointment reference.');
  url += `/${encodeURIComponent(reference)}/decision`;
  options = {
    headers,
    method: 'POST',
    body: JSON.stringify({
      action,
      reason: action === 'reject' ? rest.join(' ') : undefined,
      date: action === 'reschedule' ? rest[0] : undefined,
      time: action === 'reschedule' ? rest[1] : undefined,
    }),
  };
} else if (action !== 'list')
  throw new Error(
    'Usage: npm run manage -- list | schedule | schedule:set FILE | interests | approve REF | reject REF REASON | reschedule REF DATE TIME',
  );
const response = await fetch(url, options);
const result = await response.json();
if (!response.ok) {
  console.error(result.error?.message || 'Request failed');
  process.exitCode = 1;
} else console.log(JSON.stringify(result, null, 2));
