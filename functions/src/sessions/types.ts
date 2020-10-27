type createdAndModifiedTimeStampTypes = {
	creationTime: string;
	modifiedTime: string;
};

type epicboardSessionObjectType = {
	status: Number;
	id: string;
	roomId: string;
	teacherId: string;
	teacherName: string;
	studentId: string;
	studentName: string;
	sessionType: string;
	teacherGroupSessionRate: Number;
	teacherHourlyRate: Number;
	subjects: string[];
	bookingRequestSlotId: string;
	bookingRequestThreadObjectId: string;
	startTime: string;
	sessionLength: Number;
} & createdAndModifiedTimeStampTypes;

type sessionsParams = {
	userId: string;
};
type sessionsWithLimitParams = sessionsParams & {
	limit: number;
};

type sessionsReturnType = {
	sessions: object[];
};

type getUserTutorCounselorsReturnType = {
	tutors: object[];
	counselors: object[];
};

type epicboardRoomActivityType = {
	[key: string]: {
		// key = sessionEventId
		startTImeStamp: string;
		endTimeStamp: string;
		members: {
			// Object Array
			[key: string]: {
				// key = memberID (student/teacher)
				startTImeStamp: string;
				endTimeStamp: string;
			}[];
		};
	};
};

type epicboardRoomSavedStatesType = {
	[key: string]: {
		// timestamp keys
	};
};

type epicboardRoomObjectType = {
	status: Number;
	id: string;
	sessionEventIdList: string[];
	memberIdList: string[];
	presenterId: string;
	activity: epicboardRoomActivityType;
	savedStates: epicboardRoomSavedStatesType;
} & createdAndModifiedTimeStampTypes;

type JoinEpicboardSessionRequestType = {
	// userId?: string;
	sessionId: string;
};

type RoomInfo = {
	name: string;
	presenterIds: string[];
	ownerId: string;
	activeBoard: number;
};

type joinEpicboardSessionReturnType = {
	roomId?: string;
	message: string;
	teacherId?:string;
	sessionId?:string;
	tutorUserDetails?: any
};

type activityTimeType = {
	online: number;
	offline: number;
};
