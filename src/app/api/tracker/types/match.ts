export interface Player {
  id: string
  jerseyNumber: number
  name: string
  position: string
}

export interface Team {
  id: string
  name: string
  icon: string // This will be the name of the Lucide icon
  players: Player[]
  score: number
  yellowCards: number
  redCards: number
  tackles: number
  breakthroughs: number
}

export interface MatchEvent {
  timestamp: number
  team: "home" | "away"
  type: "try" | "conversion" | "penalty" | "yellowCard" | "redCard" | "tackle" | "breakthrough"
  points?: number
  player: Player
}

export interface Match {
  homeTeam: Team
  awayTeam: Team
  events: MatchEvent[]
  isPlaying: boolean
  currentTime: number
}

