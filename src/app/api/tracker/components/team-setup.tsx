import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Player, Team } from "../types/match"
import { useState } from "react"

interface TeamSetupProps {
  team: Team
  onUpdate: (updatedTeam: Team) => void
  label: string
}

export function TeamSetup({ team, onUpdate, label }: TeamSetupProps) {
  const [newPlayer, setNewPlayer] = useState<Partial<Player>>({
    jerseyNumber: undefined,
    name: "",
  })

  const addPlayer = () => {
    if (newPlayer.jerseyNumber && newPlayer.name) {
      onUpdate({
        ...team,
        players: [...team.players, newPlayer as Player].sort((a, b) => a.jerseyNumber - b.jerseyNumber),
      })
      setNewPlayer({ jerseyNumber: undefined, name: "" })
    }
  }

  const removePlayer = (jerseyNumber: number) => {
    onUpdate({
      ...team,
      players: team.players.filter((p) => p.jerseyNumber !== jerseyNumber),
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{label}</h3>

      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          placeholder="Jersey #"
          value={newPlayer.jerseyNumber || ""}
          onChange={(e) =>
            setNewPlayer((prev) => ({
              ...prev,
              jerseyNumber: Number.parseInt(e.target.value),
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

      <Button onClick={addPlayer} disabled={!newPlayer.jerseyNumber || !newPlayer.name} className="w-full">
        Add Player
      </Button>

      <div className="space-y-2">
        {team.players.map((player) => (
          <div key={player.jerseyNumber} className="flex justify-between items-center bg-gray-700 p-2 rounded">
            <span>
              #{player.jerseyNumber} - {player.name}
            </span>
            <Button variant="destructive" size="sm" onClick={() => removePlayer(player.jerseyNumber)}>
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

