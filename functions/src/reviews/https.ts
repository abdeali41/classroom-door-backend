import * as functions from "firebase-functions";
import { getReviews } from "./methods";

/** REVIEW/FEEDBACK APIS **/

//Get All Review Documents from Reviews Collection
export const getAllReviews = functions.https.onRequest(
	(request: any, response: any) => {
		getReviews()
			.then((reviews) => {
				response.json({
					success: true,
					reviews,
				});
			})
			.catch((err) => {
				response.json({
					success: false,
					error: "Failed to Fetch Reviews",
				});
			});
	}
);
