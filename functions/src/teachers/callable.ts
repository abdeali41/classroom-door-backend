import * as functions from "firebase-functions";
import * as methods from "./methods";
import { validateAuthAndActionType } from "../libs/validation";

enum actionTypes {
	GET_TEACHERS = "GET_TEACHERS", // FETCH ALL TEACHERS BY FILTER OR SORT
	GET_TEACHER_BY_ID = "GET_TEACHER_BY_ID", // FETCH DATA FOR SINGLE TEACHER
}

/** TEACHERS CALLABLE  **/

export const teachers = functions.https.onCall(async (data, context) => {
	validateAuthAndActionType(data, context);

	const { actionType } = data;

	let result: any;

	switch (actionType) {
		case actionTypes.GET_TEACHERS:
			const { filters } = data;
			result = await methods.getTeacherDataWithFilters(filters);
			break;
		case actionTypes.GET_TEACHER_BY_ID:
			const { teacherId } = data;
			result = await methods.getTeacherById(teacherId);
			break;
		default:
			result = null;
			break;
	}

	return result;
});
