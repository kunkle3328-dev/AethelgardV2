
import React, { useState, useEffect, useMemo } from 'react';
import { Hexagon, ShieldAlert, Cpu, Network, Zap, Activity, Radio, Database } from 'lucide-react';

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [bootPhase, setBootPhase] = useState('INITIALIZING');
  const [currentLogs, setCurrentLogs] = useState<string[]>([]);
  const [isExiting, setIsExiting] = useState(false);

  // Cinematic Kernel Logs
  const bootLogs = useMemo(() => [
    "[ 0.000000] INITIALIZING AETHELGARD KERNEL V4.2.0-STABLE",
    "[ 0.000142] 0xFD22: ALLOCATING NEURAL BUFFER [16.4 GB]",
    "[ 0.000451] 0xFD45: MOUNTING ENCRYPTED VAULT [SECTOR_7]",
    "[ 0.001290] SYSTEM: SCANNING LOCAL NODES...",
    "[ 0.004122] NODE_01: SYNCED [LATENCY 2ms]",
    "[ 0.005510] NODE_02: SYNCED [LATENCY 4ms]",
    "[ 0.010211] 0xAE11: DECRYPTING COLD STORAGE KEYS",
    "[ 0.042100] HANDSHAKE: SATELLITE RELAY 09-X [OK]",
    "[ 0.102144] BIOMETRIC INTERFACE: AUTHORIZED",
    "[ 0.442111] CORE: NEURAL GRAPH MAPPING IN PROGRESS",
    "[ 0.892144] SYNCHRONIZING PERSISTENT DATA CLUSTERS",
    "[ 1.210042] RESONANCE CALIBRATION: OPTIMAL",
    "[ 2.441021] BYPASSING SUB-SPACE LATENCY GATE",
    "[ 3.892100] UPLINK STABLE. WELCOME, STRATEGIST."
  ], []);

  useEffect(() => {
    const duration = 4500; // 4.5 seconds cinematic boot
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const nextProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(nextProgress);

      if (nextProgress < 25) setBootPhase('KERNEL_INIT');
      else if (nextProgress < 50) setBootPhase('NODE_SCAN');
      else if (nextProgress < 85) setBootPhase('NEURAL_SYNC');
      else setBootPhase('CORE_ONLINE');

      if (nextProgress >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(onComplete, 1200);
        }, 800);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    const logInterval = setInterval(() => {
      if (progress < 100) {
        const logIndex = Math.floor((progress / 100) * bootLogs.length);
        const newLog = bootLogs[logIndex];
        setCurrentLogs(prev => {
          if (prev[prev.length - 1] === newLog) return prev;
          return [...prev.slice(-5), newLog];
        });
      }
    }, 120);
    return () => clearInterval(logInterval);
  }, [progress, bootLogs]);

  return (
    <div className={`fixed inset-0 z-[500] bg-black flex flex-col items-center justify-center transition-all duration-1000 ease-in-out px-6 overflow-hidden ${isExiting ? 'opacity-0 scale-150 blur-3xl pointer-events-none' : 'opacity-100'}`}>
      
      {/* Background Neural Grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1),transparent_80%)]"></div>
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(rgba(220,38,38,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,0.05) 1px, transparent 1px)', 
          backgroundSize: '40px 40px',
          transform: 'perspective(1000px) rotateX(60deg) translateY(-100px) scale(2)',
          transformOrigin: 'top'
        }}></div>
        <div className="scanline"></div>
      </div>

      <div className="relative flex flex-col items-center gap-8 md:gap-14 max-w-2xl w-full">
        
        {/* Cinematic Neural Assembly Logo */}
        <div className="relative group perspective-1000">
          <div className="absolute -inset-12 md:-inset-24 bg-red-600/10 blur-[60px] md:blur-[100px] animate-pulse rounded-full"></div>
          
          <div className="relative w-36 h-36 md:w-56 md:h-56 flex items-center justify-center">
            {/* Outer Shield - Slow Rotation */}
            <div className="absolute inset-0 animate-[spin_15s_linear_infinite] opacity-10">
              <Hexagon className="w-full h-full text-red-900" strokeWidth={0.5} />
            </div>
            
            {/* Mid Ring - Counter Rotation */}
            <div className="absolute inset-4 md:inset-6 animate-[spin_8s_linear_infinite_reverse] opacity-30">
              <Hexagon className="w-full h-full text-red-700" strokeWidth={1} />
            </div>
            
            {/* Inner Core - Floating Pulse */}
            <div className="relative animate-float">
              <Hexagon className="w-20 h-20 md:w-32 md:h-32 text-red-600 fill-red-600/5 drop-shadow-[0_0_30px_rgba(220,38,38,0.6)]" strokeWidth={1.5} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-ping opacity-75"></div>
              </div>
            </div>

            {/* Orbital Indicators */}
            <div className="absolute inset-0 animate-spin-slow pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]"></div>
            </div>
          </div>
        </div>

        {/* Brand Identity */}
        <div className="space-y-4 text-center w-full z-10">
          <div className="relative inline-block">
             <h1 className="orbitron text-4xl sm:text-5xl md:text-7xl font-black tracking-[0.2em] md:tracking-[0.4em] text-glow-red text-white uppercase mb-2 animate-in fade-in duration-1000">
                AETHEL<span className="text-red-600">GARD</span>
             </h1>
             <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[7px] md:text-[9px] orbitron text-zinc-600 tracking-[0.4em] md:tracking-[0.6em] uppercase font-black whitespace-nowrap">
                <ShieldAlert className="w-2.5 h-2.5 text-red-900" /> Security Protocol v4.2 Active
             </div>
          </div>
          
          <div className="flex justify-center items-center gap-6 md:gap-10 text-zinc-800">
             <Cpu className={`w-4 h-4 transition-all duration-700 ${progress > 20 ? 'text-red-500 scale-125' : ''}`} />
             <Network className={`w-4 h-4 transition-all duration-700 ${progress > 50 ? 'text-red-500 scale-125' : ''}`} />
             <Activity className={`w-4 h-4 transition-all duration-700 ${progress > 80 ? 'text-red-500 scale-125' : ''}`} />
             <Radio className={`w-4 h-4 transition-all duration-700 ${progress > 95 ? 'text-red-500 scale-125' : ''}`} />
          </div>
        </div>

        {/* Diagnostic Loading Interface */}
        <div className="w-full space-y-6 md:space-y-10">
          <div className="flex justify-between items-end px-2">
             <div className="space-y-1">
                <div className="orbitron text-[8px] md:text-[10px] font-black text-red-600 tracking-[0.2em] uppercase flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-red-600 animate-pulse"></div>
                   Status: {bootPhase.replace('_', ' ')}
                </div>
                <div className="text-[7px] md:text-[8px] orbitron text-zinc-700 font-bold uppercase tracking-tight flex items-center gap-2">
                   <Database className="w-2 h-2" /> Sector Scan: 0x00{Math.floor(progress * 42).toString(16).toUpperCase()}
                </div>
             </div>
             <div className="orbitron text-lg md:text-3xl font-black text-white tracking-tighter tabular-nums">
                {Math.floor(progress).toString().padStart(2, '0')}%
             </div>
          </div>

          <div className="h-1.5 w-full bg-zinc-900/40 rounded-full overflow-hidden relative border border-white/5 p-[1px]">
            <div 
              className="h-full bg-red-600 transition-all duration-300 ease-out relative shadow-[0_0_20px_rgba(220,38,38,0.8)] rounded-full" 
              style={{ width: `${progress}%` }}
            >
               <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-progress"></div>
            </div>
          </div>
          
          {/* Kernel Output Feed */}
          <div className="h-20 md:h-28 overflow-hidden flex flex-col gap-1.5 items-center justify-end px-4 font-mono">
            {currentLogs.map((log, i) => (
              <div 
                key={i} 
                className={`text-[7px] md:text-[10px] uppercase tracking-widest transition-all duration-700 text-center ${i === currentLogs.length - 1 ? 'text-red-500 font-black opacity-100 translate-y-0' : 'text-zinc-800 opacity-30 -translate-y-1'}`}
              >
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Hardware Status Indicators */}
        <div className="flex items-center gap-8 md:gap-16 pt-4 border-t border-white/5 w-full justify-center">
          <div className="text-center group">
            <div className="text-[5px] md:text-[7px] orbitron font-black text-zinc-700 uppercase tracking-widest group-hover:text-red-900 transition-colors">Arch</div>
            <div className="text-[7px] md:text-[10px] orbitron font-black text-zinc-500 uppercase">NEURAL-OS</div>
          </div>
          <div className="text-center group">
            <div className="text-[5px] md:text-[7px] orbitron font-black text-zinc-700 uppercase tracking-widest group-hover:text-red-900 transition-colors">Relay</div>
            <div className="text-[7px] md:text-[10px] orbitron font-black text-zinc-500 uppercase">PROD-UPLINK</div>
          </div>
          <div className="text-center group">
            <div className="text-[5px] md:text-[7px] orbitron font-black text-zinc-700 uppercase tracking-widest group-hover:text-red-900 transition-colors">Cluster</div>
            <div className="text-[7px] md:text-[10px] orbitron font-black text-zinc-500 uppercase">VAULT-09</div>
          </div>
        </div>
      </div>

      {/* Cinematic Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,1)] md:shadow-[inset_0_0_250px_rgba(0,0,0,1)]"></div>
    </div>
  );
};

export default SplashScreen;
