import * as admin from "firebase-admin";
import {
	userCollection,
	getChatsRef,
	getChatMetaRef,
	getChatConversationRef,
} from "../db";
import { chatTypes } from "../db/enum";

const { database, firestore } = admin;

export const createChat = async (
	params: createChatParams
): Promise<createChatReturnType> => {
	const { userId, memberIds, groupName } = params;

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

	return { chatId };
};

export const getUserMessages = async (
	params: userMessagesParams
): Promise<userMessagesReturnType> => {
	const { userId } = params;

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

		const lastMessage = lastMessageRef.val()
			? Object.values(lastMessageRef.val())[0]
			: {};

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

		return {
			...chatMeta,
			lastMessage,
			members,
			memberIds: memberIdsWithoutUserId,
		};
	});

	const allMessages: object[] = await Promise.all(messagesArr);

	const messages = allMessages.filter((msg: any) => {
		const deletedBy = msg.deletedBy || {};
		const archivedBy = msg.archivedBy || {};
		if (deletedBy[userId] || archivedBy[userId]) {
			return false;
		}
		return true;
	});

	const archived = allMessages.filter((msg: any) => {
		const archivedBy = msg.archivedBy || {};
		if (archivedBy[userId]) {
			return true;
		}
		return false;
	});

	return {
		messages,
		archived,
	};
};
