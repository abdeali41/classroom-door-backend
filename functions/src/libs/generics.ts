// import * as admin from "firebase-admin";
import { v4 } from "uuid";
import env from "../env";

export const getServerTimeStamp = () => new Date();

export function addCreationTimeStamp<T>(docData: any): T {
	return {
		...docData,
		creationTime: getServerTimeStamp(),
		modifiedTime: getServerTimeStamp(),
	};
}

export function addModifiedTimeStamp<T>(docData: any): T {
	return {
		...docData,
		modifiedTime: getServerTimeStamp(),
	};
}

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

export const btoa = (str: string) =>
	new Buffer(str, "binary").toString("base64");

export const getRefPathRelativeToRoot = (ref: any) => {
	let path = ref.key;
	let startRef = ref.parent;
	while (startRef && startRef.key !== ref.root.key) {
		path = `${startRef.key}/${path}`;
		startRef = startRef.parent;
	}
	return path;
};

export const verifySecret = (req: any, res: any): void => {
	const secret = req.get("x-custom-auth-token");
	try {
		if (!env.API_ACCESS_SECRET || !secret) {
			throw {
				name: "AuthorizationError",
				message: "Unauthorized request!",
			};
		}
		if (secret !== env.API_ACCESS_SECRET) {
			throw {
				name: "AuthorizationError",
				message: "Unauthorized request!",
			};
		}
	} catch (e) {
		res.status(400).json({ error: e.name, message: e.message });
	}
};
