import React, { useState } from 'react';
import { Wand2, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import LoadingAnimation from './LoadingAnimation';
import api from '../api';

const ImageGenerationFeature = () => {
  // --- PHẦN LOGIC GIỮ NGUYÊN KHÔNG ĐỤNG CHẠM ---
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
  // -------------------------------------------

  // --- PHẦN GIAO DIỆN ĐƯỢC CHỈNH SỬA ---
  const theme = {
    bgMain: '#0f172a', // Nền tối sâu hơn
    bgCard: '#1e293b', // Nền card phẳng hơn, bớt gradient
    bgInput: '#334155', // Nền input
    textLight: '#f1f5f9',
    textGray: '#94a3b8',
    accent: '#6366f1', // Màu nhấn indigo hiện đại
    accentHover: '#4f46e5',
    border: '1px solid rgba(255,255,255,0.08)',
    shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
    radius: '12px'
  };

  return (
    <div style={{
      maxWidth: '1200px', // GIẢM KÍCH THƯỚC TỔNG TỪ 1800px xuống 1200px
      margin: '0 auto',
      padding: '30px 20px',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif', // Font chữ hiện đại hơn
      color: theme.textLight,
      backgroundColor: theme.bgMain,
      minHeight: '100vh'
    }}>
      {/* Header Section - Gọn hơn */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{
          fontSize: '32px', // Giảm font size tiêu đề
          fontWeight: '700',
          color: theme.textLight,
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          <Wand2 size={32} style={{ color: theme.accent }} />
          Text to Image AI
        </h1>
        <p style={{
          fontSize: '16px',
          color: theme.textGray,
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Biến ý tưởng thành hình ảnh chỉ trong vài giây với công nghệ AI.
        </p>
      </div>

      {/* Main Content Grid - Cân đối lại */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', // Giảm minmax để layout linh hoạt hơn trên laptop
        gap: '25px',
        marginBottom: '30px',
        alignItems: 'start'
      }}>
        {/* Left Panel - Input */}
        <div style={{
          background: theme.bgCard,
          borderRadius: theme.radius,
          padding: '25px', // Giảm padding
          boxShadow: theme.shadow,
          border: theme.border
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: theme.textLight,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Wand2 size={20} color={theme.accent} />
            Tạo Hình Ảnh Mới
          </h3>

          {/* Prompt Input */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: theme.textLight,
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Mô tả ý tưởng của bạn (Prompt)
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ví dụ: a futuristic city with flying cars at night, cyberpunk style, highly detailed..."
              style={{
                width: '100%',
                minHeight: '120px', // Giảm chiều cao mặc định
                padding: '12px',
                background: theme.bgInput,
                border: theme.border,
                borderRadius: '8px',
                color: theme.textLight,
                fontSize: '14px',
                resize: 'vertical',
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = theme.accent}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
            <p style={{
              color: theme.textGray,
              fontSize: '12px',
              marginTop: '6px',
            }}>
              Mẹo: Sử dụng tiếng Anh và mô tả chi tiết để có kết quả tốt nhất.
            </p>
          </div>

          {/* Size Controls - Gọn gàng hơn */}
          <div style={{
            marginBottom: '25px',
            background: 'rgba(0,0,0,0.1)',
            padding: '15px',
            borderRadius: '8px'
          }}>
             <label style={{
              display: 'block',
              marginBottom: '15px',
              color: theme.textLight,
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Kích thước ảnh
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '12px', color: theme.textGray }}>
                  <span>Chiều Rộng</span>
                  <span style={{ color: theme.accent, fontWeight: '600' }}>{width}px</span>
                </div>
                <input
                  type="range"
                  min="256"
                  max="2048"
                  step="128"
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: theme.accent }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '12px', color: theme.textGray }}>
                  <span>Chiều Cao</span>
                  <span style={{ color: theme.accent, fontWeight: '600' }}>{height}px</span>
                </div>
                <input
                  type="range"
                  min="256"
                  max="2048"
                  step="128"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: theme.accent }}
                />
              </div>
            </div>
          </div>

          {/* Generate Button - Hiện đại hơn */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading
                ? theme.bgInput
                : theme.accent, // Sử dụng màu solid thay vì gradient sến
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: loading ? 'none' : `0 4px 12px ${theme.accent}40` // Shadow màu accent nhẹ
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.background = theme.accentHover;
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.background = theme.accent;
            }}
          >
            {loading ? (
              <>
                <Loader className="spin" size={20} />
                Đang khởi tạo...
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
          background: theme.bgCard,
          borderRadius: theme.radius,
          padding: '25px',
          boxShadow: theme.shadow,
          border: theme.border,
          minHeight: '450px', // Tăng nhẹ chiều cao tối thiểu
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {loading && (
            <div style={{ textAlign: 'center' }}>
              <LoadingAnimation />
              <p style={{ color: theme.textGray, marginTop: '20px', fontSize: '14px' }}>
                AI đang vẽ, vui lòng đợi một chút...
              </p>
            </div>
          )}

          {error && (
            <div style={{
              padding: '15px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              fontSize: '14px'
            }}>
              <AlertCircle size={20} />
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          )}

          {result && (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#000',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '20px',
                border: theme.border
              }}>
                <img
                  src={`http://localhost:8000${result.image_url}`}
                  alt="Generated"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '400px',
                    objectFit: 'contain', // Đảm bảo ảnh không bị méo
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                 <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#4ade80',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    <CheckCircle size={18} />
                    <span>Hoàn tất!</span>
                  </div>

                <a
                  href={`http://localhost:8000${result.image_url}`}
                  download
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '10px 20px',
                    background: theme.bgInput,
                    color: theme.textLight,
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: '500',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                    border: theme.border
                  }}
                   onMouseEnter={(e) => {
                      e.target.style.background = theme.accent;
                      e.target.style.borderColor = theme.accent;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = theme.bgInput;
                       e.target.style.borderColor = theme.border;
                    }}
                >
                  Tải Xuống
                </a>
              </div>
            </div>
          )}

          {!loading && !error && !result && (
            <div style={{ textAlign: 'center', color: theme.textGray }}>
              <Wand2 size={48} style={{ marginBottom: '15px', opacity: 0.2 }} />
              <p style={{ fontSize: '16px', fontWeight: '500', color: theme.textLight }}>Chưa có hình ảnh</p>
              <p style={{ fontSize: '14px', marginTop: '5px' }}>
                Nhập mô tả và nhấn nút tạo để bắt đầu
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Examples Section - Gọn gàng hơn dạng Chips/Tags */}
      <div style={{
        background: theme.bgCard,
        borderRadius: theme.radius,
        padding: '25px',
        boxShadow: theme.shadow,
        border: theme.border
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: theme.textLight,
          marginBottom: '15px'
        }}>
          💡 Gợi ý nhanh
        </h3>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap', // Thay đổi từ grid sang flex wrap để giống dạng tags
          gap: '10px'
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
                padding: '8px 16px', // Padding nhỏ hơn
                background: theme.bgInput,
                border: theme.border,
                borderRadius: '20px', // Bo tròn kiểu chip/tag
                color: theme.textGray,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = theme.accent;
                e.target.style.color = '#fff';
                e.target.style.borderColor = theme.accent;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = theme.bgInput;
                e.target.style.color = theme.textGray;
                 e.target.style.borderColor = theme.border;
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