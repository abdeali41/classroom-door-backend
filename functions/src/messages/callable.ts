import * as functions from "firebase-functions";
import { getUserMessages, createChat } from "./methods";

enum actionTypes {
	GET_USER_MESSAGES = "GET_USER_MESSAGES", // TO CREATE CHAT GROUP BETWEEN USERS
	CREATE_CHAT = "CREATE_CHAT", // TO GET ALL RECENT CHATS OF USERS
}

/** MESSAGING CALLABLE  **/

export const messages = functions.https.onCall(async (data, context) => {
	const { actionType } = data;

	// Checking that the user is authenticated.
	if (!context.auth) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new functions.https.HttpsError(
			"permission-denied",
			"You must be authenticated!"
		);
	}

	if (!actionType) {
		// Throwing an HttpsError if actionType is not present in call
		throw new functions.https.HttpsError(
			"invalid-argument",
			"actionType not found"
		);
	}

	const userId = context.auth.uid;

	let result: any;

	switch (actionType) {
		case actionTypes.GET_USER_MESSAGES:
			result = await getUserMessages({ userId });
			break;
		case actionTypes.CREATE_CHAT:
			const { memberIds, groupName } = data;
			result = await createChat({ userId, memberIds, groupName });
			break;
		default:
			result = null;
			break;
	}

	return result;
});
