import * as moment from "moment";
import * as admin from "firebase-admin";
import {
	userMetaCollection,
	firestoreDB,
	bookingRequestCollection,
	teacherCollection,
	userCollection,
	mailCollection,
	pendingTransfersRef,
} from "../db";
import {
	addModifiedTimeStamp,
	generateUniqueID,
	addCreationTimeStamp,
} from "../libs/generics";
import { userMetaSubCollectionKeys } from "../db/enum";
import {
	BOOKING_REQUEST_STATUS_CODES,
	EPICBOARD_SESSION_STATUS_CODES,
} from "../libs/status-codes";
import {
	SERVICE_CHARGE_PERCENTAGE_ON_BOOKING,
	SESSION_TYPES,
	StripeStatus,
	TCD_COMMISSION_PERCENTAGE_ON_BOOKING,
	TeacherPayoutStatus,
	UserTypes,
} from "../libs/constants";
import {
	acceptAndPayForBooking,
	addServiceChargeOnAmount,
	payoutToTutor,
	removeTCDCommissionOnAmount,
} from "../payments/methods";
import {
	bookingSuggestionStudent,
	bookingSuggestionTutor,
	sessionBookedStudent,
	sessionBookedTutor,
	sessionCancelledByStudentStudent,
	sessionCancelledByStudentTutor,
	sessionCancelledByTutorStudent,
	sessionCancelledByTutorTutor,
	sessionRequestedToTutor,
} from "../libs/email-template";
import { formatDate, DateFormats } from "../libs/date-utils";

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

	[studentId, teacherId].forEach((userId) => {
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
		teacherGroupSessionRate,
		studentStripeCardId,
		studentStripeCustomerId,
		subjects,
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
		subjects,
		initialRequest,
		requestThread,
		studentStripeCardId,
		studentStripeCustomerId,
	});

	// adding to booking-request collection
	await bookingRequestCollection.doc(bookingRequestId).set(bookingRequest);

	await mailCollection.add(
		sessionRequestedToTutor({ teacherId, teacherName, studentName })
	);

	console.log("teacher payout bookingRequestId", bookingRequestId);

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
		.where("status", "in", [
			BOOKING_REQUEST_STATUS_CODES.WAITING_FOR_STUDENT_CONFIRMATION,
			BOOKING_REQUEST_STATUS_CODES.WAITING_FOR_TEACHER_CONFIRMATION,
			BOOKING_REQUEST_STATUS_CODES.PAYMENT_PROCESSING,
			BOOKING_REQUEST_STATUS_CODES.PAYMENT_FAILED,
		])
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

	console.log("bookingId", bookingId);

	const ifAnySlotsAreBackDated = checkIfAnySlotsAreBackDated(
		updatedSlotRequests
	);

	if (ifAnySlotsAreBackDated && allChangesApprovedByStudent) {
		throw new Error(
			"Unable to Create approved session: Session times should at-least have a buffer of 30 minutes"
		);
	}

	const bookingRequestDocRef = bookingRequestCollection.doc(bookingId);
	return firestoreDB.runTransaction((transaction) => {
		return transaction
			.get(bookingRequestDocRef)
			.then(async (bookingRequestDoc) => {
				if (!bookingRequestDoc.exists) {
					console.log("Booking not exists");
					throw new Error("Booking does not Exists");
				}

				const bookingRequestData:
					| any
					| bookingRequestType = bookingRequestDoc.data();
				const {
					studentId,
					teacherId,
					status,
					teacherName,
					studentName,
					subjects,
				} = bookingRequestData;
				let newBookingRequestData: bookingRequestType = bookingRequestData;

				if (
					ifAnySlotsAreBackDated &&
					!bookingRejectedOrCancelled &&
					userId === teacherId
				) {
					throw new Error(
						"Unable to Create approved session: Session times should at-least have a buffer of 30 minutes"
					);
				}

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
					status === BOOKING_REQUEST_STATUS_CODES.CANCELLED ||
					status === BOOKING_REQUEST_STATUS_CODES.REJECTED
				) {
					// Already Rejected or cancelled
					throw new Error("Already Rejected or cancelled");
				} else if (status === BOOKING_REQUEST_STATUS_CODES.CONFIRMED) {
					// Already Confirmed
					throw new Error("Already Confirmed");
				} else if (status === BOOKING_REQUEST_STATUS_CODES.PAYMENT_PROCESSING) {
					// payment processing
					throw new Error(
						"Your payment is in process. Booking will be confirm once approved"
					);
				}

				// Updated Checks ---------
				if (bookingRejectedOrCancelled) {
					// When Booking is rejected(teacher) or cancelled(student)
					newBookingRequestData = getData_RejectOrCancelBookingRequest(
						bookingRequestData,
						userId === studentId
					);
					transaction.update(bookingRequestDocRef, newBookingRequestData);
					const mailParams = {
						teacherName,
						studentName,
					};
					if (userId === studentId) {
						await mailCollection.add(
							sessionCancelledByStudentStudent({
								userId: studentId,
								...mailParams,
							})
						); // Send cancellation mail  to student
						await mailCollection.add(
							sessionCancelledByStudentTutor({
								userId: teacherId,
								...mailParams,
							})
						); // Send cancellation mail to teacher
					} else {
						await mailCollection.add(
							sessionCancelledByTutorStudent({
								userId: studentId,
								...mailParams,
							})
						); // Send rejection mail to student
						await mailCollection.add(
							sessionCancelledByTutorTutor({
								userId: teacherId,
								...mailParams,
							})
						); // Send rejection mail to teacher
					}
				} else if (userId === teacherId) {
					// teacher tying to update
					newBookingRequestData = getData_RequestChangesByTeacher(
						bookingRequestData,
						updatedSlotRequests,
						teacherComment
					);
					transaction.update(bookingRequestDocRef, newBookingRequestData);
					await mailCollection.add(
						bookingSuggestionStudent({
							userId: studentId,
							studentName,
							teacherName,
						})
					);
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
						await mailCollection.add(
							bookingSuggestionTutor({
								userId: teacherId,
								studentName,
								teacherName,
							})
						);
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
					if (allChangesApprovedByStudent) {
						const sessionString = getConfirmedSessionString(
							newBookingRequestData.requestThread
						);
						const subjectString = subjects.join(",");
						const [stripeStatus, client_secret] = await acceptAndPayForBooking({
							...newBookingRequestData,
							sessionString,
							subjectString,
						});

						if (stripeStatus === StripeStatus.PAYMENT_SUCCESS) {
							transaction.update(bookingRequestDocRef, newBookingRequestData);
							return newBookingRequestData;
						} else if (stripeStatus === StripeStatus.REQUIRES_ACTION) {
							const requireActionResponse = {
								...newBookingRequestData,
								status: BOOKING_REQUEST_STATUS_CODES.PAYMENT_PROCESSING,
								stripeClientSecret: client_secret,
							};
							transaction.update(bookingRequestDocRef, requireActionResponse);
							return requireActionResponse;
						} else {
							throw {
								name: "PaymentError",
								message: client_secret,
							};
						}
					}
				} else {
					// wrong userID
					console.log("ERROR:// wrong userID ", userId, newBookingRequestData);
					throw new Error("Invalid userId or unable to find booking-request");
				}
				return newBookingRequestData;
			})
			.then((updatedBookingRequest) => ({ updatedBookingRequest }));
	});
};

