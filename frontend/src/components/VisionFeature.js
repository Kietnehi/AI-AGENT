import React, { useState } from 'react';
import { Upload, Eye, FileText, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import LoadingAnimation from './LoadingAnimation';
import AudioButton from './AudioButton';
import api from '../api';

const VisionFeature = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadedFilename, setUploadedFilename] = useState(null);
  const [action, setAction] = useState('vqa'); // 'vqa', 'ocr_deepseek', or 'ocr_paddle'
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
    <div className="feature-container">
      <h2 className="feature-title">
        <Eye size={28} style={{ marginRight: '10px' }} />
        Phân Tích Hình Ảnh (Vision AI)
      </h2>

      {/* Action Selection */}
      <div className="action-selector" style={{ marginBottom: '20px' }}>
        <button
          className={`action-btn ${action === 'vqa' ? 'active' : ''}`}
          onClick={() => setAction('vqa')}
          style={{
            padding: '10px 20px',
            margin: '5px',
            borderRadius: '8px',
            border: action === 'vqa' ? '2px solid #667eea' : '2px solid transparent',
            background: action === 'vqa' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#2d2d2d',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          <Eye size={20} style={{ marginRight: '8px', display: 'inline' }} />
          Hỏi Đáp Về Ảnh (VQA)
        </button>
        <button
          className={`action-btn ${action === 'ocr_deepseek' ? 'active' : ''}`}
          onClick={() => setAction('ocr_deepseek')}
          style={{
            padding: '10px 20px',
            margin: '5px',
            borderRadius: '8px',
            border: action === 'ocr_deepseek' ? '2px solid #667eea' : '2px solid transparent',
            background: action === 'ocr_deepseek' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#2d2d2d',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          <FileText size={20} style={{ marginRight: '8px', display: 'inline' }} />
          OCR AI (DeepSeek or TrOCR)
        </button>
        <button
          className={`action-btn ${action === 'ocr_paddle' ? 'active' : ''}`}
          onClick={() => setAction('ocr_paddle')}
          style={{
            padding: '10px 20px',
            margin: '5px',
            borderRadius: '8px',
            border: action === 'ocr_paddle' ? '2px solid #667eea' : '2px solid transparent',
            background: action === 'ocr_paddle' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#2d2d2d',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          <FileText size={20} style={{ marginRight: '8px', display: 'inline' }} />
          OCR Tiếng Việt (Paddle)
        </button>
      </div>

      {/* File Upload */}
      <div className="upload-section" style={{ marginBottom: '20px' }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="vision-file-input"
        />
        <label
          htmlFor="vision-file-input"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '8px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          <Upload size={20} style={{ marginRight: '8px', display: 'inline' }} />
          Chọn Ảnh
        </label>

        {selectedFile && (
          <button
            onClick={handleUpload}
            disabled={uploading || uploadedFilename}
            style={{
              padding: '12px 24px',
              background: uploadedFilename ? '#28a745' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: uploading || uploadedFilename ? 'not-allowed' : 'pointer',
              opacity: uploading || uploadedFilename ? 0.6 : 1
            }}
          >
            {uploading ? 'Đang tải...' : uploadedFilename ? '✓ Đã tải lên' : 'Tải Lên'}
          </button>
        )}
      </div>

      {/* Image Preview */}
      {preview && (
        <div style={{ marginBottom: '20px' }}>
          <img
            src={preview}
            alt="Preview"
            style={{
              maxWidth: '100%',
              maxHeight: '400px',
              borderRadius: '12px',
              border: '2px solid #667eea'
            }}
          />
        </div>
      )}

      {/* Question Input for VQA */}
      {action === 'vqa' && uploadedFilename && (
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Nhập câu hỏi về ảnh (tiếng Anh)..."
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '2px solid #667eea',
              background: '#1a1a1a',
              color: 'white',
              fontSize: '16px'
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
            padding: '14px 28px',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            width: '100%',
            marginBottom: '20px'
          }}
        >
          {loading ? (
            <>
              <Loader size={20} style={{ marginRight: '8px', display: 'inline', animation: 'spin 1s linear infinite' }} />
              Đang phân tích...
            </>
          ) : (
            <>
              {action === 'vqa' ? 'Trả Lời Câu Hỏi' : 'Trích Xuất Văn Bản'}
            </>
          )}
        </button>
      )}

      {/* Loading Animation */}
      {loading && <LoadingAnimation />}

      {/* Error Message */}
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

      {/* Result */}
      {result && result.success && (
        <div style={{
          padding: '20px',
          background: 'rgba(40, 167, 69, 0.1)',
          border: '2px solid #28a745',
          borderRadius: '12px',
          marginTop: '20px'
        }}>
          <h3 style={{ color: '#28a745', marginBottom: '12px' }}>
            <CheckCircle size={24} style={{ marginRight: '8px', display: 'inline' }} />
            Kết Quả
          </h3>
          {action === 'vqa' ? (
            <div>
              <p style={{ marginBottom: '8px' }}><strong>Câu hỏi:</strong> {result.question}</p>
              <p><strong>Trả lời:</strong> {result.answer}</p>
              <AudioButton text={result.answer} />
            </div>
          ) : (
            <div>
              <p><strong>Văn bản trích xuất ({result.model || 'OCR'}):</strong></p>
              <pre style={{
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                background: '#1a1a1a',
                padding: '12px',
                borderRadius: '8px',
                marginTop: '10px',
                color: '#ffffff',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                {result.text}
              </pre>
              {result.lines && result.lines.length > 0 && (
                <div style={{ marginTop: '15px' }}>
                  <p><strong>Chi tiết phát hiện:</strong></p>
                  <ul style={{ color: '#ffffff' }}>
                    {result.lines.map((line, idx) => (
                      <li key={idx}>
                        {line.text} 
                        <span style={{ color: '#28a745', marginLeft: '10px' }}>
                          ({Math.round(line.confidence * 100)}% độ chính xác)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <AudioButton text={result.text} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VisionFeature;
