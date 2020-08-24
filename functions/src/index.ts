import { initializeApp, credential } from "firebase-admin";
const serviceAccount = require("../classroom-door-firebase-adminsdk-6perx-dbae20c4c1.json");

initializeApp({
	credential: credential.cert(serviceAccount),
	databaseURL: "https://classroom-door.firebaseio.com",
});

/** DATA FIXES **/
export * from "./data-fixes";

/** USER **/
export * from "./users";

/** STUDENTS **/
export * from "./students";

/** TEACHERS **/
export * from "./teachers";

/** BOOKING **/
export * from "./booking";

/** SESSIONS **/
export * from "./sessions";

/** MESSAGING **/
export * from "./messages";

/** NOTIFICATION **/
export * from "./notifications";
