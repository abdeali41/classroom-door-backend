import Stripe from "stripe";
const stripeKey: any =
	process.env.STRIPE_PROD_KEY || process.env.STRIPE_DEV_KEY;
const stripe = new Stripe(stripeKey, {
	apiVersion: "2020-08-27",
	typescript: true,
});

export default stripe;
