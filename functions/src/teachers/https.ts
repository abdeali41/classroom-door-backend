import * as functions from "firebase-functions";
import * as methods from "./methods";
import SendResponse from "../libs/send-response";

/** TEACHERS APIS **/

// FETCH ALL TEACHERS BY FILTER OR SORT
export const getTeachers = functions.https.onRequest((req: any, res: any) => {
	const { filters } = req.body;
	methods
		.getTeacherDataWithFilters(filters)
		.then(({ teachers }) => {
			SendResponse(res).success("Query Success", teachers);
		})
		.catch((err) => {
			SendResponse(res).failed(err);
		});
});

// FETCH DATA FOR SINGLE TEACHER
export const getTeacher = functions.https.onRequest(
	async (req: any, res: any) => {
		const { teacherId } = req.body;
		methods
			.getTeacherById(teacherId)
			.then((teacher) => {
				SendResponse(res).success("Query Success", teacher);
			})
			.catch((err) => {
				SendResponse(res).failed(err);
			});
	}
);
