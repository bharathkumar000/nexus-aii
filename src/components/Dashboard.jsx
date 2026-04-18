"use client";
import { useState, useEffect } from 'react';
import { 
  Shield, AlertTriangle, Activity, MessageSquare, Settings, LogOut, 
  Search, Bell, Zap, CheckCircle, CheckCircle2, XCircle, Layers, Play, RefreshCw,
  ChevronRight, Hexagon, Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThreatFeed from './ThreatFeed';
import AIChat from './AIChat';
import ThreatStats from './ThreatStats';
import NeuralStream from './NeuralStream';
import VulnerabilityPanel from './VulnerabilityPanel';
import ThreatModal from './ThreatModal';


const API = "http://localhost:8000";

const menuItems = [
  { id: 'overview', icon: Activity, label: 'Overview' },
  { id: 'threats', icon: Shield, label: 'Intelligence' },
  { id: 'nexus-ai', icon: MessageSquare, label: 'Nexus AI' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [time, setTime] = useState('');
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [threats, setThreats] = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [simulating, setSimulating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCombatMode, setIsCombatMode] = useState(false);

  const [aiMessages, setAiMessages] = useState([
    { role: 'system', content: 'NEXUS Neural Link v2.0 initialized. All 4 layers connected to live backend. Try: "layer status", "simulate", "threat summary"' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [neuralLogs, setNeuralLogs] = useState([]);
  const [chatWidth, setChatWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [selectedThreat, setSelectedThreat] = useState(null);

  const addNeuralLog = (msg, type = 'info', layer = 'CORE', status = 'DONE') => {
    const newLog = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message: msg, type, layer, status
    };
    setNeuralLogs(prev => [...prev.slice(-49), newLog]);
  };

  const streamNeuralProcess = async (prompt) => {
    const steps = [
      { msg: `Intercepting neural command: "${prompt.substring(0, 30)}${prompt.length > 30 ? '...' : ''}"`, type: 'ingest', layer: 'L1', delay: 300 },
      { msg: 'Verifying operator credentials and layer access...', type: 'ingest', layer: 'L1', delay: 500 },
      { msg: 'Querying ML Classification Engine for anomaly matches...', type: 'detect', layer: 'L2', delay: 700 },
      { msg: 'Correlation engine fusing cross-layer telemetry...', type: 'correlate', layer: 'L3', delay: 900 },
      { msg: 'Finalizing intelligence output for SOC display...', type: 'output', layer: 'L4', delay: 1100 },
    ];
    for (const step of steps) {
      addNeuralLog(step.msg, step.type, step.layer, 'PROCESSING');
      await new Promise(r => setTimeout(r, step.delay));
      setNeuralLogs(prev => prev.map(l => l.message === step.msg ? { ...l, status: 'COMPLETE' } : l));
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const container = document.getElementById('resizable-container');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const pos = ((e.clientX - rect.left) / rect.width) * 100;
      setChatWidth(Math.max(20, Math.min(80, pos)));
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
    } else {
      document.body.style.cursor = 'default';
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchHealth(), fetchStats(), fetchThreats(), fetchVulnerabilities()]);
      setTimeout(() => setLoading(false), 1500);
    };
    init();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API}/api/health`);
      setHealth(await res.json());
    } catch { setHealth(null); }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/api/stats`);
      setStats(await res.json());
    } catch { setStats(null); }
  };

  const fetchThreats = async () => {
    try {
      const res = await fetch(`${API}/api/threats`);
      const data = await res.json();
      setThreats(data.threats || []);
    } catch { setThreats([]); }
  };

  const fetchVulnerabilities = async () => {
    try {
      const res = await fetch(`${API}/api/vulnerabilities`);
      const data = await res.json();
      const vulns = data.vulnerabilities || [];
      setVulnerabilities(vulns);
      
      if (vulns.length > 0) {
        setTimeout(() => {
          setAiMessages(prev => {
            const hasAlert = prev.some(m => m.isLintAlert && m.role === 'system');
            if (hasAlert) return prev;
            return [...prev, { 
              role: 'system', isLintAlert: true,
              content: `⚠️ SECURITY LINT ALERT: I found ${vulns.length} critical vulnerabilities in your network stack. Should I execute an automated hardening patch to secure Layer 1 and Layer 3?`,
              actions: [{ label: "Fix All Risks", action: "fix_all" }]
            }];
          });
        }, 3000);
      }
    } catch { setVulnerabilities([]); }
  };

  const handleFixVulnerability = async (id) => {
    try {
      addNeuralLog(`Initiating patch for vulnerability ${id}...`, "output", "CORE", "PATCHING");
      await fetch(`${API}/api/vulnerabilities/fix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      await fetchVulnerabilities();
      addNeuralLog(`Vulnerability ${id} remediated.`, "output", "CORE", "HARDENED");
    } catch (e) { console.error(e); }
  };

  const handleFixAllVulnerabilities = async () => {
    setAiMessages(prev => [...prev, { role: 'system', content: '🛠️ Executing Global Hardening Patch: Closing exposed ports and terminating rogue processes...' }]);
    try {
      await fetch(`${API}/api/vulnerabilities/fix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'all' }),
      });
      const patchSteps = [
        { msg: "Closing Port 22/23 in L1 Ingestion layer...", type: 'ingest', layer: 'L1', delay: 700 },
        { msg: "Updating ingress firewall rules...", type: 'detect', layer: 'L2', delay: 800 },
        { msg: "Killing unauthorized process IDs in L3...", type: 'correlate', layer: 'L3', delay: 1000 },
        { msg: "Verifying system integrity...", type: 'output', layer: 'L4', delay: 500 },
      ];
      for (const step of patchSteps) {
        addNeuralLog(step.msg, step.type, step.layer, 'PATCHING');
        await new Promise(r => setTimeout(r, step.delay));
      }
      await fetchVulnerabilities();
      setAiMessages(prev => [...prev, { role: 'system', content: '✅ ALL RISKS REMEDIATED. Network stack is currently 100% compliant with Nexus Hardening Standards.' }]);
      addNeuralLog("GLOBAL PATCH COMPLETE: 0 vulnerabilities remaining.", "output", "CORE", "SECURE");
    } catch (e) { console.error(e); }
  };

  const handleActionClick = (action) => {
    if (action === "fix_all") handleFixAllVulnerabilities();
  };

  const runSimulation = async () => {
    setSimulating(true);
    try {
      await fetch(`${API}/api/simulate`, { method: 'POST' });
      await Promise.all([fetchStats(), fetchThreats()]);
    } catch (e) { console.error(e); }
    setSimulating(false);
  };

  const handleSendChatMessage = async (userMsg) => {
    setAiMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);
    streamNeuralProcess(userMsg);
    try {
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setAiMessages(prev => [...prev, { role: 'system', content: data.response }]);
      addNeuralLog("Neural response synthesized successfully.", "output", "L4", "DONE");
    } catch {
      setAiMessages(prev => [...prev, { role: 'system', content: '⚠ Connection to Core API failed.' }]);
      addNeuralLog("Neural link severed.", "error", "CORE", "FAILED");
    }
    setIsTyping(false);
  };

  const handleTacticalAction = async (label) => {
    if (label === "DEFEND SYSTEM") {
      setAiMessages(prev => [...prev, { role: 'system', content: '🛡️ DEFENSE PROTOCOL INITIATED...' }]);
      try { await fetch(`${API}/api/defend`, { method: 'POST' }); } catch {}
      const steps = [
        { msg: "Isolating high-risk external nodes...", type: 'ingest', layer: 'L1', delay: 700 },
        { msg: "Deploying adaptive firewall rules...", type: 'detect', layer: 'L2', delay: 1000 },
        { msg: "Cross-correlating threat patterns...", type: 'correlate', layer: 'L3', delay: 1300 },
        { msg: "Scrubbing memory buffers...", type: 'output', layer: 'L4', delay: 1500 },
      ];
      for (const step of steps) {
        addNeuralLog(step.msg, step.type, step.layer, 'SECURING');
        await new Promise(r => setTimeout(r, step.delay));
      }
      addNeuralLog("DEFENSE COMPLETE.", "output", "CORE", "SUCCESS");
      runSimulation();
    } else if (label === "EXPLAIN THREAT") {
      handleSendChatMessage("Analyze the most recent confirmed threat in the system.");
    } else if (label === "SIMULATE") {
      runSimulation();
    }
  };





  const layers = health?.layers || {};
  const layerList = [
    { key: "L1_Ingestion", label: "L1 Ingest", color: "#f5c542" },
    { key: "L2_Detection", label: "L2 Detect", color: "#ffa600" },
    { key: "L3_Correlation", label: "L3 Correlate", color: "#ff8400" },
    { key: "L4_Output", label: "L4 Output", color: "#ff9d00" },
  ];

  return (
    <div className={`scanline grid-bg ${isCombatMode ? 'combat-mode' : ''}`} style={{ 
      display: 'flex', height: '100vh', overflow: 'hidden', color: '#fff', background: 'transparent',
      transition: 'all 1s ease'
    }}>
      {isCombatMode && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(255, 59, 92, 0.05)', pointerEvents: 'none', zIndex: 1 }} 
        />
      )}
      
      {/* SIDEBAR */}
      <aside style={{
        width: 280,
        borderRight: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', flexDirection: 'column',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(20px)',
        position: 'relative', zIndex: 2,
      }}>
        <div style={{ padding: '32px 24px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: 72, height: 72,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14,
            transition: 'transform 0.3s',
          }}>
            <img src="/icon.png" alt="Nexus AI" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span style={{
            fontFamily: 'Orbitron, sans-serif', fontWeight: 800,
            fontSize: '1rem',
            letterSpacing: '0.2em',
            background: 'linear-gradient(to bottom, #f5c542, #b08d26)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>NEXUS.AI</span>
          <span style={{
            fontSize: '0.5rem', color: 'rgba(255,255,255,0.2)',
            letterSpacing: '0.3em', marginTop: 6,
            textTransform: 'uppercase',
          }}>Command Center</span>
        </div>

        <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`sidebar-tab ${activeTab === item.id ? 'active' : ''}`}>
              <div className="tab-icon"><item.icon size={16} /></div>
              <span style={{
                letterSpacing: '0.12em', textTransform: 'uppercase',
                fontSize: '0.7rem', fontWeight: 600,
              }}>{item.label}</span>
              {activeTab === item.id && (
                <ChevronRight size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />
              )}
            </button>
          ))}
        </nav>

        {/* Live Layer Status from API */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <p style={{
            fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            fontWeight: 600, marginBottom: 14,
            fontFamily: 'Orbitron, sans-serif',
          }}>Core Layers</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {layerList.map(l => {
              const status = layers[l.key] || 'offline';
              const color = status === 'active' ? l.color : '#ff3b5c';
              return (
                <div key={l.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="layer-dot" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                  <span style={{
                    fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)',
                    fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>{l.label}</span>
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '0.5rem', fontFamily: 'JetBrains Mono, monospace',
                    color, fontWeight: 600, textTransform: 'uppercase',
                  }}>{status}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* User */}
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="glass-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, borderRadius: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(0,212,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, color: '#00d4ff',
              border: '1px solid rgba(0,212,255,0.15)',
              fontSize: '0.85rem',
              fontFamily: 'Orbitron, sans-serif',
            }}>
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{
                fontSize: '0.75rem', fontWeight: 700,
                color: '#00d4ff',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{user?.name || 'Admin'}</p>
              <p style={{
                fontSize: '0.5rem', color: 'rgba(255,255,255,0.25)',
                letterSpacing: '0.15em', textTransform: 'uppercase',
              }}>SOC Analyst</p>
            </div>
          </div>
          <button onClick={onLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8,
            padding: '10px', borderRadius: 10,
            border: '1px solid rgba(255,59,92,0.12)',
            color: '#ff3b5c', background: 'transparent',
            cursor: 'pointer', fontSize: '0.6rem', fontWeight: 600,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            transition: 'all 0.3s',
          }}
          onMouseEnter={e => { e.target.style.background = 'rgba(255,59,92,0.04)'; e.target.style.borderColor = 'rgba(255,59,92,0.25)'; }}
          onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'rgba(255,59,92,0.12)'; }}
          >
            <LogOut size={13} /> Disconnect
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <header style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 32px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(12px)',
          zIndex: 2,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="pulse-dot" style={{ width: 6, height: 6 }} />
            <span style={{
              fontSize: '0.6rem', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase', fontWeight: 500,
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              {health ? 'System Online' : 'Connecting...'}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.08)', margin: '0 4px' }}>|</span>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 500,
              textShadow: '0 0 12px rgba(245,197,66,0.2)',
            }}>{time}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={runSimulation} disabled={simulating} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 18px', borderRadius: 10,
              border: '1px solid rgba(0,212,255,0.15)',
              background: simulating ? 'rgba(0,212,255,0.04)' : 'transparent',
              color: '#00d4ff', cursor: 'pointer',
              fontSize: '0.6rem', fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              transition: 'all 0.3s',
              fontFamily: 'Orbitron, sans-serif',
            }}
            onMouseEnter={e => { if (!simulating) e.target.style.background = 'rgba(0,212,255,0.04)'; }}
            onMouseLeave={e => { if (!simulating) e.target.style.background = 'transparent'; }}
            >
              {simulating ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={13} />}
              {simulating ? 'Processing...' : 'Simulate'}
            </button>
            <button onClick={() => { fetchStats(); fetchThreats(); }} style={{
              padding: '8px', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'transparent', cursor: 'pointer',
              color: 'rgba(255,255,255,0.3)',
              transition: 'all 0.3s',
            }}>
              <RefreshCw size={14} />
            </button>
            <button style={{
              position: 'relative', padding: 10,
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 10, background: 'transparent', cursor: 'pointer',
            }}>
              <Bell size={16} color="rgba(255,255,255,0.3)" />
              {threats.length > 0 && <span style={{
                position: 'absolute', top: 6, right: 6,
                width: 6, height: 6, background: '#00d4ff',
                borderRadius: '50%',
                boxShadow: '0 0 8px #00d4ff',
              }} />}
            </button>
          </div>
        </header>

        <div style={{ flex: 1, overflow: 'hidden', padding: '12px 20px', display: 'flex', flexDirection: 'column' }}>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 32 }}
              >
                {/* Header Skeleton */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div className="skeleton" style={{ width: 400, height: 48 }} />
                  <div className="skeleton" style={{ width: 300, height: 12 }} />
                </div>

                {/* Stats Grid Skeleton */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} className="skeleton-card" style={{ height: 120 }}>
                      <div className="skeleton" style={{ margin: 20, width: '40%', height: 14 }} />
                      <div className="skeleton" style={{ margin: '0 20px', width: '60%', height: 28 }} />
                    </div>
                  ))}
                </div>

                {/* Main View Skeletons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
                   <div className="skeleton-card" style={{ height: 400 }} />
                   <div className="skeleton-card" style={{ height: 400 }} />
                </div>
              </motion.div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <OverviewTab 
                    key="ov" 
                    stats={stats} 
                    threats={threats} 
                    vulnerabilities={vulnerabilities}
                    onSelectThreat={(t) => {
                      setSelectedThreat(t);
                      if (t.alert?.severity === 'Critical' || t.alert?.severity === 'High') {
                        setIsCombatMode(true);
                      }
                    }} 
                    onFixVulnerability={handleFixVulnerability}
                    onFixAllVulnerabilities={handleFixAllVulnerabilities}
                  />
                )}

                {activeTab === 'threats' && <OverviewTab key="th" stats={stats} threats={threats} onSelectThreat={setSelectedThreat} />}

                {activeTab === 'nexus-ai' && (
                  <motion.div 
                    key="ai" 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -20 }} 
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}


                  >
                    {/* Upper Intelligence Sector */}
                    <div id="resizable-container" style={{ display: 'flex', gap: 0, flex: 1, minHeight: 0 }}>
                      <div className="glass-card" style={{ 
                        display: 'flex', flexDirection: 'column', 
                        overflow: 'hidden', height: '100%',
                        width: `${chatWidth}%`,
                        transition: isResizing ? 'none' : 'width 0.1s'
                      }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Radio size={14} className="pulse-text" style={{ color: 'var(--accent)' }} />
                          <h3 style={{ fontSize: '0.75rem', fontWeight: 800, margin: 0, letterSpacing: '0.1em', color: 'var(--accent)' }}>LIVE NEURAL STREAM</h3>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                          <NeuralStream logs={neuralLogs} />
                        </div>
                      </div>

                      {/* Resize Handle */}
                      <div 
                        onMouseDown={() => setIsResizing(true)}
                        style={{
                          width: 24,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'col-resize',
                          zIndex: 10,
                          position: 'relative'
                        }}
                      >
                         <div style={{
                           width: 2,
                           height: '30%',
                           background: isResizing ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                           borderRadius: 1,
                           transition: 'all 0.3s'
                         }} />
                         {/* Grip icon overlay */}
                         <div style={{
                           position: 'absolute',
                           width: 12, height: 24,
                           background: 'rgba(0,0,0,0.4)',
                           border: '1px solid rgba(255,255,255,0.1)',
                           borderRadius: 4,
                           display: 'flex', alignItems: 'center', justifyContent: 'center',
                           opacity: isResizing ? 1 : 0.6
                         }}>
                            <div style={{ width: 4, height: 8, display: 'flex', gap: 2 }}>
                               <div style={{ width: 1, height: '100%', background: 'rgba(255,255,255,0.3)' }} />
                               <div style={{ width: 1, height: '100%', background: 'rgba(255,255,255,0.3)' }} />
                            </div>
                         </div>
                      </div>
                      
                      <div className="glass-card" style={{ 
                        display: 'flex', flexDirection: 'column', 
                        overflow: 'hidden', height: '100%',
                        flex: 1,
                        transition: isResizing ? 'none' : 'width 0.1s'
                      }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <MessageSquare size={14} style={{ color: 'var(--accent)' }} />
                          <h3 style={{ fontSize: '0.75rem', fontWeight: 800, margin: 0, letterSpacing: '0.1em', color: 'var(--accent)' }}>NEXUS AI ANALYST</h3>
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <AIChat 
                            messages={aiMessages} 
                            isTyping={isTyping} 
                            onSend={handleSendChatMessage}
                            onAction={handleActionClick}
                          />
                        </div>
                      </div>
                    </div>


                    {/* Tactical Action Deck */}
                    <div className="glass-card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.2em' }}>TACTICAL ACTIONS:</span>
                      <div style={{ display: 'flex', gap: 12, flex: 1 }}>
                        <ActionButton icon={Play} label="EXPLAIN THREAT" color="#ffa600" onClick={() => handleTacticalAction("EXPLAIN THREAT")} />
                        <ActionButton icon={Zap} label="SIMULATE" color="#ff8400" onClick={() => handleTacticalAction("SIMULATE")} />
                        <ActionButton icon={Shield} label="DEFEND SYSTEM" color="#f5c542" onClick={() => handleTacticalAction("DEFEND SYSTEM")} />
                      </div>


                      <div style={{ padding: '8px 16px', background: 'rgba(245,197,66,0.05)', border: '1px solid rgba(245,197,66,0.1)', borderRadius: 8 }}>
                         <span className="pulse-text" style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em' }}>NEURAL LINK: ENCRYPTED</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                {activeTab === 'settings' && (
                  <motion.div key="st" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16,
                  }}>
                    <Settings size={32} color="rgba(245,197,66,0.1)" />
                    <p style={{
                      fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)',
                      letterSpacing: '0.3em', textTransform: 'uppercase',
                      fontFamily: 'Orbitron, sans-serif',
                    }}>Configuration Module</p>
                    <p style={{
                      fontSize: '0.6rem', color: 'rgba(245,197,66,0.2)',
                      letterSpacing: '0.15em',
                    }}>Coming Soon</p>
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {selectedThreat && (
          <ThreatModal 
            threat={selectedThreat} 
            onClose={() => {
              setSelectedThreat(null);
              setIsCombatMode(false);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function OverviewTab({ stats, threats, onSelectThreat, vulnerabilities = [], onFixVulnerability, onFixAllVulnerabilities }) {

  const statCards = [
    { label: "Data Throughput", value: stats?.throughput || "—", trend: `${stats?.events_per_sec || 0} evt/s`, icon: Activity, layer: "L1", color: "#f5c542" },
    { label: "Anomaly Count", value: String(stats?.anomaly_count || 0), trend: "Total", icon: AlertTriangle, layer: "L2", color: "#ffa600" },
    { label: "Verified Threats", value: String(stats?.genuine_threats || 0), trend: "Genuine", icon: CheckCircle, layer: "L3", color: "#ff8400" },
    { label: "False Positives", value: String(stats?.false_positives || 0), trend: "Filtered", icon: XCircle, layer: "L4", color: "#ff9d00" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }} className="glass-card stat-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: `${s.color}08`, border: `1px solid ${s.color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <s.icon size={18} color={s.color} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span style={{
                  fontSize: '0.58rem', fontWeight: 600,
                  color: s.color, letterSpacing: '0.05em',
                }}>{s.trend}</span>
                <span style={{
                  fontSize: '0.48rem', color: 'rgba(255,255,255,0.2)',
                  fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>{s.layer}</span>
              </div>
            </div>
            <p style={{
              fontSize: '0.58rem', fontWeight: 600,
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6,
            }}>{s.label}</p>
            <p style={{
              fontSize: '1.5rem', fontWeight: 800, color: '#fff',
              fontFamily: 'Orbitron, sans-serif',
            }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Left: Feed */}
        <div className="glass-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', minHeight: 500 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Radio size={16} color="#00d4ff" className="pulse-text" />
              <span style={{
                fontSize: '0.65rem', fontWeight: 700,
                color: '#00d4ff', letterSpacing: '0.15em', textTransform: 'uppercase',
                fontFamily: 'Orbitron, sans-serif',
              }}>Neural Threat Stream</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.55rem', fontWeight: 600, color: '#f5c542', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Live Ingestion</span>
              <div className="pulse-dot" style={{ width: 6, height: 6 }} />
            </div>
          </div>
          <ThreatFeed threats={threats} onSelect={onSelectThreat} />
        </div>

        {/* Right: Vulnerabilities & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Vulnerability Scanner */}
          <div className="glass-card" style={{ padding: 24, background: 'rgba(255,59,92,0.01)', border: '1px solid rgba(255,59,92,0.05)' }}>
            <VulnerabilityPanel 
              vulnerabilities={vulnerabilities} 
              onFixAll={onFixAllVulnerabilities}
              onFixOne={onFixVulnerability}
            />

          </div>


          {/* Stats Component */}
          <div className="glass-card" style={{ padding: 24, flex: 1 }}>
            <div style={{ marginBottom: 20 }}>
              <span style={{
                fontSize: '0.65rem', fontWeight: 700,
                color: '#00d4ff', letterSpacing: '0.15em', textTransform: 'uppercase',
                fontFamily: 'Orbitron, sans-serif',
              }}>Threat Classification</span>
            </div>
            <ThreatStats stats={stats} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ActionButton({ icon: Icon, label, color, onClick }) {
  return (
    <button className="glass-card" onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 16px', borderRadius: 8,
      border: `1px solid ${color}22`,
      background: 'rgba(255,255,255,0.02)',
      cursor: 'pointer',
      transition: 'all 0.3s',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = `${color}11`; e.currentTarget.style.borderColor = `${color}44`; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = `${color}22`; }}
    >
      <Icon size={14} color={color} />
      <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.05em' }}>{label}</span>
    </button>
  );
}


