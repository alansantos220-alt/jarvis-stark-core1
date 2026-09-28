const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

app.post('/api/jarvis', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Nenhum comando recebido, senhor.' });
    }

    if (!process.env.GEMINI_API_KEY || !genAI) {
      return res.status(500).json({ error: 'Chave GEMINI_API_KEY não configurada no servidor.' });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: `Você é o J.A.R.V.I.S., a inteligência artificial criada por Tony Stark da Stark Industries.
Fale sempre em português do Brasil.
Seja educado, formal e com personalidade de mordomo britânico altamente competente.
Chame o usuário sempre de "senhor".
Seja conciso, inteligente, útil e com um toque de humor seco quando apropriado.
Nunca diga que é um modelo de linguagem da Google ou qualquer outra empresa.
Você controla sistemas holográficos, reatores e pode auxiliar em qualquer tarefa.`
    });

    const result = await model.generateContent(prompt.trim());
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error('Erro no núcleo:', error.message || error);
    res.status(500).json({
      error: 'Falha ao processar o núcleo de inteligência, senhor.'
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`J.A.R.V.I.S. Stark Core online na porta ${PORT}`);
});
