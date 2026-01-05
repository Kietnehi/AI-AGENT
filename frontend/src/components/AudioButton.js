import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Play, Pause, RotateCcw } from 'lucide-react';
import api from '../api';

/**
 * Reusable Audio Button Component
 * Converts text to speech and plays it with playback controls
 */
const AudioButton = ({ text, lang = 'vi', buttonId = null }) => {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hovering, setHovering] = useState(false);
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  // Update current time as audio plays
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('durationchange', updateDuration);
    };
  }, [audioRef.current]);

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handlePlayPause = async () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        await audioRef.current.play();
        setPlaying(true);
      }
      return;
    }

    // Load and play audio for the first time
    await loadAudio();
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const loadAudio = async () => {
    try {
      // Validate text
      if (!text || text.trim().length === 0) {
        alert('Không có văn bản để đọc');
        return;
      }

      setLoading(true);
      
      // Get audio from TTS API
      const audioBlob = await api.textToSpeech(text, lang);
      
      // Check if blob is valid
      if (!audioBlob || audioBlob.size === 0) {
        throw new Error('Audio file is empty');
      }
      
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create and play audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setPlaying(false);
      };
      
      audio.onerror = (e) => {
        setPlaying(false);
        console.error('Audio playback error:', e);
        alert('Lỗi phát audio. Vui lòng thử lại.');
      };

      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };
      
      await audio.play();
      setPlaying(true);
      setLoading(false);
      
    } catch (error) {
      console.error('TTS Error:', error);
      setPlaying(false);
      setLoading(false);
      
      // More specific error messages
      let errorMsg = 'Lỗi chuyển đổi text-to-speech';
      if (error.response) {
        errorMsg += `: ${error.response.data?.detail || error.response.statusText}`;
      } else if (error.message) {
        errorMsg += `: ${error.message}`;
      }
      
      alert(errorMsg);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div style={{
      marginTop: '10px',
      padding: '16px',
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
      borderRadius: '16px',
      border: '2px solid rgba(71, 85, 105, 0.5)',
      minWidth: '320px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
      transition: 'all 0.3s ease'
    }}>
      {/* Audio Player Header */}
      {audioRef.current && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
          fontSize: '0.8rem',
          color: 'rgba(255, 255, 255, 0.7)',
          fontWeight: '600'
        }}>
          <Volume2 size={14} />
          <span>AUDIO PLAYER</span>
        </div>
      )}

      {/* Control Buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: audioRef.current ? '16px' : '0'
      }}>
        <button
          onClick={handlePlayPause}
          disabled={!text || loading}
          style={{
            padding: '10px 20px',
            background: playing 
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              : 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            cursor: (!text || loading) ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s',
            opacity: (!text || loading) ? 0.5 : 1,
            flex: 1,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            transform: 'scale(1)'
          }}
          onMouseEnter={(e) => {
            if (text && !loading) {
              e.target.style.transform = 'scale(1.02)';
              e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
          }}
        >
          {loading ? (
            <>
              <Volume2 size={18} />
              Đang tải...
            </>
          ) : playing ? (
            <>
              <Pause size={18} />
              Tạm dừng
            </>
          ) : audioRef.current ? (
            <>
              <Play size={18} />
              Tiếp tục
            </>
          ) : (
            <>
              <Volume2 size={18} />
              Nghe
            </>
          )}
        </button>
        
        {audioRef.current && (
          <button
            onClick={handleRestart}
            title="Phát lại từ đầu"
            style={{
              padding: '10px 14px',
              background: 'rgba(71, 85, 105, 0.6)',
              color: 'white',
              border: '2px solid rgba(100, 116, 139, 0.5)',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.3s',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(100, 116, 139, 0.8)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(71, 85, 105, 0.6)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            <RotateCcw size={18} />
          </button>
        )}
      </div>

      {/* Progress Bar Section */}
      {audioRef.current && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          padding: '12px',
          borderRadius: '12px',
          border: '1px solid rgba(71, 85, 105, 0.4)'
        }}>
          {/* Time Display Above Progress Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <div style={{
              fontSize: '0.95rem',
              color: '#fff',
              fontWeight: '700',
              fontFamily: 'monospace',
              background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
              padding: '4px 12px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(8, 145, 178, 0.3)'
            }}>
              {formatTime(currentTime)}
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: 'rgba(255, 255, 255, 0.5)',
              fontWeight: '600'
            }}>
              /
            </div>
            <div style={{
              fontSize: '0.95rem',
              color: 'rgba(203, 213, 225, 0.9)',
              fontWeight: '700',
              fontFamily: 'monospace',
              background: 'rgba(71, 85, 105, 0.5)',
              padding: '4px 12px',
              borderRadius: '8px'
            }}>
              {formatTime(duration)}
            </div>
          </div>

          {/* Progress Bar with Enhanced Design */}
          <div
            ref={progressRef}
            onClick={handleSeek}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            style={{
              height: hovering ? '12px' : '10px',
              background: 'rgba(51, 65, 85, 0.6)',
              borderRadius: '10px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'visible',
              transition: 'all 0.2s ease',
              border: hovering ? '2px solid rgba(14, 165, 233, 0.5)' : '2px solid rgba(71, 85, 105, 0.3)',
              boxShadow: hovering ? '0 0 15px rgba(14, 165, 233, 0.3)' : 'none'
            }}
          >
            {/* Progress Fill */}
            <div
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)',
                borderRadius: '8px',
                transition: 'width 0.1s linear',
                position: 'relative',
                boxShadow: '0 0 10px rgba(6, 182, 212, 0.4)'
              }}
            >
              {/* Progress Indicator Dot */}
              {progressPercent > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    right: '-6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: hovering ? '16px' : '12px',
                    height: hovering ? '16px' : '12px',
                    background: '#f0f9ff',
                    borderRadius: '50%',
                    boxShadow: '0 0 12px rgba(6, 182, 212, 0.6), 0 0 4px rgba(240, 249, 255, 0.8)',
                    transition: 'all 0.2s ease',
                    border: '2px solid #0891b2'
                  }}
                />
              )}
            </div>
          </div>

          {/* Helper Text */}
          <div style={{
            marginTop: '8px',
            fontSize: '0.7rem',
            color: 'rgba(255, 255, 255, 0.5)',
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            {hovering ? '👆 Click để tua đến vị trí mong muốn' : 'Hover để xem hướng dẫn'}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioButton;
