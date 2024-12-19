import type { GeneratedImage } from "@/types/GeneratedImage";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";
import { useState } from "react";
import { set } from "date-fns";
import Image from "next/image";

type Props = {
	triggerImgGen: () => void;
	enabled: boolean;
	imagesData: GeneratedImage[];
};

export default function GeneratedImages({ triggerImgGen, enabled, imagesData }: Props) {
	const handleDialogOpen = (player?: Player) => {
		setEditingPlayer(player ? player : undefined);
		setIsDialogOpen(true);
	};
	return (
		<div className=" flex items-center justify-around">
			<h4 className="mb-2 font-semibold text-slate-400">Match Images</h4>
			{enabled ? (
				<p className="text-slate-400">Roster not created</p>
			) : (
				<StoryButton triggerImgGen={triggerImgGen} imagesData={imagesData} />
			)}
		</div>
	);
}

const StoryButton = ({ triggerImgGen, imagesData }: { triggerImgGen: () => void; imagesData: GeneratedImage[] }) => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const storyImages = imagesData.filter((img) => img.type === "story_roster_image");
	if (storyImages[0].status === "generated") {
		return (
			<>
				<Button variant={"roster"} onClick={() => setIsDialogOpen(true)}>
					Look on the story image
				</Button>
				<ImageViewerDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} imagesData={imagesData} />
			</>
		);
	}
	return (
		<Button variant={"roster"} onClick={() => triggerImgGen()}>
			Story Generate Image
		</Button>
	);
};

const ImageViewerDialog = ({
	imagesData,
	isDialogOpen,
	setIsDialogOpen,
}: { imagesData: GeneratedImage[]; isDialogOpen: boolean; setIsDialogOpen: (value: boolean) => void }) => {
	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogContent className="bg-[#0F1C26] border-[#193549] text-white">
				<Image
					src={imagesData[0].imageUrl}
					alt="Story Image"
					width={500}
					height={500}
					className="max-w-full max-h-full"
				/>
			</DialogContent>
		</Dialog>
	);
};
