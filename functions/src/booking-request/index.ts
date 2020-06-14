import * as functions from "firebase-functions";
import { bookingRequestCollection, userEventCollection, firestoreDB } from "../db";
import {
    addCreationTimeStamp,
    pushAsSuccessResponse,
    addModifiedTimeStamp,
    generateUniqueID,
    // pushAsErrorResponse
} from "../libs/generics";
import {
	userMetaSubCollectionKeys,
	firestoreCollectionKeys,
	SESSION_TYPES,
} from "../libs/constants";
import { BOOKING_REQUEST_STATUS_CODES } from "../libs/status-codes";
import { createEpicboardSession } from '../epicboard-sessions';

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

export type createdAndModifiedTimeStampTypes = {
    creationTime: string,
    modifiedTime: string,
}

type requestThreadSlotType = {
    sessionLength: Number
    suggestedDateTime: String,
    studentAccepted: Boolean,
    deleted: Boolean
}

export type requestThreadSlotMapType = {
    [key: string]: requestThreadSlotType,
}

type requestThreadObjectType = {
    teacherComment: string,
    studentComment: string,
    slots: requestThreadSlotMapType,
} & createdAndModifiedTimeStampTypes

export type requestThreadMapType = {
    [key: string]: requestThreadObjectType
}

type initialRequestSlotType = {
    [key: string]: {
        selectedBreak: string,
        sessionLength: number,
        date: string
    }
}

export type bookingRequestType = {
    id: string,
    status: Number,
    teacherId: string,
    teacherName: string,
    studentId: string,
    studentName: string,
    sessionType: string,
    totalSessionLength: Number,
    teacherGroupSessionRate: Number,
    teacherHourlyRate: Number,
    subjects: string[],
    initialRequest: initialRequestSlotType,
    requestThread: requestThreadMapType,
} & createdAndModifiedTimeStampTypes



type updateBookingRequestBodyType = {
    bookingId: string,
    userId: string,
    updatedSlotRequests: requestThreadSlotMapType,
    studentComment: string,
    teacherComment: string,
    allChangesApprovedByStudent: boolean,
    bookingRejectedOrCancelled: boolean,
}


export const handleCreateBookingRequest = functions.https.onRequest(async (request: any, response: any) => {
    // add new request to booking request collection 
    // add the id to user's booking request array

    const { teacherId, studentId, teacherName, studentName, teacherHourlyRate, totalSessionLength, sessionRequests, teacherGroupSessionRate } = request.body;
    const initialRequest = sessionRequests.reduce((newSlotRequest: any, newItem: any) => ({
        ...newSlotRequest,
        [`${newItem.date}-${newItem.selectedBreak}`]: {
            selectedBreak: newItem.selectedBreak,
            sessionLength: newItem.selectedLength,
            date: newItem.date
        },
    }), {});

    const requestThread: requestThreadMapType = {
        [new Date().getTime().toString()]: addCreationTimeStamp<requestThreadObjectType>({
            teacherComment: "",
            studentComment: "",
            slots: Object.keys(initialRequest).reduce((slotsObj, newKey) => {
                return {
                    ...slotsObj,
                    [newKey]: {
                        sessionLength: initialRequest[newKey].sessionLength,
                        suggestedDateTime: "",
                        studentAccepted: false,
                        deleted: false
                    }
                }
            }, {})

        })
    };
    const bookingRequestId = generateUniqueID()
    const bookingRequest: bookingRequestType = addCreationTimeStamp<bookingRequestType>({
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
        subjects: [],
        initialRequest,
        requestThread,

    });

    // adding to booking-request collection
    await bookingRequestCollection.doc(bookingRequestId).set(bookingRequest);

    response.status(200).json(
        pushAsSuccessResponse("New Booking Created", {
            // id: bookingRequestResponse.id,
            ...bookingRequest,
        })

    );
})

// Fetch Functions Booking Request for user
const getAllBookingForUser = async (userId: string) => {
    const userBookingsSnapshot = await userEventCollection
        .doc(userId)
        .collection(userMetaSubCollectionKeys.BOOKING_REQUEST)
        .get();
    const allBookingData = userBookingsSnapshot.docs.map(async bookingRequestDoc => {
        const bookingRequestData = bookingRequestDoc.data();
        return bookingRequestCollection.
            doc(bookingRequestData.id)
            .get()
            .then(data => ({ id: bookingRequestData.id, ...data.data() }));
    })
    return Promise.all(allBookingData);
};

export const handleGetUserBookingRequest = functions.https.onRequest(async (request: any, response: any) => {
    // fetch all docs from user-meta/<userId>/booking-requests
    // Can query on this Collection as per the status
    const { userId } = request.body;
    getAllBookingForUser(userId)
        .then(data => {
            response.status(200).json(
                pushAsSuccessResponse("Bookings Found", data)
            );
        })
        .catch(err => {
            response.status(200).json(
                pushAsSuccessResponse("Bookings NOT Found", err)
            );
        })

});

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

