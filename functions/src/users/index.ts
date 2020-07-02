import * as functions from "firebase-functions";
import { userCollection } from "../db";

type userIdType = string;

export const getUsers = functions.https.onCall(
	(request: { userIds?: string[] }) => {
		console.log("User endpoint Request::", request);
		const { userIds } = request;
		// check if request is for some userIds
		if (userIds && userIds.length > 0) {
			return getUsersById(userIds)
				.then((res) => res)
				.catch((err) => new Error(err));
		}

		return getAllUsers()
			.then((res) => res)
			.catch((err) => new Error(err));
	}
);

export const getUsersById = async (userIds: userIdType[]) => {
	const allUserData = userIds.map((id: string) => {
		return userCollection
			.doc(id)
			.get()
			.then((doc) => doc.data());
	});
	return Promise.all(allUserData);
};

export const getAllUsers = async () => {
	const usersQuery = await userCollection.orderBy("name", "asc").get();
	return usersQuery.docs.map((docItem, index) => ({
		...docItem.data(),
	}));
};

export const getRoomMembers = functions.https.onRequest(
	async (req: any, res: any) => {
		const { userIds } = req.body;
		const roomMembers = await getUsersById(userIds);
		res.status(200).json({
			success: true,
			message: "Room members!",
			roomMembers: roomMembers,
		});
	}
);

export const getUserImage = functions.https.onRequest(async (req, res) => {
	const userId: any = req.query.userId;
	const userSnapshot = await userCollection.doc(userId).get();
	const user: any = userSnapshot.data();
	const { profilePic = {} } = user;
	const { downloadUrl = "" } = profilePic;

	res.redirect(downloadUrl);
});
