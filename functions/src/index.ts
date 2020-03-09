import * as functions from "firebase-functions";
import { initialiseApp } from "./db";
import { getTeacherDataWithFilters } from "./teachers";
import { getAllUsers, getUsersById } from "./users";
import * as Students from "./students";
import {
	updateTeacherPreference,
	updateUserProfileDetails
} from "./update-user-data";

initialiseApp();

// Get Users
export const users = functions.https.onCall(
	(request: { userIds?: string[] }) => {
		console.log("User endpoint Request::", request);
		const { userIds } = request;
		// check if request is for some userIds
		if (userIds && userIds.length > 0) {
			return getUsersById(userIds)
				.then(res => res)
				.catch(err => new Error(err));
		}

		return getAllUsers()
			.then(res => res)
			.catch(err => new Error(err));
	}
);

// Get Teachers
export const teachers = functions.https.onCall((request: any) => {
	console.log("Request Parameters::::", JSON.stringify(request));
	return getTeacherDataWithFilters(request.filters)
		.then(res => {
			console.log("Teachers Data :::", res);
			return res;
		})
		.catch(err => {
			console.log("Found Error:::", err);
			return new Error(err);
		});
});

export const getTeachersAPI = functions.https.onRequest(
	async (request: any, response: any) => {
		getTeacherDataWithFilters(request.body.filters)
			.then(res => {
				console.log("Data Final::", res);
				response.status(200).json({
					data: res,
					message: "Query Success"
				});
			})
			.catch(err => console.log("query Failed: ", err));
	}
);

// Get Students
export const students = functions.https.onRequest((request: any) => {
	return Students.getAllStudents()
		.then(res => res)
		.catch(err => new Error(err));
});

// Update API Calls
// User Details
export const fixTeacherPreferences = functions.https.onRequest(
	(request: any, response: any) => {
		updateTeacherPreference()
			.then(res => {
				response.status(200).json({
					data: res,
					message: "Updated Teacher List Success"
				});
			})
			.catch(err =>
				console.log("Found Error on updating Teacher  List: ", err)
			);
	}
);

export const updateUserData = functions.https.onRequest(
	(request: any, response: any) => {
		updateUserProfileDetails()
			.then(res => {
				response.status(200).json({
					data: res,
					message: "Updated user Data List Success"
				});
			})
			.catch(err =>
				console.log("Found Error on updating user Data List: ", err)
			);
	}
);

export const markAsFavourite = Students.markAsFavourite;
