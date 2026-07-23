import React, { useState, useEffect, useRef } from 'react';
import vocabularyData from '../data/vocabulary.json';
import { MessageSquare, Settings, Send, ArrowLeft, Volume2, Key, Info } from 'lucide-react';

// Extract unique Spanish words to highlight them and feed to LLM
const getUniqueWords = () => {
  const words = new Set();
  vocabularyData.forEach(item => {
    // Split combined items like "el muchacho / la muchacha"
    const parts = item.spanish.toLowerCase().split(/\s*[\/\s]\s*/);
    parts.forEach(part => {
      // Remove articles and punctuation
      const clean = part.replace(/^(el|la|los|las|un|una|unos|unas|del|al)\b/g, "")
                        .replace(/[¿?¡!,.]/g, "")
                        .trim();
      if (clean && clean.length > 1) {
        words.add(clean);
      }
    });
  });
  return Array.from(words);
};

const UNIQUE_SPANISH_WORDS = getUniqueWords();

// Conversational State Machine for Demo Chat Mode (No API key)
const MOCK_CONVERSATION_STEPS = [
  {
    trigger: "start",
    reply: "¡Hola! ¿Cómo estás? Me llamo Mateo. ¿Cómo te llamas tú?"
  },
  {
    trigger: "name",
    reply: "Mucho gusto. Yo soy de México, un país muy bonito, y vivo en un apartamento pequeño en la ciudad. ¿De dónde eres tú?"
  },
  {
    trigger: "origin",
    reply: "¡Qué bien! Yo soy estudiante en la universidad. Estudio informática, biología y español. Es difícil pero interesante. ¿Qué estudias tú?"
  },
  {
    trigger: "study",
    reply: "Excelente. Por la mañana tengo clases y por la tarde me gusta practicar deportes. Juego al fútbol en el estadio y nado en la piscina. ¿Qué pasatiempo te gusta a ti?"
  },
  {
    trigger: "hobby",
    reply: "¡Qué divertido! Hoy el clima está soleado y hace calor. ¿Qué tiempo hace hoy en tu ciudad?"
  },
  {
    trigger: "weather",
    reply: "Interesante. Tengo un perro muy cómico que se llama Narfy. Es mi mascota favorita. ¿Tienes mascotas en tu casa?"
  },
  {
    trigger: "pet",
    reply: "¡Me encanta! Bueno, tengo hambre ahora y voy a almorzar tacos con queso, cebolla y salsa picante, y a beber agua fría. ¿Qué comida prefieres para el almuerzo?"
  },
  {
    trigger: "food",
    reply: "¡Qué sabroso! Lo siento, tengo un examen ahora y tengo que estudiar en la biblioteca. Buena suerte con tu español. ¡Hasta luego y adiós!"
  }
];

