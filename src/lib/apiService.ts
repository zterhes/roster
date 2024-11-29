import { defaultImagesResponseSchema, type UpdateDefaultImagesRequest } from "@/types/DefaultRoute";
import { ClientServerCallError, ClientServerCallErrorType } from "@/types/Errors";
import { matchesSchema, matchSchema } from "@/types/Match";
import {
	type CreatePlayerRequest,
	createPlayerResponseSchema,
	playerSchema,
	type UpdatePlayerRequest,
} from "@/types/Player";
import axios from "axios";
import axiosRetry from "axios-retry";
import { ZodError } from "zod";

axiosRetry(axios, {
	retries: 3,
	retryDelay: (retryCount) => {
		return retryCount * 1000;
	},
	retryCondition: (error) => {
		console.log("Fetch error...", error.message);
		return true;
	},

	onRetry: (retryCount) => {
		console.log("Retrying...", retryCount);
	},
});

export const fetchPlayers = {
	fn: async () => {
		try {
			const response = await axios.get("/api/player");

			return playerSchema.array().parse(response.data);
		} catch (error) {
			handleError(error, "/api/player");
		}
	},
	key: "fetchPlayers",
};

export const createPlayer = {
	fn: async (request: CreatePlayerRequest) => {
		console.log("SERVICE");

		const formData = buildPlayerFormData(request);
		console.log("SERVICE");

		try {
			const response = await axios({
				method: "post",
				url: "/api/player",
				data: formData,
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			return createPlayerResponseSchema.parse(response.data);
		} catch (error) {
			handleError(error, "/api/player");
		}
	},
	key: "createPlayer",
};

export const updatePlayer = {
	fn: async (request: UpdatePlayerRequest) => {
		const formData = buildPlayerFormData({
			firstName: request.firstName,
			lastName: request.lastName,
			file: request.file,
		});

		try {
			const response = await axios({
				method: "post",
				url: `/api/player/${request.id}`,
				data: formData,
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			return response.status;
		} catch (error) {
			throw handleError(error, "/api/player/${request.id}");
		}
	},
	key: "updatePlayer",
};

const buildPlayerFormData = (request: CreatePlayerRequest) => {
	const formData = new FormData();
	formData.append("firstName", request.firstName);
	formData.append("lastName", request.lastName);
	if (request.file) {
		formData.append("file", request.file);
	}
	return formData;
};

export const fetchDefaultImages = {
	fn: async () => {
		try {
			const response = await axios.get("/api/default");
			return defaultImagesResponseSchema.parse(response.data);
		} catch (error) {
			throw handleError(error, "/api/default");
		}
	},
	key: "fetchDefaultImages",
};

export const updateDefaultImages = {
	fn: async (request: UpdateDefaultImagesRequest) => {
		try {
			const formData = new FormData();
			if (request.post) {
				formData.append("post", request.post);
			}
			if (request.story) {
				formData.append("story", request.story);
			}
			if (request.player) {
				formData.append("player", request.player);
			}
			const response = await axios({
				method: "post",
				url: "/api/default",
				data: formData,
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			return response.status;
		} catch (error) {
			throw handleError(error, "/api/default");
		}
	},
	key: "updateDefaultImages",
};

export const fetchMatches = {
	fn: async () => {
		try {
			const response = await axios.get("/api/match");
			return matchesSchema.parse(response.data);
		} catch (error) {
			throw handleError(error, "/api/match");
		}
	},
	key: "fetchMatches",
};

export const fetchMatchById = {
	fn: async (id: string) => {
		try {
			console.log("Fetching match by id", id);
			const response = await axios.get(`/api/match/${id}`);
			console.log("response", response);
			return matchSchema.parse(response.data);
		} catch (error) {
			throw handleError(error, `/api/match/${id}`);
		}
	},
	key: "fetchMatchById",
};

const handleError = (error: unknown, route: string) => {
	console.error(error);
	if (error instanceof ZodError) {
		return new ClientServerCallError(ClientServerCallErrorType.ValidationError, route, error.message);
	}
	if (axios.isAxiosError(error)) {
		return new ClientServerCallError(ClientServerCallErrorType.AxiosError, route, error.message);
	}
	return new ClientServerCallError(ClientServerCallErrorType.UnknownError, route, (error as Error).message);
};
