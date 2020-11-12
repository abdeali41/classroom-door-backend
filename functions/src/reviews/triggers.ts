import * as functions from "firebase-functions";
import {
	sendReviewSubmittedMail,
	updateRatingsAndReviewInUserMeta,
} from "./methods";

/** REVIEWS/FEEDBACK TRIGGERS **/

export const onReviewAdded = functions.firestore
	.document("reviews/{reviewId}")
	.onCreate(async (snapshot, context) => {
		const reviewId = context.params.reviewId;
		const reviewData: any = snapshot.data();

		await updateRatingsAndReviewInUserMeta({ reviewId, reviewData });

		await sendReviewSubmittedMail(reviewData);
	});
