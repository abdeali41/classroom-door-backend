import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { notificationCollection, userCollection } from "..";

const notificationTypes = {
	text: "text",
	image: "image",
};

interface Notification {
	senderId: string;
	receiverIds: Array<string | null>;
	title: string;
	message: string;
	type: string;
	readAt: number | null;
	sentAt: object;
	createdAt: object;
}

const capitalizeName = (firstName: String, lastName: String) => {
	return `${firstName[0].toUpperCase() + firstName.slice(1).toLowerCase()} ${
		lastName[0].toUpperCase() + lastName.slice(1).toLowerCase()
	}.`;
};

export const sendNewMessageNotification = functions.database
	.ref(`chats/room-chats/{chatId}/conversation/{messageId}`)
	.onCreate(async (snapshot, context) => {
		const message = snapshot.val();
		const chatId = context.params.chatId;
		const messageId = context.params.messageId;
		const senderId = message.senderId;

		const roomMembers = await admin
			.database()
			.ref(`rooms/${chatId}/users`)
			.once("value");

		const roomMemberIds: Array<string | null> = [];

		const senderSnapshot = await userCollection.doc(senderId).get();
		const sender = senderSnapshot.data() || {};

		roomMembers.forEach((snap) => {
			roomMemberIds.push(snap.key);
		});

		const receiverIds = roomMemberIds.filter((rm) => rm !== senderId);

		console.log("sender", sender);

		const senderName = sender.firstName
			? capitalizeName(sender.firstName, sender.lastName)
			: "";

		const notificationType = message.image
			? notificationTypes.image
			: notificationTypes.text;

		const notification: Notification = {
			senderId,
			receiverIds,
			title: "message",
			message: message.text,
			type: notificationType,
			readAt: null,
			sentAt: admin.database.ServerValue.TIMESTAMP,
			createdAt: admin.database.ServerValue.TIMESTAMP,
		};

		const title = `New Message ${
			senderName !== "" ? `from ${senderName}` : ""
		}`;

		const payload = {
			data: { notificationType: "MESSAGE", messageId, chatId },
			notification: {
				title,
				body: message.text,
				image: message.image,
			},
		};

		await notificationCollection.doc().set(notification);

		const usersSnapshot = await userCollection
			.where("userId", "in", receiverIds)
			.get();
		const deviceTokens: Array<string> = [];
		usersSnapshot.forEach((doc) => {
			const userdata = doc.data();
			if (userdata.devices) {
				deviceTokens.push(userdata.devices.join());
			}
		});

		const result = await admin
			.messaging()
			.sendToDevice(deviceTokens.join(), payload);

		console.log(result);
		return null;
	});
