import React from 'react';
import { motion } from 'framer-motion';
import './AnimatedBackground.css';

function AnimatedBackground() {
  return (
    <div className="animated-background">
      {/* Animated Gradient Blobs */}
      <motion.div
        className="blob blob-1"
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -100, 50, 0],
          scale: [1, 1.2, 0.8, 1],
          rotate: [0, 90, 180, 270, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="blob blob-2"
        animate={{
          x: [0, -150, 100, 0],
          y: [0, 100, -80, 0],
          scale: [1, 0.8, 1.3, 1],
          rotate: [360, 270, 180, 90, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="blob blob-3"
        animate={{
          x: [0, 80, -120, 0],
          y: [0, -120, 80, 0],
          scale: [1, 1.1, 0.9, 1],
          rotate: [0, 120, 240, 360],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Geometric Shapes */}
      <motion.div
        className="geometric-shape circle"
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
          rotate: [0, 360],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      <motion.div
        className="geometric-shape triangle"
        animate={{
          y: [0, 40, 0],
          x: [0, -30, 0],
          rotate: [0, -360],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      <motion.div
        className="geometric-shape square"
        animate={{
          y: [0, -40, 0],
          x: [0, 30, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Floating Rings */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="floating-ring"
          style={{
            left: `${20 + i * 15}%`,
            top: `${10 + i * 20}%`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 360],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Waves */}
      <div className="wave wave1"></div>
      <div className="wave wave2"></div>
      <div className="wave wave3"></div>

      {/* Grid Pattern */}
      <div className="grid-pattern"></div>
    </div>
  );
}

export default AnimatedBackground;
