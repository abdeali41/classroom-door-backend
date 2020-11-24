const isProd = JSON.parse(process.env.IS_PROD || "false");

const env = {
	CLASSROOMDOOR_WEB_URL: isProd
		? process.env.CLASSROOMDOOR_WEB_PROD_URL
		: process.env.CLASSROOMDOOR_WEB_DEV_URL,

	OPENVIDU_SERVER_URL: isProd
		? process.env.OPENVIDU_PROD_URL
		: process.env.OPENVIDU_DEV_URL,

	OPENVIDU_SERVER_SECRET: isProd
		? process.env.OPENVIDU_PROD_SECURITY_TOKEN
		: process.env.OPENVIDU_DEV_SECURITY_TOKEN,

	STRIPE_KEY: isProd ? process.env.STRIPE_PROD_KEY : process.env.STRIPE_DEV_KEY,

	STRIPE_WEBHOOK_SECRET: isProd
		? process.env.STRIPE_WEBHOOK_SECRET_PROD
		: process.env.STRIPE_WEBHOOK_SECRET_DEV,

	FIREBASE_DATABASE_URL: isProd
		? process.env.FIREBASE_DATABASE_PROD_URL
		: process.env.FIREBASE_DATABASE_DEV_URL,

	FIREBASE_CERT_KEY: isProd
		? process.env.FIREBASE_PROD_CERT_KEY
		: process.env.FIREBASE_DEV_CERT_KEY,

	PROJECT_ID: isProd ? process.env.PROJECT_ID_PROD : process.env.PROJECT_ID_DEV,

	CLASSROOMDOOR_SUPPORT_EMAIL: process.env.CLASSROOMDOOR_SUPPORT_EMAIL,
};

export default env;
