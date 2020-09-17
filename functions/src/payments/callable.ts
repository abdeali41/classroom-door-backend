import * as functions from "firebase-functions";
import * as methods from "./methods";
import { validateAuthAndActionType } from "../libs/validation";

enum actionTypes {
	PROCESS_PAYMENT_FOR_BOOKING = "PROCESS_PAYMENT_FOR_BOOKING", // PROCESS PAYMENT FOR BOOKING
	ATTACH_CARD_TO_STRIPE_CUSTOMER = "ATTACH_CARD_TO_STRIPE_CUSTOMER", // ATTACH A CARD TO CUSTOMER ID OF STRIPE USING CARD TOKEN
}

/** PAYMENTS CALLABLE  **/

export const payments = functions.https.onCall(
	async (data: any, context: any) => {
		validateAuthAndActionType(data, context);

		const { actionType } = data;

		const userId = context.auth.uid;

		let result: any;

		switch (actionType) {
			case actionTypes.ATTACH_CARD_TO_STRIPE_CUSTOMER:
				result = await methods.addUserCard({ userId, ...data });
				break;
			default:
				result = null;
				break;
		}

		return result;
	}
);
