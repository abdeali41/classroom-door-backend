import * as admin from "firebase-admin";
import { reviewsCollection, teacherCollection } from "../db";

//Get All Review Documents from Reviews Collection
export const getReviews = async (): Promise<any> => {
	const reviewSnapshot = await reviewsCollection.get();
	const reviews = reviewSnapshot.docs.map((reviewDoc) => reviewDoc.data());
	return reviews;
};

export const updateRatingsAndReviewInUserMeta = async (
	params: updateRatingsAndReviewInUserMetaParams
): Promise<void> => {
	const { reviewId, reviewData } = params;
	const { tutorId } = reviewData;
	try {
		await teacherCollection.doc(tutorId).update({
			reviews: admin.firestore.FieldValue.arrayUnion(reviewId),
			totalStars: admin.firestore.FieldValue.increment(reviewData.rating),
			totalRatings: admin.firestore.FieldValue.increment(1),
		});
	} catch (err) {
		console.log("Error Fetching document:", err);
	}
};
