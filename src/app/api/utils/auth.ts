import { AuthError, AuthErrorType } from "@/types/Errors";
import { auth } from "@clerk/nextjs/server";

export const handleAuth = async () => {
	const { userId } = await auth();
	if (!userId) {
		throw new AuthError(AuthErrorType.Unauthorized, "Unauthorized");
	}
	return userId;
};
