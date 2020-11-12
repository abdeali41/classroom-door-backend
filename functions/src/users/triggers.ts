import * as functions from "firebase-functions";
import { firestoreCollectionKeys } from "../db/enum";
import { mailCollection, userMetaCollection } from "../db";
import { creatStripeCustomer } from "../payments/methods";
import { UserTypes } from "../libs/constants";
import {
	studentAccountCreation,
	teacherAccountCreation,
} from "../libs/email-template";
/** USER TRIGGERS **/

// New User Creation Trigger
export const newUserCreationTrigger = functions.firestore
	.document(`${firestoreCollectionKeys.USERS}/{userId}`)
	.onCreate(async (snapshot, context) => {
		try {
			const snapData: any = snapshot.data();
			console.log("New User Trigger Snapshot: ", JSON.stringify(snapData));
			console.log("New User Trigger context: ", JSON.stringify(context));

			const { email, firstName, lastName, phoneNumber, userType } = snapData;

			if (email) {
				const customer = await creatStripeCustomer({
					email,
					name: `${firstName}  ${lastName}`,
					phone: phoneNumber,
				});
				await userMetaCollection.doc(snapshot.id).set({
					avgRating: "0",
					chats: [],
					favorites: [],
					minutesTutoring: 0,
					reviews: [],
					sessionsCompleted: 0,
					totalRatingsPosted: 0,
					totalStars: 0,
					stripeCustomer: customer,
				});

				const mailParams = {
					userId: snapshot.id,
					userName: `${firstName}  ${lastName}`,
				};

				if (userType === UserTypes.STUDENT) {
					await mailCollection.add(studentAccountCreation(mailParams));
				} else if (userType === UserTypes.TEACHER) {
					await mailCollection.add(teacherAccountCreation(mailParams));
				}
			}
		} catch (err) {
			console.log("Error Creating User-Meta Document for: ", snapshot.id);
			console.log("Error Details: ", JSON.stringify(err));
		}
	});

// New User Creation Trigger
export const newUserUpdateTrigger = functions.firestore
	.document(`${firestoreCollectionKeys.USERS}/{userId}`)
	.onUpdate(async (change, context) => {
		const { userId } = context.params;
		try {
			const newValue = change.after.data();

			const previousValue = change.before.data();

			console.log("New User Trigger newValue: ", JSON.stringify(newValue));
			console.log(
				"New User Trigger previousValue: ",
				JSON.stringify(previousValue)
			);

			if (
				previousValue.isRegistered !== true &&
				newValue.isRegistered === true
			) {
				const { email, firstName, lastName, phoneNumber, userType } = newValue;

				const customer = await creatStripeCustomer({
					email,
					name: `${firstName}  ${lastName}`,
					phone: phoneNumber,
				});
				await userMetaCollection.doc(userId).set({
					avgRating: "0",
					chats: [],
					favorites: [],
					minutesTutoring: 0,
					reviews: [],
					sessionsCompleted: 0,
					totalRatingsPosted: 0,
					totalStars: 0,
					stripeCustomer: customer,
				});

				const mailParams = {
					userId: userId,
					userName: `${firstName}  ${lastName}`,
				};

				if (userType === UserTypes.STUDENT) {
					await mailCollection.add(studentAccountCreation(mailParams));
				} else if (userType === UserTypes.TEACHER) {
					await mailCollection.add(teacherAccountCreation(mailParams));
				}
			}
		} catch (err) {
			console.log("ErroR Updating User-Meta Document for: ", userId);
			console.log("Error Details: ", JSON.stringify(err));
		}
	});
