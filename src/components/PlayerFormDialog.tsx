import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
	createPlayerRequestSchema,
	type UpdatePlayerRequest,
	updatePlayerRequestSchema,
	type Player,
} from "@/types/Player";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { Button } from "./ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPlayer, updatePlayer } from "../app/utils/apiService";

type FormProps = {
	isDialogOpen: boolean;
	setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
	player?: Player;
};

const playerSchema = z.object({
	firstName: z.string(),
	lastName: z.string(),
	file: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof playerSchema>;

const PlayerFormDialog: React.FC<FormProps> = ({ isDialogOpen, setIsDialogOpen, player }) => {
	const isEditing = !!player;
	const { register, handleSubmit, control } = useForm<FormValues>({
		defaultValues: player
			? {
					firstName: player.firstName,
					lastName: player.lastName,
					file: undefined,
				}
			: undefined,
		resolver: zodResolver(playerSchema),
	});

	const [imagePreview, setImagePreview] = useState<string | undefined>(player?.photoUrl);

	const queryClient = useQueryClient();
	const createMutation = useMutation({
		mutationFn: (data: FormValues) => {
			const request = createPlayerRequestSchema.parse({
				firstName: data.firstName,
				lastName: data.lastName,
				file: data.file,
			});
			return createPlayer.fn(request);
		},
		mutationKey: ["createPlayer"],
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["fetchPlayers"] });
			setIsDialogOpen(false);
		},
		onError: (error) => {
			console.error("error", error);
			alert("Error creating player");
		},
	});

	const updateMutation = useMutation({
		mutationFn: (data: FormValues) => {
			if (!player) throw new Error("Player not found");
			const request: UpdatePlayerRequest = updatePlayerRequestSchema.parse({
				id: player.id,
				firstName: data.firstName,
				lastName: data.lastName,
				file: data.file,
			});

			return updatePlayer.fn(request);
		},
		mutationKey: ["updatePlayer"],
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["fetchPlayers"] });
			setIsDialogOpen(false);
		},
		onError: () => {
			alert("Error updating player");
		},
	});

	const onSubmit = (data: FormValues) => {
		if (isEditing) updateMutation.mutate(data);
		else createMutation.mutate(data);
	};

	const handleFileChange = (file: File | null) => {
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogContent className="bg-[#0F1C26] border-[#193549] text-white">
				<DialogHeader>
					<DialogTitle className="text-[#00A3FF]">{isEditing ? "Edit Player" : "Add New Player"}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Controller
							name="file"
							control={control}
							render={({ field }) => (
								<div className="flex flex-col items-center">
									<Image
										width={100}
										height={100}
										//TODO change this to blobs default!
										src={imagePreview || "/placeholder-image.png"}
										alt="Player"
										className="rounded-full object-cover cursor-pointer"
										onClick={() => document.getElementById("photo")?.click()}
									/>
									<input
										id="photo"
										type="file"
										accept="image/*"
										style={{ display: "none" }}
										onChange={(e) => {
											const file = e.target.files?.[0] ?? null;
											field.onChange(file);
											handleFileChange(file);
										}}
									/>
								</div>
							)}
						/>
					</div>
					{updateMutation.isError}
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
					<Button
						type="submit"
						className={
							updateMutation.isError ? "w-full bg-red-500" : "w-full bg-[#00A3FF] hover:bg-[#0077CC] text-white"
						}
					>
						{updateMutation.isError ? "Something went wrong! Try again, or contact developers" : "Save Profile"}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default PlayerFormDialog;
