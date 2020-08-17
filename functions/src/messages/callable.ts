import * as functions from "firebase-functions";
import { getUserMessages, createChat } from "./methods";
import { validateAuthAndActionType } from "../libs/validation";

enum actionTypes {
	GET_USER_MESSAGES = "GET_USER_MESSAGES", // TO CREATE CHAT GROUP BETWEEN USERS
	CREATE_CHAT = "CREATE_CHAT", // TO GET ALL RECENT CHATS OF USERS
}

/** MESSAGING CALLABLE  **/

export const messages = functions.https.onCall(
	async (data: any, context: any) => {
		validateAuthAndActionType(data, context);

		const { actionType } = data;

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
	}
);