// Method to get Latest Request Object From request Thread
export const getLastRequestObject = (
    requestThreadSlotsObject: requestThreadMapType): {
        latestRequestKey: string,
        latestRequestMap: requestThreadObjectType
    } => {
    const latestTimeStamp = Object.keys(requestThreadSlotsObject).sort((a: any, b: any) => (b - a))[0];
    return {
        latestRequestKey: latestTimeStamp,
        latestRequestMap: requestThreadSlotsObject[latestTimeStamp]
    };
}


// Method to get 
const getData_RejectOrCancelBookingRequest = (
    existingBookingRequestObject: bookingRequestType,
    isStudent: Boolean,

): bookingRequestType => {
    return addModifiedTimeStamp<bookingRequestType>({
        ...existingBookingRequestObject,
        status: isStudent ?
            BOOKING_REQUEST_STATUS_CODES.CANCELLED :
            BOOKING_REQUEST_STATUS_CODES.REJECTED
    })
};

const getData_AcceptBookingRequestByStudent = (
    existingBookingRequestObject: bookingRequestType,
    requestedSlots: requestThreadSlotMapType,
    studentComment: string,
): bookingRequestType => {

    const { requestThread } = existingBookingRequestObject;
    const { latestRequestKey, latestRequestMap } = getLastRequestObject(requestThread);
    const newRequestThreadObject: requestThreadMapType = addModifiedTimeStamp<requestThreadMapType>({
        ...requestThread,
        [latestRequestKey]: {
            ...latestRequestMap,
            studentComment,
        }
    });


    return addModifiedTimeStamp<bookingRequestType>({
        ...existingBookingRequestObject,
        status: BOOKING_REQUEST_STATUS_CODES.CONFIRMED, // would be changed when payment flow will be added
        requestThread: newRequestThreadObject
    })
};

const getData_RequestChangesByStudent = (
    existingBookingRequestObject: bookingRequestType,
    requestedSlots: requestThreadSlotMapType,
    studentComment: string): bookingRequestType => {

    const { requestThread } = existingBookingRequestObject;
    const { latestRequestKey, latestRequestMap } = getLastRequestObject(requestThread);

    const updatedSlotsObject: requestThreadSlotMapType = Object.keys(requestThread[latestRequestKey].slots).reduce((updatedSlots, slotKey) => {
        const { studentAccepted, deleted } = requestedSlots[slotKey];
        return {
            ...updatedSlots,
            [slotKey]: {
                ...latestRequestMap.slots[slotKey],
                studentAccepted,
                deleted
            }
        }
    }, {});

    const newRequestThreadMapObject: requestThreadMapType = addModifiedTimeStamp<requestThreadMapType>({
        ...requestThread,
        [latestRequestKey]: {
            ...latestRequestMap,
            studentComment,
            slots: updatedSlotsObject,
        }
    });

    return addModifiedTimeStamp<bookingRequestType>({
        ...existingBookingRequestObject,
        status: BOOKING_REQUEST_STATUS_CODES.WAITING_FOR_TEACHER_CONFIRMATION,
        requestThread: newRequestThreadMapObject
    });
};

