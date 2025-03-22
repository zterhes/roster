import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import type { Match, Player } from "@/app/tracker/[id]/types/match";
import type { Dispatch, SetStateAction } from "react";
import * as Icons from "lucide-react";
import SubstitutionPopover from "./SubstitutionPopover";
import { addEvent } from "@/app/tracker/utils";

type Props = {
	player: Player;
	isHome: boolean;
	setMatch: Dispatch<SetStateAction<Match>>;
	match: Match;
};

const MatchEventPopover = ({ player, isHome, setMatch, match }: Props) => {
	return (
		<Popover key={player.positionId}>
			<PopoverTrigger asChild>
				<Button
					variant="roster"
					className="w-full h-auto  flex-wrap justify-start max-sm:justify-center text-sm px-2 py-6"
				>
					<p>#{player.jerseyNumber} -</p>
					<p>{player.name}</p>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto">
				<div className="grid gap-2">
					<div className="space-y-1">
						<h4 className="font-medium leading-none">{player.name}</h4>
						<p className="text-sm text-muted-foreground">#{player.jerseyNumber}</p>
					</div>
					<div className="grid grid-cols-2 gap-2">
						<Button
							size="sm"
							onClick={() => addEvent(isHome ? "home" : "away", player, "try", setMatch, match, 5)}
							className="w-full"
						>
							<Icons.Target className="mr-1 h-3 w-3" /> Try (+5)
						</Button>
						<Button
							size="sm"
							onClick={() => addEvent(isHome ? "home" : "away", player, "conversion", setMatch, match, 2)}
							className="w-full"
						>
							<Icons.Plus className="mr-1 h-3 w-3" /> Conv (+2)
						</Button>
						<Button
							size="sm"
							onClick={() => addEvent(isHome ? "home" : "away", player, "penalty", setMatch, match, 3)}
							className="w-full"
						>
							<Icons.Flag className="mr-1 h-3 w-3" /> Pen (+3)
						</Button>
						<Button
							size="sm"
							onClick={() => addEvent(isHome ? "home" : "away", player, "yellowCard", setMatch, match)}
							className="w-full bg-yellow-500"
						>
							<Icons.AlertTriangle className="mr-1 h-3 w-3" /> Yellow
						</Button>
						<Button
							size="sm"
							onClick={() => addEvent(isHome ? "home" : "away", player, "redCard", setMatch, match)}
							className="w-full bg-red-500"
						>
							<Icons.X className="mr-1 h-3 w-3" /> Red
						</Button>
						<Button
							size="sm"
							onClick={() => addEvent(isHome ? "home" : "away", player, "tackle", setMatch, match)}
							className="w-full"
						>
							<Icons.Shield className="mr-1 h-3 w-3" /> Tackle
						</Button>
						<Button
							size="sm"
							onClick={() => addEvent(isHome ? "home" : "away", player, "breakthrough", setMatch, match)}
							className="w-full"
						>
							<Icons.Zap className="mr-1 h-3 w-3" /> Break
						</Button>
						<Button
							size="sm"
							onClick={() => addEvent(isHome ? "home" : "away", player, "substitution", setMatch, match)}
							className="w-full"
						>
							<Icons.ArrowLeftRight className="mr-1 h-3 w-3" />
							Substitution
						</Button>
						<SubstitutionPopover player={player} match={match} isHome={isHome} setMatch={setMatch} />
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default MatchEventPopover;
