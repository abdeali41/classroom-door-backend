import * as functions from "firebase-functions";
import * as methods from "./methods";

import SendResponse from "../libs/send-response";

/** EPICBOARD SESSIONS APIS **/

// FETCH EPICBOARD SESSIONS
export const getEpicboardSessions = functions.https.onRequest(
	async (req, res) => {
		const { userId } = req.body;

		methods
			.getAllSessions({ userId })
			.then(({ sessions }) => {
				SendResponse(res).success("Epicboard Sessions Found", sessions);
			})
			.catch((err) => {
				console.log("err", err);
				SendResponse(res).failed("Epicboard Sessions NOT Found");
			});
	}
);

// FETCH UPCOMING EPICBOARD SESSIONS LIMITED
export const getUpcomingEpicboardSessions = functions.https.onRequest(
	async (req, res) => {
		const { userId, limit } = req.body;
		methods
			.getUpcomingSessions({ userId, limit })
			.then(({ sessions }) =>
				SendResponse(res).success("Upcoming Epicboard Sessions Found", sessions)
			)
			.catch((err) => {
				console.log("err", err);
				SendResponse(res).failed("Upcoming Epicboard Sessions NOT Found");
			});
	}
);

// FETCH ALL TUTOR COUNSELORS WITH WHOM USER HAS SESSIONS
export const getUserTutoredTutorCounselors = functions.https.onRequest(
	async (req, res) => {
		const { userId } = req.body;
		methods
			.getUserTutorCounselors({ userId })
			.then(({ tutors, counselors }) =>
				SendResponse(res).success("tutor counselors Found", {
					tutors,
					counselors,
				})
			)
			.catch((err) => {
				console.log("err", err);
				SendResponse(res).failed("tutor counselors NOT Found");
			});
	}
);

// EPICBOARD ROOM CREATE WHEN JOINING SESSION
export const joinEpicboardSession = functions.https.onRequest(
	async (req, res) => {
		const { sessionId } = req.body;
		methods
			.joinEpicboardSession({ sessionId })
			.then(({ roomId, message }) => {
				if (roomId) {
					SendResponse(res).success(message, { roomId });
				} else {
					SendResponse(res).failed(message);
				}
			})
			.catch((err) => {
				console.log("err", err);
				SendResponse(res).failed(err);
			});
	}
);
