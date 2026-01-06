import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

/**
 * Speech-to-Text Microphone Button Component
 * Uses Web Speech API (browser native, real-time, free)
 */
const MicrophoneButton = ({ 
  onTranscript, 
  language = 'vi', 
  disabled = false
}) => {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  // Initialize Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
    }
  }, []);

  const handleClick = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    if (!recognitionRef.current) {
      setError('Web Speech API không được hỗ trợ trong trình duyệt này');
      return;
    }

    try {
      setError(null);
      setRecording(true);

      const langMap = {
        'vi': 'vi-VN',
        'en': 'en-US',
        'zh': 'zh-CN',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'es': 'es-ES'
      };
      recognitionRef.current.lang = langMap[language] || 'vi-VN';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (onTranscript) {
          onTranscript(transcript);
        }
        setRecording(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Lỗi: ${event.error === 'no-speech' ? 'Không nghe thấy giọng nói' : event.error}`);
        setRecording(false);
      };

      recognitionRef.current.onend = () => {
        setRecording(false);
      };

      recognitionRef.current.start();
    } catch (err) {
      console.error('Error starting recognition:', err);
      setError('Không thể khởi động nhận diện giọng nói');
      setRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && recording) {
      recognitionRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="microphone-button-container" style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={handleClick}
        disabled={disabled}
        className="microphone-button"
        style={{
          background: recording 
            ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          opacity: disabled ? 0.6 : 1,
          boxShadow: recording 
            ? '0 0 20px rgba(245, 87, 108, 0.5)' 
            : '0 4px 15px rgba(0, 0, 0, 0.2)',
        }}
        title={recording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm (🎤 Web Speech API)'}
      >
        {recording ? (
          <MicOff size={24} color="#fff" />
        ) : (
          <Mic size={24} color="#fff" />
        )}
      </button>
      
      {error && (
        <div 
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '8px',
            padding: '8px 12px',
            background: '#f5576c',
            color: 'white',
            borderRadius: '8px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            zIndex: 1000,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default MicrophoneButton;