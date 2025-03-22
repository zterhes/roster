import React from "react";
import type { Match, Player } from "@/app/tracker/[id]/types/match";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { ArrowLeftRight } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

type Props = {
	player: Player;
	match: Match;
	isHome: boolean;
	setMatch: Dispatch<SetStateAction<Match>>;
};

const renderSubstitutionPlayers = (match: Match, isHome: boolean) => {
	if (isHome) {
		return match.homeTeam.players.slice(14).map((p) => (
			<Button className="w-full" key={p.positionId}>
				{`${p.jerseyNumber} - ${p.name}`}
			</Button>
		));
	}

	return match.awayTeam.players.slice(14).map((p) => (
		<Button className="w-full" key={p.positionId}>
			{`${p.jerseyNumber} - ${p.name}`}
		</Button>
	));
};

const SubstitutionPopover = ({ player, match, isHome, setMatch }: Props) => {
	return (
		<Popover key={player.positionId}>
			<PopoverTrigger asChild>
				<Button className="w-full h-auto  flex-wrap justify-start max-sm:justify-center text-sm px-2 py-6">
					<ArrowLeftRight className="mr-1 h-3 w-3" />
					Substitution
				</Button>
			</PopoverTrigger>
			<PopoverContent>
				<div className="grid gap-2">
					<div className="space-y-1">{renderSubstitutionPlayers(match, isHome)}</div>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default SubstitutionPopover;
