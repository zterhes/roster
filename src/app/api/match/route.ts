import { handleError } from "@/lib/utils";
import { handleAuth } from "../../../lib/auth";
import { type NextRequest, NextResponse } from "next/server";
import { createMatchRequestSchema, matchSchema } from "@/types/Match";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { generatedImagesTable, matchesTable } from "@/db/schema";
import { PersistationError, PersistationErrorType } from "@/types/Errors";
import { uploadToBlob } from "../../../lib/blob";

export const GET = async () => {
	try {
		const { organizationId } = await handleAuth(true);
		const matches = await db
			.select()
			.from(matchesTable)
			.where(eq(matchesTable.organizationId, organizationId as string));
		PersistationError.handleError(matches[0], PersistationErrorType.NotFound, "No matches found");
		const response = matches.map((match) =>
			matchSchema.parse({
				id: match.id,
				homeTeam: { name: match.homeTeam, logoUrl: match.homeTeamLogoUrl },
				awayTeam: { name: match.awayTeam, logoUrl: match.awayTeamLogoUrl },
				place: match.place,
				date: match.date,
				rosterStatus: match.rosterStatus,
			}),
		);
		return NextResponse.json(response, { status: 200 });
	} catch (error) {
		return handleError(error);
	}
};

export const POST = async (req: NextRequest) => {
	try {
		const { organizationId } = await handleAuth(true);
		const formData = await req.formData();
		const request = createMatchRequestSchema.parse({
			homeTeam: formData.get("homeTeam"),
			homeTeamLogo: formData.get("homeTeamLogo"),
			awayTeam: formData.get("awayTeam"),
			awayTeamLogo: formData.get("awayTeamLogo"),
			place: formData.get("place"),
			date: new Date(formData.get("date") as string),
		});
		let homeTeamLogoUrl: string | undefined = undefined;
		let awayTeamLogoUrl: string | undefined = undefined;
		if (request.homeTeamLogo !== null) {
			homeTeamLogoUrl = await uploadToBlob({
				fileName: "homeTeamLogo",
				file: request.homeTeamLogo,
			});
		}
		if (request.awayTeamLogo !== null) {
			awayTeamLogoUrl = await uploadToBlob({
				fileName: "awayTeamLogo",
				file: request.awayTeamLogo,
			});
		}

		const createdMatch = await db
			.insert(matchesTable)
			.values({
				// @ts-expect-error: Field name mismatch between camelCase and snake_case mapping
				homeTeam: request.homeTeam,
				homeTeamLogoUrl: homeTeamLogoUrl,
				awayTeam: request.awayTeam,
				awayTeamLogoUrl: awayTeamLogoUrl,
				place: request.place,
				date: request.date,
				organizationId: organizationId,
			})
			.returning({ id: matchesTable.id });
		PersistationError.handleError(createdMatch[0], PersistationErrorType.CreateError, "Error creating match");

		const createdImage = await db
			.insert(generatedImagesTable)
			.values([
				{
					matchId: createdMatch[0].id,
					type: "story_roster_image",
					status: "not_generated",
				},
				{
					matchId: createdMatch[0].id,
					type: "post_roster_image",
					status: "not_generated",
				},
			])
			.returning({ id: generatedImagesTable.id });
		PersistationError.handleError(createdImage[0], PersistationErrorType.CreateError, "Error creating images");

		const response = createdMatch[0];
		return NextResponse.json({ ...response }, { status: 200 });
	} catch (error) {
		return handleError(error);
	}
};
