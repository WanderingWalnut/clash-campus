const LEAGUE_NAMES = [
  'Unranked',
  'Challenger I',
  'Challenger II',
  'Challenger III',
  'Master I',
  'Master II',
  'Master III',
  'Champion',
  'Grand Champion',
  'Royal Champion',
  'Ultimate Champion',
]

export function getPathOfLegendsLeagueName(league: number | null | undefined) {
  if (typeof league !== 'number' || Number.isNaN(league)) {
    return LEAGUE_NAMES[0]
  }

  if (league < 0) {
    return LEAGUE_NAMES[0]
  }

  return LEAGUE_NAMES[league] ?? `L${league}`
}
