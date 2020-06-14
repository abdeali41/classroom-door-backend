import * as admin from "firebase-admin";
import { firestoreCollectionKeys } from "../libs/constants";

export const firestoreDB = admin.firestore();
export const realtimeDB = admin.database();
export const fcmMessaging = admin.messaging();
export const userCollection = firestoreDB.collection(
	firestoreCollectionKeys.USERS
);
export const teacherCollection = firestoreDB.collection(
	firestoreCollectionKeys.TEACHERS
);
export const studentCollection = firestoreDB.collection(
	firestoreCollectionKeys.STUDENTS
);
export const bookingRequestCollection = firestoreDB.collection(
	firestoreCollectionKeys.BOOKING_REQUESTS
);
export const userEventCollection = firestoreDB.collection(
	firestoreCollectionKeys.USER_META
);
export const notificationCollection = firestoreDB.collection(
	firestoreCollectionKeys.NOTIFICATIONS
);
