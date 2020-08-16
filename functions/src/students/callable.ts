import * as functions from "firebase-functions";
import * as methods from "./methods";

enum actionTypes {
	GET_ALL_STUDENTS = "GET_ALL_STUDENTS", // GET ALL STUDENTS
	TOGGLE_FAVORITE = "TOGGLE_FAVORITE", // FOR CHANGING MARK AS FAVORITE STATUS OF TEACHER
}

/** STUDENTS CALLABLE  **/

export const students = functions.https.onCall(async (data, context) => {
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
		case actionTypes.GET_ALL_STUDENTS:
			result = await methods.getAllStudents();
			break;
		case actionTypes.TOGGLE_FAVORITE:
			const { studentId, teacherId } = data;
			result = await methods.toggleMarkAsFavorite({ studentId, teacherId });
			break;
		default:
			result = null;
			break;
	}

	return result;
});
