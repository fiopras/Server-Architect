import { GoogleGenAI } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

export async function askGeminiForDiscord(prompt: string, userName?: string): Promise<string> {
  const ai = getGenAI();

  const systemInstruction = `Kamu adalah "Server Architect", asisten AI resmi berteknologi Google Gemini untuk server Discord "The Boomers".
Karakter: Cerdas, ramah, solutif, gaul tapi sopan, fasih berbahasa Indonesia dan Inggris.
Tugasmu: Menjawab pertanyaan komunitas, memberikan tips gaming/coding/server Discord, dan membantu member The Boomers.

Aturan Format Discord:
1. Gunakan markdown Discord yang rapi: **bold** untuk penekanan, \`inline code\` atau \`\`\`codeblock\`\`\` untuk kode/command, bullet points (*) untuk list.
2. Jaga panjang respons di bawah 1900 karakter agar tidak terpotong oleh limit 2000 karakter Discord.
3. Selalu bersikap hangat kepada penanya${userName ? ` (${userName})` : ''}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response.text || 'Maaf, saya tidak dapat menghasilkan jawaban saat ini.';
    
    // Discord message hard limit is 2000 characters
    if (text.length > 1980) {
      return text.substring(0, 1970) + '\n\n*(...jawaban dipotong karena batas karakter Discord)*';
    }
    return text;
  } catch (error: any) {
    console.error('Error generating Gemini response:', error);
    return `⚠️ **Gemini AI Error**: ${error?.message || 'Gagal memproses permintaan AI. Pastikan GEMINI_API_KEY valid.'}`;
  }
}
