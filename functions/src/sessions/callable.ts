import * as functions from "firebase-functions";
import * as methods from "./methods";
import { successTypes } from "../libs/send-response";
import { validateAuthAndActionType } from "../libs/validation";

enum actionTypes {
	GET_ALL_SESSIONS = "GET_ALL_SESSIONS", // FETCH EPICBOARD SESSIONS
	GET_UPCOMING_SESSIONS = "GET_UPCOMING_SESSIONS", // FETCH UPCOMING EPICBOARD SESSIONS LIMITED
	GET_USER_TUTOR_COUNSELOR = "GET_USER_TUTOR_COUNSELOR", // FETCH ALL TUTOR COUNSELORS WITH WHOM USER HAS SESSIONS
	JOIN_EPICBOARD_SESSION = "JOIN_EPICBOARD_SESSION", // FETCH ALL TUTOR COUNSELORS WITH WHOM USER HAS SESSIONS
	GET_PAST_SESSIONS = "GET_PAST_SESSIONS" // FETCH ALL PAST SESSIONS
}

/** SESSIONS CALLABLE  **/
export const sessions = functions.https.onCall(
	async (data: any, context: any) => {
		validateAuthAndActionType(data, context);

		const { actionType } = data;

		const userId = context.auth.uid;

		let result: any;

		switch (actionType) {
			case actionTypes.GET_ALL_SESSIONS:
				result = await methods.getAllSessions({ userId });
				break;
			case actionTypes.GET_PAST_SESSIONS:
				result = await methods.getPastSessions({ userId });
				break;
			case actionTypes.GET_UPCOMING_SESSIONS:
				const { limit } = data;
				result = await methods.getUpcomingSessions({ userId, limit });
				break;
			case actionTypes.GET_USER_TUTOR_COUNSELOR:
				result = await methods.getUserTutorCounselors({
					userId,
				});
				break;
			case actionTypes.JOIN_EPICBOARD_SESSION:
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
	}
);
