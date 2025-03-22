export interface Player {
	id: string;
	positionId: number;
	jerseyNumber: number;
	name: string;
}

export interface Team {
	id: string;
	name: string;
	icon: string; //team logo
	players: Player[];
	score: number;
	yellowCards: number;
	redCards: number;
	tackles: number;
	breakthroughs: number;
	substitutions: number;
}

export interface MatchEvent {
	timestamp: number;
	team: "home" | "away";
	type: "try" | "conversion" | "penalty" | "yellowCard" | "redCard" | "tackle" | "breakthrough" | "substitution";
	points?: number;
	player: Player;
}

export interface Match {
	homeTeam: Team;
	awayTeam: Team;
	events: MatchEvent[];
	isPlaying: boolean;
	currentTime: number;
}
