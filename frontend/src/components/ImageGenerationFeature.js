import React, { useState } from 'react';
import { Wand2, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import LoadingAnimation from './LoadingAnimation';
import api from '../api';

const ImageGenerationFeature = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Vui lòng nhập mô tả');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.textToImage({ prompt, width, height });
      setResult(response);
      setLoading(false);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Lỗi không xác định';
      setError('Lỗi: ' + errorMsg);
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '1800px',
      margin: '0 auto',
      padding: '40px 20px'
    }}>
      {/* Header Section */}
      <div style={{
        textAlign: 'center',
        marginBottom: '50px'
      }}>
        <h1 style={{
          fontSize: '42px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '15px'
        }}>
          <Wand2 size={48} style={{ marginRight: '15px', display: 'inline-block', verticalAlign: 'middle', color: '#667eea' }} />
          Text to Image AI
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#888',
          maxWidth: '700px',
          margin: '0 auto'
        }}>
          Tạo hình ảnh từ mô tả văn bản bằng AI - Chỉ cần nhập mô tả và để AI tạo ra hình ảnh cho bạn
        </p>
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))',
        gap: '30px',
        marginBottom: '40px'
      }}>
        {/* Left Panel - Input */}
        <div style={{
          background: 'linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 100%)',
          borderRadius: '20px',
          padding: '35px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#fff',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Wand2 size={24} />
            Tạo Hình Ảnh
          </h3>
          <p style={{ color: '#888', marginBottom: '25px' }}>
            Nhập mô tả chi tiết về hình ảnh bạn muốn tạo
          </p>

          {/* Prompt Input */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '500'
            }}>
              Mô Tả Hình Ảnh
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ví dụ: a beautiful sunset over mountains, a cute cat wearing a hat, a futuristic city with flying cars..."
              style={{
                width: '100%',
                minHeight: '150px',
                padding: '15px',
                background: 'rgba(255,255,255,0.05)',
                border: '2px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '16px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            <p style={{ 
              color: '#888', 
              fontSize: '14px', 
              marginTop: '8px',
              fontStyle: 'italic'
            }}>
              💡 Mẹo: Mô tả càng chi tiết thì hình ảnh càng chính xác. Nên sử dụng tiếng Anh để có kết quả tốt nhất.
            </p>
          </div>

          {/* Size Controls */}
          <div style={{ 
            marginBottom: '25px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: '500'
              }}>
                Chiều Rộng: {width}px
              </label>
              <input
                type="range"
                min="256"
                max="2048"
                step="128"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: '500'
              }}>
                Chiều Cao: {height}px
              </label>
              <input
                type="range"
                min="256"
                max="2048"
                step="128"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              width: '100%',
              padding: '18px',
              background: loading 
                ? '#555'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: loading ? 'none' : '0 8px 32px rgba(102, 126, 234, 0.4)'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.transform = 'translateY(0)';
            }}
          >
            {loading ? (
              <>
                <Loader className="spin" size={20} />
                Đang Tạo Hình Ảnh...
              </>
            ) : (
              <>
                <Wand2 size={20} />
                Tạo Hình Ảnh
              </>
            )}
          </button>
        </div>

        {/* Right Panel - Result */}
        <div style={{
          background: 'linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 100%)',
          borderRadius: '20px',
          padding: '35px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.05)',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {loading && (
            <div style={{ textAlign: 'center' }}>
              <LoadingAnimation />
              <p style={{ color: '#888', marginTop: '20px', fontSize: '16px' }}>
                Đang tạo hình ảnh... Vui lòng đợi trong giây lát
              </p>
            </div>
          )}

          {error && (
            <div style={{
              padding: '20px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%'
            }}>
              <AlertCircle size={24} />
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          )}

          {result && (
            <div style={{ width: '100%' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                padding: '15px',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '12px',
                color: '#4ade80'
              }}>
                <CheckCircle size={24} />
                <p style={{ margin: 0, flex: 1 }}>Tạo hình ảnh thành công!</p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <img
                  src={`http://localhost:8000${result.image_url}`}
                  alt="Generated"
                  style={{
                    maxWidth: '100%',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    marginBottom: '20px'
                  }}
                />
                <a
                  href={`http://localhost:8000${result.image_url}`}
                  download
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Tải Xuống Hình Ảnh
                </a>
              </div>
            </div>
          )}

          {!loading && !error && !result && (
            <div style={{ textAlign: 'center', color: '#666' }}>
              <Wand2 size={64} style={{ marginBottom: '20px', opacity: 0.3 }} />
              <p style={{ fontSize: '16px' }}>Hình ảnh được tạo sẽ hiển thị ở đây</p>
              <p style={{ fontSize: '14px', marginTop: '10px', color: '#555' }}>
                Nhập mô tả và nhấn "Tạo Hình Ảnh" để bắt đầu
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Examples Section */}
      <div style={{
        background: 'linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 100%)',
        borderRadius: '20px',
        padding: '35px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#fff',
          marginBottom: '20px'
        }}>
          💡 Ví Dụ Mô Tả
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px'
        }}>
          {[
            "a beautiful sunset over mountains with orange sky",
            "a cute cat wearing a wizard hat, digital art",
            "a futuristic city with flying cars at night",
            "a serene lake surrounded by autumn trees",
            "a cozy coffee shop interior with warm lighting",
            "a majestic dragon flying over castle ruins"
          ].map((example, index) => (
            <button
              key={index}
              onClick={() => setPrompt(example)}
              style={{
                padding: '15px',
                background: 'rgba(255,255,255,0.05)',
                border: '2px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#aaa',
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                e.target.style.borderColor = '#667eea';
                e.target.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.05)';
                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                e.target.style.color = '#aaa';
              }}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerationFeature;
