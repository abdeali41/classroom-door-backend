import * as functions from "firebase-functions";
import * as methods from "./methods";

enum actionTypes {
	GET_TEACHERS = "GET_TEACHERS", // FETCH ALL TEACHERS BY FILTER OR SORT
	GET_TEACHER_BY_ID = "GET_TEACHER_BY_ID", // FETCH DATA FOR SINGLE TEACHER
}

/** TEACHERS CALLABLE  **/

export const teachers = functions.https.onCall(async (data, context) => {
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

	let result: any;

	switch (actionType) {
		case actionTypes.GET_TEACHERS:
			const { filters } = data;
			result = await methods.getTeacherDataWithFilters(filters);
			break;
		case actionTypes.GET_TEACHER_BY_ID:
			const { teacherId } = data;
			result = await methods.getTeacherById(teacherId);
			break;
		default:
			result = null;
			break;
	}

	return result;
});
