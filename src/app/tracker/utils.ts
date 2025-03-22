import type { Match, Player, Team } from "@/app/tracker/[id]/types/match";
import type { MatchEvent } from "@/app/tracker/[id]/types/match";
import { fetchMatchById, fetchRoster } from "@/lib/apiService";
import { intervalToDuration } from "date-fns";
import type { Dispatch, SetStateAction } from "react";

export const initMatch = async (matchId: string, setMatch: React.Dispatch<React.SetStateAction<Match | undefined>>) => {
	const saved = localStorage.getItem("rugbyMatch");
	if (saved) {
		const savedMatch: Match = JSON.parse(saved);
		setMatch(savedMatch);
		return savedMatch;
	}

	const [roster, match] = await Promise.all([fetchRoster.fn(Number.parseInt(matchId)), fetchMatchById.fn(matchId)]);

	const homeTeam: Team = {
		id: "home-team",
		name: match.homeTeam.name,
		icon: match.homeTeam.logoUrl,
		players: roster.map((r) => {
			return {
				id: r.player.id.toString(),
				positionId: r.roster.positionId,
				name: `${r.player.firstName} ${r.player.lastName}`,
				jerseyNumber: r.roster.positionId + 1,
			};
		}),
		score: 0,
		yellowCards: 0,
		redCards: 0,
		tackles: 0,
		breakthroughs: 0,
		substitutions: 0,
	};
	const awayTeam: Team = {
		id: "away-team",
		name: match.awayTeam.name,
		icon: match.awayTeam.logoUrl,
		players: roster.map((_, index) => {
			return {
				id: (index + 1).toString(),
				positionId: index,
				name: "No name",
				jerseyNumber: index + 1,
			};
		}),
		score: 0,
		yellowCards: 0,
		redCards: 0,
		tackles: 0,
		breakthroughs: 0,
		substitutions: 0,
	};
	const output: Match = {
		homeTeam,
		awayTeam,
		events: [],
		isPlaying: false,
		currentTime: 0,
	};
	setMatch(output);
};

export const addEvent = (
	team: "home" | "away",
	player: Player,
	type: MatchEvent["type"],
	setMatch: Dispatch<SetStateAction<Match>>,
	match: Match,
	points?: number,
) => {
	const newEvent: MatchEvent = {
		timestamp: match.currentTime,
		team,
		type,
		points,
		player,
	};

	console.log("newEvent", newEvent);

	setMatch((prev) => {
		const targetTeam = team === "home" ? "homeTeam" : "awayTeam";
		const updatedMatch = { ...prev };

		if (points) {
			updatedMatch[targetTeam].score += points;
		}

		if (type === "yellowCard") updatedMatch[targetTeam].yellowCards++;
		if (type === "redCard") updatedMatch[targetTeam].redCards++;
		if (type === "tackle") updatedMatch[targetTeam].tackles++;
		if (type === "breakthrough") updatedMatch[targetTeam].breakthroughs++;
		if (type === "substitution") updatedMatch[targetTeam].substitutions++;

		return {
			...updatedMatch,
			events: [...prev.events, newEvent],
		};
	});
};

export const useFormatedTime = (time: number) => {
	const duration = intervalToDuration({
		start: 0,
		end: time,
	});
	let formatedMinutes = "0";
	let formatedSeconds = "0";
	if (!duration.minutes) {
		formatedMinutes = "00";
	} else {
		formatedMinutes = duration.minutes >= 10 ? duration.minutes.toString() : `0${duration.minutes}`;
	}
	if (!duration.seconds) {
		formatedSeconds = "00";
	} else {
		formatedSeconds = duration.seconds >= 10 ? duration.seconds.toString() : `0${duration.seconds}`;
	}
	return `${formatedMinutes}:${formatedSeconds}`;
};
