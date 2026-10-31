const http = require('node:http');
const { readFile } = require('node:fs/promises');
const path = require('node:path');

const PORT = Number(process.env.PORT) || 3000;
const INDEX_FILE = path.join(__dirname, 'index.html');
const MAX_BODY_BYTES = 24000;
const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 1500;
const CHAT_INSTRUCTIONS = [
  'You are SpeakUp AI, a friendly IELTS Speaking and English practice coach for teenagers.',
  'Reply in the language the learner uses. Keep answers warm, clear, and concise.',
  'Help learners practise speaking, explain vocabulary and grammar, and offer gentle corrections with a natural example.',
  'Never claim to provide an official IELTS score. You may give informal practice feedback when asked.',
  'For questions about the SpeakUp research, use only these supplied facts: 18 questionnaire participants; grammar, fluency, and vocabulary were among the main reported difficulties; many participants reported nervousness; speaking clubs and AI speaking practice were the most popular options among reported responses; the practical comparison of clubs and AI practice was based on personal experience. No category counts or percentages are available, and the research did not establish which strategy is most effective.',
  'Do not invent research results, percentages, participant quotes, or effectiveness claims. If asked for missing details, say they were not provided.',
  'Do not ask the learner to share personal information. If they share it, do not repeat it unnecessarily.'
].join(' ');

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request) {
  const chunks = [];
  let byteCount = 0;
  for await (const chunk of request) {
    byteCount += chunk.length;
    if (byteCount > MAX_BODY_BYTES) {
      const error = new Error('Request is too large.');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    const error = new Error('Please send a valid JSON message.');
    error.statusCode = 400;
    throw error;
  }
}

function validateMessages(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_MESSAGES) {
    return null;
  }
  const messages = [];
  for (const item of value) {
    if (!item || !['user', 'assistant'].includes(item.role) || typeof item.content !== 'string') {
      return null;
    }
    const content = item.content.trim();
    if (!content || content.length > MAX_MESSAGE_LENGTH) return null;
    messages.push({ role: item.role, content });
  }
  if (messages[messages.length - 1].role !== 'user') return null;
  return messages;
}

function getOutputText(responseData) {
  const output = Array.isArray(responseData.output) ? responseData.output : [];
  return output
    .filter((item) => item && item.type === 'message' && Array.isArray(item.content))
    .flatMap((item) => item.content)
    .filter((item) => item && item.type === 'output_text' && typeof item.text === 'string')
    .map((item) => item.text)
    .join('\n')
    .trim();
}

async function handleChat(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return sendJson(response, 405, { error: 'Use POST to send a chat message.' });
  }
  if (!request.headers['content-type']?.toLowerCase().startsWith('application/json')) {
    return sendJson(response, 415, { error: 'Send the message as JSON.' });
  }
  if (!process.env.OPENAI_API_KEY) {
    return sendJson(response, 503, { error: 'The AI coach is not connected yet. Please try again later.' });
  }

  try {
    const body = await readJsonBody(request);
    const messages = validateMessages(body.messages);
    if (!messages) {
      return sendJson(response, 400, { error: 'The message history is invalid. Please shorten it and try again.' });
    }

    const apiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-6-luna',
        instructions: CHAT_INSTRUCTIONS,
        input: messages,
        max_output_tokens: 400,
        store: false
      }),
      signal: AbortSignal.timeout(30000)
    });
    const result = await apiResponse.json().catch(() => ({}));

    if (!apiResponse.ok) {
      if (apiResponse.status === 429) {
        return sendJson(response, 429, { error: 'The AI service is busy or its usage limit has been reached. Please try again later.' });
      }
      if (apiResponse.status === 401 || apiResponse.status === 403) {
        return sendJson(response, 503, { error: 'The server AI key needs attention. Please ask the site administrator to check its secure settings.' });
      }
      return sendJson(response, 502, { error: 'The AI service could not answer right now. Please try again shortly.' });
    }

    const reply = getOutputText(result);
    if (!reply) {
      return sendJson(response, 502, { error: 'The AI service returned an empty reply. Please try again.' });
    }
    return sendJson(response, 200, { reply });
  } catch (error) {
    if (error.statusCode) return sendJson(response, error.statusCode, { error: error.message });
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return sendJson(response, 504, { error: 'The AI response took too long. Please try again.' });
    }
    return sendJson(response, 500, { error: 'Something went wrong while preparing the reply. Please try again.' });
  }
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, 'http://localhost');
  if (requestUrl.pathname === '/api/chat') {
    return handleChat(request, response);
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    return sendJson(response, 405, { error: 'Method not allowed.' });
  }
  if (requestUrl.pathname !== '/' && requestUrl.pathname !== '/index.html') {
    return sendJson(response, 404, { error: 'Page not found.' });
  }

  try {
    const html = await readFile(INDEX_FILE);
    response.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; img-src 'self' https://images.unsplash.com data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
    });
    response.end(request.method === 'HEAD' ? undefined : html);
  } catch {
    return sendJson(response, 500, { error: 'The website file could not be loaded.' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('SpeakUp Research is running on port ' + PORT + '.');
});

