"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import type { Match, Team, MatchEvent, Player } from "./types/match"
import { sampleHomeTeam, sampleAwayTeam } from "./data/sampleData"
import * as Icons from "lucide-react"

export default function MatchTracker() {
  const [match, setMatch] = useState<Match>(() => {
    const saved = localStorage.getItem("rugbyMatch")
    return saved
      ? JSON.parse(saved)
      : {
          homeTeam: sampleHomeTeam,
          awayTeam: sampleAwayTeam,
          events: [],
          isPlaying: false,
          currentTime: 0,
        }
  })

  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem("rugbyMatch", JSON.stringify(match))
  }, [match])

  useEffect(() => {
    if (match.isPlaying && !timer) {
      const interval = setInterval(() => {
        setMatch((prev) => ({ ...prev, currentTime: prev.currentTime + 1 }))
      }, 1000)
      setTimer(interval)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [match.isPlaying, timer])

  const addEvent = (team: "home" | "away", player: Player, type: MatchEvent["type"], points?: number) => {
    const newEvent: MatchEvent = {
      timestamp: match.currentTime,
      team,
      type,
      points,
      player,
    }

    setMatch((prev) => {
      const targetTeam = team === "home" ? "homeTeam" : "awayTeam"
      const updatedMatch = { ...prev }

      if (points) {
        updatedMatch[targetTeam].score += points
      }

      if (type === "yellowCard") updatedMatch[targetTeam].yellowCards++
      if (type === "redCard") updatedMatch[targetTeam].redCards++
      if (type === "tackle") updatedMatch[targetTeam].tackles++
      if (type === "breakthrough") updatedMatch[targetTeam].breakthroughs++

      return {
        ...updatedMatch,
        events: [...prev.events, newEvent],
      }
    })
  }

  const renderPlayerList = (team: Team, isHome: boolean) => (
    <div className="space-y-2 w-1/2 px-2">
      <h3 className="font-semibold text-lg flex items-center">
        {Icons[team.icon as keyof typeof Icons] &&
          React.createElement(Icons[team.icon as keyof typeof Icons], { className: "mr-2" })}
        {team.name}
      </h3>
      <div className="space-y-1">
        {team.players.map((player) => (
          <Popover key={player.id}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-sm px-2 py-1 h-auto">
                #{player.jerseyNumber} - {player.name}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto">
              <div className="grid gap-2">
                <div className="space-y-1">
                  <h4 className="font-medium leading-none">{player.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {player.position} - #{player.jerseyNumber}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    onClick={() => addEvent(isHome ? "home" : "away", player, "try", 5)}
                    className="w-full"
                  >
                    <Icons.Target className="mr-1 h-3 w-3" /> Try (+5)
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => addEvent(isHome ? "home" : "away", player, "conversion", 2)}
                    className="w-full"
                  >
                    <Icons.Plus className="mr-1 h-3 w-3" /> Conv (+2)
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => addEvent(isHome ? "home" : "away", player, "penalty", 3)}
                    className="w-full"
                  >
                    <Icons.Flag className="mr-1 h-3 w-3" /> Pen (+3)
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => addEvent(isHome ? "home" : "away", player, "yellowCard")}
                    className="w-full bg-yellow-500"
                  >
                    <Icons.AlertTriangle className="mr-1 h-3 w-3" /> Yellow
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => addEvent(isHome ? "home" : "away", player, "redCard")}
                    className="w-full bg-red-500"
                  >
                    <Icons.X className="mr-1 h-3 w-3" /> Red
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => addEvent(isHome ? "home" : "away", player, "tackle")}
                    className="w-full"
                  >
                    <Icons.Shield className="mr-1 h-3 w-3" /> Tackle
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => addEvent(isHome ? "home" : "away", player, "breakthrough")}
                    className="w-full"
                  >
                    <Icons.Zap className="mr-1 h-3 w-3" /> Break
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-6">Rugby Match Tracker</h1>

      {/* Timer */}
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardContent className="p-6">
          <div className="text-4xl font-mono text-center">
            {Math.floor(match.currentTime / 60)}:{(match.currentTime % 60).toString().padStart(2, "0")}
          </div>
          <Button onClick={() => setMatch((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))} className="w-full mt-4">
            {match.isPlaying ? <Icons.Pause className="mr-2" /> : <Icons.Play className="mr-2" />}
            {match.isPlaying ? "Pause" : "Start"}
          </Button>
        </CardContent>
      </Card>

      {/* Player Lists */}
      <div className="flex mb-6">
        {renderPlayerList(match.homeTeam, true)}
        {renderPlayerList(match.awayTeam, false)}
      </div>

      {/* Drawer Trigger */}
      <Button onClick={() => setDrawerOpen(true)} className="w-full">
        <Icons.ArrowUp className="mr-2 h-4 w-4" /> View Stats and Events
      </Button>

      {/* Drawer for Stats and Match Events */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Match Statistics and Events</DrawerTitle>
            <DrawerDescription>View current match stats and event log</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            {/* Score and Stats Display */}
            <Card className="bg-gray-800 border-gray-700 mb-6">
              <CardContent className="p-6">
                <div className="text-center text-3xl mb-6 flex justify-center items-center">
                  <span className="flex items-center">
                    {Icons[match.homeTeam.icon as keyof typeof Icons] &&
                      React.createElement(Icons[match.homeTeam.icon as keyof typeof Icons], { className: "mr-2" })}
                    {match.homeTeam.score}
                  </span>
                  <span className="mx-4">-</span>
                  <span className="flex items-center">
                    {match.awayTeam.score}
                    {Icons[match.awayTeam.icon as keyof typeof Icons] &&
                      React.createElement(Icons[match.awayTeam.icon as keyof typeof Icons], { className: "ml-2" })}
                  </span>
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
                </div>
              </CardContent>
            </Card>

            {/* Match Events Log */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-xl mb-4 flex items-center">
                  <Icons.List className="mr-2" /> Match Events
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {match.events.map((event, index) => (
                    <div key={index} className="text-sm flex items-center">
                      <span className="mr-2">
                        {Math.floor(event.timestamp / 60)}:{(event.timestamp % 60).toString().padStart(2, "0")}
                      </span>
                      <span className="mr-2">
                        #{event.player.jerseyNumber} {event.player.name}
                      </span>
                      <span className="mr-2">{event.team === "home" ? match.homeTeam.name : match.awayTeam.name}</span>
                      {event.type === "try" && <Icons.Target className="mr-1" />}
                      {event.type === "conversion" && <Icons.Plus className="mr-1" />}
                      {event.type === "penalty" && <Icons.Flag className="mr-1" />}
                      {event.type === "yellowCard" && <Icons.AlertTriangle className="text-yellow-500 mr-1" />}
                      {event.type === "redCard" && <Icons.X className="text-red-500 mr-1" />}
                      {event.type === "tackle" && <Icons.Shield className="mr-1" />}
                      {event.type === "breakthrough" && <Icons.Zap className="mr-1" />}
                      <span>
                        {event.type}
                        {event.points ? ` (+${event.points})` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

