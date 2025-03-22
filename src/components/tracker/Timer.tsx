import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import * as Icons from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { Match } from "@/app/tracker/[id]/types/match";
import { useEffect } from "react";
import { format, intervalToDuration } from "date-fns";
import { useFormatedTime } from "@/app/tracker/utils";
export const Timer = ({
	match,
	setMatch,
	className,
}: { match: Match; setMatch: Dispatch<SetStateAction<Match>>; className?: string }) => {
	useEffect(() => {
		let interval: NodeJS.Timeout | null = null;
		if (match.isPlaying) {
			interval = setInterval(() => {
				setMatch((prevMatch) => ({ ...prevMatch, currentTime: prevMatch.currentTime + 1000 }));
			}, 1000);
		} else {
			if (interval !== null) {
				clearInterval(interval);
			}
		}
		return () => {
			if (interval !== null) {
				clearInterval(interval);
			}
		};
	}, [match.isPlaying, setMatch]);

	const handleClick = () => {
		setMatch((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
	};

	const handleStop = () => {
		setMatch((prev) => ({ ...prev, isPlaying: false }));
	};

	return (
		<Card className={`bg-gray-800 border-gray-700 top-0 ${className}`}>
			<CardContent className="p-6">
				<div className="text-4xl font-mono text-center text-white">{useFormatedTime(match.currentTime)}</div>
				<div className="flex justify-center space-x-3">
					<Button variant="roster" onClick={handleClick} className="w-full mt-4">
						{match.isPlaying ? <Icons.Pause className="mr-2" /> : <Icons.Play className="mr-2" />}
						{match.isPlaying ? "Pause" : "Start"}
					</Button>
					<Button
						variant="destructive"
						onClick={handleStop}
						className={`w-full mt-4 ${match.isPlaying ? "" : "opacity-50 cursor-not-allowed"}`}
					>
						<Icons.BookCheck /> Close match
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};
