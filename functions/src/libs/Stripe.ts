import Stripe from "stripe";

const stripe = new Stripe(
	"sk_test_51H33lzEidh2gujSuiBX3hbXp8PgHfAdv83rGfkdXYIEjXsgp4ePn01sD2OoxK80b2v5sRR4mBkBXnG65lM6Av3RJ001VQ2YpYR",
	{
		apiVersion: "2020-08-27",
		typescript: true,
	}
);

export default stripe;
