import React, { useState } from 'react';
import { Upload, FileText, Presentation, Download, X, CheckCircle, AlertCircle } from 'lucide-react';
import { generateSlidesFromDocuments } from '../api';
import './AnimatedBackground.css';

function SlideGenerationFeature() {
  const [files, setFiles] = useState([]);
  const [numSlides, setNumSlides] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    setFiles([...files, ...uploadedFiles]);
    setError(null);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  const handleGenerateSlides = async () => {
    if (files.length === 0) {
      setError('Please upload at least one document');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await generateSlidesFromDocuments(files, numSlides);
      
      if (response.success) {
        setResult({
          filename: response.filename,
          presentationUrl: response.presentation_url,
          numSlides: response.num_slides,
          numImages: response.num_images,
          title: response.title
        });
      } else {
        setError(response.error || 'Failed to generate presentation');
      }
    } catch (err) {
      console.error('Error generating slides:', err);
      setError(err.message || 'An error occurred while generating slides');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (result && result.presentationUrl) {
      const link = document.createElement('a');
      link.href = `http://localhost:8000${result.presentationUrl}`;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetForm = () => {
    setFiles([]);
    setResult(null);
    setError(null);
    setNumSlides(10);
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return '📄';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['txt'].includes(ext)) return '📃';
    if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) return '🖼️';
    return '📎';
  };

  return (
    <div className="feature-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="feature-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
        <Presentation size={48} style={{ color: '#8b5cf6', marginBottom: '15px' }} />
        <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>
          📊 Automated Slide Generation
        </h2>
        <p style={{ color: '#888', fontSize: '16px' }}>
          Upload multiple documents and let AI create a professional presentation
        </p>
      </div>

      {/* File Upload Section */}
      <div className="upload-section" style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '15px',
        padding: '30px',
        marginBottom: '25px',
        border: '2px dashed rgba(139, 92, 246, 0.3)'
      }}>
        <label htmlFor="file-upload" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '20px'
        }}>
          <Upload size={48} style={{ color: '#8b5cf6', marginBottom: '15px' }} />
          <span style={{ fontSize: '18px', marginBottom: '8px' }}>
            Click to upload documents
          </span>
          <span style={{ fontSize: '14px', color: '#888' }}>
            Supported: PDF, DOCX, TXT, Images (PNG, JPG)
          </span>
          <input
            id="file-upload"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#8b5cf6' }}>
            📁 Uploaded Files ({files.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {files.map((file, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '12px 20px',
                borderRadius: '10px',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>{getFileIcon(file.name)}</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{file.name}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      {(file.size / 1024).toFixed(2)} KB
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.4)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
                >
                  <X size={18} color="#ef4444" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Number of Slides Input */}
      <div style={{ marginBottom: '25px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontSize: '16px' }}>
          🎯 Number of Slides to Generate:
        </label>
        <input
          type="number"
          min="3"
          max="50"
          value={numSlides}
          onChange={(e) => setNumSlides(parseInt(e.target.value) || 10)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'black',
            fontSize: '16px'
          }}
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerateSlides}
        disabled={loading || files.length === 0}
        style={{
          width: '100%',
          padding: '15px',
          borderRadius: '10px',
          border: 'none',
          background: files.length === 0 || loading 
            ? 'rgba(139, 92, 246, 0.3)' 
            : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: files.length === 0 || loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s',
          marginBottom: '25px'
        }}
      >
        {loading ? (
          <>
            <span className="spinner" style={{
              display: 'inline-block',
              width: '20px',
              height: '20px',
              border: '3px solid rgba(255,255,255,0.3)',
              borderTop: '3px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginRight: '10px'
            }}></span>
            Generating Presentation...
          </>
        ) : (
          <>
            <Presentation size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
            Generate Presentation
          </>
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '10px',
          padding: '15px',
          marginBottom: '25px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertCircle size={24} color="#ef4444" />
          <span style={{ color: '#ef4444' }}>{error}</span>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
          border: '2px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '25px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <CheckCircle size={32} color="#10b981" />
            <h3 style={{ fontSize: '22px', margin: 0 }}>
              ✨ Presentation Generated Successfully!
            </h3>
          </div>

          <div style={{ 
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#8b5cf6' }}>Title:</strong>
              <div style={{ fontSize: '18px', marginTop: '5px' }}>{result.title}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
              <div>
                <strong style={{ color: '#8b5cf6' }}>📊 Slides:</strong>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{result.numSlides}</div>
              </div>
              <div>
                <strong style={{ color: '#8b5cf6' }}>🖼️ Images:</strong>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{result.numImages}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleDownload}
              style={{
                flex: 1,
                padding: '15px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Download size={20} />
              Download Presentation
            </button>
            <button
              onClick={resetForm}
              style={{
                padding: '15px 25px',
                borderRadius: '10px',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'black',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              New Presentation
            </button>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '15px',
        padding: '20px',
        border: '1px solid rgba(139, 92, 246, 0.2)'
      }}>
        <h4 style={{ fontSize: '16px', marginBottom: '15px', color: '#8b5cf6' }}>
          ℹ️ How it works:
        </h4>
        <ul style={{ fontSize: '14px', color: '#aaa', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Upload multiple documents (PDF, DOCX, TXT, or images)</li>
          <li>AI analyzes all content using Gemini Flash model</li>
          <li>Automatically extracts key points and relevant images</li>
          <li>Generates a professional presentation with structured slides</li>
          <li>Download your ready-to-use PowerPoint file</li>
        </ul>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default SlideGenerationFeature;
