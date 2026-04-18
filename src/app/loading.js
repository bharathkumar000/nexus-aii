"use client";
import React from 'react';

export default function Loading() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#000',
      position: 'relative',
    }}>
      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage:
          'linear-gradient(rgba(0,212,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.02) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />

      {/* Spinner */}
      <div style={{
        width: 48, height: 48,
        border: '2px solid rgba(0,212,255,0.1)',
        borderTop: '2px solid #00d4ff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        boxShadow: '0 0 20px rgba(0,212,255,0.1)',
      }} />

      <p style={{
        marginTop: 28,
        fontSize: '0.6rem',
        color: '#00d4ff',
        fontFamily: 'Orbitron, sans-serif',
        fontWeight: 600,
        letterSpacing: '0.4em',
        textTransform: 'uppercase',
        animation: 'pulse 2s ease-in-out infinite',
        textShadow: '0 0 15px rgba(0,212,255,0.3)',
      }}>
        Initializing Neural Link...
      </p>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
