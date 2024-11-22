export class PersistationError extends Error {
	type: PersistationErrorType;

	constructor(type: PersistationErrorType, message: string) {
		super(message);
		this.type = type;
	}
}

export enum PersistationErrorType {
	FailedToCreateUser = "FailedToCreateUser",
	UpdateUser = "UpdateUser",
	BlobError = "BlobError",
}

export class ClientServerCallError extends Error {
	path: string;
	type: ClientServerCallErrorType;

	constructor(type: ClientServerCallErrorType, path: string, message: string) {
		super(message);
		this.path = path;
		this.type = type;
	}
}

export enum ClientServerCallErrorType {
	ValidationError = "ValidationError",
	AxiosError = "AxiosError",
	UnknownError = "UnknownError",
}
