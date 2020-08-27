import { database } from "firebase-admin";
import * as moment from "moment";
import {
	addModifiedTimeStamp,
	generateUniqueID,
	addCreationTimeStamp,
} from "../libs/generics";
import {
	EPICBOARD_SESSION_STATUS_CODES,
	EPICBOARD_ROOM_STATUS_CODES,
} from "../libs/status-codes";
import {
	firestoreDB,
	userMetaCollection,
	epicboardSessionCollection,
	epicboardRoomCollection,
	getRoomCurrentSessionRef,
	getRoomMetaRef,
	getRoomUserRef,
	getRoomRef,
} from "../db";
import { userMetaSubCollectionKeys } from "../db/enum";
import { isBetweenInterval } from "../libs/date-utils";
import {
	getLastRequestObject,
	updateBookingRequestStatus,
} from "../booking/methods";
import { SESSION_TYPES } from "../libs/constants";

const generateNewRoomID = () => `room-${generateUniqueID()}`;
const generateNewSessionID = () => `session-${generateUniqueID()}`;

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

export const createEpicboardSession = async (
	bookingData: bookingRequestType,
	bookingId: string
) => {
	const epicboardSessionBatchWrite = firestoreDB.batch();

	const {
		teacherId,
		teacherName,
		studentId,
		studentName,
		sessionType,
		teacherGroupSessionRate,
		teacherHourlyRate,
		subjects,
		requestThread,
	} = bookingData;
	// generate list of approved sessions
	// from requestThread - slots which are studentApproved & not deleted

	const { latestRequestKey, latestRequestMap } = getLastRequestObject(
		requestThread
	);
	const allRequestSlots: requestThreadSlotMapType = latestRequestMap.slots;

	const newRoomId = generateNewRoomID();
	const approvedSessions: {
		sessionId: string;
		sessionTime: string;
	}[] = Object.keys(allRequestSlots)
		.filter(
			(slotKey) =>
				!allRequestSlots[slotKey].deleted &&
				!allRequestSlots[slotKey].studentAccepted
		) // Filtering Slots which are deleted or not StudentAccepted
		.map((approvedSlotKey) => {
			const epicboardSessionId = generateNewSessionID();
			// create session object
			const sessionObj: epicboardSessionObjectType = addCreationTimeStamp({
				status: EPICBOARD_SESSION_STATUS_CODES.CREATED,
				id: epicboardSessionId,
				roomId: newRoomId,
				bookingId,
				teacherId,
				teacherName,
				studentId,
				studentName,
				sessionType,
				teacherGroupSessionRate,
				teacherHourlyRate,
				subjects,
				bookingRequestSlotId: approvedSlotKey,
				bookingRequestThreadObjectId: latestRequestKey,
				startTime: allRequestSlots[approvedSlotKey].suggestedDateTime,
				sessionLength: allRequestSlots[approvedSlotKey].sessionLength,
			});
			console.log("Creating Session: ", sessionObj);
			epicboardSessionBatchWrite.set(
				epicboardSessionCollection.doc(epicboardSessionId),
				sessionObj
			);
			return {
				sessionId: epicboardSessionId,
				sessionTime: allRequestSlots[approvedSlotKey].suggestedDateTime,
			}; // returning to  object of session for pushing to ROOM DATA
		});

	await epicboardSessionBatchWrite.commit();

	const approvedSessionIdList: string[] = approvedSessions.map(
		(sess) => sess.sessionId
	);

	console.log("Create Session Batch done::", approvedSessionIdList);

	await createEpicboardRoom(
		newRoomId,
		approvedSessionIdList,
		[studentId],
		teacherId
	);

	console.log("Session:: Done Create Room");
	await updateBookingRequestStatus(bookingId, bookingData, {
		epicboardSessionIdList: approvedSessionIdList,
		roomId: newRoomId,
	});

	console.log("Session:: Done Updating the Booking Object.", bookingId);

	return approvedSessions;
};

// Fetch Functions Booking Request for user
export const getAllSessions = async (
	params: sessionsParams
): Promise<sessionsReturnType> => {
	const { userId } = params;

	const userEpicboardSessionsSnapshot = await userMetaCollection
		.doc(userId)
		.collection(userMetaSubCollectionKeys.EPICBOARD_SESSION)
		.orderBy("creationTime", "desc")
		.get();

	const allBookingData = userEpicboardSessionsSnapshot.docs.map(
		async (epicboardSessionDoc): Promise<any> => {
			const epicboardSessionData = epicboardSessionDoc.data();
			return epicboardSessionCollection
				.doc(epicboardSessionData.id)
				.get()
				.then((data) => ({ id: epicboardSessionData.id, ...data.data() }));
		}
	);
	const sessions = await Promise.all(allBookingData);
	return { sessions };
};

//Fetch all past sessions data
export const getPastSessions = async (params: sessionsParams): Promise<sessionsReturnType> => {
	const { userId } = params;

	const userPastSessions = await userMetaCollection
		.doc(userId)
		.collection(userMetaSubCollectionKeys.EPICBOARD_SESSION)
		.where("status","==", EPICBOARD_SESSION_STATUS_CODES.ENDED)
		.get();

	const allPastSessions = userPastSessions.docs.map(
		async (pastSessionsDoc) => {
			const pastSessionData = pastSessionsDoc.data();
			return epicboardSessionCollection
				.doc(pastSessionData.id)
				.get()
				.then((data) => ({id: pastSessionData.id, ...data.data() }));
		}
	);
	const sessions = await Promise.all(allPastSessions);
	return { sessions };	
};

