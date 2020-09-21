import * as functions from "firebase-functions";
import { updateRatingsAndReviewInUserMeta } from "./methods";

/** REVIEWS/FEEDBACK TRIGGERS **/

export const onReviewAdded = functions.firestore
	.document("reviews/{reviewId}")
	.onCreate(async (snapshot, context) => {
		const reviewId = context.params.reviewId;
		const reviewData: any = snapshot.data();

		await updateRatingsAndReviewInUserMeta({ reviewId, reviewData });
	});
