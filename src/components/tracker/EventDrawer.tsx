import type { Dispatch, SetStateAction } from "react";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "../ui/drawer";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import type { Match } from "@/app/tracker/[id]/types/match";
import * as Icons from "lucide-react";
import { useFormatedTime } from "@/app/tracker/utils";

type Props = {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
	match: Match;
};

const EventDrawer = ({ open, setOpen, match }: Props) => {
	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerContent className="bg-gray-800 border-gray-700 text-white">
				<DrawerHeader>
					<DrawerTitle>Match Statistics and Events</DrawerTitle>
					<DrawerDescription>View current match stats and event log</DrawerDescription>
				</DrawerHeader>
				<div className="p-4 pb-0">
					{/* Score and Stats Display */}
					<Card className="bg-gray-800 border-gray-700 mb-6 text-white">
						<CardContent className="p-6">
							<div className="text-center text-3xl mb-6 flex justify-center items-center">
								<span className="flex items-center">{match.homeTeam.score}</span>
								<span className="mx-4">-</span>
								<span className="flex items-center">{match.awayTeam.score}</span>
							</div>

							<div className="grid grid-cols-3 gap-4 text-sm">
								<div className="text-center">{match.homeTeam.name}</div>
								<div className="text-center">Stats</div>
								<div className="text-center">{match.awayTeam.name}</div>

								<div className="text-center flex justify-center">
									<Icons.AlertTriangle className="text-yellow-500 mr-1" /> {match.homeTeam.yellowCards}
								</div>
								<div className="text-center">Yellow Cards</div>
								<div className="text-center flex justify-center">
									{match.awayTeam.yellowCards} <Icons.AlertTriangle className="text-yellow-500 ml-1" />
								</div>

								<div className="text-center flex justify-center">
									<Icons.X className="text-red-500 mr-1" /> {match.homeTeam.redCards}
								</div>
								<div className="text-center">Red Cards</div>
								<div className="text-center flex justify-center">
									{match.awayTeam.redCards} <Icons.X className="text-red-500 ml-1" />
								</div>

								<div className="text-center flex justify-center">
									<Icons.Shield className="mr-1" /> {match.homeTeam.tackles}
								</div>
								<div className="text-center">Tackles</div>
								<div className="text-center flex justify-center">
									{match.awayTeam.tackles} <Icons.Shield className="ml-1" />
								</div>

								<div className="text-center flex justify-center">
									<Icons.Zap className="mr-1" /> {match.homeTeam.breakthroughs}
								</div>
								<div className="text-center">Breakthroughs</div>
								<div className="text-center flex justify-center">
									{match.awayTeam.breakthroughs} <Icons.Zap className="ml-1" />
								</div>

								<div className="text-center flex justify-center">
									<Icons.ArrowLeftRight className="mr-1" /> {match.homeTeam.substitutions}
								</div>
								<div className="text-center">Substitutions</div>
								<div className="text-center flex justify-center">
									{match.awayTeam.substitutions} <Icons.ArrowLeftRight className="ml-1" />
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Match Events Log */}
					<Card className="bg-gray-800 border-gray-700 text-white">
						<CardContent className="p-6">
							<h3 className="text-xl mb-4 flex items-center">
								<Icons.List className="mr-2" /> Match Events
							</h3>
							<div className="space-y-2 max-h-64 overflow-y-auto">
								{match.events.map((event) => (
									<div key={event.timestamp} className="text-sm w-full flex justify-between items-center">
										<p className="mr-2 justify-start">{useFormatedTime(event.timestamp)}</p>
										<div className="text-center">
											<p className="mr-2">
												#{event.player.positionId + 1} {event.player.name}
											</p>
											<p>{event.team === "home" ? match.homeTeam.name : match.awayTeam.name}</p>
										</div>
										<div className="text-center">
											{event.type === "try" && <Icons.Target />}
											{event.type === "conversion" && <Icons.Plus className="mr-1" />}
											{event.type === "penalty" && <Icons.Flag />}
											{event.type === "yellowCard" && <Icons.AlertTriangle className="text-yellow-500" />}
											{event.type === "redCard" && <Icons.X className="text-red-500" />}
											{event.type === "tackle" && <Icons.Shield />}
											{event.type === "breakthrough" && <Icons.Zap />}
											{event.type === "substitution" && <Icons.ArrowLeftRight />}
											<p>
												{event.type}
												{event.points ? ` (+${event.points})` : ""}
											</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
				<DrawerFooter>
					<DrawerClose asChild>
						<Button variant="roster">Close</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
};

export default EventDrawer;
