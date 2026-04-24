import { useState, useRef, useEffect } from 'react';

const slides = [
  {
    emoji: '👋',
    title: 'Welcome to ExSpire',
    description: 'Track expiry dates for food, medicine, subscriptions, and more - all in one place.',
  },
  {
    emoji: '📦',
    title: 'Add It Once, Forget It',
    description: 'Add an item with its expiry date and you\'re done. ExSpire watches the clock so you don\'t have to.',
  },
  {
    emoji: '🏗️',
    title: 'The Spire',
    description: 'Your items are stacked in a spire - the most urgent ones sit at the top so you always know what needs attention first.',
  },
  {
    emoji: '🔔',
    title: 'Stay Notified',
    description: 'Enable push notifications in Settings to get reminders before things expire. Never miss a date again.',
  },
  {
    emoji: '🚀',
    title: "You're All Set",
    description: "That's all you need to know. Start adding items and let ExSpire handle the rest.",
  },
];

export default function Onboarding({ onComplete }) {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const goTo = (idx) => {
    if (idx >= 0 && idx < slides.length) setCurrent(idx);
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
    setSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (touchStart === null) return;
    setTouchDelta(e.touches[0].clientX - touchStart);
  };

  const handleTouchEnd = () => {
    if (Math.abs(touchDelta) > 50) {
      if (touchDelta < 0) {
        if (current < slides.length - 1) setCurrent(current + 1);
        else onComplete();
      } else if (touchDelta > 0 && current > 0) {
        setCurrent(current - 1);
      }
    }
    setTouchStart(null);
    setTouchDelta(0);
    setSwiping(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (current < slides.length - 1) goTo(current + 1);
        else onComplete();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        goTo(current - 1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [current, onComplete]);

  const offset = swiping ? -current * 100 + (touchDelta / window.innerWidth) * 100 : -current * 100;

  return (
    <div
      className="onboarding-overlay"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <button className="onboarding-skip" onClick={onComplete}>Skip</button>

      <div className="onboarding-track-wrapper">
        <div
          className="onboarding-track"
          style={{
            transform: `translateX(${offset}%)`,
            transition: swiping ? 'none' : 'transform 0.35s ease',
          }}
        >
          {slides.map((slide, i) => (
            <div className="onboarding-slide" key={i}>
              <div className="onboarding-emoji">{slide.emoji}</div>
              <h2 className="onboarding-title">{slide.title}</h2>
              <p className="onboarding-desc">{slide.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="onboarding-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`onboarding-dot ${i === current ? 'onboarding-dot--active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
