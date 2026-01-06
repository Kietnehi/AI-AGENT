import React, { useState, useRef, useEffect } from 'react';
import { smartChatAPI } from '../api';
import api from '../api';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Volume2 } from 'lucide-react';
import MicrophoneButton from './MicrophoneButton';

function SmartChatFeature() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchEngine, setSearchEngine] = useState('google');
  const [playingAudio, setPlayingAudio] = useState(null);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const userQuery = input;
    setInput('');
    setLoading(true);

    // Add thinking message
    const thinkingId = Date.now();
    setMessages(prev => [...prev, { 
      role: 'agent', 
      content: '🤔 Đang phân tích câu hỏi của bạn...', 
      id: thinkingId,
      isThinking: true 
    }]);

    try {
      const response = await smartChatAPI.sendSmartMessage(userQuery, searchEngine);
      
      // Remove thinking message
      setMessages(prev => prev.filter(msg => msg.id !== thinkingId));
      
      // Add final response
      const agentMessage = { 
        role: 'agent', 
        content: response.response,
        searchPerformed: response.search_performed,
        searchEngine: response.search_engine
      };
      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      // Remove thinking message
      setMessages(prev => prev.filter(msg => msg.id !== thinkingId));
      
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

  const handlePlayAudio = async (text, messageIndex) => {
    try {
      // Stop previous audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setPlayingAudio(null);
      }

      setPlayingAudio(messageIndex);
      
      // Get audio from TTS API
      const audioBlob = await api.textToSpeech(text, 'vi');
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create and play audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setPlayingAudio(null);
        audioRef.current = null;
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setPlayingAudio(null);
        audioRef.current = null;
        alert('Lỗi phát audio');
      };
      
      await audio.play();
      
    } catch (error) {
      console.error('TTS Error:', error);
      setPlayingAudio(null);
      alert('Lỗi chuyển đổi text-to-speech');
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        borderRadius: '15px',
        marginBottom: '20px',
        color: 'white',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <Sparkles size={28} />
          <h2 style={{ margin: 0 }}>Smart Chat AI</h2>
        </div>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>
          Chat thông minh với khả năng tự động tìm kiếm thông tin real-time khi cần thiết
        </p>
        
        <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSearchEngine('duckduckgo')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: searchEngine === 'duckduckgo' ? '2px solid white' : '2px solid rgba(255,255,255,0.3)',
              background: searchEngine === 'duckduckgo' ? 'rgba(255,255,255,0.2)' : 'transparent',
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            🦆 DuckDuckGo
          </button>
          <button
            onClick={() => setSearchEngine('serpapi')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: searchEngine === 'serpapi' ? '2px solid white' : '2px solid rgba(255,255,255,0.3)',
              background: searchEngine === 'serpapi' ? 'rgba(255,255,255,0.2)' : 'transparent',
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            🔍 SerpAPI
          </button>
          <button
            onClick={() => setSearchEngine('google')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: searchEngine === 'google' ? '2px solid white' : '2px solid rgba(255,255,255,0.3)',
              background: searchEngine === 'google' ? 'rgba(255,255,255,0.2)' : 'transparent',
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            🌐 Google (Gemini)
          </button>
        </div>
      </div>

      <div className="chat-container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="messages" style={{ flex: 1, overflowY: 'auto' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
              <Sparkles size={48} color="#667eea" style={{ marginBottom: '20px' }} />
              <h3 style={{ color: '#667eea', marginBottom: '15px' }}>
                Xin chào! Tôi là AI Assistant thông minh
              </h3>
              <p style={{ fontSize: '1rem', marginBottom: '20px' }}>
                Tôi có thể tự động tìm kiếm thông tin trên web khi cần thiết
              </p>
              <div style={{ 
                textAlign: 'left', 
                display: 'inline-block',
                background: '#f8f9fa',
                padding: '20px',
                borderRadius: '10px',
                fontSize: '0.9rem'
              }}>
                <p style={{ fontWeight: 'bold', color: '#667eea', marginBottom: '10px' }}>
                  💡 Ví dụ câu hỏi:
                </p>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>Cập nhật tin tức về giá vàng hôm nay và tư vấn đầu tư</li>
                  <li>Tìm kiếm thông tin về AI mới nhất và xu hướng 2026</li>
                  <li>Giá bitcoin hiện tại và dự đoán trong tương lai</li>
                  <li>Thời tiết Hà Nội hôm nay như thế nào?</li>
                </ul>
              </div>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="message-label">
                {msg.role === 'user' ? '👤 Bạn' : '🤖 Smart AI'}
              </div>
              <div className="message-text">
                {msg.isThinking ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    {msg.content}
                  </div>
                ) : (
                  <>
                    {msg.searchPerformed && (
                      <div style={{
                        padding: '8px 12px',
                        background: '#e3f2fd',
                        borderLeft: '3px solid #2196f3',
                        borderRadius: '5px',
                        marginBottom: '10px',
                        fontSize: '0.85rem',
                        color: '#1565c0'
                      }}>
                        🔍 Đã tìm kiếm thông tin trên {
                          msg.searchEngine === 'duckduckgo' ? 'DuckDuckGo' : 
                          msg.searchEngine === 'serpapi' ? 'SerpAPI' :
                          msg.searchEngine === 'google' ? 'Google (Gemini)' :
                          msg.searchEngine
                        }
                      </div>
                    )}
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                    
                    {/* Audio Button for AI responses */}
                    {msg.role === 'agent' && !msg.isThinking && (
                      <button
                        onClick={() => handlePlayAudio(msg.content, idx)}
                        disabled={playingAudio === idx}
                        style={{
                          marginTop: '10px',
                          padding: '8px 16px',
                          background: playingAudio === idx 
                            ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '20px',
                          cursor: playingAudio === idx ? 'not-allowed' : 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.3s'
                        }}
                      >
                        <Volume2 size={16} />
                        {playingAudio === idx ? 'Đang phát...' : 'Nghe'}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area" style={{ width: '100%' }}>
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            alignItems: 'flex-end',
            width: '100%'
          }}>
            <textarea
              placeholder="Hỏi bất cứ điều gì... AI sẽ tự động tìm kiếm nếu cần"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              rows={2}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                border: '2px solid #e0e0e0',
                fontSize: '1rem',
                resize: 'none',
                fontFamily: 'inherit',
                minWidth: 0  // Prevent flex overflow
              }}
            />
            <MicrophoneButton
              onTranscript={(text) => setInput(text)}
              language="vi"
              disabled={loading}
            />
          </div>
          <button 
            className="send-btn" 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={{
              marginTop: '10px',
              alignSelf: 'flex-end',
              width: 'auto',
              maxWidth: '300px',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.95rem',
              background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Đang xử lý...' : '🚀 Gửi'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SmartChatFeature;
