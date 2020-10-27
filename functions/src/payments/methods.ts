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
	CLASSROOMDOOR_WEB_URL,
	SERVICE_CHARGE_PERCENTAGE_ON_BOOKING,
	SESSION_TYPES,
	StripeStatus,
	TCD_COMMISSION_PERCENTAGE_ON_BOOKING,
	TeacherPayoutStatus,
} from "../libs/constants";
import { paymentFailed, paymentProcessed } from "../libs/email-template";

export const addServiceChargeOnAmount = (amount: number) => {
	const serviceCharge: number =
		(amount * SERVICE_CHARGE_PERCENTAGE_ON_BOOKING) / 100;

	return amount + serviceCharge;
};

export const removeTCDCommissionOnAmount = (amount: number) => {
	const commission: number =
		(amount * TCD_COMMISSION_PERCENTAGE_ON_BOOKING) / 100;
	return amount - commission;
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

		const totalAmount = (rate / 60) * totalSessionLength;

		const totalSessionCost = addServiceChargeOnAmount(totalAmount);

		const teacherPayoutAmount = removeTCDCommissionOnAmount(totalAmount);

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
				totalAmount,
				totalSessionCost,
				teacherPayoutAmount,
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
				metadata,
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

export const attachBankAccountToCustomer = async (params: any) => {
	const {
		userId,
		bankToken,
		countryCode,
		email,
		currency,
		accountId,
		accountHolderType,
		ip,
		address,
		dateOfBirth,
		ssnLastFour,
		phone,
		firstName,
		lastName,
		gender,
	} = params;
	try {
		let account;

		console.log("accountId", accountId);

		if (accountId) {
			account = await stripe.accounts.update(accountId, {
				external_account: bankToken,
				business_type: accountHolderType,
			});
		} else {
			const dob = dateOfBirth.split("-");
			account = await stripe.accounts.create({
				type: "custom",
				capabilities: {
					card_payments: { requested: true },
					transfers: { requested: true },
				},
				country: countryCode,
				email: email,
				external_account: bankToken,
				default_currency: currency,
				business_type: accountHolderType,
				tos_acceptance: {
					date: Math.floor(Date.now() / 1000),
					ip,
				},
				individual: {
					address: {
						city: address.city,
						country: address.country,
						line1: address.line1,
						line2: address.lin2,
						postal_code: address.postalCode,
						state: address.state,
					},
					dob: {
						day: dob[2],
						month: dob[1],
						year: dob[0],
					},
					email,
					ssn_last_4: ssnLastFour,
					phone,
					first_name: firstName,
					last_name: lastName,
					gender,
				},
				business_profile: {
					url: CLASSROOMDOOR_WEB_URL,
					support_url: CLASSROOMDOOR_WEB_URL,
				},
			});
		}

		const stripePayoutAccount = {
			accountId: account.id,
			bankAccount: account.external_accounts?.data[0],
			accountType: account.type,
			capabilities: account.capabilities,
		};

		await userMetaCollection.doc(userId).update({ stripePayoutAccount });
		return { stripePayoutAccount };
	} catch (err) {
		console.log("err", JSON.stringify(err));
		return { message: err };
	}
};

export const payoutToTutor = async (params: any) => {
	const { amount, accountId, bookingId } = params;

	const transfer = await stripe.transfers.create({
		amount: amount * 100,
		currency: "usd",
		destination: accountId,
		transfer_group: bookingId,
	});

	return transfer;
};
