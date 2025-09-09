// netlify/functions/rpc.js
// Прокси Solana JSON-RPC через Helius, URL берём из ENV SOLANA_RPC
exports.handler = async (event) => {
  const cors = {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': 'POST,OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: cors, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors, body: '{"error":"Only POST allowed"}' };
  }

  const SOLANA_RPC = process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com';

  try {
    const response = await fetch(SOLANA_RPC, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: event.body,
    });

    const text = await response.text();

    return {
      statusCode: response.status,
      headers: {
        ...cors,
        'content-type': response.headers.get('content-type') || 'application/json',
      },
      body: text,
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({ error: e?.message || 'rpc proxy error' }),
    };
  }
};
