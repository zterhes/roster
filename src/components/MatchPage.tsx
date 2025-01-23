"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MapPinIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, useForm } from "react-hook-form";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
	createMatchFormSchema,
	type CreateMatchFormValues,
	type CreateMatchRequestValues,
	type UpdateMatchRequestValues,
	rosterEnum,
} from "@/types/Match";
import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchMatchById, createMatch, updateMatch, generateMatchImages, getMatchImages } from "@/lib/apiService";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import GeneratedImages from "./GeneratedImages";

type Props = {
	id?: string;
};

export default function MatchPage({ id }: Props) {
	const isEditing = !!id;

	const [homeTeamLogoPreview, setHomeTeamLogoPreview] = useState<string | null>(null);
	const [awayTeamLogoPreview, setAwayTeamLogoPreview] = useState<string | null>(null);
	const [homeScore, setHomeScore] = useState<number>(0);
	const [awayScore, setAwayScore] = useState<number>(0);

	const { data: match } = useQuery({
		queryKey: ["fetchMatchById", id as string],
		queryFn: () => fetchMatchById.fn(id as string),
		enabled: isEditing,
	});

	const { refetch: triggerImgGen } = useQuery({
		queryKey: [generateMatchImages.key, id as string],
		queryFn: () => generateMatchImages.fn(Number.parseInt(id as string) as number),
		enabled: false,
	});

	const { mutate: createMatchMutation } = useMutation({
		mutationKey: ["createMatch"],
		mutationFn: (request: CreateMatchRequestValues) => createMatch.fn(request),
		onSuccess: () => {
			toast({
				variant: "default",
				title: "Match created successfully",
			});
		},
		onError: () => {
			toast({
				variant: "destructive",
				title: "Error creating match",
				description: "Please try again later",
			});
		},
	});

	const { mutate: updateMatchMutation } = useMutation({
		mutationKey: ["updateMatch"],
		mutationFn: (request: UpdateMatchRequestValues) => updateMatch.fn(request, Number(id)),
	});

	const { data: images } = useQuery({
		queryKey: [getMatchImages.key, id as string],
		queryFn: () => getMatchImages.fn(Number(id)),
	});

	const {
		control,
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CreateMatchFormValues>({
		defaultValues: {
			homeTeam: "",
			homeTeamLogo: undefined,
			awayTeam: "",
			awayTeamLogo: undefined,
			place: "",
			date: undefined,
		},
		resolver: zodResolver(createMatchFormSchema),
	});

	useEffect(() => {
		if (match) {
			reset({
				homeTeam: match.homeTeam.name,
				awayTeam: match.awayTeam.name,
				place: match.place,
				date: new Date(match.date),
			});
			setHomeTeamLogoPreview(match.homeTeam.logoUrl);
			setAwayTeamLogoPreview(match.awayTeam.logoUrl);
		}
	}, [match, reset]);

	/* eslint-disable */
	const handleFileChange = (file: File | null, type: "homeTeam" | "awayTeam") => {
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				type === "homeTeam"
					? setHomeTeamLogoPreview(reader.result as string)
					: setAwayTeamLogoPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};
	/* eslint-enable  */

	const onSubmit = (data: CreateMatchFormValues) => {
		if (isEditing) {
			updateMatchMutation(data);
		} else {
			createMatchMutation(data);
		}
	};

	return (
		<div className="min-h-screen max-w-4xl mx-auto text-slate-50 p-6">
			<h1 className="text-2xl font-bold mb-6">{isEditing ? "Edit Match" : "Create Match"}</h1>
			<Card className="bg-[#0F1C26] border-[#193549] mb-8">
				<CardHeader>
					<CardTitle className="text-[#00A3FF]">Match Basic Data</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
							<div className="max-md:border-b-2  border-[#00A3FF] pb-4">
								<Label htmlFor="homeTeam" className="text-gray-300">
									Home Team
								</Label>
								<Input
									id="homeTeam"
									{...register("homeTeam")}
									placeholder="Enter home team name"
									className="bg-[#162029] border-[#193549] text-white"
								/>
								{errors.homeTeam && <p className="text-red-500 mt-2">{errors.homeTeam.message}</p>}
								<Controller
									control={control}
									name="homeTeamLogo"
									render={({ field }) => (
										<div className="flex items-center gap-2 mt-4 justify-center">
											{homeTeamLogoPreview ? (
												<Image
													src={homeTeamLogoPreview}
													alt="HomeTeam logo"
													width={60}
													height={60}
													className="rounded-full object-cover cursor-pointer"
													onClick={() => document.getElementById("homeTeamLogo")?.click()}
												/>
											) : (
												<Button
													className="w-[60px] h-[60px] bg-[#00A3FF] hover:bg-[#0077CC] text-white mt-4 rounded-full"
													onClick={() => document.getElementById("homeTeamLogo")?.click()}
												>
													Add Logo
												</Button>
											)}
											<Input
												id="homeTeamLogo"
												type="file"
												accept="image/*"
												style={{ display: "none" }}
												onChange={(e) => {
													const file = e.target.files?.[0] ?? null;
													field.onChange(file);
													handleFileChange(file, "homeTeam");
												}}
											/>
											{errors.homeTeamLogo && <p className="text-red-500 mt-2">{errors.homeTeamLogo.message}</p>}
										</div>
									)}
								/>
							</div>

							<div className="max-md:border-b-2 border-[#00A3FF] pb-4">
								<Label htmlFor="awayTeam" className="text-gray-300">
									Away Team
								</Label>
								<Input
									id="awayTeam"
									{...register("awayTeam")}
									placeholder="Enter away team name"
									className="bg-[#162029] border-[#193549] text-white"
								/>
								{errors.awayTeam && <p className="text-red-500 mt-2">{errors.awayTeam.message}</p>}
								<Controller
									control={control}
									name="awayTeamLogo"
									render={({ field }) => (
										<div className="flex items-center gap-2 mt-4 justify-center">
											{awayTeamLogoPreview ? (
												<Image
													src={awayTeamLogoPreview}
													alt="AwayTeam logo"
													width={50}
													height={50}
													className="rounded-full object-cover cursor-pointer"
													onClick={() => document.getElementById("awayTeamLogo")?.click()}
												/>
											) : (
												<Button
													className="w-[60px] h-[60px] bg-[#00A3FF] hover:bg-[#0077CC] text-white mt-4 rounded-full"
													onClick={() => document.getElementById("awayTeamLogo")?.click()}
												>
													Add Logo
												</Button>
											)}
											<Input
												id="awayTeamLogo"
												type="file"
												accept="image/*"
												style={{ display: "none" }}
												onChange={(e) => {
													const file = e.target.files?.[0] ?? null;
													field.onChange(file);
													handleFileChange(file, "awayTeam");
												}}
											/>
											{errors.awayTeamLogo && <p className="text-red-500 mt-2">{errors.awayTeamLogo.message}</p>}
										</div>
									)}
								/>
							</div>
							<div>
								<Label htmlFor="place" className="text-slate-400">
									Place
								</Label>
								<div className="flex items-center gap-2 mt-1">
									<MapPinIcon className="h-4 w-4 text-slate-400" />
									<Input
										id="place"
										{...register("place")}
										placeholder="Enter match location"
										className="bg-[#162029] border-[#193549] text-white"
									/>
									{errors.place && <p className="text-red-500 mt-2">{errors.place.message}</p>}
								</div>
							</div>
							<div>
								<Label htmlFor="date" className="text-slate-400">
									Date
								</Label>
								<Controller
									control={control}
									name="date"
									render={({ field }) => (
										<DateTimePicker
											value={field.value}
											onChange={field.onChange}
											className="bg-[#162029] border-[#193549] text-white"
										/>
									)}
								/>
							</div>
						</div>
						<div className="flex justify-center">
							<Button type="submit" variant={"roster"} className="w-1/2 mt-4">
								{isEditing ? "Save changes" : "Create Match"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			<Card className="bg-[#0F1C26] border-[#193549] mb-8">
				<CardHeader>
					<CardTitle className="text-[#00A3FF]">
						Score
						<p className="text-sm text-slate-400">later Highlights, the Highlights app not implemented yet</p>
					</CardTitle>
				</CardHeader>
				<CardContent className="flex gap-2 justify-around">
					<div className="grid gap-2">
						<Label htmlFor="homeScore" className="text-slate-400">
							Home
						</Label>
						<Input
							id="homeScore"
							value={homeScore}
							onChange={(e) => setHomeScore(Number(e.target.value))}
							className="bg-[#162029] border-[#193549] text-white w-[80px]"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="awayScore" className="text-slate-400">
							Away
						</Label>
						<Input
							id="awayScore"
							value={awayScore}
							onChange={(e) => setAwayScore(Number(e.target.value))}
							className="bg-[#162029] border-[#193549] text-white w-[80px]"
						/>
					</div>
				</CardContent>
				<CardFooter className="flex justify-center">
					<Button type="submit" variant={"roster"} className="w-1/2 mt-4" disabled>
						Save Score
					</Button>
				</CardFooter>
			</Card>

			<Card className="bg-[#0F1C26] border-[#193549] mb-8">
				<CardHeader>
					<CardTitle className="text-[#00A3FF]">Match Details</CardTitle>
				</CardHeader>
				<CardContent className="flex gap-10 flex-col">
					<Link href={`/roster/${match?.id}`} className=" flex items-center justify-around">
						<h4 className="mb-2 font-semibold text-slate-400">Roster</h4>
						<Button variant={"roster"}>
							{!match || match.rosterStatus === rosterEnum.Values.not_created ? "Add Roster" : "View Roster"}
						</Button>
					</Link>
					{images && (
						<GeneratedImages
							triggerImgGen={triggerImgGen}
							enabled={!match || match.rosterStatus === rosterEnum.Values.not_created}
							imagesData={images}
						/>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