const getData_RequestChangesByTeacher = (
    existingBookingRequestObject: bookingRequestType,
    requestedSlots: requestThreadSlotMapType,
    teacherComment: string): bookingRequestType => {
    // need to create new slot
    const { requestThread } = existingBookingRequestObject;
    const newRequestThreadObject: requestThreadObjectType = addCreationTimeStamp<requestThreadObjectType>({
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

// Update Booking Request
export const handleUpdateBookingRequest = functions.https.onRequest(async (
    request: { body: updateBookingRequestBodyType },
    response: any) => {

    const {
        bookingId,
        userId,
        updatedSlotRequests,
        teacherComment = "",
        studentComment = "",
        allChangesApprovedByStudent = false,
        bookingRejectedOrCancelled = false } = request.body;

    const bookingRequestDocRef = bookingRequestCollection.doc(bookingId);
    return firestoreDB
        .runTransaction(transaction => {
            return transaction
                .get(bookingRequestDocRef)
                .then(bookingRequestDoc => {
                    if (!bookingRequestDoc.exists) {
                        console.log("Booking not exists");
                        throw new Error("Booking does not Exists");
                    }

                    const bookingRequestData: any | bookingRequestType = bookingRequestDoc.data();
                    const { studentId, teacherId, status } = bookingRequestData;
                    let newBookingRequestData: bookingRequestType = bookingRequestData;

                    // Status checks ----------
                    if (status === BOOKING_REQUEST_STATUS_CODES.ACCEPTED
                        && status > BOOKING_REQUEST_STATUS_CODES.WAITING_FOR_STUDENT_CONFIRMATION
                        && status < BOOKING_REQUEST_STATUS_CODES.CANCELLED) {
                        // Already accepted
                        throw new Error("Already accepted")

                    } else if (status > BOOKING_REQUEST_STATUS_CODES.ACCEPTED
                        && status < BOOKING_REQUEST_STATUS_CODES.CONFIRMED) {
                        // Already Rejected or cancelled
                        throw new Error("Already Rejected or cancelled")

                    } else if (status === BOOKING_REQUEST_STATUS_CODES.CONFIRMED) {
                        // Already Confirmed 
                        throw new Error("Already Confirmed")
                    }

                    // Updated Checks ---------
                    if (bookingRejectedOrCancelled) {
                        // When Booking is rejected(teacher) or cancelled(student)
                        newBookingRequestData = getData_RejectOrCancelBookingRequest(bookingRequestData, userId === studentId);
                        transaction.update(bookingRequestDocRef, newBookingRequestData);
                    }
                    else if (userId === teacherId) {
                        // teacher tying to update
                        newBookingRequestData = getData_RequestChangesByTeacher(bookingRequestData, updatedSlotRequests, teacherComment)
                        transaction.update(bookingRequestDocRef, newBookingRequestData)
                    }
                    else if (userId === studentId) {
                        // student trying to update
                        // check if its approved
                        if (!allChangesApprovedByStudent) {
                            // Student Not approved Request
                            newBookingRequestData = getData_RequestChangesByStudent(bookingRequestData, updatedSlotRequests, studentComment)
                            transaction.update(bookingRequestDocRef, newBookingRequestData)
                            return;
                        }
                        // Student Approved Request
                        // check all slots are studentAccepted or deleted 
                        // or return error                  
                        newBookingRequestData = getData_AcceptBookingRequestByStudent(bookingRequestData, updatedSlotRequests, studentComment)
                        transaction.update(bookingRequestDocRef, newBookingRequestData);
                        return newBookingRequestData;
                    }
                    else {
                        // wrong userID
                        console.log("ERROR:// wrong userID ", userId, newBookingRequestData)
                        throw new Error("Invalid userId or unable to find booking-request")
                    }
                    return newBookingRequestData;
                })
                .then(updatedBookingRequest => {
                    console.log("Updated Booking Request Success", updatedBookingRequest);
                    response.status(200).json(
                        pushAsSuccessResponse("Updated Booking Request Success", updatedBookingRequest || {})
                    );
                }).catch(err => {
                    console.log("Updated Booking Request Failed", err);
                    response.status(200).json(
                        pushAsSuccessResponse("Updated Booking Request Failed", { error: err })
                    );
                })
        })

});

type bookingRequestUserMetaType = {
    id: string,
    status: Number,
    confirmedSessions?: string[],
    confirmedRooms?: string[]
} & createdAndModifiedTimeStampTypes

// Updates user-meta/<userId>/<bookingId>/doc -> status, modifiedTime
// Can be used for both onCreate and onUpdate
export const updateBookingRequestStatus = async (
    bookingRequestId: string,
    bookingRequestData: bookingRequestType,
    extraData: Object = {}) => {
    const { studentId, teacherId, status, creationTime } = bookingRequestData;
    // add  this id to user-event collections user data for both teacher & student
    // node =>  user-data><studentId/teacherId>/booking-request
    let batchWrite = firestoreDB.batch();
    const bookingRequestObject: bookingRequestUserMetaType = addModifiedTimeStamp<bookingRequestUserMetaType>({
        id: bookingRequestId,
        status,
        creationTime,
        ...extraData,
    });

    [studentId, teacherId].map(userId => {
        batchWrite.set(userEventCollection
            .doc(userId)
            .collection(userMetaSubCollectionKeys.BOOKING_REQUEST)
            .doc(bookingRequestId),
            bookingRequestObject,
            { merge: true }
        )
    });
    await batchWrite.commit();
}


// Booking Request OnCreate Trigger - (triggers when student created a booking request)
export const triggerOnCreateBookingRequest = functions
    .firestore
    .document(`${firestoreCollectionKeys.BOOKING_REQUESTS}/{bookingRequestId}`)
    .onCreate(async (bookingRequestSnap, context) => {
        const { bookingRequestId } = context.params;
        const bookingRequestData: any = bookingRequestSnap.data();
        console.log("Triggered onCreate Booking Data", bookingRequestData)
        await updateBookingRequestStatus(bookingRequestId, bookingRequestData);
    });


// Booking Request OnCreate Trigger - (triggers when student created a booking request)
export const triggerOnUpdateBookingRequest = functions
    .firestore
    .document(`${firestoreCollectionKeys.BOOKING_REQUESTS}/{bookingRequestId}`)
    .onUpdate(async (bookingRequestChangeSnap, context) => {
        const { bookingRequestId} = context.params;
        const bookingRequestBeforeData: bookingRequestType | any = bookingRequestChangeSnap.before.data();
        const bookingRequestAfterData: bookingRequestType | any = bookingRequestChangeSnap.after.data();
        console.log("Triggered onUpdate Booking Data", bookingRequestAfterData)

        // When Approved the session details need to be added to the collection.


        // check if the before and after status to trigger session and room creation
        if (bookingRequestAfterData.status === BOOKING_REQUEST_STATUS_CODES.CONFIRMED
            && bookingRequestBeforeData.status !== BOOKING_REQUEST_STATUS_CODES.CONFIRMED) {
            // Trigger new Session and new room from here 
            await createEpicboardSession(bookingRequestAfterData, bookingRequestId);
            // create session data for booking request Updated
            // list of session ids
        }
        // add session 
        await updateBookingRequestStatus(bookingRequestId, bookingRequestAfterData);
    });
