import React, { useState, useEffect, useRef } from 'react';
import { Languages, ArrowRight, Sparkles, Copy, Volume2, RefreshCw, CheckCircle, Mic, X, Search } from 'lucide-react';
import AudioButton from './AudioButton';
import MicrophoneButton from './MicrophoneButton';
import '../App.css';

function TranslationFeature() {
  const [text, setText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState({});
  const [detectedLang, setDetectedLang] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [showSourceSearch, setShowSourceSearch] = useState(false);
  const [showTargetSearch, setShowTargetSearch] = useState(false);
  const [sourceSearchTerm, setSourceSearchTerm] = useState('');
  const [targetSearchTerm, setTargetSearchTerm] = useState('');

  const sourceSearchRef = useRef(null);
  const targetSearchRef = useRef(null);

  // Popular languages for quick access
  const popularLanguages = [
    { code: 'auto', name: 'Auto Detect', flag: '🔍' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
    { code: 'zh-cn', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'th', name: 'Thai', flag: '🇹🇭' },
  ];

  // Fetch supported languages on mount
  useEffect(() => {
    fetchLanguages();
  }, []);

  // Close search dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sourceSearchRef.current && !sourceSearchRef.current.contains(event.target)) {
        setShowSourceSearch(false);
      }
      if (targetSearchRef.current && !targetSearchRef.current.contains(event.target)) {
        setShowTargetSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await fetch('http://localhost:8000/translation/languages');
      const data = await response.json();
      if (data.status === 'success') {
        setLanguages(data.languages);
      }
    } catch (err) {
      console.error('Failed to fetch languages:', err);
    }
  };

  const handleTranslate = async () => {
    if (!text.trim()) {
      setError('Please enter text to translate');
      return;
    }

    setLoading(true);
    setError('');
    setTranslatedText('');
    setDetectedLang(null);

    try {
      const response = await fetch('http://localhost:8000/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          source_lang: sourceLang,
          target_lang: targetLang
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setTranslatedText(data.translated_text);
        setDetectedLang({
          code: data.source_language.code,
          name: data.source_language.name
        });
      } else {
        setError(data.detail || 'Translation failed');
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLang !== 'auto') {
      const temp = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(temp);
      // Swap text too
      const tempText = text;
      setText(translatedText);
      setTranslatedText(tempText);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAudioInput = (transcript) => {
    setText(transcript);
  };

  const getLanguageName = (code) => {
    const popular = popularLanguages.find(l => l.code === code);
    if (popular) return popular.name;
    const lang = languages[code];
    if (lang) return lang.charAt(0).toUpperCase() + lang.slice(1);
    return code;
  };

  const getLanguageFlag = (code) => {
    const popular = popularLanguages.find(l => l.code === code);
    return popular ? popular.flag : '🌐';
  };

  const filterLanguages = (searchTerm) => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return Object.entries(languages)
      .filter(([code, name]) => 
        name.toLowerCase().includes(term) || 
        code.toLowerCase().includes(term)
      )
      .sort((a, b) => a[1].localeCompare(b[1]))
      .slice(0, 10);
  };

  const LanguageSelector = ({ 
    value, 
    onChange, 
    showSearch, 
    setShowSearch, 
    searchTerm, 
    setSearchTerm, 
    searchRef,
    label,
    allowAuto = false
  }) => {
    const filteredLangs = searchTerm ? filterLanguages(searchTerm) : [];

    return (
      <div className="lang-selector-container" ref={searchRef}>
        <label className="lang-label">{label}</label>
        <div className="lang-selector-wrapper">
          <button 
            className="lang-selector-btn"
            onClick={() => setShowSearch(!showSearch)}
          >
            <span className="lang-flag">{getLanguageFlag(value)}</span>
            <span className="lang-name">{getLanguageName(value)}</span>
            <Search size={16} className="lang-search-icon" />
          </button>

          {showSearch && (
            <div className="lang-dropdown">
              <div className="lang-search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search languages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                  className="lang-search-input"
                />
                {searchTerm && (
                  <button 
                    className="lang-clear-btn"
                    onClick={() => setSearchTerm('')}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="lang-list">
                {!searchTerm && (
                  <>
                    <div className="lang-list-section">
                      <div className="lang-list-header">Popular Languages</div>
                      {popularLanguages
                        .filter(l => allowAuto || l.code !== 'auto')
                        .map(lang => (
                          <button
                            key={lang.code}
                            className={`lang-list-item ${value === lang.code ? 'active' : ''}`}
                            onClick={() => {
                              onChange(lang.code);
                              setShowSearch(false);
                              setSearchTerm('');
                            }}
                          >
                            <span className="lang-flag">{lang.flag}</span>
                            <span className="lang-name">{lang.name}</span>
                            {value === lang.code && <CheckCircle size={16} className="lang-check" />}
                          </button>
                        ))}
                    </div>
                  </>
                )}

                {searchTerm && filteredLangs.length > 0 && (
                  <div className="lang-list-section">
                    <div className="lang-list-header">Search Results</div>
                    {filteredLangs.map(([code, name]) => (
                      <button
                        key={code}
                        className={`lang-list-item ${value === code ? 'active' : ''}`}
                        onClick={() => {
                          onChange(code);
                          setShowSearch(false);
                          setSearchTerm('');
                        }}
                      >
                        <span className="lang-flag">🌐</span>
                        <span className="lang-name">
                          {name.charAt(0).toUpperCase() + name.slice(1)}
                        </span>
                        {value === code && <CheckCircle size={16} className="lang-check" />}
                      </button>
                    ))}
                  </div>
                )}

                {searchTerm && filteredLangs.length === 0 && (
                  <div className="lang-no-results">
                    No languages found for "{searchTerm}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="feature-container" data-aos="fade-up">
      <div className="feature-header">
        <div className="feature-icon translation-gradient">
          <Languages size={28} />
        </div>
        <div className="feature-text-content">
          <h2 className="feature-title">Google Translator</h2>
          <p className="feature-description">🌍 Translate text between 100+ languages instantly</p>
        </div>
      </div>

      <div className="feature-content">
        {/* Language Selection */}
        <div className="translation-lang-selector">
          <LanguageSelector
            value={sourceLang}
            onChange={setSourceLang}
            showSearch={showSourceSearch}
            setShowSearch={setShowSourceSearch}
            searchTerm={sourceSearchTerm}
            setSearchTerm={setSourceSearchTerm}
            searchRef={sourceSearchRef}
            label="From"
            allowAuto={true}
          />

          <button 
            className="swap-btn"
            onClick={handleSwapLanguages}
            disabled={sourceLang === 'auto'}
            title="Swap languages"
          >
            <RefreshCw size={20} />
          </button>

          <LanguageSelector
            value={targetLang}
            onChange={setTargetLang}
            showSearch={showTargetSearch}
            setShowSearch={setShowTargetSearch}
            searchTerm={targetSearchTerm}
            setSearchTerm={setTargetSearchTerm}
            searchRef={targetSearchRef}
            label="To"
            allowAuto={false}
          />
        </div>

        {/* Translation Area */}
        <div className="translation-panels">
          {/* Input Panel */}
          <div className="translation-panel input-panel">
            <div className="panel-header">
              <span className="panel-title">Original Text</span>
              <div className="panel-actions">
                <MicrophoneButton 
                  onTranscript={handleAudioInput}
                  language={sourceLang === 'auto' ? 'vi' : sourceLang}
                />
                {detectedLang && sourceLang === 'auto' && (
                  <span className="detected-lang">
                    Detected: {detectedLang.name}
                  </span>
                )}
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to translate or use microphone..."
              className="translation-textarea"
              rows={8}
            />
            <div className="panel-footer">
              <span className="char-count">
                {text.length} characters
              </span>
            </div>
          </div>

          {/* Arrow */}
          <div className="translation-arrow">
            <ArrowRight size={24} />
          </div>

          {/* Output Panel */}
          <div className="translation-panel output-panel">
            <div className="panel-header">
              <span className="panel-title">Translation</span>
              {translatedText && (
                <div className="panel-actions">
                  <button 
                    className="icon-btn" 
                    onClick={handleCopy}
                    title="Copy to clipboard"
                  >
                    {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                  </button>
                  <AudioButton text={translatedText} />
                </div>
              )}
            </div>
            <div className="translation-result">
              {loading ? (
                <div className="translation-loading">
                  <Sparkles className="spin" size={32} />
                  <p>Translating...</p>
                </div>
              ) : translatedText ? (
                <p className="translation-text">{translatedText}</p>
              ) : (
                <p className="translation-placeholder">
                  Translation will appear here...
                </p>
              )}
            </div>
            {translatedText && (
              <div className="panel-footer">
                <span className="char-count">
                  {translatedText.length} characters
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Translate Button */}
        <div className="translation-actions">
          <button 
            onClick={handleTranslate}
            disabled={loading || !text.trim()}
            className="translate-btn"
          >
            {loading ? (
              <>
                <Sparkles className="spin" size={20} />
                <span>Translating...</span>
              </>
            ) : (
              <>
                <Languages size={20} />
                <span>Translate</span>
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="translation-error" data-aos="fade-in">
            <span>⚠️ {error}</span>
          </div>
        )}
      </div>

      <style>{`
        .translation-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .feature-header {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px 28px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          border-radius: 16px;
          margin-bottom: 28px;
          border: 1px solid rgba(102, 126, 234, 0.1);
          box-shadow: 0 2px 10px rgba(102, 126, 234, 0.08);
          transition: all 0.3s ease;
        }

        .feature-header:hover {
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
          transform: translateY(-2px);
        }

        .feature-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .feature-header:hover .feature-icon {
          transform: scale(1.05) rotate(5deg);
        }

        .feature-text-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .feature-title {
          margin: 0;
          font-size: 1.75rem;
          font-weight: 700;
          color: #1f2937;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        .feature-description {
          margin: 0;
          font-size: 0.95rem;
          color: #6b7280;
          font-weight: 500;
          line-height: 1.5;
        }

        .translation-lang-selector {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 16px;
          margin-bottom: 24px;
          align-items: end;
        }

        .lang-selector-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: relative;
        }

        .lang-label {
          font-weight: 600;
          color: #667eea;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .lang-selector-wrapper {
          position: relative;
        }

        .lang-selector-btn {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 15px;
          font-family: inherit;
        }

        .lang-selector-btn:hover {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .lang-flag {
          font-size: 20px;
          flex-shrink: 0;
        }

        .lang-name {
          flex: 1;
          text-align: left;
          color: #1f2937;
          font-weight: 500;
        }

        .lang-search-icon {
          color: #9ca3af;
          flex-shrink: 0;
        }

        .lang-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: white;
          border: 2px solid #667eea;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(102, 126, 234, 0.2);
          z-index: 1000;
          max-height: 400px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .lang-search-box {
          padding:12px;
          border-bottom: 2px solid #e0e0e0;
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f8f9fa;
        }

        .lang-search-box svg {
          color: #667eea;
          flex-shrink: 0;
        }

        .lang-search-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          color: #1f2937;
        }

        .lang-search-input::placeholder {
          color: #9ca3af;
        }

        .lang-clear-btn {
          padding: 4px;
          background: #e0e0e0;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .lang-clear-btn:hover {
          background: #d0d0d0;
        }

        .lang-list {
          overflow-y: auto;
          max-height: 320px;
        }

        .lang-list::-webkit-scrollbar {
          width: 6px;
        }

        .lang-list::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .lang-list::-webkit-scrollbar-thumb {
          background: #667eea;
          border-radius: 3px;
        }

        .lang-list-section {
          padding: 8px;
        }

        .lang-list-header {
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 700;
          color: #667eea;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .lang-list-item {
          width: 100%;
          padding: 10px 12px;
          border: none;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-family: inherit;
          font-size: 14px;
        }

        .lang-list-item:hover {
          background: rgba(102, 126, 234, 0.1);
        }

        .lang-list-item.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .lang-list-item.active .lang-flag {
          filter: brightness(1.2);
        }

        .lang-list-item .lang-name {
          flex: 1;
          text-align: left;
        }

        .lang-list-item.active .lang-name {
          color: white;
          font-weight: 600;
        }

        .lang-check {
          color: white;
          flex-shrink: 0;
        }

        .lang-no-results {
          padding: 20px;
          text-align: center;
          color: #9ca3af;
          font-size: 14px;
        }

        .swap-btn {
          padding: 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .swap-btn:hover:not(:disabled) {
          transform: translateY(-2px) rotate(180deg);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .swap-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .translation-panels {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .translation-panel {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-bottom: 2px solid #e0e0e0;
        }

        .panel-title {
          font-weight: 700;
          color: #667eea;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detected-lang {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .panel-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .icon-btn {
          padding: 8px;
          background: white;
          border: 2px solid #667eea;
          border-radius: 8px;
          color: #667eea;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-btn:hover {
          background: #667eea;
          color: white;
          transform: translateY(-2px);
        }

        .translation-textarea {
          flex: 1;
          padding: 20px;
          border: none;
          font-size: 15px;
          font-family: inherit;
          resize: none;
          line-height: 1.6;
        }

        .translation-textarea:focus {
          outline: none;
        }

        .translation-result {
          flex: 1;
          padding: 20px;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .translation-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: #667eea;
        }

        .translation-text {
          line-height: 1.6;
          color: #1f2937;
          font-size: 15px;
          width: 100%;
        }

        .translation-placeholder {
          color: #9ca3af;
          font-style: italic;
        }

        .panel-footer {
          padding: 12px 16px;
          background: #f8f9fa;
          border-top: 1px solid #e0e0e0;
        }

        .char-count {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .translation-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #667eea;
        }

        .translation-actions {
          display: flex;
          justify-content: center;
        }

        .translate-btn {
          padding: 16px 48px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 28px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 4px 18px rgba(102, 126, 234, 0.35);
        }

        .translate-btn:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 28px rgba(102, 126, 234, 0.5);
        }

        .translate-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
          box-shadow: none;
        }

        .translation-error {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          border: 2px solid #ef4444;
          color: #991b1b;
          padding: 16px;
          border-radius: 12px;
          margin-top: 20px;
          font-weight: 500;
          text-align: center;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @media (max-width: 768px) {
          .translation-panels {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .translation-arrow {
            transform: rotate(90deg);
          }

          .translation-lang-selector {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .swap-btn {
            transform: rotate(90deg);
          }

          .lang-dropdown {
            max-height: 300px;
          }
        }
      `}</style>
    </div>
  );
}

export default TranslationFeature;
