// import * as admin from "firebase-admin";
import { v4 } from 'uuid';

export const getServerTimeStamp = () => new Date();

export function addCreationTimeStamp<T>(docData: any): T {
    return ({
        ...docData,
        creationTime: getServerTimeStamp(),
        modifiedTime: getServerTimeStamp(),
    })
};

export function addModifiedTimeStamp<T>(docData: any): T {
    return ({
        ...docData,
        modifiedTime: getServerTimeStamp(),
    })
};

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

// Generates Unique ID for the Collections or documents
export const generateUniqueID = () => v4().replace(/-/g, "").substr(0, 20);
