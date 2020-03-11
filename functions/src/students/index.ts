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

export const toggleMarkAsFavourite = functions.https.onRequest(
	async (req: any, res: any) => {
		const { studentId, teacherId } = req.body;
		const studentDoc = studentCollection.doc(studentId);
		const student = await studentDoc.get().then((doc: any) => doc.data());

		student.userMeta =
			student.userMeta === undefined
				? {
						favorites: [teacherId]
				  }
				: {
						...student.userMeta,
						favorites: student.userMeta.favorites.filter(
							(f: String) => f !== teacherId
						)
				  };

		studentDoc
			.update({
				userMeta: student.userMeta
			})
			.then(() =>
				res.json({
					success: true,
					message: "Mark as favorite status changed!"
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
