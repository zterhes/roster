import { handleError } from "@/lib/utils";

import { type NextRequest, NextResponse } from "next/server";

import { handleAuth } from "../../utils/auth";
import { eq, and } from "drizzle-orm";
import { matchesTable } from "@/db/schema";
import { db } from "@/db";
import { PersistationError, PersistationErrorType } from "@/types/Errors";
import { matchSchema, updateMatchRequestSchema } from "@/types/Match";

export const GET = async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
	try {
		const { organizationId } = await handleAuth(true);

		const { id } = await params;
		const match = await db
			.select()
			.from(matchesTable)
			.where(and(eq(matchesTable.id, Number(id)), eq(matchesTable.organizationId, organizationId as string)));
		PersistationError.handleError(match[0], PersistationErrorType.NotFound);
		const response = matchSchema.parse({
			id: match[0].id,
			homeTeam: { name: match[0].homeTeam, logoUrl: match[0].homeTeamLogoUrl },
			awayTeam: { name: match[0].awayTeam, logoUrl: match[0].awayTeamLogoUrl },
			place: match[0].place,
			date: match[0].date,
		});
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
