type NotificationObj = {
	senderId: string;
	receiverIds: Array<string | null>;
	title: string;
	message: string;
	type: string;
	readAt: number | null;
	sentAt: object;
	createdAt: object;
};
