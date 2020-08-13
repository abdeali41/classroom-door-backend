import * as admin from "firebase-admin";
import { firestoreCollectionKeys, realtimeDBNodes } from "../libs/constants";

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
export const getChatsRef = (chatType: string) =>
	realtimeDB.ref(`chats/${chatType}`);
export const getChatRef = (chatType: string, chatId: string) =>
	getChatsRef(chatType).child(chatId);
export const getChatMetaRef = (chatType: string, chatId: string) =>
	getChatRef(chatType, chatId).child("meta");
export const getChatConversationRef = (chatType: string, chatId: string) =>
	getChatRef(chatType, chatId).child("conversation");
