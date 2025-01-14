import { db } from "@/db";
import { generatedImagesTable } from "@/db/schema";
import { handleError } from "@/lib/utils";
import {
	facebookPostToFeedRequestSchema,
	facebookPostToFeedResponseSchema,
	facebookPostToStoryRequestSchema,
	postMessageSchema,
} from "@/types/Post";
import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import {
	ClientServerCallError,
	ClientServerCallErrorType,
	GeneratorError,
	GeneratorErrorType,
	PersistationError,
	PersistationErrorType,
} from "@/types/Errors";
import axios from "axios";

//to-do: this should come from env
const config = {
	facebook: {
		baseUrl: "https://graph.facebook.com",
		api_version: "v21.0",
		accountUrl: "/me/accounts",
		pageId: "562505300269600",
		postUrl: "/photos",
		storyUrl: "/photo_stories",
		userToken:
			"EAAI2Nu6pP8oBOygiYY2HZA4II6a8fYh7WEvfkAjGDhRPKi2C5fuHGNZB2ZAgQNmFZBql8BcgI9dPGEvnXF2Dd0EoX9jpFMIVcjTXBciUZBzPZC7CFaZBSMqFwvQp6LyHL2jbE5JSb36rYQ5ZBRZBPq2aWj2Jov7yWZBvtWvgCWVUbgQqwaBi2ZBP7wHkIJXZBhGi3bEq",
	},
};

export const POST = async (req: NextRequest) => {
	try {
		const request = await req.json();
		const parsedRequest = postMessageSchema.parse(request);
		console.log("parsedRequest", parsedRequest);

		const getImageResult = await db
			.select()
			.from(generatedImagesTable)
			.where(eq(generatedImagesTable.id, Number(parsedRequest.imageId)));
		PersistationError.handleError(
			getImageResult[0],
			PersistationErrorType.NotFound,
			`No image data found for this id: ${parsedRequest.imageId}`,
		);
		const imageData = getImageResult[0];

		if (imageData.status !== "generated") {
			throw new GeneratorError(GeneratorErrorType.NotGenerated, "Image is not generated yet");
		}

		if (!imageData.imageUrl) {
			throw new PersistationError(
				PersistationErrorType.NotFound,
				`Status is generated but No image url found for this id: ${parsedRequest.imageId}`,
			);
		}

		console.log("imageData.imageUrl", imageData.imageUrl);

		const getAccountsResponse = await axios.get(
			`${config.facebook.baseUrl}/${config.facebook.api_version}${config.facebook.accountUrl}?access_token=${config.facebook.userToken}`,
		);

		if (getAccountsResponse.status !== 200) {
			throw new ClientServerCallError(
				ClientServerCallErrorType.AxiosError,
				"/api/image/post",
				"Facebook response not 200, when getting accounts",
			);
		}

		const account = getAccountsResponse.data.data.find(
			(account: { id: string }) => account.id === config.facebook.pageId,
		);

		if (!account) {
			throw new ClientServerCallError(
				ClientServerCallErrorType.AxiosError,
				"/api/image/post",
				"Facebook account not found",
			);
		}
		let response;
		switch (imageData.type) {
			case "story_roster_image":
				console.log("from story_roster_image");
				response = await postToFacebookStory(imageData.imageUrl, account);
				break;
			case "post_roster_image":
				console.log("from post_roster_image");
				response = await postToFacebookFeed(imageData.imageUrl, parsedRequest.message, account, true); // to-do: published check by frontend
				break;
		}
		console.log("response", response);

		return NextResponse.json(request, { status: 200 });
	} catch (error) {
		return handleError(error);
	}
};

const postToFacebookFeed = async (
	imageUrl: string,
	message: string,
	account: { access_token: string },
	published: boolean,
) => {
	const requestBody = facebookPostToFeedRequestSchema.parse({
		url: imageUrl,
		message,
		published,
	});

	const postResponse = await axios.post(
		`${config.facebook.baseUrl}/${config.facebook.api_version}/${config.facebook.pageId}${config.facebook.postUrl}`,
		requestBody,
		{
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${account.access_token}`,
			},
		},
	);

	if (postResponse.status !== 200) {
		throw new ClientServerCallError(
			ClientServerCallErrorType.AxiosError,
			"/api/image/post",
			"Facebook response not 200, when posting image to feed",
		);
	}
	return facebookPostToFeedResponseSchema.parse(postResponse.data);
};

const postToFacebookStory = async (imageUrl: string, account: { access_token: string }) => {
	const response = await postToFacebookFeed(imageUrl, "", account, false);
	console.log("response", response);
	const requestBody = facebookPostToStoryRequestSchema.parse({
		photo_id: response.id,
		published: true,
	});
	const postResponse = await axios.post(
		`${config.facebook.baseUrl}/${config.facebook.api_version}/${config.facebook.pageId}${config.facebook.storyUrl}`,
		requestBody,
		{
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${account.access_token}`,
			},
		},
	);

	if (postResponse.status !== 200) {
		throw new ClientServerCallError(
			ClientServerCallErrorType.AxiosError,
			"/api/image/post",
			"Facebook response not 200, when posting story image",
		);
	}
	return postResponse.data;
};
