export class DBError extends Error {
	constructor(type: DBErrorType, message: string) {
		super(message);
	}
}

export enum DBErrorType {
	FailedToCreateUser = "FailedToCreateUser",
	UpdateUser = "UpdateUser",
}
