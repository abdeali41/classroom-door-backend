import * as functions from "firebase-functions";
import { firestoreCollectionKeys } from "../db/enum";
import { BOOKING_REQUEST_STATUS_CODES } from "../libs/status-codes";
import { createEpicboardSession } from "../sessions/methods";
import {
	addSessionsKeyOnBookingCollection,
	updateBookingRequestStatus,
	updateConnectedPeople,
} from "./methods";

/** BOOKING TRIGGERS **/

// BOOKING REQUEST TRIGGER FOR ON CREATE BOOKING REQUEST
export const onCreateBookingRequestTrigger = functions.firestore
	.document(`${firestoreCollectionKeys.BOOKING_REQUESTS}/{bookingRequestId}`)
	.onCreate(async (bookingRequestSnap, context) => {
		const { bookingRequestId } = context.params;
		const bookingRequestData: any = bookingRequestSnap.data();
		await updateBookingRequestStatus(bookingRequestId, bookingRequestData);
	});

// BOOKING REQUEST TRIGGER FOR ON UPDATE BOOKING REQUEST
export const onUpdateBookingRequestTrigger = functions.firestore
	.document(`${firestoreCollectionKeys.BOOKING_REQUESTS}/{bookingRequestId}`)
	.onUpdate(async (bookingRequestChangeSnap, context) => {
		const { bookingRequestId } = context.params;
		const bookingRequestBeforeData:
			| bookingRequestType
			| any = bookingRequestChangeSnap.before.data();
		const bookingRequestAfterData:
			| bookingRequestType
			| any = bookingRequestChangeSnap.after.data();

		// When Approved the session details need to be added to the collection.

		// check if the before and after status to trigger session and room creation
		if (
			bookingRequestAfterData.status ===
				BOOKING_REQUEST_STATUS_CODES.CONFIRMED &&
			bookingRequestBeforeData.status !== BOOKING_REQUEST_STATUS_CODES.CONFIRMED
		) {
			// Trigger new Session and new room from here
			const approvedSessions = await createEpicboardSession(
				bookingRequestAfterData,
				bookingRequestId
			);
			// create session data for booking request Updated
			// list of session ids

			await addSessionsKeyOnBookingCollection(
				bookingRequestId,
				approvedSessions
			);

			await updateConnectedPeople(bookingRequestAfterData, approvedSessions);
		}

		if (
			bookingRequestBeforeData.status !== BOOKING_REQUEST_STATUS_CODES.CONFIRMED
		) {
			// add session
			await updateBookingRequestStatus(
				bookingRequestId,
				bookingRequestAfterData
			);
		}
	});
