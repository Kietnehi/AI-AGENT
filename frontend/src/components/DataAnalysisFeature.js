import React, { useState, useRef } from 'react';
import { dataAPI } from '../api';
import { Upload, FileText, BarChart2 } from 'lucide-react';

function DataAnalysisFeature() {
  const [file, setFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [chartResult, setChartResult] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState('');
  
  const [chartConfig, setChartConfig] = useState({
    type: 'bar',
    x_col: '',
    y_col: '',
    title: ''
  });

  const fileInputRef = useRef(null);

  const chartTypes = [
    { value: 'bar', label: 'Biểu đồ cột' },
    { value: 'line', label: 'Biểu đồ đường' },
    { value: 'scatter', label: 'Biểu đồ phân tán' },
    { value: 'histogram', label: 'Histogram' },
    { value: 'pie', label: 'Biểu đồ tròn' },
    { value: 'box', label: 'Box plot' },
    { value: 'heatmap', label: 'Heatmap' }
  ];

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setLoading(true);
    setSummary('');
    setChartResult('');

    try {
      const response = await dataAPI.uploadCSV(selectedFile);
      setFileInfo(response);
      setColumns(response.columns || []);
      setSummary(response.summary);
      
      if (response.columns && response.columns.length > 0) {
        setChartConfig(prev => ({
          ...prev,
          x_col: response.columns[0],
          y_col: response.columns.length > 1 ? response.columns[1] : response.columns[0]
        }));
      }
    } catch (error) {
      alert(`Lỗi: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      handleFileSelect(droppedFile);
    } else {
      alert('Vui lòng chọn file CSV');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleCreateChart = async () => {
    if (!fileInfo) {
      alert('Vui lòng upload file CSV trước');
      return;
    }

    setLoading(true);
    setChartResult('');

    try {
      const response = await dataAPI.analyzeData('create_chart', chartConfig);
      setChartResult(response.result);
      
      // Extract chart filename from result
      const match = response.result.match(/charts[\\\/](.+\.png)/);
      if (match) {
        setChartResult({
          message: response.result,
          imageUrl: `http://localhost:8000/charts/${match[1]}`
        });
      }
    } catch (error) {
      alert(`Lỗi: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAIAnalyze = async () => {
    if (!fileInfo) {
      alert('Vui lòng upload file CSV trước');
      return;
    }

    if (!aiPrompt.trim()) {
      alert('Vui lòng nhập câu hỏi phân tích');
      return;
    }

    setLoading(true);
    setAiResult('');

    try {
      const response = await dataAPI.analyzeData('ai_analyze', { prompt: aiPrompt });
      setAiResult(response.result);
    } catch (error) {
      alert(`Lỗi: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!fileInfo && (
        <div
          className={`upload-area ${dragOver ? 'dragover' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={48} color="#667eea" />
          <h3 style={{ marginTop: '20px', color: '#667eea' }}>
            Kéo thả file CSV hoặc click để chọn
          </h3>
          <p style={{ color: '#999', marginTop: '10px' }}>
            Hỗ trợ file CSV (tối đa 100MB)
          </p>
          <div className="upload-btn">Chọn File CSV</div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="file-input"
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />
        </div>
      )}

      {loading && <div className="loading">⏳ Đang xử lý...</div>}

      {fileInfo && (
        <div>
          <div className="data-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <FileText size={24} color="#667eea" />
              <h3 style={{ color: '#667eea', margin: 0 }}>
                📁 {fileInfo.filename}
              </h3>
            </div>
            
            <p><strong>Trạng thái:</strong> ✅ {fileInfo.message}</p>
            
            <div style={{ marginTop: '15px' }}>
              <strong>Các cột trong dataset:</strong>
              <div className="columns">
                {columns.map((col, idx) => (
                  <span key={idx} className="column-tag">{col}</span>
                ))}
              </div>
            </div>

            {summary && (
              <div className="summary-text">
                {summary}
              </div>
            )}

            <button
              onClick={() => {
                setFileInfo(null);
                setFile(null);
                setColumns([]);
                setSummary('');
                setChartResult('');
                setAiResult('');
                setAiPrompt('');
                dataAPI.clearData();
              }}
              style={{
                marginTop: '15px',
                padding: '10px 20px',
                background: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Xóa dữ liệu
            </button>
          </div>

          <div style={{ marginTop: '30px', padding: '20px', background: '#f0f4ff', borderRadius: '15px' }}>
            <h3 style={{ color: '#667eea', marginBottom: '15px' }}>🤖 Phân Tích Dữ Liệu với AI</h3>
            <p style={{ color: '#666', marginBottom: '15px' }}>
              Hỏi AI bất cứ điều gì về dữ liệu của bạn!
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="VD: Tổng hợp dữ liệu theo tháng, tìm xu hướng, giá trị bất thường..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAIAnalyze();
                  }
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '2px solid #667eea',
                  borderRadius: '10px',
                  fontSize: '1rem'
                }}
                disabled={loading}
              />
              <button
                onClick={handleAIAnalyze}
                disabled={loading || !aiPrompt.trim()}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading || !aiPrompt.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || !aiPrompt.trim() ? 0.5 : 1
                }}
              >
                Phân Tích
              </button>
            </div>

            {aiResult && (
              <div style={{
                marginTop: '20px',
                padding: '20px',
                background: 'white',
                borderRadius: '10px',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <strong style={{ color: '#667eea', display: 'block', marginBottom: '10px' }}>
                  📊 Kết quả phân tích:
                </strong>
                {aiResult}
              </div>
            )}
          </div>

          <div style={{ marginTop: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <BarChart2 size={24} color="#667eea" />
              <h3 style={{ color: '#667eea', margin: 0 }}>Tạo Biểu Đồ</h3>
            </div>

            <div className="chart-controls">
              <select
                value={chartConfig.type}
                onChange={(e) => setChartConfig({ ...chartConfig, type: e.target.value })}
              >
                {chartTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              <select
                value={chartConfig.x_col}
                onChange={(e) => setChartConfig({ ...chartConfig, x_col: e.target.value })}
              >
                <option value="">-- Chọn cột X --</option>
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>

              <select
                value={chartConfig.y_col}
                onChange={(e) => setChartConfig({ ...chartConfig, y_col: e.target.value })}
              >
                <option value="">-- Chọn cột Y --</option>
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Tiêu đề biểu đồ"
                value={chartConfig.title}
                onChange={(e) => setChartConfig({ ...chartConfig, title: e.target.value })}
              />

              <button
                className="create-chart-btn"
                onClick={handleCreateChart}
                disabled={loading}
              >
                📊 Tạo Biểu Đồ
              </button>
            </div>

            {chartResult && typeof chartResult === 'object' && chartResult.imageUrl && (
              <div className="chart-result">
                <p style={{ color: '#4caf50', fontWeight: '600', marginBottom: '15px' }}>
                  {chartResult.message}
                </p>
                <img src={chartResult.imageUrl} alt="Chart" />
              </div>
            )}

            {chartResult && typeof chartResult === 'string' && (
              <div style={{ 
                marginTop: '15px', 
                padding: '15px', 
                background: '#f8f9fa', 
                borderRadius: '10px',
                color: chartResult.includes('✅') ? '#4caf50' : '#f44336'
              }}>
                {chartResult}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DataAnalysisFeature;
