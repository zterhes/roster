import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import type { Player } from "@/types/Player";
import { Upload } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";

type FormProps = {
	isDialogOpen: boolean;
	setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
	player?: Player;
};

const playerSchema = z.object({
	firstName: z.string(),
	lastName: z.string(),
	file: z.string(),
});

type FormValues = z.infer<typeof playerSchema>;

const PlayerFormDialog: React.FC<FormProps> = ({
	isDialogOpen,
	setIsDialogOpen,
	player,
}) => {
	const { register, handleSubmit, } = useForm<FormValues>({
		defaultValues: player
			? {
					firstName: player.firstName,
					lastName: player.lastName,
					file: player.photoUrl,
				}
			: undefined,
	});

	const onSubmit = (data: FormValues) => {
		console.log(data);
	};

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogContent className="bg-[#0F1C26] border-[#193549] text-white">
				<DialogHeader>
					<DialogTitle className="text-[#00A3FF]">
						{player ? "Edit Player" : "Add New Player"}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="firstName" className="text-gray-300">
							First Name
						</Label>
						<Input
							id="firstName"
							{...register("firstName")}
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
							{...register("lastName")}
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
								{...register("file")}
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
								{player?.photoUrl
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
			</DialogContent>
		</Dialog>
	);
};

export default PlayerFormDialog;
