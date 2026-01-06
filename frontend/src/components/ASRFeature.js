import React, { useState, useRef, useEffect } from 'react';
import { Mic, Upload, Loader, AlertCircle, Info, CheckCircle, Cpu, Languages, FileAudio, Square, PlayCircle } from 'lucide-react';
import LoadingAnimation from './LoadingAnimation';
import AudioButton from './AudioButton';
import api from '../api';

const ASRFeature = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [audioFileName, setAudioFileName] = useState('');
  const [transcription, setTranscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  
  // ASR settings
  const [language, setLanguage] = useState('auto');
  const [task, setTask] = useState('transcribe');
  const [modelName, setModelName] = useState('large-v3');
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], 'recorded_audio.wav', { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        setAudioFile(audioFile);
        setAudioFileName('Thu âm: ' + Math.floor(recordingTime / 60) + ':' + String(recordingTime % 60).padStart(2, '0'));
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setError(null);
      setTranscription(null);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      setError('Không thể truy cập microphone: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg', 'audio/webm'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|ogg|webm)$/i)) {
        setError('Vui lòng chọn file audio hợp lệ (MP3, WAV, M4A, OGG, WebM)');
        return;
      }
      
      setAudioFile(file);
      setAudioFileName(file.name);
      setAudioBlob(null);
      setError(null);
      setTranscription(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!audioFile) {
      setError('Vui lòng chọn file audio');
      return;
    }

    setLoading(true);
    setError(null);
    setTranscription(null);
    setModelInfo(null);

    try {
      const result = await api.asrTranscribe({
        audio: audioFile,
        language: language === 'auto' ? null : language,
        task: task,
        model_name: modelName
      });

      setTranscription(result.transcription);
      setModelInfo({
        model: result.model,
        device: result.device,
        language: result.language,
        task: result.task
      });
      setLoading(false);
    } catch (err) {
      setError('Lỗi: ' + err.message);
      setLoading(false);
    }
  };

  const handleClear = () => {
    setAudioFile(null);
    setAudioFileName('');
    setAudioBlob(null);
    setTranscription(null);
    setError(null);
    setModelInfo(null);
    setRecordingTime(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="feature-container">
      <h2 className="feature-title">
        <Mic size={28} style={{ marginRight: '10px' }} />
        Automatic Speech Recognition (Whisper Large V3)
      </h2>

      <div style={{
        padding: '15px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
        border: '2px solid rgba(99, 102, 241, 0.5)',
        borderRadius: '12px',
        marginBottom: '24px',
        backdropFilter: 'blur(10px)'
      }}>
        <Info size={20} style={{ marginRight: '8px', display: 'inline', color: '#a78bfa', verticalAlign: 'middle' }} />
        <span style={{ color: '#000000', fontSize: '15px', fontWeight: '600' }}>
          Chuyển đổi giọng nói thành văn bản sử dụng OpenAI Whisper Large V3
        </span>
      </div>

      {/* Settings Section */}
      <div style={{ 
        marginBottom: '24px',
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        border: '1px solid rgba(99, 102, 241, 0.3)'
      }}>
        {/* Language Selection */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            color: '#000000', 
            marginBottom: '10px',
            fontWeight: '600',
            fontSize: '15px'
          }}>
            <Languages size={18} style={{ marginRight: '8px', color: '#a78bfa' }} />
            Ngôn ngữ:
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '2px solid rgba(99, 102, 241, 0.4)',
              background: '#ffffff',
              color: '#000000',
              fontSize: '15px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="auto" style={{ background: '#ffffff', color: '#000000' }}>Tự động nhận diện</option>
            <option value="vi" style={{ background: '#ffffff', color: '#000000' }}>Tiếng Việt</option>
            <option value="en" style={{ background: '#ffffff', color: '#000000' }}>English</option>
            <option value="zh" style={{ background: '#ffffff', color: '#000000' }}>中文 (Chinese)</option>
            <option value="ja" style={{ background: '#ffffff', color: '#000000' }}>日本語 (Japanese)</option>
            <option value="ko" style={{ background: '#ffffff', color: '#000000' }}>한국어 (Korean)</option>
            <option value="fr" style={{ background: '#ffffff', color: '#000000' }}>Français (French)</option>
            <option value="es" style={{ background: '#ffffff', color: '#000000' }}>Español (Spanish)</option>
            <option value="de" style={{ background: '#ffffff', color: '#000000' }}>Deutsch (German)</option>
          </select>
        </div>

        {/* Task Selection */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            color: '#000000', 
            marginBottom: '10px',
            fontWeight: '600',
            fontSize: '15px'
          }}>
            <Cpu size={18} style={{ marginRight: '8px', color: '#a78bfa' }} />
            Chế độ:
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <label style={{ 
              flex: 1,
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer',
              padding: '12px',
              borderRadius: '8px',
              background: task === 'transcribe' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              border: '2px solid rgba(99, 102, 241, 0.3)',
              transition: 'all 0.3s ease'
            }}>
              <input
                type="radio"
                checked={task === 'transcribe'}
                onChange={() => setTask('transcribe')}
                style={{ 
                  marginRight: '10px',
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer'
                }}
              />
              <span style={{ color: '#000000', fontSize: '15px', fontWeight: '500' }}>Phiên âm (Transcribe)</span>
            </label>
            
            <label style={{ 
              flex: 1,
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer',
              padding: '12px',
              borderRadius: '8px',
              background: task === 'translate' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              border: '2px solid rgba(99, 102, 241, 0.3)',
              transition: 'all 0.3s ease'
            }}>
              <input
                type="radio"
                checked={task === 'translate'}
                onChange={() => setTask('translate')}
                style={{ 
                  marginRight: '10px',
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer'
                }}
              />
              <span style={{ color: '#000000', fontSize: '15px', fontWeight: '500' }}>Dịch sang tiếng Anh (Translate)</span>
            </label>
          </div>
        </div>

        {/* Model Selection */}
        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            color: '#000000', 
            marginBottom: '10px',
            fontWeight: '600',
            fontSize: '15px'
          }}>
            <Cpu size={18} style={{ marginRight: '8px', color: '#a78bfa' }} />
            Model:
          </label>
          <select
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '2px solid rgba(99, 102, 241, 0.4)',
              background: '#ffffff',
              color: '#000000',
              fontSize: '15px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="turbo" style={{ background: '#ffffff', color: '#000000' }}>Whisper Turbo (Nhanh nhất, mới nhất)</option>
            <option value="large-v3" style={{ background: '#ffffff', color: '#000000' }}>Whisper Large V3 (Tốt nhất)</option>
            <option value="large-v2" style={{ background: '#ffffff', color: '#000000' }}>Whisper Large V2</option>
            <option value="medium" style={{ background: '#ffffff', color: '#000000' }}>Whisper Medium (Nhanh hơn)</option>
            <option value="small" style={{ background: '#ffffff', color: '#000000' }}>Whisper Small (Rất nhanh)</option>
            <option value="base" style={{ background: '#ffffff', color: '#000000' }}>Whisper Base (Nhẹ nhất)</option>
          </select>
        </div>
      </div>

      {/* Recording Section */}
      <div style={{
        marginBottom: '24px',
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
        borderRadius: '12px',
        border: '2px solid rgba(168, 85, 247, 0.3)'
      }}>
        <h3 style={{
          color: '#a855f7',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          fontSize: '18px',
          fontWeight: '700'
        }}>
          <Mic size={24} style={{ marginRight: '10px' }} />
          Thu Âm Trực Tiếp
        </h3>
        
        {isRecording && (
          <div style={{
            marginBottom: '16px',
            padding: '16px',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '8px',
            border: '2px solid rgba(239, 68, 68, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#ef4444',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
            <span style={{ color: '#ef4444', fontSize: '18px', fontWeight: '700' }}>
              Đang thu âm: {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
            </span>
          </div>
        )}
        
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={loading}
          style={{
            width: '100%',
            padding: '18px 28px',
            background: isRecording ?
              'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
              'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.3s ease',
            boxShadow: isRecording ?
              '0 4px 15px rgba(239, 68, 68, 0.4)' :
              '0 4px 15px rgba(168, 85, 247, 0.4)'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = isRecording ?
                '0 6px 20px rgba(239, 68, 68, 0.5)' :
                '0 6px 20px rgba(168, 85, 247, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = isRecording ?
              '0 4px 15px rgba(239, 68, 68, 0.4)' :
              '0 4px 15px rgba(168, 85, 247, 0.4)';
          }}
        >
          {isRecording ? (
            <>
              <Square size={20} fill="white" />
              Dừng Thu Âm
            </>
          ) : (
            <>
              <PlayCircle size={20} />
              Bắt Đầu Thu Âm
            </>
          )}
        </button>
      </div>

      {/* Divider */}
      <div style={{
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{ flex: 1, height: '2px', background: 'rgba(99, 102, 241, 0.2)' }} />
        <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: '600' }}>HOẶC</span>
        <div style={{ flex: 1, height: '2px', background: 'rgba(99, 102, 241, 0.2)' }} />
      </div>

      {/* File Upload Section */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="audio-file-input"
          />
          <label
            htmlFor="audio-file-input"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
              background: audioFile ? 
                'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)' :
                'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
              border: audioFile ?
                '2px dashed rgba(34, 197, 94, 0.5)' :
                '2px dashed rgba(99, 102, 241, 0.5)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              flexDirection: 'column',
              gap: '12px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = audioFile ? 'rgba(34, 197, 94, 0.8)' : 'rgba(99, 102, 241, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = audioFile ? 'rgba(34, 197, 94, 0.5)' : 'rgba(99, 102, 241, 0.5)';
            }}
          >
            {audioFile ? (
              <>
                <CheckCircle size={48} style={{ color: '#10b981' }} />
                <FileAudio size={32} style={{ color: '#10b981' }} />
                <span style={{ color: '#10b981', fontSize: '16px', fontWeight: '600' }}>
                  {audioFileName}
                </span>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>
                  Click để chọn file khác
                </span>
              </>
            ) : (
              <>
                <Upload size={48} style={{ color: '#a78bfa' }} />
                <span style={{ color: '#000000', fontSize: '16px', fontWeight: '600' }}>
                  Click để chọn file audio
                </span>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>
                  Hỗ trợ: MP3, WAV, M4A, OGG, WebM
                </span>
              </>
            )}
          </label>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            disabled={loading || !audioFile}
            style={{
              flex: 1,
              padding: '16px 28px',
              background: loading || !audioFile ? 
                'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(168, 85, 247, 0.3) 100%)' :
                'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: loading || !audioFile ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              boxShadow: loading || !audioFile ? 'none' : '0 4px 15px rgba(99, 102, 241, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!loading && audioFile) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = loading || !audioFile ? 'none' : '0 4px 15px rgba(99, 102, 241, 0.3)';
            }}
          >
            {loading ? (
              <>
                <Loader size={20} style={{ marginRight: '10px', animation: 'spin 1s linear infinite' }} />
                Đang xử lý...
              </>
            ) : (
              <>
                <Mic size={20} style={{ marginRight: '10px' }} />
                Chuyển đổi giọng nói
              </>
            )}
          </button>

          {audioFile && !loading && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                padding: '16px 28px',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)',
                color: '#ef4444',
                border: '2px solid rgba(239, 68, 68, 0.5)',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '700',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(220, 38, 38, 0.25) 100%)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)';
              }}
            >
              Xóa
            </button>
          )}
        </div>
      </form>

      {loading && <LoadingAnimation />}

      {/* Model Info */}
      {modelInfo && (
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(16, 185, 129, 0.12) 100%)',
          border: '2px solid rgba(34, 197, 94, 0.4)',
          borderRadius: '12px',
          marginBottom: '20px',
          boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {/* Language Badge - Most Important */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '10px',
              boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)',
              transform: 'scale(1.05)'
            }}>
              <span style={{ fontSize: '20px' }}>🌍</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  fontSize: '11px',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Detected Language
                </span>
                <span style={{ 
                  color: '#ffffff', 
                  fontSize: '16px',
                  fontWeight: '700',
                  textTransform: 'uppercase'
                }}>
                  {modelInfo.language}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div style={{
              width: '2px',
              height: '40px',
              background: 'linear-gradient(to bottom, rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.1))',
              borderRadius: '2px'
            }}></div>

            {/* Other Info */}
            <div style={{ 
              display: 'flex', 
              gap: '12px',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: 'rgba(16, 185, 129, 0.15)',
                borderRadius: '8px',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                <span style={{ fontSize: '14px' }}>🤖</span>
                <span style={{ color: '#10b981', fontSize: '13px', fontWeight: '600' }}>
                  Model: {modelInfo.model}
                </span>
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: 'rgba(16, 185, 129, 0.15)',
                borderRadius: '8px',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                <span style={{ fontSize: '14px' }}>⚡</span>
                <span style={{ color: '#10b981', fontSize: '13px', fontWeight: '600' }}>
                  Device: {modelInfo.device}
                </span>
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: 'rgba(16, 185, 129, 0.15)',
                borderRadius: '8px',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                <span style={{ fontSize: '14px' }}>{modelInfo.task === 'translate' ? '🌐' : '📝'}</span>
                <span style={{ color: '#10b981', fontSize: '13px', fontWeight: '600' }}>
                  Task: {modelInfo.task === 'translate' ? 'Translate to English' : 'Transcribe'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transcription Result */}
      {transcription && (
        <div style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
          border: '2px solid rgba(99, 102, 241, 0.4)',
          borderRadius: '12px',
          marginTop: '20px',
          animation: 'fadeIn 0.3s ease-in'
        }}>
          <h3 style={{ 
            color: '#a78bfa', 
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '18px',
            fontWeight: '700'
          }}>
            <FileAudio size={24} style={{ marginRight: '10px' }} />
            Kết Quả Chuyển Đổi
          </h3>
          <div style={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            lineHeight: '1.7',
            color: '#000000',
            fontSize: '15px',
            marginBottom: '16px',
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '8px'
          }}>
            {transcription}
          </div>
          <AudioButton text={transcription} />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)',
          border: '2px solid rgba(239, 68, 68, 0.5)',
          borderRadius: '10px',
          color: '#ef4444',
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

export default ASRFeature;
