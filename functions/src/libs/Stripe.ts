import Stripe from "stripe";

const stripeKey: any =
	process.env.STRIPE_PROD_KEY || process.env.STRIPE_DEV_KEY;

const stripe = new Stripe(stripeKey, {
	apiVersion: "2020-08-27",
	typescript: true,
});

const StripeEndpointSecret: any =
	process.env.STRIPE_WEBHOOK_SECRET_PROD ||
	process.env.STRIPE_WEBHOOK_SECRET_DEV;

export const getWebhookEvent = (payload: any, signature: any) =>
	stripe.webhooks.constructEvent(payload, signature, StripeEndpointSecret);

export default stripe;
