import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import type { Player } from "@/types/Player";
import { useState } from "react";
import { Upload } from "lucide-react";

type Props = {
	isDialogOpen: boolean;
	setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
	player: Player | null;
};

const EditPlayerDialog: React.FC<Props> = ({
	isDialogOpen,
	setIsDialogOpen,
	player,
}) => {
	const [editingPlayer, setEditingPlayer] = useState(
		player ? player : { firstName: "", lastName: "", photoUrl: "" },
	);

	console.log("editingPlayer", editingPlayer);
	console.log("player", player);

	const handle = (player: Player) => {
		console.log("changed player", player);
		setIsDialogOpen(false);
	};

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogContent className="bg-[#0F1C26] border-[#193549] text-white">
				<DialogHeader>
					<DialogTitle className="text-[#00A3FF]">
						{player ? "Edit Player" : "Add New Player"}
					</DialogTitle>
				</DialogHeader>
				{editingPlayer && (
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handle(editingPlayer);
						}}
						className="space-y-4"
					>
						<div className="space-y-2">
							<Label htmlFor="firstName" className="text-gray-300">
								First Name
							</Label>
							<Input
								id="firstName"
								value={editingPlayer.firstName}
								onChange={(e) =>
									setEditingPlayer({
										...editingPlayer,
										firstName: e.target.value,
									})
								}
								className="bg-[#162029] border-[#193549] text-white"
								placeholder="Enter first name"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="lastName" className="text-gray-300">
								Last Name
							</Label>
							<Input
								id="lastName"
								value={editingPlayer.lastName}
								onChange={(e) =>
									setEditingPlayer({
										...editingPlayer,
										lastName: e.target.value,
									})
								}
								className="bg-[#162029] border-[#193549] text-white"
								placeholder="Enter last name"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="photo" className="text-gray-300">
								Upload Photo
							</Label>
							<div className="flex items-center space-x-2">
								<Input
									id="photo"
									type="file"
									onChange={(e) => {
										if (e.target.files?.[0]) {
											setEditingPlayer({
												...editingPlayer,
												photoUrl: URL.createObjectURL(e.target.files[0]),
											});
										}
									}}
									className="hidden"
									accept="image/*"
								/>
								<Button
									type="button"
									onClick={() => document.getElementById("photo")?.click()}
									className="bg-[#162029] border-[#193549] hover:bg-[#1F2937] text-white"
								>
									<Upload className="w-4 h-4 mr-2" />
									Choose File
								</Button>
								<span className="text-sm text-gray-400">
									{editingPlayer.photoUrl.startsWith("blob:")
										? "New photo selected"
										: "No file chosen"}
								</span>
							</div>
						</div>
						<Button
							type="submit"
							className="w-full bg-[#00A3FF] hover:bg-[#0077CC] text-white"
						>
							Save Profile
						</Button>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default EditPlayerDialog;
