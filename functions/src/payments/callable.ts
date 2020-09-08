import * as functions from "firebase-functions";
import { acceptAndPayForBooking } from "./methods";
import { validateAuthAndActionType } from "../libs/validation";

enum actionTypes {
	PROCESS_PAYMENT_FOR_BOOKING = "PROCESS_PAYMENT_FOR_BOOKING", // PROCESS PAYMENT FOR BOOKING
}

/** PAYMENTS CALLABLE  **/

export const payments = functions.https.onCall(
	async (data: any, context: any) => {
		validateAuthAndActionType(data, context);

		const { actionType } = data;

		const userId = context.auth.uid;

		let result: any;

		switch (actionType) {
			case actionTypes.PROCESS_PAYMENT_FOR_BOOKING:
				result = await acceptAndPayForBooking({ userId, ...data });
				break;
			default:
				result = null;
				break;
		}

		return result;
	}
);
