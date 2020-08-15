import * as functions from "firebase-functions";
import * as methods from "./methods";

enum actionTypes {
	CREATE_BOOKING_REQUEST = "CREATE_BOOKING_REQUEST", // CREATE BOOKING REQUEST
	GET_BOOKING_REQUESTS = "GET_BOOKING_REQUESTS", // FETCH BOOKING REQUEST
	GET_BOOKING_REQUEST_BY_ID = "GET_BOOKING_REQUEST_BY_ID", // FETCH BOOKING REQUEST BY ID
	UPDATE_BOOKING_REQUEST = "UPDATE_BOOKING_REQUEST", // UPDATE BOOKING REQUEST
}

/** BOOKING CALLABLE  **/

export const booking = functions.https.onCall(async (data, context) => {
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
		case actionTypes.CREATE_BOOKING_REQUEST:
			result = await methods.createBookingRequest({ ...data, userId });
			break;
		case actionTypes.GET_BOOKING_REQUESTS:
			result = await methods.getAllBookingsForUser({ userId });
			break;
		case actionTypes.GET_BOOKING_REQUEST_BY_ID:
			const { id } = data;
			result = await methods.getBookingById(id);
			break;
		case actionTypes.UPDATE_BOOKING_REQUEST:
			result = await methods.updateBookingRequest({ ...data, userId });
			break;
		default:
			result = null;
			break;
	}

	return result;
});
