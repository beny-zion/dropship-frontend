import React from 'react';
import { Button } from '@/components/ui/button';

export default function PromotionalBanner({ section, language = 'he' }) {
  const { promotionalBanner } = section.content;
  const schedule = section.schedule || {};

  // Check if banner should be displayed based on schedule
  if (schedule.enabled) {
    const now = new Date();
    const startDate = schedule.startDate ? new Date(schedule.startDate) : null;
    const endDate = schedule.endDate ? new Date(schedule.endDate) : null;

    if (startDate && now < startDate) return null;
    if (endDate && now > endDate) return null;
  }

  const text = promotionalBanner.text?.[language] || {};
  const styling = promotionalBanner.styling || {};
  const imageUrl = typeof window !== 'undefined' && window.innerWidth < 768
    ? promotionalBanner.image?.mobile?.url || promotionalBanner.image?.desktop?.url
    : promotionalBanner.image?.desktop?.url;

  const hasImage = !!imageUrl;
  const hasText = text.headline || text.subheadline || text.cta;

  if (!hasImage && !hasText) {
    return null;
  }

  return (
    <div
      className="relative overflow-hidden"
      style={{
        backgroundColor: styling.backgroundColor || '#000000',
        padding: styling.padding || '60px 20px'
      }}
    >
      {/* Background Image */}
      {hasImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${imageUrl})`,
            opacity: hasText ? 0.4 : 1
          }}
        />
      )}

      {/* Content */}
      {hasText && (
        <div
          className="relative z-10 container mx-auto"
          style={{
            textAlign: styling.alignment || 'center',
            color: styling.textColor || '#ffffff'
          }}
          dir={language === 'he' ? 'rtl' : 'ltr'}
        >
          {text.headline && (
            <h2 className="guess-heading-main guess-text-overlay mb-4 animate-fadeIn">
              {text.headline}
            </h2>
          )}

          {text.subheadline && (
            <p className="guess-heading-subtitle guess-text-overlay mb-6 animate-fadeIn animation-delay-200">
              {text.subheadline}
            </p>
          )}

          {text.cta && promotionalBanner.link && (
            <button
              className="guess-cta animate-fadeIn animation-delay-400 bg-white text-black px-8 py-3 font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors rounded-sm"
              onClick={() => window.location.href = promotionalBanner.link}
            >
              {text.cta}
            </button>
          )}

          {/* Countdown Timer (if scheduled end date exists) */}
          {schedule.enabled && schedule.endDate && (
            <CountdownTimer endDate={schedule.endDate} language={language} />
          )}
        </div>
      )}

      {/* Simple Image Banner (no text) */}
      {hasImage && !hasText && promotionalBanner.link && (
        <a
          href={promotionalBanner.link}
          className="block relative z-10"
        >
          <img
            src={imageUrl}
            alt="Promotional Banner"
            className="w-full h-auto"
          />
        </a>
      )}
    </div>
  );
}

function CountdownTimer({ endDate, language }) {
  const [timeLeft, setTimeLeft] = React.useState(null);

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate) - new Date();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }

      return null;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (!timeLeft) return null;

  const labels = language === 'he'
    ? { days: 'ימים', hours: 'שעות', minutes: 'דקות', seconds: 'שניות' }
    : { days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds' };

  return (
    <div className="mt-8 flex justify-center gap-4" dir={language === 'he' ? 'rtl' : 'ltr'}>
      {Object.entries(timeLeft).map(([key, value]) => (
        <div key={key} className="text-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 min-w-[70px]">
            <div className="text-3xl font-bold">{value}</div>
            <div className="text-sm mt-1">{labels[key]}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
