import React from 'react';
import { Trophy, ArrowLeft, Shield, Sparkles } from 'lucide-react';

const BADGES_LIST = [
  {
    id: "placement_done",
    name: "Primer Paso (First Steps)",
    desc: "Complete the initial placement evaluation.",
    icon: "🗺️"
  },
  {
    id: "warrior_10",
    name: "Gladiador (Gladiator)",
    desc: "Answer 10 quiz questions correctly.",
    icon: "🗡️"
  },
  {
    id: "warrior_50",
    name: "Guerrero de Elite (Elite Warrior)",
    desc: "Answer 50 quiz questions correctly.",
    icon: "🛡️"
  },
  {
    id: "warrior_150",
    name: "Luchador Eterno (Eternal Champion)",
    desc: "Answer 150 quiz questions correctly.",
    icon: "⚔️"
  },
  {
    id: "level_5",
    name: "Héroe en Alza (Rising Hero)",
    desc: "Reach character Level 5.",
    icon: "🌟"
  },
  {
    id: "level_10",
    name: "Maestro del Léxico (Lexicon Master)",
    desc: "Reach character Level 10.",
    icon: "👑"
  },
  {
    id: "rich_learner",
    name: "Erudito Rico (Rich Scholar)",
    desc: "Reach a purse size of 100 gold coins.",
    icon: "💰"
  },
  {
    id: "survivor",
    name: "Superviviente (Survivor)",
    desc: "Reach 0 HP and escape fainting.",
    icon: "💀"
  },
  {
    id: "streak_3",
    name: "Fuego Constante (Steady Flame)",
    desc: "Maintain a 3-day learning streak.",
    icon: "🔥"
  },
  {
    id: "streak_7",
    name: "Fénix Ardiente (Blazing Phoenix)",
    desc: "Maintain a 7-day learning streak.",
    icon: "🐦"
  },
  {
    id: "market_master",
    name: "Negociante de Comida (Market Trader)",
    desc: "Successfully buy correct salad ingredients in the Market Adventure.",
    icon: "🥗"
  },
  {
    id: "social_butterfly",
    name: "Aliado de Nat (Nat's Ally)",
    desc: "Successfully introduce your friend to your partner Nat at the Cafe.",
    icon: "☕"
  },
  {
    id: "dog_trainer",
    name: "Entrenador de Narfy (Dog Whisperer)",
    desc: "Successfully train Narfy using all 5 correct commands.",
    icon: "🐕"
  }
];

export default function BadgeTrophy({ state, setView }) {
  const unlockedCount = BADGES_LIST.filter(b => state.badges.includes(b.id)).length;
  const percentage = Math.round((unlockedCount / BADGES_LIST.length) * 100);

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem' }}>Sala de Trofeos (Trophy Room)</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Show off your learning accomplishments and badges.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setView('dashboard')}>
          <ArrowLeft size={16} /> Back to Hub
        </button>
      </div>

      {/* Progress Card */}
      <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
          <Trophy size={28} color="var(--gold)" style={{ animation: 'float 3s ease-in-out infinite' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>{unlockedCount} / {BADGES_LIST.length} Achievements Unlocked</h3>
        </div>
        
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div className="stat-label" style={{ justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <span>Completion:</span> <strong>{percentage}%</strong>
          </div>
          <div className="progress-bar-outer" style={{ height: '10px' }}>
            <div className="progress-bar-inner xp" style={{ width: `${percentage}%` }}></div>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="badge-grid">
        {BADGES_LIST.map(badge => {
          const isUnlocked = state.badges.includes(badge.id);
          
          return (
            <div 
              key={badge.id} 
              className={`glass-panel badge-card ${isUnlocked ? 'unlocked' : ''}`}
              style={{ opacity: isUnlocked ? 1 : 0.4 }}
            >
              <div className="badge-icon-box">
                {isUnlocked ? badge.icon : "🔒"}
              </div>
              <h4 className="badge-name">{badge.name}</h4>
              <p className="badge-desc">{badge.desc}</p>
              
              {isUnlocked && (
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: '8px', 
                    right: '8px', 
                    color: 'var(--gold)',
                    fontSize: '0.75rem',
                    animation: 'float 2s ease-in-out infinite'
                  }}
                >
                  ✨
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
