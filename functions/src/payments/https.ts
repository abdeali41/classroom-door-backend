import * as functions from "firebase-functions";
import * as methods from "./methods";

/** PAYMENTS APIS **/

// TO TEST STRIPE QUERIES WITHOUT CALLABLE
export const testPayment = functions.https.onRequest((req: any, res: any) => {
	methods
		.payoutToTutor(req.body)
		.then((result) => {
			res.json(result);
		})
		.catch((err) => {
			console.log("err", err);
			res.json(err);
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

// WEBHOOK FOR STRIPE CONNECTED ACCOUNT
export const stripeConnectedAccWebhook = functions.https.onRequest(
	(req: any, res: any) => {
		methods
			.connectedAccountStatus(req)
			.then((result) => {
				res.json(result);
			})
			.catch((err) => {
				console.log("err", err);
				res.status(400).json(err);
			});
	}
);
