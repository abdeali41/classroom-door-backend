import * as admin from "firebase-admin";
import {
	userCollection,
	getChatsRef,
	getChatMetaRef,
	getChatConversationRef,
	userMetaCollection,
} from "../db";
import { chatTypes, userMetaSubCollectionKeys } from "../db/enum";

const { database, firestore } = admin;

export const createChat = async (
	params: createChatParams
): Promise<createChatReturnType> => {
	const { userId, memberIds, groupName } = params;

	const newChatRef = getChatsRef(chatTypes.GROUP_CHATS).push();
	const chatId: string = newChatRef.key || "";

	const isGroup = memberIds.length > 1;

	const chatMeta: chatMetaType = {
		id: chatId,
		createdAt: database.ServerValue.TIMESTAMP,
		updatedAt: database.ServerValue.TIMESTAMP,
		isGroup,
		members: [...memberIds, userId],
		groupName: groupName || "",
	};

	await getChatMetaRef(chatTypes.GROUP_CHATS, chatId).update(chatMeta);
	await userMetaCollection.doc(userId).update({
		chats: firestore.FieldValue.arrayUnion(chatId),
	});

	memberIds.forEach(async (memberId: string) => {
		await userMetaCollection.doc(memberId).update({
			chats: firestore.FieldValue.arrayUnion(chatId),
		});
	});

	const membersQuery = await userCollection
		.where("userId", "in", memberIds)
		.get();

	const members = membersQuery.docs.map((doc) => {
		const {
			firstName,
			lastName,
			userId: mId,
			profilePic,
			userType,
		} = doc.data();

		return {
			firstName,
			lastName,
			userId: mId,
			profilePic,
			userType,
		};
	});

	return {
		chatId,
		...chatMeta,
		lastMessage: {},
		members,
		memberIds,
	};
};

export const getUserMessages = async (
	params: userMessagesParams
): Promise<userMessagesReturnType> => {
	const { userId } = params;

	const userMetaSnapshot = userMetaCollection.doc(userId).get();
	const userMeta = (await userMetaSnapshot).data();

	const { chats = [] }: any = userMeta;

	console.log("chats", chats);

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

		const chatMeta = chatMetaRef.val() || [];

		const memberIdsWithoutUserId = chatMeta.members.filter(
			(m: string) => m !== userId
		);

		const membersQuery = userCollection
			.where("userId", "in", memberIdsWithoutUserId)
			.get();

		const members: Array<any> = [];

		(await membersQuery).docs.forEach((doc) => {
			const {
				firstName,
				lastName,
				userId: mId,
				profilePic,
				userType,
			} = doc.data();
			members.push({ firstName, lastName, userId: mId, profilePic, userType });
		});

		return {
			...chatMeta,
			lastMessage,
			members,
			memberIds: memberIdsWithoutUserId,
		};
	});

	const allMessages: object[] = await Promise.all(messagesArr);

	const messages = allMessages
		.filter((msg: any) => {
			const deletedBy = msg.deletedBy || {};
			const archivedBy = msg.archivedBy || {};
			if (deletedBy[userId] || archivedBy[userId]) {
				return false;
			}
			return true;
		})
		.sort((a: any, b: any) => b.updatedAt - a.updatedAt);

	const archived = allMessages
		.filter((msg: any) => {
			const archivedBy = msg.archivedBy || {};
			if (archivedBy[userId]) {
				return true;
			}
			return false;
		})
		.sort((a: any, b: any) => b.updatedAt - a.updatedAt);

	return {
		messages,
		archived,
	};
};

export const getConnectedPeople = async (
	params: userMessagesParams
): Promise<any> => {
	const { userId } = params;
	const userConnectedPeopleSnapshot = await userMetaCollection
		.doc(userId)
		.collection(userMetaSubCollectionKeys.CONNECTED_PEOPLE)
		.get();

	const peoples = userConnectedPeopleSnapshot.docs.map((snap) => {
		const snapData = snap.data();
		const {
			type,
			firstName,
			lastName,
			profilePic,
			userId: peopleId,
			email,
		} = snapData;
		return { type, firstName, lastName, profilePic, userId: peopleId, email };
	});

	return peoples;
};
