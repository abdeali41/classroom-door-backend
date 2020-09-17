import { firestore } from "firebase-admin";
// import { updateBookingRequest } from "../booking/methods";
import Stripe from "stripe";
import {
	userMetaCollection,
	transactionCollection,
	userCollection,
} from "../db";
import stripe from "../libs/Stripe";
import { getLastRequestObject } from "../booking/methods";
import { SESSION_TYPES } from "../libs/constants";

export const acceptAndPayForBooking = async (params: any): Promise<any> => {
	try {
		const {
			studentStripeCustomerId,
			studentStripeCardId,
			teacherHourlyRate,
			teacherGroupSessionRate,
			requestThread,
			sessionType,
			studentId,
			teacherName,
			subjects,
		} = params;

		const { latestRequestMap } = getLastRequestObject(requestThread);

		const allRequestSlots = latestRequestMap.slots;
		const totalSessionLength = Object.keys(latestRequestMap.slots)
			.filter(
				(slotKey) =>
					!allRequestSlots[slotKey].deleted &&
					!allRequestSlots[slotKey].studentAccepted
			)
			.reduce(
				(total, approvedSlotKey) =>
					total + allRequestSlots[approvedSlotKey].sessionLength,
				0
			);
		const rate =
			sessionType === SESSION_TYPES.SINGLE
				? teacherHourlyRate
				: teacherGroupSessionRate;

		const totalSessionCost = (rate / 60) * totalSessionLength;

		const studentSnap = await userCollection.doc(studentId).get();

		const { email: studentEmail }: any = studentSnap.data();

		const paymentIntent = await stripe.paymentIntents.create({
			amount: totalSessionCost * 100,
			currency: "usd",
			confirm: true,
			customer: studentStripeCustomerId,
			payment_method: studentStripeCardId,
			description: `${Object.keys(latestRequestMap.slots).length} ${
				subjects[0] || ""
			} sessions with ${teacherName}`,
			receipt_email: studentEmail,
		});

		console.log("paymentIntent", paymentIntent);

		if (paymentIntent.status === "succeeded") {
			const charges = paymentIntent.charges.data.map((ch) => ({
				id: ch.id,
				receipt_url: ch.receipt_url,
				receipt_email: ch.receipt_email,
				receipt_number: ch.receipt_number,
				paid: ch.paid,
				balance_transaction: ch.balance_transaction,
				shipping: ch.shipping,
				billing_details: ch.billing_details,
				captured: ch.captured,
				created: ch.created,
				customer: ch.customer,
			}));

			await transactionCollection.add({
				paymentIntentId: paymentIntent.id,
				status: paymentIntent.status,
				amount: paymentIntent.amount,
				currency: paymentIntent.currency,
				created: paymentIntent.created,
				description: paymentIntent.description,
				invoice: paymentIntent.invoice,
				payment_method: paymentIntent.payment_method,
				receipt_email: paymentIntent.receipt_email,
				charges,
			});
			return true;
		} else {
			return false;
		}
	} catch (err) {
		console.log("error in payment", err);
		return false;
	}
};

export const creatStripeCustomer = async (
	params: Stripe.CustomerCreateParams
): Promise<any> => {
	const { email, name, phone, shipping, payment_method, metadata } = params;

	const customer = await stripe.customers.create({
		email,
		name,
		phone,
		shipping,
		payment_method,
		metadata,
	});

	return customer;
};

export const createCardForCustomer = async (params: any) => {
	const { customerId, cardToken } = params;
	const card = await stripe.customers.createSource(customerId, {
		source: cardToken,
	});
	return card;
};

export const addUserCard = async (params: any) => {
	try {
		const { customerId, cardToken, userId } = params;
		const card = await createCardForCustomer({ customerId, cardToken });

		await userMetaCollection
			.doc(userId)
			.update({ stripeCards: firestore.FieldValue.arrayUnion(card) });
		return { message: "Card added successfully", card };
	} catch (err) {
		return { message: err };
	}
};

export const retrieveCustomer = async (customerId) => {
	return stripe.customers.retrieve(customerId);
};
