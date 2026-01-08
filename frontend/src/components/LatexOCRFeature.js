import React, { useState, useEffect } from 'react';
import { Upload, FileText, Loader, AlertCircle, CheckCircle, Play, Square, Activity } from 'lucide-react';
import LoadingAnimation from './LoadingAnimation';
import api from '../api';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const LatexOCRFeature = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadedFilename, setUploadedFilename] = useState(null);
  const [latexCode, setLatexCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [serviceStatus, setServiceStatus] = useState('unknown'); // 'running', 'stopped', 'starting', 'unknown'
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Check service status on mount
  useEffect(() => {
    checkServiceHealth();
    
    // Add paste event listener
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            setSelectedFile(blob);
            setPreview(URL.createObjectURL(blob));
            setError(null);
            setLatexCode('');
            
            // Show notification
            const notification = document.createElement('div');
            notification.textContent = '✓ Ảnh đã được paste! Click "Upload Ảnh" để tiếp tục.';
            notification.style.cssText = `
              position: fixed;
              top: 20px;
              right: 20px;
              background: linear-gradient(135deg, #51cf66 0%, #37b24d 100%);
              color: white;
              padding: 15px 25px;
              border-radius: 10px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.3);
              z-index: 10000;
              font-weight: 600;
              animation: slideIn 0.3s ease-out;
            `;
            document.body.appendChild(notification);
            setTimeout(() => {
              notification.style.animation = 'slideOut 0.3s ease-out';
              setTimeout(() => notification.remove(), 300);
            }, 3000);
            
            e.preventDefault();
            break;
          }
        }
      }
    };
    
    document.addEventListener('paste', handlePaste);
    
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  const checkServiceHealth = async () => {
    setCheckingStatus(true);
    try {
      const response = await fetch('http://localhost:8000/latex-ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_filename: '',
          action: 'health_check'
        })
      });
      
      const data = await response.json();
      if (data.health && data.health.ready) {
        setServiceStatus('running');
      } else {
        setServiceStatus('stopped');
      }
    } catch (err) {
      setServiceStatus('stopped');
    }
    setCheckingStatus(false);
  };

  const handleStartService = async () => {
    setServiceStatus('starting');
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/latex-ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_filename: '',
          action: 'start_service'
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setServiceStatus('running');
        setError(null);
      } else {
        setServiceStatus('stopped');
        setError(data.message || 'Không thể khởi động service');
      }
    } catch (err) {
      setServiceStatus('stopped');
      setError('Lỗi khởi động service: ' + err.message);
    }
  };

  const handleStopService = async () => {
    setServiceStatus('stopping');
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/latex-ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_filename: '',
          action: 'stop_service'
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setServiceStatus('stopped');
      } else {
        setError(data.message || 'Không thể dừng service');
      }
    } catch (err) {
      setError('Lỗi dừng service: ' + err.message);
    }
  };
    const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreview(null);
    setUploadedFilename(null);
    setLatexCode('');
    setError(null);
    };
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
      setLatexCode('');
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

  const handleConvert = async () => {
    if (!uploadedFilename) {
      setError('Vui lòng upload ảnh trước');
      return;
    }

    setLoading(true);
    setError(null);
    setLatexCode('');

    try {
      const response = await fetch('http://localhost:8000/latex-ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_filename: uploadedFilename,
          action: 'convert'
        })
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setLatexCode(data.latex_code);
      } else {
        setError(data.detail || data.message || 'Không thể chuyển đổi ảnh');
      }
      setLoading(false);
    } catch (err) {
      setError('Lỗi chuyển đổi: ' + err.message);
      setLoading(false);
    }
  };

  const renderLatex = (latex) => {
    try {
      // Check if it's display mode (starts with \[) or inline mode
      if (latex.trim().startsWith('\\[') || latex.trim().startsWith('$$')) {
        const cleaned = latex.replace(/^\\\[/, '').replace(/\\\]$/, '').replace(/^\$\$/, '').replace(/\$\$$/, '');
        return <BlockMath math={cleaned} />;
      } else {
        return <InlineMath math={latex} />;
      }
    } catch (err) {
      return <span style={{ color: '#ff6b6b' }}>Lỗi render LaTeX: {err.message}</span>;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(latexCode);
    alert('Đã copy LaTeX code!');
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
          <FileText size={48} style={{ marginRight: '15px', display: 'inline-block', verticalAlign: 'middle', color: '#667eea' }} />
          LaTeX OCR
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#888',
          maxWidth: '700px',
          margin: '0 auto'
        }}>
          Chuyển đổi ảnh công thức toán học thành LaTeX code tự động
        </p>
        <p style={{
          fontSize: '14px',
          color: '#667eea',
          marginTop: '10px',
          fontWeight: '600'
        }}>
          💡 Tip: Screenshot (Win+Shift+S) và paste (Ctrl+V) để nhanh hơn!
        </p>
      </div>

      {/* Service Status Panel */}
      <div style={{
        background: 'linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 100%)',
        borderRadius: '20px',
        padding: '25px',
        marginBottom: '30px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Activity size={24} style={{ color: '#667eea' }} />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '5px' }}>
              Trạng thái Service
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: serviceStatus === 'running' ? '#51cf66' : serviceStatus === 'starting' || serviceStatus === 'stopping' ? '#ffd43b' : '#ff6b6b',
                display: 'inline-block'
              }}></span>
              <span style={{ color: '#aaa', fontSize: '14px' }}>
                {serviceStatus === 'running' ? 'Đang chạy' : 
                 serviceStatus === 'starting' ? 'Đang khởi động...' :
                 serviceStatus === 'stopping' ? 'Đang dừng...' :
                 'Đã dừng'}
              </span>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {serviceStatus !== 'running' && serviceStatus !== 'starting' && (
            <button
              onClick={handleStartService}
              disabled={checkingStatus}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              <Play size={18} />
              Khởi động Service
            </button>
          )}
          
          {serviceStatus === 'running' && (
            <button
              onClick={handleStopService}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              <Square size={18} />
              Dừng Service
            </button>
          )}
          
          <button
            onClick={checkServiceHealth}
            disabled={checkingStatus}
            style={{
              padding: '12px 24px',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {checkingStatus ? <Loader size={18} className="spin" /> : 'Kiểm tra'}
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))',
        gap: '30px',
        marginBottom: '40px'
      }}>
        {/* Left Panel - Upload & Convert */}
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
            marginBottom: '25px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#667eea',
              marginRight: '12px'
            }}></span>
            Upload Ảnh Công Thức
          </h3>

          {/* File Upload */}
          <div
            onClick={() => document.getElementById('file-input').click()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file && file.type.startsWith('image/')) {
                setSelectedFile(file);
                setPreview(URL.createObjectURL(file));
                setError(null);
                setLatexCode('');
              }
            }}
            onDragOver={(e) => e.preventDefault()}
            style={{
              border: '2px dashed rgba(255,255,255,0.2)',
              borderRadius: '15px',
              padding: '40px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: preview ? 'rgba(0,0,0,0.2)' : 'transparent',
              marginBottom: '25px'
            }}
          >
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  borderRadius: '10px'
                }}
              />
            ) : (
              <>
                <Upload size={48} style={{ color: '#667eea', marginBottom: '15px' }} />
                <p style={{ color: '#aaa', fontSize: '16px', marginBottom: '10px' }}>
                  Click để chọn ảnh hoặc kéo thả vào đây
                </p>
                <p style={{ color: '#667eea', fontSize: '14px', fontWeight: '600' }}>
                  📋 Hoặc paste (Ctrl+V) ảnh từ clipboard
                </p>
              </>
            )}
          </div>

          {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '15px', flexDirection: 'column' }}>
            <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                style={{
                padding: '16px',
                background: selectedFile && !uploading ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: selectedFile && !uploading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.3s ease'
                }}
            >
                {uploading ? (
                <>
                    <Loader size={20} className="spin" />
                    Đang upload...
                </>
                ) : (
                <>
                    <Upload size={20} />
                    Upload Ảnh
                </>
                )}
            </button>

            {/* Nút Xóa Ảnh */}
            {selectedFile && (
                <button
                onClick={handleRemoveImage}
                style={{
                    padding: '16px',
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'all 0.3s ease'
                }}
                >
                Xóa Ảnh
                </button>
            )}

            <button
                onClick={handleConvert}
                disabled={!uploadedFilename || loading || serviceStatus !== 'running'}
                style={{
                padding: '16px',
                background: uploadedFilename && !loading && serviceStatus === 'running' 
                    ? 'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)' 
                    : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: uploadedFilename && !loading && serviceStatus === 'running' ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.3s ease'
                }}
            >
                {loading ? (
                <>
                    <Loader size={20} className="spin" />
                    Đang chuyển đổi...
                </>
                ) : (
                <>
                    <FileText size={20} />
                    Chuyển đổi sang LaTeX
                </>
                )}
            </button>
            </div>

          {serviceStatus !== 'running' && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              borderRadius: '10px',
              color: '#ffd43b',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={18} />
              Service chưa khởi động. Vui lòng khởi động service trước khi chuyển đổi.
            </div>
          )}
        </div>

        {/* Right Panel - Results */}
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
            marginBottom: '25px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#51cf66',
              marginRight: '12px'
            }}></span>
            Kết Quả
          </h3>

          {loading && <LoadingAnimation />}

          {error && (
            <div style={{
              padding: '20px',
              background: 'rgba(255, 107, 107, 0.1)',
              border: '1px solid rgba(255, 107, 107, 0.3)',
              borderRadius: '12px',
              color: '#ff6b6b',
              display: 'flex',
              alignItems: 'start',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '14px' }}>{error}</div>
            </div>
          )}

          {latexCode && (
            <>
              {/* LaTeX Code */}
              <div style={{ marginBottom: '30px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '15px'
                }}>
                  <h4 style={{ color: '#aaa', fontSize: '14px', fontWeight: '600' }}>
                    LaTeX Code:
                  </h4>
                  <button
                    onClick={copyToClipboard}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Copy Code
                  </button>
                </div>
                <pre style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '20px',
                  borderRadius: '10px',
                  color: '#51cf66',
                  fontSize: '14px',
                  overflowX: 'auto',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word'
                }}>
                  {latexCode}
                </pre>
              </div>

              {/* Rendered Math */}
              <div>
                <h4 style={{ color: '#aaa', fontSize: '14px', fontWeight: '600', marginBottom: '15px' }}>
                  Preview:
                </h4>
                <div style={{
                  background: 'white',
                  padding: '30px',
                  borderRadius: '10px',
                  minHeight: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  {renderLatex(latexCode)}
                </div>
              </div>
            </>
          )}

          {!loading && !error && !latexCode && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#666'
            }}>
              <FileText size={48} style={{ marginBottom: '15px', opacity: 0.3 }} />
              <p>Chờ kết quả chuyển đổi...</p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        background: 'linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 100%)',
        borderRadius: '20px',
        padding: '35px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#fff',
          marginBottom: '20px'
        }}>
          📖 Hướng dẫn sử dụng
        </h3>
        <ul style={{
          color: '#aaa',
          fontSize: '15px',
          lineHeight: '1.8',
          paddingLeft: '20px'
        }}>
          <li><strong style={{ color: '#667eea' }}>Cách nhanh:</strong> Screenshot công thức (Win+Shift+S hoặc Snipping Tool) → Paste (Ctrl+V) vào trang → Upload → Chuyển đổi</li>
          <li>Bước 1: Khởi động service bằng nút "Khởi động Service" (chỉ cần làm 1 lần)</li>
          <li>Bước 2: Chọn ảnh hoặc paste từ clipboard (Ctrl+V sau khi screenshot)</li>
          <li>Bước 3: Click "Upload Ảnh" để tải ảnh lên server</li>
          <li>Bước 4: Click "Chuyển đổi sang LaTeX" để nhận mã LaTeX</li>
          <li>Bước 5: Copy LaTeX code hoặc xem preview trực tiếp</li>
          <li>💡 <strong>Phím tắt Windows:</strong> Win+Shift+S (Snip & Sketch), Ctrl+V (Paste)</li>
          <li>Lưu ý: Service sẽ tự động khởi động khi cần thiết (có thể mất vài giây lần đầu)</li>
          <li>Tip: Ảnh càng rõ ràng, kết quả càng chính xác</li>
        </ul>
      </div>
    </div>
  );
};

export default LatexOCRFeature;