// Fetch limit Booking sessions for arranged in ascending order of their starting time
export const getUpcomingSessions = async (
	params: sessionsWithLimitParams
): Promise<sessionsReturnType> => {
	const { userId, limit } = params;

	const userEpicboardSessionsSnapshot = await userMetaCollection
		.doc(userId)
		.collection(userMetaSubCollectionKeys.EPICBOARD_SESSION)
		.orderBy("startTime")
		.where("status", "==", 1)
		.limit(limit)
		.get();

	const allBookingData = userEpicboardSessionsSnapshot.docs.map(
		async (epicboardSessionDoc) => {
			const epicboardSessionData = epicboardSessionDoc.data();

			return epicboardSessionCollection
				.doc(epicboardSessionData.id)
				.get()
				.then((data) => ({ id: epicboardSessionData.id, ...data.data() }));
		}
	);
	const sessions = await Promise.all(allBookingData);
	return { sessions };
};

export const updateEpicboardSessionStatus = async (
	epicboardSessionId: string,
	epicboardSessionData: epicboardSessionObjectType,
	extraData: Object = {}
): Promise<boolean> => {
	const {
		studentId,
		teacherId,
		status,
		creationTime,
		startTime,
	} = epicboardSessionData;
	// add  this id to user-event collections user data for both teacher & student
	// node =>  user-data><studentId/teacherId>/session-events
	const batchWrite = firestoreDB.batch();
	const epicboardSessionObject = addModifiedTimeStamp({
		id: epicboardSessionId,
		status,
		creationTime,
		startTime: moment.utc(startTime).valueOf(),
		...extraData,
	});

	[studentId, teacherId].map((userId) => {
		batchWrite.set(
			userMetaCollection
				.doc(userId)
				.collection(userMetaSubCollectionKeys.EPICBOARD_SESSION)
				.doc(epicboardSessionId),
			epicboardSessionObject,
			{ merge: true }
		);
	});

	await batchWrite.commit();
	return true;
};

// Fetch All tutor and counselors user had sessions with.
export const getUserTutorCounselors = async (
	params: sessionsParams
): Promise<getUserTutorCounselorsReturnType> => {
	const { userId } = params;

	const userEpicboardSessionsSnapshot = await userMetaCollection
		.doc(userId)
		.collection(userMetaSubCollectionKeys.EPICBOARD_SESSION)
		.orderBy("startTime")
		.where("status", "==", 1)
		.limit(10)
		.get();

	const allBookingData = userEpicboardSessionsSnapshot.docs.map(
		async (epicboardSessionDoc) => {
			const epicboardSessionData = epicboardSessionDoc.data();

			const sessionSnapshot = await epicboardSessionCollection
				.doc(epicboardSessionData.id)
				.get();
			return {
				id: epicboardSessionData.id,
				...sessionSnapshot.data(),
			};
		}
	);

	const sessions = await Promise.all(allBookingData);

	return {
		tutors: sessions,
		counselors: [],
	};
};

/////////////////////////////////////////////////////////////////

const createRoom = async (roomId: string, roomInfo: RoomInfo) => {
	const roomMeta = {
		...roomInfo,
		id: roomId,
		createdAt: database.ServerValue.TIMESTAMP,
	};
	await getRoomMetaRef(roomId).update(roomMeta);
	return true;
};

const addUsersToRoom = async (roomId: string, users) => {
	const addUsersToRoomPromise = users.map(async (user) => {
		await getRoomUserRef(roomId, user).update({ id: user });
	});

	return Promise.all(addUsersToRoomPromise);
};

const isRoomExits = (roomId: string) => {
	const roomRef = getRoomRef(roomId);
	return roomRef.once("value").then((snap) => snap.exists());
};

export const updateEpicboardRoomStatus = async (
	epicboardRoomId: string,
	epicboardRoomData: epicboardRoomObjectType,
	extraData: Object = {}
): Promise<boolean> => {
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
	return true;
};

// Create room for joining epicboard session
export const joinEpicboardSession = async (
	params: JoinEpicboardSessionRequestType
): Promise<joinEpicboardSessionReturnType> => {
	const { sessionId } = params;
	const epicboardSessionSnapshot = await epicboardSessionCollection
		.doc(sessionId)
		.get();

	const epicboardSession = epicboardSessionSnapshot.data();

	const {
		roomId,
		teacherId,
		startTime,
		sessionLength,
		subjects,
		studentId,
		sessionType,
	}: any = epicboardSession;

	const endTime = moment(startTime).add(sessionLength, "minutes");

	if (!isBetweenInterval(startTime, endTime)) {
		return {
			message:
				"This session is not started yet or completed! Please join on scheduled time.",
		};
	}

	const epicboardRoomSnapshot = await epicboardRoomCollection.doc(roomId).get();

	const epicboardRoom = epicboardRoomSnapshot.data();

	const { memberIdList }: any = epicboardRoom;

	const isAlreadyCreated = await isRoomExits(roomId);

	if (!isAlreadyCreated) {
		const roomName = subjects.join(",");

		const roomInfo = {
			name: roomName,
			presenterIds:
				sessionType === SESSION_TYPES.SINGLE
					? [teacherId, studentId]
					: [teacherId],
			ownerId: teacherId,
			activeBoard: 0,
			currentSessionId: sessionId,
		};
		await createRoom(roomId, roomInfo);
		await addUsersToRoom(roomId, memberIdList);
		await userMetaCollection
			.doc(studentId)
			.collection(userMetaSubCollectionKeys.CONNECTED_PEOPLE)
			.doc(teacherId)
			.update({
				lastSession: {
					roomId,
					startTime,
					sessionLength,
					subjects,
					sessionType,
					sessionId,
				},
			});
	} else {
		await getRoomCurrentSessionRef(roomId).set(sessionId);
	}

	return { roomId, message: "Epicboard Session created" };
};
