import {
	ClientServerCallError,
	ClientServerCallErrorType,
} from "@/types/Errors";
import { playerSchema } from "@/types/Player";
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
			handleError(error);
		}
	},
	key: "fetchPlayers",
};

const handleError = (error: unknown) => {
	if (error instanceof ZodError) {
		console.error(error);
		return new ClientServerCallError(
			ClientServerCallErrorType.ValidationError,
			"/api/player",
			error.message,
		);
	}
	if (axios.isAxiosError(error)) {
		console.error(error);
		return new ClientServerCallError(
			ClientServerCallErrorType.AxiosError,
			"/api/player",
			error.message,
		);
	}
	console.error(error);
	return new ClientServerCallError(
		ClientServerCallErrorType.UnknownError,
		"/api/player",
		(error as Error).message,
	);
};
