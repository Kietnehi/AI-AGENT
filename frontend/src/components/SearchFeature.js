import React, { useState } from 'react';
import { chatAPI } from '../api';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingAnimation from './LoadingAnimation';
import { Send, Sparkles } from 'lucide-react';

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="search-options"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          className={`search-option-btn ${searchEngine === 'duckduckgo' ? 'active' : ''}`}
          onClick={() => setSearchEngine('duckduckgo')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🦆 DuckDuckGo
        </motion.button>
        <motion.button
          className={`search-option-btn ${searchEngine === 'serpapi' ? 'active' : ''}`}
          onClick={() => setSearchEngine('serpapi')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🔍 SerpAPI (Google)
        </motion.button>
      </motion.div>

      <div className="chat-container">
        <div className="messages">
          {messages.length === 0 && (
            <motion.div 
              className="empty-state"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{ textAlign: 'center', padding: '40px', color: '#999' }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              >
                <Sparkles size={48} style={{ marginBottom: '20px', color: '#667eea' }} />
              </motion.div>
              <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>
                Bắt đầu tìm kiếm thông tin trên web
              </p>
            </motion.div>
          )}
          
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                className={`message ${msg.role}`}
                initial={{ opacity: 0, x: msg.role === 'user' ? 50 : -50, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ 
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
              >
                <div className="message-label">
                  {msg.role === 'user' ? '👤 Bạn' : '🤖 AI Agent'}
                </div>
                <div className="message-text">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {loading && <LoadingAnimation />}
        </div>

        <motion.div 
          className="input-area"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập câu hỏi tìm kiếm..."
            disabled={loading}
          />
          <motion.button
            className="send-btn"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send size={20} />
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default SearchFeature;
