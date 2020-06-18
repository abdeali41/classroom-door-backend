// import * as admin from "firebase-admin";

export const getServerTimeStamp = () => new Date();

export const addCreationTimeStamp = (docData) => ({
	...docData,
	creationTime: getServerTimeStamp(),
	modifiedTime: getServerTimeStamp(),
});

export const addModifiedTimeStamp = (docData) => ({
	...docData,
	modifiedTime: getServerTimeStamp(),
});

export const pushAsSuccessResponse = (message: string, docData: Object) => ({
	message,
	data: docData,
});

export const pushAsErrorResponse = (message: string, error: Object) => ({
	message,
	error,
});

export const capitalizeName = (firstName: String, lastName: String) => {
	return `${firstName[0].toUpperCase() + firstName.slice(1).toLowerCase()} ${
		lastName[0].toUpperCase() + lastName.slice(1).toLowerCase()
	}.`;
};
