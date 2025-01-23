import { db } from "@/db";
import { generatedImagesPostsTable, postsTable } from "@/db/schema";
import { handleError } from "@/lib/utils";
import { getPostByImageIdResponseSchema, postMessageResponseSchema } from "@/types/Post";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
	try {
		const { id } = await params;
		const result = await db
			.select({ posts: postsTable })
			.from(generatedImagesPostsTable)
			.rightJoin(postsTable, eq(generatedImagesPostsTable.postId, postsTable.id))
			.where(eq(generatedImagesPostsTable.generatedImageId, Number(id)));

		if (result.length === 0) {
			return NextResponse.json(getPostByImageIdResponseSchema.parse({ posted: false }), { status: 200 });
		}

		const response = getPostByImageIdResponseSchema.parse({
			posted: true,
			posts: result.map((post) => postMessageResponseSchema.parse(post.posts)),
		});
		return NextResponse.json(response, { status: 200 });
	} catch (error) {
		return handleError(error);
	}
};
