import React, { useState } from 'react';
import { chatAPI } from '../api';
import ReactMarkdown from 'react-markdown';
import AudioButton from './AudioButton';

function MathFeature() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const examples = [
    'integrate x^2 from 0 to 10',
    'solve x^2 + 5x + 6 = 0',
    'derivative of sin(x)*cos(x)',
    'plot y = x^2',
    'plot sin(x) and cos(x)',
    'graph of x^3 - 2x + 1',
  ];

  const renderWolframResult = (data) => {
    if (!data) return null;

    return (
      <div style={{ width: '100%' }}>
        {/* Text Results */}
        {data.text_results && data.text_results.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#667eea', marginBottom: '10px' }}>🧮 Kết quả:</h4>
            {data.text_results.map((result, idx) => (
              <div key={idx} style={{ 
                background: '#f8f9fa', 
                padding: '10px', 
                marginBottom: '5px', 
                borderRadius: '5px',
                fontFamily: 'monospace'
              }}>
                {result}
              </div>
            ))}
          </div>
        )}

        {/* Plots */}
        {data.plots && data.plots.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#667eea', marginBottom: '10px' }}>📊 Biểu đồ:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {data.plots.map((plot, idx) => (
                <div key={idx} style={{ 
                  border: '2px solid #667eea', 
                  borderRadius: '10px', 
                  overflow: 'hidden',
                  background: 'white',
                  maxWidth: '100%'
                }}>
                  <div style={{ 
                    background: '#667eea', 
                    color: 'white', 
                    padding: '8px 12px', 
                    fontSize: '0.9rem' 
                  }}>
                    {plot.title}
                  </div>
                  <div style={{ 
                    padding: '10px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'white'
                  }}>
                    <img 
                      src={plot.url} 
                      alt={plot.alt} 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '400px',
                        height: 'auto',
                        width: 'auto',
                        display: 'block',
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Images */}
        {data.images && data.images.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#667eea', marginBottom: '10px' }}>🖼️ Hình ảnh:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {data.images.map((img, idx) => (
                <div key={idx} style={{ 
                  border: '2px solid #667eea', 
                  borderRadius: '10px', 
                  overflow: 'hidden',
                  background: 'white',
                  maxWidth: '100%'
                }}>
                  <div style={{ 
                    background: '#667eea', 
                    color: 'white', 
                    padding: '8px 12px', 
                    fontSize: '0.9rem' 
                  }}>
                    {img.title}
                  </div>
                  <div style={{ 
                    padding: '10px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'white'
                  }}>
                    <img 
                      src={img.url} 
                      alt={img.alt} 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '300px',
                        height: 'auto',
                        width: 'auto',
                        display: 'block',
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error message if no success */}
        {!data.success && (
          <div style={{ 
            background: '#ffebee', 
            color: '#c62828', 
            padding: '15px', 
            borderRadius: '5px',
            border: '1px solid #ffcdd2'
          }}>
            ❌ Không thể tính toán được kết quả. Vui lòng kiểm tra lại câu hỏi.
          </div>
        )}
      </div>
    );
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage(input, 'math');
      
      // Handle both old string format and new JSON format
      let wolframData;
      if (typeof response.response === 'string') {
        // Try to parse as JSON first
        try {
          wolframData = JSON.parse(response.response);
        } catch (e) {
          // If not JSON, treat as old format - just text
          wolframData = {
            text_results: [response.response],
            plots: [],
            images: [],
            success: true
          };
        }
      } else {
        // New format - object with plots, images, etc.
        wolframData = response.response;
      }

      const agentMessage = { 
        role: 'agent', 
        content: wolframData,
        isWolfram: true
      };
      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      const errorMessage = { 
        role: 'agent', 
        content: `❌ Lỗi: ${error.response?.data?.detail || error.message}`,
        isWolfram: false
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
              <p>🧮 Tôi có thể giúp bạn tính toán và vẽ biểu đồ với Wolfram Alpha!</p>
              <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
                Tích phân, đạo hàm, giải phương trình, vẽ đồ thị và nhiều hơn nữa...
              </p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="message-label">
                {msg.role === 'user' ? '👤 Bạn' : '🤖 Wolfram Alpha'}
              </div>
              <div className="message-text">
                {msg.isWolfram ? 
                  renderWolframResult(msg.content) : 
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                }
                {msg.role === 'agent' && !msg.isWolfram && (
                  <AudioButton text={typeof msg.content === 'string' ? msg.content : ''} />
                )}
              </div>
            </div>
          ))}
          {loading && <div className="loading">⏳ Đang tính toán...</div>}
        </div>

        <div className="input-area">
          <input
            type="text"
            placeholder="Nhập phép tính của bạn (thử 'plot y = x^2' để vẽ biểu đồ)..."
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