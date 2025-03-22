import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Player, Team } from "../../app/tracker/[id]/types/match";
import { useState } from "react";

interface TeamSetupProps {
	team: Team;
	onUpdate: (updatedTeam: Team) => void;
	label: string;
}

export function TeamSetup({ team, onUpdate, label }: TeamSetupProps) {
	const [newPlayer, setNewPlayer] = useState<Partial<Player>>({
		positionId: undefined,
		name: "",
	});

	const addPlayer = () => {
		if (newPlayer.positionId && newPlayer.name) {
			onUpdate({
				...team,
				players: [...team.players, newPlayer as Player].sort((a, b) => a.positionId - b.positionId),
			});
			setNewPlayer({ positionId: undefined, name: "" });
		}
	};

	const removePlayer = (positionId: number) => {
		onUpdate({
			...team,
			players: team.players.filter((p) => p.positionId !== positionId),
		});
	};

	return (
		<div className="space-y-4">
			<h3 className="font-semibold text-lg">{label}</h3>

			<div className="grid grid-cols-2 gap-2">
				<Input
					type="number"
					placeholder="Position ID"
					value={newPlayer.positionId || ""}
					onChange={(e) =>
						setNewPlayer((prev) => ({
							...prev,
							positionId: Number.parseInt(e.target.value),
						}))
					}
					className="bg-gray-700 border-gray-600"
				/>
				<Input
					placeholder="Player Name"
					value={newPlayer.name}
					onChange={(e) =>
						setNewPlayer((prev) => ({
							...prev,
							name: e.target.value,
						}))
					}
					className="bg-gray-700 border-gray-600"
				/>
			</div>

			<Button onClick={addPlayer} disabled={!newPlayer.positionId || !newPlayer.name} className="w-full">
				Add Player
			</Button>

			<div className="space-y-2">
				{team.players.map((player) => (
					<div key={player.positionId} className="flex justify-between items-center bg-gray-700 p-2 rounded">
						<span>
							#{player.positionId} - {player.name}
						</span>
						<Button variant="destructive" size="sm" onClick={() => removePlayer(player.positionId)}>
							Remove
						</Button>
					</div>
				))}
			</div>
		</div>
	);
}
