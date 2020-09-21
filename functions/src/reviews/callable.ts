import * as functions from "firebase-functions";
import * as methods from "./methods";
import { validateAuthAndActionType } from "../libs/validation";

enum actionTypes {
	GET_USER_REVIEWS = "GET_USER_REVIEWS", // FETCH ALL REVIEW OF USERS
}

/** REVIEWS/FEEDBACK CALLABLE  **/

export const reviews = functions.https.onCall(async (data, context) => {
	validateAuthAndActionType(data, context);

	const { actionType } = data;

	let result: any;

	switch (actionType) {
		case actionTypes.GET_USER_REVIEWS:
			result = await methods.getReviews();
			break;
		default:
			result = null;
			break;
	}

	return result;
});
