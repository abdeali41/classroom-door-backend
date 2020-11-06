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
	updateBookingPayoutStatus,
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
	return (amount - commission).toFixed(2);
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
				totalSessionLength,
				totalAmount,
				totalSessionCost,
				teacherPayoutAmount,
				serviceChargePercentage: SERVICE_CHARGE_PERCENTAGE_ON_BOOKING,
				tcdCommissionPercentage: TCD_COMMISSION_PERCENTAGE_ON_BOOKING,
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
				return [StripeStatus.PAYMENT_FAILURE, "Unable to process payment"];
			}
		} else {
			return [StripeStatus.PAYMENT_FAILURE, "Unable to process payment"];
		}
	} catch (err) {
		console.log("error in payment", JSON.stringify(err));
		return [StripeStatus.PAYMENT_FAILURE, err?.raw?.message];
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
				teacherPayoutStatus: TeacherPayoutStatus.REQUESTED,
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
			break;
		case "transfer.paid":
			await updateBookingPayoutStatus(eventObject.transfer_group, {
				teacherPayoutStatus: TeacherPayoutStatus.PAID,
				stripeTransferObject: eventObject,
			});
			break;
		case "transfer.failed":
			await updateBookingPayoutStatus(eventObject.transfer_group, {
				teacherPayoutStatus: TeacherPayoutStatus.FAILED,
				stripeTransferObject: eventObject,
			});
			break;
		case "account.updated":
			await updateAccountDetails(eventObject);
			break;
		case "account.application.authorized":
			break;
		case "account.application.deauthorized":
			break;
		// ... handle other event types
		default:
			console.log(`Unhandled event type ${event.type}`);
	}

	// Return a response to acknowledge receipt of the event
	return { received: true };
};

export const attachBankAccountToCustomer = async (params: any) => {
	try {
		const {
			userId,
			// countryCode,
			bankToken,
			email,
			currency,
			accountId,
			accountHolderType,
			ip,
			address,
			dateOfBirth,
			phone,
			firstName,
			lastName,
			gender,
			id_number,
		} = params;

		let account;

		console.log("accountId", accountId);

		const dob = dateOfBirth.split("-");

		const ssnLastFour = id_number.substr(-4);

		const accountParams = {
			external_account: bankToken,
			default_currency: currency,
			business_type: accountHolderType,
			individual: {
				address: {
					city: address.city,
					country: address.country,
					line1: address.line1,
					line2: address.line2,
					postal_code: address.postal_code,
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
				id_number,
			},
			metadata: { userId },
		};

		if (accountId) {
			account = await stripe.accounts.update(accountId, accountParams);
		} else {
			account = await stripe.accounts.create({
				type: "custom",
				capabilities: {
					transfers: { requested: true },
				},
				email: email,
				tos_acceptance: {
					date: Math.floor(Date.now() / 1000),
					ip,
				},
				business_profile: {
					mcc: "8299",
					url: CLASSROOMDOOR_WEB_URL,
					support_url: CLASSROOMDOOR_WEB_URL,
				},
				// country: countryCode,
				...accountParams,
			});
		}

		const stripePayoutAccount = {
			accountId: account.id,
			bankAccount: {
				id: account.external_accounts?.data[0].id,
				account_holder_name:
					account.external_accounts?.data[0].account_holder_name,
				account_holder_type:
					account.external_accounts?.data[0].account_holder_type,
				bank_name: account.external_accounts?.data[0].bank_name,
				country: account.external_accounts?.data[0].country,
				currency: account.external_accounts?.data[0].currency,
				last4: account.external_accounts?.data[0].last4,
				routing_number: account.external_accounts?.data[0].routing_number,
			},
			accountType: account.type,
			capabilities: account.capabilities,
			individual: {
				id: account.individual.id,
				address: account.individual.address,
				dob: account.individual.dob,
				email: account.individual.email,
				first_name: account.individual.first_name,
				gender: account.individual.gender,
				last_name: account.individual.last_name,
				phone: account.individual.phone,
			},
			metadata: account.metadata,
		};

		console.log("stripePayoutAccount", JSON.stringify(stripePayoutAccount));

		await userMetaCollection.doc(userId).update({ stripePayoutAccount });

		return { stripePayoutAccount };
	} catch (err) {
		console.log("err", JSON.stringify(err));
		return { message: err?.raw?.message, error: true };
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

const updateAccountDetails = async (account: any) => {
	const stripePayoutAccount = {
		accountId: account.id,
		bankAccount: {
			id: account.external_accounts?.data[0].id,
			account_holder_name:
				account.external_accounts?.data[0].account_holder_name,
			account_holder_type:
				account.external_accounts?.data[0].account_holder_type,
			bank_name: account.external_accounts?.data[0].bank_name,
			country: account.external_accounts?.data[0].country,
			currency: account.external_accounts?.data[0].currency,
			last4: account.external_accounts?.data[0].last4,
			routing_number: account.external_accounts?.data[0].routing_number,
		},
		accountType: account.type,
		capabilities: account.capabilities,
		individual: {
			id: account.individual.id,
			address: account.individual.address,
			dob: account.individual.dob,
			email: account.individual.email,
			first_name: account.individual.first_name,
			gender: account.individual.gender,
			last_name: account.individual.last_name,
			phone: account.individual.phone,
		},
		metadata: account.metadata,
	};

	await userMetaCollection
		.doc(account.metadata.userId)
		.update({ stripePayoutAccount });
};

export const connectedAccountStatus = async (request: any) => {
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

	// Handle the event
	switch (event.type) {
		case "account.updated":
			await updateAccountDetails(eventObject);
			break;
		case "account.application.authorized":
			break;
		case "account.application.deauthorized":
			break;
		// ... handle other event types
		default:
			console.log(`Unhandled event type ${event.type}`);
	}

	// Return a response to acknowledge receipt of the event
	return { updated: true };
};

export const stripeCustomerAccountCorrection = async (params: any) => {
	const customersList = await stripe.customers.list({
		limit: 100,
		starting_after: params.startId,
	});

	const customers = customersList.data;

	const done = await Promise.all(
		customers.map(async (cust) => {
			if (cust.name?.includes("undefined")) {
				const userMetaSnap = await userMetaCollection
					.where("stripeCustomer.id", "==", cust.id)
					.get();

				if (userMetaSnap.docs.length > 0) {
					const userId = userMetaSnap.docs[0].id;

					const userSnap = await userCollection.doc(userId).get();
					const user: any = userSnap.data();

					const { email, firstName, lastName } = user;

					const customer = await stripe.customers.update(cust.id, {
						email,
						name: `${firstName}  ${lastName}`,
					});

					await userMetaCollection
						.doc(userId)
						.update({ stripeCustomer: customer });

					return customer;
				} else {
					const customer = await stripe.customers.del(cust.id);

					return customer;
				}
			} else {
				return true;
			}
		})
	);

	return done;
};
