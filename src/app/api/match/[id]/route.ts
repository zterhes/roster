import { handleError } from "@/lib/utils";

import { type NextRequest, NextResponse } from "next/server";

import { handleAuth } from "../../../../lib/auth";
import { eq } from "drizzle-orm";
import { matchesTable } from "@/db/schema";
import { db, selectMatchByMatchId } from "@/db";
import { PersistationError, PersistationErrorType } from "@/types/Errors";
import { matchSchema, updateMatchRequestSchema } from "@/types/Match";

export const GET = async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
	try {
		const { organizationId } = await handleAuth(true);

		const { id } = await params;
		const response = await selectMatchByMatchId(organizationId as string, id);
		return NextResponse.json(response, { status: 200 });
	} catch (error) {
		return handleError(error);
	}
};

export const POST = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
	try {
		await handleAuth(true);
		const { id } = await params;
		const formData = await req.formData();
		const request = updateMatchRequestSchema.parse({
			homeTeam: formData.get("homeTeam"),
			homeTeamLogo: formData.get("homeTeamLogo"),
			awayTeam: formData.get("awayTeam"),
			awayTeamLogo: formData.get("awayTeamLogo"),
			place: formData.get("place"),
			date: new Date(formData.get("date") as string),
		});
		const result = await db
			.update(matchesTable)
			.set(request)
			.where(eq(matchesTable.id, Number(id)))
			.returning({ id: matchesTable.id });
		PersistationError.handleError(result[0], PersistationErrorType.UpdateError);
		return NextResponse.json({ status: 200 });
	} catch (error) {
		return handleError(error);
	}
};
