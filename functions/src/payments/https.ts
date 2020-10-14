import * as functions from "firebase-functions";
import * as methods from "./methods";

/** PAYMENTS APIS **/

// TO TEST STRIPE QUERIES WITHOUT CALLABLE
export const testPayment = functions.https.onRequest((req: any, res: any) => {
	methods
		.creatStripeCustomer(req.body)
		.then((customer) => {
			res.json({
				success: true,
				customer,
			});
		})
		.catch((err) => {
			console.log("err", err);
			res.json({
				success: false,
				error: err,
			});
		});
});

// WEBHOOK FOR STRIPE PAYMENT
export const stripeWebhook = functions.https.onRequest((req: any, res: any) => {
	methods
		.updatePaymentStatus(req)
		.then((result) => {
			res.json(result);
		})
		.catch((err) => {
			console.log("err", err);
			res.status(400).json(err);
		});
});
