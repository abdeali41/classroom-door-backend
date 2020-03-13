import * as functions from "firebase-functions";
import { userCollection, realtimeDB } from "..";

type userIdType = string;

export const getUsersById = async (userIds: userIdType[]) => {
	const allUserData = userIds.map((id: string) => {
		return userCollection
			.doc(id)
			.get()
			.then(doc => doc.data());
	});
	return Promise.all(allUserData);
};

export const getAllUsers = async () => {
	const usersQuery = await userCollection.orderBy("name", "asc").get();
	return usersQuery.docs.map((docItem, index) => ({
		...docItem.data()
	}));
};

export const getRoomMembers = functions.https.onRequest(
	async (req: any, res: any) => {
		const { roomId } = req.body;

		const roomUsersSnapshot = await realtimeDB
			.ref("rooms")
			.child(roomId)
			.child("users")
			.once("value");
		roomUsersSnapshot.forEach((snap: any) => snap.key);
		// const usersQuery = await userCollection.orderBy("name", "asc").get();
		res.status(200).json(roomUsersSnapshot);
	}
);
