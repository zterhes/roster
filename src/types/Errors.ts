export class PersistationError extends Error {
	constructor(type: PersistationErrorType, message: string) {
		super(message);
	}
}

export enum PersistationErrorType {
	FailedToCreateUser = "FailedToCreateUser",
	UpdateUser = "UpdateUser",
	BlobError = "BlobError",
}
