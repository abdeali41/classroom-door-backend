import * as functions from "firebase-functions";
import { changeCompletedSessionStatus } from "./methods";

// This functions requires billing to be enabled

// EPICBOARD ROOM CRON TO DELETE ROOM AFTER THE SESSION IS COMPLETED
export const deleteRTDEpicboardRoom = functions
	.runWith({ memory: "2GB" })
	.pubsub.schedule("00 03 * * *")
	.onRun((context) => {
		console.log("context", context);
		console.log("This is running every minute", context);
	});

export const sessionCompletionStatusCheck = functions
	.runWith({ memory: "2GB" })
	.pubsub.schedule("*/5 * * * *")
	.onRun(async (context) => {
		console.log("sessionCompletionStatusCheck", JSON.stringify(context));
		await changeCompletedSessionStatus();
	});
