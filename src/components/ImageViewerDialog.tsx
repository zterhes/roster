import Image from "next/image";
import { Input } from "./ui/input";
import {
	type Control,
	Controller,
	useForm,
	type UseFormHandleSubmit,
	type UseFormRegister,
	type UseFormWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, type UseMutationResult, useQuery } from "@tanstack/react-query";
import { getPostByImageId, postImage } from "@/lib/apiService";
import {
	type PostForm,
	postFormSchema,
	type PostMessageRequest,
	postMessageRequestSchema,
	type PostMessageResponse,
} from "@/types/Post";
import { toast } from "@/hooks/use-toast";
import { Separator } from "./ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@radix-ui/react-label";
import { DateTimePicker } from "./ui/datetime-picker";
import { Spinner } from "./ui/spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import type { GeneratedImage } from "@/types/GeneratedImage";
import { Button } from "./ui/button";

const ImageViewerDialog = ({
	imagesData,
	isDialogOpen,
	setIsDialogOpen,
}: {
	imagesData: GeneratedImage;
	isDialogOpen: boolean;
	setIsDialogOpen: (value: boolean) => void;
}) => {
	const { watch, register, handleSubmit, reset, control } = useForm<PostMessageRequest>({
		resolver: zodResolver(postFormSchema),
		defaultValues: {
			isPublishLater: false,
		},
	});

	const { data: post, isLoading } = useQuery({
		queryKey: [getPostByImageId.key, imagesData.id],
		queryFn: () => getPostByImageId.fn(imagesData.id),
	});

	const mutation = useMutation({
		mutationFn: (request: PostMessageRequest) => postImage.fn(request),
		mutationKey: [postImage.key],
		onSuccess: (response) => {
			const message = response.socialMediaId ? (
				<a href={`https://www.facebook.com/photo/?fbid=${response.socialMediaId}`}>
					Check your feed for the post by click on the link here
				</a>
			) : (
				<p>Check your profile to look on your post</p>
			);

			toast({
				variant: "default",
				title: "Posting was successful",
				description: message,
			});
			handleDialog(false);
		},
		onError: () => {
			toast({
				variant: "destructive",
				title: "Error while posting",
				description: "An error occurred while sending the message. Please try again or contact support.",
			});
		},
	});

	const onSubmit = (data: PostForm) => {
		const request = postMessageRequestSchema.parse({
			...data,
			imageId: imagesData.id,
		});
		mutation.mutate(request);
	};

	const handleDialog = (status: boolean) => {
		setIsDialogOpen(status);
		reset();
	};

	return (
		<Dialog open={isDialogOpen} onOpenChange={(status) => handleDialog(status)}>
			<DialogContent className="bg-[#0F1C26] border-[#193549] text-white ">
				<DialogHeader>
					<DialogTitle hidden className="text-[#00A3FF]">
						{imagesData.type}
					</DialogTitle>
				</DialogHeader>
				{isLoading ? (
					<Spinner size="medium" show className="text-white" />
				) : (
					<>
						<div>
							<Image
								src={imagesData.imageUrl ? imagesData.imageUrl : ""}
								alt="Story Image"
								width={500}
								height={500}
								className="p-4"
							/>
						</div>
						<Separator orientation="horizontal" className="my-4 " />
						{post && post.posted !== false ? (
							<div>
								<p>
									Your image is already posted{" "}
									{post.post?.scheduledPublishTime ? `at ${post.post?.scheduledPublishTime}` : ""}
								</p>
								<a href={`https://www.facebook.com/photo/?fbid=${post.post?.socialMediaId}`}>
									Check your feed for the post by click on the link here
								</a>
							</div>
						) : (
							<PostFormComponent
								control={control}
								handleSubmit={handleSubmit}
								onSubmit={onSubmit}
								watch={watch}
								imagesData={imagesData}
								register={register}
								mutation={mutation}
							/>
						)}
					</>
				)}
			</DialogContent>
		</Dialog>
	);
};

type PostFormComponentProps = {
	control: Control<
		{
			isPublishLater: boolean;
			imageId: number;
			message?: string | undefined;
			scheduledPublishTime?: Date | undefined;
		},
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		any
	>;
	handleSubmit: UseFormHandleSubmit<
		{
			imageId: number;
			isPublishLater: boolean;
			message?: string | undefined;
			scheduledPublishTime?: Date | undefined;
		},
		undefined
	>;
	onSubmit: (data: PostForm) => void;
	watch: UseFormWatch<{
		isPublishLater: boolean;
		imageId: number;
		message?: string | undefined;
		scheduledPublishTime?: Date | undefined;
	}>;
	imagesData: GeneratedImage;
	register: UseFormRegister<{
		isPublishLater: boolean;
		imageId: number;
		message?: string | undefined;
		scheduledPublishTime?: Date | undefined;
	}>;
	mutation: UseMutationResult<PostMessageResponse, unknown, PostMessageRequest, unknown>;
};

const PostFormComponent = ({
	control,
	handleSubmit,
	onSubmit,
	watch,
	imagesData,
	register,
	mutation,
}: PostFormComponentProps) => {
	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4 max-w-lg">
			<Controller
				name="isPublishLater"
				control={control}
				render={({ field }) => (
					<div className="flex items-center space-x-2">
						<Switch checked={field.value} onCheckedChange={(value) => field.onChange(value)} />
						<Label htmlFor="isPublishLater-label">Do you want to post it later?</Label>
					</div>
				)}
			/>

			{watch("isPublishLater") && (
				<div>
					<Label htmlFor="date" className="text-slate-400">
						When do you want to publish it?
					</Label>
					<Controller
						control={control}
						name="scheduledPublishTime"
						render={({ field }) => (
							<DateTimePicker
								value={field.value}
								onChange={field.onChange}
								className="bg-[#162029] border-[#193549] text-white"
							/>
						)}
					/>
				</div>
			)}

			{imagesData.type === "post_roster_image" && (
				<Input
					id="message"
					{...register("message")}
					className="bg-[#162029] border-[#193549] text-white"
					placeholder="Enter a message"
				/>
			)}

			<Button variant={"roster"} type="submit">
				{mutation.isPending ? <Spinner /> : "Submit"}
			</Button>
		</form>
	);
};

export default ImageViewerDialog;
