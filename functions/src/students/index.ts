import * as functions from "firebase-functions";
import { studentCollection, userCollection } from "..";

export const getAllStudents = async () => {
	const studentPreferencesSnapshot = await studentCollection.get();

	const allStudentsData = studentPreferencesSnapshot.docs.map(studentDoc => {
		const studentDetails = studentDoc.data();
		const userID = studentDetails.userId;
		return userCollection
			.doc(userID)
			.get()
			.then(data => ({ ...studentDetails, ...data.data() }));
	});
	return Promise.all(allStudentsData);
};

export const toggleMarkAsFavorite = functions.https.onRequest(
	async (req: any, res: any) => {
		const { studentId, teacherId } = req.body;
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

		studentDoc
			.update({
				userMeta: student.userMeta,
				studentEducationStatus: "Educated"
			})
			.then(() =>
				res.json({
					success: true,
					message: "Mark as favorite status changed!",
					favorites: userMeta.favorites
				})
			)
			.catch(err =>
				res.json({
					success: false,
					message: err
				})
			);
	}
);