const getLatestRequest = (requestThread: any) => {
	const latestKey = Math.max(
		...Object.keys(requestThread).map((r) => parseFloat(r))
	);
	return requestThread[latestKey] || { slots: {} };
};

export const groupSessionsByStudent = (sessions: Array<any>) => {
	const groupedSessionObject = {};
	sessions.forEach((session) => {
		const { studentId, startTime } = session;

		if (!groupedSessionObject[studentId]) {
			groupedSessionObject[studentId] = session;
		} else {
			const prevStartTime = groupedSessionObject[studentId].startTime;
			const isThisBefore = moment(startTime).isBefore(prevStartTime);
			const isThisAfter = moment(startTime).isAfter(prevStartTime);
			const isUpcoming = moment().isBefore(startTime);
			if (
				(isUpcoming && isThisBefore) ||
				(!isUpcoming && isThisAfter) ||
				(isUpcoming && isThisAfter)
			) {
				groupedSessionObject[studentId] = session;
			}
		}
	});

	const groupedSessions: any = Object.values(groupedSessionObject).sort(
		(a: any, b: any) => {
			const asTime: any = new Date(a.startTime);
			const bsTime: any = new Date(b.startTime);
			return asTime - bsTime;
		}
	);

	return groupedSessions;
};

export const addHoursTutorMeta = async (booking: any) => {
	const { requestThread, teacherId } = booking;
	const latestRequest = getLatestRequest(requestThread);
	const totalSessionLength = Object.values(latestRequest.slots).reduce(
		(total, curr: any) => total + curr.sessionLength,
		0
	);

	const userMetaSnap = await userMetaCollection.doc(teacherId).get();
	const userMeta: any = userMetaSnap.data();
	const { minutesTutoring } = userMeta;
	const newMinutes = minutesTutoring + totalSessionLength;
	await userMetaCollection
		.doc(teacherId)
		.update({ minutesTutoring: newMinutes });
};

