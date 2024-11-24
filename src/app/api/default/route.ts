import { handleError } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";
import { handleAuth } from "../utils/auth";
import { defaultImagesResponseSchema, updateDefaultImagesRequestSchema } from "@/types/DefaultRoute";
import { getDefaultImages, updateDefaultImages } from "@/db";
import { deleteFromBlob, uploadToBlob } from "../utils/blob";

export const GET = async () => {
	try {
		const { organizationId } = await handleAuth(true);
		const defaultImages = await getDefaultImages(organizationId as string);
		const response = defaultImagesResponseSchema.parse({
			post: defaultImages[0]?.postUrl,
			story: defaultImages[0]?.storyUrl,
			player: defaultImages[0]?.playerUrl,
		});
		return NextResponse.json({ post: response.post, story: response.story, player: response.player }, { status: 200 });
	} catch (error) {
		return handleError(error);
	}
};

export const POST = async (req: NextRequest) => {
	try {
		const { organizationId } = await handleAuth(true);

		const formData = await req.formData();
		const request = updateDefaultImagesRequestSchema.parse({
			post: formData.get("post"),
			story: formData.get("story"),
			player: formData.get("player"),
		});

		let postUrl: string | undefined = undefined;
		let storyUrl: string | undefined = undefined;
		let playerUrl: string | undefined = undefined;

		const defaultImages = await getDefaultImages(organizationId as string);
		console.log("defaultImages", defaultImages);

		if (request.post) {
			if (defaultImages[0]?.postUrl) await deleteFromBlob(defaultImages[0]?.postUrl);
			postUrl = await uploadToBlob({
				fileName: "post",
				file: request.post,
			});
		}
		if (request.story) {
			if (defaultImages[0]?.storyUrl) await deleteFromBlob(defaultImages[0]?.storyUrl);
			storyUrl = await uploadToBlob({
				fileName: "story",
				file: request.story,
			});
		}
		if (request.player) {
			if (defaultImages[0]?.playerUrl) await deleteFromBlob(defaultImages[0]?.playerUrl);
			playerUrl = await uploadToBlob({
				fileName: "player",
				file: request.player,
			});
		}

		await updateDefaultImages(organizationId as string, postUrl, storyUrl, playerUrl);
		return NextResponse.json({ status: 200 });
	} catch (error) {
		return handleError(error);
	}
};
