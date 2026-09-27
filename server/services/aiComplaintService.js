const ALLOWED = {
  categories: ['Payment','Technical','Delivery','Product','Account','Service','Other'],
  priorities: ['LOW','MEDIUM','HIGH','CRITICAL'],
  departments: ['Finance','Technical Support','Delivery','Product Support','Customer Service']
};

const SLA_HOURS = { LOW: 72, MEDIUM: 48, HIGH: 24, CRITICAL: 8 };

function cleanJson(text) {
  const raw = String(text || '').trim();
  try { return JSON.parse(raw); } catch (_) {}
  const fenced = raw.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  try { return JSON.parse(fenced); } catch (_) {}
  const start = fenced.indexOf('{');
  const end = fenced.lastIndexOf('}');
  if (start >= 0 && end > start) return JSON.parse(fenced.slice(start, end + 1));
  throw new Error('AI returned invalid JSON');
}

function validate(result) {
  if (!ALLOWED.categories.includes(result.category)) throw new Error('AI returned an invalid category');
  if (!ALLOWED.priorities.includes(result.priority)) throw new Error('AI returned an invalid priority');
  if (!ALLOWED.departments.includes(result.department)) throw new Error('AI returned an invalid department');
  const slaHours = SLA_HOURS[result.priority];
  return {
    category: result.category,
    priority: result.priority,
    department: result.department,
    slaHours,
    reason: String(result.reason || 'AI classification based on the complaint text.').slice(0, 500)
  };
}

async function analyzeComplaint(description) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    const error = new Error('AI service is not configured. Use manual classification.');
    error.code = 'AI_NOT_CONFIGURED';
    throw error;
  }

  const baseUrl = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = process.env.AI_MODEL || 'gpt-4o-mini';
  const timeout = Number(process.env.AI_TIMEOUT_MS || 15000);

  const prompt = `You are an AI assistant for a Customer Complaint Management System.
Analyze this complaint and return ONLY valid JSON.

Complaint:
${description}

Allowed category values:
${ALLOWED.categories.join(', ')}

Allowed priority values:
${ALLOWED.priorities.join(', ')}

Allowed department values:
${ALLOWED.departments.join(', ')}

Choose exactly one category, one priority and one department.
Use the priority to determine severity. The application will calculate the final SLA itself.
Return this exact JSON shape:
{
  "category": "Payment",
  "priority": "HIGH",
  "department": "Finance",
  "reason": "Short explanation"
}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        messages: [
          { role: 'system', content: 'Return only JSON. Do not use markdown.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = body?.error?.message || `AI provider returned HTTP ${response.status}`;
      const error = new Error(message);
      error.code = 'AI_PROVIDER_ERROR';
      throw error;
    }

    const content = body?.choices?.[0]?.message?.content;
    return validate(cleanJson(content));
  } catch (error) {
    if (error.name === 'AbortError') {
      const timeoutError = new Error('AI request timed out. Use manual classification.');
      timeoutError.code = 'AI_TIMEOUT';
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { analyzeComplaint, ALLOWED };
