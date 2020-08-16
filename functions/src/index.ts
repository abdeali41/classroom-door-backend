import { initializeApp, credential } from "firebase-admin";
const serviceAccount = require("../classroom-door-firebase-adminsdk-6perx-dbae20c4c1.json");

initializeApp({
	credential: credential.cert(serviceAccount),
	databaseURL: "https://classroom-door.firebaseio.com",
});
import * as Users from "./users";
import * as UpdateUser from "./update-user-data";

/** USER APIS **/

// GET USERS
export const users = Users.getUsers;
// TO GET ALL USERS THAT BELONGS TO A PARTICULAR ROOM AND ALSO RETURN REMAINING USERS
export const roomMembers = Users.getRoomMembers;
// GET USER IMAGE
export const userImage = Users.getUserImage;

/** UPDATE USER APIS **/

export const fixTeacherPreferences = UpdateUser.updateTeacherPreference;
export const updateUserData = UpdateUser.updateUserProfileDetails;
export const fixStudentPreferences = UpdateUser.updateStudentPreferences;
export const deleteAllRooms = UpdateUser.removeAllRoomFromFirestore;

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
