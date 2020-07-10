import * as functions from "firebase-functions";
import { firestoreDB, epicboardRoomCollection, userMetaCollection } from "../db"

import {
	userMetaSubCollectionKeys,
	firestoreCollectionKeys,
} from "../libs/constants";
import { addModifiedTimeStamp, addCreationTimeStamp } from "../libs/generics";
import { createdAndModifiedTimeStampTypes } from "../booking-request";
import { EPICBOARD_ROOM_STATUS_CODES } from "../libs/status-codes";

type epicboardRoomActivityType = {
	[key: string]: {
		// key = sessionEventId
		startTImeStamp: string;
		endTimeStamp: string;
		members: {
			// Object Array
			[key: string]: {
				// key = memberID (student/teacher)
				startTImeStamp: string;
				endTimeStamp: string;
			}[];
		};
	};
};
type epicboardRoomSavedStatesType = {
	[key: string]: {
		// timestamp keys
	};
};
type epicboardRoomObjectType = {
	status: Number;
	id: string;
	sessionEventIdList: string[];
	memberIdList: string[];
	presenterId: string;
	activity: epicboardRoomActivityType;
	savedStates: epicboardRoomSavedStatesType;
} & createdAndModifiedTimeStampTypes;

// Triggered from Crete Session-events
export const createEpicboardRoom = async (
	roomId: string,
	sessionEventIdList: string[],
	studentIdList: string[],
	teacherId: string
) => {
	const newRoomCollectionObject: epicboardRoomObjectType = addCreationTimeStamp<
		epicboardRoomObjectType
	>({
		status: EPICBOARD_ROOM_STATUS_CODES.CREATED,
		id: roomId,
		sessionEventIdList,
		memberIdList: [...studentIdList, teacherId],
		presenterId: teacherId,
		activity: {},
		savedStates: {},
	});
	console.log("Epicboard Room Object ::", newRoomCollectionObject);
	await epicboardRoomCollection
		.doc(roomId)
		.set(newRoomCollectionObject)
		.then((data) => {
			console.log("Done Creating New Room::", data);
		})
		.catch((err) => {
			console.log("ERROR:::::Creating New Room::", err);
		});
};

type updateEpicboardRoomDataType = {};
// triggered from session updates
export const updateEpicboardRoom = (data: updateEpicboardRoomDataType): any => {
	// Would be used to update ACTIVITY of the Epicboard Room
};

const updateEpicboardRoomStatus = async (
	epicboardRoomId: string,
	epicboardRoomData: epicboardRoomObjectType,
	extraData: Object = {}
) => {
	const { memberIdList, status, creationTime } = epicboardRoomData;
	// add  this id to user-event collections user data for both teacher & student
	// node =>  user-data><studentId/teacherId>/session-events
	let batchWrite = firestoreDB.batch();
	const sessionEventObject = addModifiedTimeStamp({
		id: epicboardRoomId,
		status,
		creationTime,
		...extraData,
	});

	// Updating for all members
	memberIdList.map((memberId) => {
		batchWrite.set(
			userMetaCollection
				.doc(memberId)
				.collection(userMetaSubCollectionKeys.EPICBOARD_ROOM)
				.doc(epicboardRoomId),
			sessionEventObject,
			{ merge: true }
		);
	});
	await batchWrite.commit();
};

export const triggerOnCreateEpicboardRoom = functions.firestore
	.document(`${firestoreCollectionKeys.EPICBOARD_ROOMS}/{epicboardRoomId}`)
	.onCreate(async (epicboardRoomSnap, context) => {
		const { epicboardRoomId } = context.params;
		const epicboardRoomData:
			| epicboardRoomObjectType
			| any = epicboardRoomSnap.data();
		console.log("EpicBoard Room Create Trigger::", epicboardRoomData);
		await updateEpicboardRoomStatus(epicboardRoomId, epicboardRoomData);
	});
