import {
	userMetaCollection,
	firestoreDB,
	bookingRequestCollection,
} from "../db";
import {
	addModifiedTimeStamp,
	generateUniqueID,
	addCreationTimeStamp,
} from "../libs/generics";
import { userMetaSubCollectionKeys } from "../db/enum";
import { BOOKING_REQUEST_STATUS_CODES } from "../libs/status-codes";
import { SESSION_TYPES } from "../libs/constants";

// Updates user-meta/<userId>/<bookingId>/doc -> status, modifiedTime
// Can be used for both onCreate and onUpdate
export const updateBookingRequestStatus = async (
	bookingRequestId: string,
	bookingRequestData: bookingRequestType,
	extraData: Object = {}
) => {
	const { studentId, teacherId, status, creationTime } = bookingRequestData;
	// add  this id to user-event collections user data for both teacher & student
	// node =>  user-data><studentId/teacherId>/booking-request
	const batchWrite = firestoreDB.batch();
	const bookingRequestObject: bookingRequestUserMetaType = addModifiedTimeStamp<
		bookingRequestUserMetaType
	>({
		id: bookingRequestId,
		status,
		creationTime,
		...extraData,
	});

	[studentId, teacherId].map((userId) => {
		batchWrite.set(
			userMetaCollection
				.doc(userId)
				.collection(userMetaSubCollectionKeys.BOOKING_REQUEST)
				.doc(bookingRequestId),
			bookingRequestObject,
			{ merge: true }
		);
	});
	await batchWrite.commit();
};

export const createBookingRequest = async (
	params: createBookingRequestParams
): Promise<createBookingRequestReturnType> => {
	// add new request to booking request collection
	// add the id to user's booking request array

	const {
		teacherId,
		studentId,
		teacherName,
		studentName,
		teacherHourlyRate,
		totalSessionLength,
		sessionRequests,
		subjects,
		teacherGroupSessionRate,
	} = params;

	const initialRequest = sessionRequests.reduce(
		(newSlotRequest: any, newItem: any) => ({
			...newSlotRequest,
			[`${newItem.date}-${newItem.selectedBreak}`]: {
				selectedBreak: newItem.selectedBreak,
				sessionLength: newItem.selectedLength,
				date: newItem.date,
			},
		}),
		{}
	);

	const requestThread: requestThreadMapType = {};
	const bookingRequestId = generateUniqueID();
	const bookingRequest: bookingRequestType = addCreationTimeStamp<
		bookingRequestType
	>({
		id: bookingRequestId,
		status: BOOKING_REQUEST_STATUS_CODES.WAITING_FOR_TEACHER_CONFIRMATION,
		teacherId,
		teacherName,
		studentId,
		studentName,
		teacherHourlyRate,
		teacherGroupSessionRate,
		totalSessionLength,
		sessionType: SESSION_TYPES.SINGLE,
		subjects: subjects,
		initialRequest,
		requestThread,
	});

	// adding to booking-request collection
	await bookingRequestCollection.doc(bookingRequestId).set(bookingRequest);

	return {
		bookingRequest,
	};
};

// Fetch Functions Booking Request for user
// fetch all docs from user-meta/<userId>/booking-requests
export const getAllBookingsForUser = async (
	params: getAllBookingsForUserParams
): Promise<getAllBookingsForUserReturnType> => {
	const { userId } = params;

	const userBookingsSnapshot = await userMetaCollection
		.doc(userId)
		.collection(userMetaSubCollectionKeys.BOOKING_REQUEST)
		.where(
			"status",
			"<=",
			BOOKING_REQUEST_STATUS_CODES.WAITING_FOR_STUDENT_CONFIRMATION
		)
		.get();

	const allBookingData = userBookingsSnapshot.docs.map(
		async (bookingRequestDoc) => {
			const bookingRequestData = bookingRequestDoc.data();
			return bookingRequestCollection
				.doc(bookingRequestData.id)
				.get()
				.then((data) => ({ id: bookingRequestData.id, ...data.data() }));
		}
	);

	const bookings = await Promise.all(allBookingData);

	console.log("bookings", bookings);

	return { bookings };
};

