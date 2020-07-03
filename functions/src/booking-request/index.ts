import * as functions from "firebase-functions";
import {
	addCreationTimeStamp,
	pushAsSuccessResponse,
	// pushAsErrorResponse
} from "../libs/generics";
import {
	userMetaSubCollectionKeys,
	firestoreCollectionKeys,
	SESSION_TYPES,
} from "../libs/constants";
import { BOOKING_REQUEST_STATUS_CODES } from "../libs/status-codes";
import { bookingRequestCollection, userEventCollection } from "../db";

// type createBookingRequestDataType = {
//     teacherId: string,
//     studentId: string,
//     teacherName: string,
//     studentName: string,
//     teacherHourlyRate: Number,
//     teacherGroupSessionRate: Number,
//     totalSessionLength: Number,
//     sessionRequests: {
//         date: string,
//         selectedLength: Number,
//         selectedBreak: String
//     }[],
// }

export const handleCreateBookingRequest = functions.https.onRequest(
	async (request: any, response: any) => {
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
			teacherGroupSessionRate,
		} = request.body;
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

		const requestThread = {
			[new Date().getTime().toString()]: addCreationTimeStamp({
				teacherComment: "",
				studentComment: "",
				slots: Object.keys(initialRequest).reduce((slotsObj, newKey) => {
					return {
						...slotsObj,
						[newKey]: {
							sessionLength: initialRequest[newKey].sessionLength,
							suggestedDateTime: "",
							studentAccepted: false,
							deleted: false,
						},
					};
				}, {}),
			}),
		};
		const bookingRequest = addCreationTimeStamp({
			status: BOOKING_REQUEST_STATUS_CODES.WAITING_FOR_TEACHER_CONFIRMATION,
			teacherId,
			teacherName,
			studentId,
			studentName,
			teacherHourlyRate,
			teacherGroupSessionRate,
			totalSessionLength,
			sessionType: SESSION_TYPES.SINGLE,
			subjects: [],
			initialRequest,
			requestThread,
		});

		// adding to booking-request collection
		const bookingRequestResponse = await bookingRequestCollection.add(
			bookingRequest
		);

		response.status(200).json(
			pushAsSuccessResponse("New Booking Created", {
				id: bookingRequestResponse.id,
				...bookingRequest,
			})
		);
	}
);

// Fetch Functions Booking Request for user
const getAllBookingForUser = async (userId: string) => {
	const userBookingsSnapshot = await userEventCollection
		.doc(userId)
		.collection(userMetaSubCollectionKeys.BOOKING_REQUESTS)
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
	return Promise.all(allBookingData);
};

export const handleGetUserBookingRequest = functions.https.onRequest(
	async (request: any, response: any) => {
		// fetch all docs from user-events/<userId>/booking-requests
		// Can query on this Collection as per the status
		const { userId } = request.body;
		getAllBookingForUser(userId)
			.then((data) => {
				response
					.status(200)
					.json(pushAsSuccessResponse("Bookings Found", data));
			})
			.catch((err) => {
				response
					.status(200)
					.json(pushAsSuccessResponse("Bookings NOT Found", err));
			});
	}
);

// Fetch Single Booking by id
export const handleGetBookingById = functions.https.onRequest(
	async (request: any, response: any) => {
		const { id } = request.body;
		return bookingRequestCollection
			.doc(id)
			.get()
			.then((data) => {
				response
					.status(200)
					.json(pushAsSuccessResponse("Found Booking", { ...data.data() }));
			})
			.catch((err) => {
				response
					.status(200)
					.json(pushAsSuccessResponse("NOT Found Booking", { error: err }));
			});
	}
);

// Update Booking Request
export const handleUpdateBookingRequest = functions.https.onRequest(
	async (request: any, response: any) => {
		// Update Booking request
	}
);

type updateBookingRequestsDataType = {};
export const updateUserBookingRequest = (
	data: updateBookingRequestsDataType
) => {
	// get user type
	// add new comments or updated times.
	// Senario to accept the request
	// Create a SESSION of the request
	// senario to reject the request
	// get Type of user
	// tutor can only change time
};

// Booking Request OnCreate Trigger - (triggers when student created a booking request)
export const triggerOnCreateBookingRequest = functions.firestore
	.document(`${firestoreCollectionKeys.BOOKING_REQUEST}/{bookingRequestId}`)
	.onCreate(async (bookingRequestSnap, context) => {
		const { bookingRequestId } = context.params;
		const bookingRequestData: any = bookingRequestSnap.data();
		const { studentId, teacherId } = bookingRequestData;

		console.log("Triggered Booking Data", bookingRequestData);

		// Need to added to Firestore Trigger onCreate

		// add  this id to user-event collections user data for both teacher & student
		// node =>  user-data><studentId/teacherId>/booking-request
		// booking-request: { "requestId": Status }

		// Student
		await userEventCollection
			.doc(studentId)
			.collection(userMetaSubCollectionKeys.BOOKING_REQUESTS)
			.doc(bookingRequestId)
			.set(
				{
					id: bookingRequestId,
					status: BOOKING_REQUEST_STATUS_CODES.WAITING_FOR_TEACHER_CONFIRMATION,
				},
				{ merge: true }
			);

		// Teacher
		await userEventCollection
			.doc(teacherId)
			.collection(userMetaSubCollectionKeys.BOOKING_REQUESTS)
			.doc(bookingRequestId)
			.set(
				{
					id: bookingRequestId,
					status: BOOKING_REQUEST_STATUS_CODES.WAITING_FOR_TEACHER_CONFIRMATION,
				},
				{ merge: true }
			);
	});

//

export const triggerOnUpdateBookingRequest = functions.firestore
	.document(`${firestoreCollectionKeys.BOOKING_REQUEST}/{bookingRequestId}`)
	.onUpdate(async (bookingRequestSnap, context) => {
		// const { bookingRequestId } = context.params;
		// const bookingRequestData: any = bookingRequestSnap.data();
		// const { studentId, teacherId } = bookingRequestData;
	});
