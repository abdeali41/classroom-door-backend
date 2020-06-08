import * as functions from "firebase-functions";
import { bookingRequestCollection, userEventCollection } from ".."
import { addCreationTimeStamp } from "../libs/generics";
// import { firestoreCollectionKeys } from "../constants";

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


export const createBookingRequest = functions.https.onRequest(async (req: any, res: any) => {
    // add new request to booking request collection 
    // add the id to user's booking request array
    const { teacherId, studentId, teacherName, studentName, teacherHourlyRate, totalSessionLength, sessionRequests, teacherGroupSessionRate } = req.body;
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
    // add  this id to user-event collections user data for both teacher & student
    // node =>  user-data><studentId/teacherId>/booking-request
    // booking-request: { "requestId": Status }

    await userEventCollection.doc(studentId).collection("booking-requests").doc(bookingRequestDocumentID).set({ status: BOOKING_REQUEST_STATUS_TYPE.WAITING_FOR_TEACHER_CONFIRMATION }, { merge: true })
    await userEventCollection.doc(teacherId).collection("booking-requests").doc(bookingRequestDocumentID).set({ status: BOOKING_REQUEST_STATUS_TYPE.WAITING_FOR_TEACHER_CONFIRMATION }, { merge: true })


    res.status(200).json({
        success: true,
        message: "New Booking Created",
        data: {
            id: bookingRequestDocumentID,
            ...bookingRequest,
        }
    });
})


type fetchBookingRequestsDataType = {

}

export const fetchUserBookingRequest = (data: fetchBookingRequestsDataType) => {

    // get aaray of booking request

    // get Type of user 
    // tutor can only change time

}


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