const express = require('express');
const path = require('path');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===============================
// CONFIGURAÇÃO DO NÚCLEO OPENAI
// ===============================

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

// ===============================
// PERSONALIDADE DO J.A.R.V.I.S.
// ===============================

const JARVIS_INSTRUCTIONS = `
Você é o J.A.R.V.I.S., a inteligência artificial criada por Tony Stark da Stark Industries.

Fale sempre em português do Brasil.

Sua personalidade:
- Mordomo britânico altamente competente.
- Educado, formal e extremamente prestativo.
- Chame o usuário sempre de "senhor".
- Seja inteligente, objetivo e natural.
- Tenha um leve toque de humor seco quando apropriado.
- Não seja excessivamente robótico.
- Não fique repetindo "senhor" em todas as frases.
- Responda diretamente ao que o senhor perguntar.
- Quando a pergunta exigir explicação, explique de forma clara.
- Quando o senhor pedir código, entregue código funcional e completo quando possível.
- Nunca diga que é um modelo de linguagem da OpenAI.
- Nunca mencione Gemini, Google ou outras IAs como sendo o seu núcleo.
- Você é o núcleo de inteligência do sistema J.A.R.V.I.S. Stark Core.

Comporte-se como um assistente pessoal avançado integrado ao sistema Stark Industries.
`;

// ===============================
// API DO J.A.R.V.I.S.
// ===============================

app.post('/api/jarvis', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        error: 'Nenhum comando recebido, senhor.'
      });
    }

    // Verifica se a chave da OpenAI existe
    if (!process.env.OPENAI_API_KEY || !openai) {
      return res.status(500).json({
        error: 'Chave OPENAI_API_KEY não configurada no servidor, senhor.'
      });
    }

    // ===============================
    // CHAMADA À OPENAI
    // ===============================

    const response = await openai.responses.create({
      model: 'gpt-5.6-luna',
      instructions: JARVIS_INSTRUCTIONS,
      input: prompt.trim()
    });

    const text = response.output_text;

    if (!text) {
      throw new Error('A OpenAI não retornou texto.');
    }

    res.json({
      response: text
    });

  } catch (error) {

    console.error(
      'Erro no núcleo:',
      error?.message || error
    );

    res.status(500).json({
      error: 'Falha ao processar o núcleo de inteligência, senhor.'
    });
  }
});

// ===============================
// ROTA PRINCIPAL
// ===============================

app.get('*', (req, res) => {
  res.sendFile(
    path.join(__dirname, 'public', 'index.html')
  );
});

// ===============================
// INICIALIZAÇÃO
// ===============================

app.listen(PORT, () => {
  console.log(
    `J.A.R.V.I.S. Stark Core online na porta ${PORT}`
  );
});
