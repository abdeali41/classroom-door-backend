import * as functions from "firebase-functions";
import { updateEpicboardSessionStatus } from "./methods";
import { firestoreCollectionKeys } from "../db/enum";

/** EPICBOARD SESSIONS TRIGGERS **/

// EPICBOARD SESSIONS TRIGGER FOR ON CREATE BOOKING REQUEST
export const onCreateEpicboardSessionTrigger = functions.firestore
	.document(
		`${firestoreCollectionKeys.EPICBOARD_SESSIONS}/{epicboardSessionId}`
	)
	.onCreate(async (epicboardSessionSnap, context) => {
		const { epicboardSessionId } = context.params;
		const epicboardSessionData: any = epicboardSessionSnap.data();
		await updateEpicboardSessionStatus(
			epicboardSessionId,
			epicboardSessionData
		);

		// When Approved the session details need to be added to the collection.
		// Trigger new Session object from here when approved.
	});

// EPICBOARD SESSIONS TRIGGER FOR ON UPDATE BOOKING REQUEST
export const onUpdateEpicboardSessionTrigger = functions.firestore
	.document(
		`${firestoreCollectionKeys.EPICBOARD_SESSIONS}/{epicboardSessionId}`
	)
	.onUpdate(async (epicboardSessionChangeSnap, context) => {
		const { epicboardSessionId } = context.params;
		const epicboardSessionData: any = epicboardSessionChangeSnap.after.data();
		console.log("Triggered onUpdate Booking Data", epicboardSessionData);
		await updateEpicboardSessionStatus(
			epicboardSessionId,
			epicboardSessionData
		);

		// When Approved the session details need to be added to the collection.
		// Trigger new Session object from here when approved.
	});
