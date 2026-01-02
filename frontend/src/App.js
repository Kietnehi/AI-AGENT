import React, { useState } from 'react';
import './App.css';
import SearchFeature from './components/SearchFeature';
import MathFeature from './components/MathFeature';
import DataAnalysisFeature from './components/DataAnalysisFeature';
import { Search, Calculator, BarChart3 } from 'lucide-react';

function App() {
  const [activeFeature, setActiveFeature] = useState('search');

  const features = [
    { id: 'search', name: 'Tìm Kiếm Web', icon: Search, component: SearchFeature },
    { id: 'math', name: 'Tính Toán', icon: Calculator, component: MathFeature },
    { id: 'data', name: 'Phân Tích Dữ Liệu', icon: BarChart3, component: DataAnalysisFeature }
  ];

  const ActiveComponent = features.find(f => f.id === activeFeature)?.component;

  return (
    <div className="app">
      <header className="header">
        <h1>🤖 AI Agent</h1>
        <p>Trợ Lý Thông Minh Đa Năng</p>
      </header>

      <div className="main-container">
        <div className="feature-selector">
          {features.map(feature => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.id}
                className={`feature-btn ${activeFeature === feature.id ? 'active' : ''}`}
                onClick={() => setActiveFeature(feature.id)}
              >
                <Icon size={24} />
                {feature.name}
              </button>
            );
          })}
        </div>

        <div className="content-area">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
}

export default App;
