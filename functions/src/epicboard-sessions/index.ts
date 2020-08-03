import * as functions from "firebase-functions";
import * as moment from "moment";
import {
	userMetaSubCollectionKeys,
	firestoreCollectionKeys,
} from "../libs/constants";
import {
	bookingRequestType,
	requestThreadSlotMapType,
	getLastRequestObject,
	createdAndModifiedTimeStampTypes,
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
import SendResponse from "../libs/send-response";

type epicboardSessionObjectType = {
	status: Number;
	id: string;
	roomId: string;
	teacherId: string;
	teacherName: string;
	studentId: string;
	studentName: string;
	sessionType: string;
	teacherGroupSessionRate: Number;
	teacherHourlyRate: Number;
	subjects: string[];
	bookingRequestSlotId: string;
	bookingRequestThreadObjectId: string;
	startTime: string;
	sessionLength: Number;
} & createdAndModifiedTimeStampTypes;

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
const getAllEpicboardSessionsForUser = async (userId: string) => {
	const userEpicboardSessionsSnapshot = await userMetaCollection
		.doc(userId)
		.collection(userMetaSubCollectionKeys.EPICBOARD_SESSION)
		.orderBy("creationTime", "desc")
		.get();
	const allBookingData = userEpicboardSessionsSnapshot.docs.map(
		async (epicboardSessionDoc) => {
			const epicboardSessionData = epicboardSessionDoc.data();
			console.log(
				"EpicboardSession id::",
				epicboardSessionData.id,
				epicboardSessionData
			);
			return epicboardSessionCollection
				.doc(epicboardSessionData.id)
				.get()
				.then((data) => {
					console.log("Epicboard Session::", epicboardSessionData.id);
					return { id: epicboardSessionData.id, ...data.data() };
				});
		}
	);
	return Promise.all(allBookingData);
};

// Fetch limit Booking sessions for arranged in ascending order of their starting time
export const getUpcomingEpicboardSessions = functions.https.onRequest(
	async (req: any, res: any) => {
		const { userId, limit } = req.body;

		try {
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
			SendResponse(res).success("Upcoming Epicboard Sessions Found", sessions);
		} catch (err) {
			console.log("err", err);
			SendResponse(res).failed("Upcoming Epicboard Sessions NOT Found");
		}
	}
);

// Get user's Session Events
export const handleGetUserEpicboardSession = functions.https.onRequest(
	async (request: any, response: any) => {
		// fetch all docs from user-meta/<userId>/epicboard-session
		// Can query on this Collection as per the status
		const { userId } = request.body;

		getAllEpicboardSessionsForUser(userId)
			.then((data) => {
				SendResponse(response).success("Epicboard Sessions Found", data);
			})
			.catch((err) => {
				console.log("err", err);
				SendResponse(response).failed("Epicboard Sessions NOT Found");
			});
	}
);

export const updateEpicboardSessionStatus = async (
	epicboardSessionId: string,
	epicboardSessionData: epicboardSessionObjectType,
	extraData: Object = {}
) => {
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
};

export const triggerOnCreateEpicboardSession = functions.firestore
	.document(
		`${firestoreCollectionKeys.EPICBOARD_SESSIONS}/{epicboardSessionId}`
	)
	.onCreate(async (epicboardSessionSnap, context) => {
		const { epicboardSessionId } = context.params;
		const epicboardSessionData: any = epicboardSessionSnap.data();
		console.log("Triggered onUpdate Booking Data", epicboardSessionData);
		await updateEpicboardSessionStatus(
			epicboardSessionId,
			epicboardSessionData
		);

		// When Approved the session details need to be added to the collection.
		// Trigger new Session object from here when approved.
	});

export const triggerOnUpdateEpicboardSession = functions.firestore
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
