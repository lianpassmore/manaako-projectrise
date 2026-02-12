import React, { useState, useEffect } from 'react';

const COLORS = {
  whenua: '#584738',
  kakahu: '#b59e7d',
  kakahuLight: '#d4c4a8',
  ako: '#00897B',
};

export default function AnimatedOrb({ state = 'idle', size = 200, onClick }) {
  const [time, setTime] = useState(0);
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

  // Orb image scale per state
  const orbScale = state === 'speaking'
    ? 1 + 0.06 * Math.sin(time * 3)
    : state === 'connected'
      ? 1
      : 0.96 + 0.03 * Math.sin(time * 2);

  // Orb opacity per state
  const orbOpacity = state === 'speaking'
    ? 0.95
    : state === 'connected'
      ? 0.9
      : 0.75 + 0.1 * Math.sin(time * 2);

  // Atmosphere scale
  const atmosphereScale = state === 'speaking' ? 1.15 : state === 'connected' ? 1 : 0.95;

  // Glow intensity for speaking
  const glowIntensity = state === 'speaking'
    ? 8 + 4 * Math.sin(time * 3)
    : 0;

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
          background: `radial-gradient(circle, ${COLORS.kakahu}30 0%, ${COLORS.whenua}15 40%, transparent 70%)`,
          transform: `scale(${atmosphereScale})`,
        }}
      />

      {/* Orb image */}
      <img
        src="/orb.png"
        alt=""
        draggable={false}
        className="relative z-10 select-none"
        style={{
          width: size,
          height: size,
          transform: `scale(${orbScale})`,
          opacity: orbOpacity,
          filter: state === 'speaking'
            ? `drop-shadow(0 0 ${glowIntensity}px ${COLORS.kakahu})`
            : 'none',
          transition: 'filter 0.3s',
        }}
      />

      {/* Teal glow on speaking */}
      {state === 'speaking' && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size * 1.2,
            height: size * 1.2,
            background: `radial-gradient(circle, ${COLORS.ako}80 0%, ${COLORS.ako}40 40%, transparent 70%)`,
            opacity: 0.7 + 0.2 * Math.sin(time * 3),
            transition: 'opacity 0.3s',
          }}
        />
      )}
    </div>
  );
}
