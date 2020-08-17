import { userCollection, firestoreDB } from "../db";

export const getUsersById = async (userIds: string[]): Promise<any> => {
	const allUserData = userIds.map((id: string) => {
		return userCollection
			.doc(id)
			.get()
			.then((doc) => doc.data());
	});
	return Promise.all(allUserData);
};

export const getAllUsers = async (): Promise<any> => {
	const usersQuery = await userCollection.orderBy("name", "asc").get();
	return usersQuery.docs.map((docItem, index) => ({
		...docItem.data(),
	}));
};

export const getUsers = async (userIds: string[]): Promise<any> => {
	let users: any;

	if (userIds && userIds.length > 0) {
		users = await getUsersById(userIds);

		return users;
	}

	users = await getAllUsers();
	return users;
};

export const getRoomMembers = async (userIds: string[]): Promise<any> => {
	const roomMembers = await getUsersById(userIds);
	return roomMembers;
};

export const getUserImage = async (userId: string): Promise<string> => {
	const userSnapshot = await userCollection.doc(userId).get();
	const user: any = userSnapshot.data();
	const { profilePic = {} } = user;
	const { downloadURL = "" } = profilePic;
	return downloadURL;
};

export const updateUserProfileDetails = async (): Promise<any> => {
	const batch = firestoreDB.batch();
	const querySnapshot = await userCollection.get();
	querySnapshot.forEach((doc) => {
		const data = doc.data();
		console.log("userId-updateUserProfileDetails", doc.id);
		let { gender = "MALE" } = data;

		if (typeof gender !== "string") {
			gender = "MALE";
		}
		const newGenderValue: string = gender ? gender.toUpperCase() : "MALE";
		console.log(`User Gender ::: ${doc.id} -- ${gender}, ${newGenderValue}`);

		batch.update(firestoreDB.collection("users").doc(doc.id), {
			...data,
			gender: newGenderValue,
		});
	});
	const result = batch.commit();
	return result;
};

export const removeAllRoomFromFirestore = async (): Promise<any> => {
	const querySnapshot = await userCollection.get();

	const getUsersRef = () => userCollection;
	const getUserRef = (userId: string) => getUsersRef().doc(userId);
	const getUserRoomsRef = (userId: string) =>
		getUserRef(userId).collection("rooms");

	querySnapshot.docs.map(async (docItem: any) => {
		const userRoomsQuery = await getUserRoomsRef(docItem.userId).get();
		const userRoomIds: any[] = [];
		const userRoomsMap: any = {};

		userRoomsQuery.docs.forEach((doc) => {
			const data = doc.data();
			userRoomsMap[doc.id] = data;
			userRoomIds.push(doc.id);
		});
	});
	return true;
};

export const migrateUserMeta = async () => {
	await updateUserProfileDetails();
	const batch = firestoreDB.batch();
	const querySnapshot = await firestoreDB.collection("userMeta").get();
	querySnapshot.forEach((doc) => {
		const data = doc.data();
		const userId = doc.id;

		batch.set(firestoreDB.collection("user-meta").doc(userId), {
			...data,
		});

		// delete attribute from user delete attributes from teacher or student
	});
	const result = batch.commit();
	return result;
};
