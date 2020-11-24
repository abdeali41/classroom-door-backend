import {
	bookingRequestCollection,
	firestoreDB,
	epicboardSessionCollection,
	userMetaCollection,
} from "../db";
import { userMetaSubCollectionKeys } from "../libs/constants";
import { verifySecret } from "../libs/generics";

export const deleteOldUserSessions = async (params: any) => {
	verifySecret(params);

	const { limit } = params;

	const batch = firestoreDB.batch();

	const bookingSnap = await bookingRequestCollection.limit(limit).get();

	const bookings = bookingSnap.docs.map(async (booking) => {
		const bookingRef = booking.ref;
		const bookingId = booking.id;

		console.log("bookingId", bookingId);

		const { studentId, teacherId } = booking.data();
		console.log("studentId, teacherId", studentId, teacherId);

		const sessions = await epicboardSessionCollection
			.where("bookingId", "==", bookingId)
			.get();

		const roomIds: string[] = [];
		const sessionIds: string[] = [];

		sessions.forEach((doc) => {
			const { roomId }: any = doc.data();

			if (!roomIds.includes(roomId)) {
				roomIds.push(roomId);
			}

			sessionIds.push(doc.id);

			batch.delete(doc.ref);
		});

		console.log("sessionIds", JSON.stringify(sessionIds));
		console.log("roomIds", JSON.stringify(roomIds));

		[studentId, teacherId].forEach((userId) => {
			sessionIds.forEach((sessionId) => {
				batch.delete(
					userMetaCollection
						.doc(userId)
						.collection(userMetaSubCollectionKeys.EPICBOARD_SESSION)
						.doc(sessionId)
				);
			});
			roomIds.forEach((roomId) => {
				batch.delete(
					userMetaCollection
						.doc(userId)
						.collection(userMetaSubCollectionKeys.EPICBOARD_ROOM)
						.doc(roomId)
				);
			});
			batch.delete(
				userMetaCollection
					.doc(userId)
					.collection(userMetaSubCollectionKeys.BOOKING_REQUEST)
					.doc(bookingId)
			);
		});

		batch.delete(bookingRef);

		return true;
	});

	const commits = await Promise.all(bookings);

	console.log("commits", JSON.stringify(commits));

	return batch.commit();
};
