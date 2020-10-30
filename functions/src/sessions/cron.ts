import * as functions from "firebase-functions";
import { changeCompletedSessionStatus } from "./methods";

// This functions requires billing to be enabled

// EPICBOARD ROOM CRON TO DELETE ROOM AFTER THE SESSION IS COMPLETED
export const deleteRTDEpicboardRoom = functions
	.runWith({ memory: "2GB" })
	.pubsub.schedule("0 0 1 * *")
	.onRun((context) => {
		console.log("deleteRTDEpicboardRoom running every month");
	});

export const sessionCompletionStatusCheck = functions
	.runWith({ memory: "2GB" })
	.pubsub.schedule("*/5 * * * *")
	.onRun(async (context) => {
		console.log("sessionCompletionStatusCheck");
		await changeCompletedSessionStatus();
	});
