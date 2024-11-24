"use client";

import PlayerFormDialog from "@/components/PlayerFormDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Player } from "@/types/Player";
import { useQuery } from "@tanstack/react-query";
import { Edit, Loader2, Search, UserPlus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { fetchPlayers } from "../utils/apiService";

export default function PlayersList() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [editingPlayer, setEditingPlayer] = useState<Player | undefined>(undefined);

	const { data, error, isLoading } = useQuery({
		queryKey: [fetchPlayers.key],
		queryFn: () => fetchPlayers.fn(),
	});

	const handleDialogOpen = (player?: Player) => {
		setEditingPlayer(player ? player : undefined);
		setIsDialogOpen(true);
	};

	//TODO: handle filtered players init on success

	const filteredPlayers = data
		?.filter(
			(player) =>
				player.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				player.lastName.toLowerCase().includes(searchTerm.toLowerCase()),
		)
		.sort((a, b) => {
			const lastNameComparison = a.lastName.localeCompare(b.lastName);

			return lastNameComparison !== 0 ? lastNameComparison : a.firstName.localeCompare(b.firstName);
		});

	return (
		<div className="max-w-4xl mx-auto">
			<div className="flex items-center justify-between mb-8">
				<div className="flex items-center space-x-4">
					<h1 className="text-3xl font-bold">Players</h1>
				</div>
				<Button className="bg-[#00A3FF] hover:bg-[#0077CC] text-white" onClick={() => handleDialogOpen()}>
					<UserPlus className="mr-2 h-4 w-4" /> Add New Player
				</Button>
			</div>
			{isDialogOpen && (
				<PlayerFormDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} player={editingPlayer} />
			)}

			<Card className="bg-[#0F1C26] border-[#193549] mb-8">
				<CardContent className="pt-6">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
						<Input
							type="text"
							placeholder="Search players..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 bg-[#162029] border-[#193549] text-white"
						/>
					</div>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
				{data &&
					filteredPlayers &&
					filteredPlayers.map((player: Player) => (
						<Card key={player.id} className="bg-[#0F1C26] border-[#193549]">
							<CardContent className="p-4">
								<div className="flex items-center space-x-4">
									<Image
										src={player.photoUrl}
										alt={`${player.firstName} ${player.lastName}`}
										width={64}
										height={64}
										className="rounded-full w-16 h-16 min-w-[64px] min-h-[64px] max-w-[64px] max-h-[64px] object-cover"
									/>
									<div className="flex-grow">
										<h2 className="text-lg font-semibold text-white">
											{player.firstName} {player.lastName}
										</h2>
									</div>
									<Button
										variant="outline"
										size="icon"
										className="bg-[#162029] border-[#193549] hover:bg-[#1F2937] text-white"
										onClick={() => handleDialogOpen(player)}
									>
										<Edit className="h-4 w-4" />
										<span className="sr-only">
											Edit {player.firstName} {player.lastName}
										</span>
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
			</div>

			{isLoading && (
				<div className="flex justify-center mt-8">
					<Loader2 className="animate-spin mr-2" />
					<p className="text-center text-gray-400 mt-8">Loading players...</p>
				</div>
			)}

			{error && <p className="text-center text-gray-400 mt-8">Something went wrong. Please try again.</p>}

			{filteredPlayers?.length === 0 && (
				<p className="text-center text-gray-400 mt-8">No players found matching your search.</p>
			)}
		</div>
	);
}
