"use client";
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Cpu, Zap, Search, Shield, Activity } from 'lucide-react';

export default function NeuralStream({ logs = [] }) {
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  if (logs.length === 0) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 20,
        height: '100%', opacity: 0.6
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          border: '1px dashed rgba(245, 197, 66, 0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'spin 10s linear infinite'
        }}>
           <Cpu size={32} color="var(--accent)" style={{ opacity: 0.2 }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ 
            fontFamily: 'Orbitron, sans-serif', fontSize: '0.7rem', 
            color: 'var(--accent)', letterSpacing: '0.2em', marginBottom: 8 
          }}>NEURAL LINK STANDBY</p>
          <p style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
            Awaiting SOC Analyst command input...
          </p>
        </div>
      </div>
    );
  }

  const safeLogs = logs || [];

  return (
    <div style={{ 
      flex: 1, display: 'flex', flexDirection: 'column', 
      gap: 12, fontFamily: 'JetBrains Mono, monospace',
      fontSize: '0.65rem'
    }}>
      <AnimatePresence initial={false}>
        {safeLogs.map((log, i) => (
          <motion.div
            key={log.id || i}
            initial={{ opacity: 0, x: -10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.3 }}
            style={{
              padding: '10px 14px',
              background: log.type === 'error' ? 'rgba(255,59,92,0.05)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${log.type === 'error' ? 'rgba(255,59,92,0.1)' : 'rgba(255,255,255,0.05)'}`,
              borderRadius: 8,
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Type Indicator */}
            <div style={{
              width: 20, height: 20, borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: getLogBackground(log.type),
              flexShrink: 0, marginTop: 2
            }}>
              {getLogIcon(log.type)}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.55rem' }}>[{log.timestamp}]</span>
                <span style={{ 
                  color: getLogColor(log.type), 
                  fontWeight: 700, 
                  fontSize: '0.55rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>{log.layer || 'CORE'}</span>
                {log.status && (
                  <span style={{ 
                    marginLeft: 'auto',
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: 'rgba(255,255,255,0.03)',
                    fontSize: '0.5rem',
                    color: 'rgba(255,255,255,0.4)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>{log.status}</span>
                )}
              </div>
              <p style={{ 
                color: log.type === 'error' ? '#ff3b5c' : 'rgba(255,255,255,0.8)',
                lineHeight: 1.5,
                wordBreak: 'break-all'
              }}>
                {log.message}
              </p>
            </div>

            {/* Subtle Glitch effect for premium feel */}
            {log.type === 'processing' && (
              <motion.div 
                animate={{ x: [-100, 300] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(245, 197, 66, 0.05), transparent)',
                  pointerEvents: 'none'
                }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={endRef} />
    </div>
  );
}

function getLogIcon(type) {
  switch (type) {
    case 'ingest': return <Terminal size={10} color="#f5c542" />;
    case 'detect': return <Search size={10} color="#ffa600" />;
    case 'correlate': return <Activity size={10} color="#ff8400" />;
    case 'output': return <Zap size={10} color="#00ff9d" />;
    case 'error': return <Shield size={10} color="#ff3b5c" />;
    default: return <Cpu size={10} color="rgba(255,255,255,0.5)" />;
  }
}

function getLogColor(type) {
  switch (type) {
    case 'ingest': return '#f5c542';
    case 'detect': return '#ffa600';
    case 'correlate': return '#ff8400';
    case 'output': return '#00ff9d';
    case 'error': return '#ff3b5c';
    default: return 'rgba(255,255,255,0.5)';
  }
}

function getLogBackground(type) {
  const color = getLogColor(type);
  return `${color}15`;
}
