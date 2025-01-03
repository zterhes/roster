import type { GeneratedImage } from "@/types/GeneratedImage";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";
import { useState } from "react";
import Image from "next/image";

type Props = {
	triggerImgGen: () => void;
	enabled: boolean;
	imagesData: GeneratedImage[];
};

export default function GeneratedImages({ triggerImgGen, enabled, imagesData }: Props) {
	return (
		<div className=" flex items-center justify-around">
			<h4 className="mb-2 font-semibold text-slate-400">Match Images</h4>
			{enabled ? (
				<p className="text-slate-400">Roster not created</p>
			) : (
				<ImageButtonGroup triggerImgGen={triggerImgGen} imagesData={imagesData} />
			)}
		</div>
	);
}

const ImageButtonGroup = ({
	triggerImgGen,
	imagesData,
}: { triggerImgGen: () => void; imagesData: GeneratedImage[] }) => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [dialogContent, setDialogContent] = useState<GeneratedImage>();

	const handleDialogOpen = (imageData: GeneratedImage) => {
		setDialogContent(imageData);
		setIsDialogOpen(true);
	};
	const storyImages = imagesData.filter((img) => img.type === "story_roster_image");
	const postImages = imagesData.filter((img) => img.type === "post_roster_image");
	if (storyImages[0].status === "not_generated" || postImages[0].status === "not_generated") {
		return (
			<Button variant={"roster"} onClick={() => triggerImgGen()}>
				Generate Images
			</Button>
		);
	}
	if (storyImages[0].status === "generated" && postImages[0].status === "generated") {
		return (
			<>
				<Button variant={"roster"} onClick={() => handleDialogOpen(storyImages[0])}>
					Look on the story image
				</Button>
				<Button variant={"roster"} onClick={() => handleDialogOpen(postImages[0])}>
					Look on the post image
				</Button>
				{dialogContent && (
					<ImageViewerDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} imagesData={dialogContent} />
				)}
			</>
		);
	}
};

const ImageViewerDialog = ({
	imagesData,
	isDialogOpen,
	setIsDialogOpen,
}: {
	imagesData: GeneratedImage;
	isDialogOpen: boolean;
	setIsDialogOpen: (value: boolean) => void;
}) => {
	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogContent className="bg-[#0F1C26] border-[#193549] text-white">
				<Image src={imagesData.imageUrl} alt="Story Image" width={500} height={500} className="max-w-full max-h-full" />
			</DialogContent>
		</Dialog>
	);
};
