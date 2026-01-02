import React, { useState } from 'react';
import { chatAPI } from '../api';
import ReactMarkdown from 'react-markdown';

function MathFeature() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const examples = [
    'integrate x^2 from 0 to 10',
    'solve x^2 + 5x + 6 = 0',
    'derivative of sin(x)*cos(x)',
    'plot y = x^2',
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage(input, 'math');
      const agentMessage = { role: 'agent', content: response.response };
      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      const errorMessage = { 
        role: 'agent', 
        content: `❌ Lỗi: ${error.response?.data?.detail || error.message}` 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExampleClick = (example) => {
    setInput(example);
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#667eea', marginBottom: '15px' }}>🧮 Ví dụ tính toán:</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {examples.map((example, idx) => (
            <button
              key={idx}
              onClick={() => handleExampleClick(example)}
              style={{
                padding: '8px 16px',
                background: 'white',
                border: '2px solid #667eea',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: '#667eea',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#667eea';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.color = '#667eea';
              }}
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <div className="chat-container">
        <div className="messages">
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
              <p>🧮 Tôi có thể giúp bạn tính toán với Wolfram Alpha!</p>
              <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
                Tích phân, đạo hàm, giải phương trình, và nhiều hơn nữa...
              </p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="message-label">
                {msg.role === 'user' ? '👤 Bạn' : '🤖 AI Agent'}
              </div>
              <div className="message-text">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && <div className="loading">⏳ Đang tính toán...</div>}
        </div>

        <div className="input-area">
          <input
            type="text"
            placeholder="Nhập phép tính của bạn..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <button 
            className="send-btn" 
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            Tính
          </button>
        </div>
      </div>
    </div>
  );
}

export default MathFeature;
