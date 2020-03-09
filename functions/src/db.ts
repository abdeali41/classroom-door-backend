import * as admin from "firebase-admin";
import Config from "./config";

export const initialiseApp = () =>
	admin.initializeApp({
		credential: Config.serviceAccount,
		databaseURL: Config.databaseURL
	});

export const firestoreDB = admin.firestore();
export const userCollection = firestoreDB.collection("users");
export const teacherCollection = firestoreDB.collection("teachersCopy");
export const studentCollection = firestoreDB.collection("students");
export const userMetaDataCollection = firestoreDB.collectionGroup("userMeta");
