import { initializeApp, credential } from "firebase-admin";
const serviceAccount = require("../classroom-door-firebase-adminsdk-6perx-dbae20c4c1.json");

initializeApp({
	credential: credential.cert(serviceAccount),
	databaseURL: "https://classroom-door.firebaseio.com",
});
import * as Teachers from "./teachers";
import * as Users from "./users";
import * as Students from "./students";
import * as Messages from "./messages";
import * as UpdateUser from "./update-user-data";
import {
	handleCreateBookingRequest,
	handleGetUserBookingRequest,
	handleGetBookingById,
	handleUpdateBookingRequest,
	triggerOnCreateBookingRequest,
	triggerOnUpdateBookingRequest,
} from "./booking-request";
import { sendNewMessageNotification } from "./notifications";

// Get Users
export const users = Users.getUsers;

// Get Teachers
export const teachers = Teachers.getTeacherDataWithFilters;
export const getTeachersAPI = Teachers.getTeacherDataWithFilters;

// Get Students
// Get Students
export const students = Students.getAllStudents;

// Update API Calls
// User Details
export const fixTeacherPreferences = UpdateUser.updateTeacherPreference;
export const updateUserData = UpdateUser.updateUserProfileDetails;

// FOR CHANGING MARK AS FAVORITE STATUS
export const toggleMarkAsFavourite = Students.toggleMarkAsFavorite;
export const fixStudentPreferences = UpdateUser.updateStudentPreferences;

// TO GET ALL USERS THAT BELONGS TO A PARTICULAR ROOM AND ALSO RETURN REMAINING USERS
export const roomMembers = Users.getRoomMembers;

export const deleteAllRooms = UpdateUser.removeAllRoomFromFirestore;

// Booking Request APIs
// Create Booking Request
export const createBookingRequest = handleCreateBookingRequest;

// Fetch Booking Request
export const getBookingRequests = handleGetUserBookingRequest;
export const getBookingRequestById = handleGetBookingById;

// Update Booking Request
export const updateBookingRequest = handleUpdateBookingRequest;

//Booking Request Triggers Functions
export const onCreateBookingRequestTrigger = triggerOnCreateBookingRequest;
export const onUpdateBookingRequestTrigger = triggerOnUpdateBookingRequest;

// Get user image
export const userImage = Users.getUserImage;
//Messaging

//To create chat group between users
export const createGroupChat = Messages.createGroupChat;
//To get all recent chats of user
export const getMessagingList = Messages.getMessagingList;
//////////NOTIFICATION AREA/////////////

// For sending push notification when user sends message
export const newMessageNotification = sendNewMessageNotification;

//////////NOTIFICATION AREA/////////////
