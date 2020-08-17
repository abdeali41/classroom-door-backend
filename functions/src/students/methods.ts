import { studentCollection, userCollection, firestoreDB } from "../db";

export const getAllStudents = async (): Promise<any> => {
	const usersQuery = await userCollection
		.where("userType", "==", "Student")
		.get();

	const userIds: Array<string> = [];
	const userMap: any = {};

	usersQuery.docs.forEach((doc) => {
		const data = doc.data();
		data.id = doc.id;
		userMap[doc.id] = data;
		userIds.push(doc.id);
	});

	const studentQuery = await studentCollection.get();

	studentQuery.docs.forEach((doc) => {
		const studentData = doc.data();

		if (studentData.userId) {
			userMap[studentData.userId] = {
				...userMap[studentData.userId],
				...studentData,
			};
		}
	});

	const students = Object.values(userMap);

	return { students };
};

export const toggleMarkAsFavorite = async (
	params: toggleMarkAsFavoriteParams
): Promise<any> => {
	const { studentId, teacherId } = params;
	const studentDoc = studentCollection.doc(studentId);
	const student = await studentDoc.get().then((doc: any) => doc.data());

	const userMeta =
		student.userMeta === undefined ? { favorites: [] } : student.userMeta;

	userMeta.favorites =
		userMeta.favorites === undefined
			? [teacherId]
			: userMeta.favorites.includes(teacherId)
			? student.userMeta.favorites.filter((f: String) => f !== teacherId)
			: [teacherId];

	student.userMeta = userMeta;

	await studentDoc.update({
		userMeta: student.userMeta,
		studentEducationStatus: "Educated",
	});

	return { favorites: userMeta.favorites || [] };
};

export const updateStudentPreferences = async () => {
	const batch = firestoreDB.batch();
	const querySnapshot = await studentCollection.get();
	querySnapshot.forEach((doc) => {
		const data = doc.data();

		const newData = {
			...data,
			userMeta: {
				favorites: [], // id array of userIds
				ratings: {
					average: 0, // initially zero
					reviews: [], // id array of Reviews from other collections.
				},
				sessionsCompleted: 0,
			},
		};

		batch.set(studentCollection.doc(doc.id), newData);
	});
	const result = batch.commit();

	return result;
};
