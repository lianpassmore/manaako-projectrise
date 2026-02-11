import React, { useState, useEffect, useMemo } from 'react';

const COLORS = {
  whenua: '#584738',
  kakahu: '#b59e7d',
  ako: '#00897B',
};

// Generate a poutama stepped diamond path — the ascending staircase
function steppedDiamond(cx, cy, level, step) {
  let x = cx, y = cy - level * step;
  const d = [`M ${x} ${y}`];
  // Top-right: step right then down
  for (let i = 0; i < level; i++) {
    x += step; d.push(`L ${x} ${y}`);
    y += step; d.push(`L ${x} ${y}`);
  }
  // Bottom-right: step down then left
  for (let i = 0; i < level; i++) {
    y += step; d.push(`L ${x} ${y}`);
    x -= step; d.push(`L ${x} ${y}`);
  }
  // Bottom-left: step left then up
  for (let i = 0; i < level; i++) {
    x -= step; d.push(`L ${x} ${y}`);
    y -= step; d.push(`L ${x} ${y}`);
  }
  // Top-left: step up then right
  for (let i = 0; i < level; i++) {
    y -= step; d.push(`L ${x} ${y}`);
    x += step; d.push(`L ${x} ${y}`);
  }
  d.push('Z');
  return d.join(' ');
}

export default function AnimatedOrb({ state = 'idle', size = 200, onClick }) {
  const [time, setTime] = useState(0);
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    let frame;
    const speed = state === 'speaking' ? 0.05 : 0.012;
    function animate() {
      setTime((prev) => prev + speed);
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [state]);

  useEffect(() => {
    if (state !== 'speaking') { setRipples([]); return; }
    const interval = setInterval(() => {
      setRipples((prev) => {
        const now = Date.now();
        return [...prev.filter((r) => now - r.created < 2000), { id: now, created: now }];
      });
    }, 2000);
    setRipples([{ id: Date.now(), created: Date.now() }]);
    return () => clearInterval(interval);
  }, [state]);

  const cx = size / 2;
  const cy = size / 2;
  const step = size * 0.05;
  const levels = [2, 4, 6, 8];

  const rings = useMemo(
    () => levels.map((l) => steppedDiamond(cx, cy, l, step)),
    [size]
  );

  // Core breathing
  const coreScale = state === 'speaking'
    ? 1 + 0.2 * Math.sin(time * 3)
    : state === 'connected'
      ? 1
      : 0.85 + 0.12 * Math.sin(time * 2);

  const coreOpacity = state === 'speaking' ? 0.9 : state === 'connected' ? 0.7 : 0.5;
  const atmosphereScale = state === 'speaking' ? 1.2 : 1;

  const glowId = `poutama-glow-${size}`;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: size * 1.5,
        height: size * 1.5,
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      {/* Atmosphere */}
      <div
        className="absolute rounded-full transition-transform duration-700"
        style={{
          width: size * 1.3,
          height: size * 1.3,
          background: `radial-gradient(circle, ${COLORS.ako}40 0%, ${COLORS.kakahu}20 40%, transparent 70%)`,
          transform: `scale(${atmosphereScale})`,
        }}
      />

      {/* Soul — ako core, same colour always, intensity changes */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.5,
          height: size * 0.5,
          background: `radial-gradient(circle, ${COLORS.ako} 0%, ${COLORS.ako}66 45%, transparent 80%)`,
          filter: 'blur(22px)',
          transform: `scale(${coreScale})`,
          opacity: coreOpacity,
          transition: 'opacity 0.5s',
        }}
      />

      {/* Poutama rings */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="relative z-10 overflow-visible"
      >
        <defs>
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {rings.map((d, i) => {
          const total = rings.length;
          const phase = (i / total) * Math.PI * 2;
          const breathe = state === 'speaking' ? 0.05 : 0.025;
          const scale = 1 + breathe * Math.sin(time * 2 + phase);

          // Inner rings: ako. Outer rings: whenua. Same across all states.
          const t = i / (total - 1);
          const stroke = t < 0.5 ? COLORS.ako : COLORS.whenua;

          const baseOpacity = state === 'speaking'
            ? 0.9 - t * 0.3
            : state === 'connected'
              ? 0.7 - t * 0.25
              : 0.55 - t * 0.2;

          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={stroke}
              strokeWidth={1.5}
              strokeOpacity={Math.max(0.15, baseOpacity + 0.1 * Math.sin(time * 2 + phase))}
              strokeLinejoin="miter"
              filter={state === 'speaking' ? `url(#${glowId})` : undefined}
              style={{
                transform: `scale(${scale})`,
                transformOrigin: `${cx}px ${cy}px`,
              }}
            />
          );
        })}
      </svg>

      {/* Diamond ripple on speaking */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute pointer-events-none"
          style={{
            width: size * 0.55,
            height: size * 0.55,
            border: `1.5px solid ${COLORS.ako}44`,
            transform: 'rotate(45deg)',
            animation: 'poutama-ripple 2s ease-out forwards',
          }}
        />
      ))}

      <style>{`
        @keyframes poutama-ripple {
          0% { transform: rotate(45deg) scale(1); opacity: 0.8; }
          100% { transform: rotate(45deg) scale(1.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
