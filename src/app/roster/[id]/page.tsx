"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PlusCircle, MapPin, Calendar } from "lucide-react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createRoster, fetchMatchById, fetchPlayers, fetchRoster } from "@/lib/apiService";
import { format } from "date-fns/format";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/hooks/use-toast";
import type { Player } from "@/types/Player";
import { type CreateRosterRequest, createRosterRequestSchema } from "@/types/Roster";

//todo: change this to a real API call
const rugbyPositions = [
	{ positionId: 0, number: 1, name: "Loosehead Prop" },
	{ positionId: 1, number: 2, name: "Hooker" },
	{ positionId: 2, number: 3, name: "Tighthead Prop" },
	{ positionId: 3, number: 4, name: "Lock" },
	{ positionId: 4, number: 5, name: "Lock" },
	{ positionId: 5, number: 6, name: "Blindside Flanker" },
	{ positionId: 6, number: 7, name: "Openside Flanker" },
	{ positionId: 7, number: 8, name: "Number 8" },
	{ positionId: 8, number: 9, name: "Scrum-half" },
	{ positionId: 9, number: 10, name: "Fly-half" },
	{ positionId: 10, number: 11, name: "Left Wing" },
	{ positionId: 11, number: 12, name: "Inside Centre" },
	{ positionId: 12, number: 13, name: "Outside Centre" },
	{ positionId: 13, number: 14, name: "Right Wing" },
	{ positionId: 14, number: 15, name: "Full-back" },
	{ positionId: 15, number: 16, name: "Replacement Front Row" },
	{ positionId: 16, number: 17, name: "Replacement Front Row" },
	{ positionId: 17, number: 18, name: "Replacement Front Row" },
	{ positionId: 18, number: 19, name: "Replacement Lock" },
	{ positionId: 19, number: 20, name: "Replacement Back Row" },
	{ positionId: 20, number: 21, name: "Replacement Scrum-half" },
	{ positionId: 21, number: 22, name: "Replacement Back" },
	{ positionId: 22, number: 23, name: "Replacement Back" },
];

