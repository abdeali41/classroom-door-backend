import env from "../env";

export const firestoreCollectionKeys = {
	USERS: "users",
	TEACHERS: "teachers",
	STUDENTS: "students",
	USER_META: "user-meta",
	BOOKING_REQUESTS: "booking-requests",
	EPICBOARD_SESSIONS: "epicboard-sessions",
	EPICBOARD_ROOMS: "epicboard-rooms",
	NOTIFICATIONS: "notifications",
	REVIEWS: "reviews",
};

export const realtimeDBNodes = {
	EPICBOARD_ROOMS: "epicboard-rooms",
};

export const userMetaSubCollectionKeys = {
	BOOKING_REQUEST: "booking-request",
	EPICBOARD_SESSION: "epicboard-session",
	EPICBOARD_ROOM: "epicboard-room",
};

export const epicboardRoomSubCollectionKeys = {
	USER_ACTIVITY: "user-activity",
};

export const educationData = [
	{ id: "UNDERGRADUATE_STUDENT", name: "Undergraduate Student", value: 2 },
	{ id: "GRADUATE_STUDENT", name: "Graduate Student", value: 3 },
	{ id: "GRADUATE_DEGREE", name: "Graduate Degree", value: 4 },
	{ id: "BACHELORS_DEGREE", name: "Bachelor’s Degree", value: 5 },
	{ id: "MASTERS_DEGREE", name: "Master’s Degree", value: 6 },
	{
		id: "CURRENT_UNDERGRADUATE_STUDENT",
		name: "Current Undergraduate Student",
		value: 1,
	},
	{ id: "UNDERGRADUATE_DEGREE", name: "Undergraduate Degree", value: 2 },
	{
		id: "CURRENT_GRADUATE_STUDENT",
		name: "Current Graduate Student",
		value: 3,
	},
	{ id: "GRADUATE_DEGREE", name: "Graduate Degree", value: 4 },
	{ id: "OTHER", name: "Other", value: 6 },
];

export const weekDay: any = {
	Sun: "0",
	Mon: "1",
	Tue: "2",
	Wed: "3",
	Thu: "4",
	Fri: "5",
	Sat: "6",
};
export const daySlotTypes: any = {
	Afternoon: "AFTERNOON",
	Evening: "EVENING",
	Morning: "MORNING",
};

export const defaultAvailable = {
	"0": [],
	"1": [],
	"2": [],
	"3": [],
	"4": [],
	"5": [],
	"6": [],
};
export const SortTypes = {
	ratings: "RATING",
	bestMatch: "BEST_MATCH",
	hoursTutoring: "HOURS_TUTORING",
	myFavorite: "MY_FAVORITES",
};

export const sortOrderOptions = {
	ASCENDING: "asc",
	DESCENDING: "desc",
};

// Types of Epicboard Sessions
export const SESSION_TYPES = {
	SINGLE: "SINGLE",
	GROUP: "GROUP",
};

// Type of notifications
export const notificationTypes = {
	text: "text",
	image: "image",
};
export const chatTypes = {
	ROOM_CHATS: "room-chats",
	GROUP_CHATS: "group-chats",
};

// user types // to be change
export const UserTypes = {
	STUDENT: "STUDENT",
	TEACHER: "TEACHER",
};

//teacher types // to be change
export const TeacherTypes = {
	TUTORING: "TUTORING",
	ADVISING: "ADVISING",
	TUTORING_AND_ADVISING: "TUTORING_AND_ADVISING",
};

export const StripeStatus = {
	PAYMENT_SUCCESS: "PAYMENT_SUCCESS",
	PAYMENT_FAILURE: "PAYMENT_FAILURE",
	REQUIRES_ACTION: "REQUIRES_ACTION",
};

// Service charge for student
export const SERVICE_CHARGE_PERCENTAGE_ON_BOOKING = 8;

// Commission on booking
export const TCD_COMMISSION_PERCENTAGE_ON_BOOKING = 25;
export const CLASSROOMDOOR_WEB_URL = env.CLASSROOMDOOR_WEB_URL;
export const CLASSROOMDOOR_SUPPORT_EMAIL = env.CLASSROOMDOOR_SUPPORT_EMAIL;

export const TeacherPayoutStatus = {
	REQUESTED: "REQUESTED",
	INITIATED: "INITIATED",
	PROCESSING: "PROCESSING",
	PAID: "PAID",
	FAILED: "FAILED",
};
