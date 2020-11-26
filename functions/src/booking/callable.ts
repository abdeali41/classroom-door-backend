import * as functions from "firebase-functions";
import * as methods from "./methods";
import { validateAuthAndActionType } from "../libs/validation";
import { successTypes } from "../libs/send-response";

enum actionTypes {
	CREATE_BOOKING_REQUEST = "CREATE_BOOKING_REQUEST", // CREATE BOOKING REQUEST
	GET_BOOKING_REQUESTS = "GET_BOOKING_REQUESTS", // FETCH BOOKING REQUEST
	GET_BOOKING_REQUEST_BY_ID = "GET_BOOKING_REQUEST_BY_ID", // FETCH BOOKING REQUEST BY ID
	UPDATE_BOOKING_REQUEST = "UPDATE_BOOKING_REQUEST", // UPDATE BOOKING REQUEST
	TEACHER_PENDING_BOOKING_REQUEST_COUNT = "TEACHER_PENDING_BOOKING_REQUEST_COUNT", // GET TEACHER PENDING REQUEST COUNT
	CHECK_TEACHER_AVAILABILITY = "CHECK_TEACHER_AVAILABILITY", // GET TEACHER NON AVAILABLE SLOTS
}

/** BOOKING CALLABLE  **/

export const booking = functions.https.onCall(
	async (data: any, context: any) => {
		validateAuthAndActionType(data, context);

		const { actionType } = data;

		const userId = context.auth.uid;

		let result: any;

		try {
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
				case actionTypes.TEACHER_PENDING_BOOKING_REQUEST_COUNT:
					result = await methods.teacherPendingBookingRequestCount({ userId });
					break;
				case actionTypes.CHECK_TEACHER_AVAILABILITY:
					result = await methods.getTeacherAvailability(data);
					break;
				default:
					result = null;
					break;
			}
			return result;
		} catch (e) {
			return {
				successType: successTypes.SHOW_MESSAGE,
				message: e.message,
				error: true,
			};
		}
	}
);
