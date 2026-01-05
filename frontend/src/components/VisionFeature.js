import React, { useState } from 'react';
import { Upload, Eye, FileText, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import LoadingAnimation from './LoadingAnimation';
import AudioButton from './AudioButton';
import api from '../api';

const VisionFeature = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadedFilename, setUploadedFilename] = useState(null);
  const [action, setAction] = useState('vqa'); // 'vqa', 'ocr_easyocr', or 'ocr_paddle'
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
      setResult(null);
    } else {
      setError('Vui lòng chọn file ảnh hợp lệ');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn ảnh');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await api.uploadImage(selectedFile);
      setUploadedFilename(response.filename);
      setUploading(false);
    } catch (err) {
      setError('Lỗi upload ảnh: ' + (err.response?.data?.detail || err.message));
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFilename) {
      setError('Vui lòng upload ảnh trước');
      return;
    }

    if (action === 'vqa' && !question.trim()) {
      setError('Vui lòng nhập câu hỏi');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.visionAnalysis({
        action,
        image_filename: uploadedFilename,
        question: action === 'vqa' ? question : undefined
      });

      // Check if result contains error
      if (response.result && response.result.success === false) {
        setError('Lỗi: ' + (response.result.error || 'Không thể phân tích ảnh'));
      } else {
        setResult(response.result);
      }
      setLoading(false);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Lỗi không xác định';
      setError('Lỗi phân tích: ' + errorMsg);
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
          <Eye size={48} style={{ marginRight: '15px', display: 'inline-block', verticalAlign: 'middle', color: '#667eea' }} />
          Vision AI Analysis
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#888',
          maxWidth: '700px',
          margin: '0 auto'
        }}>
          Phân tích hình ảnh thông minh với AI - Hỏi đáp về hình ảnh hoặc trích xuất văn bản tự động
        </p>
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))',
        gap: '30px',
        marginBottom: '40px'
      }}>
        {/* Left Panel - Upload & Actions */}
        <div style={{
          background: 'linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 100%)',
          borderRadius: '20px',
          padding: '35px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          {/* Action Selector */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#fff',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#667eea',
                marginRight: '12px',
                display: 'inline-block'
              }}></span>
              Chọn Chức Năng
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '15px'
            }}>
              <button
                onClick={() => setAction('vqa')}
                style={{
                  padding: '18px 20px',
                  borderRadius: '12px',
                  border: action === 'vqa' ? '2px solid #667eea' : '2px solid transparent',
                  background: action === 'vqa' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : 'rgba(255,255,255,0.05)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transform: action === 'vqa' ? 'translateY(-2px)' : 'none',
                  boxShadow: action === 'vqa' ? '0 8px 24px rgba(102, 126, 234, 0.4)' : 'none'
                }}
              >
                <Eye size={24} />
                <span>Hỏi Đáp VQA</span>
              </button>
              <button
                onClick={() => setAction('ocr_easyocr')}
                style={{
                  padding: '18px 20px',
                  borderRadius: '12px',
                  border: action === 'ocr_easyocr' ? '2px solid #667eea' : '2px solid transparent',
                  background: action === 'ocr_easyocr'
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : 'rgba(255,255,255,0.05)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transform: action === 'ocr_easyocr' ? 'translateY(-2px)' : 'none',
                  boxShadow: action === 'ocr_easyocr' ? '0 8px 24px rgba(102, 126, 234, 0.4)' : 'none'
                }}
              >
                <FileText size={24} />
                <span>EasyOCR</span>
              </button>
              <button
                onClick={() => setAction('ocr_paddle')}
                style={{
                  padding: '18px 20px',
                  borderRadius: '12px',
                  border: action === 'ocr_paddle' ? '2px solid #667eea' : '2px solid transparent',
                  background: action === 'ocr_paddle'
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : 'rgba(255,255,255,0.05)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transform: action === 'ocr_paddle' ? 'translateY(-2px)' : 'none',
                  boxShadow: action === 'ocr_paddle' ? '0 8px 24px rgba(102, 126, 234, 0.4)' : 'none'
                }}
              >
                <FileText size={24} />
                <span>PaddleOCR</span>
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#fff',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#667eea',
                marginRight: '12px',
                display: 'inline-block'
              }}></span>
              Tải Lên Hình Ảnh
            </h3>
            <label style={{
              display: 'block',
              padding: '50px 20px',
              background: 'rgba(102, 126, 234, 0.1)',
              border: '2px dashed #667eea',
              borderRadius: '16px',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <Upload size={48} style={{ color: '#667eea', marginBottom: '15px' }} />
              <p style={{ color: '#fff', fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                {selectedFile ? selectedFile.name : 'Click để chọn ảnh'}
              </p>
              <p style={{ color: '#888', fontSize: '14px' }}>
                Hỗ trợ: JPG, PNG, GIF, WEBP
              </p>
            </label>
          </div>

          {/* Upload Button */}
          {selectedFile && !uploadedFilename && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              style={{
                width: '100%',
                padding: '16px',
                background: uploading 
                  ? 'rgba(102, 126, 234, 0.5)' 
                  : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: uploading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 8px 24px rgba(79, 172, 254, 0.4)',
                marginBottom: '20px'
              }}
            >
              {uploading ? (
                <>
                  <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  Đang tải...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Xác Nhận Tải Lên
                </>
              )}
            </button>
          )}

          {/* Question Input for VQA */}
          {action === 'vqa' && uploadedFilename && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#fff',
                marginBottom: '15px'
              }}>
                Câu Hỏi Về Hình Ảnh
              </h3>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What is in this image? (English)"
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: '2px solid rgba(102, 126, 234, 0.3)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.border = '2px solid #667eea';
                  e.target.style.background = 'rgba(255,255,255,0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '2px solid rgba(102, 126, 234, 0.3)';
                  e.target.style.background = 'rgba(255,255,255,0.05)';
                }}
              />
            </div>
          )}

          {/* Analyze Button */}
          {uploadedFilename && (
            <button
              onClick={handleAnalyze}
              disabled={loading || (action === 'vqa' && !question.trim())}
              style={{
                width: '100%',
                padding: '18px',
                background: loading || (action === 'vqa' && !question.trim())
                  ? 'rgba(102, 126, 234, 0.3)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: (loading || (action === 'vqa' && !question.trim())) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading && !(action === 'vqa' && !question.trim())) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(102, 126, 234, 0.6)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.5)';
              }}
            >
              {loading ? (
                <>
                  <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
                  Đang phân tích...
                </>
              ) : (
                <>
                  {action === 'vqa' ? <Eye size={24} /> : <FileText size={24} />}
                  {action === 'vqa' ? 'Phân Tích Hình Ảnh' : 'Trích Xuất Văn Bản'}
                </>
              )}
            </button>
          )}
        </div>

        {/* Right Panel - Preview & Results */}
        <div style={{
          background: 'linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 100%)',
          borderRadius: '20px',
          padding: '35px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.05)',
          minHeight: '600px'
        }}>
          {/* Preview */}
          {preview && (
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#fff',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#667eea',
                  marginRight: '12px',
                  display: 'inline-block'
                }}></span>
                Xem Trước
              </h3>
              <div style={{
                borderRadius: '16px',
                overflow: 'hidden',
                border: '3px solid rgba(102, 126, 234, 0.3)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
              }}>
                <img
                  src={preview}
                  alt="Preview"
                  style={{
                    width: '100%',
                    display: 'block',
                    maxHeight: '400px',
                    objectFit: 'contain',
                    background: '#000'
                  }}
                />
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <LoadingAnimation />
              <p style={{ color: '#667eea', fontSize: '18px', fontWeight: '600', marginTop: '20px' }}>
                Đang xử lý bằng AI...
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              padding: '20px 24px',
              background: 'rgba(220, 53, 69, 0.15)',
              border: '2px solid rgba(220, 53, 69, 0.5)',
              borderRadius: '16px',
              color: '#ff6b6b',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '15px'
            }}>
              <AlertCircle size={24} />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Results - Full Width Section */}
      {result && result.success && !loading && (
        <div style={{
          background: 'linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 100%)',
          borderRadius: '20px',
          padding: '50px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.05)',
          marginBottom: '40px'
        }}>
          {/* Results */}
          {result && result.success && !loading && (
            <div style={{
              background: 'rgba(40, 167, 69, 0.1)',
              border: '2px solid rgba(40, 167, 69, 0.4)',
              borderRadius: '16px',
              padding: '30px',
              animation: 'fadeIn 0.5s ease-in'
            }}>
              <h3 style={{
                color: '#28a745',
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '25px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <CheckCircle size={32} />
                Kết Quả Phân Tích
              </h3>
              
              {action === 'vqa' ? (
                <div>
                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '15px'
                  }}>
                    <p style={{ color: '#888', fontSize: '14px', marginBottom: '8px', fontWeight: '600' }}>
                      CÂU HỎI:
                    </p>
                    <p style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>
                      {result.question}
                    </p>
                  </div>
                  <div style={{
                    background: 'rgba(40, 167, 69, 0.15)',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '20px'
                  }}>
                    <p style={{ color: '#888', fontSize: '14px', marginBottom: '8px', fontWeight: '600' }}>
                      TRẢ LỜI:
                    </p>
                    <p style={{ color: '#fff', fontSize: '18px', fontWeight: '600', lineHeight: '1.6' }}>
                      {result.answer}
                    </p>
                  </div>
                  <AudioButton text={result.answer} />
                </div>
              ) : (
                <div>
                  {result.output_images && result.output_images.length > 0 ? (
                    <div>
                      <p style={{ color: '#fff', fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
                        🖼️ Hình ảnh đã phân tích ({result.model}):
                      </p>
                      {result.output_images.map((imgPath, idx) => (
                        <img 
                          key={idx}
                          src={`http://localhost:8000/${imgPath.replace(/\\/g, '/')}`}
                          alt={`OCR Result ${idx + 1}`}
                          style={{
                            width: '100%',
                            maxHeight: 'none',
                            height: 'auto',
                            borderRadius: '16px',
                            border: '4px solid #28a745',
                            boxShadow: '0 20px 60px rgba(40, 167, 69, 0.6)',
                            marginBottom: '30px',
                            objectFit: 'contain',
                            background: '#000',
                            transform: 'scale(1.05)',
                            cursor: 'zoom-in',
                            transition: 'all 0.3s ease'
                          }}
                          onClick={(e) => {
                            if (e.target.style.transform === 'scale(1.5)') {
                              e.target.style.transform = 'scale(1.05)';
                              e.target.style.cursor = 'zoom-in';
                              e.target.style.position = 'relative';
                              e.target.style.zIndex = '1';
                            } else {
                              e.target.style.transform = 'scale(1.5)';
                              e.target.style.cursor = 'zoom-out';
                              e.target.style.position = 'relative';
                              e.target.style.zIndex = '999';
                            }
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div>
                      <p style={{ color: '#fff', fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>
                        📄 Văn bản trích xuất ({result.model || 'OCR'}):
                      </p>
                      <pre style={{
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        background: 'rgba(0,0,0,0.4)',
                        padding: '20px',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '15px',
                        lineHeight: '1.8',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        {result.text}
                      </pre>
                      <div style={{ marginTop: '20px' }}>
                        <AudioButton text={result.text} />
                      </div>
                    </div>
                  )}
                  
                  {result.lines && result.lines.length > 0 && (
                    <div style={{ marginTop: '25px' }}>
                      <p style={{ color: '#fff', fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>
                        📊 Chi tiết phát hiện:
                      </p>
                      <div style={{
                        background: 'rgba(0,0,0,0.3)',
                        padding: '15px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        {result.lines.map((line, idx) => (
                          <div key={idx} style={{
                            padding: '10px',
                            marginBottom: '8px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <span style={{ color: '#fff', flex: 1 }}>{line.text}</span>
                            <span style={{
                              color: '#28a745',
                              fontWeight: '600',
                              fontSize: '13px',
                              marginLeft: '15px',
                              background: 'rgba(40, 167, 69, 0.2)',
                              padding: '4px 12px',
                              borderRadius: '20px'
                            }}>
                              {Math.round(line.confidence * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default VisionFeature;
