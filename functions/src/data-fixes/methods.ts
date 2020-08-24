import {
	userCollection,
	// teacherCollection,
	// studentCollection,
	// teacherCollection,
	// studentCollection,
	// userMetaCollection,
	// firestoreDB,
} from "../db";
// import * as admin from "firebase-admin";

const defaultProfilePic = {
	storagePath: "/users/NGprqEvRScgzN7AVblfsNUmDAcu1/public/profileImage",
	downloadURL:
		"https://firebasestorage.googleapis.com/v0/b/classroom-door.appspot.com/o/users%2FNGprqEvRScgzN7AVblfsNUmDAcu1%2Fpublic%2FprofileImage?alt=media&token=43ab0cad-72ed-4cae-875f-348470af49e5",
};

const invalidFirstNames = [
	"R",
	"Al",
	"Sena",
	"A",
	"Asfsds",
	"Xefdfxdxxfdxfdxfszfs",
	"A",
	"p41",
	"Inci",
	"D",
	"Afsetgdsrgs",
	"Abhijeet",
	"Fsdf",
	"First",
	"Test",
	"Congress",
	"ab",
	"Shiv",
	"Tharak",
	"Prakash",
	"Test user",
	"Dnyanesh",
	"Dnyanesh",
	"Bio",
	"Sssaa",
	"Ajit",
	"test",
	"Sdsd",
	"Jhvjhv",
	"Particle",
	"Test",
	"John",
	"Sachin",
	"ABHIJEER",
	"A",
	"Jamia",
	"Beti",
	"Dgsfg",
	"Dan",
	"Karni",
	"Prakash",
	"Ra",
	"First",
	"Raja",
];

export const removeAllNonFirstNameUsers = async () => {
	console.log("invalidFirstNames", invalidFirstNames);
	console.log("defaultProfilePic", defaultProfilePic);

	const usersQuery = await userCollection.get();
	const userDocs = usersQuery.docs.map((docItem) => {
		// const data = docItem.data();
		return docItem.ref;
	});

	return userDocs;

	// const invalidUserIds = userDocs.filter((d) => d !== null);

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
