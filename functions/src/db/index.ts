import * as admin from "firebase-admin";
import { firestoreCollectionKeys, realtimeDBNodes } from "./enum";

export const firestoreDB = admin.firestore();
export const realtimeDB = admin.database();
export const fcmMessaging = admin.messaging();

// FIRESTORE COLLECTIONS
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
export const epicboardSessionCollection = firestoreDB.collection(
	firestoreCollectionKeys.EPICBOARD_SESSIONS
);
export const epicboardRoomCollection = firestoreDB.collection(
	firestoreCollectionKeys.EPICBOARD_ROOMS
);
export const userMetaCollection = firestoreDB.collection(
	firestoreCollectionKeys.USER_META
);
export const notificationCollection = firestoreDB.collection(
	firestoreCollectionKeys.NOTIFICATIONS
);
export const reviewsCollection = firestoreDB.collection(
	firestoreCollectionKeys.REVIEWS
);
export const subjectListCollection = firestoreDB.collection(
	firestoreCollectionKeys.SUBJECT_LISTS
);
export const transactionCollection = firestoreDB.collection(
	firestoreCollectionKeys.TRANSACTIONS
);
export const mailCollection = firestoreDB.collection(
	firestoreCollectionKeys.mail
);

// REALTIME DATABASE REFS

// ROOM REFS
export const getRoomsRef = () =>
	realtimeDB.ref(realtimeDBNodes.EPICBOARD_ROOMS);
export const getRoomRef = (roomId: string) => getRoomsRef().child(roomId);
export const getRoomMetaRef = (roomId: string) =>
	getRoomRef(roomId).child("meta");
export const getRoomUsersRef = (roomId: string) =>
	getRoomRef(roomId).child("users");
export const getRoomUserRef = (roomId: string, userId: string) =>
	getRoomUsersRef(roomId).child(userId);
export const getRoomCurrentSessionRef = (roomId: string) =>
	getRoomMetaRef(roomId).child("currentSessionId");

//CHAT REFS
export const getChatsRef = () => realtimeDB.ref(`chats`);
export const getChatRef = (chatId: string) => getChatsRef().child(chatId);
export const getChatMetaRef = (chatId: string) =>
	getChatRef(chatId).child("meta");
export const getChatConversationRef = (chatId: string) =>
	getChatRef(chatId).child("conversation");
export const getChatMetaUpdatedAtRef = (chatId: string) =>
	getChatMetaRef(chatId).child("updatedAt");
