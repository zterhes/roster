import { ClientServerCallError, ClientServerCallErrorType } from "@/types/Errors";
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
	console.log("request.file", request.file);
	if (request.file) {
		formData.append("file", request.file);
	}
	return formData;
};

const handleError = (error: unknown, route: string) => {
	if (error instanceof ZodError) {
		console.error(error);
		return new ClientServerCallError(ClientServerCallErrorType.ValidationError, route, error.message);
	}
	if (axios.isAxiosError(error)) {
		console.error(error);
		return new ClientServerCallError(ClientServerCallErrorType.AxiosError, route, error.message);
	}
	console.error(error);
	return new ClientServerCallError(ClientServerCallErrorType.UnknownError, route, (error as Error).message);
};