// Fetch Single Booking by id
export const getBookingById = async (id: string) => {
	const bookingSnapshot = await bookingRequestCollection.doc(id).get();

	const booking = bookingSnapshot.data();

	return booking;
};

// Method to get Latest Request Object From request Thread
export const getLastRequestObject = (
	requestThreadSlotsObject: requestThreadMapType
): {
	latestRequestKey: string;
	latestRequestMap: requestThreadObjectType;
} => {
	const latestTimeStamp = Object.keys(requestThreadSlotsObject).sort(
		(a: any, b: any) => b - a
	)[0];
	return {
		latestRequestKey: latestTimeStamp,
		latestRequestMap: requestThreadSlotsObject[latestTimeStamp],
	};
};

const getData_RequestChangesByStudent = (
	existingBookingRequestObject: bookingRequestType,
	requestedSlots: requestThreadSlotMapType,
	studentComment: string
): bookingRequestType => {
	const { requestThread } = existingBookingRequestObject;
	const { latestRequestKey, latestRequestMap } = getLastRequestObject(
		requestThread
	);

	const updatedSlotsObject: requestThreadSlotMapType = Object.keys(
		requestThread[latestRequestKey].slots
	).reduce((updatedSlots, slotKey) => {
		const { studentAccepted, deleted } = requestedSlots[slotKey];
		return {
			...updatedSlots,
			[slotKey]: {
				...latestRequestMap.slots[slotKey],
				studentAccepted,
				deleted,
			},
		};
	}, {});

	const newRequestThreadMapObject: requestThreadMapType = {
		...requestThread,
		[latestRequestKey]: {
			...latestRequestMap,
			studentComment,
			slots: updatedSlotsObject,
		},
	};

	return addModifiedTimeStamp<bookingRequestType>({
		...existingBookingRequestObject,
		status: BOOKING_REQUEST_STATUS_CODES.WAITING_FOR_TEACHER_CONFIRMATION,
		requestThread: newRequestThreadMapObject,
	});
};

const getData_RequestChangesByTeacher = (
	existingBookingRequestObject: bookingRequestType,
	requestedSlots: requestThreadSlotMapType,
	teacherComment: string
): bookingRequestType => {
	// need to create new slot
	const { requestThread } = existingBookingRequestObject;
	const newRequestThreadObject: requestThreadObjectType = addCreationTimeStamp<
		requestThreadObjectType
	>({
		teacherComment,
		studentComment: "",
		slots: requestedSlots,
	});
	const newRequestThreadMapObject: requestThreadMapType = {
		...requestThread,
		[new Date().getTime().toString()]: newRequestThreadObject,
	};
	return addModifiedTimeStamp<bookingRequestType>({
		...existingBookingRequestObject,
		status: BOOKING_REQUEST_STATUS_CODES.WAITING_FOR_STUDENT_CONFIRMATION,
		requestThread: newRequestThreadMapObject,
	});
};

// Method to get
const getData_RejectOrCancelBookingRequest = (
	existingBookingRequestObject: bookingRequestType,
	isStudent: Boolean
): bookingRequestType => {
	return addModifiedTimeStamp<bookingRequestType>({
		...existingBookingRequestObject,
		status: isStudent
			? BOOKING_REQUEST_STATUS_CODES.CANCELLED
			: BOOKING_REQUEST_STATUS_CODES.REJECTED,
	});
};

const getData_AcceptBookingRequestByStudent = (
	existingBookingRequestObject: bookingRequestType,
	requestedSlots: requestThreadSlotMapType,
	studentComment: string
): bookingRequestType => {
	const { requestThread } = existingBookingRequestObject;
	const { latestRequestKey, latestRequestMap } = getLastRequestObject(
		requestThread
	);
	const newRequestThreadObject: requestThreadMapType = {
		...requestThread,
		[latestRequestKey]: {
			...latestRequestMap,
			studentComment,
		},
	};

	return addModifiedTimeStamp<bookingRequestType>({
		...existingBookingRequestObject,
		status: BOOKING_REQUEST_STATUS_CODES.CONFIRMED, // would be changed when payment flow will be added
		requestThread: newRequestThreadObject,
	});
};

