'use client';

import { useState } from 'react';
import { RankingsControls } from './RankingsControls';
import { PlayersTable } from './PlayersTable';
import { CampusesTable } from './CampusesTable';
import { MOCK_PLAYERS, MOCK_CAMPUSES } from '@/lib/data/rankings';
import type { RankingsMode } from '@/types/rankings';

/**
 * Main rankings table component that handles mode switching between
 * players and campuses views. Contains the controls and appropriate table.
 */
export function RankingsTable() {
  const [mode, setMode] = useState<RankingsMode>('players');

  return (
    <>
      <RankingsControls mode={mode} onModeChange={setMode} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mode === 'players' ? (
          <PlayersTable players={MOCK_PLAYERS} />
        ) : (
          <CampusesTable campuses={MOCK_CAMPUSES} />
        )}

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-600">
            * Rankings update automatically based on season activity. Composite
            scores favor recent win streaks and high ladder placement.
          </p>
        </div>
      </div>
    </>
  );
}

