import { handleError } from "@/lib/utils";
import { useOrganization } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async () => {
	return NextResponse.json({ message: "Hello, World!" }, { status: 200 });
};

export const POST = async (req: NextRequest) => {
	try {
		const formData = await req.formData();
		console.log(formData);
		return NextResponse.json({ message: "Hello, World!" }, { status: 200 });
	} catch (error) {
		return handleError(error);
	}
};