// Update Booking Request
export const updateBookingRequest = async (
	params: updateBookingRequestBodyType
): Promise<updateBookingRequestReturnType> => {
	const {
		bookingId,
		userId,
		updatedSlotRequests,
		teacherComment = "",
		studentComment = "",
		allChangesApprovedByStudent = false,
		bookingRejectedOrCancelled = false,
	} = params;

	const bookingRequestDocRef = bookingRequestCollection.doc(bookingId);
	return firestoreDB.runTransaction((transaction) => {
		return transaction
			.get(bookingRequestDocRef)
			.then((bookingRequestDoc) => {
				if (!bookingRequestDoc.exists) {
					console.log("Booking not exists");
					throw new Error("Booking does not Exists");
				}

				const bookingRequestData:
					| any
					| bookingRequestType = bookingRequestDoc.data();
				const { studentId, teacherId, status } = bookingRequestData;
				let newBookingRequestData: bookingRequestType = bookingRequestData;

				// Status checks ----------
				if (
					status === BOOKING_REQUEST_STATUS_CODES.ACCEPTED &&
					status >
						BOOKING_REQUEST_STATUS_CODES.WAITING_FOR_STUDENT_CONFIRMATION &&
					status < BOOKING_REQUEST_STATUS_CODES.CANCELLED
				) {
					// Already accepted
					throw new Error("Already accepted");
				} else if (
					status > BOOKING_REQUEST_STATUS_CODES.ACCEPTED &&
					status < BOOKING_REQUEST_STATUS_CODES.CONFIRMED
				) {
					// Already Rejected or cancelled
					throw new Error("Already Rejected or cancelled");
				} else if (status === BOOKING_REQUEST_STATUS_CODES.CONFIRMED) {
					// Already Confirmed
					throw new Error("Already Confirmed");
				}

				// Updated Checks ---------
				if (bookingRejectedOrCancelled) {
					// When Booking is rejected(teacher) or cancelled(student)
					newBookingRequestData = getData_RejectOrCancelBookingRequest(
						bookingRequestData,
						userId === studentId
					);
					transaction.update(bookingRequestDocRef, newBookingRequestData);
				} else if (userId === teacherId) {
					// teacher tying to update
					newBookingRequestData = getData_RequestChangesByTeacher(
						bookingRequestData,
						updatedSlotRequests,
						teacherComment
					);
					transaction.update(bookingRequestDocRef, newBookingRequestData);
				} else if (userId === studentId) {
					// student trying to update
					// check if its approved
					if (!allChangesApprovedByStudent) {
						// Student Not approved Request
						newBookingRequestData = getData_RequestChangesByStudent(
							bookingRequestData,
							updatedSlotRequests,
							studentComment
						);
						transaction.update(bookingRequestDocRef, newBookingRequestData);
						return;
					}
					// Student Approved Request
					// check all slots are studentAccepted or deleted
					// or return error
					newBookingRequestData = getData_AcceptBookingRequestByStudent(
						bookingRequestData,
						updatedSlotRequests,
						studentComment
					);
					transaction.update(bookingRequestDocRef, newBookingRequestData);
					return newBookingRequestData;
				} else {
					// wrong userID
					console.log("ERROR:// wrong userID ", userId, newBookingRequestData);
					throw new Error("Invalid userId or unable to find booking-request");
				}
				return newBookingRequestData;
			})
			.then((updatedBookingRequest) => ({ updatedBookingRequest }))
			.catch((err) => {
				console.log("Updated Booking Request Failed", err);
				throw new Error("Updated Booking Request Failed");
			});
	});
};
