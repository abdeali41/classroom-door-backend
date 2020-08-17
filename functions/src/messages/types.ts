type createChatParams = {
	userId: string;
	memberIds: string[];
	groupName: string;
};

type createChatReturnType = {
	chatId: string;
};

type userMessagesParams = {
	userId: string;
};

type userMessagesReturnType = {
	messages: object[];
	archived: object[];
};
