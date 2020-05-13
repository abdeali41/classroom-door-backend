import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { userCollection } from "..";

const { database, firestore } = admin;

const chatTypes = {
	ROOM_CHATS: "room-chats",
	GROUP_CHATS: "group-chats",
};

const getChatsRef = (chatType: string) => database().ref(`chats/${chatType}`);
const getChatRef = (chatType: string, chatId: string) =>
	getChatsRef(chatType).child(chatId);
const getChatMetaRef = (chatType: string, chatId: string) =>
	getChatRef(chatType, chatId).child("meta");
const getChatConversationRef = (chatType: string, chatId: string) =>
	getChatRef(chatType, chatId).child("conversation");

export const createGroupChat = functions.https.onRequest(async (req, res) => {
	const { userId, memberIds, groupName }: any = req.body;

	const newChatRef = getChatsRef(chatTypes.GROUP_CHATS).push();
	const chatId: string = newChatRef.key || "";

	const isGroup = memberIds.length > 1;

	const chatMeta = {
		id: chatId,
		createdAt: database.ServerValue.TIMESTAMP,
		isGroup,
		members: [...memberIds, userId],
		groupName: groupName || "",
	};

	await getChatMetaRef(chatTypes.GROUP_CHATS, chatId).update(chatMeta);
	await userCollection.doc(userId).update({
		chats: firestore.FieldValue.arrayUnion(chatId),
	});

	memberIds.forEach(async (memberId: string) => {
		await userCollection.doc(memberId).update({
			chats: firestore.FieldValue.arrayUnion(chatId),
		});
	});

	res.json({
		success: true,
		message: "New group created!",
		chatId,
	});
});

export const getMessaingList = functions.https.onRequest(async (req, res) => {
	const { userId }: any = req.body;

	const userSnapshot = userCollection.doc(userId).get();
	const user = (await userSnapshot).data();

	const { chats = [] }: any = user;

	const messagesArr = chats.map(async (chatId: string) => {
		const lastMessageRef = await getChatConversationRef(
			chatTypes.GROUP_CHATS,
			chatId
		)
			.orderByKey()
			.limitToLast(1)
			.once("value");

		const lastMessage = lastMessageRef.val();

		const chatMetaRef = await getChatMetaRef(
			chatTypes.GROUP_CHATS,
			chatId
		).once("value");

		const chatMeta = chatMetaRef.val();

		const memberIdsWithoutUserId = chatMeta.members.filter(
			(m: string) => m !== userId
		);

		const membersQuery = userCollection
			.where("userId", "in", memberIdsWithoutUserId)
			.get();

		const members: Array<any> = [];

		(await membersQuery).docs.forEach((doc) => {
			members.push(doc.data());
		});

		return { ...chatMeta, lastMessage, members };
	});

	const messages = await Promise.all(messagesArr);
	res.json({
		success: true,
		message: "fetch all recent messages!",
		messages: messages,
	});
});