export const updateConnectedPeople = async (
	booking: any,
	approvedSessions: any
) => {
	const { studentId, teacherId } = booking;

	// Update connected people for student side
	const teacherSnap = await teacherCollection.doc(teacherId).get();
	const teacherUserSnap = await userCollection.doc(teacherId).get();
	const teacherData: any = teacherSnap.data();
	const teacherUserData: any = teacherUserSnap.data();
	const { teacherType } = teacherData;
	const {
		firstName: teacherFirstName,
		lastName: teacherLastName,
		profilePic: teacherProfilePic,
		email: teacherEmail,
	} = teacherUserData;

	await userMetaCollection
		.doc(studentId)
		.collection(userMetaSubCollectionKeys.CONNECTED_PEOPLE)
		.doc(teacherId)
		.set(
			{
				type: teacherType,
				firstName: teacherFirstName,
				lastName: teacherLastName,
				profilePic: teacherProfilePic,
				userId: teacherId,
				email: teacherEmail,
				sessions: admin.firestore.FieldValue.arrayUnion(...approvedSessions),
			},
			{ merge: true }
		);

	// Update connected people for tutor side
	const studentUserSnap = await userCollection.doc(studentId).get();
	const studentUserData: any = studentUserSnap.data();
	const {
		firstName: studentFirstName,
		lastName: studentLastName,
		profilePic: studentProfilePic,
		email: studentEmail,
	} = studentUserData;

	await userMetaCollection
		.doc(teacherId)
		.collection(userMetaSubCollectionKeys.CONNECTED_PEOPLE)
		.doc(studentId)
		.set(
			{
				type: UserTypes.STUDENT,
				firstName: studentFirstName,
				lastName: studentLastName,
				profilePic: studentProfilePic,
				userId: studentId,
				email: studentEmail,
				sessions: admin.firestore.FieldValue.arrayUnion(...approvedSessions),
			},
			{ merge: true }
		);
};

// Return count of pending requests
export const teacherPendingBookingRequestCount = async (
	params: getAllBookingsForUserParams
): Promise<teacherPendingBookingRequestCountReturnType> => {
	const { userId } = params;

	const pendingBookingsSnapshot = await userMetaCollection
		.doc(userId)
		.collection(userMetaSubCollectionKeys.BOOKING_REQUEST)
		.where(
			"status",
			"==",
			BOOKING_REQUEST_STATUS_CODES.WAITING_FOR_TEACHER_CONFIRMATION
		)
		.get();

	const pendingRequestCount = pendingBookingsSnapshot.docs.length;

	return {
		count: pendingRequestCount,
		students: [],
	};
};

