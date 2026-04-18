"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Cpu, Activity, Zap, CheckCircle2, Terminal, AlertTriangle } from 'lucide-react';

export default function ThreatModal({ threat, onClose }) {
  if (!threat) return null;

  const alert = threat.alert || {};
  const isCritical = alert.severity === 'Critical' || alert.severity === 'High';

  const layers = [
    { 
      id: 'L1', 
      name: 'Ingestion Pipeline', 
      icon: Terminal, 
      status: 'Captured',
      color: '#f5c542',
      data: `RAW_BUF: ${btoa(threat.id || 'NEXUS').substring(0, 16)}...`,
      insight: `Normalized from ${threat.raw_source || 'syslog'} source stream.`
    },
    { 
      id: 'L2', 
      name: 'ML Classification', 
      icon: Cpu, 
      status: 'Analyzed',
      color: '#ffa600',
      data: `Conf: ${alert.confidence_score}%`,
      insight: `Ensemble (XGB+RF) flagged ${alert.threat_type} signature.`
    },
    { 
      id: 'L3', 
      name: 'Neural Correlation', 
      icon: Activity, 
      status: 'Correlated',
      color: '#ff8400',
      data: `Nodes: ${Math.floor(Math.random() * 50) + 12}`,
      insight: alert.cross_layer_match || 'Primary entry point detected. No lateral movement yet.'
    },
    { 
      id: 'L4', 
      name: 'Expert Output', 
      icon: Zap, 
      status: 'Stabilized',
      color: '#00ff9d',
      data: 'READY',
      insight: 'Playbook generated and injected into operator console.'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
        padding: 20
      }}
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="glass-card"
        style={{
          width: '100%', maxWidth: 800,
          background: 'rgba(10,10,10,0.95)',
          border: `1px solid ${isCritical ? 'rgba(255,59,92,0.2)' : 'rgba(245,197,66,0.1)'}`,
          boxShadow: isCritical ? '0 0 50px rgba(255,59,92,0.1)' : '0 0 50px rgba(0,0,0,0.5)',
          overflow: 'hidden', cursor: 'default'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: isCritical ? 'linear-gradient(90deg, rgba(255,59,92,0.05), transparent)' : 'transparent'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <span style={{ 
                fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', 
                color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' 
              }}>{threat.id}</span>
              <span className={`badge ${isCritical ? 'badge-critical' : 'badge-high'}`}>{alert.severity}</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', margin: 0 }}>{alert.threat_type}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', height: 500 }}>
          {/* Left: Forensic Path */}
          <div style={{ padding: 32, borderRight: '1px solid rgba(255,255,255,0.05)', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 24 }}>Neural Forensic Path</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative' }}>
               {/* Vertical line connector */}
               <div style={{ 
                 position: 'absolute', left: 16, top: 12, bottom: 12, 
                 width: 1, background: 'linear-gradient(to bottom, #f5c542, #00ff9d)' 
               }} />

               {layers.map((layer, i) => (
                 <div key={layer.id} style={{ display: 'flex', gap: 20, position: 'relative', zIndex: 1 }}>
                    <div style={{ 
                      width: 34, height: 34, borderRadius: 8, 
                      background: 'rgba(0,0,0,0.8)', border: `1px solid ${layer.color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 0 10px ${layer.color}10`
                    }}>
                      <layer.icon size={16} color={layer.color} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <h4 style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 700, margin: 0 }}>{layer.name}</h4>
                        <span style={{ fontSize: '0.5rem', color: layer.color, fontWeight: 700, textTransform: 'uppercase' }}>{layer.status}</span>
                      </div>
                      <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, margin: 0 }}>{layer.insight}</p>
                      <div style={{ 
                        marginTop: 8, padding: '4px 8px', background: 'rgba(0,0,0,0.3)', 
                        borderRadius: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem',
                        color: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.03)'
                      }}>
                        {layer.data}
                      </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Right: Tactical Action */}
          <div style={{ padding: 32, background: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 24 }}>Tactical Playbook</h3>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
               {[
                 { step: '1. ISOLATE SOURCE', desc: `Lockdownd ${alert.source || 'IP-88.12'} perimeter.` },
                 { step: '2. RE-ROUTE TRAFFIC', desc: 'Activate blackhole injection sub-routine.' },
                 { step: '3. CAPTURE TELEMETRY', desc: 'Secure pcaps for post-mortem analysis.' },
                 { step: '4. NOTIFY SYSTEMS', desc: 'Update CloudFlare and AWS WAF edge nodes.' }
               ].map((item, i) => (
                 <div key={i} className="glass-card" style={{ padding: 12, border: '1px solid rgba(255,255,255,0.03)', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, border: '1px solid #00ff9d', background: 'rgba(0,255,157,0.05)' }} />
                    <div>
                      <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#fff', margin: 0 }}>{item.step}</p>
                      <p style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>

            <button style={{
              marginTop: 32, width: '100%', padding: '16px', borderRadius: 12,
              background: '#00ff9d', color: '#000', fontWeight: 900,
              fontSize: '0.75rem', letterSpacing: '0.1em', border: 'none',
              cursor: 'pointer', boxShadow: '0 0 20px rgba(0,255,157,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
            }}>
              <CheckCircle2 size={18} />
              EXECUTE ALL MEASURES
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
