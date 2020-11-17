import * as admin from "firebase-admin";
import {
	epicboardSessionCollection,
	mailCollection,
	reviewsCollection,
	userCollection,
	userMetaCollection,
} from "../db";
import { reviewSubmitted } from "../libs/email-template";

const updatedAvergeRating: any = (
	totalStarsBeforeUpdate: number,
	ratingCounterBeforeUpdate: number,
	newStars: number
) =>
	(
		(totalStarsBeforeUpdate + newStars) /
		(ratingCounterBeforeUpdate + 1)
	).toPrecision(2);

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
	const { addresseeId } = reviewData;
	const oldData = (await userMetaCollection.doc(addresseeId).get()).data();
	const sessionData = (
		await epicboardSessionCollection.doc(reviewData.sessionId).get()
	).data();
	try {
		await userMetaCollection.doc(addresseeId).update({
			avgRating: updatedAvergeRating(
				oldData?.totalStars,
				oldData?.totalRatingsPosted,
				reviewData.rating
			),
			reviews: admin.firestore.FieldValue.arrayUnion(reviewId),
			totalStars: admin.firestore.FieldValue.increment(reviewData.rating),
			totalRatingsPosted: admin.firestore.FieldValue.increment(1),
			totalMinutesTutoring: admin.firestore.FieldValue.increment(
				sessionData?.sessionLength
			),
		});

		await epicboardSessionCollection.doc(reviewData.sessionId).update({
			reviewPosted: true,
		});
	} catch (err) {
		console.log("Error Updating Meta Trigger document:", err);
	}
};

export const sendReviewSubmittedMail = async (review: any) => {
	const userSnap = await userCollection.doc(review.addresseeId).get();
	const user: any = userSnap.data();
	await mailCollection.add(
		reviewSubmitted({
			userId: userSnap.id,
			userName: `${user.firstName} ${user.lastName}`,
		})
	);
};
