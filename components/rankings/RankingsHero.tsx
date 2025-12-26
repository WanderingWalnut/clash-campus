/**
 * Hero section for the Royale Rankings page.
 * Displays the title, tagline, and explanation of ranking methodology.
 */
export function RankingsHero() {
  return (
    <div className="relative py-16 md:py-24 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-hero-glow z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          Royale <span className="text-gradient-gold">Rankings</span>
        </h1>
        <p className="text-xl md:text-2xl text-white font-medium mb-2">
          Real Status. Real Campus Rivalries.
        </p>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          Rankings are calculated daily using a weighted composite score of
          verified Trophies, Path of Legends Current League, Best League,
          Win Rate, and Three Crown Rate.
        </p>
      </div>
    </div>
  );
}

