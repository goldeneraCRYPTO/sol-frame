// server.js
const express = require('express');
const path = require('path');
const open = require('open');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SOLANA_RPC = process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com';

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '1mb' }));

// Simple JSON-RPC proxy to bypass browser CORS/403
app.post('/rpc', async (req, res) => {
  try {
    const r = await fetch(SOLANA_RPC, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const txt = await r.text();
    res.status(r.status).type(r.headers.get('content-type') || 'application/json').send(txt);
  } catch (e) {
    res.status(500).json({ error: e?.message || 'rpc proxy error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  const url = `http://localhost:${PORT}`;
  console.log(`One-click pool running at ${url}`);
  console.log(`Proxying JSON-RPC to: ${SOLANA_RPC}`);
  try { await open(url); } catch {}
});
