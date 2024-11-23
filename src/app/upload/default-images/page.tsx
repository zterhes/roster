"use client";

import * as React from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fileSchema, imageSchema } from "@/types/File";

interface ImageUploadProps {
	file: File | null;
	preview: string;
	isValid: boolean;
}

const validImageSizes = {
	feed: { width: 1200, height: 630 },
	story: { width: 1080, height: 1920 },
};

enum ImageType {
	Feed = "feed",
	Story = "story",
	Player = "player",
}

export default function DefaultImagesPage() {
	const { toast } = useToast();
	const [feedImage, setFeedImage] = React.useState<ImageUploadProps>({
		file: null,
		preview: "",
		isValid: false,
	});
	const [storyImage, setStoryImage] = React.useState<ImageUploadProps>({
		file: null,
		preview: "",
		isValid: false,
	});
	const [playerImage, setPlayerImage] = React.useState<ImageUploadProps>({
		file: null,
		preview: "",
		isValid: false,
	});

	const getAspectStyle = (width: number, height: number) => ({
		aspectRatio: `${width}/${height}`,
	});

	const getConstraints = (type: ImageType) => {
		return {
			minWidth: validImageSizes[type as keyof typeof validImageSizes].width,
			minHeight: validImageSizes[type as keyof typeof validImageSizes].height,
		};
	};

	const validateImage = async (file: File, type: ImageType): Promise<boolean> => {
		try {
			if (type === ImageType.Player) {
				fileSchema.parse(file);
				return true;
			}

			const img = await createImageFromFile(file);
			imageSchema.parse({
				file,
				dimensions: {
					width: img.width,
					height: img.height,
				},
				constraints: getConstraints(type),
			});
			return true;
		} catch (error) {
			console.error("error", error);
			return false;
		}
	};

	const createImageFromFile = (file: File): Promise<HTMLImageElement> => {
		return new Promise((resolve) => {
			const img = new Image();
			img.src = URL.createObjectURL(file);
			img.onload = () => {
				URL.revokeObjectURL(img.src);
				resolve(img);
			};
		});
	};

	const handleImageUpload = async (file: File, type: ImageType) => {
		const isValid = await validateImage(file, type);
		const preview = URL.createObjectURL(file);
		if (!isValid) {
			toast({
				variant: "destructive",
				title: "Invalid image",
				description: "Please ensure the image meets the required dimensions and is under 4.5MB",
			});
			return;
		}

		switch (type) {
			case ImageType.Feed:
				setFeedImage({ file, preview, isValid });
				break;
			case ImageType.Story:
				setStoryImage({ file, preview, isValid });
				break;
			case ImageType.Player:
				setPlayerImage({ file, preview, isValid });
				break;
		}
	};

	const handleUploadAllImages = () => {
		console.log("uploading all images");
	};

	return (
		<div className="min-h-screen  p-6">
			<div className="mx-auto max-w-4xl space-y-6">
				<div className="flex items-center justify-between">
					<h1 className="text-3xl font-bold text-white">Default Images</h1>
					<Button className="bg-[#00A3FF] hover:bg-[#00A3FF]/90" onClick={handleUploadAllImages}>
						<Upload className="mr-2 h-4 w-4" />
						Upload All Images
					</Button>
				</div>

				<div className="grid gap-6 md:grid-cols-3">
					<Card className="bg-[#0F1923] text-white">
						<CardHeader>
							<CardTitle className="text-[#00A3FF]">Feed Image</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div
									className="overflow-hidden rounded-lg border-2 border-dashed border-gray-600"
									style={getAspectStyle(validImageSizes.feed.width, validImageSizes.feed.height)}
								>
									{feedImage.preview ? (
										<img src={feedImage.preview} alt="Feed preview" className="h-full w-full object-cover" />
									) : (
										<div className="flex h-full items-center justify-center">
											<p className="text-sm text-gray-400">
												{validImageSizes.feed.width} x {validImageSizes.feed.height}
											</p>
										</div>
									)}
								</div>
								<div className="space-y-2">
									<Label htmlFor="feed-image">Upload feed image</Label>
									<Input
										id="feed-image"
										type="file"
										accept="image/*"
										className="bg-[#1A2730] text-white"
										onChange={(e) => {
											const file = e.target.files?.[0];
											if (file) {
												handleImageUpload(file, ImageType.Feed);
											}
										}}
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-[#0F1923] text-white">
						<CardHeader>
							<CardTitle className="text-[#00A3FF]">Story Image</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div
									className="overflow-hidden rounded-lg border-2 border-dashed border-gray-600"
									style={getAspectStyle(validImageSizes.story.width, validImageSizes.story.height)}
								>
									{storyImage.preview ? (
										<img src={storyImage.preview} alt="Story preview" className="h-full w-full object-cover" />
									) : (
										<div className="flex h-full items-center justify-center">
											<p className="text-sm text-gray-400">
												{validImageSizes.story.width} x {validImageSizes.story.height}
											</p>
										</div>
									)}
								</div>
								<div className="space-y-2">
									<Label htmlFor="story-image">Upload story image</Label>
									<Input
										id="story-image"
										type="file"
										accept="image/*"
										className="bg-[#1A2730] text-white"
										onChange={(e) => {
											const file = e.target.files?.[0];
											if (file) {
												handleImageUpload(file, ImageType.Story);
											}
										}}
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-[#0F1923] text-white">
						<CardHeader>
							<CardTitle className="text-[#00A3FF]">Player Image</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="aspect-square overflow-hidden rounded-lg border-2 border-dashed border-gray-600">
									{playerImage.preview ? (
										<img src={playerImage.preview} alt="Player preview" className="h-full w-full object-cover" />
									) : (
										<div className="flex h-full items-center justify-center">
											<p className="text-sm text-gray-400">Upload player image</p>
										</div>
									)}
								</div>
								<div className="space-y-2">
									<Label htmlFor="player-image">Upload player image</Label>
									<Input
										id="player-image"
										type="file"
										accept="image/*"
										className="bg-[#1A2730] text-white"
										onChange={(e) => {
											const file = e.target.files?.[0];
											if (file) {
												handleImageUpload(file, ImageType.Player);
											}
										}}
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
