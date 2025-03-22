import type { Match, Player, Team } from "@/app/tracker/[id]/types/match";
import type { Dispatch, SetStateAction } from "react";
import MatchEventPopover from "./MatchEventPopover";

type Props = {
	homeTeam: Team;
	awayTeam: Team;
	setMatch: Dispatch<SetStateAction<Match>>;
	match: Match;
};

const PlayersList = ({ homeTeam, awayTeam, setMatch, match }: Props) =>
	homeTeam.players.slice(0, 15).map((player, i) => (
		<div className="flex space-x-5 p-2" key={player.positionId}>
			<MatchEventPopover player={player} isHome={true} setMatch={setMatch} match={match} />
			{awayTeam.players[i] && (
				<MatchEventPopover player={awayTeam.players[i]} isHome={false} setMatch={setMatch} match={match} />
			)}
		</div>
	));

export default PlayersList;
