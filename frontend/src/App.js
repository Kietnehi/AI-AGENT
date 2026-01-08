import React, { useState, useEffect } from 'react';
import './App.css';
import SmartChatFeature from './components/SmartChatFeature';
import SearchFeature from './components/SearchFeature';
import MathFeature from './components/MathFeature';
import DataAnalysisFeature from './components/DataAnalysisFeature';
import VisionFeature from './components/VisionFeature';
import LocalLLMFeature from './components/LocalLLMFeature';
import ASRFeature from './components/ASRFeature';
import ImageGenerationFeature from './components/ImageGenerationFeature';
import VideoGenerationFeature from './components/VideoGenerationFeature';
import SummarizationFeature from './components/SummarizationFeature';
import TranslationFeature from './components/TranslationFeature';
import SlideGenerationFeature from './components/SlideGenerationFeature';
import LatexOCRFeature from './components/LatexOCRFeature';
import AnimatedBackground from './components/AnimatedBackground';
import { Sparkles, Search, Calculator, BarChart3, Bot, Zap, Eye, Cpu, Mic, Wand2, Video, FileText, Languages, Presentation, Superscript } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';

function App() {
  const [activeFeature, setActiveFeature] = useState('smart-chat');

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      easing: 'ease-in-out'
    });
  }, []);

  const features = [
    { id: 'smart-chat', name: 'Smart Chat', icon: Sparkles, component: SmartChatFeature, color: '#667eea' },
    { id: 'search', name: 'Tìm Kiếm Web', icon: Search, component: SearchFeature, color: '#f093fb' },
    { id: 'math', name: 'Tính Toán', icon: Calculator, component: MathFeature, color: '#4facfe' },
    { id: 'data', name: 'Phân Tích Dữ Liệu', icon: BarChart3, component: DataAnalysisFeature, color: '#43e97b' },
    { id: 'vision', name: 'Vision AI', icon: Eye, component: VisionFeature, color: '#fa709a' },
    { id: 'latex-ocr', name: 'LaTeX OCR (Image to LaTeX)', icon: Superscript, component: LatexOCRFeature, color: '#9775fa' },
    { id: 'summarization', name: 'Text Summarization', icon: FileText, component: SummarizationFeature, color: '#ec4899' },
    { id: 'translation', name: 'Google Translator', icon: Languages, component: TranslationFeature, color: '#667eea' },
    { id: 'slide-gen', name: 'Slide Generation (Auto)', icon: Presentation, component: SlideGenerationFeature, color: '#8b5cf6' },
    { id: 'image-gen', name: 'Text to Image', icon: Wand2, component: ImageGenerationFeature, color: '#ff6b9d' },
    { id: 'video-gen', name: 'Video Generation (Veo 3.1)', icon: Video, component: VideoGenerationFeature, color: '#8b5cf6' },
    { id: 'local-llm', name: 'Local LLM hoặc API LLM ( Có thể tạo Slide thuyết trình )', icon: Cpu, component: LocalLLMFeature, color: '#30cfd0' },
    { id: 'asr', name: 'Speech Recognition (Whisper)', icon: Mic, component: ASRFeature, color: '#a78bfa' }
  ];

  const ActiveComponent = features.find(f => f.id === activeFeature)?.component;

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="app">
      {/* Animated Background */}
      <AnimatedBackground />

      <motion.header 
        className="header"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
          style={{ display: 'inline-block' }}
        >
          <Bot size={40} style={{ marginBottom: '5px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }} />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          AI Agent
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Zap size={16} style={{ display: 'inline', marginRight: '6px' }} />
          Trợ Lý Thông Minh Đa Năng
        </motion.p>
      </motion.header>

      <motion.div 
        className="main-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        data-aos="zoom-in"
        data-aos-duration="800"
      >
        <motion.div className="feature-selector" variants={itemVariants}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.button
                key={feature.id}
                className={`feature-btn ${activeFeature === feature.id ? 'active' : ''}`}
                onClick={() => setActiveFeature(feature.id)}
                whileHover={{ 
                  scale: 1.03,
                  boxShadow: `0 6px 20px ${feature.color}40`
                }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  animate={activeFeature === feature.id ? {
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.15, 1]
                  } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <Icon size={24} />
                </motion.div>
                {feature.name}
              </motion.button>
            );
          })}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeFeature}
            className="content-area"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {ActiveComponent && <ActiveComponent />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default App;
