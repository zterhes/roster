import type { GeneratedImage } from "@/types/GeneratedImage";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useState } from "react";
import Image from "next/image";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { postImage } from "@/lib/apiService";
import { type PostMessageRequest, postMessageRequestSchema } from "@/types/Post";
import { toast } from "@/hooks/use-toast";
import { Separator } from "./ui/separator";

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
	const { register, handleSubmit, reset } = useForm<PostMessageRequest>({
		resolver: zodResolver(postMessageRequestSchema),
	});

	const mutation = useMutation({
		mutationFn: (request: PostMessageRequest) => postImage.fn(request),
		mutationKey: [postImage.key],
		onSuccess: () => {
			toast({
				variant: "default",
				title: "Posting was successful",
				description: "Check your feed for the post here: ",
			});
		},
		onError: () => {
			toast({
				variant: "destructive",
				title: "Error while posting",
				description: "An error occurred while sending the message. Please try again or contact support.",
			});
		},
	});

	const onSubmit = (data: PostMessageRequest) => {
		console.log("data", data);
		mutation.mutate(data);
		handleDialog(false);
	};

	const handleDialog = (status: boolean) => {
		console.log("in handle dialog status: ", status);
		setIsDialogOpen(status);
		reset();
	};

	return (
		<Dialog open={isDialogOpen} onOpenChange={(status) => handleDialog(status)}>
			<DialogContent className="bg-[#0F1C26] border-[#193549] text-white ">
				<DialogHeader>
					<DialogTitle hidden className="text-[#00A3FF]">
						{imagesData.type}
					</DialogTitle>
				</DialogHeader>
				<div>
					<Image src={imagesData.imageUrl} alt="Story Image" width={500} height={500} className="p-4" />
				</div>
				<Separator orientation="horizontal" className="my-4 " />
				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4 max-w-lg">
					<div className="flex items-center space-x-2">
						<label
							htmlFor="terms"
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Accept terms and conditions
						</label>
					</div>
					<Input id="imageId" {...register("imageId")} type="hidden" value={imagesData.id} />
					{imagesData.type === "post_roster_image" && (
						<Input
							id="message"
							{...register("message")}
							className="bg-[#162029] border-[#193549] text-white"
							placeholder="Enter a message"
						/>
					)}

					<Button variant={"roster"} type="submit">
						Submit
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
};
