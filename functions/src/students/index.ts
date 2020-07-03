import * as functions from "firebase-functions";
import { studentCollection, userCollection } from "../db";

export const getAllStudents = functions.https.onRequest(
	async (req: any, res: any) => {
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

		res.json({
			success: true,
			message: "Fetched list of all students!",
			students: Object.values(userMap),
		});
	}
);

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
				studentEducationStatus: "Educated",
			})
			.then(() =>
				res.json({
					success: true,
					message: "Mark as favorite status changed!",
					favorites: userMeta.favorites,
				})
			)
			.catch((err) =>
				res.json({
					success: false,
					message: err,
				})
			);
	}
);