export default function RosterPage() {
	const { id } = useParams<{ id: string }>();
	const [roster, setRoster] = useState(
		rugbyPositions.map((position) => ({ positionId: position.positionId, player: "" })),
	);
	const [isUpdate, setIsUpdate] = useState(false);

	const [unSelectedPlayers, setUnSelectedPlayers] = useState<Player[]>([] as Player[]);

	const { data: match, isLoading } = useQuery({
		queryKey: [fetchMatchById.key, id],
		queryFn: () => fetchMatchById.fn(id as string),
		refetchOnMount: false,
	});

	const { data: players, isLoading: isLoadingPlayers } = useQuery({
		queryKey: ["players"],
		queryFn: () => fetchPlayers.fn(),
	});

	const { data: rosterData, isLoading: isLoadingRoster } = useQuery({
		queryKey: [fetchRoster.key, id],
		queryFn: () => fetchRoster.fn(Number.parseInt(id as string) as number),
	});

	const { mutate, isPending: isSaving } = useMutation({
		mutationFn: (request: CreateRosterRequest) => createRoster.fn(request),
		onSuccess: () => {
			toast({
				title: "Roster Created",
				description: "Roster created successfully",
			});
		},
		onError: () => {
			toast({
				title: "Roster Creation Failed",
				description: "Please make some changes and try again",
				variant: "destructive",
			});
		},
	});

	useEffect(() => {
		if (players) {
			setUnSelectedPlayers(players);
		}
	}, [players]);

	const matchDate = useMemo(() => {
		if (match) {
			return format(new Date(match.date), "yyyy.mm.dd. HH:mm");
		}
		return "";
	}, [match]);

	useMemo(() => {
		if (rosterData) {
			setRoster(
				rugbyPositions.map((position) => {
					const player = rosterData.find((player) => player.positionId === position.positionId);
					return {
						positionId: position.positionId,
						player: player ? player.playerId.toString() : "",
					};
				}),
			);

			setIsUpdate(true);
		}
	}, [rosterData]);

	console.log("roster", roster);

	const handlePlayerChange = (index: number, value: string) => {
		const newRoster = [...roster];
		newRoster[index - 1].player = value;
		setRoster(newRoster);
		setUnSelectedPlayers(unSelectedPlayers.filter((player) => player.id !== Number.parseInt(value)));
	};

	const validateRoster = () => {
		for (const player of roster) {
			if (player.player === "") {
				toast({
					title: "Missing Player",
					description: "Please select a player for each position.",
					variant: "destructive",
				});
			}
		}
	};
	const handleSaveRoster = () => {
		validateRoster();
		const transformedRoster = roster.map((player) => {
			return {
				playerId: Number.parseInt(player.player),
				positionId: player.positionId,
			};
		});

		const request = createRosterRequestSchema.parse({
			matchId: Number.parseInt(id as string),
			players: transformedRoster,
		});
		mutate(request);
	};

	const findPlayerById = (positionId: number) => {
		const playerId = rosterData?.find((player) => player.positionId === positionId)?.playerId;
		const player = players?.find((player) => player.id === playerId);
		return `${player?.firstName} ${player?.lastName}`;
	};

	return (
		<div className="max-w-5xl mx-auto ">
			<div className="flex items-center justify-between mb-8">
				<div className="flex items-center space-x-4">
					<h1 className="text-3xl font-bold">Create Roster</h1>
				</div>
				<Button className="bg-[#00A3FF] hover:bg-[#0077CC] text-white">
					<PlusCircle className="mr-2 h-4 w-4" /> Add New Player
				</Button>
			</div>

			<Card className="bg-[#0F1C26] border-[#193549] mb-8">
				<CardHeader>
					<CardTitle className="text-[#00A3FF]">Match Details</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading && (
						<div className="w-full h-full flex flex-col items-center justify-center">
							<Spinner className="text-[#00A3FF]">
								<span className="text-gray-300">Loading match data</span>
							</Spinner>
						</div>
					)}
					{match && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
							<div className="flex space-x-3 justify-center md:justify-end items-center">
								<Image src={match.homeTeam.logoUrl} alt={match.homeTeam.name} width={50} height={50} />
								<p className="text-gray-300 text-lg font-bold">{match.homeTeam.name}</p>
							</div>
							<div className="flex space-x-3 justify-center md:justify-start items-center">
								<Image
									src={match.awayTeam.logoUrl}
									className="md:hidden"
									alt={match.awayTeam.name}
									width={50}
									height={50}
								/>
								<p className="text-gray-300 text-lg font-bold">{match.awayTeam.name}</p>
								<Image
									src={match.awayTeam.logoUrl}
									className="max-md:hidden"
									alt={match.awayTeam.name}
									width={50}
									height={50}
								/>
							</div>
							<div className="flex space-x-3 justify-center">
								<Label htmlFor="match-place" className="text-gray-300 flex justify-center items-center">
									<MapPin className="w-4 h-4 inline-block mr-2" />
								</Label>
								<p className="text-gray-300">{match.place}</p>
							</div>
							<div className="flex space-x-3 justify-center">
								<Label htmlFor="match-date-time" className="text-gray-300 flex justify-center items-center">
									<Calendar className="w-4 h-4 inline-block mr-2" />
								</Label>
								<p className="text-gray-300">{matchDate}</p>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<Card className="bg-[#0F1C26] border-[#193549]">
				<CardHeader>
					<CardTitle className="text-[#00A3FF]">Roster Selection</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoadingPlayers && isLoadingRoster && (
						<div className="w-full h-full flex flex-col items-center justify-center">
							<Spinner className="text-[#00A3FF]">
								<span className="text-gray-300">Loading players</span>
							</Spinner>
						</div>
					)}
					{players && roster && (
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
							{rugbyPositions.map((position) => (
								<div key={position.number} className="space-y-2">
									<label htmlFor={`player-${position.number}`} className="text-sm font-medium text-gray-500">
										{position.number}. {position.name}
									</label>
									<Select onValueChange={(value) => handlePlayerChange(position.number, value)}>
										<SelectTrigger
											id={`player-${position.number}`}
											className="bg-[#162029] border-[#193549] focus:ring-[#00A3FF] focus:ring-opacity-50 text-gray-300"
										>
											<SelectValue
												placeholder={
													rosterData && rosterData.length > 0 ? findPlayerById(position.positionId) : "Select Player"
												}
											/>
										</SelectTrigger>
										<SelectContent className="bg-[#162029] border-[#193549]">
											{players.map((player) => (
												//todo: add a check to see if player is already selected logic is implemented
												<SelectItem className="text-gray-300" key={player.id} value={player.id.toString()}>
													{player.firstName} {player.lastName}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							))}
						</div>
					)}
				</CardContent>

				<CardFooter className="flex justify-center">
					{isSaving ? (
						<Spinner className="text-[#00A3FF]">
							<span className="text-gray-300">Saving in progress</span>
						</Spinner>
					) : (
						players &&
						roster && (
							<Button onClick={handleSaveRoster} className="bg-[#00A3FF] hover:bg-[#00A3FF]/90">
								{isUpdate ? "Update Roster" : "Save Roster"}
							</Button>
						)
					)}
				</CardFooter>
			</Card>
		</div>
	);
}
