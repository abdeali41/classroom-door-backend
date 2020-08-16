import * as functions from "firebase-functions";
import * as methods from "./methods";
import SendResponse from "../libs/send-response";

/** STUDENTS APIS **/

// GET ALL STUDENTS
export const getStudents = functions.https.onRequest((req: any, res: any) => {
	methods
		.getAllStudents()
		.then(({ students }) => {
			res.json({
				success: true,
				message: "Fetched list of all students!",
				students,
			});
		})
		.catch((err) => {
			SendResponse(res).failed(err);
		});
});

// FOR CHANGING MARK AS FAVORITE STATUS OF TEACHER
export const toggleMarkAsFavorite = functions.https.onRequest(
	async (req: any, res: any) => {
		const { studentId, teacherId } = req.body;
		methods
			.toggleMarkAsFavorite({ studentId, teacherId })
			.then(({ favorites }) => {
				res.json({
					success: true,
					message: "Mark as favorite status changed!",
					favorites,
				});
			})
			.catch((err) => {
				SendResponse(res).failed(err);
			});
	}
);
