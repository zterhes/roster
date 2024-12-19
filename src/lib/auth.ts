import { AuthError, AuthErrorType } from "@/types/Errors";
import { auth, clerkClient } from "@clerk/nextjs/server";
import type { UserAuthData } from "@/types/Auth";

export const handleAuth = async (withOrganization?: boolean): Promise<UserAuthData> => {
	const { userId } = await auth();

	if (!userId) {
		throw new AuthError(AuthErrorType.Unauthorized, "Unauthorized");
	}
	const res: UserAuthData = {
		userId: userId,
	};

	if (withOrganization) {
		const organizations = await (await clerkClient()).users.getOrganizationMembershipList({
			userId: userId,
		});
		if (organizations.totalCount === 0) {
			throw new AuthError(AuthErrorType.NoOrganization, "No organization");
		}
		res.organizationId = organizations.data[0].organization.id;
	}
	return res;
};
