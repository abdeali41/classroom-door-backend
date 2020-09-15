type acceptAndPayForBookingParams = {
	userId: string;
	booking: object;
	cardDetails: object;
};

type StripeAddress = {
	line1: string;
	city?: string;
	country?: string;
	line2?: string;
	postal_code?: string;
	state?: string;
};

type StripeCustomer = {
	email: string;
	phone: string;
	name: string;
	address?: StripeAddress;
	description?: string;
	metadata?: string;
	payment_method?: string;
	shipping?: StripeBillingOrShippingDetails;
};

type StripeBillingOrShippingDetails = {
	address: StripeAddress;
	email: string;
	name: string;
	phone: string;
};

type StripeCard = {
	exp_month: string;
	exp_year: string;
	number: string;
	cvc: string;
};

type StripePaymentMethod = {
	type:
		| "alipay"
		| "au_becs_debit"
		| "bacs_debit"
		| "bancontact"
		| "card"
		| "eps"
		| "fpx"
		| "giropay"
		| "ideal"
		| "p24"
		| "sepa_debit";
	billing_details?: StripeBillingOrShippingDetails;
	card?: StripeCard;
	metadata: string;
};
