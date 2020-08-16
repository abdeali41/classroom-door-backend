import * as functions from "firebase-functions";
import * as methods from "./methods";
import SendResponse from "../libs/send-response";

/** USERS APIS **/

// GET ALL USERS
export const getUsers = functions.https.onRequest((req: any, res: any) => {
	const { userIds } = req.body;
	methods
		.getUsers(userIds)
		.then((users) => {
			SendResponse(res).success("Query Success", users);
		})
		.catch((err) => {
			SendResponse(res).failed(err);
		});
});

// TO GET ALL USERS THAT BELONGS TO A PARTICULAR ROOM AND ALSO RETURN REMAINING USERS
export const roomMembers = functions.https.onRequest(
	async (req: any, res: any) => {
		const { userIds } = req.body;
		methods
			.getRoomMembers(userIds)
			.then((members) => {
				res.status(200).json({
					success: true,
					message: "Room members!",
					roomMembers: members,
				});
			})
			.catch((err) => {
				SendResponse(res).failed(err);
			});
	}
);

// GET USER IMAGE
export const userImage = functions.https.onRequest(
	async (req: any, res: any) => {
		const { userId } = req.query;
		methods
			.getUserImage(userId)
			.then((url) => {
				res.redirect(url);
			})
			.catch((err) => {
				SendResponse(res).failed(err);
			});
	}
);

// UPDATE USER PREFERENCES
export const updateUserData = functions.https.onRequest(
	async (req: any, res: any) => {
		methods
			.updateUserProfileDetails()
			.then((result) => {
				SendResponse(res).success("Query Success", result);
			})
			.catch((err) => {
				SendResponse(res).failed(err);
			});
	}
);

// DELETE ALL ROOMS
export const deleteAllRooms = functions.https.onRequest(
	async (req: any, res: any) => {
		methods
			.removeAllRoomFromFirestore()
			.then((result) => {
				SendResponse(res).success("Query Success", result);
			})
			.catch((err) => {
				SendResponse(res).failed(err);
			});
	}
);
