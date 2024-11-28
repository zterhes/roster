"use client";

import Image from "next/image";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "./ui/card";
import { useRouter } from "next/navigation";

interface Match {
	id: number;
	homeTeam: { name: string; logo: string };
	awayTeam: { name: string; logo: string };
	place: string;
	date: string;
	score: string;
	status: "no roster" | "roster created" | "roster posted" | "score posted";
}

// Sample match data
const matches: Match[] = [
	{
		id: 1,
		homeTeam: {
			name: "Dragons RFC",
			logo: "/images/gorilla_logo.png",
		},
		awayTeam: {
			name: "Cardiff Rugby",
			logo: "/images/gorilla_logo.png",
		},
		place: "Rodney Parade",
		date: "2024-02-10T19:35:00",
		score: "24 - 21",
		status: "score posted",
	},
	{
		id: 2,
		homeTeam: {
			name: "Scarlets",
			logo: "/images/gorilla_logo.png",
		},
		awayTeam: {
			name: "Ospreys",
			logo: "/images/gorilla_logo.png",
		},
		place: "Parc y Scarlets",
		date: "2024-02-17T17:15:00",
		score: "TBD",
		status: "roster created",
	},
	{
		id: 3,
		homeTeam: {
			name: "Lions",
			logo: "/images/gorilla_logo.png",
		},
		awayTeam: {
			name: "Sharks",
			logo: "/images/gorilla_logo.png",
		},
		place: "Ellis Park",
		date: "2024-02-24T14:00:00",
		score: "TBD",
		status: "no roster",
	},
];

export default function MatchesDashboard() {
	const router = useRouter();

	return (
		<div className="flex min-h-screen flex-col min-w-screen">
			<div className="flex items-center justify-between p-6">
				<h1 className="text-3xl font-bold">Matches</h1>
				<Button className="bg-[#00A3FF] hover:bg-[#0077CC] text-white" onClick={() => router.push("/create/match/new")}>
					<CalendarIcon className="mr-2 h-4 w-4" />
					Add New Match
				</Button>
			</div>
			<Card className="bg-[#0F1C26] border-[#193549] mb-8 text-gray-300">
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow className="border-slate-800 hover:bg-slate-900">
								<TableHead className="text-slate-400">Home Team</TableHead>
								<TableHead className="text-slate-400">Away Team</TableHead>
								<TableHead className="text-slate-400">Place</TableHead>
								<TableHead className="text-slate-400">Date & Time</TableHead>
								<TableHead className="text-slate-400">Score</TableHead>
								<TableHead className="text-slate-400">Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{matches.map((match) => (
								<TableRow
									key={match.id}
									className="border-slate-800 hover:bg-slate-900 cursor-pointer"
									onClick={() => router.push(`/create/match/${match.id}`)}
								>
									<TableCell className="font-medium">
										<div className="flex items-center gap-2">
											<Image
												src={match.homeTeam.logo}
												alt={`${match.homeTeam.name} logo`}
												width={32}
												height={32}
												className="rounded-full"
											/>
											<span className="hidden sm:inline">{match.homeTeam.name}</span>
										</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<Image
												src={match.awayTeam.logo}
												alt={`${match.awayTeam.name} logo`}
												width={32}
												height={32}
												className="rounded-full"
											/>
											<span className="hidden sm:inline">{match.awayTeam.name}</span>
										</div>
									</TableCell>
									<TableCell className="hidden md:table-cell">
										<div className="flex items-center gap-2">
											<MapPinIcon className="h-4 w-4 text-slate-400" />
											{match.place}
										</div>
									</TableCell>
									<TableCell className="hidden lg:table-cell">
										<div className="flex items-center gap-2">
											<CalendarIcon className="h-4 w-4 text-slate-400" />
											{new Date(match.date).toLocaleString("en-GB", {
												dateStyle: "medium",
												timeStyle: "short",
											})}
										</div>
									</TableCell>
									<TableCell>{match.score}</TableCell>
									<TableCell className="hidden sm:table-cell">
										<span className="capitalize">{match.status}</span>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
