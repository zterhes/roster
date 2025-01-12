export class PersistationError extends Error {
	type: PersistationErrorType;

	constructor(type: PersistationErrorType, message: string) {
		super(message);
		this.type = type;
	}

	static handleError(result: { id: number | null }, type: PersistationErrorType) {
		if (result?.id == null) throw new PersistationError(type, "creation failed");
	}
}

export enum PersistationErrorType {
	CreateError = "CreateError",
	UpdateError = "UpdateError",
	BlobError = "BlobError",
	NotFound = "NotFound",
	AlreadyExists = "AlreadyExists",
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

export class AuthError extends Error {
	type: AuthErrorType;

	constructor(type: AuthErrorType, message: string) {
		super(message);
		this.type = type;
	}
}
export enum AuthErrorType {
	Unauthorized = "Unauthorized",
	NoOrganization = "NoOrganization",
	NoToken = "NoToken",
}

export class GeneratorError extends Error {
	type: GeneratorErrorType;

	constructor(type: GeneratorErrorType, message: string) {
		super(message);
		this.type = type;
	}
}
export enum GeneratorErrorType {
	LoadingError = "LoadingError",
}
