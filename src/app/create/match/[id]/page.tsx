"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CalendarIcon, MapPinIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

interface Match {
	id: number;
	homeTeam: { name: string; logo: string };
	awayTeam: { name: string; logo: string };
	place: string;
	date: string;
	score: string;
	status: "no roster" | "roster created" | "roster posted" | "score posted";
}

export default function EditMatch({ params }: { params: { id: string } }) {
	const router = useRouter();
	const [match, setMatch] = useState<Match | null>(null);

	useEffect(() => {
		// In a real application, you would fetch the match data from an API
		// For this example, we'll use mock data
		const mockMatch: Match = {
			id: Number.parseInt(params.id) || 0,
			homeTeam: { name: "Home Team", logo: "/placeholder.svg?height=32&width=32" },
			awayTeam: { name: "Away Team", logo: "/placeholder.svg?height=32&width=32" },
			place: "Stadium",
			date: new Date().toISOString(),
			score: "0 - 0",
			status: "no roster",
		};
		setMatch(mockMatch);
	}, [params.id]);

	const handleSave = () => {
		// In a real application, you would save the updated match data to an API
		console.log("Saving match:", match);
		router.push("/");
	};

	const handleLogoUpload = (team: "homeTeam" | "awayTeam") => (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file && match) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setMatch({
					...match,
					[team]: {
						...match[team],
						logo: reader.result as string,
					},
				});
			};
			reader.readAsDataURL(file);
		}
	};

	if (!match) {
		return <div>Loading...</div>;
	}

	return (
		<div className="min-h-screen bg-slate-950 text-slate-50 p-6">
			<Button onClick={() => router.push("/")} className="mb-6 bg-slate-800 text-slate-50 hover:bg-slate-700">
				<ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
			</Button>
			<h1 className="text-2xl font-bold mb-6">Edit Match</h1>
			<div className="space-y-6 max-w-2xl">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<Label htmlFor="homeTeam" className="text-slate-400">
							Home Team
						</Label>
						<Input
							id="homeTeam"
							value={match.homeTeam.name}
							onChange={(e) => setMatch({ ...match, homeTeam: { ...match.homeTeam, name: e.target.value } })}
							className="bg-slate-900 border-slate-800 text-slate-50 mt-1"
						/>
					</div>
					<div>
						<Label htmlFor="homeTeamLogo" className="text-slate-400">
							Home Team Logo
						</Label>
						<div className="flex items-center gap-2 mt-1">
							<Image
								src={match.homeTeam.logo}
								alt={`${match.homeTeam.name} logo`}
								width={32}
								height={32}
								className="rounded-full"
							/>
							<Input
								id="homeTeamLogo"
								type="file"
								onChange={handleLogoUpload("homeTeam")}
								className="bg-slate-900 border-slate-800 text-slate-50"
							/>
						</div>
					</div>
					<div>
						<Label htmlFor="awayTeam" className="text-slate-400">
							Away Team
						</Label>
						<Input
							id="awayTeam"
							value={match.awayTeam.name}
							onChange={(e) => setMatch({ ...match, awayTeam: { ...match.awayTeam, name: e.target.value } })}
							className="bg-slate-900 border-slate-800 text-slate-50 mt-1"
						/>
					</div>
					<div>
						<Label htmlFor="awayTeamLogo" className="text-slate-400">
							Away Team Logo
						</Label>
						<div className="flex items-center gap-2 mt-1">
							<Image
								src={match.awayTeam.logo}
								alt={`${match.awayTeam.name} logo`}
								width={32}
								height={32}
								className="rounded-full"
							/>
							<Input
								id="awayTeamLogo"
								type="file"
								onChange={handleLogoUpload("awayTeam")}
								className="bg-slate-900 border-slate-800 text-slate-50"
							/>
						</div>
					</div>
					<div>
						<Label htmlFor="place" className="text-slate-400">
							Place
						</Label>
						<div className="flex items-center gap-2 mt-1">
							<MapPinIcon className="h-4 w-4 text-slate-400" />
							<Input
								id="place"
								value={match.place}
								onChange={(e) => setMatch({ ...match, place: e.target.value })}
								className="bg-slate-900 border-slate-800 text-slate-50"
							/>
						</div>
					</div>
					<div>
						<Label htmlFor="date" className="text-slate-400">
							Date
						</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									id="date"
									variant="outline"
									className="w-full justify-start text-left font-normal bg-slate-900 border-slate-800 text-slate-50 mt-1"
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{match.date ? format(new Date(match.date), "PPP") : <span>Pick a date</span>}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0 bg-slate-900 border-slate-800">
								<Calendar
									mode="single"
									selected={new Date(match.date)}
									onSelect={(date) => setMatch({ ...match, date: date ? date.toISOString() : match.date })}
									initialFocus
									className="bg-slate-900 text-slate-50"
								/>
							</PopoverContent>
						</Popover>
					</div>
					<div>
						<Label htmlFor="score" className="text-slate-400">
							Score
						</Label>
						<Input
							id="score"
							value={match.score}
							onChange={(e) => setMatch({ ...match, score: e.target.value })}
							className="bg-slate-900 border-slate-800 text-slate-50 mt-1"
						/>
					</div>
					<div>
						<Label htmlFor="status" className="text-slate-400">
							Status
						</Label>
						<Input
							id="status"
							value={match.status}
							readOnly
							className="bg-slate-900 border-slate-800 text-slate-50 mt-1"
						/>
					</div>
				</div>
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-slate-50">Match Images</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<h4 className="mb-2 font-semibold text-slate-400">Roster Story</h4>
							<Image
								src="/placeholder.svg?height=1920&width=1080"
								alt="Roster Story"
								width={1080}
								height={1920}
								className="w-full h-auto rounded-md border border-slate-800"
							/>
						</div>
						<div>
							<h4 className="mb-2 font-semibold text-slate-400">Score Story</h4>
							<Image
								src="/placeholder.svg?height=1920&width=1080"
								alt="Score Story"
								width={1080}
								height={1920}
								className="w-full h-auto rounded-md border border-slate-800"
							/>
						</div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<h4 className="mb-2 font-semibold text-slate-400">Roster Post</h4>
							<Image
								src="/placeholder.svg?height=630&width=1200"
								alt="Roster Post"
								width={1200}
								height={630}
								className="w-full h-auto rounded-md border border-slate-800"
							/>
						</div>
						<div>
							<h4 className="mb-2 font-semibold text-slate-400">Score Post</h4>
							<Image
								src="/placeholder.svg?height=630&width=1200"
								alt="Score Post"
								width={1200}
								height={630}
								className="w-full h-auto rounded-md border border-slate-800"
							/>
						</div>
					</div>
				</div>
				<div className="flex justify-between">
					<div>
						<Button
							onClick={() => setMatch({ ...match, status: "roster created" })}
							className="mr-2 bg-blue-600 text-slate-50 hover:bg-blue-700"
						>
							Create Roster
						</Button>
						<Button
							onClick={() => setMatch({ ...match, status: "score posted" })}
							className="bg-blue-600 text-slate-50 hover:bg-blue-700"
						>
							Add Score
						</Button>
					</div>
					<Button onClick={handleSave} className="bg-green-600 text-slate-50 hover:bg-green-700">
						Save changes
					</Button>
				</div>
			</div>
		</div>
	);
}
