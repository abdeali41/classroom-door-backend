import * as functions from "firebase-functions";
import {
	updateEpicboardSessionStatus,
	updateEpicboardRoomStatus,
	updateMinutesTutoringOfTutor,
	updateSessionEndStatus,
} from "./methods";
import {
	firestoreCollectionKeys,
	realtimeDBNodes,
	epicboardRoomSubCollectionKeys,
} from "../db/enum";
import {
	getRoomCurrentSessionRef,
	epicboardRoomCollection,
	getRoomUsersRef,
} from "../db";

/** SESSIONS TRIGGERS **/

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

		await updateEpicboardSessionStatus(
			epicboardSessionId,
			epicboardSessionData
		);

		// When Approved the session details need to be added to the collection.
		// Trigger new Session object from here when approved.
	});

// EPICBOARD ROOM TRIGGER FOR ON CREATE BOOKING REQUEST
export const onCreateEpicboardRoomTrigger = functions.firestore
	.document(`${firestoreCollectionKeys.EPICBOARD_ROOMS}/{epicboardRoomId}`)
	.onCreate(async (epicboardRoomSnap, context) => {
		const { epicboardRoomId } = context.params;
		const epicboardRoomData:
			| epicboardRoomObjectType
			| any = epicboardRoomSnap.data();

		await updateEpicboardRoomStatus(epicboardRoomId, epicboardRoomData);
	});

// EPICBOARD ROOM TRIGGER FOR SAVING USER ACTIVITY WHEN USER JOINS OR EXIT FROM THE ROOM
export const onUserEpicboardRoomJoinActivity = functions.database
	.ref(
		`${realtimeDBNodes.EPICBOARD_ROOMS}/{roomId}/users/{userId}/devices/{deviceId}`
	)
	.onUpdate(async (snapshot, context) => {
		const status = snapshot.after.val();

		if (!status.offline) {
			return;
		}

		const { roomId, userId, deviceId } = context.params;

		const sessionIdRef = await getRoomCurrentSessionRef(roomId).once("value");

		const sessionId = sessionIdRef.val();

		const userActivitySnapshot = await epicboardRoomCollection
			.doc(roomId)
			.collection(epicboardRoomSubCollectionKeys.USER_ACTIVITY)
			.doc(sessionId)
			.get();

		const userActivity = userActivitySnapshot.data() || {};

		const devices = userActivity[userId] || {};

		const deviceActivity = devices[deviceId] || [];

		const newDeviceActivity = [...deviceActivity, status];

		const newDevices = {
			...devices,
			[deviceId]: newDeviceActivity,
		};

		await epicboardRoomCollection
			.doc(roomId)
			.collection(epicboardRoomSubCollectionKeys.USER_ACTIVITY)
			.doc(sessionId)
			.set(
				{
					[userId]: newDevices,
				},
				{ merge: true }
			);

		await updateMinutesTutoringOfTutor(userId, status);

		const roomUsersRef = await getRoomUsersRef(roomId).once("value");

		await updateSessionEndStatus(sessionId, roomUsersRef.val());

		return null;
	});
