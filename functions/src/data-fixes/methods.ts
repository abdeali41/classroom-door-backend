import {
	userCollection,
	// getChatsRef,
	// getChatRef,
	// teacherCollection,
	// studentCollection,
	// teacherCollection,
	// studentCollection,
	// userMetaCollection,
	// firestoreDB,
} from "../db";
// import { chatTypes } from "../libs/constants";
import * as admin from "firebase-admin";

// const defaultProfilePic = {
// 	storagePath: "/users/NGprqEvRScgzN7AVblfsNUmDAcu1/public/profileImage",
// 	downloadURL:
// 		"https://firebasestorage.googleapis.com/v0/b/classroom-door.appspot.com/o/users%2FNGprqEvRScgzN7AVblfsNUmDAcu1%2Fpublic%2FprofileImage?alt=media&token=43ab0cad-72ed-4cae-875f-348470af49e5",
// };

// const invalidFirstNames = [
// 	"R",
// 	"Al",
// 	"Sena",
// 	"A",
// 	"Asfsds",
// 	"Xefdfxdxxfdxfdxfszfs",
// 	"A",
// 	"p41",
// 	"Inci",
// 	"D",
// 	"Afsetgdsrgs",
// 	"Abhijeet",
// 	"Fsdf",
// 	"First",
// 	"Test",
// 	"Congress",
// 	"ab",
// 	"Shiv",
// 	"Tharak",
// 	"Prakash",
// 	"Test user",
// 	"Dnyanesh",
// 	"Dnyanesh",
// 	"Bio",
// 	"Sssaa",
// 	"Ajit",
// 	"test",
// 	"Sdsd",
// 	"Jhvjhv",
// 	"Particle",
// 	"Test",
// 	"John",
// 	"Sachin",
// 	"ABHIJEER",
// 	"A",
// 	"Jamia",
// 	"Beti",
// 	"Dgsfg",
// 	"Dan",
// 	"Karni",
// 	"Prakash",
// 	"Ra",
// 	"First",
// 	"Raja",
// ];

// const deletingRes = {
// 	successType: "SHOW_DATA",
// 	message: "Query success!",
// 	data: {
// 		userIds: 127,
// 		authUserIds: 172,
// 		deletedUser: [
// 			"05yX0J4rz0ecGhLNJTUmjJ3UTYj2",
// 			"0ZRT2XhRJWYAGRKLZoGXb6UUE3A2",
// 			"0wZoqRbgnZUkPWRCBWqf8lVfW9m1",
// 			"1CUgWqdvqSdc9fQJrPoP6bPMVdl1",
// 			"4CXpsHGdgyTms1yJC1EoCDinCOt2",
// 			"5O9ysX1QwMQyyrkSuxc5U1E3fD52",
// 			"6Ry6dUVUh7YCTMTAw41FVK6A4NI3",
// 			"7ESmUGrzU6daSoRS1ZwNRxH53uc2",
// 			"90KPLZDIVYSu7W1dy09Qx3LN6qF2",
// 			"9sv0nu6PoEQIWzCo0muwTy3FDiQ2",
// 			"AGc7jqFPjYSKwWTs9B4OjZelT7y1",
// 			"B7ycP1WoepaZjcw4ya8ljPkSGbI3",
// 			"CoLMP7HL45h9DeeL8id28KfGHCG3",
// 			"D0mXv8kLdhQZLjr2cVDisWBjJy03",
// 			"EAgya9WqVUYOvU4wBBsEcc74nIp1",
// 			"FeqfyKuv0NdvIfsfnViIh0qOf3k2",
// 			"GZeuv1mSmphL7d7GyDPcUcVmCIv2",
// 			"Mzl7HgLFP1arnUR3cFHecixNYxD2",
// 			"OK9OE0kBUBP4GodiE1fw35glt7i1",
// 			"OKO4t0zRrkhKIH9qilOXDWDAvk03",
// 			"PS5ZwkUFFKhQUJX6RQ5dpvYxTcF3",
// 			"RlW2yhb9hZYo5NgrnRcKMV2N3qq1",
// 			"Rwn4kJJSPTXEpcu16whwwIf3uEJ3",
// 			"SN1ZrBwUSaTFgLfEASKvTyk34l62",
// 			"SaIAFzdLXzXUxZ8dcDWO88lluM42",
// 			"SrwvrQxercY7CAjO5NNbpi2Y7313",
// 			"Vb0RnFAGP7fLKIFJDccPgY81fdM2",
// 			"WBFeFmnKcYbRFKAGN0bP3EzUa0q1",
// 			"XCzUaTv2BuPREWJNHBvOST5o3ZZ2",
// 			"XtJE6cjS1kcHEtPf0TTLAfv3m642",
// 			"Y7gLycwrphUkch8fUPydUeT1ok43",
// 			"Y9QE6cV8EbbQW7YMCGnSdvxMzQ52",
// 			"YGD9cipqYGeJv2fpH110vzxEmJ32",
// 			"YmvL1b85tuRE08niHYH1dBLPvKY2",
// 			"cxjWF69qwRcN6NtGrLJnKs0bRx93",
// 			"eB49Oqn9O1Qw2XPno1qrBPMqQ2I3",
// 			"eXAS0UCDRSRq6iSg3481adjP0Pc2",
// 			"kZxOqPM3fVRHCiqlafcOn8FttOU2",
// 			"mFdj12FyL2dDdcU3JVkd0ScuQHn1",
// 			"meZ18PYlKnh2gxK3KR8p0VbxKGx1",
// 			"qCEekEikieQ0EqnXTkrfZKcX5IX2",
// 			"rRKt3QBsAhYfoUmeUwdxBkZuFkP2",
// 			"snSKxoumw5XB7ypwSwPovlnTZCv1",
// 			"thhhcYAcn1ZoaEpMvYrCgitvYzi2",
// 			"tkhVoaN0R3RE1LNdKhj7IVeenPj1",
// 			"xC3vYxcXOcMlqhi5UUAiRkKSKAO2",
// 			"yTMLGzbgueVYAqkPgyXfz7cJSXI3",
// 			"ycoBuiX08PXnqbPaBxeJ9NRxW6w1",
// 			"yqbSVKQdA9VQ24kwnxR92FV1efB2",
// 		],
// 		deletedUserLength: 49,
// 	},
// };

