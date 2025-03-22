"use client";

import { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Match, Team } from "./types/match";
import { ArrowUp } from "lucide-react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import PlayersList from "@/components/tracker/PlayersList";
import { Timer } from "@/components/tracker/Timer";
import Image from "next/image";
import { TrackerContextProvider } from "@/components/tracker/trackerContext";
import EventDrawer from "@/components/tracker/EventDrawer";
import { initMatch } from "@/app/tracker/utils";

export default function MatchTracker() {
	const { id } = useParams<{ id: string }>();

	const [match, setMatch] = useState<Match | undefined>(undefined);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const { isLoading, isError, error } = useQuery({
		queryKey: ["getMatch", id],
		queryFn: () => initMatch(id as string, setMatch),
	});

	useEffect(() => {
		if (!match) return;
		localStorage.setItem("rugbyMatch", JSON.stringify(match));
	}, [match]);

	if (isLoading) return <div>Loading...</div>;
	if (isError) return <div>Error: {error.message}</div>;
	if (!match) return <div>Someting went wrong, please connect the developer</div>;

	return (
		<TrackerContextProvider>
			<div className="min-h-screen bg-gray-900 text-white p-4">
				<h1 className="text-2xl font-bold mb-6">Rugby Match Tracker</h1>

				<div className="md:flex mb-6">
					<div className=" md:w-1/2 md:mt-48 pb-6 space-y-6">
						{/* Timer */}
						<Timer
							className="sticky top-0 h-[150px]"
							match={match}
							setMatch={setMatch as React.Dispatch<React.SetStateAction<Match>>}
						/>
						<Card className=" sticky bg-gray-800 border-gray-700 mb-6 h-[150px] " style={{ top: "calc(100% + 1rem)" }}>
							<CardContent className="p-6 flex items-center justify-center text-5xl font-bold text-white">
								<p>{match.homeTeam.score}</p>
								<p className="mx-5"> : </p>
								<p>{match.awayTeam.score}</p>
							</CardContent>
						</Card>
					</div>
					{/* Player Lists */}
					<div className=" md:w-1/2 mb-6 ">
						<div className="flex w-full justify-around">
							<div className="flex items-center space-x-4">
								<Image src={match.homeTeam.icon} alt={match.homeTeam.name} width={50} height={50} />
								<h3 className="font-semibold text-lg flex items-center max-sm:hidden">{match.homeTeam.name}</h3>
							</div>
							<div className="flex items-center space-x-4">
								<h3 className="font-semibold text-lg flex items-center max-sm:hidden">{match.awayTeam.name}</h3>
								<Image src={match.awayTeam.icon} alt={match.awayTeam.name} width={50} height={50} />
							</div>
						</div>
						<PlayersList
							homeTeam={match.homeTeam}
							awayTeam={match.awayTeam}
							setMatch={setMatch as React.Dispatch<React.SetStateAction<Match>>}
							match={match}
						/>
					</div>
				</div>

				{/* Drawer Trigger */}
			</div>
			{/* Drawer for Stats and Match Events */}
			<Button variant="roster" onClick={() => setDrawerOpen(true)} className=" w-full fixed bottom-4 left-4 right-4">
				<ArrowUp className="mr-2 h-4 w-4" /> View Stats and Events
			</Button>
			<EventDrawer open={drawerOpen} setOpen={setDrawerOpen} match={match} />
		</TrackerContextProvider>
	);
}
