import RosterLogo from "@/components/RosterLogo";

export default function NoOrganisationPage() {
	return (
		<div className="w-full h-full flex flex-col items-center justify-center">
			<RosterLogo />
			<h1 className="text-2xl font-bold pt-8">You are not a member of any organisation</h1>
			<p className="text-sm text-gray-500">Please ask your administrator to add you to an organisation</p>
		</div>
	);
}
