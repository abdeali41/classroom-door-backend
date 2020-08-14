import * as functions from "firebase-functions";
import {
	getAllSessions,
	getUpcomingSessions,
	getUserTutorCounselors,
} from "./methods";
import SendResponse from "../libs/send-response";

/** EPICBOARD SESSIONS APIS **/

// FETCH EPICBOARD SESSIONS
export const getEpicboardSessions = functions.https.onRequest(
	async (req, res) => {
		const { userId } = req.body;

		getAllSessions({ userId })
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
		getUpcomingSessions({ userId, limit })
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
		getUserTutorCounselors({ userId })
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
