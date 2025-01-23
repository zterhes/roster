import { db } from "@/db";
import { generatedImagesPostsTable, generatedImagesTable, postsTable } from "@/db/schema";
import { handleError } from "@/lib/utils";
import {
	facebookPostToFeedRequestSchema,
	facebookPostToFeedResponseSchema,
	facebookPostToStoryRequestSchema,
	postMessageRequestSchema,
	postMessageResponseSchema,
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
import axios, { type AxiosResponse, type AxiosError } from "axios";
import env from "@/env";

interface ErrorResponse {
	message: string;
	code?: number;
}

export const POST = async (req: NextRequest) => {
	try {
		const request = await req.json();
		const parsedRequest = postMessageRequestSchema.parse(request);

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

		let getAccountsResponse: AxiosResponse | null = null;

		try {
			getAccountsResponse = await axios.get(
				`${env.FACEBOOK_BASE_URL}/${env.FACEBOOK_API_VERSION}${env.FACEBOOK_ACCOUNT_URL}?access_token=${env.FACEBOOK_USER_TOKEN}`,
			);
		} catch (error) {
			handleMetaConnectionError(error as AxiosError);
		}

		if (getAccountsResponse === null) {
			throw new ClientServerCallError(
				ClientServerCallErrorType.AxiosError,
				"/api/image/post",
				"Facebook response is null, when getting accounts",
			);
		}

		if (getAccountsResponse.status !== 200) {
			throw new ClientServerCallError(
				ClientServerCallErrorType.AxiosError,
				"/api/image/post",
				"Facebook response not 200, when getting accounts",
			);
		}
		const account = getAccountsResponse.data.data.find(
			(account: { id: string }) => account.id === env.FACEBOOK_PAGE_ID,
		);

		if (!account) {
			throw new ClientServerCallError(
				ClientServerCallErrorType.AxiosError,
				"/api/image/post",
				"Facebook account not found",
			);
		}

		let response = null;
		switch (imageData.type) {
			case "story_roster_image":
				response = await postToFacebookStory(
					imageData.imageUrl,
					account,
					!parsedRequest.isPublishLater,
					parsedRequest.scheduledPublishTime,
				);
				break;
			case "post_roster_image":
				response = await postToFacebookFeed(
					imageData.imageUrl,
					parsedRequest.message,
					account,
					!parsedRequest.isPublishLater,
					parsedRequest.scheduledPublishTime,
				);
				break;
		}

		const postTableResult = await db
			.insert(postsTable)
			.values({
				message: parsedRequest.message,
				socialMediaId: response.id,
				socialMediaType: "facebook",
				matchId: imageData.matchId,
			})
			.returning({
				id: postsTable.id,
				socialMediaId: postsTable.socialMediaId,
				socialMediaType: postsTable.socialMediaType,
				matchId: postsTable.matchId,
			});

		PersistationError.handleError(postTableResult[0], PersistationErrorType.CreateError, "Error while persisting post");

		const junctionResult = await db
			.insert(generatedImagesPostsTable)
			.values({
				generatedImageId: imageData.id,
				postId: postTableResult[0].id,
				matchId: postTableResult[0].matchId,
			})
			.returning({
				id: generatedImagesPostsTable.postId,
			});

		PersistationError.handleError(junctionResult[0], PersistationErrorType.CreateError, "Error while persisting post");

		const parsedResponse = postMessageResponseSchema.parse(postTableResult[0]);

		return NextResponse.json(parsedResponse, { status: 200 });
	} catch (error) {
		return handleError(error);
	}
};

const postToFacebookFeed = async (
	imageUrl: string,
	message: string | undefined,
	account: { access_token: string },
	published: boolean,
	scheduledPublishTime?: Date,
) => {
	const requestBody = facebookPostToFeedRequestSchema.parse({
		url: imageUrl,
		message,
		published,
		scheduled_publish_time: scheduledPublishTime ? Math.floor(scheduledPublishTime.getTime() / 1000) : undefined,
	});

	const postResponse = await axios
		.post(
			`${env.FACEBOOK_BASE_URL}/${env.FACEBOOK_API_VERSION}/${env.FACEBOOK_PAGE_ID}${env.FACEBOOK_POST_URL}`,
			requestBody,
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${account.access_token}`,
				},
			},
		)
		.catch((error: AxiosError) => {
			const errorData = error.response?.data as ErrorResponse;
			throw new ClientServerCallError(ClientServerCallErrorType.AxiosError, "/api/image/post", errorData.message);
		});

	return facebookPostToFeedResponseSchema.parse(postResponse.data);
};

const postToFacebookStory = async (
	imageUrl: string,
	account: { access_token: string },
	published: boolean,
	scheduledPublishTime?: Date,
) => {
	const response = await postToFacebookFeed(imageUrl, "", account, false);
	const requestBody = facebookPostToStoryRequestSchema.parse({
		photo_id: response.id,
		published,
		scheduled_publish_time: scheduledPublishTime ? Math.floor(scheduledPublishTime.getTime() / 1000) : undefined,
	});
	const postResponse = await axios
		.post(
			`${env.FACEBOOK_BASE_URL}/${env.FACEBOOK_API_VERSION}/${env.FACEBOOK_PAGE_ID}${env.FACEBOOK_STORY_URL}`,
			requestBody,
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${account.access_token}`,
				},
			},
		)
		.catch((error: AxiosError) => {
			const errorData = error.response?.data as ErrorResponse;
			throw new ClientServerCallError(ClientServerCallErrorType.AxiosError, "/api/image/post", errorData.message);
		});

	return postResponse.data;
};

const handleMetaConnectionError = (error: AxiosError) => {
	const errorData = error.response?.data as ErrorResponse;
	throw new ClientServerCallError(ClientServerCallErrorType.AxiosError, "/api/image/post", errorData.message);
};
