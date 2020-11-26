export enum chatTypes {
	ROOM_CHATS = "room-chats",
	GROUP_CHATS = "group-chats",
}

export enum firestoreCollectionKeys {
	USERS = "users",
	TEACHERS = "teachers",
	STUDENTS = "students",
	USER_META = "user-meta",
	BOOKING_REQUESTS = "booking-requests",
	EPICBOARD_SESSIONS = "epicboard-sessions",
	EPICBOARD_ROOMS = "epicboard-rooms",
	NOTIFICATIONS = "notifications",
	REVIEWS = "reviews",
	SUBJECT_LISTS = "subjectLists",
	TRANSACTIONS = "transactions",
	mail = "mail",
}

export enum realtimeDBNodes {
	EPICBOARD_ROOMS = "epicboard-rooms",
	SESSION_STATUS = "session-status",
	PENDING_TRANSFERS = "pending-transfers",
}

export enum userMetaSubCollectionKeys {
	BOOKING_REQUEST = "booking-request",
	EPICBOARD_SESSION = "epicboard-session",
	EPICBOARD_ROOM = "epicboard-room",
	CONNECTED_PEOPLE = "connected-people",
	CURRENT_BOOKINGS = "current-bookings",
}

export enum epicboardRoomSubCollectionKeys {
	USER_ACTIVITY = "user-activity",
}
