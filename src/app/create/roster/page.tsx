"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, MapPin, Calendar } from "lucide-react";

const rugbyPositions = [
	{ number: 1, name: "Loosehead Prop" },
	{ number: 2, name: "Hooker" },
	{ number: 3, name: "Tighthead Prop" },
	{ number: 4, name: "Lock" },
	{ number: 5, name: "Lock" },
	{ number: 6, name: "Blindside Flanker" },
	{ number: 7, name: "Openside Flanker" },
	{ number: 8, name: "Number 8" },
	{ number: 9, name: "Scrum-half" },
	{ number: 10, name: "Fly-half" },
	{ number: 11, name: "Left Wing" },
	{ number: 12, name: "Inside Centre" },
	{ number: 13, name: "Outside Centre" },
	{ number: 14, name: "Right Wing" },
	{ number: 15, name: "Full-back" },
	{ number: 16, name: "Replacement Front Row" },
	{ number: 17, name: "Replacement Front Row" },
	{ number: 18, name: "Replacement Front Row" },
	{ number: 19, name: "Replacement Lock" },
	{ number: 20, name: "Replacement Back Row" },
	{ number: 21, name: "Replacement Scrum-half" },
	{ number: 22, name: "Replacement Back" },
	{ number: 23, name: "Replacement Back" },
];

export default function Component() {
	const [roster, setRoster] = useState(rugbyPositions.map((position) => ({ ...position, player: "" })));
	const [matchPlace, setMatchPlace] = useState("");
	const [matchDateTime, setMatchDateTime] = useState("");

	console.log("roster", roster);
	//console.log('matchPlace', matchPlace)
	//console.log('matchDateTime', roster)

	const handlePlayerChange = (index: number, value: string) => {
		const newRoster = [...roster];
		newRoster[index - 1].player = value;
		setRoster(newRoster);
	};

	return (
		<div className="max-w-4xl mx-auto ">
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
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="match-place" className="text-gray-300">
								<MapPin className="w-4 h-4 inline-block mr-2" />
								Match Place
							</Label>
							<Input
								id="match-place"
								placeholder="Enter match location"
								value={matchPlace}
								onChange={(e) => setMatchPlace(e.target.value)}
								className="bg-[#162029] border-[#193549] text-white"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="match-date-time" className="text-gray-300">
								<Calendar className="w-4 h-4 inline-block mr-2" />
								Match Date & Time
							</Label>
							<Input
								id="match-date-time"
								type="datetime-local"
								value={matchDateTime}
								onChange={(e) => setMatchDateTime(e.target.value)}
								className="bg-[#162029] border-[#193549] text-white"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="bg-[#0F1C26] border-[#193549]">
				<CardHeader>
					<CardTitle className="text-[#00A3FF]">Roster Selection</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
						{roster.map((position) => (
							<div key={position.number} className="space-y-2">
								<label htmlFor={`player-${position.number}`} className="text-sm font-medium text-gray-300">
									{position.number}. {position.name}
								</label>
								<Select onValueChange={(value) => handlePlayerChange(position.number, value)}>
									<SelectTrigger
										id={`player-${position.number}`}
										className="bg-[#162029] border-[#193549] focus:ring-[#00A3FF] focus:ring-opacity-50"
									>
										<SelectValue placeholder="Select player" />
									</SelectTrigger>
									<SelectContent className="bg-[#162029] border-[#193549]">
										<SelectItem value="player1">Player 1</SelectItem>
										<SelectItem value="player2">Player 2</SelectItem>
										<SelectItem value="player3">Player 3</SelectItem>
										{/* Add more player options as needed */}
									</SelectContent>
								</Select>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
