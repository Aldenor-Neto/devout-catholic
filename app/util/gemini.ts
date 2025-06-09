import axios from 'axios';

const GEMINI_API_KEY = 'AIzaSyCYUlNlvhgMCPcEGyZyw3nWWluz2FvNwx8';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Chama a API Gemini diretamente do frontend e retorna a reflexão gerada
 * @param prompt Texto da pergunta
 * @returns Texto gerado ou mensagem de erro
 */
export async function generateReflection(prompt: string): Promise<string> {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || 'Não foi possível gerar a reflexão.';
  } catch (error: any) {
    console.error('❌ Erro ao chamar a API Gemini:', error);
    if (error.response?.data) {
      console.log('📄 Detalhes do erro:', error.response.data);
    }
    return 'Erro ao gerar reflexão.';
  }
}
