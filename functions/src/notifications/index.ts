import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { notificationCollection, userCollection } from "..";
import { chatTypes, notificationTypes } from "../libs/constants";
import { capitalizeName } from "../libs/generics";

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

export const sendNewMessageNotification = functions.database
	.ref(`chats/{chatType}/{chatId}/conversation/{messageId}`)
	.onCreate(async (snapshot, context) => {
		const message = snapshot.val();
		const chatId = context.params.chatId;
		const messageId = context.params.messageId;
		const chatType = context.params.chatType;
		const senderId = message.senderId;

		const roomMembersPath =
			chatType === chatTypes.ROOM_CHATS
				? `rooms/${chatId}/users`
				: `chats/group-chats/${chatId}/meta/members`;

		const roomMembers = await admin
			.database()
			.ref(roomMembersPath)
			.once("value");

		let roomMemberIds: Array<string | null> = [];

		const senderSnapshot = await userCollection.doc(senderId).get();
		const sender = senderSnapshot.data() || {};

		if (chatType === chatTypes.ROOM_CHATS) {
			roomMembers.forEach((snap) => {
				roomMemberIds.push(snap.key);
			});
		} else {
			roomMemberIds = roomMembers.val();
		}

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
			data: { notificationType: "MESSAGE", messageId, chatId, chatType },
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
