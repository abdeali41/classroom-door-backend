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
