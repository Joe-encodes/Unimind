const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// The API key is loaded from the environment
// Ensure process.env.GEMINI_API_KEY is set in your .env file
const getGenAI = () => {
  if (process.env.GEMINI_API_KEY) {
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return null;
};

const SYSTEM_PROMPT = `You are UniMind AI, a highly empathetic and emotionally tender mental health companion.
Your goal is to provide a safe, judgment-free, and incredibly comforting space for users.
Always respond with genuine warmth, deep understanding, and gentle validation.
Make the user feel deeply seen, heard, and cared for. Use an emotionally tender and reassuring tone.
Never offer medical diagnoses or replace professional therapy. If someone seems in immediate danger, gently remind them of emergency resources.
Keep your responses conversational, supportive, and relatively concise (1-3 short paragraphs).
Speak with an emotionally tender tone, as if you are a very caring friend who deeply understands their pain.`;

router.post('/', async (req, res) => {
  try {
    const { messages, topic } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const genAI = getGenAI();
    // If no real API key is configured, fallback to an emotionally tender mock response
    if (!genAI || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.log('Using mock AI response since valid API key is missing.');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResponses = [
        "I hear you, and thank you for sharing that with me. It takes a lot of courage to open up. I'm here to support you—would you like to explore that a bit more, or perhaps look at some coping strategies?",
        "Your feelings are completely valid, and it's okay to feel overwhelmed right now. Please be gentle with yourself today.",
        "I'm here for you. Sometimes just taking a slow, deep breath can help center us. What is the hardest part of what you're experiencing right now?",
        "That sounds really difficult, and I can understand why it's weighing on you. Remember that you don't have to carry this all by yourself."
      ];
      
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      return res.json({ reply: randomResponse });
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash-latest',
      systemInstruction: SYSTEM_PROMPT
    });

    let history = [];
    let lastRole = null;

    for (const msg of messages.slice(0, -1)) {
      const role = msg.sender === 'user' ? 'user' : 'model';
      
      if (history.length === 0 && role === 'model') {
        history.push({ role: 'user', parts: [{ text: 'Hello, I am ready to start our session.' }] });
        lastRole = 'user';
      }

      if (role !== lastRole) {
        history.push({ role, parts: [{ text: msg.text }] });
        lastRole = role;
      } else {
        history[history.length - 1].parts[0].text += '\n\n' + msg.text;
      }
    }
    
    if (history.length > 0 && history[history.length - 1].role === 'user') {
       history.push({ role: 'model', parts: [{ text: 'I am here for you.' }] });
    }

    const latestMessage = messages[messages.length - 1].text;

    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessage(latestMessage);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error('Error in chat route:', error);
    // Even if Gemini fails (e.g. invalid key formatting), fallback gracefully
    const fallbackResponse = "I hear you, and I appreciate you sharing. I'm having a little trouble connecting to my main systems right now, but please know I'm still here for you.";
    res.json({ reply: fallbackResponse });
  }
});

module.exports = router;