const checkIfAnySlotsAreBackDated = (slots) => {
	const checkDate = Object.values(slots).reduce((acc, curr: any) => {
		const dateInPast = moment(curr.suggestedDateTime).isBefore(
			moment().add(1, "minutes")
		);
		return dateInPast || acc;
	}, false);
	return checkDate;
};

export const confirmBooking = async (params: any) => {
	const {
		bookingId,
		studentId,
		teacherId,
		teacherName,
		studentName,
		sessionString,
		subjectString,
		totalAmount,
		totalSessionCost,
		teacherPayoutAmount,
		totalSessionLength,
		serviceChargePercentage,
		tcdCommissionPercentage,
	} = params;

	const bookingUpdated = await bookingRequestCollection.doc(bookingId).update({
		status: BOOKING_REQUEST_STATUS_CODES.CONFIRMED,
		totalSessionLength,
		totalAmount,
		totalSessionCost,
		teacherPayoutAmount,
		serviceChargePercentage,
		tcdCommissionPercentage,
		teacherPayoutStatus: TeacherPayoutStatus.REQUESTED,
	});

	const mailParams = {
		teacherName,
		studentName,
		subjects: subjectString,
		sessions: sessionString,
	};

	const mailToStudent = await mailCollection.add(
		sessionBookedStudent({ userId: studentId, ...mailParams })
	); // confirmation mail to student
	const mailToTutor = await mailCollection.add(
		sessionBookedTutor({ userId: teacherId, ...mailParams })
	); // confirmation mail to teacher

	return Promise.resolve([bookingUpdated, mailToStudent, mailToTutor]);
};

export const updateFailPaymentResponse = (bookingId: string) => {
	return bookingRequestCollection.doc(bookingId).update({
		status: BOOKING_REQUEST_STATUS_CODES.PAYMENT_FAILED,
	});
};

const getConfirmedSessionString = (requestThread) => {
	const { latestRequestMap } = getLastRequestObject(requestThread);
	const allRequestSlots = latestRequestMap.slots;
	const sessionString = Object.keys(latestRequestMap.slots)
		.filter(
			(slotKey) =>
				!allRequestSlots[slotKey].deleted &&
				!allRequestSlots[slotKey].studentAccepted
		)
		.reduce(
			(str, approvedSlotKey) =>
				`${str}${formatDate(
					allRequestSlots[approvedSlotKey].suggestedDateTime,
					DateFormats.SEMILONG_DATE
				)},`,
			""
		);

	return sessionString;
};

export const addSessionsKeyOnBookingCollection = async (
	bookingId: string,
	sessions: Array<any>
) => {
	const fieldValue = sessions.reduce(
		(acc, sess) => ({
			...acc,
			[sess.sessionId]: {
				status: EPICBOARD_SESSION_STATUS_CODES.CREATED,
			},
		}),
		{}
	);

	await bookingRequestCollection.doc(bookingId).update({
		sessions: fieldValue,
	});
};

export const isAllSessionsAreCompleted = (sessions: any) => {
	if (sessions) {
		return Object.values(sessions).reduce((acc, sess: any) => {
			const completed = sess.status === EPICBOARD_SESSION_STATUS_CODES.ENDED;
			return acc && completed;
		}, true);
	}
	return false;
};

