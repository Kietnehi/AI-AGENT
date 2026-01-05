import React, { useState } from 'react';
import { Cpu, Send, Loader, AlertCircle, Info } from 'lucide-react';
import LoadingAnimation from './LoadingAnimation';
import AudioButton from './AudioButton';
import api from '../api';

const LocalLLMFeature = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Vui lòng nhập tin nhắn');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await api.localLLMChat({
        message: message,
        max_length: 512,
        temperature: 0.7
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

  return (
    <div className="feature-container">
      <h2 className="feature-title">
        <Cpu size={28} style={{ marginRight: '10px' }} />
        Local LLM (Qwen 2.5B)
      </h2>

      <div style={{
        padding: '12px',
        background: 'rgba(102, 126, 234, 0.1)',
        border: '2px solid #667eea',
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        <Info size={20} style={{ marginRight: '8px', display: 'inline', color: '#667eea' }} />
        <span style={{ color: '#667eea' }}>
          Mô hình AI chạy local trên máy của bạn - không cần internet sau khi tải model
        </span>
      </div>

      {modelInfo && (
        <div style={{
          padding: '10px',
          background: 'rgba(40, 167, 69, 0.1)',
          border: '1px solid #28a745',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          <span style={{ color: '#28a745' }}>
            <strong>Model:</strong> {modelInfo.model} | <strong>Device:</strong> {modelInfo.device}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nhập tin nhắn của bạn..."
          rows="4"
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '2px solid #667eea',
            background: '#1a1a1a',
            color: 'white',
            fontSize: '16px',
            marginBottom: '12px',
            resize: 'vertical'
          }}
        />

        <button
          type="submit"
          disabled={loading || !message.trim()}
          style={{
            padding: '14px 28px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading || !message.trim() ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {loading ? (
            <>
              <Loader size={20} style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
              Đang xử lý...
            </>
          ) : (
            <>
              <Send size={20} style={{ marginRight: '8px' }} />
              Gửi
            </>
          )}
        </button>
      </form>

      {loading && <LoadingAnimation />}

      {error && (
        <div style={{
          padding: '16px',
          background: 'rgba(220, 53, 69, 0.1)',
          border: '2px solid #dc3545',
          borderRadius: '12px',
          color: '#dc3545',
          marginTop: '20px'
        }}>
          <AlertCircle size={20} style={{ marginRight: '8px', display: 'inline' }} />
          {error}
        </div>
      )}

      {response && (
        <div style={{
          padding: '20px',
          background: 'rgba(102, 126, 234, 0.1)',
          border: '2px solid #667eea',
          borderRadius: '12px',
          marginTop: '20px'
        }}>
          <h3 style={{ color: '#667eea', marginBottom: '12px' }}>
            <Cpu size={24} style={{ marginRight: '8px', display: 'inline' }} />
            Phản Hồi
          </h3>
          <div style={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            lineHeight: '1.6'
          }}>
            {response}
          </div>
          <AudioButton text={response} />
        </div>
      )}
    </div>
  );
};

export default LocalLLMFeature;
