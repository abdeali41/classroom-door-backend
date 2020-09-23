import * as functions from "firebase-functions";
import * as methods from "./methods";

/** EPICBOARD APIS **/

// TO CREATE OPENVIDU TOKEN FOR CALLING
export const getOpenviduToken = functions.https.onRequest(async (req, res) => {
	const { sessionId }: any = req.body;
	methods
		.getOpenviduToken({ sessionId })
		.then((result) => {
			res.json(result);
		})
		.catch((err) => {
			res.json(err);
		});
});
