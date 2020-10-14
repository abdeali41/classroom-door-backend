import * as functions from "firebase-functions";
import * as methods from "./methods";
import { validateAuthAndActionType } from "../libs/validation";

enum actionTypes {
	GET_OPENVIDU_TOKEN = "GET_OPENVIDU_TOKEN", // TO CREATE OPENVIDU TOKEN FOR CALLING
}

/** EPICBOARD CALLABLE  **/

export const epicboard = functions.https.onCall(
	async (data: any, context: any) => {
		validateAuthAndActionType(data, context);

		const { actionType } = data;

		const userId = context.auth.uid;

		let result: any;

		switch (actionType) {
			case actionTypes.GET_OPENVIDU_TOKEN:
				const { sessionId } = data;
				result = await methods.getOpenviduToken({ userId, sessionId });
				break;
			default:
				result = null;
				break;
		}

		return result;
	}
);
