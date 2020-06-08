import * as functions from "firebase-functions";
import { bookingRequestCollection, userEventCollection } from ".."
import {
    addCreationTimeStamp, pushAsSuccessResponse,
    // pushAsErrorResponse
} from "../libs/generics";
import {
    firestoreSubCollectionKeys
} from "../constants";

const SESSION_TYPE_ENUM = { SINGLE: "SINGLE", GROUP: "GROUP" };

const BOOKING_REQUEST_STATUS_TYPE = {
    WAITING_FOR_TEACHER_CONFIRMATION: "WAITING_FOR_TEACHER_CONFIRMATION",
    WAITING_FOR_STUDENT_CONFIRMATION: "WAITING_FOR_STUDENT_CONFIRMATION",
    ACCEPTED: "ACCEPTED",
    REJECTED: "REJECTED",
    EXPIRED: "EXPIRED",
}


// type createBookingRequestDataType = {
//     teacherId: string,
//     studentId: string,
//     teacherName: string,
//     studentName: string,
//     teacherHourlyRate: Number,
//     teacherGroupSessionRate: Number,
//     totalSessionLength: Number,
//     sessionRequests: {
//         slots: {
//             date: string,
//             selectedLength: Number,
//             selectedBreak: String
//         }[]
//     },
// }
// const sampleRequests: createBookingRequestDataType = {
//     teacherId: "a", studentId: "", teacherHourlyRate: 10, totalSessionLength: 60,
//     slots: slots2: [{
// date: "2020-06-01",
//     selectedLength: 30,
//         selectedBreak: "AFTERNOON"
//     }, {
//     date: "2020-06-01",
//         selectedLength: 30,
//             selectedBreak: "MORNING"
// }
//         , {
//     date: "2020-06-02",
//         selectedLength: 60,
//             selectedBreak: "AFTERNOON"
// }]
// }


export const createBookingRequest = functions.https.onRequest(async (request: any, response: any) => {
    // add new request to booking request collection 
    // add the id to user's booking request array
    const { teacherId, studentId, teacherName, studentName, teacherHourlyRate, totalSessionLength, sessionRequests, teacherGroupSessionRate } = request.body;
    const initialRequest = sessionRequests.slots.reduce((newSlotRequest, newItem) => ({
        ...newSlotRequest,
        [`${newItem.date}-${newItem.selectedBreak}`]: {
            sessionLength: newItem.selectedLength,
            date: newItem.date
        },
    }), {})
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
                        deleted: false
                    }
                }
            }, {})

        })
    }
    const bookingRequest = addCreationTimeStamp({
        status: BOOKING_REQUEST_STATUS_TYPE.WAITING_FOR_TEACHER_CONFIRMATION,
        teacherId,
        teacherName,
        studentId,
        studentName,
        teacherHourlyRate,
        teacherGroupSessionRate,
        totalSessionLength,
        sessionType: SESSION_TYPE_ENUM.SINGLE,
        subjects: [],
        initialRequest,
        requestThread,

    })

    // adding to booking-request collection
    const bookingRequestResponse = await bookingRequestCollection.add(bookingRequest)
    const bookingRequestDocumentID = bookingRequestResponse.id;

    await addBookingReqToUserEvent(bookingRequestDocumentID, studentId, teacherId);

    response.status(200).json(
        pushAsSuccessResponse("New Booking Created", {
            id: bookingRequestDocumentID,
            ...bookingRequest,
        })

    );
})

const addBookingReqToUserEvent = async (bookingRequestId: string, studentId: string, teacherId: string) => {
    // Need to added to Firestore Trigger onCreate

    // add  this id to user-event collections user data for both teacher & student
    // node =>  user-data><studentId/teacherId>/booking-request
    // booking-request: { "requestId": Status }

    // Student
    await userEventCollection
        .doc(studentId)
        .collection(firestoreSubCollectionKeys.BOOKING_REQUESTS)
        .doc(bookingRequestId)
        .set({
            id: bookingRequestId,
            status: BOOKING_REQUEST_STATUS_TYPE.WAITING_FOR_TEACHER_CONFIRMATION
        }, { merge: true });


    // Teacher    
    await userEventCollection.doc(teacherId)
        .collection(firestoreSubCollectionKeys.BOOKING_REQUESTS)
        .doc(bookingRequestId)
        .set({
            id: bookingRequestId,
            status: BOOKING_REQUEST_STATUS_TYPE.WAITING_FOR_TEACHER_CONFIRMATION
        }, { merge: true })

}


// Fetch Bookings
const getAllBookingForUser = async (userId) => {
    const userBookingsSnapshot = await userEventCollection
        .doc(userId)
        .collection(firestoreSubCollectionKeys.BOOKING_REQUESTS)
        .get();
    const allBookingData = userBookingsSnapshot.docs.map(async bookingRequestDoc => {
        const bookingRequestData = bookingRequestDoc.data();
        return bookingRequestCollection.
            doc(bookingRequestData.id)
            .get()
            .then(data => ({ ...data.data() }));
    })
    return Promise.all(allBookingData);
}
export const fetchUserBookingRequest = functions.https.onRequest(async (request: any, response: any) => {
    // fetch all docs from user-events/<userId>/booking-requests
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
export const getBookingById = functions.https.onRequest(async (request: any, response: any) => {
    const { id } = request.body;
    return bookingRequestCollection.doc(id).get()
        .then(data => {
            response.status(200).json(
                pushAsSuccessResponse("Found Booking", { ...data.data() }))
        })
        .catch(err => {
            response.status(200).json(
                pushAsSuccessResponse("NOT Found Booking", { error: err }))
        })
})


// Update Booking Request


type updateBookingRequestsDataType = {

}
export const updateUserBookingRequest = (data: updateBookingRequestsDataType) => {

    // get user type 
    // add new comments or updated times.


    // Senario to accept the request

    // Create a SESSION of the request

    // senario to reject the request


    // get Type of user 
    // tutor can only change time




}


// export const bookingRequestCreateTrigger = functions.firestore.document(`${firestoreCollectionKeys.BOOKING_REQUESTS}/{bookingId}`)
//     .onCreate(async (bookingRequestSnap, context) => {

//         const a = bookingRequestSnap.data();
//         const { studentId = null, teacherId = null } = a


//         // add  this id to user-event collections user data for both teacher & student
//         // node =>  user-data><studentId/teacherId>/booking-request
//         // booking-request: { "requestId": Status }

//         await userEventCollection.doc(studentId).collection("booking-requests").doc(bookingRequestDocumentID).set({ status: BOOKING_REQUEST_STATUS_TYPE.WAITING_FOR_TEACHER_CONFIRMATION }, { merge: true })

//         // console.log(" Done pushing to user Event")
//         await userEventCollection.doc(teacherId).collection("booking-requests").doc(bookingRequestDocumentID).set({ status: BOOKING_REQUEST_STATUS_TYPE.WAITING_FOR_TEACHER_CONFIRMATION }, { merge: true })
//         // console.log(" Done pushing to teacher Event")
//     });