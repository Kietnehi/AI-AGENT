import React, { useState } from 'react';
import { Video, Loader, AlertCircle, CheckCircle, Clock, FileText, Image as ImageIcon, Upload, X } from 'lucide-react';
import LoadingAnimation from './LoadingAnimation';
import api from '../api';

const VideoGenerationFeature = () => {
  const [activeTab, setActiveTab] = useState('text'); // 'text' or 'image'
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [maxWaitTime, setMaxWaitTime] = useState(300);
  const [generationTime, setGenerationTime] = useState(0);
  
  // Image to video states
  const [imageMode, setImageMode] = useState('prompt'); // 'prompt' or 'reference'
  const [imagePrompt, setImagePrompt] = useState('');
  
  // Reference images states
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadedImageNames, setUploadedImageNames] = useState([]);

  const handleTextToVideo = async () => {
    if (!prompt.trim()) {
      setError('Vui lòng nhập mô tả video');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setGenerationTime(0);

    try {
      const response = await api.textToVideo({ prompt, max_wait_time: maxWaitTime });
      setResult(response);
      setGenerationTime(response.generation_time || 0);
      setLoading(false);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Lỗi không xác định';
      setError('Lỗi: ' + errorMsg);
      setLoading(false);
    }
  };

  const handleMultipleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check file types
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chỉ chọn file ảnh hợp lệ');
        return;
      }
    }

    setError(null);
    const newPreviews = [];
    const newUploadedNames = [];

    try {
      for (const file of files) {
        // Create preview
        newPreviews.push({
          url: URL.createObjectURL(file),
          name: file.name
        });

        // Upload to backend
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.uploadImage(formData);
        newUploadedNames.push(response.filename);
      }

      setSelectedImages([...selectedImages, ...files]);
      setImagePreviews([...imagePreviews, ...newPreviews]);
      setUploadedImageNames([...uploadedImageNames, ...newUploadedNames]);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Lỗi upload ảnh';
      setError('Lỗi: ' + errorMsg);
    }
  };

  const handleRemoveImage = (index) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newNames = uploadedImageNames.filter((_, i) => i !== index);
    const newSelected = selectedImages.filter((_, i) => i !== index);
    
    setImagePreviews(newPreviews);
    setUploadedImageNames(newNames);
    setSelectedImages(newSelected);
  };

  const handleImageToVideo = async () => {
    if (imageMode === 'prompt') {
      // Prompt to Image to Video mode
      if (!prompt.trim()) {
        setError('Vui lòng nhập mô tả để tạo ảnh và video');
        return;
      }

      setLoading(true);
      setError(null);
      setResult(null);
      setGenerationTime(0);

      try {
        const response = await api.promptToImageToVideo({ 
          prompt: prompt.trim(),
          max_wait_time: maxWaitTime 
        });
        setResult(response);
        setGenerationTime(response.generation_time || 0);
        setLoading(false);
      } catch (err) {
        const errorMsg = err.response?.data?.detail || err.message || 'Lỗi không xác định';
        setError('Lỗi: ' + errorMsg);
        setLoading(false);
      }
    } else {
      // Reference mode
      if (uploadedImageNames.length === 0) {
        setError('Vui lòng upload ít nhất 1 ảnh reference');
        return;
      }

      if (!prompt.trim()) {
        setError('Vui lòng nhập mô tả video cho chế độ Reference Images');
        return;
      }

      setLoading(true);
      setError(null);
      setResult(null);
      setGenerationTime(0);

      try {
        const response = await api.referenceImagesToVideo({ 
          image_filenames: uploadedImageNames,
          prompt: prompt.trim(),
          max_wait_time: maxWaitTime 
        });
        setResult(response);
        setGenerationTime(response.generation_time || 0);
        setLoading(false);
      } catch (err) {
        const errorMsg = err.response?.data?.detail || err.message || 'Lỗi không xác định';
        setError('Lỗi: ' + errorMsg);
        setLoading(false);
      }
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null);
    setResult(null);
    setPrompt('');
    // Reset image states
    setImageMode('prompt');
    setImagePrompt('');
    setSelectedImages([]);
    setImagePreviews([]);
    setUploadedImageNames([]);
  };

  const theme = {
    bgMain: '#0f172a',
    bgCard: '#1e293b',
    bgInput: '#334155',
    textLight: '#f1f5f9',
    textGray: '#94a3b8',
    accent: '#8b5cf6', // Purple accent for video
    accentHover: '#7c3aed',
    border: '1px solid rgba(255,255,255,0.08)',
    shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
    radius: '12px'
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '30px 20px',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      color: theme.textLight,
      backgroundColor: theme.bgMain,
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: theme.textLight,
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          <Video size={32} style={{ color: theme.accent }} />
          Video Generation - Veo 3.1
        </h1>
        <p style={{
          fontSize: '16px',
          color: theme.textGray
        }}>
          Tạo video từ văn bản hoặc từ ảnh với Google Veo 3.1
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '30px',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => handleTabChange('text')}
          style={{
            padding: '12px 24px',
            fontSize: '15px',
            fontWeight: '600',
            color: activeTab === 'text' ? 'white' : theme.textGray,
            backgroundColor: activeTab === 'text' ? theme.accent : theme.bgCard,
            border: theme.border,
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease'
          }}
        >
          <FileText size={18} />
          Text to Video
        </button>
        <button
          onClick={() => handleTabChange('image')}
          style={{
            padding: '12px 24px',
            fontSize: '15px',
            fontWeight: '600',
            color: activeTab === 'image' ? 'white' : theme.textGray,
            backgroundColor: activeTab === 'image' ? theme.accent : theme.bgCard,
            border: theme.border,
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease'
          }}
        >
          <ImageIcon size={18} />
          Image to Video
        </button>
      </div>

      {/* Main Content */}
      <div style={{
        display: 'grid',
        gap: '30px'
      }}>
        {/* Text to Video Tab */}
        {activeTab === 'text' && (
          <div style={{
            backgroundColor: theme.bgCard,
            borderRadius: theme.radius,
            padding: '30px',
            border: theme.border,
            boxShadow: theme.shadow
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: theme.textLight,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FileText size={20} style={{ color: theme.accent }} />
              Mô tả video
            </h2>

            <textarea
              placeholder="Ví dụ: A close up of two people staring at a cryptic drawing on a wall, torchlight flickering. A man murmurs, 'This must be it. That's the secret code.' The woman looks at him and whispering excitedly, 'What did you find?'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              rows={6}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '8px',
                border: theme.border,
                backgroundColor: theme.bgInput,
                color: theme.textLight,
                fontSize: '15px',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                lineHeight: '1.6'
              }}
            />

            {/* Settings */}
            <div style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: theme.bgInput,
              borderRadius: '8px',
              border: theme.border
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Clock size={18} style={{ color: theme.accent }} />
                <label style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: theme.textGray,
                  flex: 1
                }}>
                  Thời gian chờ tối đa (giây):
                </label>
                <input
                  type="number"
                  value={maxWaitTime}
                  onChange={(e) => setMaxWaitTime(parseInt(e.target.value) || 300)}
                  min="60"
                  max="600"
                  disabled={loading}
                  style={{
                    width: '100px',
                    padding: '8px',
                    borderRadius: '6px',
                    border: theme.border,
                    backgroundColor: theme.bgCard,
                    color: theme.textLight,
                    fontSize: '14px',
                    textAlign: 'center'
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleTextToVideo}
              disabled={loading || !prompt.trim()}
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '14px',
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                backgroundColor: loading || !prompt.trim() ? '#475569' : theme.accent,
                border: 'none',
                borderRadius: '8px',
                cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.3s ease',
                boxShadow: loading || !prompt.trim() ? 'none' : theme.shadow
              }}
              onMouseEnter={(e) => {
                if (!loading && prompt.trim()) {
                  e.target.style.backgroundColor = theme.accentHover;
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && prompt.trim()) {
                  e.target.style.backgroundColor = theme.accent;
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Đang tạo video...
                </>
              ) : (
                <>
                  <Video size={20} />
                  Tạo Video từ Text
                </>
              )}
            </button>
          </div>
        )}

        {/* Image to Video Tab */}
        {activeTab === 'image' && (
          <div style={{
            backgroundColor: theme.bgCard,
            borderRadius: theme.radius,
            padding: '30px',
            border: theme.border,
            boxShadow: theme.shadow
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: theme.textLight,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <ImageIcon size={20} style={{ color: theme.accent }} />
              Image to Video Mode
            </h2>

            {/* Mode Selection */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <button
                onClick={() => setImageMode('prompt')}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: imageMode === 'prompt' ? 'white' : theme.textGray,
                  backgroundColor: imageMode === 'prompt' ? theme.accent : theme.bgInput,
                  border: theme.border,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Prompt to Image
              </button>
              <button
                onClick={() => setImageMode('reference')}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: imageMode === 'reference' ? 'white' : theme.textGray,
                  backgroundColor: imageMode === 'reference' ? theme.accent : theme.bgInput,
                  border: theme.border,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Reference Images
              </button>
            </div>

            {/* Prompt to Image to Video Mode */}
            {imageMode === 'prompt' && (
              <>
                <div style={{
                  backgroundColor: theme.bgInput,
                  border: theme.border,
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '20px'
                }}>
                  <p style={{ 
                    color: theme.textLight, 
                    fontSize: '14px',
                    marginBottom: '12px',
                    lineHeight: '1.6'
                  }}>
                    🎨 AI sẽ tạo ảnh từ mô tả của bạn, sau đó tạo video từ ảnh đó
                  </p>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Mô tả ảnh bạn muốn tạo (ví dụ: A serene landscape with mountains and a lake at sunset, photorealistic style)"
                    disabled={loading}
                    style={{
                      width: '100%',
                      minHeight: '120px',
                      padding: '12px',
                      backgroundColor: theme.bgDark,
                      color: theme.textLight,
                      border: theme.border,
                      borderRadius: '6px',
                      fontSize: '15px',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      lineHeight: '1.6'
                    }}
                  />
                </div>
              </>
            )}

            {/* Reference Images Mode */}
            {imageMode === 'reference' && (
              <>
                <div style={{
                  border: `2px dashed ${theme.accent}`,
                  borderRadius: '8px',
                  padding: '30px',
                  textAlign: 'center',
                  backgroundColor: theme.bgInput,
                  marginBottom: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => document.getElementById('multipleImageInput').click()}
                >
                  <Upload size={48} style={{ color: theme.accent, margin: '0 auto 12px' }} />
                  <p style={{ color: theme.textLight, fontSize: '16px', marginBottom: '8px' }}>
                    Click để upload nhiều ảnh reference
                  </p>
                  <p style={{ color: theme.textGray, fontSize: '14px' }}>
                    Chọn nhiều ảnh làm asset reference
                  </p>
                </div>
                <input
                  id="multipleImageInput"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMultipleImageUpload}
                  disabled={loading}
                  style={{ display: 'none' }}
                />

                {/* Display uploaded images */}
                {imagePreviews.length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '12px',
                    marginBottom: '20px'
                  }}>
                    {imagePreviews.map((preview, index) => (
                      <div key={index} style={{
                        position: 'relative',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: theme.bgInput,
                        border: theme.border
                      }}>
                        <img 
                          src={preview.url} 
                          alt={`Preview ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '150px',
                            objectFit: 'cover'
                          }}
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,0,0,0.8)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.7)'}
                        >
                          <X size={16} color="white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: theme.textGray,
                    marginBottom: '8px'
                  }}>
                    Mô tả video (bắt buộc):
                  </label>
                  <textarea
                    placeholder="Ví dụ: The video opens with a medium shot of a beautiful woman with dark hair. She wears a magnificent pink flamingo dress with layers of feathers..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={loading}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '8px',
                      border: theme.border,
                      backgroundColor: theme.bgInput,
                      color: theme.textLight,
                      fontSize: '15px',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      lineHeight: '1.6'
                    }}
                  />
                </div>
              </>
            )}

            {/* Settings */}
            <div style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: theme.bgInput,
              borderRadius: '8px',
              border: theme.border
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Clock size={18} style={{ color: theme.accent }} />
                <label style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: theme.textGray,
                  flex: 1
                }}>
                  Thời gian chờ tối đa (giây):
                </label>
                <input
                  type="number"
                  value={maxWaitTime}
                  onChange={(e) => setMaxWaitTime(parseInt(e.target.value) || 300)}
                  min="60"
                  max="600"
                  disabled={loading}
                  style={{
                    width: '100px',
                    padding: '8px',
                    borderRadius: '6px',
                    border: theme.border,
                    backgroundColor: theme.bgCard,
                    color: theme.textLight,
                    fontSize: '14px',
                    textAlign: 'center'
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleImageToVideo}
              disabled={loading || 
                (imageMode === 'prompt' && !imagePrompt.trim()) ||
                (imageMode === 'reference' && uploadedImageNames.length === 0)
              }
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '14px',
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                backgroundColor: loading || 
                  (imageMode === 'prompt' && !imagePrompt.trim()) ||
                  (imageMode === 'reference' && uploadedImageNames.length === 0)
                  ? '#475569' : theme.accent,
                border: 'none',
                borderRadius: '8px',
                cursor: loading || 
                  (imageMode === 'prompt' && !imagePrompt.trim()) ||
                  (imageMode === 'reference' && uploadedImageNames.length === 0)
                  ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.3s ease',
                boxShadow: loading || 
                  (imageMode === 'prompt' && !imagePrompt.trim()) ||
                  (imageMode === 'reference' && uploadedImageNames.length === 0)
                  ? 'none' : theme.shadow
              }}
              onMouseEnter={(e) => {
                const canGenerate = 
                  (imageMode === 'prompt' && imagePrompt.trim()) ||
                  (imageMode === 'reference' && uploadedImageNames.length > 0);
                if (!loading && canGenerate) {
                  e.target.style.backgroundColor = theme.accentHover;
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                const canGenerate = 
                  (imageMode === 'prompt' && imagePrompt.trim()) ||
                  (imageMode === 'reference' && uploadedImageNames.length > 0);
                if (!loading && canGenerate) {
                  e.target.style.backgroundColor = theme.accent;
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Đang tạo video...
                </>
              ) : (
                <>
                  <Video size={20} />
                  {imageMode === 'prompt' && 'Tạo Ảnh và Video từ Prompt'}
                  {imageMode === 'reference' && 'Tạo Video từ Reference Images'}
                </>
              )}
            </button>
          </div>
        )}

        {/* Loading Animation */}
        {loading && (
          <div style={{
            backgroundColor: theme.bgCard,
            borderRadius: theme.radius,
            padding: '40px',
            border: theme.border,
            textAlign: 'center'
          }}>
            <LoadingAnimation />
            <p style={{
              marginTop: '20px',
              color: theme.textGray,
              fontSize: '15px'
            }}>
              Đang tạo video, vui lòng đợi... (có thể mất vài phút)
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div style={{
            backgroundColor: '#7f1d1d',
            borderRadius: theme.radius,
            padding: '20px',
            border: '1px solid #991b1b',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertCircle size={24} style={{ color: '#fca5a5', flexShrink: 0 }} />
            <p style={{ color: '#fca5a5', fontSize: '15px', margin: 0 }}>
              {error}
            </p>
          </div>
        )}

        {/* Success Result */}
        {result && result.status === 'success' && (
          <div style={{
            backgroundColor: theme.bgCard,
            borderRadius: theme.radius,
            padding: '30px',
            border: theme.border,
            boxShadow: theme.shadow
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
              padding: '16px',
              backgroundColor: '#065f46',
              borderRadius: '8px',
              border: '1px solid #047857'
            }}>
              <CheckCircle size={24} style={{ color: '#6ee7b7', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ color: '#6ee7b7', fontSize: '15px', margin: 0 }}>
                  {result.message}
                </p>
                {generationTime > 0 && (
                  <p style={{ color: '#6ee7b7', fontSize: '13px', margin: '4px 0 0 0', opacity: 0.8 }}>
                    Thời gian tạo: {generationTime} giây
                  </p>
                )}
              </div>
            </div>

            <div style={{
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#000',
              border: theme.border
            }}>
              <video
                controls
                style={{
                  width: '100%',
                  maxHeight: '600px',
                  display: 'block'
                }}
                src={`http://localhost:8000${result.video_url}`}
              >
                Trình duyệt của bạn không hỗ trợ video tag.
              </video>
            </div>

            <a
              href={`http://localhost:8000${result.video_url}`}
              download
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '16px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                backgroundColor: theme.accent,
                textDecoration: 'none',
                borderRadius: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = theme.accentHover;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = theme.accent;
              }}
            >
              <Video size={16} />
              Tải xuống video
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoGenerationFeature;
