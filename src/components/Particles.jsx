import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const Particles = ({ count = 30 }) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      type: Math.random() > 0.6 ? (Math.random() > 0.5 ? 'leaf' : 'lightning') : 'dot',
      size: Math.random() * 8 + 4,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: p.left, top: p.top }}
          animate={{
            y: [0, -100 - p.size * 10],
            x: Math.random() > 0.5 ? [0, 50, 0] : [0, -50, 0],
            opacity: [0, 0.8, 0],
            rotate: p.type !== 'dot' ? [0, 360] : 0
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
            delay: p.delay
          }}
        >
          {p.type === 'dot' && (
            <div 
              className="rounded-full"
              style={{ width: p.size, height: p.size, backgroundColor: '#22c55e', boxShadow: '0 0 8px #22c55e' }}
            />
          )}
          {p.type === 'leaf' && (
            <div style={{ color: 'rgba(34, 197, 94, 0.8)', fontSize: p.size * 1.5 }}>
              🍃
            </div>
          )}
          {p.type === 'lightning' && (
            <div style={{ color: 'rgba(245, 158, 11, 0.8)', fontSize: p.size * 1.5, textShadow: '0 0 8px rgba(245,158,11,0.5)' }}>
              ⚡
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default Particles;