// const revRes = {
// 	successType: "SHOW_DATA",
// 	message: "Query success!",
// 	data: {
// 		userIds: 127,
// 		authUserIds: 123,
// 		deletedUser: [
// 			"2JIMeorhuTVlM6yjTzBhEdBORA62",
// 			"a8eUF9MBFkS7j6akr9q8ZOoshsG3",
// 			"lI4bfOCOIyPMXlHjyWlA",
// 			"vIfTkvdGY9axrXeZ2XSO",
// 		],
// 		deletedUserLength: 4,
// 	},
// };

export const removeAllNonFirstNameUsers = async () => {
	const usersQuery = await userCollection.get();
	const userDocs = usersQuery.docs.map((docItem) => {
		// const data = docItem.data();
		return docItem.id;
	});
	const getUsersResult = await admin.auth().listUsers(1000);
	const authUserIds = getUsersResult.users.map((userRecord) => {
		return userRecord.uid;
	});

	const deletedUser = userDocs.filter((x) => !authUserIds.includes(x));

	return {
		userIds: userDocs.length,
		authUserIds: authUserIds.length,
		deletedUser,
		deletedUserLength: deletedUser.length,
	};

	// const deleteUsersResult = await admin.auth().deleteUsers(deletedUser);

	// return deleteUsersResult;

	// const chatRef = await getChatsRef(chatTypes.GROUP_CHATS)
	// 	.orderByKey()
	// 	.once("value");
	// const chatsVal = chatRef.val();

	// const groupIds = Object.values(chatsVal).map((chat: any) => {
	// 	const { meta } = chat;
	// 	const { members = [] } = meta;

	// const difference = members.filter((x) => !userDocs.includes(x));

	// 	if (difference.length > 0) {
	// 		return meta.id;
	// 	} else {
	// 		return null;
	// 	}
	// });

	// const filteredGroupIds = groupIds.filter((d) => d !== null);

	// const deleteGroupChats = filteredGroupIds.map(async (gId) => {
	// 	await getChatRef(chatTypes.GROUP_CHATS, gId).remove();
	// 	return gId;
	// });

	// return Promise.all(deleteGroupChats);

	// const userDocs = usersQuery.docs.map(async (docItem) => {
	// 	const data = docItem.data();
	// 	const { chats = [] } = data;

	// 	const newChats = chats.filter((x) => !filteredGroupIds.includes(x));
	// 	console.log("newChats", newChats);
	// 	await userCollection.doc(docItem.id).update({ chats: newChats });
	// 	return docItem.id;
	// });

	// return Promise.all(userDocs);

	// const changedTeacher = invalidUserIds.map(async (userId: any) => {
	// 	await studentCollection.doc(userId).update({
	// 		userMeta: admin.firestore.FieldValue.delete(),
	// 	});
	// 	// return rooms.docs.map((doc) => ({ ...doc.data() }));
	// 	return userId;
	// });

	// return Promise.all(changedTeacher);
};

export const deleteCollection = (db, collectionPath, batchSize) => {
	const collectionRef = db.collection(collectionPath);
	const query = collectionRef.limit(batchSize);

	return new Promise((resolve, reject) => {
		deleteQueryBatch(db, query, resolve).catch(reject);
	});
};

export const deleteQueryBatch = async (db, query, resolve) => {
	const snapshot = await query.get();

	const batchSize = snapshot.size;
	if (batchSize === 0) {
		// When there are no documents left, we are done
		resolve();
		return;
	}

	// Delete documents in a batch
	const batch = db.batch();
	snapshot.docs.forEach((doc) => {
		batch.delete(doc.ref);
	});
	await batch.commit();

	// Recurse on the next process tick, to avoid
	// exploding the stack.
	process.nextTick(() => {
		return deleteQueryBatch(db, query, resolve);
	});
};
