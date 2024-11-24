import { AuthError, PersistationError } from "@/types/Errors";
import { clsx, type ClassValue } from "clsx";
import { NextResponse } from "next/server";
import { twMerge } from "tailwind-merge";
import { ZodError } from "zod";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const handleError = (error: unknown) => {
	console.error(error);
	if (error instanceof PersistationError) {
		return new NextResponse(JSON.stringify({ error: error.message }), {
			status: 400,
		});
	}
	if (error instanceof ZodError) {
		return new NextResponse(JSON.stringify({ error: error.message }), {
			status: 400,
		});
	}
	if (error instanceof AuthError) {
		return new NextResponse(JSON.stringify({ error: error.message }), {
			status: 401,
		});
	}
	return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
		status: 500,
	});
};
