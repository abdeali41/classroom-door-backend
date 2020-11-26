import * as functions from "firebase-functions";
import { verifySecret } from "../libs/generics";
import * as methods from "./methods";

/** FIXES APIS **/

// TO DELETE OLD SESSIONS AND BOOKINGS
export const deleteOldSessions = functions.https.onRequest(async (req, res) => {
	verifySecret(req, res);
	methods
		.deleteOldUserSessions(req.body)
		.then((result) => {
			res.json(result);
		})
		.catch((err) => {
			console.log("err", JSON.stringify(err));
			res.status(400).json({ error: err.message });
		});
});
