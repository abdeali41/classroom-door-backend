import * as moment from "moment";
import {
	bookingRequestType,
	requestThreadSlotMapType,
	getLastRequestObject,
	updateBookingRequestStatus,
} from "../booking-request";
import {
	addModifiedTimeStamp,
	generateUniqueID,
	addCreationTimeStamp,
} from "../libs/generics";
import { EPICBOARD_SESSION_STATUS_CODES } from "../libs/status-codes";
import { createEpicboardRoom } from "../epicboard-rooms";
import {
	firestoreDB,
	userMetaCollection,
	epicboardSessionCollection,
} from "../db";
import { userMetaSubCollectionKeys } from "../db/enum";

const generateNewRoomID = () => `room-${generateUniqueID()}`;
const generateNewSessionID = () => `session-${generateUniqueID()}`;

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
	const approvedSessionIdList: string[] = Object.keys(allRequestSlots)
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
			return epicboardSessionId; // returning to list of session ids for pushing to ROOM DATA
		});

	await epicboardSessionBatchWrite.commit();

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
