import { firestore } from "firebase-admin";
import Stripe from "stripe";
import {
	userMetaCollection,
	transactionCollection,
	userCollection,
	mailCollection,
} from "../db";
import stripe, { getWebhookEvent } from "../libs/Stripe";
import {
	confirmBooking,
	getLastRequestObject,
	updateFailPaymentResponse,
} from "../booking/methods";
import {
	SERVICE_CHARGE_PERCENTAGE_ON_BOOKING,
	SESSION_TYPES,
	StripeStatus,
	TeacherPayoutStatus,
} from "../libs/constants";
import { paymentFailed, paymentProcessed } from "../libs/email-template";

export const addServiceChargeOnAmount = (amount: number) => {
	const serviceCharge: number =
		(amount * SERVICE_CHARGE_PERCENTAGE_ON_BOOKING) / 100;

	return amount + serviceCharge;
};

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
			id: bookingId,
			studentName,
			teacherId,
			sessionString,
			subjectString,
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

		const totalSessionCost = addServiceChargeOnAmount(
			(rate / 60) * totalSessionLength
		);

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
			metadata: {
				bookingId,
				studentId,
				teacherId,
				teacherName,
				studentName,
				sessionString,
				subjectString,
			},
		});

		console.log("paymentIntent", JSON.stringify(paymentIntent));

		if (paymentIntent.status === "succeeded") {
			return [StripeStatus.PAYMENT_SUCCESS];
		} else if (paymentIntent.status === "requires_action") {
			const { next_action, client_secret }: any = paymentIntent;
			const { type } = next_action;

			if (type === "use_stripe_sdk") {
				return [StripeStatus.REQUIRES_ACTION, client_secret];
			} else {
				return [StripeStatus.PAYMENT_FAILURE];
			}
		} else {
			return [StripeStatus.PAYMENT_FAILURE];
		}
	} catch (err) {
		console.log("error in payment", err);
		return [StripeStatus.PAYMENT_FAILURE];
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

export const updatePaymentStatus = async (request: any) => {
	const sig = request.headers["stripe-signature"];

	let event;

	try {
		event = getWebhookEvent(request.rawBody, sig);
	} catch (err) {
		throw {
			name: "Webhook Error",
			message: err.message,
		};
	}
	const eventObject = event.data.object;
	const {
		metadata,
		payment_intent,
		status,
		amount,
		amount_captured,
		payment_method,
		currency,
		created,
		description,
		invoice,
		receipt_email,
		receipt_url,
	} = eventObject;

	// Handle the event
	switch (event.type) {
		case "charge.succeeded":
			await confirmBooking(metadata);
			await transactionCollection.add({
				paymentIntentId: payment_intent,
				status,
				amount,
				amount_captured,
				currency,
				created,
				description,
				invoice,
				payment_method,
				receipt_email,
				receipt_url,
				charges: eventObject,
				bookingId: metadata.bookingId,
				teacherPayoutStatus: TeacherPayoutStatus.INITIATED,
			});
			await mailCollection.add(
				paymentProcessed({
					userId: metadata.studentId,
					userName: metadata.studentName,
					receiptUrl: receipt_url,
				})
			);

			break;
		case "charge.failed":
			await updateFailPaymentResponse(metadata.bookingId);
			await mailCollection.add(
				paymentFailed({
					userId: metadata.studentId,
					userName: metadata.studentName,
					amount,
				})
			);
		// ... handle other event types
		default:
			console.log(`Unhandled event type ${event.type}`);
	}

	// Return a response to acknowledge receipt of the event
	return { received: true };
};
