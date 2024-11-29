import { handleError } from "@/lib/utils";

import { NextResponse } from "next/server";

import { handleAuth } from "../../utils/auth";
import { eq, and } from "drizzle-orm";
import { matchesTable } from "@/db/schema";
import { db } from "@/db";
import { PersistationError, PersistationErrorType } from "@/types/Errors";
import { matchSchema } from "@/types/Match";

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
