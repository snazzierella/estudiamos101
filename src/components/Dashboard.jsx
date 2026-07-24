import React from 'react';
import { 
  BookOpen, 
  Swords, 
  MessageSquare, 
  ShoppingBag, 
  Trophy, 
  Flame, 
  Coins, 
  Gamepad2, 
  Settings, 
  Heart,
  Plus
} from 'lucide-react';

const RANKS = [
  { level: 1, title: "Estudiante Novato (Novice Learner)", icon: "🎒" },
  { level: 3, title: "Guerrero de Vocabulario (Vocab Warrior)", icon: "🗡️" },
  { level: 5, title: "Caballero de Gramática (Grammar Knight)", icon: "🛡️" },
  { level: 8, title: "Mago de Lengua (Linguistic Mage)", icon: "🔮" },
  { level: 12, title: "Lobo de Español (Spanish Alpha)", icon: "🐺" },
  { level: 15, title: "Leyenda del Léxico (Lexicon Legend)", icon: "👑" },
];

export default function Dashboard({ state, useItem, setView, setStudyQuestTab, onOpenSettings }) {
  const rank = [...RANKS].reverse().find(r => state.level >= r.level) || RANKS[0];
  
  const xpNeeded = state.level * 100;
  const xpPercentage = Math.min(100, Math.floor((state.xp / xpNeeded) * 100));
  
  const hasPotions = (state.inventory.redPotion || 0) > 0;
  const hasElixirs = (state.inventory.goldenElixir || 0) > 0;

  const handleUsePotion = () => {
    useItem('redPotion');
  };

  const handleUseElixir = () => {
    useItem('goldenElixir');
  };

  return (
    <div className="dashboard-grid">
      {/* Main Action Grid */}
      <div className="view-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem' }}>¡Hola, Aventurero!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Welcome back. What is your goal today?</p>
          </div>
          <button className="btn btn-secondary" onClick={onOpenSettings}>
            <Settings size={18} /> Settings
          </button>
        </div>

        {state.fainted && (
          <div className="glass-panel" style={{ border: '1px solid var(--danger)', background: 'rgba(239, 68, 68, 0.05)', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ color: 'var(--danger)', marginBottom: '4px' }}>⚠️ Has desmayado (You Fainted!)</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>You took too much damage in quizzes. Rest or drink a potion to continue!</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {hasElixirs ? (
                <button className="btn btn-accent btn-sm" onClick={handleUseElixir}>Use Golden Elixir</button>
              ) : hasPotions ? (
                <button className="btn btn-primary btn-sm" onClick={handleUsePotion}>Use Red Potion</button>
              ) : (
                <button className="btn btn-danger btn-sm" onClick={() => setView('shop')}>Buy Potions</button>
              )}
            </div>
          </div>
        )}

        <div className="menu-grid">
          {/* Card 1: Continue Quest (Progressive Campaign) */}
          <div 
            className={`glass-panel menu-card accent-card ${state.fainted ? 'disabled' : ''}`}
            onClick={() => {
              if (!state.fainted) {
                setStudyQuestTab("quest");
                setView("study-quest");
              }
            }}
            style={{ opacity: state.fainted ? 0.6 : 1, cursor: state.fainted ? 'not-allowed' : 'pointer' }}
          >
            <div className="menu-card-icon">
              <Swords size={24} />
            </div>
            <div>
              <h3 className="menu-card-title">Continuar Búsqueda (Continue Quest)</h3>
              <p className="menu-card-desc">Embark on progressive stage levels. Mixes new word flashcards with active battle quizzes.</p>
            </div>
          </div>

          {/* Card 2: Practice Deck (Flashcards & Custom Quizzes) */}
          <div 
            className="glass-panel menu-card" 
            onClick={() => {
              setStudyQuestTab("practice");
              setView("study-quest");
            }}
          >
            <div className="menu-card-icon">
              <BookOpen size={24} />
            </div>
            <div>
              <h3 className="menu-card-title">Práctica Libre (Practice Deck)</h3>
              <p className="menu-card-desc">Choose vocabulary units freely. Review using safe flashcards or custom quiz challenges.</p>
            </div>
          </div>

          {/* Card 3: AI Chat */}
          <div className="glass-panel menu-card" onClick={() => setView('chat')}>
            <div className="menu-card-icon">
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 className="menu-card-title">Charla AI (AI Chat)</h3>
              <p className="menu-card-desc">Practice conversing with an AI companion restricted ONLY to Spanish 101 vocabulary.</p>
            </div>
          </div>

          {/* Card 4: Mini-Games */}
          <div className="glass-panel menu-card accent-card" onClick={() => setView('games')}>
            <div className="menu-card-icon">
              <Gamepad2 size={24} />
            </div>
            <div>
              <h3 className="menu-card-title">Aventuras (Text RPG)</h3>
              <p className="menu-card-desc">Embark on story-based text games: market shopping, meeting Nat, and dog training.</p>
            </div>
          </div>

          {/* Card 5: Shop */}
          <div className="glass-panel menu-card" onClick={() => setView('shop')}>
            <div className="menu-card-icon">
              <ShoppingBag size={24} />
            </div>
            <div>
              <h3 className="menu-card-title">Tienda (Item Shop)</h3>
              <p className="menu-card-desc">Spend gold coins on health potions, streak shields, and mystery grimoires.</p>
            </div>
          </div>

          {/* Card 6: Badges */}
          <div className="glass-panel menu-card accent-card" onClick={() => setView('badges')}>
            <div className="menu-card-icon">
              <Trophy size={24} />
            </div>
            <div>
              <h3 className="menu-card-title">Logros (Achievements)</h3>
              <p className="menu-card-desc">View your trophy room and check which milestones and badges you have unlocked.</p>
            </div>
          </div>

          {/* Card 7: Mistakes Dungeon */}
          <div 
            className="glass-panel menu-card" 
            onClick={() => setView('dungeon')}
            style={{ 
              border: state.mistakes?.length > 0 ? '1.5px solid var(--danger)' : '1px solid var(--card-border)',
              position: 'relative'
            }}
          >
            <div className="menu-card-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
              ⚔️
            </div>
            <div>
              <h3 className="menu-card-title">Mazmorra de Errores (Mistakes Dungeon)</h3>
              <p className="menu-card-desc">
                {state.mistakes?.length > 0 
                  ? `Defeat the ${state.mistakes.length} ghost words you answered incorrectly!` 
                  : "Dungeon clear! No recent mistakes. Practice quests to find ghost words."}
              </p>
            </div>
            {state.mistakes?.length > 0 && (
              <span style={{ 
                position: 'absolute', 
                top: '12px', 
                right: '12px', 
                background: 'var(--danger)', 
                color: '#fff', 
                fontSize: '0.7rem', 
                fontWeight: 'bold', 
                padding: '2px 8px', 
                borderRadius: '10px',
                boxShadow: '0 0 10px var(--danger-glow)' 
              }}>
                {state.mistakes.length} GHOSTS
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar stats panel */}
      <div className="stats-sidebar">
        <div className="glass-panel player-card">
          <div className="player-avatar-container">
            {rank.icon}
          </div>
          <h3 className="player-rank">Nivel {state.level}</h3>
          <span className="player-title">{rank.title}</span>

          <div className="quick-stats">
            <div className="quick-stat-box">
              <div className="quick-stat-val gold">
                <Coins size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                {state.gold}
              </div>
              <div className="quick-stat-lbl">Gold</div>
            </div>
            <div className="quick-stat-box">
              <div className="quick-stat-val streak">
                <Flame size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                {state.streak}
              </div>
              <div className="quick-stat-lbl">Streak</div>
            </div>
          </div>

          {/* Equipment Slots */}
          <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', textAlign: 'left' }}>
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '10px', fontWeight: 600 }}>Equipamiento (Gear)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div 
                onClick={() => setView('shop')}
                style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: state.equipped?.weapon ? '1px dashed var(--primary)' : '1px dashed rgba(255,255,255,0.1)', 
                  borderRadius: '10px', 
                  padding: '8px', 
                  textAlign: 'center', 
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
                title={state.equipped?.weapon === 'wisdomSword' ? "Wisdom Sword (+20% XP)" : "Click to go to Shop"}
              >
                <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>{state.equipped?.weapon === 'wisdomSword' ? "⚔️" : "🫳"}</div>
                <div style={{ fontSize: '0.65rem', color: state.equipped?.weapon ? 'var(--text-primary)' : 'var(--text-muted)' }}>Espada</div>
              </div>
              <div 
                onClick={() => setView('shop')}
                style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: state.equipped?.shield ? '1px dashed var(--primary)' : '1px dashed rgba(255,255,255,0.1)', 
                  borderRadius: '10px', 
                  padding: '8px', 
                  textAlign: 'center', 
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
                title={state.equipped?.shield === 'woodenShield' ? "Wooden Shield (-5 damage taken)" : "Click to go to Shop"}
              >
                <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>{state.equipped?.shield === 'woodenShield' ? "🛡️" : "🫳"}</div>
                <div style={{ fontSize: '0.65rem', color: state.equipped?.shield ? 'var(--text-primary)' : 'var(--text-muted)' }}>Escudo</div>
              </div>
              <div 
                onClick={() => setView('shop')}
                style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: state.equipped?.amulet ? '1px dashed var(--primary)' : '1px dashed rgba(255,255,255,0.1)', 
                  borderRadius: '10px', 
                  padding: '8px', 
                  textAlign: 'center', 
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
                title={state.equipped?.amulet === 'goldenAmulet' ? "Golden Amulet (+20% Gold)" : "Click to go to Shop"}
              >
                <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>{state.equipped?.amulet === 'goldenAmulet' ? "✨" : "🫳"}</div>
                <div style={{ fontSize: '0.65rem', color: state.equipped?.amulet ? 'var(--text-primary)' : 'var(--text-muted)' }}>Amuleto</div>
              </div>
            </div>
          </div>

          <div className="stat-row">
            <div className="stat-label">
              <span>Salud (Health)</span>
              <span style={{ color: state.hp < 30 ? 'var(--danger)' : 'var(--text-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Heart size={14} fill={state.hp < 30 ? 'var(--danger)' : 'currentColor'} /> {state.hp}/100
              </span>
            </div>
            <div className="progress-bar-outer">
              <div className="progress-bar-inner hp" style={{ width: `${state.hp}%` }}></div>
            </div>
          </div>

          <div className="stat-row">
            <div className="stat-label">
              <span>Experiencia (XP)</span>
              <span>{state.xp}/{xpNeeded}</span>
            </div>
            <div className="progress-bar-outer">
              <div className="progress-bar-inner xp" style={{ width: `${xpPercentage}%` }}></div>
            </div>
          </div>
        </div>

        {/* Quick Inventory / Potion panel */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '12px', fontSize: '1rem' }}>Mochila (Quick Items)</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '10px' }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Poción Roja (+50 HP)</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Quantity: {state.inventory.redPotion || 0}</div>
              </div>
              <button 
                className="btn btn-primary" 
                style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
                disabled={hasPotions && state.hp >= 100 || state.fainted}
                onClick={handleUsePotion}
              >
                Use
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '10px' }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Elixir Dorado (Revive)</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Quantity: {state.inventory.goldenElixir || 0}</div>
              </div>
              <button 
                className="btn btn-accent" 
                style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
                disabled={hasElixirs && !state.fainted && state.hp >= 100}
                onClick={handleUseElixir}
              >
                Use
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '10px' }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Escudo de Racha</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active Shields: {state.inventory.streakShield || 0}</div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Auto-use</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
