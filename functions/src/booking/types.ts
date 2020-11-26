type requestThreadSlotType = {
	sessionLength: number;
	suggestedDateTime: string;
	studentAccepted: Boolean;
	deleted: Boolean;
};

type requestThreadSlotMapType = {
	[key: string]: requestThreadSlotType;
};

type requestThreadObjectType = {
	teacherComment: string;
	studentComment: string;
	slots: requestThreadSlotMapType;
} & createdAndModifiedTimeStampTypes;

type requestThreadMapType = {
	[key: string]: requestThreadObjectType;
};

type initialRequestSlotType = {
	[key: string]: {
		selectedBreak: string;
		sessionLength: number;
		date: string;
	};
};

type bookingRequestType = {
	id: string;
	status: Number;
	teacherId: string;
	teacherName: string;
	studentId: string;
	studentName: string;
	sessionType: string;
	totalSessionLength: Number;
	teacherGroupSessionRate: Number;
	teacherHourlyRate: Number;
	subjects: string[];
	initialRequest: initialRequestSlotType;
	requestThread: requestThreadMapType;
	marketing_material_acceptance: string;
} & createdAndModifiedTimeStampTypes;

type updateBookingRequestBodyType = {
	bookingId: string;
	userId: string;
	updatedSlotRequests: requestThreadSlotMapType;
	studentComment: string;
	teacherComment: string;
	allChangesApprovedByStudent: boolean;
	bookingRejectedOrCancelled: boolean;
};

type bookingRequestUserMetaType = {
	id: string;
	status: Number;
	confirmedSessions?: string[];
	confirmedRooms?: string[];
} & createdAndModifiedTimeStampTypes;

type createBookingRequestParams = {
	teacherId: string;
	studentId: string;
	teacherName: string;
	studentName: string;
	teacherHourlyRate: number;
	totalSessionLength: number;
	sessionRequests: object[];
	teacherGroupSessionRate: number;
	subjects: string[];
	studentStripeCardId: string;
	studentStripeCustomerId: string;
	tos_acceptance: tos_acceptance;
	marketing_material_acceptance: string;
	ip: string;
};

type tos_acceptance = {
	date: string;
	version: string;
	ip: string;
};

type createBookingRequestReturnType = {
	bookingRequest: bookingRequestType;
};

type getAllBookingsForUserParams = {
	userId: string;
};

type getAllBookingsForUserReturnType = {
	bookings: any;
};

type updateBookingRequestReturnType = {
	updatedBookingRequest: object | undefined;
};

type teacherPendingBookingRequestCountReturnType = {
	count: number;
	students: { name: string; avatarUrl: string }[];
};

type bookedSlotsType = {
	[key: string]: {
		startTime: string;
		endTime: string;
		sessionId: string;
	};
};

type getTeacherAvailabilityParams = {
	teacherId: string;
	startDate: string;
	noOfMonths: number;
};

type getTeacherAvailabilityReturnType = {
	teacherId: string;
	slotInterval: number;
	bookedSlots: bookedSlotsType[];
};
