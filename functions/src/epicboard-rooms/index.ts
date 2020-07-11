import * as functions from "firebase-functions";
import { database } from "firebase-admin";
import * as moment from "moment";
import {
	userMetaSubCollectionKeys,
	firestoreCollectionKeys,
} from "../libs/constants";
import {
	addModifiedTimeStamp,
	addCreationTimeStamp,
	pushAsSuccessResponse,
	pushAsErrorResponse,
} from "../libs/generics";
import { createdAndModifiedTimeStampTypes } from "../booking-request";
import { EPICBOARD_ROOM_STATUS_CODES } from "../libs/status-codes";
import {
	firestoreDB,
	userMetaCollection,
	epicboardRoomCollection,
	epicboardSessionCollection,
	getRoomMetaRef,
	getRoomUserRef,
	getRoomRef,
} from "../db";

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
	const batchWrite = firestoreDB.batch();
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

// Create room for joining epicboard session
type RoomInfo = {
	name: string;
	presenterIds: string[];
	ownerId: string;
	activeBoard: number;
};

const createRoom = async (roomId: string, roomInfo: RoomInfo) => {
	const roomMeta = {
		...roomInfo,
		id: roomId,
		createdAt: database.ServerValue.TIMESTAMP,
	};
	await getRoomMetaRef(roomId).update(roomMeta);
	return true;
};

const addUsersToRoom = async (roomId, users, roomInfo) => {
	const addUsersToRoomPromise = users.map(async (user) => {
		await getRoomUserRef(roomId, user).update({ id: user });
	});

	return Promise.all(addUsersToRoomPromise);
};

const isRoomExits = (roomId) => {
	const roomRef = getRoomRef(roomId);
	return roomRef.once("value").then((snap) => snap.exists());
};

type JoinEpicboardSessionRequestType = {
	userId: string;
	sessionId: string;
};

export const handleJoinEpicboardSession = functions.https.onRequest(
	async (req: any, res: any) => {
		const { sessionId }: JoinEpicboardSessionRequestType = req.body;
		const epicboardSessionSnapshot = await epicboardSessionCollection
			.doc(sessionId)
			.get();

		const epicboardSession = epicboardSessionSnapshot.data();

		console.log("epicboardSession", epicboardSession);

		const {
			roomId,
			teacherId,
			startTime,
			sessionLength,
			subjects,
		}: any = epicboardSession;

		const startTimeObj = moment(startTime);
		const currentTime = moment();

		if (startTimeObj.isBefore(currentTime) && sessionLength > 0) {
			res
				.status(200)
				.json(
					pushAsErrorResponse(
						"This session in not started yet! Please try again on scheduled time.",
						400
					)
				);
		}

		const epicboardRoomSnapshot = await epicboardRoomCollection
			.doc(roomId)
			.get();

		const epicboardRoom = epicboardRoomSnapshot.data();

		console.log("epicboardRoom", epicboardRoom);

		const { memberIdList }: any = epicboardRoom;

		const isAlreadyCreated = await isRoomExits(roomId);

		if (!isAlreadyCreated) {
			const roomName = subjects.join(",");
			const roomInfo = {
				name: roomName,
				presenterIds: [teacherId],
				ownerId: teacherId,
				activeBoard: 0,
			};

			await createRoom(roomId, roomInfo);
			await addUsersToRoom(roomId, memberIdList, roomInfo);
		}

		res
			.status(200)
			.json(pushAsSuccessResponse("Epicboard Session created", { roomId }));
	}
);
