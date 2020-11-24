import Stripe from "stripe";
import env from "../env";

const stripeKey: any = env.STRIPE_KEY;

const stripe = new Stripe(stripeKey, {
	apiVersion: "2020-08-27",
	typescript: true,
});

const StripeEndpointSecret: any = env.STRIPE_WEBHOOK_SECRET;

export const getWebhookEvent = (payload: any, signature: any) =>
	stripe.webhooks.constructEvent(payload, signature, StripeEndpointSecret);

export default stripe;
