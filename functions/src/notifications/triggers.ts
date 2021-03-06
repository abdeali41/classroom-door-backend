import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { notificationTypes } from "../libs/constants";
import { capitalizeName } from "../libs/generics";
import {
	userCollection,
	notificationCollection,
	getChatMetaUpdatedAtRef,
} from "../db";

/** NOTIFICATION TRIGGERS **/

// FOR SENDING PUSH NOTIFICATIONS WHEN USER SENDS MESSAGE
export const newMessageNotification = functions.database
	.ref(`chats/{chatId}/conversation/{messageId}`)
	.onCreate(async (snapshot, context) => {
		const message = snapshot.val();
		const chatId = context.params.chatId;
		const messageId = context.params.messageId;
		const senderId = message.senderId;

		await getChatMetaUpdatedAtRef(chatId).set(
			admin.database.ServerValue.TIMESTAMP
		);

		const roomMembersPath = `chats/${chatId}/meta/members`;

		const roomMembers = await admin
			.database()
			.ref(roomMembersPath)
			.once("value");

		let roomMemberIds: Array<string | null> = [];

		const senderSnapshot = await userCollection.doc(senderId).get();
		const sender = senderSnapshot.data() || {};

		roomMemberIds = roomMembers.val();

		const receiverIds = roomMemberIds.filter((rm) => rm !== senderId);

		console.log("sender", sender);

		const senderName = sender.firstName
			? capitalizeName(sender.firstName, sender.lastName)
			: "";

		const notificationType = message.image
			? notificationTypes.image
			: notificationTypes.text;

		const notification: NotificationObj = {
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
