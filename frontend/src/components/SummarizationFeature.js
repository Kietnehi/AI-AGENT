import React, { useState } from 'react';
import { FileText, Zap, Loader2, CheckCircle, AlertCircle, BarChart2, Sparkles } from 'lucide-react';
import AudioButton from './AudioButton';
import '../App.css';

function SummarizationFeature() {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    if (!text.trim()) {
      setError('Please enter text to summarize');
      return;
    }

    if (text.trim().length < 50) {
      setError('Text is too short. Please provide at least 50 characters.');
      return;
    }

    setLoading(true);
    setError('');
    setSummary('');
    setStats(null);

    try {
      const response = await fetch('http://localhost:8000/summarization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          max_length: 130,
          min_length: 30,
          do_sample: false
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSummary(data.summary);
        setStats({
          original_length: data.original_length,
          summary_length: data.summary_length,
          compression_ratio: data.compression_ratio,
          truncated: data.truncated,
          model: data.model
        });
      } else {
        setError(data.detail || 'Summarization failed');
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setSummary('');
    setStats(null);
    setError('');
  };

  return (
    <div className="feature-container" data-aos="fade-up">
      <div className="feature-header">
        <div className="feature-icon summarization-gradient">
          <Sparkles size={28} />
        </div>
        <div>
          <h2>Text Summarization</h2>
          <p>✨ Summarize long texts using facebook/bart-large-cnn</p>
        </div>
      </div>

      <div className="feature-content">
        <div className="summarization-input-wrapper">
          <label className="input-label-modern">
            <FileText size={18} />
            <span>Enter Text to Summarize</span>
            <span className="input-badge">English</span>
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your long text here (minimum 50 characters)...&#10;&#10;Example: Artificial intelligence is intelligence demonstrated by machines, in contrast to the natural intelligence displayed by humans and animals. Leading AI textbooks define the field as the study of intelligent agents..."
            rows={10}
            className="text-input-modern"
          />
          <div className="char-counter-modern">
            <span className={text.length >= 50 ? 'valid' : 'invalid'}>
              {text.length} characters
            </span>
            {text.length < 50 && text.length > 0 && (
              <span className="hint">• Minimum 50 characters required</span>
            )}
          </div>
        </div>

        <div className="button-group-modern">
          <button 
            onClick={handleSummarize} 
            disabled={loading || !text.trim()}
            className="action-button-modern primary-gradient"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="spin" />
                <span>Summarizing...</span>
              </>
            ) : (
              <>
                <Zap size={20} />
                <span>Summarize</span>
              </>
            )}
          </button>
          <button 
            onClick={handleClear}
            className="action-button-modern secondary-outline"
            disabled={loading}
          >
            Clear
          </button>
        </div>

        {error && (
          <div className="error-message-modern" data-aos="fade-in">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {stats && (
          <div className="stats-container-modern" data-aos="fade-in">
            <div className="stats-header">
              <BarChart2 size={18} />
              <span>Statistics</span>
            </div>
            <div className="stats-grid">
              <div className="stat-card-modern original">
                <div className="stat-icon">📄</div>
                <div className="stat-content">
                  <div className="stat-label">Original Length</div>
                  <div className="stat-value">{stats.original_length}</div>
                  <div className="stat-unit">characters</div>
                </div>
              </div>
              <div className="stat-card-modern summary">
                <div className="stat-icon">✨</div>
                <div className="stat-content">
                  <div className="stat-label">Summary Length</div>
                  <div className="stat-value">{stats.summary_length}</div>
                  <div className="stat-unit">characters</div>
                </div>
              </div>
              <div className="stat-card-modern compression">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <div className="stat-label">Compression</div>
                  <div className="stat-value">{stats.compression_ratio}%</div>
                  <div className="stat-unit">ratio</div>
                </div>
              </div>
              {stats.truncated && (
                <div className="stat-card-modern warning">
                  <div className="stat-icon">⚠️</div>
                  <div className="stat-content">
                    <div className="stat-label">Notice</div>
                    <div className="stat-value-small">Text was truncated</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {summary && (
          <div className="result-section-modern" data-aos="fade-up">
            <div className="result-header-modern">
              <div className="result-title">
                <CheckCircle size={20} />
                <span>Summary Result</span>
              </div>
              <AudioButton text={summary} />
            </div>
            <div className="result-content-modern">
              <div className="summary-text-modern">{summary}</div>
            </div>
            {stats && (
              <div className="result-footer-modern">
                <span className="model-badge-modern">
                  <Sparkles size={14} />
                  {stats.model}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .summarization-gradient {
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%) !important;
          box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);
        }

        .summarization-input-wrapper {
          background: linear-gradient(135deg, #fdf2f8 0%, #fae8ff 100%);
          border: 2px solid #f9a8d4;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .input-label-modern {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          color: #831843;
          margin-bottom: 12px;
          font-size: 16px;
        }

        .input-badge {
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-left: auto;
        }

        .text-input-modern {
          width: 100%;
          padding: 16px;
          border: 2px solid #f9a8d4;
          border-radius: 12px;
          font-size: 15px;
          font-family: inherit;
          resize: vertical;
          transition: all 0.3s ease;
          background: white;
          line-height: 1.6;
        }

        .text-input-modern:focus {
          outline: none;
          border-color: #ec4899;
          box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
        }

        .char-counter-modern {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 10px;
          font-size: 13px;
          font-weight: 600;
        }

        .char-counter-modern .valid {
          color: #059669;
        }

        .char-counter-modern .invalid {
          color: #dc2626;
        }

        .char-counter-modern .hint {
          color: #f59e0b;
          font-size: 12px;
        }

        .button-group-modern {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .action-button-modern {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 24px;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .primary-gradient {
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);
        }

        .primary-gradient:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(236, 72, 153, 0.4);
        }

        .primary-gradient:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .secondary-outline {
          background: white;
          color: #ec4899;
          border: 2px solid #ec4899;
        }

        .secondary-outline:hover:not(:disabled) {
          background: #fdf2f8;
          transform: translateY(-2px);
        }

        .error-message-modern {
          display: flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          border: 2px solid #ef4444;
          color: #991b1b;
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 20px;
          font-weight: 500;
        }

        .stats-container-modern {
          background: white;
          border: 2px solid #f9a8d4;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .stats-header {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #831843;
          font-weight: 700;
          font-size: 16px;
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 16px;
        }

        .stat-card-modern {
          background: linear-gradient(135deg, #fdf2f8 0%, #fae8ff 100%);
          border: 2px solid #f9a8d4;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s ease;
        }

        .stat-card-modern:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(236, 72, 153, 0.15);
        }

        .stat-card-modern.warning {
          background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
          border-color: #f59e0b;
        }

        .stat-icon {
          font-size: 28px;
          line-height: 1;
        }

        .stat-content {
          flex: 1;
        }

        .stat-label {
          font-size: 11px;
          color: #831843;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 26px;
          font-weight: 800;
          color: #be185d;
          line-height: 1;
          margin-bottom: 2px;
        }

        .stat-unit {
          font-size: 11px;
          color: #9f1239;
          font-weight: 500;
        }

        .stat-value-small {
          font-size: 13px;
          font-weight: 600;
          color: #92400e;
        }

        .result-section-modern {
          background: white;
          border: 2px solid #f9a8d4;
          border-radius: 16px;
          overflow: hidden;
        }

        .result-header-modern {
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
          color: white;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .result-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 16px;
        }

        .result-content-modern {
          padding: 24px;
          background: linear-gradient(135deg, #fdf2f8 0%, #fae8ff 50%, white 100%);
        }

        .summary-text-modern {
          line-height: 1.8;
          color: #1f2937;
          font-size: 15px;
          background: white;
          padding: 20px;
          border-radius: 12px;
          border: 2px solid #fbcfe8;
          box-shadow: 0 2px 8px rgba(236, 72, 153, 0.08);
        }

        .result-footer-modern {
          padding: 16px 24px;
          background: #fdf2f8;
          border-top: 2px solid #f9a8d4;
        }

        .model-badge-modern {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(236, 72, 153, 0.3);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default SummarizationFeature;
