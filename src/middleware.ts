import { clerkClient, clerkMiddleware } from "@clerk/nextjs/server";
import { getRouteMatcher } from "next-route-matcher";
import { NextResponse } from "next/server";
import { routes } from "./app/frontendRoutes";

const getFrontendRoutes = () => {
	return routes.map((route) => route.url);
};

const frontendRoutes = getRouteMatcher(getFrontendRoutes());

export default clerkMiddleware(async (auth, req) => {
	const { userId } = await auth();
	if (userId) {
		const organizations = await (await clerkClient()).users.getOrganizationMembershipList({
			userId: userId,
		});
		if (frontendRoutes(req.nextUrl.pathname) && organizations.totalCount < 1) {
			return NextResponse.redirect(new URL("/no-organisation", req.url));
		}
	}
});

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};
