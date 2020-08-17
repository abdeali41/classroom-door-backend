import * as functions from "firebase-functions";
import * as methods from "./methods";
import { validateAuthAndActionType } from "../libs/validation";

enum actionTypes {
	GET_ALL_STUDENTS = "GET_ALL_STUDENTS", // GET ALL STUDENTS
	TOGGLE_FAVORITE = "TOGGLE_FAVORITE", // FOR CHANGING MARK AS FAVORITE STATUS OF TEACHER
}

/** STUDENTS CALLABLE  **/

export const students = functions.https.onCall(
	async (data: any, context: any) => {
		validateAuthAndActionType(data, context);

		const { actionType } = data;

		let result: any;

		switch (actionType) {
			case actionTypes.GET_ALL_STUDENTS:
				result = await methods.getAllStudents();
				break;
			case actionTypes.TOGGLE_FAVORITE:
				const { studentId, teacherId } = data;
				result = await methods.toggleMarkAsFavorite({ studentId, teacherId });
				break;
			default:
				result = null;
				break;
		}

		return result;
	}
);
