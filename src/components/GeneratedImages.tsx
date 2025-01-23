import type { GeneratedImage } from "@/types/GeneratedImage";
import { Button } from "./ui/button";
import ImageViewerDialog from "./ImageViewerDialog";
import { useState } from "react";

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
	return (
		<div className="flex flex-col gap-2">
			<Button variant={"roster"} onClick={() => handleDialogOpen(storyImages[0])}>
				Look on the story image
			</Button>
			<Button variant={"roster"} onClick={() => handleDialogOpen(postImages[0])}>
				Look on the post image
			</Button>
			{dialogContent && (
				<ImageViewerDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} imagesData={dialogContent} />
			)}
		</div>
	);
};
