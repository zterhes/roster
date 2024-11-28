import { handleError } from "@/lib/utils";
import { handleAuth } from "../utils/auth";
import { type NextRequest, NextResponse } from "next/server";
import { createMatchRequestSchema } from "@/types/Match";
import { db } from "@/db";

import { matchesTable } from "@/db/schema";
import { PersistationError, PersistationErrorType } from "@/types/Errors";
import { uploadToBlob } from "../utils/blob";

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
				homeTeam: request.homeTeam,
				homeTeamLogoUrl: homeTeamLogoUrl,
				awayTeam: request.awayTeam,
				awayTeamLogoUrl: awayTeamLogoUrl,
				place: request.place,
				date: request.date,
				organizationId: organizationId,
			})
			.returning({ id: matchesTable.id });
		PersistationError.handleError(createdMatch[0], PersistationErrorType.CreateError);
		return NextResponse.json({ createdMatch }, { status: 200 });
	} catch (error) {
		return handleError(error);
	}
};
