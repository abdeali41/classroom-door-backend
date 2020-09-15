// import { updateBookingRequest } from "../booking/methods";
import Stripe from "stripe";
import stripe from "../libs/Stripe";

export const acceptAndPayForBooking = async (
	params: acceptAndPayForBookingParams
): Promise<any> => {
	const { stripeToken }: any = params;

	console.log("stripeToken.tokenId", stripeToken.tokenId);
	// try {
	// 	const updatedBooking = await updateBookingRequest({ userId, ...booking });
	// } catch (e) {
	// 	return {
	// 		message: "Unable to make accept booking",
	// 	};
	// }

	try {
		const charge = await stripe.charges.create({
			amount: 2000,
			currency: "usd",
			source: stripeToken.tokenId,
			description: "My TCD Test Charge ",
			shipping: { name: "Test", address: { line1: "line1", country: "US" } },
		});
		// const paymentIntent = await stripe.paymentIntents.create({
		// 	amount: 100,
		// 	currency: "USD",
		// 	payment_method: stripeToken,
		// 	capture_method: "automatic",
		// 	confirm: true,
		// });

		// console.log("paymentIntent", paymentIntent);
		console.log("charge.id", charge.id);

		if (charge && charge.id && charge.status === "succeeded") {
			// const capturedPay = await stripe.paymentIntents.capture(
			// 	paymentIntent.id,
			// 	{
			// 		amount_to_capture: 100,
			// 	}
			// );

			const captureCharge = await stripe.charges.capture(charge.id);
			console.log("captureCharge", captureCharge);

			if (captureCharge && captureCharge.status === "succeeded") {
				return captureCharge;
			} else {
				return {
					message: "Something went wrong with payment",
				};
			}
		} else {
			return {
				message: "Something went wrong with payment",
			};
		}
	} catch (err) {
		console.log("error in payment", err);
		return {
			message: "Unable to process payment at this moment",
		};
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
