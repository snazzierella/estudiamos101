import React, { useState } from 'react';
import { ShoppingBag, Coins, Heart, Shield, Sparkles, BookOpen, ArrowLeft } from 'lucide-react';

const SHOP_ITEMS = [
  {
    key: "redPotion",
    name: "Poción Roja (Red Potion)",
    desc: "Restores 50 HP immediately. Helps you recover from quiz damage.",
    cost: 15,
    icon: "🧪",
    theme: "red-item"
  },
  {
    key: "goldenElixir",
    name: "Elixir Dorado (Golden Elixir)",
    desc: "Fully restores 100 HP and cures the 'Fainted' status effect.",
    cost: 35,
    icon: "🍯",
    theme: "blue-item"
  },
  {
    key: "streakShield",
    name: "Escudo de Racha (Streak Shield)",
    desc: "Protects your learning streak for one day if you miss a practice.",
    cost: 50,
    icon: "🛡️",
    theme: "gold-item"
  },
  {
    key: "mysteryScroll",
    name: "Pergamino de Sabiduría (Mystery Scroll)",
    desc: "Unlocks a secret grammar tip, Spanish vocabulary joke, or cultural insight.",
    cost: 20,
    icon: "📜",
    theme: "blue-item"
  }
];

const MYSTERY_JOKES = [
  "¿Por qué el libro de matemáticas estaba triste? ¡Porque tenía muchos problemas! 😂",
  "Grammar Tip: Remember that 'ser' is for permanent qualities (identity, origin) and 'estar' is for temporary states (emotions, locations). Think of PLACE for estar: Position, Location, Action, Condition, Emotion!",
  "¿Qué hace un pez en el agua? ¡Nada! (Nothing / It swims) 🐟",
  "Vocabulary Fun: 'Esposa' means wife, but 'esposas' also means handcuffs! Be careful how you use it! 👰⛓️",
  "Pronunciation Tip: The double L ('ll') makes a 'y' sound (like in 'Me llamo' - meh yah-moh). In Argentina, it makes a 'sh' sound!",
  "¿Cómo se dice 'one hair' en inglés? ¡O'hare! 💈"
];

export default function GameShop({ state, buyItem, useItem, setView }) {
  const [feedback, setFeedback] = useState("");
  const [mysteryText, setMysteryText] = useState("");

  const handleBuy = (item) => {
    const success = buyItem(item.key, item.cost);
    if (success) {
      setFeedback(`Purchased ${item.name} for ${item.cost} Gold!`);
      
      if (item.key === "mysteryScroll") {
        const randomJoke = MYSTERY_JOKES[Math.floor(Math.random() * MYSTERY_JOKES.length)];
        setMysteryText(randomJoke);
      }
      
      setTimeout(() => {
        setFeedback("");
      }, 4000);
    }
  };

  const handleUse = (key) => {
    const success = useItem(key);
    if (success) {
      setFeedback(`Consumed potion to restore health!`);
      setTimeout(() => {
        setFeedback("");
      }, 3000);
    }
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem' }}>La Tienda de Pociones (Merchant Shop)</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Spend your hard-earned gold coins on items to protect your character and streak.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setView('dashboard')}>
          <ArrowLeft size={16} /> Back to Hub
        </button>
      </div>

      {feedback && (
        <div 
          className="glass-panel" 
          style={{ 
            padding: '12px 20px', 
            background: 'rgba(16, 185, 129, 0.15)', 
            borderColor: 'var(--accent)', 
            color: 'var(--text-primary)', 
            fontWeight: '600', 
            borderRadius: '12px',
            textAlign: 'center',
            animation: 'pop-in 0.3s ease-out'
          }}
        >
          {feedback}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {/* Main Shop Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="shop-grid">
            {SHOP_ITEMS.map(item => {
              const count = state.inventory[item.key] || 0;
              const canAfford = state.gold >= item.cost;
              
              return (
                <div key={item.key} className="glass-panel shop-card">
                  <div>
                    <div className="shop-item-top">
                      <div className={`shop-item-icon-box ${item.theme}`}>
                        {item.icon}
                      </div>
                      <div className="shop-item-cost">
                        <Coins size={14} /> {item.cost} G
                      </div>
                    </div>
                    
                    <h3 className="shop-item-name">{item.name}</h3>
                    <p className="shop-item-desc">{item.desc}</p>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Owned: {count}</span>
                    <button 
                      className={`btn ${canAfford ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      disabled={!canAfford}
                      onClick={() => handleBuy(item)}
                    >
                      Buy Item
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mystery Scroll Dialogue */}
          {mysteryText && (
            <div 
              className="glass-panel" 
              style={{ 
                padding: '24px', 
                background: 'rgba(99, 102, 241, 0.05)', 
                borderColor: 'var(--primary)',
                animation: 'pop-in 0.4s ease-out'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <BookOpen size={18} color="var(--primary)" />
                <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>Scroll of Knowledge</h4>
              </div>
              <p style={{ fontSize: '1rem', fontStyle: 'italic', color: '#e2e8f0', lineHeight: '1.5' }}>
                {mysteryText}
              </p>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => setMysteryText("")} 
                style={{ marginTop: '16px', padding: '6px 12px', fontSize: '0.8rem' }}
              >
                Close Scroll
              </button>
            </div>
          )}
        </div>

        {/* Quick Stats & Bag */}
        <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} /> Your Pouch & Inventory
          </h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold)', fontWeight: 'bold' }}>
              <Coins size={16} /> Gold: {state.gold} G
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', fontWeight: 'bold' }}>
              <Heart size={16} fill="var(--danger)" /> HP: {state.hp} / 100
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600 }}>Poción Roja</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Owned: {state.inventory.redPotion || 0}</span>
              </div>
              <button 
                className="btn btn-primary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                disabled={(state.inventory.redPotion || 0) <= 0 || state.hp >= 100 || state.fainted}
                onClick={() => handleUse('redPotion')}
              >
                Drink
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600 }}>Elixir Dorado</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Owned: {state.inventory.goldenElixir || 0}</span>
              </div>
              <button 
                className="btn btn-accent"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                disabled={(state.inventory.goldenElixir || 0) <= 0}
                onClick={() => handleUse('goldenElixir')}
              >
                Consume
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600 }}>Streak Shield</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Owned: {state.inventory.streakShield || 0}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Protects streak</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
