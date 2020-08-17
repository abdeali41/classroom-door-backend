import * as functions from "firebase-functions";
import { subjectListCollection } from "../db";

export const setCounsellingSubjectList = functions.https.onRequest(
	(request: any, response: any) => {
		subjectListCollection
			.doc("counsellingSubjects")
			.set({ list: request.body.data })
			.then((res) => {
				response.status(200).json({
					data: res,
					message: "Updated Counselling Subject List Success",
				});
			})
			.catch((err) =>
				console.log("Found Error on updating Counselling Subject List: ", err)
			);
	}
);
export const setTutoringSubjectList = functions.https.onRequest(
	(request: any, response: any) => {
		subjectListCollection
			.doc("tutoringSubjects")
			.set({ list: request.body.data })
			.then((res) => {
				response
					.status(200)
					.json({ data: res, message: "Updated Tutor Subject List Success" });
			})
			.catch((err) =>
				console.log("Found Error on updating Tutor Subject List: ", err)
			);
	}
);

export const setStandardizedTestList = functions.https.onRequest(
	(request: any, response: any) => {
		console.log("standardizedTest request ::", request.body);
		subjectListCollection
			.doc("standardizedTest")
			.set({ list: request.body.data })
			.then((res) => {
				response.status(200).json({
					data: res,
					message: "Updated Standardized Test List Success",
				});
			})
			.catch((err) =>
				console.log("Found Error on updating Standardized Test List: ", err)
			);
	}
);