export default function AiChat({ state, setApiKey, setView }) {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "bot",
      text: "¡Hola! Me llamo Elena. Soy tu compañera de chat. ¡Hablemos en español!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState(state.apiKeys.gemini || "");
  const [mockStepIdx, setMockStepIdx] = useState(0);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSaveKey = () => {
    setApiKey(tempKey);
    setShowKeyModal(false);
  };

  // Helper to format the message and highlight Spanish vocabulary words
  const renderHighlightedMessage = (text, role) => {
    if (role !== "user") {
      return <span>{text}</span>;
    }

    // Split text into tokens including spaces/punctuation
    const tokens = text.split(/(\s+|[¿?¡!,.\n])/);
    
    return tokens.map((token, index) => {
      const cleanToken = token.toLowerCase().replace(/[¿?¡!,.]/g, "").trim();
      
      // Highlight if cleanToken exists in syllabus
      const isKnown = UNIQUE_SPANISH_WORDS.includes(cleanToken);
      
      if (isKnown) {
        return (
          <span key={index} className="chat-highlight-word">
            {token}
          </span>
        );
      }
      
      return <span key={index}>{token}</span>;
    });
  };

  const speakMessage = (text) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-MX';

        const voices = window.speechSynthesis.getVoices();
        const spanishVoice = voices.find(v => v.lang.toLowerCase() === 'es-mx') ||
                             voices.find(v => v.lang.toLowerCase() === 'es-es') ||
                             voices.find(v => v.lang.toLowerCase().includes('es'));
        if (spanishVoice) {
          utterance.voice = spanishVoice;
          utterance.lang = spanishVoice.lang;
        }

        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("AI Chat Speech Error:", e);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userText = inputText.trim();
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add user message
    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      text: userText,
      time: nowStr
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    const apiKey = state.apiKeys.gemini;

    if (!apiKey) {
      // DEMO MOCK CHAT MODE
      setTimeout(() => {
        const step = MOCK_CONVERSATION_STEPS[mockStepIdx];
        let replyText = "Lo siento, tengo clase ahora. ¡Nos vemos luego! ¡Adiós!";
        
        if (step) {
          replyText = step.reply;
          setMockStepIdx(prev => prev + 1);
        }

        const botMsg = {
          id: (Date.now() + 1).toString(),
          role: "bot",
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => [...prev, botMsg]);
        setLoading(false);
      }, 1000);
      
    } else {
      // REAL GEMINI API INTEGRATION
      try {
        // Construct the vocab list context for the LLM
        const vocabContext = UNIQUE_SPANISH_WORDS.slice(0, 350).join(", "); // Limit size to fit within strict payload bounds
        const systemPrompt = `You are Elena, a helpful Spanish 101 learning partner.
You are talking to a student. You MUST only communicate in Spanish.
CRITICAL MANDATE: You can ONLY use the following Spanish words in your response: [${vocabContext}, hola, adios, gracias, qué, por qué, cómo, dónde, cuándo, quién].
Do not use any verb forms, nouns, or adjectives outside of this list.
Keep your answers brief (1-2 short sentences maximum). Speak in simple, clear grammar.
Do not output translations. Respond directly in Spanish.`;

        // Retrieve last 6 messages to keep context
        const contextHistory = messages.slice(-6).map(m => `${m.role === 'user' ? 'Student' : 'Elena'}: ${m.text}`).join('\n');
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { 
                    text: `${systemPrompt}\n\nConversation history:\n${contextHistory}\n\nStudent: ${userText}\nElena:` 
                  }
                ]
              }
            ],
            generationConfig: {
              maxOutputTokens: 100,
              temperature: 0.5
            }
          })
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();
        let botText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento, no comprendo.";
        botText = botText.trim();

        const botMsg = {
          id: Date.now().toString(),
          role: "bot",
          text: botText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, botMsg]);
      } catch (err) {
        console.error("Gemini API Error:", err);
        const errMsg = {
          id: Date.now().toString(),
          role: "bot",
          text: "Error de conexión con el AI. Please check your Gemini API key in settings or try again.",
          time: nowStr
        };
        setMessages(prev => [...prev, errMsg]);
      } finally {
        setLoading(false);
      }
    }
  };

  const isDemo = !state.apiKeys.gemini;

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem' }}>Charla con Elena (AI Language Partner)</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isDemo 
              ? "Running in Demo Mode. Elena will guide you through a scripted conversation." 
              : "Connected to Gemini AI. Practice freely using your Spanish 101 vocabulary!"}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => setShowKeyModal(true)}>
            <Settings size={16} /> API Key
          </button>
          <button className="btn btn-secondary" onClick={() => setView('dashboard')}>
            <ArrowLeft size={16} /> Quit Chat
          </button>
        </div>
      </div>

      {isDemo && (
        <div className="glass-panel" style={{ padding: '12px 16px', background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Info size={16} color="var(--warning)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Practice highlights words in green if they match your vocabulary list! Add a <strong>Gemini API Key</strong> in the settings to talk freely.
          </span>
        </div>
      )}

      {/* Chat Container */}
      <div className="glass-panel chat-container">
        <div className="chat-banner">
          <div className="chat-partner-info">
            <div className="chat-partner-avatar">👩‍🏫</div>
            <div>
              <span className="chat-partner-name">Elena</span>
              <div className="chat-partner-status">
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}></span>
                En línea (Online)
              </div>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Vocabulary Constraint Active
          </span>
        </div>

        {/* Messages Body */}
        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`chat-msg ${msg.role}`}>
              <div className="chat-bubble">
                {renderHighlightedMessage(msg.text, msg.role)}
              </div>
              <div className="chat-msg-time" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {msg.role === 'bot' && (
                  <button 
                    onClick={() => speakMessage(msg.text)} 
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0 2px' }}
                  >
                    <Volume2 size={12} />
                  </button>
                )}
                {msg.time}
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-msg bot">
              <div className="chat-bubble" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Elena escribe... (typing...)
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="chat-input-bar">
          <input
            type="text"
            placeholder="Type your response in Spanish..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            className="chat-text-input"
            autoFocus
          />
          <button type="submit" className="btn btn-primary" disabled={loading || !inputText.trim()}>
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ animation: 'pop-in 0.3s ease-out' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={20} color="var(--primary)" /> Gemini API Settings
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Paste your personal Gemini API key here to talk freely with Elena. The key is saved locally in your browser's LocalStorage and is never shared.
            </p>

            <div className="form-group">
              <label className="form-label">Gemini API Key</label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                className="form-input"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setShowKeyModal(false)} style={{ flex: 1 }}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveKey} style={{ flex: 1 }}>
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
