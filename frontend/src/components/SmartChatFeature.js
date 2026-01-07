import React, { useState, useRef, useEffect } from 'react';
import { smartChatAPI } from '../api';
import api from '../api';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Volume2, Image as ImageIcon, X } from 'lucide-react';
import MicrophoneButton from './MicrophoneButton';

function SmartChatFeature() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchEngine, setSearchEngine] = useState('google');
  const [playingAudio, setPlayingAudio] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if ((!input.trim() && selectedImages.length === 0) || loading) return;

    // Prepare user message
    const userMessage = { 
      role: 'user', 
      content: input,
      images: selectedImages.map(img => img.preview)
    };
    setMessages(prev => [...prev, userMessage]);
    const userQuery = input;
    setInput('');
    
    // Upload images first if any
    let uploadedImageFilenames = [];
    if (selectedImages.length > 0) {
      try {
        const uploadPromises = selectedImages.map(async (img) => {
          const response = await api.uploadImage(img.file);
          return response.filename;
        });
        uploadedImageFilenames = await Promise.all(uploadPromises);
      } catch (error) {
        console.error('Image upload error:', error);
        const errorMessage = { 
          role: 'agent', 
          content: `❌ Lỗi upload hình ảnh: ${error.message}` 
        };
        setMessages(prev => [...prev, errorMessage]);
        setLoading(false);
        setSelectedImages([]);
        return;
      }
    }
    
    // Clear selected images
    setSelectedImages([]);
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
      const response = await smartChatAPI.sendSmartMessage(
        userQuery, 
        searchEngine,
        uploadedImageFilenames
      );
      
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

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('Vui lòng chọn file hình ảnh');
      return;
    }

    // Check total count (current + new)
    if (selectedImages.length + imageFiles.length > 5) {
      alert('Tối đa 5 hình ảnh mỗi lần chat');
      return;
    }

    const newImages = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setSelectedImages(prev => [...prev, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    setSelectedImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handlePaste = (e) => {
    // Get clipboard data
    const items = e.clipboardData?.items;
    if (!items) return;

    // Look for image items
    const imageItems = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          imageItems.push(file);
        }
      }
    }

    if (imageItems.length === 0) return;

    // Check limit
    if (selectedImages.length + imageItems.length > 5) {
      e.preventDefault();
      alert('Tối đa 5 hình ảnh mỗi lần chat');
      return;
    }

    e.preventDefault();
    const newImages = imageItems.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setSelectedImages(prev => [...prev, ...newImages]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) return;

    // Check limit
    if (selectedImages.length + imageFiles.length > 5) {
      alert('Tối đa 5 hình ảnh mỗi lần chat');
      return;
    }

    const newImages = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setSelectedImages(prev => [...prev, ...newImages]);
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
                    {/* Display images if present */}
                    {msg.images && msg.images.length > 0 && (
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '10px', 
                        marginBottom: '10px' 
                      }}>
                        {msg.images.map((imgSrc, imgIdx) => (
                          <img 
                            key={imgIdx}
                            src={imgSrc} 
                            alt={`Uploaded ${imgIdx + 1}`}
                            style={{
                              maxWidth: '200px',
                              maxHeight: '200px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              border: '2px solid #e0e0e0'
                            }}
                          />
                        ))}
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
          
          {/* Image Preview Area - Show selected images before sending */}
          {selectedImages.length > 0 && (
            <div style={{ 
              padding: '15px',
              margin: '10px 0',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              borderRadius: '15px',
              border: '2px dashed #667eea'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px',
                color: '#667eea',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}>
                <ImageIcon size={18} />
                <span>{selectedImages.length}/5 hình đã chọn</span>
              </div>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '10px'
              }}>
                {selectedImages.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <img 
                      src={img.preview} 
                      alt={`Preview ${idx + 1}`}
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '10px',
                        border: '3px solid white',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                    <button
                      onClick={() => handleRemoveImage(idx)}
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                        color: 'white',
                        border: '2px solid white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 8px rgba(245,87,108,0.4)',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area" style={{ width: '100%' }}>
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            alignItems: 'flex-end',
            width: '100%'
          }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: '2px solid #667eea',
                background: 'white',
                color: '#667eea',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s',
                opacity: loading ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = '#667eea';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#667eea';
              }}
            >
              <ImageIcon size={20} />
            </button>
            <textarea
              placeholder="Nhập tin nhắn... (Paste/kéo thả hình vào đây, tối đa 5 ảnh)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              onPaste={handlePaste}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
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
            disabled={loading || (!input.trim() && selectedImages.length === 0)}
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
