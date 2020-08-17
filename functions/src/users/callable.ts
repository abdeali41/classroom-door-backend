import * as functions from "firebase-functions";
import * as methods from "./methods";
import { validateAuthAndActionType } from "../libs/validation";

enum actionTypes {
	GET_ALL_USERS = "GET_ALL_USERS", // GET ALL USERS
	GET_ROOM_MEMBERS = "GET_ROOM_MEMBERS", // TO GET ALL USERS THAT BELONGS TO A PARTICULAR ROOM AND ALSO RETURN REMAINING USERS
	GET_USER_IMAGE = "GET_USER_IMAGE", // GET USER IMAGE
}

/** USERS CALLABLE  **/

export const users = functions.https.onCall(async (data: any, context: any) => {
	validateAuthAndActionType(data, context);

	const { actionType } = data;

	let result: any;

	switch (actionType) {
		case actionTypes.GET_ALL_USERS:
			result = await methods.getUsers(data.userIds);
			break;
		case actionTypes.GET_ROOM_MEMBERS:
			result = await methods.getRoomMembers(data.userIds);
			break;
		case actionTypes.GET_USER_IMAGE:
			const { userId: userIdRelatingToImage } = data;
			result = await methods.getUserImage(userIdRelatingToImage);
			break;
		default:
			result = null;
			break;
	}

	return result;
});
