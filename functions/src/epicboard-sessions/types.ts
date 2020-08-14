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
