import * as functions from "firebase-functions";

// This functions requires billing to be enabled

// CHECK FOR PENDING AMOUNT TRANSFER TO TUTOR
export const checkPendingTransfers = functions
	.runWith({ memory: "2GB" })
	.pubsub.schedule("*/5 * * * *")
	.onRun((context) => {
		console.log("checkPendingTransfers", context);
	});
