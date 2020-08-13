import * as functions from "firebase-functions";
import { getUserMessages, createChat } from "./methods";

/** MESSAGING APIS **/

// TO CREATE CHAT GROUP BETWEEN USERS
export const createGroupChat = functions.https.onRequest(async (req, res) => {
	const { userId, memberIds, groupName }: any = req.body;
	createChat({ userId, memberIds, groupName })
		.then((result) => {
			res.json({
				success: true,
				message: "New group created!",
				...result,
			});
		})
		.catch((err) => {
			res.json({
				success: false,
				message: err,
			});
		});
});

// TO GET ALL RECENT CHATS OF USERS
export const getMessagingList = functions.https.onRequest(async (req, res) => {
	const { userId } = req.body;
	getUserMessages({ userId })
		.then((result) => {
			res.json({
				success: true,
				message: "fetch all recent messages!",
				...result,
			});
		})
		.catch((err) => {
			res.json({
				success: false,
				message: err,
			});
		});
});
