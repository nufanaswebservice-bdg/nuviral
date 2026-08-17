import { NextRequest, NextResponse } from 'next/server';
import { buildChatSystemPrompt, CHAT_OPENAI_PARAMS } from '@/lib/chat-prompt';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function extractEmail(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const token = auth.split(' ')[1];
    if (!token || token === 'null' || token === 'undefined') return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    return payload.email || null;
  } catch {
    return null;
  }
}

async function openaiChat(messages: any[], maxTokens = CHAT_OPENAI_PARAMS.max_tokens, model?: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || OPENAI_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: CHAT_OPENAI_PARAMS.temperature,
      top_p: CHAT_OPENAI_PARAMS.top_p,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => '');
    throw new Error(`OpenAI error (${response.status}): ${err.substring(0, 200)}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content as string | undefined;
}

export async function POST(req: NextRequest) {
  const email = extractEmail(req);
  if (!email) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 });
  }

  try {
    const { message, history = [], imageBase64 } = await req.json();
    if (!message?.trim() && !imageBase64) {
      return NextResponse.json({ error: 'message or image required' }, { status: 400 });
    }

    const systemPrompt = buildChatSystemPrompt();

    // Build messages array
    const chatHistory = history.slice(-12).map((h: { role: string; content: string }) => ({
      role: h.role,
      content: h.content,
    }));

    let userContent: any;
    let modelToUse = OPENAI_MODEL;

    if (imageBase64) {
      // Use GPT-4o for vision (image analysis) - it supports images
      modelToUse = 'gpt-4o';
      userContent = [
        { type: 'text', text: message || 'Analisis gambar ini secara detail.' },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: 'high' } },
      ];
    } else {
      userContent = message;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory,
      { role: 'user', content: userContent },
    ];

    const reply = await openaiChat(messages, CHAT_OPENAI_PARAMS.max_tokens, modelToUse);

    if (!reply) {
      return NextResponse.json({ error: 'AI tidak memberikan respons' }, { status: 500 });
    }

    // Generate suggestions (skip for image analysis to keep response fast)
    let suggestions: string[] = [];
    if (!imageBase64) {
      try {
        const sugText = await openaiChat([{
          role: 'user',
          content: `Berdasarkan percakapan ini:
User: "${message}"
AI: "${reply.substring(0, 400)}"

Buat 3 pertanyaan lanjutan yang relevan dan spesifik (bukan generic).
Bahasa sama dengan user. Max 12 kata per pertanyaan.
Return ONLY JSON array: ["q1","q2","q3"]`,
        }], 250);

        if (sugText) {
          const match = sugText.match(/\[[\s\S]*?\]/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            if (Array.isArray(parsed)) suggestions = parsed.slice(0, 3);
          }
        }
      } catch {}
    }

    return NextResponse.json({ reply, suggestions });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Chat failed' },
      { status: 500 },
    );
  }
}