export const addTutorTransferRequestForBooking = async (booking) => {
	const {
		sessions,
		teacherPayoutAmount,
		teacherId,
		teacherHourlyRate,
		teacherGroupSessionRate,
		requestThread,
		sessionType,
		id: bookingId,
	} = booking;

	let payoutAmount: any;
	let bookingUpdateParams: any = {};

	if (!teacherPayoutAmount) {
		const { latestRequestMap } = getLastRequestObject(requestThread);

		const allRequestSlots = latestRequestMap.slots;
		const totalSessionLength = Object.keys(latestRequestMap.slots)
			.filter(
				(slotKey) =>
					!allRequestSlots[slotKey].deleted &&
					!allRequestSlots[slotKey].studentAccepted
			)
			.reduce(
				(total, approvedSlotKey) =>
					total + allRequestSlots[approvedSlotKey].sessionLength,
				0
			);
		const rate =
			sessionType === SESSION_TYPES.SINGLE
				? teacherHourlyRate
				: teacherGroupSessionRate;

		const totalAmount = (rate / 60) * totalSessionLength;

		const totalSessionCost = addServiceChargeOnAmount(totalAmount);

		payoutAmount = removeTCDCommissionOnAmount(totalAmount);

		bookingUpdateParams = {
			totalSessionLength,
			totalAmount,
			totalSessionCost,
			teacherPayoutAmount: payoutAmount,
			serviceChargePercentage: SERVICE_CHARGE_PERCENTAGE_ON_BOOKING,
			tcdCommissionPercentage: TCD_COMMISSION_PERCENTAGE_ON_BOOKING,
			teacherPayoutStatus: TeacherPayoutStatus.REQUESTED,
		};
	}

	console.log("addTutorTransferRequestForBooking-payoutAmount", payoutAmount);

	if (isAllSessionsAreCompleted(sessions)) {
		await pendingTransfersRef().child(booking.id).set({
			id: booking.id,
			teacherPayoutAmount: payoutAmount,
			teacherId,
			teacherPayoutStatus: TeacherPayoutStatus.INITIATED,
		});

		bookingUpdateParams["teacherPayoutStatus"] = TeacherPayoutStatus.INITIATED;
	}

	if (bookingUpdateParams.teacherPayoutStatus) {
		await bookingRequestCollection.doc(bookingId).update(bookingUpdateParams);
	}
};

export const payTutorBookingAmount = async () => {
	const pendingTransfersSnap = await pendingTransfersRef().once("value");
	const pendingTransfers = pendingTransfersSnap.val();

	if (pendingTransfers) {
		const done = await Promise.all(
			Object.values(pendingTransfers).map(async (booking: any) => {
				const {
					id,
					teacherPayoutAmount,
					teacherId,
					status = TeacherPayoutStatus.INITIATED,
				} = booking;

				if (status === TeacherPayoutStatus.PROCESSING) {
					return true;
				}

				const teacherSnap: any = await userMetaCollection.doc(teacherId).get();

				const { stripePayoutAccount = {} } = teacherSnap.data();

				if (stripePayoutAccount.accountId) {
					try {
						const transfer = await payoutToTutor({
							amount: teacherPayoutAmount.toFixed(2),
							accountId: stripePayoutAccount.accountId,
							bookingId: id,
						});

						if (transfer.id) {
							await bookingRequestCollection.doc(id).update({
								teacherPayoutStatus: TeacherPayoutStatus.PROCESSING,
								stripeTransferObject: transfer,
							});
							await pendingTransfersRef()
								.child(id)
								.update({ status: TeacherPayoutStatus.PROCESSING });
						}
					} catch (err) {
						console.log("err", JSON.stringify(err));
						await pendingTransfersRef()
							.child(id)
							.update({
								error: err.raw ? err.raw.message : "unknown",
								status: TeacherPayoutStatus.FAILED,
							});
						await bookingRequestCollection
							.doc(id)
							.update({ teacherPayoutStatus: TeacherPayoutStatus.FAILED });
						return false;
					}

					return true;
				} else {
					return false;
				}
			})
		);

		return done;
	}
	return true;
};

export const updateBookingPayoutStatus = async (
	bookingId: string,
	params: any
) => {
	await bookingRequestCollection.doc(bookingId).update(params);

	if (params.teacherPayoutStatus === TeacherPayoutStatus.PAID) {
		await pendingTransfersRef().child(bookingId).remove();
	} else {
		await pendingTransfersRef()
			.child(bookingId)
			.update({ status: params.teacherPayoutStatus });
	}
};
