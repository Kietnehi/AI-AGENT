import React, { useState } from 'react';
import { chatAPI } from '../api';
import ReactMarkdown from 'react-markdown';

function SearchFeature() {
  const [searchEngine, setSearchEngine] = useState('duckduckgo');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage(input, 'search', searchEngine);
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

  return (
    <div>
      <div className="search-options">
        <button
          className={`search-option-btn ${searchEngine === 'duckduckgo' ? 'active' : ''}`}
          onClick={() => setSearchEngine('duckduckgo')}
        >
          🦆 DuckDuckGo
        </button>
        <button
          className={`search-option-btn ${searchEngine === 'serpapi' ? 'active' : ''}`}
          onClick={() => setSearchEngine('serpapi')}
        >
          🔍 SerpAPI (Google)
        </button>
      </div>

      <div className="chat-container">
        <div className="messages">
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
              <p>👋 Xin chào! Tôi có thể giúp bạn tìm kiếm thông tin.</p>
              <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
                Hãy hỏi bất cứ điều gì bạn muốn tìm hiểu!
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
          {loading && <div className="loading">⏳ Đang tìm kiếm...</div>}
        </div>

        <div className="input-area">
          <input
            type="text"
            placeholder="Nhập câu hỏi của bạn..."
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
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}

export default SearchFeature;
