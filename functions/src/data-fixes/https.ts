import * as functions from "firebase-functions";
import * as methods from "./methods";
import SendResponse from "../libs/send-response";

// COMMON ENDPOINT FOR FIXING ANY ERRORS
export const fixDatabaseErrors = functions.https.onRequest(async (req, res) => {
	methods
		.removeAllNonFirstNameUsers()
		.then((result) => {
			SendResponse(res).success("Query success!", result);
		})
		.catch((err) => {
			console.log("err", err);
			SendResponse(res).failed("Query failed");
		});
});
