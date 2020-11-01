import * as functions from "firebase-functions";
import { payTutorBookingAmount } from "./methods";

// This functions requires billing to be enabled

// CHECK FOR PENDING AMOUNT TRANSFER TO TUTOR
export const checkPendingTransfers = functions
	.runWith({ memory: "2GB" })
	.pubsub.schedule("0 * * * *")
	.onRun(async (context) => {
		console.log("checkPendingTransfers");
		await payTutorBookingAmount();
	});
