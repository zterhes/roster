import { defaultImagesResponseSchema, type UpdateDefaultImagesRequest } from "@/types/DefaultRoute";
import { ClientServerCallError, ClientServerCallErrorType } from "@/types/Errors";
import { generatedImageSchema } from "@/types/GeneratedImage";
import {
	type CreateMatchRequestValues,
	matchesSchema,
	matchSchema,
	type UpdateMatchRequestValues,
} from "@/types/Match";
import {
	type CreatePlayerRequest,
	createPlayerResponseSchema,
	playerSchema,
	type UpdatePlayerRequest,
} from "@/types/Player";
import { postMessageResponseSchema, type PostMessageRequest } from "@/types/Post";
import { getRosterResponseSchema, type CreateRosterRequest } from "@/types/Roster";
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
		const formData = buildPlayerFormData(request);

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
			const response = await axios.get(`/api/match/${id}`);
			return matchSchema.parse(response.data);
		} catch (error) {
			throw handleError(error, `/api/match/${id}`);
		}
	},
	key: "fetchMatchById",
};

export const createMatch = {
	fn: async (request: CreateMatchRequestValues) => {
		try {
			const formData = new FormData();
			formData.append("homeTeam", request.homeTeam);
			formData.append("homeTeamLogo", request.homeTeamLogo);
			formData.append("awayTeam", request.awayTeam);
			formData.append("awayTeamLogo", request.awayTeamLogo);
			formData.append("place", request.place);
			formData.append("date", request.date.toISOString());
			const response = await axios({
				method: "post",
				url: "/api/match",
				data: formData,
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			return response.status;
		} catch (error) {
			throw handleError(error, "/api/match");
		}
	},
	key: "createMatch",
};

export const updateMatch = {
	fn: async (request: UpdateMatchRequestValues, id: number) => {
		try {
			const formData = new FormData();
			if (request.homeTeam) {
				formData.append("homeTeam", request.homeTeam);
			}
			if (request.homeTeamLogo) {
				formData.append("homeTeamLogo", request.homeTeamLogo);
			}
			if (request.awayTeam) {
				formData.append("awayTeam", request.awayTeam);
			}
			if (request.awayTeamLogo) {
				formData.append("awayTeamLogo", request.awayTeamLogo);
			}
			if (request.place) {
				formData.append("place", request.place);
			}
			if (request.date) {
				formData.append("date", request.date.toISOString());
			}
			const response = await axios({
				method: "post",
				url: `/api/match/${id}`,
				data: formData,
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			return response.status;
		} catch (error) {
			throw handleError(error, "/api/match/${id}");
		}
	},
	key: "updateMatch",
};

export const createRoster = {
	fn: async (createRosterRequest: CreateRosterRequest) => {
		try {
			const response = await axios.post("/api/roster", createRosterRequest);
			return response.status;
		} catch (error) {
			throw handleError(error, "/api/roster");
		}
	},
	key: "createRoster",
};

export const fetchRoster = {
	fn: async (matchId: number) => {
		try {
			const response = await axios.get(`/api/roster/${matchId}`);
			return getRosterResponseSchema.parse(response.data);
		} catch (error) {
			throw handleError(error, `/api/roster/${matchId}`);
		}
	},
	key: "fetchRoster",
};

export const generateMatchImages = {
	fn: async (matchId: number) => {
		try {
			const response = await axios.get(`/api/image/generator/match/${matchId}`);
			return response.status;
		} catch (error) {
			throw handleError(error, `/api/image/generator/match/${matchId}`);
		}
	},
	key: "generateMatchImages",
};

export const getMatchImages = {
	fn: async (matchId: number) => {
		try {
			const response = await axios.get(`/api/image/match/${matchId}`);
			return generatedImageSchema.array().parse(response.data);
		} catch (error) {
			throw handleError(error, `/api/image/match/${matchId}`);
		}
	},
	key: "getMatchImages",
};

export const postImage = {
	fn: async (body: PostMessageRequest) => {
		try {
			const response = await axios.post("/api/image/post", body);
			const result = postMessageResponseSchema.parse(response.data);
			console.log("result", result);
			return result;
		} catch (error) {
			throw handleError(error, "/api/image/post");
		}
	},
	key: "postImages",
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
