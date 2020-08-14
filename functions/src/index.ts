import { initializeApp, credential } from "firebase-admin";
const serviceAccount = require("../classroom-door-firebase-adminsdk-6perx-dbae20c4c1.json");

initializeApp({
	credential: credential.cert(serviceAccount),
	databaseURL: "https://classroom-door.firebaseio.com",
});
import * as Teachers from "./teachers";
import * as Users from "./users";
import * as Students from "./students";
import * as UpdateUser from "./update-user-data";
import * as Booking from "./booking-request";
import * as Notification from "./notifications";

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

/** STUDENT APIS **/

// Get Students
export const students = Students.getAllStudents; //To be deleted
export const getStudents = Students.getAllStudents;
// FOR CHANGING MARK AS FAVORITE STATUS
export const toggleMarkAsFavourite = Students.toggleMarkAsFavorite; // To be deleted
export const toggleMarkAsFavorite = Students.toggleMarkAsFavorite;

/** TEACHER APIS **/

// Get Teachers
export const getTeachersAPI = Teachers.getTeacherData; // To be deleted
export const getTeachers = Teachers.getTeacherData;
// FETCH DATA FOR SINGLE TEACHER
export const getTeacher = Teachers.getTeacher;

/** BOOKING APIS **/

// CREATE BOOKING REQUEST
export const createBookingRequest = Booking.handleCreateBookingRequest;
// FETCH BOOKING REQUEST
export const getBookingRequests = Booking.handleGetUserBookingRequest;
// FETCH BOOKING REQUEST BY ID
export const getBookingRequestById = Booking.handleGetBookingById;
// UPDATE BOOKING REQUEST
export const updateBookingRequest = Booking.handleUpdateBookingRequest;
// BOOKING REQUEST TRIGGER FOR ON CREATE BOOKING REQUEST
export const onCreateBookingRequestTrigger =
	Booking.triggerOnCreateBookingRequest;
// BOOKING REQUEST TRIGGER FOR ON UPDATE BOOKING REQUEST
export const onUpdateBookingRequestTrigger =
	Booking.triggerOnUpdateBookingRequest;

/** EPICBOARD SESSIONS AND EPICBOARD ROOM  **/
export * from "./epicboard-sessions";

/** MESSAGING **/
export * from "./messages";

/** NOTIFICATION APIS **/

// FOR SENDING PUSH NOTIFICATIONS WHEN USER SENDS MESSAGE
export const newMessageNotification = Notification.sendNewMessageNotification;
