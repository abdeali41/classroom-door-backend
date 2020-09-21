type createChatParams = {
	userId: string;
	memberIds: string[];
	groupName: string;
};

type chatMetaType = {
	id: string;
	updatedAt: object;
	createdAt: object;
	isGroup: boolean;
	groupName: string;
	members: string[] | object[];
};

type createChatReturnType = chatMetaType & {
	chatId: string;
	lastMessage: object;
	members: string[] | object[];
	memberIds: string[];
};

type userMessagesParams = {
	userId: string;
};

type userMessagesReturnType = {
	messages: object[];
	archived: object[];
};
