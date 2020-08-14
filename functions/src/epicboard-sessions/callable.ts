import * as functions from "firebase-functions";
import * as methods from "./methods";
import { successTypes } from "../libs/send-response";

enum actionTypes {
	GET_ALL_SESSIONS = "GET_ALL_SESSIONS",
	GET_UPCOMING_SESSIONS = "GET_UPCOMING_SESSIONS",
	GET_USER_TUTOR_COUNSELOR = "GET_USER_TUTOR_COUNSELOR",
	JOIN_EPICBOARD_SESSION = "JOIN_EPICBOARD_SESSION",
}

/** SESSIONS CALLABLE  **/
export const sessions = functions.https.onCall(async (data, context) => {
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
		case actionTypes.GET_ALL_SESSIONS: // FETCH EPICBOARD SESSIONS
			result = await methods.getAllSessions({ userId });
			break;
		case actionTypes.GET_UPCOMING_SESSIONS: // FETCH UPCOMING EPICBOARD SESSIONS LIMITED
			const { limit } = data;
			result = await methods.getUpcomingSessions({ userId, limit });
			break;
		case actionTypes.GET_USER_TUTOR_COUNSELOR: // FETCH ALL TUTOR COUNSELORS WITH WHOM USER HAS SESSIONS
			result = await methods.getUserTutorCounselors({
				userId,
			});
			break;
		case actionTypes.JOIN_EPICBOARD_SESSION: // FETCH ALL TUTOR COUNSELORS WITH WHOM USER HAS SESSIONS
			const { sessionId } = data;
			const value = await methods.joinEpicboardSession({
				sessionId,
			});

			result = {
				...value,
				successType: value.roomId
					? successTypes.SHOW_DATA
					: successTypes.SHOW_MESSAGE,
			};
			break;
		default:
			result = null;
			break;
	}

	return result;
});
