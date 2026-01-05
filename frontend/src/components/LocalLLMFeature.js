import React, { useState } from 'react';
import { Cpu, Send, Loader, AlertCircle, Info, Key, Cloud, HardDrive, Presentation, Download } from 'lucide-react';
import LoadingAnimation from './LoadingAnimation';
import AudioButton from './AudioButton';
import api from '../api';

const LocalLLMFeature = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  
  // API settings
  const [useAPI, setUseAPI] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('gemini-2.5-flash');
  
  // Mode selection: 'chat' or 'slides'
  const [mode, setMode] = useState('chat');
  
  // Slides creation
  const [slideTopic, setSlideTopic] = useState('');
  const [numSlides, setNumSlides] = useState(5);
  const [slideLoading, setSlideLoading] = useState(false);
  const [slideResult, setSlideResult] = useState(null);
  const [slideMessages, setSlideMessages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Vui lòng nhập tin nhắn');
      return;
    }

    if (useAPI && !apiKey.trim()) {
      setError('Vui lòng nhập API key của Gemini');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await api.localLLMChat({
        message: message,
        max_length: 512,
        temperature: 0.7,
        use_api: useAPI,
        api_key: useAPI ? apiKey : null,
        model_name: useAPI ? modelName : null
      });

      setResponse(result.response);
      setModelInfo({
        model: result.model,
        device: result.device
      });
      setLoading(false);
    } catch (err) {
      setError('Lỗi: ' + err.message);
      setLoading(false);
    }
  };

  const handleCreateSlides = async () => {
    if (!slideTopic.trim()) {
      setError('Vui lòng nhập chủ đề cho slides');
      return;
    }

    if (useAPI && !apiKey.trim()) {
      setError('Vui lòng nhập API key của Gemini');
      return;
    }

    setSlideLoading(true);
    setError(null);
    setSlideResult(null);

    try {
      const result = await api.createSlides({
        topic: slideTopic,
        num_slides: numSlides,
        use_api: useAPI,
        api_key: useAPI ? apiKey : null,
        model_name: useAPI ? modelName : null
      });

      setSlideResult(result);
      setSlideLoading(false);
    } catch (err) {
      setError('Lỗi tạo slides: ' + err.message);
      setSlideLoading(false);
    }
  };

  const handleDownloadSlides = () => {
    if (slideResult && slideResult.filename) {
      const filename = slideResult.filename.split('/').pop();
      window.open(`http://localhost:8000/download-slides/${filename}`, '_blank');
    }
  };

  return (
    <div className="feature-container">
      <h2 className="feature-title">
        <Cpu size={28} style={{ marginRight: '10px' }} />
        Load Local LLM (Qwen 1.5B) or API LLM
      </h2>

      <div style={{
        padding: '15px',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
        border: '2px solid rgba(102, 126, 234, 0.5)',
        borderRadius: '12px',
        marginBottom: '24px',
        backdropFilter: 'blur(10px)'
      }}>
        <Info size={20} style={{ marginRight: '8px', display: 'inline', color: '#a8c0ff', verticalAlign: 'middle' }} />
        <span style={{ color: '#black', fontSize: '15px', fontWeight: '600' }}>
          Sử dụng Local LLM (Qwen) trên máy hoặc Gemini API từ cloud
        </span>
      </div>

      {/* LLM Type Selection */}
      <div style={{ 
        marginBottom: '24px',
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        border: '1px solid rgba(102, 126, 234, 0.2)'
      }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '12px',
          cursor: 'pointer',
          padding: '12px',
          borderRadius: '8px',
          background: !useAPI ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
          transition: 'all 0.3s ease'
        }}>
          <input
            type="radio"
            checked={!useAPI}
            onChange={() => setUseAPI(false)}
            style={{ 
              marginRight: '12px',
              width: '18px',
              height: '18px',
              cursor: 'pointer'
            }}
          />
          <HardDrive size={22} style={{ marginRight: '10px', color: '#8fa3ff' }} />
          <span style={{ color: '#000000', fontSize: '16px', fontWeight: '500' }}>Local LLM (Qwen 2.5B)</span>
        </label>
        
        <label style={{ 
          display: 'flex', 
          alignItems: 'center',
          cursor: 'pointer',
          padding: '12px',
          borderRadius: '8px',
          background: useAPI ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
          transition: 'all 0.3s ease'
        }}>
          <input
            type="radio"
            checked={useAPI}
            onChange={() => setUseAPI(true)}
            style={{ 
              marginRight: '12px',
              width: '18px',
              height: '18px',
              cursor: 'pointer'
            }}
          />
          <Cloud size={22} style={{ marginRight: '10px', color: '#8fa3ff' }} />
          <span style={{ color: '#000000', fontSize: '16px', fontWeight: '500' }}>API LLM (Gemini)</span>
        </label>
      </div>

      {/* API Key Input (only shown when useAPI is true) */}
      {useAPI && (
        <div style={{ 
          marginBottom: '24px',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          border: '1px solid rgba(102, 126, 234, 0.3)'
        }}>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            color: '#000000', 
            marginBottom: '12px',
            fontWeight: '600',
            fontSize: '15px'
          }}>
            <Key size={18} style={{ marginRight: '8px', color: '#8fa3ff' }} />
            Gemini API Key:
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Nhập API key của Gemini..."
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '8px',
              border: '2px solid rgba(102, 126, 234, 0.4)',
              background: '#ffffff',
              color: '#000000',
              fontSize: '15px',
              marginBottom: '12px',
              outline: 'none',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.4)'}
          />
          <select
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '8px',
              border: '2px solid rgba(102, 126, 234, 0.4)',
              background: '#ffffff',
              color: '#000000',
              fontSize: '15px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="gemini-2.5-flash" style={{ background: '#ffffff', color: '#000000' }}>gemini-2.5-flash</option>
            <option value="gemini-1.5-flash" style={{ background: '#ffffff', color: '#000000' }}>gemini-1.5-flash</option>
            <option value="gemini-1.5-pro" style={{ background: '#ffffff', color: '#000000' }}>gemini-1.5-pro</option>
          </select>
        </div>
      )}

      {modelInfo && (
        <div style={{
          padding: '14px 18px',
          background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.15) 0%, rgba(32, 201, 151, 0.15) 100%)',
          border: '2px solid rgba(40, 167, 69, 0.5)',
          borderRadius: '10px',
          marginBottom: '24px',
          fontSize: '14px'
        }}>
          <span style={{ color: '#5dff9f', fontWeight: '600' }}>
            ✓ Model: {modelInfo.model} | Device: {modelInfo.device}
          </span>
        </div>
      )}

      {/* Mode Toggle Buttons */}
      <div style={{ 
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '8px',
        borderRadius: '12px',
        border: '1px solid rgba(102, 126, 234, 0.3)'
      }}>
        <button
          type="button"
          onClick={() => setMode('chat')}
          style={{
            flex: 1,
            padding: '14px 24px',
            background: mode === 'chat' ? 
              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
              'rgba(102, 126, 234, 0.1)',
            color: mode === 'chat' ? 'white' : '#8fa3ff',
            border: mode === 'chat' ? 'none' : '2px solid rgba(102, 126, 234, 0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: mode === 'chat' ? '0 4px 15px rgba(102, 126, 234, 0.3)' : 'none'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <Send size={20} style={{ marginRight: '8px' }} />
          Chat Thường
        </button>

        <button
          type="button"
          onClick={() => setMode('slides')}
          style={{
            flex: 1,
            padding: '14px 24px',
            background: mode === 'slides' ? 
              'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' :
              'rgba(118, 75, 162, 0.1)',
            color: mode === 'slides' ? 'white' : '#b399ff',
            border: mode === 'slides' ? 'none' : '2px solid rgba(118, 75, 162, 0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: mode === 'slides' ? '0 4px 15px rgba(118, 75, 162, 0.3)' : 'none'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <Presentation size={20} style={{ marginRight: '8px' }} />
          Tạo Slides
        </button>
      </div>

      {/* Chat Section - Only show when mode is 'chat' */}
      {mode === 'chat' && (
        <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
          <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập tin nhắn của bạn..."
              rows="4"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                border: '2px solid rgba(102, 126, 234, 0.4)',
                background: '#ffffff',
                color: '#000000',
                fontSize: '15px',
                marginBottom: '14px',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.3s ease',
                lineHeight: '1.5'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.4)'}
            />

            <button
              type="submit"
              disabled={loading || !message.trim()}
              style={{
                width: '100%',
                padding: '16px 28px',
                background: loading || !message.trim() ? 
                  'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)' :
                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: loading || !message.trim() ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: loading || !message.trim() ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading && message.trim()) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = loading || !message.trim() ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.3)';
              }}
            >
              {loading ? (
                <>
                  <Loader size={20} style={{ marginRight: '10px', animation: 'spin 1s linear infinite' }} />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Send size={20} style={{ marginRight: '10px' }} />
                  Gửi
                </>
              )}
            </button>
          </form>

          {loading && <LoadingAnimation />}

          {response && (
            <div style={{
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
              border: '2px solid rgba(102, 126, 234, 0.4)',
              borderRadius: '12px',
              marginTop: '20px',
              animation: 'fadeIn 0.3s ease-in'
            }}>
              <h3 style={{ 
                color: '#8fa3ff', 
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '18px',
                fontWeight: '700'
              }}>
                <Cpu size={24} style={{ marginRight: '10px' }} />
                Phản Hồi
              </h3>
              <div style={{
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                lineHeight: '1.7',
                color: '#000000',
                fontSize: '15px',
                marginBottom: '16px'
              }}>
                {response}
              </div>
              <AudioButton text={response} />
            </div>
          )}
        </div>
      )}

      {/* Slides Section - Only show when mode is 'slides' */}
      {mode === 'slides' && (
        <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
          <div style={{
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(118, 75, 162, 0.15) 0%, rgba(102, 126, 234, 0.15) 100%)',
            border: '2px solid rgba(118, 75, 162, 0.4)',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <h3 style={{ 
              color: '#b399ff', 
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              fontSize: '18px',
              fontWeight: '700'
            }}>
              <Presentation size={24} style={{ marginRight: '10px' }} />
              Tạo Slides Thuyết Trình
            </h3>
            
            <input
              type="text"
              value={slideTopic}
              onChange={(e) => setSlideTopic(e.target.value)}
              placeholder="Nhập chủ đề cho slides (VD: Trí tuệ nhân tạo)"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: '2px solid rgba(118, 75, 162, 0.4)',
                background: '#ffffff',
                color: '#000000',
                fontSize: '15px',
                marginBottom: '14px',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#764ba2'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(118, 75, 162, 0.4)'}
            />
            
            <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center' }}>
              <label style={{ color: '#000000', marginRight: '12px', fontWeight: '600', fontSize: '15px' }}>
                Số lượng slides:
              </label>
              <input
                type="number"
                value={numSlides}
                onChange={(e) => setNumSlides(parseInt(e.target.value))}
                min="3"
                max="15"
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '2px solid rgba(118, 75, 162, 0.4)',
                  background: '#ffffff',
                  color: '#000000',
                  fontSize: '15px',
                  width: '90px',
                  outline: 'none',
                  textAlign: 'center',
                  fontWeight: '600'
                }}
              />
            </div>
            
            <button
              onClick={handleCreateSlides}
              disabled={slideLoading || !slideTopic.trim()}
              style={{
                padding: '16px 28px',
                background: slideLoading || !slideTopic.trim() ?
                  'linear-gradient(135deg, rgba(118, 75, 162, 0.3) 0%, rgba(102, 126, 234, 0.3) 100%)' :
                  'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: slideLoading || !slideTopic.trim() ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '700',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: slideLoading || !slideTopic.trim() ? 'none' : '0 4px 15px rgba(118, 75, 162, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!slideLoading && slideTopic.trim()) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(118, 75, 162, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = slideLoading || !slideTopic.trim() ? 'none' : '0 4px 15px rgba(118, 75, 162, 0.3)';
              }}
            >
              {slideLoading ? (
                <>
                  <Loader size={20} style={{ marginRight: '10px', animation: 'spin 1s linear infinite' }} />
                  Đang tạo slides...
                </>
              ) : (
                <>
                  <Presentation size={20} style={{ marginRight: '10px' }} />
                  Tạo Slides
                </>
              )}
            </button>
          </div>

          {slideLoading && <LoadingAnimation />}

          {slideResult && (
            <div style={{
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.15) 0%, rgba(32, 201, 151, 0.15) 100%)',
              border: '2px solid rgba(40, 167, 69, 0.5)',
              borderRadius: '12px',
              marginTop: '20px',
              animation: 'fadeIn 0.3s ease-in'
            }}>
              <h3 style={{ 
                color: '#5dff9f', 
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '18px',
                fontWeight: '700'
              }}>
                <Presentation size={24} style={{ marginRight: '10px' }} />
                Slides đã được tạo!
              </h3>
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#000000', marginBottom: '8px', fontSize: '15px' }}>
                  <strong style={{ color: '#5dff9f' }}>Tiêu đề:</strong> {slideResult.title}
                </p>
                <p style={{ color: '#000000', marginBottom: '8px', fontSize: '15px' }}>
                  <strong style={{ color: '#5dff9f' }}>Số slides:</strong> {slideResult.num_slides}
                </p>
                <p style={{ color: '#000000', marginBottom: '0', fontSize: '15px' }}>
                  <strong style={{ color: '#5dff9f' }}>Model:</strong> {slideResult.model}
                </p>
              </div>
              <button
                onClick={handleDownloadSlides}
                style={{
                  padding: '14px 28px',
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
                }}
              >
                <Download size={20} style={{ marginRight: '10px' }} />
                Tải xuống Slides
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.15) 0%, rgba(255, 82, 82, 0.15) 100%)',
          border: '2px solid rgba(220, 53, 69, 0.5)',
          borderRadius: '10px',
          color: '#ff6b6b',
          marginTop: '20px',
          display: 'flex',
          alignItems: 'center',
          fontWeight: '500'
        }}>
          <AlertCircle size={22} style={{ marginRight: '12px', flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default LocalLLMFeature;
