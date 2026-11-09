import { performance } from 'node:perf_hooks';

const BASE_URL = 'http://127.0.0.1:5001';

async function measureEndpoint(name, url, options = {}, iterations = 25) {
  const times = [];
  let payloadBytes = 0;
  let lastStatus = 0;

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    try {
      const res = await fetch(url, options);
      const text = await textFromRes(res);
      const duration = performance.now() - start;
      times.push(duration);
      payloadBytes = text.length;
      lastStatus = res.status;
    } catch (err) {
      // network failure
    }
  }

  if (times.length === 0) {
    return { name, error: 'No response' };
  }

  times.sort((a, b) => a - b);
  const min = Math.min(...times);
  const max = Math.max(...times);
  const sum = times.reduce((a, b) => a + b, 0);
  const avg = sum / times.length;
  const p50 = times[Math.floor(times.length * 0.5)];
  const p95 = times[Math.floor(times.length * 0.95)];

  return {
    name,
    status: lastStatus,
    iterations: times.length,
    minMs: min.toFixed(2),
    maxMs: max.toFixed(2),
    avgMs: avg.toFixed(2),
    p50Ms: p50.toFixed(2),
    p95Ms: p95.toFixed(2),
    payloadBytes,
  };
}

async function textFromRes(res) {
  try {
    return await res.text();
  } catch {
    return '';
  }
}

async function main() {
  console.log('=== Measuring Real API Performance ===\n');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const dateStr = tomorrow.toISOString().split('T')[0];

  const results = [];

  // 1. Health check baseline
  results.push(await measureEndpoint('GET /api/health', `${BASE_URL}/api/health`));

  // 2. Catalog endpoint
  results.push(await measureEndpoint('GET /api/catalog', `${BASE_URL}/api/catalog`));

  // 3. Slot Availability calculation & capacity engine
  results.push(
    await measureEndpoint(
      'GET /api/availability',
      `${BASE_URL}/api/availability?serviceId=nutrition&date=${dateStr}`
    )
  );

  // 4. Appointments lookup with phone and ref
  results.push(
    await measureEndpoint('POST /api/appointments/lookup', `${BASE_URL}/api/appointments/lookup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'http://127.0.0.1:5176',
      },
      body: JSON.stringify({ phone: '01012345678', reference: 'FC-99999' }),
    })
  );

  console.table(results);
}

main().catch(console.error);
