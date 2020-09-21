import * as functions from "firebase-functions";
import { getUserMessages, createChat, getConnectedPeople } from "./methods";
import { validateAuthAndActionType } from "../libs/validation";

enum actionTypes {
	GET_USER_MESSAGES = "GET_USER_MESSAGES", // TO CREATE CHAT GROUP BETWEEN USERS
	CREATE_CHAT = "CREATE_CHAT", // TO GET ALL RECENT CHATS OF USERS
	GET_CONNECTED_PEOPLE = "GET_CONNECTED_PEOPLE", // TO GET ALL USERS THAT ARE CONNECTED TO THE USER
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
			case actionTypes.GET_CONNECTED_PEOPLE:
				result = await getConnectedPeople({ userId });
				break;
			default:
				result = null;
				break;
		}

		return result;
	}
);
