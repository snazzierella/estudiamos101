import React from 'react';

export default function NarfySprite({ action = "sit" }) {
  return (
    <div style={{ display: 'inline-block', position: 'relative', width: '130px', height: '130px' }}>
      <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%' }} className={`narfy-svg action-${action}`}>
        <style>{`
          .narfy-svg {
            overflow: visible;
          }
          
          /* Keyframes */
          @keyframes wag-tail {
            0% { transform: rotate(0deg); }
            50% { transform: rotate(18deg); }
            100% { transform: rotate(0deg); }
          }
          @keyframes run-body {
            0% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-4px) rotate(2deg); }
            100% { transform: translateY(0) rotate(0deg); }
          }
          @keyframes walk-legs-front {
            0% { transform: rotate(0deg); }
            50% { transform: rotate(22deg); }
            100% { transform: rotate(0deg); }
          }
          @keyframes walk-legs-back {
            0% { transform: rotate(0deg); }
            50% { transform: rotate(-22deg); }
            100% { transform: rotate(0deg); }
          }
          @keyframes run-legs-front {
            0% { transform: rotate(-15deg); }
            50% { transform: rotate(40deg); }
            100% { transform: rotate(-15deg); }
          }
          @keyframes run-legs-back {
            0% { transform: rotate(15deg); }
            50% { transform: rotate(-40deg); }
            100% { transform: rotate(15deg); }
          }
          @keyframes bob-head-eat {
            0% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(5px, 9px) rotate(18deg); }
            100% { transform: translate(0, 0) rotate(0deg); }
          }
          @keyframes bark-head {
            0% { transform: rotate(0deg); }
            50% { transform: rotate(-12deg) translate(-2px, -2px); }
            100% { transform: rotate(0deg); }
          }
          @keyframes bark-mouth {
            0% { transform: scaleY(1); }
            50% { transform: scaleY(2.2); }
            100% { transform: scaleY(1); }
          }
          @keyframes zzz-float-1 {
            0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
            50% { opacity: 0.8; }
            100% { transform: translate(-15px, -25px) scale(1.1); opacity: 0; }
          }
          @keyframes zzz-float-2 {
            0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
            50% { opacity: 0.8; }
            100% { transform: translate(-8px, -30px) scale(1.2); opacity: 0; }
          }

          /* Active Classes mapping */
          .narfy-svg.action-sit .tail {
            animation: wag-tail 0.8s infinite ease-in-out;
            transform-origin: 32px 75px;
          }
          .narfy-svg.action-run {
            animation: run-body 0.25s infinite linear;
          }
          .narfy-svg.action-run .tail {
            animation: wag-tail 0.25s infinite linear;
            transform-origin: 32px 75px;
          }
          .narfy-svg.action-run .leg-f-1, .narfy-svg.action-run .leg-f-2 {
            animation: run-legs-front 0.25s infinite linear;
            transform-origin: 75px 80px;
          }
          .narfy-svg.action-run .leg-b-1, .narfy-svg.action-run .leg-b-2 {
            animation: run-legs-back 0.25s infinite linear;
            transform-origin: 45px 80px;
          }
          .narfy-svg.action-walk .leg-f-1, .narfy-svg.action-walk .leg-f-2 {
            animation: walk-legs-front 0.6s infinite ease-in-out;
            transform-origin: 75px 80px;
          }
          .narfy-svg.action-walk .leg-b-1, .narfy-svg.action-walk .leg-b-2 {
            animation: walk-legs-back 0.6s infinite ease-in-out;
            transform-origin: 45px 80px;
          }
          .narfy-svg.action-eat .head-group {
            animation: bob-head-eat 1s infinite ease-in-out;
            transform-origin: 75px 55px;
          }
          .narfy-svg.action-speak .head-group {
            animation: bark-head 0.4s infinite ease-in-out;
            transform-origin: 75px 55px;
          }
          .narfy-svg.action-speak .mouth {
            animation: bark-mouth 0.4s infinite ease-in-out;
            transform-origin: 94px 58px;
          }
          .narfy-svg.action-sleep .body-all {
            transform: rotate(82deg) translate(36px, -58px);
            transform-origin: 50px 70px;
          }
          .narfy-svg.action-sleep .tail {
            animation: none;
          }
        `}</style>

        <g className="body-all">
          {/* 1. Tail (Red Heeler tail, dark red-brown base with white tip) */}
          <path 
            className="tail" 
            d="M 32 75 C 20 72, 10 60, 5 62 C 2 64, 4 70, 10 74 C 18 80, 28 80, 32 75" 
            fill="#a16207" 
          />
          {/* White tip of tail */}
          <path 
            className="tail" 
            d="M 8 64 C 6 62, 5 62, 5 62 C 5 62, 6 65, 8 64" 
            fill="#f8fafc"
          />

          {/* 2. Legs (Back Legs) */}
          {/* Back Leg 2 (far side) */}
          <rect className="leg-b-2" x="40" y="75" width="10" height="22" rx="5" fill="#78350f" />
          {/* Front Leg 2 (far side) */}
          <rect className="leg-f-2" x="72" y="75" width="10" height="22" rx="5" fill="#78350f" />

          {/* 3. Body Torso (Red Heeler speckled body: red-brown base + red point ticking) */}
          <rect x="30" y="48" width="55" height="30" rx="15" fill="#b45309" />
          
          {/* Heeler Speckle Spots */}
          <circle cx="36" cy="54" r="1.5" fill="#fef3c7" />
          <circle cx="42" cy="58" r="2" fill="#78350f" />
          <circle cx="48" cy="52" r="1.2" fill="#fef3c7" />
          <circle cx="55" cy="56" r="1.8" fill="#78350f" />
          <circle cx="50" cy="64" r="1.5" fill="#fef3c7" />
          <circle cx="62" cy="52" r="2.2" fill="#78350f" />
          <circle cx="68" cy="62" r="1.2" fill="#fef3c7" />
          <circle cx="60" cy="68" r="1.8" fill="#fef3c7" />
          <circle cx="44" cy="68" r="2" fill="#78350f" />
          <circle cx="36" cy="62" r="1.5" fill="#fef3c7" />
          <circle cx="74" cy="58" r="1.6" fill="#78350f" />
          <circle cx="78" cy="66" r="2" fill="#fef3c7" />

          {/* 4. Legs (Front Legs) */}
          {/* Back Leg 1 (near side) */}
          <rect className="leg-b-1" x="44" y="75" width="10" height="22" rx="5" fill="#a16207" />
          {/* Front Leg 1 (near side) */}
          <rect className="leg-f-1" x="76" y="75" width="10" height="22" rx="5" fill="#a16207" />
          {/* Cream socks */}
          <rect className="leg-b-1" x="44" y="88" width="10" height="9" rx="3" fill="#fef3c7" opacity="0.95" />
          <rect className="leg-f-1" x="76" y="88" width="10" height="9" rx="3" fill="#fef3c7" opacity="0.95" />

          {/* Heeler Cream Chest */}
          <path d="M 75 52 C 82 52, 85 64, 75 70 Z" fill="#fef3c7" opacity="0.9" />

          {/* 5. Head Group */}
          <g className="head-group">
            {/* Neck connection */}
            <path d="M 70 55 L 82 42 L 85 58 Z" fill="#a16207" />

            {/* Heeler Pointy Ears */}
            {/* Left Ear */}
            <path d="M 74 38 L 84 14 L 88 34 Z" fill="#78350f" />
            <path d="M 77 35 L 83 19 L 86 32 Z" fill="#fca5a5" />
            
            {/* Right Ear */}
            <path d="M 85 36 L 98 12 L 96 32 Z" fill="#a16207" />
            <path d="M 88 34 L 95 17 L 94 30 Z" fill="#fca5a5" />

            {/* Head block */}
            <circle cx="85" cy="44" r="14" fill="#a16207" />

            {/* Red Heeler Eye Patch (Left eye dark patch) */}
            <path d="M 84 32 A 12 12 0 0 1 96 46 A 12 12 0 0 1 84 50 Z" fill="#78350f" />

            {/* Eyes */}
            {action === "sleep" ? (
              <>
                <path d="M 76 44 Q 78 46 80 44" stroke="#000" strokeWidth="2" fill="none" />
                <path d="M 88 44 Q 90 46 92 44" stroke="#000" strokeWidth="2" fill="none" />
              </>
            ) : (
              <>
                <circle cx="78" cy="44" r="2.5" fill="#000" />
                <circle cx="78.8" cy="43.2" r="0.8" fill="#fff" />
                <circle cx="90" cy="44" r="2.5" fill="#000" />
                <circle cx="90.8" cy="43.2" r="0.8" fill="#fff" />
              </>
            )}

            {/* Tan eyebrow dots */}
            <circle cx="77" cy="38" r="1.5" fill="#fef3c7" />
            <circle cx="91" cy="38" r="1.5" fill="#fef3c7" />

            {/* Snout & Nose */}
            <path d="M 83 45 C 89 45, 96 47, 98 52 C 98 55, 92 58, 83 58 Z" fill="#fef3c7" />
            <ellipse cx="97" cy="50" rx="3.5" ry="2.5" fill="#000" />

            {/* Mouth */}
            <path className="mouth" d="M 88 54 Q 93 54 96 52" stroke="#78350f" strokeWidth="1.8" fill="none" />
            
            {/* Bentley Mark (Cattle dog white forehead stripe) */}
            <path d="M 83 30 L 87 30 L 85 36 Z" fill="#fef3c7" />
          </g>
        </g>

        {/* Action Extras */}
        {/* Floating Zzz */}
        {action === "sleep" && (
          <g>
            <text x="25" y="30" fill="#a5b4fc" fontSize="12" fontWeight="bold" style={{ animation: 'zzz-float-1 2s infinite 0s', fill: 'var(--primary)' }}>Z</text>
            <text x="38" y="25" fill="#a5b4fc" fontSize="16" fontWeight="bold" style={{ animation: 'zzz-float-2 2s infinite 0.6s', fill: 'var(--primary)' }}>Z</text>
            <text x="48" y="35" fill="#a5b4fc" fontSize="10" fontWeight="bold" style={{ animation: 'zzz-float-1 2s infinite 1.2s', fill: 'var(--primary)' }}>Z</text>
          </g>
        )}

        {/* Bark sound waves */}
        {action === "speak" && (
          <g style={{ stroke: '#facc15', strokeWidth: '2.5', strokeLinecap: 'round', fill: 'none' }}>
            <path d="M 103 44 A 8 8 0 0 1 103 56" />
            <path d="M 108 40 A 14 14 0 0 1 108 60" />
          </g>
        )}

        {/* Food Bowl */}
        {action === "eat" && (
          <g className="narfy-food-bowl">
            <path d="M 90 85 L 110 85 L 105 75 L 95 75 Z" fill="#ef4444" />
            <ellipse cx="100" cy="75" rx="5" ry="2" fill="#78350f" />
            <circle cx="102" cy="74" r="1.5" fill="#fef3c7" />
          </g>
        )}
      </svg>
    </div>
  );
}
